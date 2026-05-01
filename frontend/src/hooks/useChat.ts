import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
    connectSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom,
    sendMessage as emitMessage,
    startTyping,
    stopTyping,
    getSocket,
} from '../api/socketService';
import { useApiClient } from '../api/apiClient';
import { chatApi } from '../api/chatApi';

export interface ChatMessage {
    _id: string;
    roomId: string;
    text: string;
    sender: {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        role?: string;
    };
    createdAt: string;
}

interface UseChat {
    messages: ChatMessage[];
    sendMessage: (text: string, recipientId?: string) => void;
    isConnected: boolean;
    isLoading: boolean;
    typingUsers: string[];       // list of user names currently typing
    onlineUsers: string[];
}

/**
 * useChat — Real-time chat hook for a specific room.
 *
 * @param roomId  A unique room identifier (e.g. `${userId1}_${userId2}` sorted)
 */
export const useChat = (roomId: string, recipientId?: string): UseChat => {
    const { getToken, isSignedIn } = useAuth();
    const api = useApiClient();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [conversationId, setConversationId] = useState<string>('');
    const typingTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // ── Connect socket and Load History ──
    useEffect(() => {
        if (!isSignedIn || !roomId) return;

        let mounted = true;
        const effectiveRoomId = conversationId || roomId;

        const init = async () => {
            setIsLoading(true);
            try {
                const token = await getToken();
                if (!token || !mounted) return;

                // 1. Initialize conversation and fetch history
                if (recipientId) {
                    const convRes = await chatApi.startConversation(api, recipientId);
                    if (convRes.data?.success && convRes.data.data._id) {
                        if (mounted) setConversationId(convRes.data.data._id);
                        const historyRes = await chatApi.getMessages(api, convRes.data.data._id);
                        if (historyRes.data?.success && mounted) {
                            // Map backend messages to hook format
                            const history = historyRes.data.data.map(m => ({
                                _id: m._id,
                                roomId: convRes.data.data._id, // use conversation id for socket room
                                text: m.text,
                                sender: m.sender,
                                createdAt: m.createdAt
                            }));
                            setMessages(history);
                        }
                    }
                }

                // 2. Connect Socket
                const s = connectSocket(token);
                setIsConnected(s.connected);

                s.on('connect', () => mounted && setIsConnected(true));
                s.on('disconnect', () => mounted && setIsConnected(false));

                // Join the room
                joinRoom(effectiveRoomId);

                // ── Receive messages ──
                s.on('message:receive', (msg: ChatMessage) => {
                    if (!mounted || msg.roomId !== effectiveRoomId) return;
                    setMessages(prev => {
                        // Prevent duplicates if already in history
                        if (prev.some(m => m._id === msg._id)) return prev;
                        return [...prev, msg];
                    });
                });

                // ── Typing indicators ──
                s.on('typing:start', ({ name }: { userId: string; name: string }) => {
                    if (!mounted) return;
                    setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name]);

                    // Clear after 3 seconds if no stop event
                    if (typingTimeouts.current[name]) clearTimeout(typingTimeouts.current[name]);
                    typingTimeouts.current[name] = setTimeout(() => {
                        setTypingUsers(prev => prev.filter(n => n !== name));
                    }, 3000);
                });

                s.on('typing:stop', ({ name }: { userId: string; name?: string }) => {
                    if (!name || !mounted) return;
                    setTypingUsers(prev => prev.filter(n => n !== name));
                    if (typingTimeouts.current[name]) clearTimeout(typingTimeouts.current[name]);
                });

                // ── Online presence ──
                s.on('user:online', ({ userId }: { userId: string }) => {
                    setOnlineUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
                });

                s.on('user:offline', ({ userId }: { userId: string }) => {
                    setOnlineUsers(prev => prev.filter(id => id !== userId));
                });
            } catch (err) {
                console.error('Chat init error:', err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        init();

        return () => {
            mounted = false;
            leaveRoom(effectiveRoomId);
            const s = getSocket();
            if (s) {
                s.off('message:receive');
                s.off('typing:start');
                s.off('typing:stop');
                s.off('user:online');
                s.off('user:offline');
                s.off('connect');
                s.off('disconnect');
            }
        };
    }, [isSignedIn, roomId, recipientId, conversationId]);

    // ── Typing debounce ──
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sendMessage = useCallback((text: string, recipientId?: string) => {
        const effectiveRoomId = conversationId || roomId;
        if (!text.trim() || !effectiveRoomId) return;
        emitMessage(effectiveRoomId, text.trim(), recipientId);

        // Stop typing after sending
        stopTyping(effectiveRoomId);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }, [roomId, conversationId]);

    /** Call this on every keystroke to emit typing events */
    const handleTyping = useCallback(() => {
        const effectiveRoomId = conversationId || roomId;
        startTyping(effectiveRoomId);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => stopTyping(effectiveRoomId), 2000);
    }, [roomId, conversationId]);

    return { messages, sendMessage, isConnected, isLoading, typingUsers, onlineUsers };
};

/** Disconnect socket globally — call on logout */
export const useSocketDisconnect = () => {
    const { isSignedIn } = useAuth();

    useEffect(() => {
        if (!isSignedIn) {
            disconnectSocket();
        }
    }, [isSignedIn]);
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useConversations = () => {
    const api = useApiClient();
    return useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const r = await chatApi.getConversations(api);
            return r.data.data;
        },
        staleTime: 30_000,
    });
};

export const useStartConversation = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (recipientId: string) => chatApi.startConversation(api, recipientId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    });
};
