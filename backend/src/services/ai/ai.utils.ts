import crypto from 'crypto';
import { PII_FIELDS } from './ai.types';

export const stripPII = (data: Record<string, any>): Record<string, any> => {
    if (!data || typeof data !== 'object') return {};
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        if (PII_FIELDS.includes(key)) continue;
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            cleaned[key] = stripPII(value);
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
};

export const flattenProfileData = (profileDoc: any): Record<string, any> => {
    if (!profileDoc) return {};
    return {
        ...(profileDoc.profileData || {}),
        ...(profileDoc.pendingProfileData || {}),
        ...(profileDoc.pendingUpdates || {}),
    };
};

export const formatNumberForPrompt = (num: number): string => {
    if (!num || num === 0) return '0';
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
};

export const truncateForPrompt = (text: string | undefined, maxLength: number = 200): string => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const buildMetricsSummary = (metrics: Record<string, any>): string => {
    const lines: string[] = [];
    if (metrics.followers) lines.push(`Followers: ${formatNumberForPrompt(metrics.followers)}`);
    if (metrics.engagementRate) lines.push(`ER: ${metrics.engagementRate}%`);
    if (metrics.primaryPlatform && metrics.primaryPlatform !== 'N/A') lines.push(`Platform: ${metrics.primaryPlatform}`);
    if (metrics.niche && metrics.niche !== 'General') lines.push(`Niche: ${metrics.niche}`);
    return lines.join(' | ');
};

export const hashInputData = (data: any): string => {
    const serialized = JSON.stringify(data, Object.keys(data || {}).sort());
    return crypto.createHash('md5').update(serialized).digest('hex').substring(0, 12);
};

export const sanitizeForPrompt = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/ignore\s+(all\s+)?(previous\s+)?instructions/gi, '[filtered]')
        .replace(/system\s*:/gi, '[filtered]')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const normalizeToList = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map((item) => String(item).toLowerCase().trim()).filter(Boolean);
    if (typeof value === 'string') return value.split(',').map((item) => item.toLowerCase().trim()).filter(Boolean);
    return [];
};

export const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));
