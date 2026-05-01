import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { getAuth } from '@clerk/express';
import User from '../database/models/User';
import logger from '../utils/logger';
import mongoose from 'mongoose';
import * as chatService from '../modules/chat/chat.service';

/**
 * In-memory map: userId → socket ID (for private messaging).
 * In production, replace with Redis for multi-instance support.
 */
const onlineUsers = new Map<string, string>();

export const initSocket = (httpServer: HttpServer): SocketServer => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // ── Auth middleware — validate Clerk token on every socket connection ──
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token as string;
            if (!token) {
                logger.warn('Socket connection attempt without token');
                return next(new Error('No auth token'));
            }

            // Decode clerkId from JWT (simple decode)
            const parts = token.split('.');
            if (parts.length < 2) return next(new Error('Invalid token format'));

            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            const clerkId = payload.sub;

            if (!clerkId) return next(new Error('Invalid token payload'));

            // Store clerkId on socket — we will fetch the full user from DB when messages are sent
            (socket as any).clerkId = clerkId;
            (socket as any).token = token;
            
            logger.info(`Socket connected for clerkId: ${clerkId}`);
            return next();
        } catch (err: any) {
            logger.error(`Socket Auth Exception: ${err.message}`);
            return next(new Error('Auth failed'));
        }
    });

    io.on('connection', async (socket) => {
        const clerkId = (socket as any).clerkId;
        
        // Resolve user from DB once at connection start (outside of handshake to prevent timeouts)
        const user = await User.findOne({ clerkId }).select('_id firstName lastName profilePicture');
        if (!user) {
            logger.warn(`User not found for clerkId: ${clerkId}. Disconnecting socket.`);
            socket.disconnect();
            return;
        }

        const userId = user._id.toString();
        (socket as any).userId = userId;

        // Track online status
        onlineUsers.set(userId, socket.id);
        logger.info(`Socket connected: ${user.firstName} (${userId})`);

        // Join private room for targeted notifications
        socket.join(`user:${userId}`);

        // Notify others that this user is online
        socket.broadcast.emit('user:online', { userId });

        // ── Join a private room (conversation) ──
        socket.on('room:join', (roomId: string) => {
            socket.join(roomId);
        });

        socket.on('room:leave', (roomId: string) => {
            socket.leave(roomId);
        });

        // ── Send a message ──
        socket.on('message:send', async (payload: {
            roomId: string;
            text: string;
            recipientId?: string;
        }) => {
            try {
                let recipientMongoId = payload.recipientId;

                // If recipientId is a Clerk ID, resolve it to Mongo ID
                if (payload.recipientId && !mongoose.Types.ObjectId.isValid(payload.recipientId)) {
                    const recipient = await User.findOne({ clerkId: payload.recipientId });
                    if (recipient) recipientMongoId = recipient._id.toString();
                }

                if (!recipientMongoId) {
                    logger.warn(`Cannot save message: Recipient not found for ${payload.recipientId}`);
                    // Fallback to old behavior or error
                }

                // 1. Persist to database
                let dbMessage;
                if (recipientMongoId) {
                    const conversation = await chatService.getOrCreateConversation([userId, recipientMongoId]);
                    dbMessage = await chatService.saveMessage({
                        conversationId: (conversation._id as any).toString(),
                        senderId: userId,
                        text: payload.text
                    });
                }

                const message = {
                    _id: dbMessage ? dbMessage._id.toString() : `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    roomId: payload.roomId,
                    text: payload.text,
                    sender: {
                        _id: userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profilePicture: user.profilePicture,
                    },
                    createdAt: dbMessage ? dbMessage.createdAt.toISOString() : new Date().toISOString(),
                };

                // Broadcast to everyone in the room (including sender for confirmation)
                io.to(payload.roomId).emit('message:receive', message);

                // Also send to recipient's personal room if specified
                if (recipientMongoId) {
                    io.to(`user:${recipientMongoId}`).emit('notification:new', {
                        type: 'message',
                        title: `New message from ${user.firstName}`,
                        message: payload.text.slice(0, 60),
                        data: {
                            roomId: payload.roomId,
                            senderId: userId
                        },
                        createdAt: new Date().toISOString()
                    });
                }
            } catch (err) {
                logger.error(`Error processing message: ${err}`);
            }
        });

        // ── Typing indicator ──
        socket.on('typing:start', (roomId: string) => {
            socket.to(roomId).emit('typing:start', { userId, name: user.firstName });
        });

        socket.on('typing:stop', (roomId: string) => {
            socket.to(roomId).emit('typing:stop', { userId });
        });

        // ── Disconnect ──
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            socket.broadcast.emit('user:offline', { userId });
            logger.info(`Socket disconnected: ${user.firstName} (${userId})`);
        });
    });

    return io;
};

/** Get socket ID for a given userId (for server-side targeted emit) */
export const getSocketId = (userId: string) => onlineUsers.get(userId);

export const getOnlineUsers = () => Array.from(onlineUsers.keys());
