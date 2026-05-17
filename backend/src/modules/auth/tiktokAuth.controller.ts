import { Request, Response } from 'express';
import { SocialAuthService } from '../social/socialAuth.service';
import {
    buildTikTokLoginState,
    completeTikTokOAuth,
    decodeTikTokState,
    encodeTikTokState,
    getTikTokLoginCallbackUrl,
} from './tiktokAuth.service';
import logger from '../../utils/logger';

const frontendBase = () =>
    process.env.FRONTEND_URL || 'https://aacp-frontend-delta.vercel.app';

const redirectToComplete = (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return `${frontendBase()}/auth/tiktok/complete?${qs}`;
};

/**
 * GET /api/v1/auth/tiktok/start?mode=signin|signup&role=business_owner|advertiser
 */
export const startTikTokAuth = (req: Request, res: Response) => {
    const mode = (req.query.mode as string) || 'signin';
    const role = (req.query.role as string) || 'advertiser';

    if (mode !== 'signin' && mode !== 'signup') {
        return res.status(400).json({ message: 'Invalid mode. Use signin or signup.' });
    }

    if (role !== 'business_owner' && role !== 'advertiser') {
        return res.status(400).json({ message: 'Invalid role. Select Business or Advertiser first.' });
    }

    if (!process.env.TIKTOK_CLIENT_KEY) {
        return res.status(503).json({ message: 'TikTok login is not configured.' });
    }

    const state = buildTikTokLoginState(role, mode);
    const callbackUrl = getTikTokLoginCallbackUrl();
    const authUrl = SocialAuthService.getTikTokAuthUrl(callbackUrl, encodeTikTokState(state));

    res.redirect(authUrl);
};

/**
 * GET /api/v1/auth/tiktok/callback — public; TikTok redirects here (not Clerk).
 */
export const callbackTikTokAuth = async (req: Request, res: Response) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
        const message =
            (error_description as string) ||
            (error as string) ||
            'TikTok authorization was cancelled or failed.';
        return res.redirect(redirectToComplete({ error: message }));
    }

    if (!code || !state) {
        return res.redirect(
            redirectToComplete({ error: 'Missing authorization code from TikTok.' })
        );
    }

    const parsedState = decodeTikTokState(state as string);
    if (!parsedState) {
        return res.redirect(redirectToComplete({ error: 'Invalid or expired login session. Try again.' }));
    }

    try {
        const { signInToken, role } = await completeTikTokOAuth(code as string, parsedState);
        return res.redirect(
            redirectToComplete({
                token: signInToken,
                role,
            })
        );
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : 'TikTok sign-in failed. Please try again.';
        logger.error(`[TikTokAuth] callback error: ${message}`);
        return res.redirect(redirectToComplete({ error: message }));
    }
};
