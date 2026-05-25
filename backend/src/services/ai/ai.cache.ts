import logger from '../../utils/logger';
import { InsightType, CacheEntry } from './ai.types';
import { hashInputData } from './ai.utils';

const TTL_MAP: Record<InsightType, number> = {
    'advertiser-analytics': 6 * 60 * 60 * 1000,     // 6 hours
    'business-analytics': 6 * 60 * 60 * 1000,       // 6 hours
    'campaign-analysis': 4 * 60 * 60 * 1000,        // 4 hours
    'predictive-roi': 2 * 60 * 60 * 1000,           // 2 hours
    'recommendation-insights': 1 * 60 * 60 * 1000,  // 1 hour
};

const cache = new Map<string, CacheEntry>();
const locks = new Map<string, Promise<any>>();

const buildKey = (type: InsightType, userId: string, inputData: any): string => {
    const hash = hashInputData(inputData);
    return `ai:${type}:${userId}:${hash}`;
};

export const getCached = <T = any>(
    type: InsightType,
    userId: string,
    inputData: any
): T | null => {
    const key = buildKey(type, userId, inputData);
    const entry = cache.get(key);

    if (!entry) return null;

    if (new Date() > entry.expiresAt) {
        cache.delete(key);
        logger.info(`[AICache] EXPIRED: ${key}`);
        return null;
    }

    const ageMinutes = Math.round((Date.now() - entry.createdAt.getTime()) / 60_000);
    logger.info(`[AICache] HIT: ${key} (age: ${ageMinutes}m)`);
    return entry.data as T;
};

export const setCached = <T = any>(
    type: InsightType,
    userId: string,
    inputData: any,
    data: T,
    latencyMs: number
): void => {
    const key = buildKey(type, userId, inputData);
    const ttl = TTL_MAP[type] || 60 * 60 * 1000;
    const now = new Date();

    cache.set(key, {
        data,
        inputHash: hashInputData(inputData),
        createdAt: now,
        expiresAt: new Date(now.getTime() + ttl),
        latencyMs,
    });

    const ttlHours = (ttl / (60 * 60 * 1000)).toFixed(1);
    logger.info(`[AICache] STORED: ${key} (TTL: ${ttlHours}h)`);
};

/**
 * Ensures only one generation runs at a time for a given cache key.
 * If a request is already in flight, subsequent requests will wait for it.
 */
export const getOrCompute = async <T = any>(
    type: InsightType,
    userId: string,
    inputData: any,
    computeFn: () => Promise<T>
): Promise<T> => {
    const key = buildKey(type, userId, inputData);

    // 1. Check if already cached
    const cached = getCached<T>(type, userId, inputData);
    if (cached) {
        return cached;
    }

    // 2. Check if a request is already in-flight
    if (locks.has(key)) {
        logger.info(`[AICache] WAITING for existing generation: ${key}`);
        return locks.get(key) as Promise<T>;
    }

    // 3. Otherwise, compute and lock
    const promise = computeFn()
        .then((result) => {
            locks.delete(key);
            return result;
        })
        .catch((err) => {
            locks.delete(key);
            throw err;
        });

    locks.set(key, promise);
    return promise;
};

export const invalidateUser = (userId: string): void => {
    let count = 0;
    for (const key of cache.keys()) {
        if (key.includes(`:${userId}:`)) {
            cache.delete(key);
            count++;
        }
    }
    if (count > 0) {
        logger.info(`[AICache] INVALIDATED: ${count} entries for user ${userId}`);
    }
};

export const invalidateType = (type: InsightType, userId: string): void => {
    for (const key of cache.keys()) {
        if (key.startsWith(`ai:${type}:${userId}:`)) {
            cache.delete(key);
        }
    }
    logger.info(`[AICache] INVALIDATED: ${type} for user ${userId}`);
};

export const getCacheStats = (): { size: number; types: Record<string, number> } => {
    const types: Record<string, number> = {};
    for (const key of cache.keys()) {
        const type = key.split(':')[1] || 'unknown';
        types[type] = (types[type] || 0) + 1;
    }
    return { size: cache.size, types };
};
