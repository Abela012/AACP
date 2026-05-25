import { describe, expect, it } from 'vitest';
import { api } from '../helpers/app';
import { authHeaderForUser } from '../helpers/auth';
import {
  createTestUser,
  createBusinessOwnerProfile,
  createAdvertiserProfile,
  createOpenOpportunity,
  seedPlatformSettings,
} from '../helpers/fixtures';

describe('Recommendations API', () => {
  it('returns advertiser recommendations for business owner', async () => {
    await seedPlatformSettings();
    const owner = await createTestUser({ role: 'business_owner' });
    await createBusinessOwnerProfile(owner._id, {
      preferredNiches: ['fashion'],
      preferredPlatform: ['instagram'],
    });

    const adv = await createTestUser({ role: 'advertiser', email: 'adv1@aacp-test.local' });
    await createAdvertiserProfile(adv._id, {
      niches: ['fashion'],
      platforms: ['instagram'],
      engagementRate: 5,
      followers: 40000,
    });

    authHeaderForUser(owner, 'clerk');
    const res = await api().get('/api/v1/recommendations');

    expect(res.status).toBe(200);
    expect(res.body.data?.userRole || res.body.data?.recommendations).toBeTruthy();
    const recs = res.body.data?.recommendations || res.body.data || [];
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].type).toBe('advertiser');
  });

  it('returns opportunity recommendations for advertiser', async () => {
    await seedPlatformSettings();
    const owner = await createTestUser({ role: 'business_owner' });
    await createOpenOpportunity(owner._id, { category: 'fashion' });

    const advertiser = await createTestUser({ role: 'advertiser' });
    await createAdvertiserProfile(advertiser._id, {
      niches: ['fashion'],
      platforms: ['instagram'],
    });

    authHeaderForUser(advertiser, 'clerk');
    const res = await api().get('/api/v1/recommendations');

    expect(res.status).toBe(200);
    const recs = res.body.data?.recommendations || [];
    expect(recs.some((r: { type: string }) => r.type === 'opportunity')).toBe(true);
  });

  it('sorts recommendations by score descending', async () => {
    await seedPlatformSettings();
    const owner = await createTestUser({ role: 'business_owner' });
    await createBusinessOwnerProfile(owner._id);

    await createTestUser({ role: 'advertiser', email: 'a1@aacp-test.local' });
    await createTestUser({ role: 'advertiser', email: 'a2@aacp-test.local' });

    authHeaderForUser(owner, 'clerk');
    const res = await api().get('/api/v1/recommendations');
    const recs = res.body.data?.recommendations || [];
    if (recs.length >= 2) {
      expect(recs[0].score).toBeGreaterThanOrEqual(recs[1].score);
    }
  });
});
