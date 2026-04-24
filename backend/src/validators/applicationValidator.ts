import { body } from 'express-validator';
import Application from '../database/models/Application';

/**
 * Validation rules for applying to an Opportunity
 */
export const applyToOpportunityValidator = [
    body('opportunity').optional().isMongoId().withMessage('Invalid Opportunity ID'),
    body('opportunityId').optional().isMongoId().withMessage('Invalid Opportunity ID'),

    body('coverLetter')
        .optional()
        .isLength({ min: 10 }).withMessage('Cover letter should be at least 10 characters long to be competitive'),
        
    body('proposalMessage')
        .optional()
        .isLength({ min: 10 }).withMessage('Proposal message should be at least 10 characters long to be competitive'),

    // Custom check for duplicate application
    body().custom(async (value: any, { req }: any) => {
        const oppId = req.body.opportunity || req.body.opportunityId;
        if (!oppId) throw new Error('Opportunity ID is required');
        
        const existingApplication = await Application.findOne({
            opportunity: oppId,
            advertiser: req.user?._id
        });
        if (existingApplication) {
            throw new Error('You have already applied for this opportunity');
        }
        return true;
    })
];
