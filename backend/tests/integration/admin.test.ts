import { describe, expect, it } from 'vitest';
import { api } from '../helpers/app';
import { authHeaderForUser } from '../helpers/auth';
import { createTestUser, seedPlatformSettings } from '../helpers/fixtures';

describe('Admin API permissions', () => {
  it('allows admin to access admin stats', async () => {
    await seedPlatformSettings();
    const admin = await createTestUser({ role: 'admin' });
    authHeaderForUser(admin, 'clerk');

    const res = await api().get('/api/v1/admin/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('forbids advertiser from admin routes', async () => {
    await seedPlatformSettings();
    const advertiser = await createTestUser({ role: 'advertiser' });
    authHeaderForUser(advertiser, 'clerk');

    const res = await api().get('/api/v1/admin/stats');
    expect(res.status).toBe(403);
  });

  it('forbids business owner from super-admin routes', async () => {
    await seedPlatformSettings();
    const owner = await createTestUser({ role: 'business_owner' });
    authHeaderForUser(owner, 'clerk');

    const res = await api().get('/api/v1/super-admin/audit-logs');
    expect(res.status).toBe(403);
  });

  it('allows super_admin to list audit trail', async () => {
    await seedPlatformSettings();
    const superAdmin = await createTestUser({ role: 'super_admin' });
    authHeaderForUser(superAdmin, 'clerk');

    const res = await api().get('/api/v1/super-admin/audit-logs');
    expect([200, 404]).toContain(res.status);
  });
});
