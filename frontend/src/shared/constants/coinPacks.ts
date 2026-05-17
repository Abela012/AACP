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

export const COIN_PACKS: Record<CoinPackId, CoinPack> = {
  starter: {
    id: 'starter',
    title: 'Starter',
    priceEtb: 10,
    coins: 100,
    features: ['Standard access to all modules', 'No expiration on coins'],
  },
  popular: {
    id: 'popular',
    title: 'Popular',
    priceEtb: 45,
    coins: 500,
    save: 'Save 10%',
    popular: true,
    features: ['Priority customer support', 'Bonus resource downloads'],
  },
  pro: {
    id: 'pro',
    title: 'Pro',
    priceEtb: 80,
    coins: 1000,
    save: 'Save 20%',
    features: ['Unlock all premium features', 'Lifetime account verification'],
  },
};

export const COIN_PACK_LIST = Object.values(COIN_PACKS);

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
