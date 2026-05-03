import { Request, Response } from 'express';
import * as collaborationService from './collaborations.service';
import { success, error } from '../../utils/response';

/**
 * Collaboration Controller
 * Owner: Backend Developer 2
 * Handles HTTP requests for collaborations
 */

/**
 * @desc    Create collaboration when an application is accepted
 * @route   POST /api/v1/collaborations/start
 * @access  Private (Business Owner only)
 */
export const startCollaboration = async (req: Request, res: Response) => {
    try {
        const { applicationId } = req.body;
        const collaboration = await collaborationService.startCollaboration(applicationId, req.user?._id?.toString() as string);

        return success(res, 'Collaboration started successfully', collaboration, 201);
    } catch (err: any) {
        return error(res, err.message, 400);
    }
};

/**
 * @desc    Mark collaboration as completed
 * @route   PUT /api/v1/collaborations/:id/complete
 * @access  Private (Business Owner only)
 */
export const completeCollaboration = async (req: Request, res: Response) => {
    try {
        const collaboration = await collaborationService.completeCollaboration(req.params.id as string, req.user?._id?.toString() as string);

        return success(res, 'Collaboration completed successfully', collaboration);
    } catch (err: any) {
        return error(res, err.message, 403);
    }
};

/**
 * @desc    Get all collaborations related to a user
 * @route   GET /api/v1/collaborations/user/:userId
 * @access  Private
 */
export const getCollaborationsByUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId === 'me' ? (req.user?._id?.toString() as string) : req.params.userId;
        const collaborations = await collaborationService.getCollaborationsByUser(userId);

        return success(res, 'Collaborations retrieved successfully', collaborations);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Get collaboration details
 * @route   GET /api/v1/collaborations/:id
 * @access  Private
 */
export const getCollaborationById = async (req: Request, res: Response) => {
    try {
        const collaboration = await collaborationService.getCollaborationById(req.params.id as string);

        return success(res, 'Collaboration details retrieved successfully', collaboration);
    } catch (err: any) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Add a milestone to a collaboration
 * @route   POST /api/v1/collaborations/:id/milestones
 */
export const addMilestone = async (req: Request, res: Response) => {
    try {
        const collaboration = await collaborationService.addMilestone(
            req.params.id as string, 
            req.user?._id?.toString() as string, 
            req.body
        );
        return success(res, 'Milestone added successfully', collaboration);
    } catch (err: any) {
        return error(res, err.message, 400);
    }
};

/**
 * @desc    Submit a deliverable for a milestone
 * @route   POST /api/v1/collaborations/:id/milestones/:milestoneId/submit
 */
export const submitDeliverable = async (req: Request, res: Response) => {
    try {
        const collaboration = await collaborationService.submitDeliverable(
            req.params.id as string, 
            req.user?._id?.toString() as string, 
            req.params.milestoneId as string, 
            req.body
        );
        return success(res, 'Deliverable submitted successfully', collaboration);
    } catch (err: any) {
        return error(res, err.message, 400);
    }
};

/**
 * @desc    Review a submission
 * @route   PUT /api/v1/collaborations/:id/milestones/:milestoneId/submissions/:submissionId/review
 */
export const reviewSubmission = async (req: Request, res: Response) => {
    try {
        const collaboration = await collaborationService.reviewSubmission(
            req.params.id as string, 
            req.user?._id?.toString() as string, 
            req.params.milestoneId as string, 
            req.params.submissionId as string, 
            req.body
        );
        return success(res, 'Submission reviewed successfully', collaboration);
    } catch (err: any) {
        return error(res, err.message, 400);
    }
};
