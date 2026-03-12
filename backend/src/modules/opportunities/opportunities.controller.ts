import { Request, Response } from 'express';
import * as opportunityService from './opportunities.service';
import { success, error } from '../../utils/response';

/**
 * Opportunity Controller
 * Owner: Backend Developer 2
 * Handles HTTP request/response for the Opportunity module
 */

/**
 * @desc    Create a new opportunity
 * @route   POST /api/v1/opportunities
 * @access  Private (Business Owner only)
 */
export const createOpportunity = async (req: Request, res: Response) => {
    try {
        const data = {
            ...req.body,
            businessOwner: req.user?._id,
        };

        const opportunity = await opportunityService.createOpportunity(data);
        return success(res, 'Opportunity created successfully', opportunity, 201);
    } catch (err: any) {
        return error(res, err.message || 'Failed to create opportunity', 500);
    }
};

/**
 * @desc    Get all opportunities
 * @route   GET /api/v1/opportunities
 * @access  Public
 */
export const getAllOpportunities = async (req: Request, res: Response) => {
    try {
        const opportunities = await opportunityService.getAllOpportunities();
        return success(res, 'Opportunities retrieved successfully', opportunities);
    } catch (err: any) {
        return error(res, err.message || 'Failed to retrieve opportunities', 500);
    }
};

/**
 * @desc    Get a single opportunity by ID
 * @route   GET /api/v1/opportunities/:id
 * @access  Public
 */
export const getOpportunityById = async (req: Request, res: Response) => {
    try {
        const opportunity = await opportunityService.getOpportunityById(req.params.id as string);

        if (!opportunity) {
            return error(res, 'Opportunity not found', 404);
        }

        return success(res, 'Opportunity retrieved successfully', opportunity);
    } catch (err: any) {
        return error(res, err.message || 'Failed to retrieve opportunity', 500);
    }
};

/**
 * @desc    Update an opportunity
 * @route   PUT /api/v1/opportunities/:id
 * @access  Private (Owner only)
 */
export const updateOpportunity = async (req: Request, res: Response) => {
    try {
        let opportunity = await opportunityService.getOpportunityById(req.params.id as string);

        if (!opportunity) {
            return error(res, 'Opportunity not found', 404);
        }

        // Check ownership — only the business owner who created it can update
        const businessOwnerId = (opportunity.businessOwner as any)._id || opportunity.businessOwner;
        if (businessOwnerId.toString() !== req.user?._id.toString()) {
            return error(res, 'Not authorized to update this opportunity', 403);
        }

        const updatedOpportunity = await opportunityService.updateOpportunity(req.params.id as string, req.body);
        return success(res, 'Opportunity updated successfully', updatedOpportunity);
    } catch (err: any) {
        return error(res, err.message || 'Failed to update opportunity', 500);
    }
};

/**
 * @desc    Delete an opportunity
 * @route   DELETE /api/v1/opportunities/:id
 * @access  Private (Owner only)
 */
export const deleteOpportunity = async (req: Request, res: Response) => {
    try {
        const opportunity = await opportunityService.getOpportunityById(req.params.id as string);

        if (!opportunity) {
            return error(res, 'Opportunity not found', 404);
        }

        // Check ownership — only the business owner who created it can delete
        const businessOwnerId = (opportunity.businessOwner as any)._id || opportunity.businessOwner;
        if (businessOwnerId.toString() !== req.user?._id.toString()) {
            return error(res, 'Not authorized to delete this opportunity', 403);
        }

        await opportunityService.deleteOpportunity(req.params.id as string);
        return success(res, 'Opportunity deleted successfully');
    } catch (err: any) {
        return error(res, err.message || 'Failed to delete opportunity', 500);
    }
};

/**
 * @desc    Get opportunities by a specific business owner
 * @route   GET /api/v1/opportunities/user/:userId
 * @access  Public
 */
export const getOpportunitiesByUser = async (req: Request, res: Response) => {
    try {
        const opportunities = await opportunityService.getOpportunitiesByUser(req.params.userId as string);
        return success(res, 'Opportunities retrieved successfully', opportunities);
    } catch (err: any) {
        return error(res, err.message || 'Failed to retrieve opportunities', 500);
    }
};
