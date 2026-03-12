import { body } from 'express-validator';
import Application from '../database/models/Application';

/**
 * Validation rules for applying to an Opportunity
 */
export const applyToOpportunityValidator = [
    body('opportunityId')
        .notEmpty().withMessage('Opportunity ID is required')
        .isMongoId().withMessage('Invalid Opportunity ID'),

    body('proposalMessage')
        .notEmpty().withMessage('Proposal message is required')
        .isLength({ min: 50 }).withMessage('Proposal message should be at least 50 characters long to be competitive'),

    body('proposedPrice')
        .notEmpty().withMessage('Proposed price is required')
        .isNumeric().withMessage('Proposed price must be a number')
        .custom((value: number) => value > 0).withMessage('Proposed price must be positive'),

    // Custom check for duplicate application
    body().custom(async (value: any, { req }: any) => {
        const existingApplication = await Application.findOne({
            opportunity: req.body.opportunityId,
            advertiser: req.user?._id
        });
        if (existingApplication) {
            throw new Error('You have already applied for this opportunity');
        }
        return true;
    })
];
