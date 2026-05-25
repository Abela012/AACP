import cron from 'node-cron';
import { ApifyClient } from 'apify-client';
import AdvertiserProfile from '../database/models/AdvertiserProfile';
import logger from '../utils/logger';

// Sync social metrics for all users
export const syncAllUserMetrics = async () => {
    logger.info('[SyncJob] Starting automated social metrics sync...');
    try {
        const apifyToken = process.env.APIFY_TOKEN;
        if (!apifyToken) {
            logger.warn('[SyncJob] APIFY_TOKEN not configured. Skipping automated sync.');
            return;
        }

        const client = new ApifyClient({ token: apifyToken });

        // Find all advertisers with connected TikTok profiles
        const advertisers = await AdvertiserProfile.find({
            "socialProfiles.platform": "TikTok"
        });

        logger.info(`[SyncJob] Found ${advertisers.length} TikTok-First advertisers to sync.`);

        for (const profile of advertisers) {
            const tiktokProfile = profile.socialProfiles.find(p => p.platform === 'TikTok');
            if (!tiktokProfile) continue;
            
            const username = tiktokProfile.username;
            try {
                logger.info(`[SyncJob] Syncing TikTok metrics for @${username}`);

                const run = await client.actor('clockworks/free-tiktok-scraper').call({
                    profiles: [username.replace(/^@/, '')],
                    scrapePosts: false
                });
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                if (items && items.length > 0) {
                    const userData: any = items[0];
                    // Skip if the scraper returned an error (e.g. profile not found / behind login wall)
                    if (userData.error) {
                        logger.warn(`[SyncJob] Skipping @${username} — scraper returned error: ${userData.error}`);
                        continue;
                    }
                    const followers = userData?.authorMeta?.fans || userData?.followers || 0;
                    const following = userData?.authorMeta?.following || 0;
                    const totalLikes = userData?.authorMeta?.heart || userData?.likes || 0;
                    const totalPosts = userData?.authorMeta?.video || userData?.videos || 0;
                    const avgViews = userData?.avgViews || 0;
                    const avgLikes = userData?.avgLikes || 0;
                    const avgComments = userData?.avgComments || 0;
                    const engagementRate = followers > 0 ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2)) : 0;

                    tiktokProfile.followers = followers;
                    tiktokProfile.following = following;
                    tiktokProfile.engagementRate = engagementRate;
                    tiktokProfile.verified = userData?.authorMeta?.verified || false;
                    tiktokProfile.analytics = {
                        ...(tiktokProfile.analytics || {}),
                        totalLikes,
                        totalPosts,
                        avgViews,
                        avgLikes,
                        avgComments
                    };
                    tiktokProfile.lastSynced = new Date();

                    await profile.save();
                    logger.info(`[SyncJob] Successfully updated TikTok metrics for @${username}`);
                }
            } catch (err: any) {
                logger.error(`[SyncJob] Failed to sync TikTok metrics for @${username}: ${err.message}`);
            }
        }

        logger.info('[SyncJob] Automated social metrics sync complete.');
    } catch (error: any) {
        logger.error(`[SyncJob] Error in metric sync cron job: ${error.message}`);
    }
};

// Schedule job to run daily at 9 AM
export const initSyncJobs = () => {
    cron.schedule('0 9 * * *', () => {
        syncAllUserMetrics();
    });
    logger.info('[SyncJob] Daily automated social metrics sync job scheduled at 9 AM.');
};
