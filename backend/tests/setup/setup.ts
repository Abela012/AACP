import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

vi.mock('@clerk/express', async () => {
  const actual = await vi.importActual<typeof import('@clerk/express')>('@clerk/express');
  return {
    ...actual,
    clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
    getAuth: vi.fn(() => ({ userId: null as string | null })),
  };
});

beforeAll(async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI not set — globalSetup must run first');
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
  vi.clearAllMocks();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
