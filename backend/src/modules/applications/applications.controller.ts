import { Request, Response } from 'express';
import * as applicationService from './applications.service';
import { success, error } from '../../utils/response';

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
        const data = {
            opportunity: req.body.opportunityId,
            advertiser: req.user?._id,
            coverLetter: req.body.proposalMessage,
            proposedRate: {
                amount: req.body.proposedPrice,
                currency: req.body.currency || 'ETB',
            },
            proposedTimeline: req.body.proposedTimeline,
        };

        const application = await applicationService.applyToOpportunity(data as any);
        return success(res, 'Application submitted successfully', application, 201);
    } catch (err: any) {
        return error(res, err.message, 400);
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
