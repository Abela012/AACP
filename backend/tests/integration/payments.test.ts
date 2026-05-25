import { describe, expect, it, vi, afterEach } from 'vitest';
import Transaction from '../../src/database/models/Transaction';
import { api } from '../helpers/app';
import { authHeaderForUser } from '../helpers/auth';
import { mockChapaApi } from '../helpers/chapaMock';
import {
  createTestUser,
  createWalletForUser,
  seedPlatformSettings,
} from '../helpers/fixtures';

describe('Chapa payments', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes top-up and creates pending transaction', async () => {
    await seedPlatformSettings();
    mockChapaApi();
    const user = await createTestUser({ role: 'advertiser' });
    await createWalletForUser(user._id, 0);
    authHeaderForUser(user, 'clerk');

    const res = await api()
      .post('/api/v1/payments/chapa/initialize')
      .send({ amount: 50, coins: 100, currency: 'ETB' });

    expect(res.status).toBe(201);
    expect(res.body.data?.checkoutUrl).toMatch(/chapa/i);
    expect(res.body.data?.txRef).toBeTruthy();

    const pending = await Transaction.findOne({
      user: user._id,
      type: 'payment',
      status: 'pending',
    });
    expect(pending).toBeTruthy();
    expect(pending?.metadata?.coinsToCredit).toBe(100);
  });

  it('rejects invalid coin pack combination', async () => {
    await seedPlatformSettings();
    mockChapaApi();
    const user = await createTestUser({ role: 'advertiser' });
    authHeaderForUser(user, 'clerk');

    const res = await api()
      .post('/api/v1/payments/chapa/initialize')
      .send({ amount: 50, coins: 999 });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('credits wallet on successful verify', async () => {
    await seedPlatformSettings();
    mockChapaApi({ verifyStatus: 'success', amount: 50 });
    const user = await createTestUser({ role: 'advertiser' });
    await createWalletForUser(user._id, 0);
    authHeaderForUser(user, 'clerk');

    const init = await api()
      .post('/api/v1/payments/chapa/initialize')
      .send({ amount: 50, coins: 100 });

    const txRef = init.body.data.txRef;

    const verify = await api()
      .post('/api/v1/payments/chapa/verify')
      .send({ txRef });

    expect(verify.status).toBe(200);
    expect(verify.body.data.verified).toBe(true);
    expect(verify.body.data.coinsCredited).toBe(100);

    const walletRes = await api().get('/api/v1/wallet/balance');
    expect(walletRes.body.data?.balance).toBeGreaterThanOrEqual(100);
  });

  it('prevents duplicate webhook credit', async () => {
    await seedPlatformSettings();
    mockChapaApi({ verifyStatus: 'success', amount: 50 });
    const user = await createTestUser({ role: 'advertiser' });
    await createWalletForUser(user._id, 0);
    authHeaderForUser(user, 'clerk');

    const init = await api()
      .post('/api/v1/payments/chapa/initialize')
      .send({ amount: 50, coins: 100 });

    const txRef = init.body.data.txRef;

    await api().post('/api/v1/payments/chapa/webhook').send({ tx_ref: txRef });
    await api().post('/api/v1/payments/chapa/webhook').send({ tx_ref: txRef });

    const credits = await Transaction.find({
      user: user._id,
      type: 'credit',
      'metadata.tx_ref': txRef,
    });

    expect(credits.length).toBe(1);

    const walletRes = await api().get('/api/v1/wallet/balance');
    const balance = walletRes.body.data?.balance ?? walletRes.body.data?.totalCoins;
    expect(balance).toBe(100);
  });

  it('marks payment failed when Chapa reports non-success', async () => {
    await seedPlatformSettings();
    const fetchMock = mockChapaApi({ verifyStatus: 'failed' });
    const user = await createTestUser({ role: 'advertiser' });
    await createWalletForUser(user._id, 0);
    authHeaderForUser(user, 'clerk');

    const init = await api()
      .post('/api/v1/payments/chapa/initialize')
      .send({ amount: 50, coins: 100 });

    const txRef = init.body.data.txRef;
    const verify = await api().post('/api/v1/payments/chapa/verify').send({ txRef });

    expect(verify.body.data.verified).toBe(false);
    expect(fetchMock).toHaveBeenCalled();
  });
});
