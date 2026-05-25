import { describe, expect, it } from 'vitest';
import { getAuth } from '@clerk/express';
import { vi } from 'vitest';
import { api } from '../helpers/app';
import { mockClerkAuth, authHeaderForUser } from '../helpers/auth';
import { createTestUser, seedPlatformSettings } from '../helpers/fixtures';

describe('Authentication', () => {
  it('returns 401 for protected wallet without credentials', async () => {
    await seedPlatformSettings();
    mockClerkAuth(null);
    const res = await api().get('/api/v1/wallet/balance');
    expect(res.status).toBe(401);
  });

  it('allows access with synced Clerk user', async () => {
    await seedPlatformSettings();
    const user = await createTestUser({ role: 'advertiser' });
    authHeaderForUser(user, 'clerk');

    const res = await api().get('/api/v1/wallet/balance');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('authenticates via TikTok demo JWT when user exists', async () => {
    await seedPlatformSettings();
    const user = await createTestUser({ role: 'advertiser', clerkId: 'clerk_jwt_only_user' });
    const headers = authHeaderForUser(user, 'jwt');
    vi.mocked(getAuth).mockReturnValue({ userId: null } as ReturnType<typeof getAuth>);

    const res = await api().get('/api/v1/wallet/balance').set(headers);
    expect(res.status).toBe(200);
  });

  it('returns 401 when Clerk user is not synced to MongoDB', async () => {
    await seedPlatformSettings();
    mockClerkAuth('clerk_unsynced_user');
    const res = await api().get('/api/v1/wallet/balance');
    expect(res.status).toBe(401);
    expect(res.body.error || res.body.message).toMatch(/sync/i);
  });
});
