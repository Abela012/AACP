import cron from 'node-cron';
import { ApifyClient } from 'apify-client';
import User from '../database/models/User';
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

        // Find all TikTok-First advertisers
        const advertisers = await User.find({
            role: 'advertiser',
            tiktokUsername: { $exists: true, $ne: null },
            status: 'active'
        });

        logger.info(`[SyncJob] Found ${advertisers.length} TikTok-First advertisers to sync.`);

        for (const user of advertisers) {
            const username = user.tiktokUsername!;
            try {
                logger.info(`[SyncJob] Syncing TikTok metrics for @${username}`);

                const run = await client.actor('clockworks/free-tiktok-scraper').call({
                    profiles: [username.replace(/^@/, '')],
                    scrapePosts: false
                });
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                if (items && items.length > 0) {
                    const userData: any = items[0];
                    const followers = userData?.authorMeta?.fans || userData?.followers || 0;
                    const following = userData?.authorMeta?.following || 0;
                    const totalLikes = userData?.authorMeta?.heart || userData?.likes || 0;
                    const totalPosts = userData?.authorMeta?.video || userData?.videos || 0;
                    const avgViews = userData?.avgViews || 0;
                    const avgLikes = userData?.avgLikes || 0;
                    const avgComments = userData?.avgComments || 0;
                    const engagementRate = followers > 0 ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2)) : 0;

                    user.tiktokProfile = {
                        displayName: userData?.authorMeta?.nickName || user.tiktokProfile?.displayName || username,
                        bio: userData?.authorMeta?.bio || user.tiktokProfile?.bio || '',
                        profilePicture: userData?.authorMeta?.avatar || user.tiktokProfile?.profilePicture || '',
                        verifiedBadge: userData?.authorMeta?.verified || false,
                        metrics: {
                            followers,
                            following,
                            totalLikes,
                            totalPosts,
                            avgViews,
                            avgLikes,
                            avgComments,
                            engagementRate
                        },
                        lastSynced: new Date()
                    };

                    // Update legacy profile sync if it exists
                    if (user.socialProfiles && user.socialProfiles.length > 0) {
                        user.socialProfiles = user.socialProfiles.map((p: any) => {
                            if (p.platform?.toLowerCase() === 'tiktok') {
                                return {
                                    ...p,
                                    followers,
                                    following,
                                    verified: userData?.authorMeta?.verified || false,
                                    tiktokAnalytics: {
                                        ...p.tiktokAnalytics,
                                        followers,
                                        following,
                                        totalLikes,
                                        avgViews,
                                        avgLikes,
                                        avgComments
                                    }
                                };
                            }
                            return p;
                        });
                    }

                    await user.save();
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
