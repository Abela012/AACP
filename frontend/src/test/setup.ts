import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

const mockSocket = {
  connected: false,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('@/src/api/socketService', () => ({
  socketService: {
    connect: vi.fn(() => mockSocket),
    disconnect: vi.fn(),
    getSocket: vi.fn(() => mockSocket),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  connectSocket: vi.fn(() => mockSocket),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(() => mockSocket),
  joinRoom: vi.fn(),
  leaveRoom: vi.fn(),
  sendMessage: vi.fn(),
  startTyping: vi.fn(),
  stopTyping: vi.fn(),
  default: {
    connect: vi.fn(() => mockSocket),
    disconnect: vi.fn(),
    getSocket: vi.fn(() => mockSocket),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));
