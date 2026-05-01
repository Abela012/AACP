import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '../../utils/logger';

/**
 * Facebook Graph API Service
 *
 * Reusable, stateless service layer for all Facebook Graph API interactions.
 * Each method accepts an access token so the service remains stateless
 * and can be used for any user's connection.
 *
 * API Version: v21.0 (latest stable as of 2026)
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';
const GRAPH_API_OAUTH = 'https://graph.facebook.com/oauth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FacebookProfile {
    id: string;
    name: string;
    email?: string;
    picture?: { data: { url: string } };
}

export interface FacebookPage {
    id: string;
    name: string;
    category: string;
    access_token: string;
}

export interface FacebookAdAccount {
    id: string;                 // "act_XXXXX"
    account_id: string;         // "XXXXX"
    name: string;
    currency: string;
    timezone_name: string;
    account_status: number;
    amount_spent: string;
}

export interface AdsInsightRow {
    date_start: string;
    date_stop: string;
    impressions: string;
    clicks: string;
    spend: string;
    cpc: string;
    cpm: string;
    ctr: string;
    reach: string;
    frequency: string;
    actions?: Array<{ action_type: string; value: string }>;
    cost_per_action_type?: Array<{ action_type: string; value: string }>;
    campaign_id?: string;
    campaign_name?: string;
    adset_id?: string;
    adset_name?: string;
    ad_id?: string;
    ad_name?: string;
    [key: string]: any;
}

export interface TokenExchangeResult {
    access_token: string;
    token_type: string;
    expires_in?: number;        // seconds until expiry (long-lived ≈ 60 days)
}

export interface TokenDebugInfo {
    app_id: string;
    type: string;
    is_valid: boolean;
    scopes: string[];
    expires_at: number;         // Unix timestamp
    user_id: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createClient(accessToken: string): AxiosInstance {
    return axios.create({
        baseURL: GRAPH_API_BASE,
        params: { access_token: accessToken },
        timeout: 30_000,
    });
}

function handleGraphError(error: unknown, context: string): never {
    if (error instanceof AxiosError && error.response?.data?.error) {
        const fbError = error.response.data.error;
        logger.error(`[FacebookGraph] ${context}: ${fbError.message}`, {
            code: fbError.code,
            subcode: fbError.error_subcode,
            type: fbError.type,
        });
        const err = new Error(fbError.message) as any;
        err.statusCode = error.response.status;
        err.facebookCode = fbError.code;
        err.facebookSubcode = fbError.error_subcode;
        throw err;
    }
    logger.error(`[FacebookGraph] ${context}: Unknown error`, { error });
    throw error;
}

// ─── Service Methods ─────────────────────────────────────────────────────────

/**
 * Exchange a short-lived token for a long-lived token (~60 days).
 */
export async function exchangeForLongLivedToken(
    shortLivedToken: string
): Promise<TokenExchangeResult> {
    try {
        const response = await axios.get(`${GRAPH_API_OAUTH}/access_token`, {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                fb_exchange_token: shortLivedToken,
            },
            timeout: 15_000,
        });
        logger.info('[FacebookGraph] Token exchanged for long-lived token');
        return response.data;
    } catch (error) {
        handleGraphError(error, 'exchangeForLongLivedToken');
    }
}

/**
 * Debug/inspect a token to get metadata (scopes, expiry, validity).
 */
export async function debugToken(tokenToInspect: string): Promise<TokenDebugInfo> {
    try {
        const appToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
        const response = await axios.get(`${GRAPH_API_BASE}/debug_token`, {
            params: {
                input_token: tokenToInspect,
                access_token: appToken,
            },
            timeout: 15_000,
        });
        return response.data.data;
    } catch (error) {
        handleGraphError(error, 'debugToken');
    }
}

/**
 * Fetch the authenticated user's Facebook profile.
 */
export async function getUserProfile(accessToken: string): Promise<FacebookProfile> {
    try {
        const client = createClient(accessToken);
        const response = await client.get('/me', {
            params: {
                fields: 'id,name,email,picture.type(large)',
            },
        });
        return response.data;
    } catch (error) {
        handleGraphError(error, 'getUserProfile');
    }
}

/**
 * Fetch all Facebook Pages managed by the user.
 */
export async function getUserPages(accessToken: string): Promise<FacebookPage[]> {
    try {
        const client = createClient(accessToken);
        const pages: FacebookPage[] = [];
        let url = '/me/accounts';
        let params: Record<string, any> = {
            fields: 'id,name,category,access_token',
            limit: 100,
        };

        // Handle pagination
        do {
            const response = await client.get(url, { params });
            pages.push(...response.data.data);

            if (response.data.paging?.next) {
                // next URL is absolute, switch to raw axios
                const nextResponse = await axios.get(response.data.paging.next, { timeout: 15_000 });
                pages.push(...nextResponse.data.data);
                url = '';
                if (!nextResponse.data.paging?.next) break;
                // Continue pagination
                const nextUrl = new URL(nextResponse.data.paging.next);
                url = nextUrl.pathname.replace('/v21.0', '');
                params = Object.fromEntries(nextUrl.searchParams);
            } else {
                break;
            }
        } while (url);

        logger.info(`[FacebookGraph] Fetched ${pages.length} pages`);
        return pages;
    } catch (error) {
        handleGraphError(error, 'getUserPages');
    }
}

/**
 * Fetch all ad accounts the user has access to.
 */
export async function getAdAccounts(accessToken: string): Promise<FacebookAdAccount[]> {
    try {
        const client = createClient(accessToken);
        const response = await client.get('/me/adaccounts', {
            params: {
                fields: 'id,account_id,name,currency,timezone_name,account_status,amount_spent',
                limit: 100,
            },
        });
        const accounts: FacebookAdAccount[] = response.data.data || [];
        logger.info(`[FacebookGraph] Fetched ${accounts.length} ad accounts`);
        return accounts;
    } catch (error) {
        handleGraphError(error, 'getAdAccounts');
    }
}

/**
 * Fetch ads insights for a specific ad account.
 *
 * @param accessToken  User's Facebook access token
 * @param adAccountId  e.g. "act_123456789"
 * @param dateRange    { since: "YYYY-MM-DD", until: "YYYY-MM-DD" }
 * @param level        Granularity level
 * @param breakdowns   Optional breakdowns (age, gender, placement, etc.)
 */
export async function getAdsInsights(
    accessToken: string,
    adAccountId: string,
    dateRange: { since: string; until: string },
    level: 'account' | 'campaign' | 'adset' | 'ad' = 'account',
    breakdowns?: string[]
): Promise<AdsInsightRow[]> {
    try {
        const client = createClient(accessToken);

        const params: Record<string, any> = {
            fields: [
                'impressions', 'clicks', 'spend', 'cpc', 'cpm', 'ctr',
                'reach', 'frequency', 'actions', 'cost_per_action_type',
                'campaign_id', 'campaign_name',
                'adset_id', 'adset_name',
                'ad_id', 'ad_name',
            ].join(','),
            time_range: JSON.stringify(dateRange),
            level,
            limit: 500,
        };

        if (breakdowns?.length) {
            params.breakdowns = breakdowns.join(',');
        }

        const insights: AdsInsightRow[] = [];
        let url = `/${adAccountId}/insights`;

        // Handle pagination
        do {
            const response = await client.get(url, { params });
            if (response.data.data) {
                insights.push(...response.data.data);
            }

            if (response.data.paging?.next) {
                const nextResponse = await axios.get(response.data.paging.next, { timeout: 30_000 });
                if (nextResponse.data.data) {
                    insights.push(...nextResponse.data.data);
                }
                if (!nextResponse.data.paging?.next) break;
                url = '';
                break; // Safety limit — paginated insights can be massive
            } else {
                break;
            }
        } while (url);

        logger.info(
            `[FacebookGraph] Fetched ${insights.length} insight rows for ${adAccountId} (${level})`
        );
        return insights;
    } catch (error) {
        handleGraphError(error, `getAdsInsights:${adAccountId}`);
    }
}

/**
 * Fetch page insights (reach, impressions, engagement) for a specific page.
 */
export async function getPageInsights(
    pageAccessToken: string,
    pageId: string,
    metrics: string[] = ['page_impressions', 'page_engaged_users', 'page_fans'],
    period: 'day' | 'week' | 'days_28' = 'day',
    dateRange?: { since: string; until: string }
): Promise<any[]> {
    try {
        const client = createClient(pageAccessToken);

        const params: Record<string, any> = {
            metric: metrics.join(','),
            period,
        };

        if (dateRange) {
            params.since = dateRange.since;
            params.until = dateRange.until;
        }

        const response = await client.get(`/${pageId}/insights`, { params });
        return response.data.data || [];
    } catch (error) {
        handleGraphError(error, `getPageInsights:${pageId}`);
    }
}
