import { Request, Response } from 'express';
import User from '../../database/models/User';
import { getAuth } from '@clerk/express';

export const getConnections = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
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
    const { platform } = req.params;
    // Mocking auth URL for now
    res.status(200).json({
        success: true,
        data: { authUrl: `https://${platform}.com/oauth/authorize` }
    });
};

export const connectWithToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const { platform } = req.params;
        const { access_token } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const newProfile: any = {
            platform: platform === 'tiktok' ? 'TikTok' : 'YouTube', // Match enum
            username: (user.username || 'user') + '_' + platform,
            isConnected: true,
            status: 'approved',
            verified: false,
            followers: 0,
            following: 0,
            engagementRate: 0,
            niches: [],
            contentStyles: [],
            createdAt: new Date().toISOString()
        };

        // Update or add social profile
        const existingIndex = user.socialProfiles.findIndex(p => p.platform === platform);
        if (existingIndex > -1) {
            user.socialProfiles[existingIndex] = newProfile;
        } else {
            user.socialProfiles.push(newProfile);
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: newProfile
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const disconnectPlatform = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const { platform } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        user.socialProfiles = user.socialProfiles.filter(p => p.platform !== platform);
        await user.save();

        res.status(200).json({
            success: true,
            message: `${platform} disconnected`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
