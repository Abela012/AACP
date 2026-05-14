import axios from 'axios';
import logger from '../../utils/logger';

const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0';
const FB_OAUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';

/**
 * Dedicated service for Facebook Page Analytics OAuth + Graph API.
 * This is intentionally separate from SocialAuthService (used for SSO login)
 * so that permissions, tokens, and data remain decoupled.
 */
export class FacebookAnalyticsService {
    /**
     * Build the OAuth authorization URL for analytics permissions.
     */
    static getAnalyticsAuthUrl(redirectUri: string, state: string): string {
        const scopes = [
            'pages_show_list',
            'pages_read_engagement',
            'read_insights',
            'pages_manage_metadata',
        ];

        const params = new URLSearchParams({
            client_id: process.env.FACEBOOK_APP_ID || '',
            redirect_uri: redirectUri,
            state,
            scope: scopes.join(','),
            response_type: 'code',
        });

        return `${FB_OAUTH_URL}?${params.toString()}`;
    }

    /**
     * Exchange an authorization code for a short-lived access token.
     */
    static async exchangeCodeForToken(code: string, redirectUri: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in?: number;
    }> {
        const response = await axios.get(`${FB_GRAPH_URL}/oauth/access_token`, {
            params: {
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                redirect_uri: redirectUri,
                code,
            },
        });

        return response.data;
    }

    /**
     * Exchange a short-lived token for a long-lived token (~60 days).
     */
    static async exchangeForLongLivedToken(shortLivedToken: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }> {
        const response = await axios.get(`${FB_GRAPH_URL}/oauth/access_token`, {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                fb_exchange_token: shortLivedToken,
            },
        });

        return response.data;
    }

    /**
     * Fetch basic info about the authenticated Facebook user.
     */
    static async getUserProfile(accessToken: string): Promise<{
        id: string;
        name: string;
        email?: string;
    }> {
        const response = await axios.get(`${FB_GRAPH_URL}/me`, {
            params: {
                fields: 'id,name,email',
                access_token: accessToken,
            },
        });

        return response.data;
    }

    /**
     * Fetch all Facebook Pages the user manages via /me/accounts.
     * Each page comes with its own page access token.
     */
    static async getUserPages(accessToken: string): Promise<Array<{
        id: string;
        name: string;
        category: string;
        access_token: string;
        followers_count: number;
        fan_count: number;
        picture?: { data?: { url?: string } };
    }>> {
        const response = await axios.get(`${FB_GRAPH_URL}/me/accounts`, {
            params: {
                fields: 'id,name,category,access_token,followers_count,fan_count,picture',
                access_token: accessToken,
            },
        });

        return response.data?.data || [];
    }

    /**
     * Fetch insights for a specific page.
     * Uses /{page-id}/insights with period=day and since/until for the last 28 days.
     */
    static async getPageInsights(
        pageId: string,
        pageAccessToken: string
    ): Promise<{
        fans: number;
        impressions: number;
        reach: number;
        engagedUsers: number;
        postEngagements: number;
        pageViewsTotal: number;
    }> {
        const metrics = [
            'page_fans',
            'page_impressions',
            'page_engaged_users',
            'page_post_engagements',
            'page_views_total',
        ];

        // Calculate date range: last 28 days
        const now = new Date();
        const since = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

        const sinceStr = Math.floor(since.getTime() / 1000).toString();
        const untilStr = Math.floor(now.getTime() / 1000).toString();

        try {
            const response = await axios.get(`${FB_GRAPH_URL}/${pageId}/insights`, {
                params: {
                    metric: metrics.join(','),
                    period: 'day',
                    since: sinceStr,
                    until: untilStr,
                    access_token: pageAccessToken,
                },
            });

            const insightsData = response.data?.data || [];

            const result = {
                fans: 0,
                impressions: 0,
                reach: 0,
                engagedUsers: 0,
                postEngagements: 0,
                pageViewsTotal: 0,
            };

            for (const metric of insightsData) {
                // Sum up the values across the period for cumulative metrics
                const values = metric.values || [];
                const total = values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);

                switch (metric.name) {
                    case 'page_fans':
                        // page_fans is a lifetime metric — take the latest value
                        result.fans = values.length > 0 ? values[values.length - 1].value || 0 : 0;
                        break;
                    case 'page_impressions':
                        result.impressions = total;
                        break;
                    case 'page_engaged_users':
                        result.engagedUsers = total;
                        break;
                    case 'page_post_engagements':
                        result.postEngagements = total;
                        break;
                    case 'page_views_total':
                        result.pageViewsTotal = total;
                        break;
                }
            }

            return result;
        } catch (error: any) {
            logger.error(`[FB Analytics] Failed to fetch insights for page ${pageId}: ${error.message}`);

            // If it's a permission or token error, rethrow
            if (error.response?.data?.error?.code === 190) {
                throw new Error('TOKEN_EXPIRED');
            }
            if (error.response?.data?.error?.code === 10 || error.response?.data?.error?.code === 200) {
                throw new Error('PERMISSION_DENIED');
            }

            throw error;
        }
    }

    /**
     * Validate that a token still has the required analytics permissions.
     */
    static async debugToken(accessToken: string): Promise<{
        isValid: boolean;
        scopes: string[];
        expiresAt?: number;
        userId?: string;
    }> {
        try {
            const response = await axios.get(`${FB_GRAPH_URL}/debug_token`, {
                params: {
                    input_token: accessToken,
                    access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
                },
            });

            const data = response.data?.data;
            return {
                isValid: data?.is_valid ?? false,
                scopes: data?.scopes || [],
                expiresAt: data?.expires_at,
                userId: data?.user_id,
            };
        } catch (error: any) {
            logger.error(`[FB Analytics] Token debug failed: ${error.message}`);
            return { isValid: false, scopes: [] };
        }
    }
}
