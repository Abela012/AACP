import { Request, Response } from 'express';
import * as applicationService from './applications.service';
import * as walletService from '../wallet/wallet.service';
import { success, error } from '../../utils/response';
import Opportunity from '../../database/models/Opportunity';
import User from '../../database/models/User';
import * as chatService from '../chat/chat.service';

/**
 * Application Controller
 * Owner: Backend Developer 2
 * Handles HTTP requests for applications
 */

/**
 * @desc    Advertiser applies for an opportunity
 * @route   POST /api/v1/applications
 * @access  Private
 */
export const applyToOpportunity = async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        if (!user || !user._id) {
            return error(res, 'User information not found. Please sync your profile.', 401);
        }

        const advertiserId = user._id;
        const advertiserName = `${user.firstName} ${user.lastName}`;

        // 1. Check if advertiser has enough coins (50 coins per application)
        let balanceInfo;
        try {
            balanceInfo = await walletService.getBalance(advertiserId.toString());
            console.log(`[Apply] User ${advertiserId} balance: ${balanceInfo.availableBalance} available / ${balanceInfo.balance} total`);
        } catch (balanceErr: any) {
            console.error(`[Apply] Balance check failed for ${advertiserId}:`, balanceErr.message);
            return error(res, `Balance check failed: ${balanceErr.message}`, 400);
        }

        if (balanceInfo.availableBalance < 50) {
            console.log(`[Apply] Insufficient coins: ${balanceInfo.availableBalance} < 50`);
            return error(res, `Insufficient coins. You have ${balanceInfo.availableBalance} coins but need 50 to apply.`, 400);
        }

        // Align with frontend payload (opportunity, coverLetter)
        const data = {
            opportunity: req.body.opportunity || req.body.opportunityId,
            advertiser: advertiserId,
            coverLetter: req.body.coverLetter || req.body.proposalMessage,
            proposedRate: {
                amount: req.body.proposedPrice || 0,
                currency: req.body.currency || 'ETB',
            },
            proposedTimeline: req.body.proposedTimeline || 'Not specified',
        };

        if (!data.opportunity) {
            return error(res, 'Opportunity ID is required', 400);
        }

        console.log(`[Apply] Submitting application: opportunity=${data.opportunity}, advertiser=${advertiserId}`);

        // 2. Create the application
        const application = await applicationService.applyToOpportunity(data as any);
        console.log(`[Apply] Application created: ${application._id}`);

        // 3. Deduct 50 coins from Advertiser
        await walletService.debitCoins({
            userId: advertiserId.toString(),
            amount: 50,
            description: `Applied to opportunity: ${data.opportunity}`,
            referenceType: 'application',
            referenceId: (application._id as any).toString()
        });

        // --- Automated Messaging Logic (Notify Business Owner) ---
        try {
            // Fetch the opportunity to get the business owner's Clerk ID for the room
            const opportunity = await Opportunity.findById(data.opportunity).populate('businessOwner');
            if (opportunity && opportunity.businessOwner) {
                const businessOwner = opportunity.businessOwner as any;
                const businessOwnerClerkId = businessOwner.clerkId;
                const advertiserClerkId = user.clerkId;

                if (businessOwnerClerkId && advertiserClerkId) {
                    const messageText = `👋 New Application for "${opportunity.title}"!\n\n` +
                        `👤 From: ${advertiserName}\n` +
                        `💰 Proposed Rate: ${data.proposedRate.amount} ${data.proposedRate.currency}\n` +
                        `📅 Timeline: ${data.proposedTimeline}\n\n` +
                        `📝 Cover Letter Preview: ${data.coverLetter?.slice(0, 150)}${data.coverLetter && data.coverLetter.length > 150 ? '...' : ''}`;

                    // Persist to database so it shows in history
                    let dbMessage;
                    let conversationId = '';
                    try {
                        const conversation = await chatService.getOrCreateConversation([
                            advertiserId.toString(), 
                            (businessOwner._id as any).toString()
                        ]);
                        conversationId = (conversation._id as any).toString();
                        dbMessage = await chatService.saveMessage({
                            conversationId,
                            senderId: advertiserId.toString(),
                            text: messageText
                        });
                    } catch (dbErr) {
                        console.error('Failed to persist automated message:', dbErr);
                    }

                    const io = (req.app as any).io;
                    if (io && conversationId) {
                        const message = {
                            _id: dbMessage ? dbMessage._id.toString() : `auto_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                            roomId: conversationId,
                            text: messageText,
                            sender: {
                                _id: advertiserId.toString(),
                                firstName: user.firstName,
                                lastName: user.lastName,
                                profilePicture: user.profilePicture,
                            },
                            createdAt: dbMessage ? dbMessage.createdAt.toISOString() : new Date().toISOString(),
                        };
                        
                        io.to(conversationId).emit('message:receive', message);
                        
                        io.to(`user:${(businessOwner._id as any).toString()}`).emit('notification:new', {
                            type: 'application',
                            title: 'New Application Received',
                            message: `${advertiserName} applied for "${opportunity.title}"`,
                            data: {
                                opportunityId: opportunity._id,
                                advertiserId: advertiserId,
                                conversationId
                            },
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            }
        } catch (msgErr) {
            console.error('Failed to send automated application message:', msgErr);
        }

        return success(res, 'Application submitted successfully', application, 201);
    } catch (err: any) {
        console.error('Application Error:', err);
        return error(res, err.message || 'Failed to submit application', 400);
    }
};

/**
 * @desc    Withdraw application
 * @route   DELETE /api/v1/applications/:id
 * @access  Private
 */
export const withdrawApplication = async (req: Request, res: Response) => {
    try {
        await applicationService.withdrawApplication(req.params.id as string, req.user?._id?.toString() as string);
        return success(res, 'Application withdrawn successfully');
    } catch (err: any) {
        return error(res, err.message, 403);
    }
};

/**
 * @desc    Get all applications for a specific opportunity
 * @route   GET /api/v1/applications/opportunity/:id
 * @access  Private
 */
export const getApplicationsByOpportunity = async (req: Request, res: Response) => {
    try {
        const applications = await applicationService.getApplicationsByOpportunity(req.params.id as string);
        return success(res, 'Applications retrieved successfully', applications);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Get applications submitted by an advertiser
 * @route   GET /api/v1/applications/user/:id
 * @access  Private
 */
export const getApplicationsByAdvertiser = async (req: Request, res: Response) => {
    try {
        const applications = await applicationService.getApplicationsByAdvertiser(req.params.id as string);
        return success(res, 'User applications retrieved successfully', applications);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Get all applications for all opportunities owned by the logged-in business owner
 * @route   GET /api/v1/applications/business-owner
 * @access  Private
 */
export const getApplicationsForBusinessOwner = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id?.toString() || req.user?.clerkId;
        if (!userId) {
            return error(res, 'User not authenticated', 401);
        }
        const applications = await applicationService.getApplicationsForBusinessOwner(userId);
        return success(res, 'Business owner applications retrieved successfully', applications);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Business Owner accepts application
 * @route   PUT /api/v1/applications/:id/accept
 * @access  Private
 */
export const acceptApplication = async (req: Request, res: Response) => {
    try {
        const application = await applicationService.updateApplicationStatus(
            req.params.id as string,
            req.user?._id?.toString() as string,
            'accepted'
        );
        return success(res, 'Application accepted successfully', application);
    } catch (err: any) {
        return error(res, err.message, 403);
    }
};

/**
 * @desc    Business Owner rejects application
 * @route   PUT /api/v1/applications/:id/reject
 * @access  Private
 */
export const rejectApplication = async (req: Request, res: Response) => {
    try {
        const { rejectionReason } = req.body;
        const application = await applicationService.updateApplicationStatus(
            req.params.id as string,
            req.user?._id?.toString() as string,
            'rejected',
            rejectionReason
        );
        return success(res, 'Application rejected successfully', application);
    } catch (err: any) {
        return error(res, err.message, 403);
    }
};
