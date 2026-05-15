import { Request, Response } from 'express';
import User from '../../database/models/User';
import SocialConnection from '../../database/models/SocialConnection';
import FacebookAnalyticsConnection from '../../database/models/FacebookAnalyticsConnection';
import DeletionRequest from '../../database/models/DeletionRequest';
import crypto from 'crypto';
import logger from '../../utils/logger';

/**
 * Handle Facebook User Data Deletion Request
 * This satisfies Facebook App Review requirements.
 * Accepts: email or facebookUserId
 */
export const handleDataDeletion = async (req: Request, res: Response) => {
    try {
        const { email, facebookUserId } = req.body;

        if (!email && !facebookUserId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide either email or Facebook user ID.'
            });
        }

        // Find user by email or facebookUserId
        let user: any = null;
        if (email) {
            user = await User.findOne({ email });
        }

        // If not found by email or if facebookUserId was provided, try finding by facebook connection
        let socialConnection: any = null;
        let analyticsConnection: any = null;

        if (facebookUserId) {
            socialConnection = await SocialConnection.findOne({ platformUserId: facebookUserId, platform: 'facebook' });
            analyticsConnection = await FacebookAnalyticsConnection.findOne({ facebookUserId });
        }

        if (!user) {
            if (socialConnection) {
                user = await User.findById(socialConnection.userId);
            } else if (analyticsConnection) {
                user = await User.findById(analyticsConnection.userId);
            }
        }

        if (!user) {
            // If user is not found, we still return a 200 OK for Facebook compliance 
            // but we won't have a record to delete.
            // Alternatively, we can return 404 if we want to be strict.
            // But for privacy, 200 with a generic message is sometimes preferred.
            // Here we'll return 404 since it's an internal-ish API as well.
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Create a deletion request record
        const requestId = crypto.randomBytes(8).toString('hex');
        const deletionRequest = await DeletionRequest.create({
            requestId,
            userId: user._id,
            platform: 'facebook',
            platformUserId: facebookUserId || 'internal-request',
            status: 'processing',
            requestTimestamp: new Date(),
        });

        // Perform deletion (remove tokens and metadata)
        // 1. Remove SocialConnection (tokens)
        await SocialConnection.deleteMany({ userId: user._id, platform: 'facebook' });
        
        // 2. Remove FacebookAnalyticsConnection (tokens and insights)
        await FacebookAnalyticsConnection.deleteMany({ userId: user._id });

        // 3. Clear Facebook related metadata from User model if any
        if (user.profileData) {
            let modified = false;
            if (user.profileData.facebook) {
                user.profileData.facebook = undefined;
                modified = true;
            }
            // If there's any other FB related data, clear it here
            if (modified) {
                user.markModified('profileData');
                await user.save();
            }
        }

        // Update deletion request status
        deletionRequest.status = 'completed';
        deletionRequest.completionTimestamp = new Date();
        await deletionRequest.save();

        logger.info(`Facebook data deletion completed for user ${user._id} (Request ID: ${requestId})`);

        // Return structured JSON success response as required by Facebook
        const statusUrl = `${process.env.FRONTEND_URL || 'https://aacp.onrender.com'}/data-deletion`;
        
        return res.status(200).json({
            url: statusUrl,
            confirmation_code: requestId
        });

    } catch (error: any) {
        logger.error(`Error handling Facebook data deletion: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the deletion request.'
        });
    }
};
