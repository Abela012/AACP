import axios from 'axios';
import env from '../../config/env';

export class SocialAuthService {
    // Facebook & Instagram
    private static FB_GRAPH_URL = 'https://graph.facebook.com/v19.0';
    private static FB_OAUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';

    // TikTok
    private static TIKTOK_OAUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
    private static TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

    /**
     * Get Facebook Auth URL
     */
    static getFacebookAuthUrl(redirectUri: string, state: string) {
        const scopes = ['public_profile', 'email', 'pages_show_list', 'instagram_basic', 'instagram_manage_insights'];
        return `${this.FB_OAUTH_URL}?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes.join(',')}`;
    }

    /**
     * Exchange Facebook Auth Code for Access Token
     */
    static async exchangeFacebookCode(code: string, redirectUri: string) {
        const response = await axios.get(`${this.FB_GRAPH_URL}/oauth/access_token`, {
            params: {
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                redirect_uri: redirectUri,
                code: code,
            },
        });
        return response.data;
    }

    /** Login Kit / profile — minimal scope only (no Clerk). */
    static readonly TIKTOK_BASIC_SCOPE = 'user.info.basic';

    /**
     * TikTok OAuth URL (user.info.basic only).
     */
    static getTikTokAuthUrl(redirectUri: string, state: string) {
        const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
        return `${this.TIKTOK_OAUTH_URL}?client_key=${clientKey}&scope=${this.TIKTOK_BASIC_SCOPE}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    }

    /**
     * Exchange TikTok Auth Code for Access Token
     */
    static async exchangeTikTokCode(code: string, redirectUri: string) {
        const params = new URLSearchParams();
        params.append('client_key', process.env.TIKTOK_CLIENT_KEY || '');
        params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET || '');
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', redirectUri);

        const response = await axios.post(this.TIKTOK_TOKEN_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    }

    /**
     * Get Platform User Profile
     */
    static async getPlatformUserProfile(platform: 'facebook' | 'instagram' | 'tiktok', accessToken: string) {
        if (platform === 'facebook' || platform === 'instagram') {
            const response = await axios.get(`${this.FB_GRAPH_URL}/me`, {
                params: {
                    fields: 'id,name,email,picture',
                    access_token: accessToken,
                },
            });
            return {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                avatar: response.data.picture?.data?.url,
            };
        }

        if (platform === 'tiktok') {
            const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    fields: 'open_id,union_id,avatar_url,display_name',
                },
            });
            const userData = response.data.data.user;
            return {
                id: userData.open_id,
                name: userData.display_name,
                avatar: userData.avatar_url,
            };
        }

        // Instagram implementation usually goes through Facebook Graph API for business/creator accounts
        // or Instagram Basic Display API for personal accounts.
        // For simplicity, we'll assume FB Graph API for IG business accounts.
        return null;
    }
}
