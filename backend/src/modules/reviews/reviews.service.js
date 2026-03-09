const Review = require('../../database/models/Review');
const Collaboration = require('../../database/models/Collaboration');

/**
 * Review Service
 * Owner: Backend Developer 2
 * Handles business logic for reviews
 */

/**
 * Create a new review for a collaboration
 * @param {Object} data - Review data including collaboration, reviewer, rating, etc.
 * @returns {Promise<Object>} Created review document
 */
exports.createReview = async (data) => {
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
    const isBusinessOwner = collaboration.businessOwner.toString() === data.reviewer.toString();
    const isAdvertiser = collaboration.advertiser.toString() === data.reviewer.toString();

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
    } catch (err) {
        if (err.code === 11000) {
            throw new Error('You have already reviewed this collaboration');
        }
        throw err;
    }
};

/**
 * Get all reviews received by a user (where they are the reviewee)
 * @param {String} userId - User ID
 * @returns {Promise<Array>} List of reviews
 */
exports.getReviewsByUser = async (userId) => {
    const reviews = await Review.find({ reviewee: userId })
        .populate('reviewer', 'name email profilePicture')
        .populate('collaboration', 'opportunity')
        .sort({ createdAt: -1 });

    return reviews;
};

/**
 * Get all reviews for a specific collaboration
 * @param {String} collaborationId - Collaboration ID
 * @returns {Promise<Array>} List of reviews
 */
exports.getReviewsByCollaboration = async (collaborationId) => {
    const reviews = await Review.find({ collaboration: collaborationId })
        .populate('reviewer', 'name email')
        .populate('reviewee', 'name email');

    return reviews;
};
