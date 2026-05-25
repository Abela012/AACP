import { describe, expect, it } from 'vitest';
import { api } from '../helpers/app';
import { authHeaderForUser } from '../helpers/auth';
import {
  createTestUser,
  createOpenOpportunity,
  seedPlatformSettings,
} from '../helpers/fixtures';

describe('Opportunities API', () => {
  it('lists open opportunities publicly', async () => {
    await seedPlatformSettings();
    const owner = await createTestUser({ role: 'business_owner' });
    await createOpenOpportunity(owner._id, { title: 'Public Campaign Alpha' });

    const res = await api().get('/api/v1/opportunities');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const list = Array.isArray(res.body.data) ? res.body.data : res.body.data?.opportunities || [];
    const titles = list.map((o: { title: string }) => o.title);
    expect(titles).toContain('Public Campaign Alpha');
  });

  it('allows business owner to create opportunity', async () => {
    await seedPlatformSettings();
    const owner = await createTestUser({ role: 'business_owner' });
    authHeaderForUser(owner, 'clerk');

    const res = await api()
      .post('/api/v1/opportunities')
      .send({
        title: 'New Collab Brief',
        description: 'Detailed campaign brief for creators with fashion focus.',
        category: 'fashion',
        platforms: ['instagram'],
        deliverables: ['1 post'],
        budget: { amount: 3000, currency: 'ETB' },
        requirements: { minFollowers: 500, preferredNiches: ['fashion'] },
        status: 'open',
      });

    expect(res.status).toBe(201);
    expect(res.body.data?.title || res.body.data?.opportunity?.title).toBe('New Collab Brief');
  });

  it('forbids advertiser from creating opportunities', async () => {
    await seedPlatformSettings();
    const advertiser = await createTestUser({ role: 'advertiser' });
    authHeaderForUser(advertiser, 'clerk');

    const res = await api()
      .post('/api/v1/opportunities')
      .send({
        title: 'Blocked',
        description: 'Should not be created by advertiser role.',
        category: 'fashion',
        platforms: ['instagram'],
        deliverables: ['1 post'],
        budget: { amount: 100, currency: 'ETB' },
      });

    expect(res.status).toBe(403);
  });
});
