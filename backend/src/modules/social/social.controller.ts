import { Request, Response } from 'express';
import User from '../../database/models/User';
import { getAuth } from '@clerk/express';
import crypto from 'crypto';
import { ApifyClient } from 'apify-client';
import VerificationCode from '../../database/models/VerificationCode';

export const getConnections = async (req: Request, res: Response): Promise<void> => {
    try {
        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
        }

        res.status(200).json({
            success: true,
            data: user.socialProfiles || []
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const initiateAuth = async (req: Request, res: Response): Promise<void> => {
    // Keep this for backwards compatibility if needed, or deprecate
    res.status(200).json({ success: true });
};

const generateCode = () => {
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AACP-${randomStr}`;
};

export const initiateConnection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { platform, username } = req.body;
        if (!platform || !username) {
            res.status(400).json({ success: false, message: 'Platform and username are required' });
            return;
        }

        const normalizedPlatform = platform.toLowerCase();
        const cleanUsername = username.trim().replace(/^@/, '');

        // 1. Check uniqueness: is this username already connected to ANY user?
        const existing = await User.findOne({
            'socialProfiles': {
                $elemMatch: {
                    platform: { $regex: new RegExp(`^${normalizedPlatform}$`, 'i') },
                    username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
                    verified: true
                }
            }
        });

        if (existing) {
            res.status(400).json({ success: false, message: `This ${platform} account is already connected to another user.` });
            return;
        }

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            user = await User.findOne({ clerkId: userId });
        }

        const verificationRecord = new VerificationCode({
            advertiserId: user?._id,
            platform: normalizedPlatform,
            username: cleanUsername,
            tiktokUsername: cleanUsername, // legacy
            code,
            expiresAt
        });
        await verificationRecord.save();

        res.status(200).json({
            success: true,
            data: {
                verificationCode: code,
                expiresAt
            }
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const verifyConnection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { platform, username, verificationCode } = req.body;
        if (!platform || !username || !verificationCode) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }

        const cleanUsername = username.trim().replace(/^@/, '');
        const normalizedPlatform = platform.toLowerCase();

        const record = await VerificationCode.findOne({
            username: cleanUsername,
            code: verificationCode,
            status: 'pending'
        });

        if (!record) {
            res.status(400).json({ success: false, message: "Verification code not found or expired." });
            return;
        }

        if (record.expiresAt < new Date()) {
            record.status = 'expired';
            await record.save();
            res.status(400).json({ success: false, message: 'Code expired. Request a new one.' });
            return;
        }

        if (record.attempts >= 5) {
            record.status = 'failed';
            await record.save();
            res.status(400).json({ success: false, message: 'Too many attempts. Wait 5 minutes.' });
            return;
        }

        record.attempts += 1;
        await record.save();

        // Check using Apify
        const apifyToken = process.env.APIFY_TOKEN;
        if (!apifyToken) throw new Error('APIFY_TOKEN not configured');
        const client = new ApifyClient({ token: apifyToken });

        let bioHasCode = false;
        let metrics: any = null;
        let profilePic = '';

        if (normalizedPlatform === 'tiktok') {
            const run = await client.actor('clockworks/free-tiktok-scraper').call({
                profiles: [cleanUsername],
                scrapePosts: true,
                maxPostsPerProfile: 12
            });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (!items || items.length === 0) {
                res.status(400).json({ success: false, message: 'TikTok profile not found or private.' });
                return;
            }
            
            // Find dedicated profile item, or fall back to first item's authorMeta, or the item itself
            const profileItem: any = items.find((item: any) => !item.id) || items[0];
            const profileMeta: any = profileItem?.authorMeta || profileItem || {};
            const postItems: any[] = items.filter((item: any) => item.id);

            const possibleBios = [
                profileMeta.bio,
                profileMeta.signature,
                profileItem?.bio,
                profileItem?.signature
            ].filter(Boolean);
            bioHasCode = possibleBios.some(b => b.toLowerCase().includes(verificationCode.toLowerCase()));

            const followers = profileMeta.fans || profileMeta.followers || 0;
            const following = profileMeta.following || 0;
            const totalLikes = profileMeta.heart || profileMeta.likes || 0;
            const totalPosts = profileMeta.video || profileMeta.posts || 0;

            // Calculate averages from actual posts if available
            let avgViews = 0, avgLikes = 0, avgComments = 0;
            if (postItems.length > 0) {
                avgViews = Math.round(postItems.reduce((s: number, p: any) => s + (p.playCount || p.stats?.playCount || 0), 0) / postItems.length);
                avgLikes = Math.round(postItems.reduce((s: number, p: any) => s + (p.diggCount || p.stats?.diggCount || 0), 0) / postItems.length);
                avgComments = Math.round(postItems.reduce((s: number, p: any) => s + (p.commentCount || p.stats?.commentCount || 0), 0) / postItems.length);
            }

            // Compute engagementRate: use post averages if available, else estimate from totalLikes/followers
            let engagementRate = 0;
            if (followers > 0) {
                if (avgLikes > 0 || avgComments > 0) {
                    engagementRate = parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2));
                } else if (totalLikes > 0 && totalPosts > 0) {
                    // Fallback: use totalLikes per post as proxy
                    const avgLikesEstimate = totalLikes / totalPosts;
                    engagementRate = parseFloat(((avgLikesEstimate / followers) * 100).toFixed(2));
                }
            }

            metrics = {
                followers,
                following,
                totalLikes,
                totalPosts,
                avgViews,
                avgLikes,
                avgComments,
                engagementRate
            };
            profilePic = profileMeta.avatar || profileMeta.profilePicUrl || '';

        } else if (normalizedPlatform === 'instagram') {
            // Note: If instagram scraper is taking too long or failing, we might mock for testing.
            const run = await client.actor('apify/instagram-profile-scraper').call({
                usernames: [cleanUsername]
            });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (!items || items.length === 0) {
                res.status(400).json({ success: false, message: 'Instagram profile not found or private.' });
                return;
            }
            const userData: any = items[0];
            const bio = userData?.biography || '';
            bioHasCode = bio.toLowerCase().includes(verificationCode.toLowerCase());

            metrics = {
                followers: userData?.followersCount || 0,
                following: userData?.followsCount || 0,
                totalPosts: userData?.postsCount || 0,
                totalLikes: 0,
                avgViews: 0,
                avgLikes: 0,
                avgComments: 0,
                engagementRate: 0
            };
            profilePic = userData?.profilePicUrlHD || userData?.profilePicUrl || '';
        } else {
            res.status(400).json({ success: false, message: 'Platform not supported yet' });
            return;
        }

        if (!bioHasCode) {
            res.status(400).json({ success: false, message: "We couldn't find the verification code in your bio." });
            return;
        }

        // Verified! Update user profile
        record.status = 'verified';
        await record.save();

        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            user = await User.findOne({ clerkId: userId });
        }

        const platformFormat = normalizedPlatform === 'tiktok' ? 'TikTok' : 'Instagram';
        const newProfile = {
            platform: platformFormat,
            username: cleanUsername,
            verified: true,
            followers: metrics.followers,
            following: metrics.following,
            engagementRate: metrics.engagementRate,
            tiktokAnalytics: normalizedPlatform === 'tiktok' ? metrics : undefined,
            niches: [],
            contentStyles: []
        };

        const existingIndex = user.socialProfiles.findIndex((p: any) => p.platform.toLowerCase() === normalizedPlatform);
        if (existingIndex > -1) {
            user.socialProfiles[existingIndex] = { ...user.socialProfiles[existingIndex], ...newProfile };
        } else {
            user.socialProfiles.push(newProfile);
        }

        if (profilePic && (!user.profilePicture || user.profilePicture === '')) {
            user.profilePicture = profilePic;
        }

        if (!user.connectedAccounts) {
            user.connectedAccounts = {};
        }

        user.connectedAccounts[normalizedPlatform] = {
            connected: true,
            verified: true,
            username: cleanUsername,
            displayName: cleanUsername,
            profilePicture: profilePic,
            metrics,
            verifiedBadge: false,
            lastSynced: new Date(),
            connectedAt: new Date()
        };
        user.markModified('connectedAccounts');

        await user.save();

        res.status(200).json({ success: true, data: newProfile });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const syncMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { platform } = req.params;
        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            user = await User.findOne({ clerkId: userId });
        }
        
        // This is a placeholder for syncing logic which would be similar to verifyConnection scraping.
        res.status(200).json({ success: true, message: `Synced ${platform} successfully.` });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const disconnectPlatform = async (req: Request, res: Response): Promise<void> => {
    try {
        let user = (req as any).user;
        const { platform } = req.params;

        if (!user) {
            const { userId } = getAuth(req);
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
        }

        // Remove from legacy socialProfiles array
        user.socialProfiles = user.socialProfiles.filter((p: any) => p.platform.toLowerCase() !== platform.toLowerCase());

        // Also update the new root-level connectedAccounts
        const normalizedPlatform = platform.toLowerCase();
        if (user.connectedAccounts && user.connectedAccounts[normalizedPlatform]) {
            user.connectedAccounts[normalizedPlatform] = {
                connected: false,
                verified: false,
                username: undefined,
                displayName: undefined,
                bio: undefined,
                profilePicture: undefined,
                metrics: undefined,
                verifiedBadge: false,
                lastSynced: undefined,
                connectedAt: undefined
            };
            user.markModified('connectedAccounts');
        }

        // If it's facebook, also clear legacy fields
        if (normalizedPlatform === 'facebook') {
            user.facebook = undefined;
            user.facebookConnected = false;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: `${platform} disconnected`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
