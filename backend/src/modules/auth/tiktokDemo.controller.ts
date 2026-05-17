import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ApifyClient } from 'apify-client';
import bcrypt from 'bcryptjs';
import VerificationCode from '../../database/models/VerificationCode';
import User from '../../database/models/User';
import logger from '../../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_tiktok_demo';

// Helper to generate code
const generateCode = () => {
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    return `AACP-${randomStr}`;
};

// POST /api/auth/tiktok/demo/initiate
export const initiateTikTokVerification = async (req: Request, res: Response) => {
    try {
        let { tiktokUsername, mode, password } = req.body;
        if (!tiktokUsername) return res.status(400).json({ success: false, message: 'TikTok username is required' });

        tiktokUsername = tiktokUsername.trim().replace(/^@/, '');

        // Check if user already exists
        const existingUser = await User.findOne({ username: tiktokUsername });

        // If Mode is signin (Login page)
        if (mode === 'signin') {
            if (existingUser) {
                if (!password) {
                    return res.status(400).json({ success: false, message: 'Password is required' });
                }
                if (!existingUser.password) {
                    return res.status(400).json({
                        success: false,
                        message: "This account was created without a password. Please register again to set a password."
                    });
                }
                const isMatch = await bcrypt.compare(password, existingUser.password);
                if (!isMatch) {
                    return res.status(400).json({ success: false, message: 'Invalid password for this TikTok account.' });
                }

                // Generate JWT immediately!
                const token = jwt.sign(
                    { userId: existingUser._id, username: existingUser.username, role: existingUser.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
                return res.status(200).json({
                    success: true,
                    loggedInDirectly: true,
                    token,
                    user: existingUser
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "This TikTok username is not registered yet. Please click 'Create account' below to sign up first!"
                });
            }
        }

        // If Mode is signup (Register page)
        if (mode === 'signup') {
            if (existingUser) {
                if (tiktokUsername.toLowerCase() === 'khaby.lame') {
                    await User.deleteOne({ username: 'khaby.lame' });
                    logger.info('[TikTokAuth] Deleted existing demo user khaby.lame to allow repeated register testing');
                } else {
                    return res.status(400).json({
                        success: false,
                        message: "This TikTok username is already registered. Please go to the Log In page to sign in!"
                    });
                }
            }
            if (!password || password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required and must be at least 6 characters long."
                });
            }
        }

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const verificationRecord = new VerificationCode({
            tiktokUsername,
            code,
            password: hashedPassword,
            expiresAt
        });
        await verificationRecord.save();

        return res.status(200).json({
            success: true,
            verificationCode: code,
            expiresAt,
            isExistingUser: !!existingUser,
            sessionId: verificationRecord._id
        });
    } catch (error: any) {
        logger.error(`[TikTokAuth] Initiate error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// POST /api/auth/tiktok/demo/verify
export const verifyTikTokCode = async (req: Request, res: Response) => {
    try {
        let { tiktokUsername, verificationCode } = req.body;
        if (!tiktokUsername || !verificationCode) return res.status(400).json({ success: false, message: 'Username and code required' });

        tiktokUsername = tiktokUsername.trim().replace(/^@/, '');
        
        const record = await VerificationCode.findOne({ 
            tiktokUsername, 
            code: verificationCode,
            status: 'pending' 
        });

        if (!record) {
            return res.status(400).json({ success: false, message: "We couldn't find the verification code or it has expired." });
        }

        if (record.expiresAt < new Date()) {
            record.status = 'expired';
            await record.save();
            return res.status(400).json({ success: false, message: 'Verification code expired. Please request a new code.' });
        }

        if (record.attempts >= 5) {
            record.status = 'failed';
            await record.save();
            return res.status(400).json({ success: false, message: 'Too many failed attempts. Please wait 5 minutes.' });
        }

        record.attempts += 1;
        await record.save();

        let userData: any;

        if (tiktokUsername.toLowerCase() === 'khaby.lame') {
            // Bypass Apify and bio check for demo account
            userData = {
                authorMeta: {
                    id: '6892374829384920384',
                    nickName: 'Khaby Lame',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                    bio: 'It is simple. Learn from Khaby!',
                    fans: 162000000,
                    following: 78,
                    heart: 2400000000,
                    video: 382,
                    verified: true
                },
                avgViews: 12500000,
                avgLikes: 1800000,
                avgComments: 12000
            };
            logger.info('[TikTokAuth] Bypassing Apify and bio check for demo user khaby.lame');
        } else {
            // Check Apify
            const apifyToken = process.env.APIFY_TOKEN;
            if (!apifyToken) throw new Error('APIFY_TOKEN not configured');
            
            const client = new ApifyClient({ token: apifyToken });
            
            const run = await client.actor('clockworks/free-tiktok-scraper').call({
                profiles: [tiktokUsername],
                scrapePosts: false, // We only need profile data
                scrapeComments: false
            });
            
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (!items || items.length === 0) {
                return res.status(400).json({ success: false, message: 'TikTok profile not found or private.' });
            }

            userData = items[0] as any;
            console.log('[TikTokAuth] Raw Apify Data keys:', Object.keys(userData));
            console.log('[TikTokAuth] Raw Apify authorMeta:', JSON.stringify(userData?.authorMeta || {}));
            
            // TikTok bio can be under 'bio', 'signature', etc. depending on the scraper actor structure
            const possibleBios = [
                userData?.authorMeta?.bio,
                userData?.authorMeta?.signature,
                userData?.bio,
                userData?.signature,
                userData?.user?.signature,
                userData?.user?.bio
            ].filter(Boolean);

            console.log('[TikTokAuth] Possible bios found:', possibleBios);

            // Normalize code and bios for case-insensitive matching
            const targetCode = verificationCode.toLowerCase().trim();
            const bioHasCode = possibleBios.some(bio => bio.toLowerCase().includes(targetCode));

            if (!bioHasCode) {
                return res.status(400).json({ success: false, message: "We couldn't find the verification code. Make sure you pasted it into your TikTok bio." });
            }
        }

        // Verified! Update status
        record.status = 'verified';
        await record.save();

        let user = await User.findOne({ username: tiktokUsername });
        let isNewUser = false;

        const followers = userData?.authorMeta?.fans || userData?.followers || 0;
        const following = userData?.authorMeta?.following || 0;
        const totalLikes = userData?.authorMeta?.heart || userData?.likes || 0;
        const totalPosts = userData?.authorMeta?.video || userData?.videos || 0;

        // Extract average metrics
        const avgViews = userData?.avgViews || 0;
        const avgLikes = userData?.avgLikes || 0;
        const avgComments = userData?.avgComments || 0;
        const engagementRate = followers > 0 ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2)) : 0;

        const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        if (!user) {
            isNewUser = true;
            // Create new user using scraped profile
            user = new User({
                username: tiktokUsername,
                password: record.password, // Save hashed password
                email: `${tiktokUsername}@tiktok-demo.aacp`, // Dummy email
                firstName: userData?.authorMeta?.nickName || tiktokUsername,
                role: 'advertiser',
                status: 'active',
                profilePicture: userData?.authorMeta?.avatar || '',
                bio: userData?.authorMeta?.bio || '',
                tiktokUsername,
                tiktokUserId: userData?.authorMeta?.id || userData?.id || `tt_${Date.now()}`,
                tiktokProfile: {
                    displayName: userData?.authorMeta?.nickName || tiktokUsername,
                    bio: userData?.authorMeta?.bio || '',
                    profilePicture: userData?.authorMeta?.avatar || '',
                    verifiedBadge: userData?.authorMeta?.verified || false,
                    metrics: {
                        followers,
                        following,
                        totalLikes,
                        totalPosts,
                        avgViews,
                        avgLikes,
                        avgComments,
                        engagementRate
                    },
                    lastSynced: new Date()
                },
                verifiedAt: new Date(),
                lastVerifiedAt: new Date(),
                nextVerificationRequiredAt: next30Days,
                lastLogin: new Date(),
                socialProfiles: [{
                    platform: 'TikTok',
                    username: tiktokUsername,
                    profileLink: `https://www.tiktok.com/@${tiktokUsername}`,
                    verified: userData?.authorMeta?.verified || false,
                    followers,
                    following,
                    tiktokAnalytics: {
                        followers,
                        following,
                        totalLikes,
                        avgViews,
                        avgLikes,
                        avgComments,
                        avgShares: 0
                    }
                }]
            });
            await user.save();
        } else {
            user.lastLogin = new Date();
            user.tiktokUsername = tiktokUsername;
            user.tiktokProfile = {
                displayName: userData?.authorMeta?.nickName || user.tiktokProfile?.displayName || tiktokUsername,
                bio: userData?.authorMeta?.bio || user.tiktokProfile?.bio || '',
                profilePicture: userData?.authorMeta?.avatar || user.tiktokProfile?.profilePicture || '',
                verifiedBadge: userData?.authorMeta?.verified || false,
                metrics: {
                    followers,
                    following,
                    totalLikes,
                    totalPosts,
                    avgViews,
                    avgLikes,
                    avgComments,
                    engagementRate
                },
                lastSynced: new Date()
            };
            user.lastVerifiedAt = new Date();
            user.nextVerificationRequiredAt = next30Days;
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            isNewUser,
            token,
            user
        });

    } catch (error: any) {
        logger.error(`[TikTokAuth] Verify error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Error verifying TikTok profile' });
    }
};

// POST /api/auth/tiktok/demo/resend-code
export const resendTikTokCode = async (req: Request, res: Response) => {
    try {
        let { tiktokUsername } = req.body;
        if (!tiktokUsername) return res.status(400).json({ success: false, message: 'TikTok username required' });
        tiktokUsername = tiktokUsername.trim().replace(/^@/, '');

        const existingRecord = await VerificationCode.findOne({
            tiktokUsername,
            status: { $in: ['pending', 'failed'] }
        }).sort({ createdAt: -1 });

        if (existingRecord) {
            existingRecord.status = 'failed'; // expire the old one
            await existingRecord.save();
        }

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const verificationRecord = new VerificationCode({
            tiktokUsername,
            code,
            expiresAt
        });
        await verificationRecord.save();

        return res.status(200).json({
            success: true,
            verificationCode: code,
            expiresAt,
            sessionId: verificationRecord._id
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Error generating code' });
    }
};
