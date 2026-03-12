import Review, { IReview } from '../../database/models/Review';
import Collaboration from '../../database/models/Collaboration';

/**
 * Review Service
 * Owner: Backend Developer 2
 * Handles business logic for reviews
 */

/**
 * Create a new review for a collaboration
 * @param data - Review data including collaboration, reviewer, rating, etc.
 * @returns Created review document
 */
export const createReview = async (data: Partial<IReview>): Promise<IReview> => {
    // 1. Find the collaboration
    const collaboration = await Collaboration.findById(data.collaboration);
    if (!collaboration) {
        throw new Error('Collaboration not found');
    }

    // 2. Verify collaboration completion status
    if (collaboration.status !== 'completed') {
        throw new Error('Reviews can only be created after the collaboration is completed');
    }

    // 3. Identify reviewee and reviewerRole
    const isBusinessOwner = collaboration.businessOwner.toString() === data.reviewer?.toString();
    const isAdvertiser = collaboration.advertiser.toString() === data.reviewer?.toString();

    if (!isBusinessOwner && !isAdvertiser) {
        throw new Error('You are not authorized to review this collaboration');
    }

    data.reviewee = isBusinessOwner ? collaboration.advertiser : collaboration.businessOwner;
    data.reviewerRole = isBusinessOwner ? 'business_owner' : 'advertiser';

    // 4. Create the review
    // The Mongoose unique index on { collaboration, reviewer } will catch duplicate reviews
    try {
        const review = await Review.create(data);
        return review;
    } catch (err: any) {
        if (err.code === 11000) {
            throw new Error('You have already reviewed this collaboration');
        }
        throw err;
    }
};

/**
 * Get all reviews received by a user (where they are the reviewee)
 * @param userId - User ID
 * @returns List of reviews
 */
export const getReviewsByUser = async (userId: string): Promise<IReview[]> => {
    const reviews = await Review.find({ reviewee: userId })
        .populate('reviewer', 'name email profilePicture')
        .populate('collaboration', 'opportunity')
        .sort({ createdAt: -1 });

    return reviews;
};

/**
 * Get all reviews for a specific collaboration
 * @param collaborationId - Collaboration ID
 * @returns List of reviews
 */
export const getReviewsByCollaboration = async (collaborationId: string): Promise<IReview[]> => {
    const reviews = await Review.find({ collaboration: collaborationId })
        .populate('reviewer', 'name email')
        .populate('reviewee', 'name email');

    return reviews;
};
