import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import User from '../../database/models/User';
import SocialConnection from '../../database/models/SocialConnection';
import FacebookAnalyticsConnection from '../../database/models/FacebookAnalyticsConnection';
import { SocialAuthService } from './socialAuth.service';
import logger from '../../utils/logger';

/**
 * Initiate OAuth flow for a platform
 */
export const initiateAuth = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const { redirect_uri } = req.query;

    if (!['facebook', 'instagram', 'tiktok'].includes(platform)) {
        return res.status(400).json({ success: false, message: 'Invalid platform' });
    }

    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const callbackUrl = `${backendUrl}/api/v1/social/callback/${platform}`;

    // Include redirect_to in state to return user to correct page after callback
    const stateData = {
        nonce: Math.random().toString(36).substring(7),
        redirect_to: (redirect_uri as string) || '/social/connections'
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

    let authUrl = '';
    if (platform === 'facebook' || platform === 'instagram') {
        authUrl = SocialAuthService.getFacebookAuthUrl(callbackUrl, state);
    } else if (platform === 'tiktok') {
        authUrl = SocialAuthService.getTikTokAuthUrl(callbackUrl, state);
    }

    res.json({ success: true, data: { authUrl } });
};

/**
 * Handle OAuth callback
 */
export const handleCallback = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const { code, state } = req.query;
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!code) {
        return res.status(400).json({ success: false, message: 'Authorization code missing' });
    }

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const callbackUrl = `${backendUrl}/api/v1/social/callback/${platform}`;
        
        let tokenData;

        if (platform === 'facebook' || platform === 'instagram') {
            tokenData = await SocialAuthService.exchangeFacebookCode(code as string, callbackUrl);
        } else if (platform === 'tiktok') {
            tokenData = await SocialAuthService.exchangeTikTokCode(code as string, callbackUrl);
        }

        if (!tokenData || !tokenData.access_token) {
            throw new Error('Failed to obtain access token');
        }

        const profile = await SocialAuthService.getPlatformUserProfile(platform as any, tokenData.access_token);

        // Store or update connection
        const connection = await SocialConnection.findOneAndUpdate(
            { userId: user._id, platform },
            {
                platformUserId: profile?.id || 'unknown',
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
                isConnected: true,
                metadata: profile,
                status: 'pending',
                lastSyncedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        let finalRedirect = '/social/connections';
        if (state) {
            try {
                const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
                finalRedirect = stateData.redirect_to || finalRedirect;
            } catch (e) {
                logger.warn('Failed to parse OAuth state');
            }
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://aacp-frontend-delta.vercel.app';
        const separator = finalRedirect.includes('?') ? '&' : '?';
        res.redirect(`${frontendUrl}${finalRedirect}${separator}status=success&platform=${platform}`);
    } catch (error: any) {
        logger.error(`Social auth callback error [${platform}]: ${error.message}`);
        
        let errorRedirect = '/social/connections';
        if (state) {
            try {
                const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
                errorRedirect = stateData.redirect_to || errorRedirect;
            } catch (e) {}
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://aacp-frontend-delta.vercel.app';
        const separator = errorRedirect.includes('?') ? '&' : '?';
        res.redirect(`${frontendUrl}${errorRedirect}${separator}status=error&message=${encodeURIComponent(error.message)}`);
    }
};

/**
 * Get all social connections for the current user
 */
export const getConnections = async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const user = await User.findOne({ clerkId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const connections = await SocialConnection.find({ userId: user._id })
            .select('platform isConnected status expiresAt metadata lastSyncedAt createdAt');

        res.json({ success: true, data: connections });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Disconnect a platform
 */
export const disconnectPlatform = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const user = await User.findOne({ clerkId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await SocialConnection.findOneAndDelete({ userId: user._id, platform });

        if (platform === 'facebook') {
            await FacebookAnalyticsConnection.findOneAndDelete({ userId: user._id });
        }

        res.json({ success: true, message: `Successfully disconnected ${platform}` });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Connect a social platform using a provided access token (no OAuth redirect).
 * Validates the token against the platform's API, then stores/updates the connection.
 */
export const connectWithToken = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const { access_token } = req.body;
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!access_token) {
        return res.status(400).json({ success: false, message: 'access_token is required in request body' });
    }

    if (!['facebook', 'instagram', 'tiktok'].includes(platform)) {
        return res.status(400).json({ success: false, message: 'Invalid platform. Allowed: facebook, instagram, tiktok' });
    }

    try {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please sync your profile first.' });
        }

        // Validate the token by fetching the user's profile from the platform
        let profile: { id: string; name?: string; email?: string; avatar?: string } | null = null;

        try {
            profile = await SocialAuthService.getPlatformUserProfile(platform as any, access_token);
        } catch (validationError: any) {
            logger.error(`[Social] Token validation failed for ${platform}: ${validationError.message}`);
            return res.status(400).json({
                success: false,
                message: `Invalid or expired ${platform} access token. Please check the token and try again.`,
            });
        }

        if (!profile || !profile.id) {
            return res.status(400).json({
                success: false,
                message: `Could not retrieve profile from ${platform}. The token may be invalid.`,
            });
        }

        // Store or update connection
        const connection = await SocialConnection.findOneAndUpdate(
            { userId: user._id, platform },
            {
                platformUserId: profile.id,
                accessToken: access_token,
                isConnected: true,
                metadata: profile,
                status: 'approved',
                lastSyncedAt: new Date(),
            },
            { upsert: true, new: true }
        );

        logger.info(`[Social] ${platform} connected for user ${user.email} (profile: ${profile.name || profile.id})`);

        res.json({
            success: true,
            message: `Successfully connected to ${platform}`,
            data: {
                platform: connection.platform,
                isConnected: connection.isConnected,
                status: connection.status,
                metadata: {
                    name: profile.name,
                    avatar: profile.avatar,
                },
                lastSyncedAt: connection.lastSyncedAt,
            },
        });
    } catch (error: any) {
        logger.error(`[Social] Connect with token error [${platform}]: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to connect social account' });
    }
};
