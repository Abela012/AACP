import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Create (or return existing) Socket.IO connection with Clerk JWT.
 */
export const connectSocket = (token: string): Socket => {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.warn('[Socket] Disconnected:', reason);
    });

    return socket;
};

/** Disconnect and clean up */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/** Get the current socket instance (null if not connected) */
export const getSocket = (): Socket | null => socket;

/** Join a chat room */
export const joinRoom = (roomId: string) => {
    socket?.emit('room:join', roomId);
};

/** Leave a chat room */
export const leaveRoom = (roomId: string) => {
    socket?.emit('room:leave', roomId);
};

/** Send a message */
export const sendMessage = (roomId: string, text: string, recipientId?: string) => {
    socket?.emit('message:send', { roomId, text, recipientId });
};

/** Emit typing start */
export const startTyping = (roomId: string) => {
    socket?.emit('typing:start', roomId);
};

/** Emit typing stop */
export const stopTyping = (roomId: string) => {
    socket?.emit('typing:stop', roomId);
};
