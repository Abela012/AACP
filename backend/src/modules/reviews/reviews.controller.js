const reviewService = require('./reviews.service');
const { success, error } = require('../../utils/response');

/**
 * Review Controller
 * Owner: Backend Developer 2
 * Handles HTTP requests for reviews
 */

/**
 * @desc    Create a review for a collaboration
 * @route   POST /api/v1/reviews
 * @access  Private (Participants only)
 */
exports.createReview = async (req, res) => {
    try {
        const { collaborationId, rating, comment } = req.body;

        const reviewData = {
            collaboration: collaborationId,
            reviewer: req.user._id,
            rating,
            comment
        };

        const review = await reviewService.createReview(reviewData);
        return success(res, 'Review submitted successfully', review, 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

/**
 * @desc    Get all reviews of a user
 * @route   GET /api/v1/reviews/user/:id
 * @access  Public (or Private if needed, usually reviews are public)
 */
exports.getReviewsByUser = async (req, res) => {
    try {
        const reviews = await reviewService.getReviewsByUser(req.params.id);
        return success(res, 'Reviews retrieved successfully', reviews);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Get all reviews for a specific collaboration
 * @route   GET /api/v1/reviews/collaboration/:id
 * @access  Private (Participants only)
 */
exports.getReviewsByCollaboration = async (req, res) => {
    try {
        const reviews = await reviewService.getReviewsByCollaboration(req.params.id);
        return success(res, 'Reviews for collaboration retrieved successfully', reviews);
    } catch (err) {
        return error(res, err.message, 500);
    }
};
