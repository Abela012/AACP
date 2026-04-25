import { Request, Response } from 'express';
import * as chatService from './chat.service';
import { success, error } from '../../utils/response';

/**
 * Chat Controller
 * Handles HTTP requests for chat history and conversations
 */

export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) return error(res, 'User not authenticated', 401);
        
        const conversations = await chatService.getUserConversations(userId.toString());
        return success(res, 'Conversations retrieved', conversations);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { limit, skip } = req.query;
        
        const messages = await chatService.getConversationMessages(
            conversationId, 
            Number(limit) || 50, 
            Number(skip) || 0
        );
        
        return success(res, 'Messages retrieved', messages);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

export const startConversation = async (req: Request, res: Response) => {
    try {
        const { recipientId } = req.body;
        const userId = req.user?._id;
        
        if (!userId) return error(res, 'User not authenticated', 401);
        if (!recipientId) return error(res, 'Recipient ID is required', 400);
        
        const conversation = await chatService.getOrCreateConversation([userId.toString(), recipientId]);
        return success(res, 'Conversation initialized', conversation);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

export const markRead = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?._id;
        
        if (!userId) return error(res, 'User not authenticated', 401);
        
        await chatService.markAsRead(conversationId, userId.toString());
        return success(res, 'Messages marked as read');
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};
