const Opportunity = require('../../database/models/Opportunity');

/**
 * Opportunity Service
 * Owner: Backend Developer 2
 * Handles all database interactions for the Opportunity module
 */

/**
 * Create a new opportunity
 * @param {Object} data - Opportunity data including businessOwner
 * @returns {Promise<Object>} Created opportunity document
 */
exports.createOpportunity = async (data) => {
    const opportunity = await Opportunity.create(data);
    return opportunity;
};

/**
 * Get all opportunities (with optional population of businessOwner)
 * @returns {Promise<Array>} List of all opportunities
 */
exports.getAllOpportunities = async () => {
    const opportunities = await Opportunity.find()
        .populate('businessOwner', 'name email')
        .sort({ createdAt: -1 });
    return opportunities;
};

/**
 * Get a single opportunity by ID
 * @param {String} id - Opportunity ID
 * @returns {Promise<Object|null>} Opportunity document or null
 */
exports.getOpportunityById = async (id) => {
    const opportunity = await Opportunity.findById(id)
        .populate('businessOwner', 'name email');
    return opportunity;
};

/**
 * Update an opportunity by ID
 * @param {String} id - Opportunity ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object|null>} Updated opportunity document or null
 */
exports.updateOpportunity = async (id, data) => {
    const opportunity = await Opportunity.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate('businessOwner', 'name email');
    return opportunity;
};

/**
 * Delete an opportunity by ID
 * @param {String} id - Opportunity ID
 * @returns {Promise<Object|null>} Deleted opportunity document or null
 */
exports.deleteOpportunity = async (id) => {
    const opportunity = await Opportunity.findByIdAndDelete(id);
    return opportunity;
};

/**
 * Get all opportunities posted by a specific business owner
 * @param {String} userId - Business Owner user ID
 * @returns {Promise<Array>} List of opportunities by the user
 */
exports.getOpportunitiesByUser = async (userId) => {
    const opportunities = await Opportunity.find({ businessOwner: userId })
        .populate('businessOwner', 'name email')
        .sort({ createdAt: -1 });
    return opportunities;
};
