import Conversation, { IConversation } from '../../database/models/Conversation';
import Message, { IMessage } from '../../database/models/Message';
import User from '../../database/models/User';
import mongoose from 'mongoose';

/**
 * Chat Service
 * Handles persistence for conversations and messages
 */

/**
 * Find or create a conversation between two users
 */
export const getOrCreateConversation = async (participantIds: string[]): Promise<IConversation> => {
    // Resolve any Clerk IDs to MongoDB ObjectIds
    const resolvedIds = await Promise.all(
        participantIds.map(async (id) => {
            if (mongoose.Types.ObjectId.isValid(id)) {
                return new mongoose.Types.ObjectId(id);
            }
            const user = await User.findOne({ clerkId: id });
            if (!user) throw new Error(`User not found for ID: ${id}`);
            return user._id;
        })
    );

    // Sort IDs to ensure consistency
    const sortedIds = resolvedIds.sort();

    // Look for existing conversation with these exact participants
    let conversation = await Conversation.findOne({
        participants: { $all: sortedIds, $size: sortedIds.length }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: sortedIds
        });
    }

    return conversation;
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: string): Promise<any[]> => {
    return await Conversation.find({
        participants: userId
    })
    .populate('participants', 'firstName lastName profilePicture role clerkId')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (conversationId: string, limit: number = 50, skip: number = 0): Promise<IMessage[]> => {
    return await Message.find({ conversation: conversationId })
        .populate('sender', 'firstName lastName profilePicture role clerkId')
        .sort({ createdAt: 1 }) // Chronological order
        .skip(skip)
        .limit(limit);
};

/**
 * Save a new message
 */
export const saveMessage = async (data: {
    conversationId: string;
    senderId: string;
    text: string;
    attachments?: any[];
}): Promise<IMessage> => {
    const message = await Message.create({
        conversation: data.conversationId,
        sender: data.senderId,
        text: data.text,
        attachments: data.attachments || []
    });

    // Update conversation's last message and updatedAt
    await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: message._id,
        updatedAt: new Date()
    });

    return message;
};

/**
 * Mark all messages in a conversation as read for a user
 */
export const markAsRead = async (conversationId: string, userId: string): Promise<void> => {
    await Message.updateMany(
        { 
            conversation: conversationId, 
            sender: { $ne: userId },
            isRead: false 
        },
        { isRead: true }
    );
};
