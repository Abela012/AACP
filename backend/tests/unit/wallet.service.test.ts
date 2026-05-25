import { describe, expect, it } from 'vitest';
import * as walletService from '../../src/modules/wallet/wallet.service';
import {
  createTestUser,
  createWalletForUser,
  seedPlatformSettings,
} from '../helpers/fixtures';

describe('wallet.service', () => {
  it('creates wallet and credits coins', async () => {
    await seedPlatformSettings();
    const user = await createTestUser({ role: 'advertiser' });
    const result = await walletService.creditCoins({
      userId: String(user._id),
      amount: 120,
      description: 'Test credit',
    });
    expect(result.wallet.totalCoins).toBe(120);
    expect(result.transaction.type).toBe('credit');
  });

  it('debits coins when balance is sufficient', async () => {
    await seedPlatformSettings();
    const user = await createTestUser({ role: 'advertiser' });
    await createWalletForUser(user._id, 200, 0);
    const result = await walletService.debitCoins({
      userId: String(user._id),
      amount: 50,
      description: 'Application fee',
    });
    expect(result.wallet.totalCoins).toBe(150);
  });

  it('rejects debit when insufficient available balance', async () => {
    await seedPlatformSettings();
    const user = await createTestUser({ role: 'advertiser' });
    await createWalletForUser(user._id, 30, 0);
    await expect(
      walletService.debitCoins({
        userId: String(user._id),
        amount: 50,
      })
    ).rejects.toMatchObject({ statusCode: 400, message: /Insufficient/ });
  });

  it('reports available balance minus locked coins', async () => {
    await seedPlatformSettings();
    const user = await createTestUser({ role: 'advertiser' });
    await createWalletForUser(user._id, 100, 40);
    const balance = await walletService.getBalance(String(user._id));
    expect(balance.balance).toBe(100);
    expect(balance.availableBalance).toBe(60);
  });
});
