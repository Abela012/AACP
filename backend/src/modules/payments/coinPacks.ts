/** Trusted coin packs: ETB price → coins credited. Must match frontend catalog. */
export const COIN_PACK_CATALOG = [
    { priceEtb: 10, coins: 100 },
    { priceEtb: 45, coins: 500 },
    { priceEtb: 80, coins: 1000 },
] as const;

export const resolveCoinPack = (priceEtb: number, coins: number) => {
    const match = COIN_PACK_CATALOG.find((p) => p.priceEtb === priceEtb && p.coins === coins);
    if (!match) {
        const err = new Error('Invalid coin package. Price and coin amount do not match a known pack.');
        (err as any).statusCode = 400;
        throw err;
    }
    return match;
};
