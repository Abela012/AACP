const applicationService = require('./applications.service');
const { success, error } = require('../../utils/response');

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
exports.applyToOpportunity = async (req, res) => {
    try {
        const data = {
            opportunity: req.body.opportunityId,
            advertiser: req.user._id,
            coverLetter: req.body.proposalMessage,
            proposedRate: {
                amount: req.body.proposedPrice,
                currency: req.body.currency || 'ETB',
            },
            proposedTimeline: req.body.proposedTimeline,
        };

        const application = await applicationService.applyToOpportunity(data);
        return success(res, 'Application submitted successfully', application, 201);
    } catch (err) {
        return error(res, err.message, 400);
    }
};

/**
 * @desc    Withdraw application
 * @route   DELETE /api/v1/applications/:id
 * @access  Private
 */
exports.withdrawApplication = async (req, res) => {
    try {
        await applicationService.withdrawApplication(req.params.id, req.user._id);
        return success(res, 'Application withdrawn successfully');
    } catch (err) {
        return error(res, err.message, 403);
    }
};

/**
 * @desc    Get all applications for a specific opportunity
 * @route   GET /api/v1/applications/opportunity/:id
 * @access  Private
 */
exports.getApplicationsByOpportunity = async (req, res) => {
    try {
        const applications = await applicationService.getApplicationsByOpportunity(req.params.id);
        return success(res, 'Applications retrieved successfully', applications);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Get applications submitted by an advertiser
 * @route   GET /api/v1/applications/user/:id
 * @access  Private
 */
exports.getApplicationsByAdvertiser = async (req, res) => {
    try {
        const applications = await applicationService.getApplicationsByAdvertiser(req.params.id);
        return success(res, 'User applications retrieved successfully', applications);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

/**
 * @desc    Business Owner accepts application
 * @route   PUT /api/v1/applications/:id/accept
 * @access  Private
 */
exports.acceptApplication = async (req, res) => {
    try {
        const application = await applicationService.updateApplicationStatus(
            req.params.id,
            req.user._id,
            'accepted'
        );
        return success(res, 'Application accepted successfully', application);
    } catch (err) {
        return error(res, err.message, 403);
    }
};

/**
 * @desc    Business Owner rejects application
 * @route   PUT /api/v1/applications/:id/reject
 * @access  Private
 */
exports.rejectApplication = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const application = await applicationService.updateApplicationStatus(
            req.params.id,
            req.user._id,
            'rejected',
            rejectionReason
        );
        return success(res, 'Application rejected successfully', application);
    } catch (err) {
        return error(res, err.message, 403);
    }
};
