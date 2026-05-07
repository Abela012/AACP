import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;
    private isConnecting: boolean = false;
    private static instance: SocketService;

    private constructor() {}

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(token: string): Socket {
        // If already connected or currently connecting, return the existing socket
        if (this.socket?.connected || this.isConnecting) {
            return this.socket!;
        }

        // Clean up any existing socket if it's in a bad state
        if (this.socket) {
            this.socket.disconnect();
        }

        console.log('[Socket] Attempting connection to:', SOCKET_URL);
        this.isConnecting = true;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 45000,
        });

        this.setupListeners();

        return this.socket;
    }

    private setupListeners() {
        if (!this.socket) return;

        // Remove all previous listeners to avoid duplicates
        this.socket.removeAllListeners();

        this.socket.on('connect', () => {
            this.isConnecting = false;
            console.log('[Socket] Connected successfully. ID:', this.socket?.id);
        });

        this.socket.on('connect_error', (err) => {
            this.isConnecting = false;
            console.error('[Socket] Connection error:', err.message);
            if (err.message === 'timeout') {
                console.warn('[Socket] Connection timed out. Ensure the backend is reachable.');
            }
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnecting = false;
            console.warn('[Socket] Disconnected:', reason);
            if (reason === 'io server disconnect') {
                this.socket?.connect();
            }
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public emit(event: string, ...args: any[]) {
        this.socket?.emit(event, ...args);
    }

    public on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
    }

    public off(event: string, callback?: (...args: any[]) => void) {
        this.socket?.off(event, callback);
    }
}

const socketService = SocketService.getInstance();

// Export the instance methods for backward compatibility or the instance itself
export const connectSocket = (token: string) => socketService.connect(token);
export const disconnectSocket = () => socketService.disconnect();
export const getSocket = () => socketService.getSocket();

// Helper methods for specific features
export const joinRoom = (roomId: string) => socketService.emit('room:join', roomId);
export const leaveRoom = (roomId: string) => socketService.emit('room:leave', roomId);
export const sendMessage = (roomId: string, text: string, recipientId?: string) => 
    socketService.emit('message:send', { roomId, text, recipientId });
export const startTyping = (roomId: string) => socketService.emit('typing:start', roomId);
export const stopTyping = (roomId: string) => socketService.emit('typing:stop', roomId);

export default socketService;
