export type CoinPackId = 'starter' | 'popular' | 'pro';

export type CoinPack = {
  id: CoinPackId;
  title: string;
  priceEtb: number;
  coins: number;
  save?: string;
  features: string[];
  popular?: boolean;
};

/** ETB price → coins credited (must match backend COIN_PACK_CATALOG). */
export const COIN_PACKS: Record<CoinPackId, CoinPack> = {
  starter: {
    id: 'starter',
    title: 'Starter',
    priceEtb: 50,
    coins: 100,
    features: [
      '100 coins added to your wallet',
      'Enough for 2 campaign applications (50 coins each)',
      'Coins do not expire',
    ],
  },
  popular: {
    id: 'popular',
    title: 'Popular',
    priceEtb: 200,
    coins: 500,
    save: 'Best value',
    popular: true,
    features: [
      '500 coins added to your wallet',
      'Enough for 10 campaign applications',
      'Same rate as Starter — lowest cost per coin',
    ],
  },
  pro: {
    id: 'pro',
    title: 'Pro',
    priceEtb: 400,
    coins: 1000,
    save: 'Scale up',
    features: [
      '1,000 coins added to your wallet',
      'Enough for 20 campaign applications',
      'Ideal for active businesses and creators',
    ],
  },
};

export const COIN_PACK_LIST = Object.values(COIN_PACKS);

export const APPLICATION_COIN_COST = 50;

/** Format Ethiopian Birr for display (Chapa charges ETB). */
export const formatBirr = (amount: number, options?: { decimals?: boolean }) => {
  const value = options?.decimals === false ? Math.round(amount) : amount;
  const formatted = new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: options?.decimals === false ? 0 : 2,
    maximumFractionDigits: options?.decimals === false ? 0 : 2,
  }).format(value);
  return `${formatted} ETB`;
};

export type CheckoutPackState = {
  title: string;
  price: number;
  coins: number;
};
