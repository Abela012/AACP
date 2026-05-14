import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import User from '../../database/models/User';
import FacebookAnalyticsConnection, { type IPageInsights } from '../../database/models/FacebookAnalyticsConnection';
import { FacebookAnalyticsService } from './facebookAnalytics.service';
import logger from '../../utils/logger';

/**
 * Initiate the Facebook Analytics OAuth flow.
 * Returns the authorization URL the frontend should redirect the user to.
 *
 * GET /auth/facebook/analytics/login
 */
export const initiateAnalyticsAuth = async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const callbackUrl = `${backendUrl}/api/v1/auth/facebook/analytics/callback`;

        // Encode clerkId in state so the callback can identify the user
        const statePayload = {
            clerkId,
            nonce: Math.random().toString(36).substring(7),
            ts: Date.now(),
        };
        const state = Buffer.from(JSON.stringify(statePayload)).toString('base64');

        const authUrl = FacebookAnalyticsService.getAnalyticsAuthUrl(callbackUrl, state);

        logger.info(`[FB Analytics] Auth initiated for clerk user ${clerkId}`);
        res.json({ success: true, data: { authUrl } });
    } catch (error: any) {
        logger.error(`[FB Analytics] Auth initiation error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to initiate analytics authorization' });
    }
};

/**
 * Handle the OAuth callback from Facebook.
 * Exchanges code → short-lived token → long-lived token,
 * then fetches pages and initial insights.
 *
 * GET /auth/facebook/analytics/callback
 */
export const handleAnalyticsCallback = async (req: Request, res: Response) => {
    const { code, state, error: fbError, error_description } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'https://aacp-frontend-delta.vercel.app';
    const analyticsPageUrl = `${frontendUrl}/facebook-analytics`;

    // Handle user denial
    if (fbError) {
        logger.warn(`[FB Analytics] User denied permissions: ${fbError} — ${error_description}`);
        return res.redirect(`${analyticsPageUrl}?status=denied&message=${encodeURIComponent(String(error_description || 'Permission denied'))}`);
    }

    if (!code) {
        return res.redirect(`${analyticsPageUrl}?status=error&message=${encodeURIComponent('Authorization code missing')}`);
    }

    // Decode state to get clerkId
    let clerkId: string | null = null;
    try {
        const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
        clerkId = stateData.clerkId;
    } catch (e) {
        logger.error('[FB Analytics] Failed to parse callback state');
        return res.redirect(`${analyticsPageUrl}?status=error&message=${encodeURIComponent('Invalid state parameter')}`);
    }

    if (!clerkId) {
        return res.redirect(`${analyticsPageUrl}?status=error&message=${encodeURIComponent('User identification failed')}`);
    }

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.redirect(`${analyticsPageUrl}?status=error&message=${encodeURIComponent('User not found')}`);
        }

        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const callbackUrl = `${backendUrl}/api/v1/auth/facebook/analytics/callback`;

        // Step 1: Exchange code for short-lived token
        logger.info(`[FB Analytics] Exchanging auth code for token...`);
        const tokenData = await FacebookAnalyticsService.exchangeCodeForToken(code as string, callbackUrl);

        if (!tokenData?.access_token) {
            throw new Error('Failed to obtain access token from Facebook');
        }

        // Step 2: Exchange for long-lived token (~60 days)
        logger.info(`[FB Analytics] Exchanging for long-lived token...`);
        const longLivedData = await FacebookAnalyticsService.exchangeForLongLivedToken(tokenData.access_token);

        const finalToken = longLivedData.access_token || tokenData.access_token;
        const expiresIn = longLivedData.expires_in || tokenData.expires_in;
        const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

        // Step 3: Get Facebook user profile
        const fbProfile = await FacebookAnalyticsService.getUserProfile(finalToken);

        // Step 4: Fetch pages the user manages
        logger.info(`[FB Analytics] Fetching user pages...`);
        const rawPages = await FacebookAnalyticsService.getUserPages(finalToken);

        const pages = rawPages.map((p) => ({
            pageId: p.id,
            name: p.name,
            category: p.category,
            accessToken: p.access_token,
            followers: p.followers_count || 0,
            fans: p.fan_count || 0,
            picture: p.picture?.data?.url,
        }));

        // Step 5: Fetch initial insights for each page
        logger.info(`[FB Analytics] Fetching initial insights for ${pages.length} page(s)...`);
        const insights: IPageInsights[] = [];
        for (const page of pages) {
            try {
                const pageInsights = await FacebookAnalyticsService.getPageInsights(page.pageId, page.accessToken);
                insights.push({
                    pageId: page.pageId,
                    pageName: page.name,
                    fans: pageInsights.fans || page.fans,
                    followers: page.followers,
                    impressions: pageInsights.impressions,
                    reach: 0, // page_reach requires separate metric
                    engagedUsers: pageInsights.engagedUsers,
                    postEngagements: pageInsights.postEngagements,
                    pageViewsTotal: pageInsights.pageViewsTotal,
                    fetchedAt: new Date(),
                });
            } catch (insightErr: any) {
                logger.warn(`[FB Analytics] Insights fetch failed for page ${page.name}: ${insightErr.message}`);
                // Still save the page even if insights fail
                insights.push({
                    pageId: page.pageId,
                    pageName: page.name,
                    fans: page.fans,
                    followers: page.followers,
                    impressions: 0,
                    reach: 0,
                    engagedUsers: 0,
                    postEngagements: 0,
                    pageViewsTotal: 0,
                    fetchedAt: new Date(),
                });
            }
        }

        // Step 6: Debug token to get granted scopes
        const tokenInfo = await FacebookAnalyticsService.debugToken(finalToken);

        // Step 7: Store or update the analytics connection
        await FacebookAnalyticsConnection.findOneAndUpdate(
            { userId: user._id },
            {
                facebookUserId: fbProfile.id,
                userAccessToken: finalToken,
                tokenExpiresAt,
                scopes: tokenInfo.scopes,
                pages,
                insights,
                status: 'connected',
                lastSyncedAt: new Date(),
            },
            { upsert: true, new: true, runValidators: true }
        );

        logger.info(`[FB Analytics] Successfully connected for user ${user.email} (${pages.length} page(s))`);
        return res.redirect(`${analyticsPageUrl}?status=success&pages=${pages.length}`);
    } catch (error: any) {
        logger.error(`[FB Analytics] Callback error: ${error.message}`);
        return res.redirect(`${analyticsPageUrl}?status=error&message=${encodeURIComponent(error.message || 'Connection failed')}`);
    }
};

/**
 * Get the analytics connection status and page list for the current user.
 *
 * GET /api/facebook/pages
 */
export const getPages = async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const user = await User.findOne({ clerkId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const connection = await FacebookAnalyticsConnection.findOne({ userId: user._id });
        if (!connection) {
            return res.json({
                success: true,
                data: {
                    isConnected: false,
                    pages: [],
                },
            });
        }

        // Check token expiry
        if (connection.tokenExpiresAt && connection.tokenExpiresAt < new Date()) {
            connection.status = 'expired';
            await connection.save();
        }

        res.json({
            success: true,
            data: {
                isConnected: connection.status === 'connected',
                status: connection.status,
                pages: connection.pages.map((p) => ({
                    pageId: p.pageId,
                    name: p.name,
                    category: p.category,
                    followers: p.followers,
                    fans: p.fans,
                    picture: p.picture,
                })),
                scopes: connection.scopes,
                lastSyncedAt: connection.lastSyncedAt,
                tokenExpiresAt: connection.tokenExpiresAt,
            },
        });
    } catch (error: any) {
        logger.error(`[FB Analytics] Get pages error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to fetch pages' });
    }
};

/**
 * Fetch or refresh insights for all connected pages.
 *
 * GET /api/facebook/insights
 * Optional query: ?pageId=xxx — fetch only for a specific page.
 */
export const getInsights = async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { pageId, refresh } = req.query;

    try {
        const user = await User.findOne({ clerkId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const connection = await FacebookAnalyticsConnection.findOne({ userId: user._id });
        if (!connection || connection.status !== 'connected') {
            return res.status(400).json({
                success: false,
                message: connection?.status === 'expired'
                    ? 'Token expired. Please reconnect Facebook Analytics.'
                    : 'Facebook Analytics not connected',
                errorCode: connection?.status === 'expired' ? 'TOKEN_EXPIRED' : 'NOT_CONNECTED',
            });
        }

        // If refresh requested or insights are older than 1 hour, re-fetch from Facebook
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const shouldRefresh = refresh === 'true' || !connection.lastSyncedAt || connection.lastSyncedAt < oneHourAgo;

        if (shouldRefresh) {
            logger.info(`[FB Analytics] Refreshing insights for user ${user.email}...`);

            const pagesToFetch = pageId
                ? connection.pages.filter((p) => p.pageId === pageId)
                : connection.pages;

            const freshInsights: IPageInsights[] = [];

            for (const page of pagesToFetch) {
                try {
                    const ins = await FacebookAnalyticsService.getPageInsights(page.pageId, page.accessToken);
                    freshInsights.push({
                        pageId: page.pageId,
                        pageName: page.name,
                        fans: ins.fans || page.fans || 0,
                        followers: page.followers ?? 0,
                        impressions: ins.impressions,
                        reach: 0,
                        engagedUsers: ins.engagedUsers,
                        postEngagements: ins.postEngagements,
                        pageViewsTotal: ins.pageViewsTotal,
                        fetchedAt: new Date(),
                    });
                } catch (err: any) {
                    if (err.message === 'TOKEN_EXPIRED') {
                        connection.status = 'expired';
                        await connection.save();
                        return res.status(401).json({
                            success: false,
                            message: 'Facebook token expired. Please reconnect.',
                            errorCode: 'TOKEN_EXPIRED',
                        });
                    }
                    if (err.message === 'PERMISSION_DENIED') {
                        return res.status(403).json({
                            success: false,
                            message: 'Missing required Facebook permissions.',
                            errorCode: 'PERMISSION_DENIED',
                        });
                    }
                    logger.warn(`[FB Analytics] Insight refresh failed for page ${page.name}: ${err.message}`);
                    // Use cached data if available
                    const cached = connection.insights.find((i) => i.pageId === page.pageId);
                    if (cached) freshInsights.push(cached);
                }
            }

            // Update cached insights
            if (pageId) {
                // Only update the specific page
                connection.insights = connection.insights.filter((i) => i.pageId !== pageId).concat(freshInsights);
            } else {
                connection.insights = freshInsights;
            }
            connection.lastSyncedAt = new Date();
            await connection.save();
        }

        const insightsToReturn = pageId
            ? connection.insights.filter((i) => i.pageId === pageId)
            : connection.insights;

        res.json({
            success: true,
            data: {
                insights: insightsToReturn,
                lastSyncedAt: connection.lastSyncedAt,
            },
        });
    } catch (error: any) {
        logger.error(`[FB Analytics] Get insights error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to fetch insights' });
    }
};

/**
 * Disconnect Facebook Analytics.
 *
 * DELETE /api/facebook/disconnect
 */
export const disconnectAnalytics = async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const user = await User.findOne({ clerkId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await FacebookAnalyticsConnection.findOneAndDelete({ userId: user._id });

        logger.info(`[FB Analytics] Disconnected for user ${user.email}`);
        res.json({ success: true, message: 'Facebook Analytics disconnected successfully' });
    } catch (error: any) {
        logger.error(`[FB Analytics] Disconnect error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to disconnect' });
    }
};
