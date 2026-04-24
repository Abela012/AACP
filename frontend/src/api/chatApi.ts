import type { AxiosInstance } from 'axios';

export interface Conversation {
    _id: string;
    participants: Array<{
        _id: string;
        clerkId: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        role: string;
    }>;
    lastMessage?: {
        text: string;
        createdAt: string;
    };
    updatedAt: string;
}

export interface ChatMessage {
    _id: string;
    conversation: string;
    sender: {
        _id: string;
        clerkId: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    text: string;
    createdAt: string;
}

export const chatApi = {
    /** GET /chat/conversations — List all conversations for the current user */
    getConversations: (api: AxiosInstance) => 
        api.get<{ success: boolean; data: Conversation[] }>('/chat/conversations'),

    /** POST /chat/conversations — Find or create a conversation with a recipient */
    startConversation: (api: AxiosInstance, recipientId: string) =>
        api.post<{ success: boolean; data: Conversation }>('/chat/conversations', { recipientId }),

    /** GET /chat/messages/:conversationId — Fetch message history */
    getMessages: (api: AxiosInstance, conversationId: string, params?: { limit?: number; skip?: number }) =>
        api.get<{ success: boolean; data: ChatMessage[] }>(`/chat/messages/${conversationId}`, { params }),

    /** PUT /chat/messages/:conversationId/read — Mark messages as read */
    markAsRead: (api: AxiosInstance, conversationId: string) =>
        api.put(`/chat/messages/${conversationId}/read`),
};
