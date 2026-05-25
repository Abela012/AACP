import { describe, expect, it } from 'vitest';
import { COIN_PACK_CATALOG, resolveCoinPack } from '../../src/modules/payments/coinPacks';

describe('coinPacks', () => {
  it('resolves valid catalog packs', () => {
    for (const pack of COIN_PACK_CATALOG) {
      const resolved = resolveCoinPack(pack.priceEtb, pack.coins);
      expect(resolved).toEqual(pack);
    }
  });

  it('rejects mismatched price and coins', () => {
    expect(() => resolveCoinPack(50, 500)).toThrow(/Invalid coin package/);
    expect(() => resolveCoinPack(999, 100)).toThrow(/Invalid coin package/);
  });

  it('rejects non-positive values', () => {
    expect(() => resolveCoinPack(0, 100)).toThrow();
  });
});
