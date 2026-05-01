import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import mongoose from 'mongoose';
import FacebookConnection from '../../database/models/FacebookConnection';
import AdsInsight from '../../database/models/AdsInsight';
import User from '../../database/models/User';
import { encrypt, decrypt } from '../../utils/encryption';
import * as FacebookGraphService from '../../services/facebook/facebook-graph.service';
import * as FacebookTokenService from '../../services/facebook/facebook-token.service';
import * as AIInsightsService from '../../services/ai/ai-insights.service';
import logger from '../../utils/logger';

// ─── Connect Facebook Account ───────────────────────────────────────────────

/**
 * POST /api/v1/facebook/connect
 * Receives a Facebook access token from the frontend,
 * exchanges it for a long-lived token, encrypts and stores it.
 */
export const connectFacebook = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { accessToken } = req.body;

    if (!accessToken) {
        res.status(400).json({ error: 'Facebook access token is required' });
        return;
    }

    try {
        // Find the local user
        const user = await User.findOne({ clerkId });
        if (!user) {
            res.status(404).json({ error: 'User not found. Please sync your profile first.' });
            return;
        }

        // Fetch Facebook profile to identify the account
        const fbProfile = await FacebookGraphService.getUserProfile(accessToken);

        // Check if this Facebook account is already connected for this user
        let connection = await FacebookConnection.findOne({
            userId: user._id,
            facebookUserId: fbProfile.id,
        });

        if (connection) {
            // Update existing connection with new token
            const encryptedToken = encrypt(accessToken);
            connection.accessToken = encryptedToken;
            connection.isActive = true;
            connection.connectionError = undefined;
            connection.profile = {
                name: fbProfile.name,
                email: fbProfile.email,
                pictureUrl: fbProfile.picture?.data?.url,
            };
            await connection.save();

            // Try to exchange for long-lived token
            await FacebookTokenService.storeToken(connection._id.toString(), accessToken);
        } else {
            // Create new connection
            const encryptedToken = encrypt(accessToken);

            connection = await FacebookConnection.create({
                userId: user._id,
                clerkId,
                facebookUserId: fbProfile.id,
                accessToken: encryptedToken,
                profile: {
                    name: fbProfile.name,
                    email: fbProfile.email,
                    pictureUrl: fbProfile.picture?.data?.url,
                },
            });

            // Exchange for long-lived token
            await FacebookTokenService.storeToken(connection._id.toString(), accessToken);
        }

        // Fetch and store ad accounts and pages in background
        syncAccountData(connection._id.toString(), accessToken).catch(err => {
            logger.error(`[Facebook] Background sync failed: ${err.message}`);
        });

        logger.info(`[Facebook] Connected Facebook account ${fbProfile.id} for user ${clerkId}`);

        res.status(200).json({
            success: true,
            message: 'Facebook account connected successfully',
            data: {
                connectionId: connection._id,
                facebookUserId: fbProfile.id,
                profile: connection.profile,
            },
        });
    } catch (error: any) {
        logger.error(`[Facebook] Connect error: ${error.message}`);
        res.status(error.statusCode || 500).json({
            error: 'Failed to connect Facebook account',
            message: error.message,
        });
    }
};

// ─── Disconnect Facebook Account ────────────────────────────────────────────

/**
 * DELETE /api/v1/facebook/disconnect/:connectionId
 */
export const disconnectFacebook = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);
    const { connectionId } = req.params;

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const connection = await FacebookConnection.findOne({
            _id: connectionId,
            clerkId,
        });

        if (!connection) {
            res.status(404).json({ error: 'Facebook connection not found' });
            return;
        }

        // Soft-delete: deactivate rather than remove (preserves history)
        connection.isActive = false;
        connection.connectionError = 'Disconnected by user';
        await connection.save();

        logger.info(`[Facebook] Disconnected connection ${connectionId} for user ${clerkId}`);

        res.status(200).json({
            success: true,
            message: 'Facebook account disconnected',
        });
    } catch (error: any) {
        logger.error(`[Facebook] Disconnect error: ${error.message}`);
        res.status(500).json({ error: 'Failed to disconnect Facebook account' });
    }
};

// ─── Get Connection Status ──────────────────────────────────────────────────

/**
 * GET /api/v1/facebook/connections
 * Returns all Facebook connections for the current user.
 */
export const getConnections = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const connections = await FacebookConnection.find({ clerkId })
            .select('-accessToken')   // Never expose encrypted tokens
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: connections,
        });
    } catch (error: any) {
        logger.error(`[Facebook] Get connections error: ${error.message}`);
        res.status(500).json({ error: 'Failed to retrieve connections' });
    }
};

// ─── Facebook Profile ───────────────────────────────────────────────────────

/**
 * GET /api/v1/facebook/profile
 * Fetches the user's Facebook profile using their stored token.
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const { token } = await FacebookTokenService.getDecryptedTokenByClerkId(clerkId);
        const profile = await FacebookGraphService.getUserProfile(token);

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error: any) {
        logger.error(`[Facebook] Profile fetch error: ${error.message}`);
        res.status(error.statusCode || 500).json({
            error: 'Failed to fetch Facebook profile',
            message: error.message,
        });
    }
};

// ─── Ad Accounts ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/facebook/ad-accounts
 * Fetches all ad accounts the user has access to.
 */
export const getAdAccounts = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const { token, connectionId } = await FacebookTokenService.getDecryptedTokenByClerkId(clerkId);
        const adAccounts = await FacebookGraphService.getAdAccounts(token);

        // Update stored ad accounts
        await FacebookConnection.findByIdAndUpdate(connectionId, {
            adAccounts: adAccounts.map(acc => ({
                adAccountId: acc.id,
                name: acc.name,
                currency: acc.currency,
                timezoneName: acc.timezone_name,
                accountStatus: acc.account_status,
                lastSyncedAt: new Date(),
            })),
            lastDataSync: new Date(),
        });

        res.status(200).json({
            success: true,
            data: adAccounts,
        });
    } catch (error: any) {
        logger.error(`[Facebook] Ad accounts error: ${error.message}`);
        res.status(error.statusCode || 500).json({
            error: 'Failed to fetch ad accounts',
            message: error.message,
        });
    }
};

// ─── Pages ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/facebook/pages
 */
export const getPages = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const { token, connectionId } = await FacebookTokenService.getDecryptedTokenByClerkId(clerkId);
        const pages = await FacebookGraphService.getUserPages(token);

        // Update stored pages (encrypt page tokens)
        await FacebookConnection.findByIdAndUpdate(connectionId, {
            pages: pages.map(page => ({
                pageId: page.id,
                name: page.name,
                category: page.category,
                pageAccessToken: encrypt(page.access_token),
                lastSyncedAt: new Date(),
            })),
            lastDataSync: new Date(),
        });

        // Return pages without tokens
        const safePagesData = pages.map(({ access_token, ...page }) => page);

        res.status(200).json({
            success: true,
            data: safePagesData,
        });
    } catch (error: any) {
        logger.error(`[Facebook] Pages error: ${error.message}`);
        res.status(error.statusCode || 500).json({
            error: 'Failed to fetch pages',
            message: error.message,
        });
    }
};

// ─── Ads Insights ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/facebook/ads/:adAccountId/insights
 * Query params: since, until, level, breakdowns
 */
export const getAdsInsights = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);
    const { adAccountId } = req.params;

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const since = (req.query.since as string) || getDefaultDateRange().since;
    const until = (req.query.until as string) || getDefaultDateRange().until;
    const level = (req.query.level as 'account' | 'campaign' | 'adset' | 'ad') || 'campaign';
    const breakdowns = req.query.breakdowns ? (req.query.breakdowns as string).split(',') : undefined;

    try {
        const { token, connectionId } = await FacebookTokenService.getDecryptedTokenByClerkId(clerkId);

        const insights = await FacebookGraphService.getAdsInsights(
            token, adAccountId, { since, until }, level, breakdowns
        );

        // Cache insights in database for AI processing
        await cacheInsights(connectionId, adAccountId, clerkId, insights, level);

        res.status(200).json({
            success: true,
            data: insights,
            meta: { since, until, level, count: insights.length },
        });
    } catch (error: any) {
        logger.error(`[Facebook] Insights error: ${error.message}`);
        res.status(error.statusCode || 500).json({
            error: 'Failed to fetch ads insights',
            message: error.message,
        });
    }
};

// ─── Sync Data ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/facebook/sync/:connectionId
 * Triggers a full data sync for a connection.
 */
export const syncData = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);
    const { connectionId } = req.params;

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const connection = await FacebookConnection.findOne({ _id: connectionId, clerkId });

        if (!connection) {
            res.status(404).json({ error: 'Connection not found' });
            return;
        }

        const token = decrypt(connection.accessToken);
        await syncAccountData(connectionId, token);

        res.status(200).json({
            success: true,
            message: 'Data sync initiated successfully',
        });
    } catch (error: any) {
        logger.error(`[Facebook] Sync error: ${error.message}`);
        res.status(500).json({ error: 'Failed to sync data', message: error.message });
    }
};

// ─── AI Insights ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/facebook/ai/insights/:adAccountId
 * Generates AI-powered advertising insights for an ad account.
 */
export const getAIInsights = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);
    const { adAccountId } = req.params;

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const startDate = req.query.start as string;
    const endDate = req.query.end as string;

    try {
        const report = await AIInsightsService.generateInsightReport(
            clerkId,
            adAccountId,
            startDate && endDate ? { start: startDate, end: endDate } : undefined
        );

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error: any) {
        logger.error(`[Facebook] AI insights error: ${error.message}`);
        res.status(500).json({ error: 'Failed to generate AI insights', message: error.message });
    }
};

/**
 * GET /api/v1/facebook/ai/analyze/:adAccountId/:level/:entityId
 * Get AI analysis for a specific campaign/adset/ad.
 */
export const analyzeEntity = async (req: Request, res: Response): Promise<void> => {
    const { userId: clerkId } = getAuth(req);
    const { adAccountId, level, entityId } = req.params;

    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const recommendations = await AIInsightsService.analyzeEntity(
            clerkId,
            adAccountId,
            entityId,
            level as 'campaign' | 'adset' | 'ad'
        );

        res.status(200).json({
            success: true,
            data: recommendations,
        });
    } catch (error: any) {
        logger.error(`[Facebook] Entity analysis error: ${error.message}`);
        res.status(500).json({ error: 'Failed to analyze entity', message: error.message });
    }
};

// ─── Helper Functions ───────────────────────────────────────────────────────

async function syncAccountData(connectionId: string, accessToken: string): Promise<void> {
    try {
        // Fetch ad accounts
        const adAccounts = await FacebookGraphService.getAdAccounts(accessToken);
        // Fetch pages
        const pages = await FacebookGraphService.getUserPages(accessToken);

        await FacebookConnection.findByIdAndUpdate(connectionId, {
            adAccounts: adAccounts.map(acc => ({
                adAccountId: acc.id,
                name: acc.name,
                currency: acc.currency,
                timezoneName: acc.timezone_name,
                accountStatus: acc.account_status,
                lastSyncedAt: new Date(),
            })),
            pages: pages.map(page => ({
                pageId: page.id,
                name: page.name,
                category: page.category,
                pageAccessToken: encrypt(page.access_token),
                lastSyncedAt: new Date(),
            })),
            lastDataSync: new Date(),
            connectionError: null,
        });

        // Cache last 30 days of insights for each ad account
        const connection = await FacebookConnection.findById(connectionId);
        if (connection) {
            const dateRange = getDefaultDateRange();
            for (const acc of adAccounts) {
                try {
                    const insights = await FacebookGraphService.getAdsInsights(
                        accessToken, acc.id, dateRange, 'campaign'
                    );
                    await cacheInsights(
                        connectionId, acc.id, connection.clerkId, insights, 'campaign'
                    );
                } catch (err: any) {
                    logger.warn(`[Facebook] Insights sync failed for ${acc.id}: ${err.message}`);
                }
            }
        }

        logger.info(`[Facebook] Full sync completed for connection ${connectionId}`);
    } catch (error: any) {
        await FacebookConnection.findByIdAndUpdate(connectionId, {
            connectionError: `Sync failed: ${error.message}`,
        });
        throw error;
    }
}

async function cacheInsights(
    connectionId: string,
    adAccountId: string,
    clerkId: string,
    insights: FacebookGraphService.AdsInsightRow[],
    level: string
): Promise<void> {
    const bulkOps = insights.map(row => {
        const conversions = row.actions?.find(a => a.action_type === 'offsite_conversion')?.value;
        const costPerConversion = row.cost_per_action_type?.find(
            a => a.action_type === 'offsite_conversion'
        )?.value;

        return {
            updateOne: {
                filter: {
                    adAccountId,
                    dateStart: new Date(row.date_start),
                    dateEnd: new Date(row.date_stop),
                    level,
                    entityId: row.campaign_id || row.adset_id || row.ad_id || null,
                },
                update: {
                    $set: {
                        connectionId: new mongoose.Types.ObjectId(connectionId),
                        clerkId,
                        entityName: row.campaign_name || row.adset_name || row.ad_name || null,
                        metrics: {
                            impressions: parseInt(row.impressions) || 0,
                            clicks: parseInt(row.clicks) || 0,
                            spend: parseFloat(row.spend) || 0,
                            cpc: parseFloat(row.cpc) || 0,
                            cpm: parseFloat(row.cpm) || 0,
                            ctr: parseFloat(row.ctr) || 0,
                            reach: parseInt(row.reach as any) || 0,
                            frequency: parseFloat(row.frequency as any) || 0,
                            conversions: parseInt(conversions || '0'),
                            costPerConversion: parseFloat(costPerConversion || '0'),
                            roas: 0, // Computed separately if revenue data available
                        },
                        rawPayload: row,
                        fetchedAt: new Date(),
                    } as any,
                },
                upsert: true,
            },
        };
    });

    if (bulkOps.length > 0) {
        await AdsInsight.bulkWrite(bulkOps as any);
        logger.info(`[Facebook] Cached ${bulkOps.length} insight rows for ${adAccountId}`);
    }
}

function getDefaultDateRange(): { since: string; until: string } {
    const until = new Date();
    const since = new Date();
    since.setDate(since.getDate() - 30);

    return {
        since: since.toISOString().split('T')[0],
        until: until.toISOString().split('T')[0],
    };
}
