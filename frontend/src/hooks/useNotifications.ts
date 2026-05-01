import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getSocket, connectSocket } from '../api/socketService';

export interface Notification {
  id: string;
  type: 'message' | 'application' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
  read: boolean;
}

export const useNotifications = () => {
  const { getToken, isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;

    let mounted = true;

    const initSocket = async () => {
      const token = await getToken();
      if (!token || !mounted) return;

      const socket = connectSocket(token);

      socket.on('notification:new', (notif: any) => {
        if (!mounted) return;
        
        const newNotif: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: notif.type || 'system',
          title: notif.title,
          message: notif.message,
          data: notif.data,
          createdAt: notif.createdAt || new Date().toISOString(),
          read: false
        };

        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Optional: Trigger a browser notification or a sound
        if (Notification.permission === 'granted') {
          new Notification(newNotif.title, { body: newNotif.message });
        }
      });
    };

    initSocket();

    return () => {
      mounted = false;
      const socket = getSocket();
      if (socket) {
        socket.off('notification:new');
      }
    };
  }, [isSignedIn, getToken]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
