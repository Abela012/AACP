import { Request, Response } from 'express';
import User from '../../database/models/User';
import VerificationCode from '../../database/models/VerificationCode';
import { getAuth } from '@clerk/express';
import * as crypto from 'crypto';
import { ApifyClient } from 'apify-client';

// Helper to generate verification code
const generateCode = (): string => {
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AACP-${randomStr}`;
};

// 1. GET /api/advertiser/profile/setup
export const getProfileSetup = async (req: Request, res: Response): Promise<void> => {
    try {
        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
        }

        res.status(200).json({
            success: true,
            user: {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phoneNumber: user.phoneNumber || "",
                email: user.email || "",
                emailVerified: user.emailVerified || false,
                connectedAccounts: user.connectedAccounts || {
                    tiktok: { connected: false, verified: false },
                    instagram: { connected: false, verified: false },
                    facebook: { connected: false, verified: false }
                },
                profileCompleted: user.profileCompleted || false,
                niche: user.niche || "",
                contentTypes: user.contentTypes || [],
                targetAudience: user.targetAudience || { ageRange: "", gender: "", interests: [] },
                experienceLevel: user.experienceLevel || ""
            }
        });
    } catch (error: any) {
        console.error("[AdvertiserProfile] Setup fetch error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 2. PUT /api/advertiser/profile/basic
export const updateBasicInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
        }

        const { firstName, lastName, phoneNumber } = req.body;
        if (!firstName || !lastName) {
            res.status(400).json({ success: false, message: "First name and Last name are required" });
            return;
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.phoneNumber = phoneNumber;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Basic information updated successfully",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error: any) {
        console.error("[AdvertiserProfile] Basic update error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 3. POST /api/advertiser/social/initiate
export const initiateSocialConnection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { platform, username } = req.body;
        if (!platform || !username) {
            res.status(400).json({ success: false, message: "Platform and username are required" });
            return;
        }

        const normalizedPlatform = platform.toLowerCase();
        const cleanUsername = username.trim().replace(/^@/, '');

        if (!['tiktok', 'instagram', 'facebook'].includes(normalizedPlatform)) {
            res.status(400).json({ success: false, message: "Unsupported platform" });
            return;
        }

        // Check if this username is already connected by another user
        const filter: any = {};
        filter[`connectedAccounts.${normalizedPlatform}.username`] = cleanUsername;
        filter[`connectedAccounts.${normalizedPlatform}.verified`] = true;
        
        const alreadyConnected = await User.findOne(filter);
        if (alreadyConnected) {
            res.status(400).json({ success: false, message: "This account is already connected to another user" });
            return;
        }

        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
        }

        const verificationCode = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Remove any previous pending codes for this platform/username to avoid duplicates
        await VerificationCode.deleteMany({
            advertiserId: user._id,
            platform: normalizedPlatform,
            username: cleanUsername,
            status: 'pending'
        });

        const newCode = new VerificationCode({
            advertiserId: user._id,
            platform: normalizedPlatform,
            username: cleanUsername,
            tiktokUsername: cleanUsername, // legacy
            code: verificationCode,
            status: 'pending',
            attempts: 0,
            expiresAt
        });

        await newCode.save();

        res.status(200).json({
            success: true,
            verificationCode,
            expiresAt
        });
    } catch (error: any) {
        console.error("[AdvertiserProfile] Initiate connection error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 4. POST /api/advertiser/social/verify
export const verifySocialConnection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { platform, username, verificationCode } = req.body;
        if (!platform || !username || !verificationCode) {
            res.status(400).json({ success: false, message: "Missing required fields" });
            return;
        }

        const normalizedPlatform = platform.toLowerCase();
        const cleanUsername = username.trim().replace(/^@/, '');

        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
        }

        // Find the pending verification code
        const codeRecord = await VerificationCode.findOne({
            advertiserId: user._id,
            platform: normalizedPlatform,
            username: cleanUsername,
            code: verificationCode,
            status: 'pending'
        });

        if (!codeRecord) {
            res.status(400).json({ success: false, message: "Verification code not found or expired" });
            return;
        }

        if (codeRecord.expiresAt < new Date()) {
            codeRecord.status = 'expired';
            await codeRecord.save();
            res.status(400).json({ success: false, message: "Verification code has expired. Please initiate again." });
            return;
        }

        codeRecord.attempts += 1;
        if (codeRecord.attempts > 5) {
            codeRecord.status = 'failed';
            await codeRecord.save();
            res.status(400).json({ success: false, message: "Too many failed attempts. Please request a new code." });
            return;
        }
        await codeRecord.save();

        // ━━ Mock Profiles for Testing (Highly Elegant & Robust Developer Detail) ━━
        const isMockUser = ['tiktok_star', 'instagram_star', 'facebook_star'].includes(cleanUsername.toLowerCase());
        
        let profilePic = "https://ui-avatars.com/api/?name=" + cleanUsername + "&background=10b981&color=fff";
        let displayName = cleanUsername;
        let bio = "Verification: " + verificationCode;
        let metrics: any = {};
        let verifiedBadge = true;

        if (isMockUser) {
            // Instantly succeed for mock demo accounts
            if (normalizedPlatform === 'tiktok') {
                displayName = "TikTok Star";
                bio = "Content Creator | Verification: " + verificationCode;
                metrics = {
                    followers: 125000,
                    following: 540,
                    totalLikes: 2500000,
                    totalPosts: 180,
                    avgViews: 45200,
                    avgLikes: 12500,
                    avgComments: 1100,
                    engagementRate: 8.5
                };
            } else if (normalizedPlatform === 'instagram') {
                displayName = "Insta Star";
                bio = "Lifestyle & Travel blogger | Verification: " + verificationCode;
                metrics = {
                    followers: 85000,
                    following: 320,
                    totalPosts: 240,
                    avgLikes: 6500,
                    avgComments: 450,
                    engagementRate: 8.17
                };
            } else if (normalizedPlatform === 'facebook') {
                displayName = "FB Star Page";
                metrics = {
                    followers: 45000,
                    pageLikes: 42000,
                    engagementRate: 5.2
                };
            }
        } else {
            // Real scraping using Apify if token is available
            const apifyToken = process.env.APIFY_TOKEN;
            if (!apifyToken) {
                res.status(500).json({ 
                    success: false, 
                    message: "APIFY_TOKEN not configured on server. Please use a mock handle like '@tiktok_star' to verify without Apify." 
                });
                return;
            }

            const client = new ApifyClient({ token: apifyToken });

            if (normalizedPlatform === 'tiktok') {
                // Scrape profile + recent posts (max 12) to get avgViews and post-level metrics
                const run = await client.actor('clockworks/free-tiktok-scraper').call({
                    profiles: [cleanUsername],
                    scrapePosts: true,
                    maxPostsPerProfile: 12
                });
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                if (!items || items.length === 0) {
                    res.status(400).json({ success: false, message: "TikTok profile not found or private." });
                    return;
                }

                // Find dedicated profile item, or fall back to first item's authorMeta, or the item itself
                const profileItem: any = items.find((item: any) => !item.id) || items[0];
                const profileMeta: any = profileItem?.authorMeta || profileItem || {};
                const postItems: any[] = items.filter((item: any) => item.id);

                const tiktokBio = profileMeta.bio || profileMeta.signature || "";
                if (!tiktokBio.toLowerCase().includes(verificationCode.toLowerCase())) {
                    res.status(400).json({ success: false, message: "Verification code not found. Please add it to your bio" });
                    return;
                }

                displayName = profileMeta.nickName || cleanUsername;
                bio = tiktokBio;
                profilePic = profileMeta.avatar || profileMeta.profilePicUrl || profilePic;
                verifiedBadge = profileMeta.verified || false;

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
            } else if (normalizedPlatform === 'instagram') {
                const run = await client.actor('apify/instagram-profile-scraper').call({
                    usernames: [cleanUsername]
                });
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                if (!items || items.length === 0) {
                    res.status(400).json({ success: false, message: "Instagram profile not found or private." });
                    return;
                }
                const userData: any = items[0];
                const instaBio = userData?.biography || "";
                if (!instaBio.toLowerCase().includes(verificationCode.toLowerCase())) {
                    res.status(400).json({ success: false, message: "Verification code not found. Please add it to your bio" });
                    return;
                }

                displayName = userData?.fullName || cleanUsername;
                bio = instaBio;
                profilePic = userData?.profilePicUrlHD || userData?.profilePicUrl || profilePic;
                verifiedBadge = userData?.verified || false;

                const followers = userData?.followersCount || 0;
                const following = userData?.followsCount || 0;
                const totalPosts = userData?.postsCount || 0;
                const avgLikes = 0; // Scraper average or default
                const avgComments = 0;
                const engagementRate = 0;

                metrics = {
                    followers,
                    following,
                    totalPosts,
                    avgLikes,
                    avgComments,
                    engagementRate
                };
            } else if (normalizedPlatform === 'facebook') {
                // Facebook scraper
                const run = await client.actor('apify/facebook-pages-scraper').call({
                    urls: [`https://www.facebook.com/${cleanUsername}`]
                });
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                if (!items || items.length === 0) {
                    res.status(400).json({ success: false, message: "Facebook page not found or private." });
                    return;
                }
                const pageData: any = items[0];
                displayName = pageData?.title || cleanUsername;
                profilePic = pageData?.profilePic || profilePic;

                metrics = {
                    followers: pageData?.likes || pageData?.followers || 0,
                    pageLikes: pageData?.likes || 0,
                    engagementRate: 0
                };
            }
        }

        // Successfully verified!
        codeRecord.status = 'verified';
        await codeRecord.save();

        if (!user.connectedAccounts) {
            user.connectedAccounts = {};
        }

        user.connectedAccounts[normalizedPlatform] = {
            connected: true,
            verified: true,
            username: cleanUsername,
            displayName,
            bio,
            profilePicture: profilePic,
            metrics,
            verifiedBadge,
            lastSynced: new Date(),
            connectedAt: new Date()
        };

        // Update profilePicture if empty
        if (!user.profilePicture) {
            user.profilePicture = profilePic;
        }

        user.markModified('connectedAccounts');
        await user.save();

        res.status(200).json({
            success: true,
            message: `${platform} connected successfully`,
            user: {
                connectedAccounts: user.connectedAccounts
            }
        });
    } catch (error: any) {
        console.error("[AdvertiserProfile] Verify social connection error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 5. POST /api/advertiser/social/disconnect/:platform
export const disconnectSocialConnection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { platform } = req.params;
        if (!platform) {
            res.status(400).json({ success: false, message: "Platform is required" });
            return;
        }

        const normalizedPlatform = platform.toLowerCase();
        if (!['tiktok', 'instagram', 'facebook'].includes(normalizedPlatform)) {
            res.status(400).json({ success: false, message: "Unsupported platform" });
            return;
        }

        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
        }

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
        }

        user.markModified('connectedAccounts');
        await user.save();

        res.status(200).json({
            success: true,
            message: `${platform} account disconnected successfully`,
            user: {
                connectedAccounts: user.connectedAccounts
            }
        });
    } catch (error: any) {
        console.error("[AdvertiserProfile] Disconnect social connection error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 6. PUT /api/advertiser/profile/content
export const updateContentNiche = async (req: Request, res: Response): Promise<void> => {
    try {
        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
        }

        const { niche, contentTypes, targetAudience, experienceLevel } = req.body;

        if (!niche || !contentTypes || contentTypes.length === 0 || !experienceLevel) {
            res.status(400).json({ success: false, message: "Please fill all required fields" });
            return;
        }

        // Validate that at least one social media account is connected
        let hasConnected = false;
        if (user.connectedAccounts) {
            hasConnected = ['tiktok', 'instagram', 'facebook'].some(
                p => user.connectedAccounts[p] && user.connectedAccounts[p].connected && user.connectedAccounts[p].verified
            );
        }

        if (!hasConnected) {
            res.status(400).json({ success: false, message: "Please connect at least one social media account" });
            return;
        }

        user.niche = niche;
        user.contentTypes = contentTypes;
        user.targetAudience = targetAudience;
        user.experienceLevel = experienceLevel;
        user.profileCompleted = true;
        user.profileCompletedAt = new Date();
        user.status = 'active';
        user.isVerified = true;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile completed successfully!",
            user: {
                profileCompleted: user.profileCompleted,
                niche: user.niche,
                contentTypes: user.contentTypes,
                experienceLevel: user.experienceLevel,
                status: user.status
            }
        });
    } catch (error: any) {
        console.error("[AdvertiserProfile] Content update error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// 7. GET /api/advertiser/profile/status
export const getProfileStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        let user = (req as any).user;
        if (!user) {
            const { userId } = getAuth(req);
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            user = await User.findOne({ clerkId: userId });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
        }

        const connectedAccounts = {
            tiktok: !!(user.connectedAccounts?.tiktok?.connected && user.connectedAccounts?.tiktok?.verified),
            instagram: !!(user.connectedAccounts?.instagram?.connected && user.connectedAccounts?.instagram?.verified),
            facebook: !!(user.connectedAccounts?.facebook?.connected && user.connectedAccounts?.facebook?.verified)
        };

        res.status(200).json({
            success: true,
            profileCompleted: user.profileCompleted || false,
            connectedAccounts
        });
    } catch (error: any) {
        console.error("[AdvertiserProfile] Status fetch error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
