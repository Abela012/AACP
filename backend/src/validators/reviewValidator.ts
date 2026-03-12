import { body } from 'express-validator';
import Collaboration from '../database/models/Collaboration';
import Review from '../database/models/Review';

/**
 * Validation rules for creating a Review
 */
export const createReviewValidator = [
    body('collaborationId')
        .notEmpty().withMessage('Collaboration ID is required')
        .isMongoId().withMessage('Invalid Collaboration ID')
        .custom(async (value: string, { req }: any) => {
            const collaboration = await Collaboration.findById(value);
            if (!collaboration) {
                throw new Error('Collaboration not found');
            }
            if (collaboration.status !== 'completed') {
                throw new Error('Reviews can only be created after the collaboration is completed');
            }

            // Check if user is part of the collaboration
            const isParticipant =
                collaboration.businessOwner.toString() === req.user?._id?.toString() ||
                collaboration.advertiser.toString() === req.user?._id?.toString();

            if (!isParticipant) {
                throw new Error('You are not authorized to review this collaboration');
            }

            // Check if already reviewed
            const existingReview = await Review.findOne({
                collaboration: value,
                reviewer: req.user?._id
            });
            if (existingReview) {
                throw new Error('You have already reviewed this collaboration');
            }

            return true;
        }),

    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),

    body('comment')
        .notEmpty().withMessage('Comment is required')
        .isLength({ min: 5 }).withMessage('Comment must be at least 5 characters long')
];
