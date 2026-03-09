const collaborationService = require('./collaborations.service');
const { success, error } = require('../../utils/response');

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
exports.startCollaboration = async (req, res) => {
    try {
        const { applicationId } = req.body;
        const collaboration = await collaborationService.startCollaboration(applicationId, req.user._id);

        return success(res, 'Collaboration started successfully', collaboration, 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

/**
 * @desc    Mark collaboration as completed
 * @route   PUT /api/v1/collaborations/:id/complete
 * @access  Private (Business Owner only)
 */
exports.completeCollaboration = async (req, res) => {
    try {
        const collaboration = await collaborationService.completeCollaboration(req.params.id, req.user._id);

        return success(res, 'Collaboration completed successfully', collaboration);
    } catch (err) {
        return error(res, err.message, 403);
    }
};

/**
 * @desc    Get all collaborations related to a user
 * @route   GET /api/v1/collaborations/user/:userId
 * @access  Private
 */
exports.getCollaborationsByUser = async (req, res) => {
    try {
        const collaborations = await collaborationService.getCollaborationsByUser(req.params.userId);

        return success(res, 'Collaborations retrieved successfully', collaborations);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Get collaboration details
 * @route   GET /api/v1/collaborations/:id
 * @access  Private
 */
exports.getCollaborationById = async (req, res) => {
    try {
        const collaboration = await collaborationService.getCollaborationById(req.params.id);

        return success(res, 'Collaboration details retrieved successfully', collaboration);
    } catch (err) {
        return error(res, err.message, 500);
    }
};
