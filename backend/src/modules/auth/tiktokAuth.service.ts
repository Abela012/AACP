import { clerkClient } from '@clerk/express';
import crypto from 'crypto';
import User from '../../database/models/User';
import SocialConnection from '../../database/models/SocialConnection';
import { SocialAuthService } from '../social/socialAuth.service';
import { getPlatformSettings } from '../platform/platformSettings.service';
import * as walletService from '../wallet/wallet.service';
import logger from '../../utils/logger';

const ALLOWED_ROLES = ['business_owner', 'advertiser'] as const;
type AuthMode = 'signin' | 'signup';
type PublicRole = (typeof ALLOWED_ROLES)[number];

export interface TikTokAuthState {
    nonce: string;
    role: PublicRole;
    mode: AuthMode;
}

const syntheticTikTokEmail = (openId: string) =>
    `tiktok_${openId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 64)}@oauth.aacp.local`;

const generateUniqueUsername = async (seed: string) => {
    let base = seed
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 40) || 'tiktok_user';

    let username = base;
    let counter = 0;
    while (await User.findOne({ username })) {
        counter += 1;
        username = `${base}_${counter}`;
    }
    return username;
};

const splitDisplayName = (displayName: string) => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: 'TikTok', lastName: 'User' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export const encodeTikTokState = (state: TikTokAuthState) =>
    Buffer.from(JSON.stringify(state)).toString('base64url');

export const decodeTikTokState = (raw: string): TikTokAuthState | null => {
    try {
        const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
        if (!parsed?.nonce || !parsed?.role || !parsed?.mode) return null;
        if (!ALLOWED_ROLES.includes(parsed.role)) return null;
        if (parsed.mode !== 'signin' && parsed.mode !== 'signup') return null;
        return parsed as TikTokAuthState;
    } catch {
        return null;
    }
};

export const getTikTokLoginCallbackUrl = () => {
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${backendUrl}/api/v1/auth/tiktok/callback`;
};

const verifyClerkEmail = async (clerkUserId: string) => {
    try {
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        for (const addr of clerkUser.emailAddresses ?? []) {
            try {
                await clerkClient.emailAddresses.updateEmailAddress(addr.id, { verified: true });
            } catch {
                /* already verified */
            }
        }
    } catch (err) {
        logger.warn('[TikTokAuth] Could not mark synthetic email verified', err);
    }
};

const createClerkUserForTikTok = async (
    openId: string,
    displayName: string,
    role: PublicRole,
    avatarUrl?: string
) => {
    const email = syntheticTikTokEmail(openId);
    const { firstName, lastName } = splitDisplayName(displayName || 'TikTok User');

    const clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        firstName,
        lastName,
        skipPasswordRequirement: true,
        publicMetadata: { role, authProvider: 'tiktok' },
    });

    await verifyClerkEmail(clerkUser.id);

    return { clerkUser, email, firstName, lastName };
};

const createMongoUserForTikTok = async (
    clerkId: string,
    email: string,
    firstName: string,
    lastName: string,
    role: PublicRole,
    tiktokOpenId: string,
    profilePicture?: string
) => {
    const platformSettings = await getPlatformSettings();
    if (platformSettings.allowPublicSignup === false) {
        throw new Error('New account registration is temporarily disabled.');
    }

    const username = await generateUniqueUsername(
        firstName || email.split('@')[0] || 'tiktok'
    );

    const user = await User.create({
        clerkId,
        email,
        firstName,
        lastName,
        username,
        profilePicture: profilePicture || '',
        role,
        tiktokOpenId,
        status: 'incomplete',
    });

    const startingCoins = Math.max(0, Math.round(platformSettings.newUserStartingCoins ?? 1000));
    if (startingCoins > 0) {
        try {
            await walletService.creditCoins({
                userId: user._id.toString(),
                amount: startingCoins,
                description: 'Initial balance for new account',
            });
        } catch (walletError) {
            logger.error('[TikTokAuth] Starting coins credit failed:', walletError);
        }
    }

    return user;
};

const upsertTikTokSocialConnection = async (
    userId: string,
    openId: string,
    tokenData: { access_token: string; refresh_token?: string; expires_in?: number },
    profile: { name?: string; avatar?: string }
) => {
    await SocialConnection.findOneAndUpdate(
        { userId, platform: 'tiktok' },
        {
            platformUserId: openId,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in
                ? new Date(Date.now() + tokenData.expires_in * 1000)
                : undefined,
            isConnected: true,
            metadata: profile,
            status: 'approved',
            lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
    );
};

export const completeTikTokOAuth = async (
    code: string,
    state: TikTokAuthState
): Promise<{ signInToken: string; role: PublicRole }> => {
    if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
        throw new Error('TikTok OAuth is not configured on the server.');
    }

    const callbackUrl = getTikTokLoginCallbackUrl();
    const tokenData = await SocialAuthService.exchangeTikTokCode(code, callbackUrl);

    if (!tokenData?.access_token) {
        throw new Error('TikTok did not return an access token.');
    }

    const profile = await SocialAuthService.getPlatformUserProfile('tiktok', tokenData.access_token);
    if (!profile?.id) {
        throw new Error('Could not load your TikTok profile.');
    }

    const openId = profile.id;
    let user = await User.findOne({ tiktokOpenId: openId });

    if (!user && state.mode === 'signin') {
        throw new Error('No account is linked to this TikTok. Sign up first or use email login.');
    }

    if (!user) {
        const { clerkUser, email, firstName, lastName } = await createClerkUserForTikTok(
            openId,
            profile.name || 'TikTok User',
            state.role,
            profile.avatar
        );

        try {
            user = await createMongoUserForTikTok(
                clerkUser.id,
                email,
                firstName,
                lastName,
                state.role,
                openId,
                profile.avatar || clerkUser.imageUrl
            );
        } catch (dbErr) {
            try {
                await clerkClient.users.deleteUser(clerkUser.id);
            } catch {
                /* rollback best-effort */
            }
            throw dbErr;
        }
    } else {
        if (!user.tiktokOpenId) {
            user.tiktokOpenId = openId;
        }
        if (profile.avatar && !user.profilePicture) {
            user.profilePicture = profile.avatar;
        }
        if (profile.name) {
            const { firstName, lastName } = splitDisplayName(profile.name);
            if (!user.firstName && firstName) user.firstName = firstName;
            if (!user.lastName && lastName) user.lastName = lastName;
        }
        await user.save();
    }

    await upsertTikTokSocialConnection(
        user._id.toString(),
        openId,
        tokenData,
        { name: profile.name, avatar: profile.avatar }
    );

    const signInToken = await clerkClient.signInTokens.createSignInToken({
        userId: user.clerkId,
        expiresInSeconds: 120,
    });

    return { signInToken: signInToken.token, role: user.role as PublicRole };
};

export const buildTikTokLoginState = (role: PublicRole, mode: AuthMode): TikTokAuthState => ({
    nonce: crypto.randomBytes(16).toString('hex'),
    role,
    mode,
});
