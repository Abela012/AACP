import { vi } from 'vitest';
import { getAuth } from '@clerk/express';
import jwt from 'jsonwebtoken';
import type { IUser } from '../../src/database/models/User';

export function mockClerkAuth(clerkId: string | null) {
  vi.mocked(getAuth).mockReturnValue({ userId: clerkId } as ReturnType<typeof getAuth>);
}

export function signTestJwt(user: IUser): string {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-for-aacp';
  return jwt.sign({ userId: String(user._id) }, secret, { expiresIn: '1h' });
}

export function authHeaderForUser(user: IUser, mode: 'clerk' | 'jwt' = 'clerk'): Record<string, string> {
  if (mode === 'jwt') {
    return { Authorization: `Bearer ${signTestJwt(user)}` };
  }
  mockClerkAuth(user.clerkId || `clerk_${user._id}`);
  return {};
}
