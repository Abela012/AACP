const opportunityService = require('./opportunities.service');
const { success, error } = require('../../utils/response');

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
exports.createOpportunity = async (req, res) => {
    try {
        const data = {
            ...req.body,
            businessOwner: req.user._id,
        };

        const opportunity = await opportunityService.createOpportunity(data);
        return success(res, 'Opportunity created successfully', opportunity, 201);
    } catch (err) {
        return error(res, err.message || 'Failed to create opportunity', 500);
    }
};

/**
 * @desc    Get all opportunities
 * @route   GET /api/v1/opportunities
 * @access  Public
 */
exports.getAllOpportunities = async (req, res) => {
    try {
        const opportunities = await opportunityService.getAllOpportunities();
        return success(res, 'Opportunities retrieved successfully', opportunities);
    } catch (err) {
        return error(res, err.message || 'Failed to retrieve opportunities', 500);
    }
};

/**
 * @desc    Get a single opportunity by ID
 * @route   GET /api/v1/opportunities/:id
 * @access  Public
 */
exports.getOpportunityById = async (req, res) => {
    try {
        const opportunity = await opportunityService.getOpportunityById(req.params.id);

        if (!opportunity) {
            return error(res, 'Opportunity not found', 404);
        }

        return success(res, 'Opportunity retrieved successfully', opportunity);
    } catch (err) {
        return error(res, err.message || 'Failed to retrieve opportunity', 500);
    }
};

/**
 * @desc    Update an opportunity
 * @route   PUT /api/v1/opportunities/:id
 * @access  Private (Owner only)
 */
exports.updateOpportunity = async (req, res) => {
    try {
        let opportunity = await opportunityService.getOpportunityById(req.params.id);

        if (!opportunity) {
            return error(res, 'Opportunity not found', 404);
        }

        // Check ownership — only the business owner who created it can update
        if (opportunity.businessOwner._id.toString() !== req.user._id.toString()) {
            return error(res, 'Not authorized to update this opportunity', 403);
        }

        opportunity = await opportunityService.updateOpportunity(req.params.id, req.body);
        return success(res, 'Opportunity updated successfully', opportunity);
    } catch (err) {
        return error(res, err.message || 'Failed to update opportunity', 500);
    }
};

/**
 * @desc    Delete an opportunity
 * @route   DELETE /api/v1/opportunities/:id
 * @access  Private (Owner only)
 */
exports.deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await opportunityService.getOpportunityById(req.params.id);

        if (!opportunity) {
            return error(res, 'Opportunity not found', 404);
        }

        // Check ownership — only the business owner who created it can delete
        if (opportunity.businessOwner._id.toString() !== req.user._id.toString()) {
            return error(res, 'Not authorized to delete this opportunity', 403);
        }

        await opportunityService.deleteOpportunity(req.params.id);
        return success(res, 'Opportunity deleted successfully');
    } catch (err) {
        return error(res, err.message || 'Failed to delete opportunity', 500);
    }
};

/**
 * @desc    Get opportunities by a specific business owner
 * @route   GET /api/v1/opportunities/user/:userId
 * @access  Public
 */
exports.getOpportunitiesByUser = async (req, res) => {
    try {
        const opportunities = await opportunityService.getOpportunitiesByUser(req.params.userId);
        return success(res, 'Opportunities retrieved successfully', opportunities);
    } catch (err) {
        return error(res, err.message || 'Failed to retrieve opportunities', 500);
    }
};
