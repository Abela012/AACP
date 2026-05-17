import { ApifyClient } from 'apify-client';
import axios from 'axios';
import logger from '../../utils/logger';

/** ─── URL validators ─────────────────────────────────────────────── */
// Matches: tiktok.com/@user/video/123, vm.tiktok.com/xxx, tiktok.com/t/xxx
const TIKTOK_RE = /(?:(?:www\.|vm\.|vt\.)?tiktok\.com\/@[^/]+\/video\/\d+|(?:vm|vt)\.tiktok\.com\/[A-Za-z0-9]+|(?:www\.)?tiktok\.com\/t\/[A-Za-z0-9]+)/i;
// Matches: instagram.com/p/xxx, /reel/xxx, /tv/xxx
const INSTAGRAM_RE = /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i;
// Matches: youtube.com/watch?v=xxx, youtube.com/shorts/xxx, youtu.be/xxx
const YOUTUBE_RE  = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i;

export type SupportedPlatform = 'TikTok' | 'Instagram' | 'YouTube';

export const detectPlatform = (url: string): SupportedPlatform | null => {
    if (TIKTOK_RE.test(url)) return 'TikTok';
    if (INSTAGRAM_RE.test(url)) return 'Instagram';
    if (YOUTUBE_RE.test(url)) return 'YouTube';
    return null;
};

export interface ScrapedMetrics {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    duration?: number;
    thumbnail?: string;
    engagementRate?: number;
}

/** ─── Apify client (lazy init so missing token doesn't crash startup) ─ */
let _apifyClient: ApifyClient | null = null;
const getApifyClient = (): ApifyClient => {
    if (!_apifyClient) {
        if (!process.env.APIFY_TOKEN) {
            throw new Error('APIFY_TOKEN is not configured in environment variables.');
        }
        _apifyClient = new ApifyClient({ token: process.env.APIFY_TOKEN });
    }
    return _apifyClient;
};

/** ─── TikTok scraper via Apify ─────────────────────────────────── */
export const scrapeTikTok = async (postUrl: string): Promise<ScrapedMetrics> => {
    logger.info(`[Analytics] Scraping TikTok: ${postUrl}`);
    const client = getApifyClient();

    const run = await client.actor('clockworks/free-tiktok-scraper').call({
        postURLs: [postUrl],
        resultsPerPage: 1,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
        throw new Error('No data returned from TikTok scraper. The video may be private, deleted, or region-locked.');
    }

    const item = items[0] as any;
    const views    = Number(item.playCount    ?? item.stats?.playCount    ?? 0);
    const likes    = Number(item.diggCount    ?? item.stats?.diggCount    ?? 0);
    const comments = Number(item.commentCount ?? item.stats?.commentCount ?? 0);
    const shares   = Number(item.shareCount   ?? item.stats?.shareCount   ?? 0);

    return {
        views,
        likes,
        comments,
        shares,
        duration:  item.video?.duration ?? item.duration ?? undefined,
        thumbnail: item.video?.cover    ?? item.covers?.[0] ?? undefined,
        engagementRate: views > 0 ? parseFloat(((likes + comments + shares) / views * 100).toFixed(2)) : 0,
    };
};

/** ─── Instagram scraper via Apify ──────────────────────────────── */
export const scrapeInstagram = async (postUrl: string): Promise<ScrapedMetrics> => {
    logger.info(`[Analytics] Scraping Instagram: ${postUrl}`);
    const client = getApifyClient();

    const run = await client.actor('apify/instagram-post-scraper').call({
        directUrls: [postUrl],
        resultsType: 'posts',
        resultsLimit: 1,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
        throw new Error('No data returned from Instagram scraper. The post may be private or deleted.');
    }

    const item = items[0] as any;
    const views    = Number(item.videoViewCount ?? item.videoPlayCount ?? 0);
    const likes    = Number(item.likesCount     ?? item.likes          ?? 0);
    const comments = Number(item.commentsCount  ?? item.comments       ?? 0);
    const shares   = Number(item.sharesCount    ?? 0);

    return {
        views,
        likes,
        comments,
        shares,
        duration:  item.videoDuration ?? undefined,
        thumbnail: item.displayUrl    ?? item.thumbnailUrl ?? undefined,
        engagementRate: views > 0 ? parseFloat(((likes + comments + shares) / views * 100).toFixed(2)) : 0,
    };
};

/** ─── YouTube via Data API v3 ──────────────────────────────────── */
export const scrapeYouTube = async (postUrl: string): Promise<ScrapedMetrics> => {
    logger.info(`[Analytics] Scraping YouTube: ${postUrl}`);

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
        throw new Error('YOUTUBE_API_KEY is not configured in environment variables.');
    }

    const match = postUrl.match(YOUTUBE_RE);
    if (!match) throw new Error('Could not extract YouTube video ID from URL.');
    const videoId = match[1];

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            part: 'statistics,contentDetails,snippet',
            id: videoId,
            key: youtubeApiKey,
        },
    });

    const items = response.data.items;
    if (!items || items.length === 0) {
        throw new Error('YouTube video not found. It may be private, deleted, or region-restricted.');
    }

    const item = items[0];
    const stats = item.statistics;
    const views    = Number(stats.viewCount    ?? 0);
    const likes    = Number(stats.likeCount    ?? 0);
    const comments = Number(stats.commentCount ?? 0);

    // Parse ISO 8601 duration (e.g. PT1M30S → 90 seconds)
    const iso8601 = item.contentDetails?.duration ?? '';
    const durationMatch = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    let duration: number | undefined;
    if (durationMatch) {
        duration = (Number(durationMatch[1] || 0) * 3600)
                 + (Number(durationMatch[2] || 0) * 60)
                 + (Number(durationMatch[3] || 0));
    }

    return {
        views,
        likes,
        comments,
        shares: 0, // YouTube API doesn't expose share count
        duration,
        thumbnail: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url,
        engagementRate: views > 0 ? parseFloat(((likes + comments) / views * 100).toFixed(2)) : 0,
    };
};

/** ─── Main dispatcher ───────────────────────────────────────────── */
export const fetchPostMetrics = async (platform: SupportedPlatform, postUrl: string): Promise<ScrapedMetrics> => {
    switch (platform) {
        case 'TikTok':    return scrapeTikTok(postUrl);
        case 'Instagram': return scrapeInstagram(postUrl);
        case 'YouTube':   return scrapeYouTube(postUrl);
        default:          throw new Error(`Unsupported platform: ${platform}`);
    }
};
