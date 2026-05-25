import { describe, expect, it } from 'vitest';
import { api } from '../helpers/app';
import { authHeaderForUser } from '../helpers/auth';
import {
  createTestUser,
  createOpenOpportunity,
  createWalletForUser,
  seedPlatformSettings,
} from '../helpers/fixtures';
import Wallet from '../../src/database/models/Wallet';

describe('Applications API', () => {
  it('rejects application when advertiser has insufficient coins', async () => {
    await seedPlatformSettings();
    const owner = await createTestUser({ role: 'business_owner' });
    const advertiser = await createTestUser({ role: 'advertiser' });
    const opp = await createOpenOpportunity(owner._id);
    await createWalletForUser(advertiser._id, 10, 0);

    authHeaderForUser(advertiser, 'clerk');
    const res = await api()
      .post('/api/v1/applications')
      .send({
        opportunity: String(opp._id),
        coverLetter: 'I would love to collaborate on this campaign.',
      });

    expect(res.status).toBe(400);
    expect(res.body.message || res.body.error).toMatch(/Insufficient coins/i);
  });

  it('deducts 50 coins and creates application on success', async () => {
    await seedPlatformSettings();
    const owner = await createTestUser({ role: 'business_owner' });
    const advertiser = await createTestUser({ role: 'advertiser' });
    const opp = await createOpenOpportunity(owner._id);
    await createWalletForUser(advertiser._id, 100, 0);

    authHeaderForUser(advertiser, 'clerk');
    const res = await api()
      .post('/api/v1/applications')
      .send({
        opportunity: String(opp._id),
        coverLetter: 'Strong fit for your brand — fashion-focused creator.',
        proposedPrice: 1500,
        currency: 'ETB',
      });

    expect(res.status).toBe(201);
    const wallet = await Wallet.findOne({ user: advertiser._id });
    expect(wallet?.totalCoins).toBe(50);
  });

  it('requires authentication', async () => {
    await seedPlatformSettings();
    const res = await api().post('/api/v1/applications').send({ opportunity: '507f1f77bcf86cd799439011' });
    expect(res.status).toBe(401);
  });
});
