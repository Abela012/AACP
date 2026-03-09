const Application = require('../../database/models/Application');
const Opportunity = require('../../database/models/Opportunity');

/**
 * Application Service
 * Owner: Backend Developer 2
 * Handles business logic for applications
 */

/**
 * Apply for an opportunity
 * @param {Object} data - Application data
 * @returns {Promise<Object>} Created application
 */
exports.applyToOpportunity = async (data) => {
    // Check if opportunity exists
    const opportunity = await Opportunity.findById(data.opportunity);
    if (!opportunity) {
        throw new Error('Opportunity not found');
    }

    // Check if opportunity is open
    if (opportunity.status !== 'open') {
        throw new Error('Opportunity is not open for applications');
    }

    // Check for duplicate application (Advertiser cannot apply twice)
    const existingApplication = await Application.findOne({
        opportunity: data.opportunity,
        advertiser: data.advertiser,
    });

    if (existingApplication) {
        throw new Error('You have already applied for this opportunity');
    }

    const application = await Application.create(data);
    return application;
};

/**
 * Withdraw an application
 * @param {String} id - Application ID
 * @param {String} advertiserId - User ID of the advertiser
 * @returns {Promise<Object>} Removed application
 */
exports.withdrawApplication = async (id, advertiserId) => {
    const application = await Application.findOne({ _id: id, advertiser: advertiserId });

    if (!application) {
        throw new Error('Application not found or you are not authorized to withdraw it');
    }

    if (application.status !== 'pending') {
        throw new Error('You can only withdraw pending applications');
    }

    // Instead of deleting, we update status to withdrawn
    application.status = 'withdrawn';
    await application.save();

    return application;
};

/**
 * Get all applications for a specific opportunity
 * @param {String} opportunityId - Opportunity ID
 * @returns {Promise<Array>} List of applications
 */
exports.getApplicationsByOpportunity = async (opportunityId) => {
    const applications = await Application.find({ opportunity: opportunityId })
        .populate('advertiser', 'name email profilePicture')
        .sort({ createdAt: -1 });

    return applications;
};

/**
 * Get applications submitted by an advertiser
 * @param {String} advertiserId - Advertiser ID
 * @returns {Promise<Array>} List of applications
 */
exports.getApplicationsByAdvertiser = async (advertiserId) => {
    const applications = await Application.find({ advertiser: advertiserId })
        .populate('opportunity', 'title company budget deadline')
        .sort({ createdAt: -1 });

    return applications;
};

/**
 * Update application status (Accept/Reject)
 * @param {String} id - Application ID
 * @param {String} businessOwnerId - User ID of the business owner
 * @param {String} status - New status (accepted/rejected)
 * @param {String} [rejectionReason] - Reason for rejection
 * @returns {Promise<Object>} Updated application
 */
exports.updateApplicationStatus = async (id, businessOwnerId, status, rejectionReason) => {
    // Find application and populate opportunity to check ownership
    const application = await Application.findById(id).populate('opportunity');

    if (!application) {
        throw new Error('Application not found');
    }

    // Verify that the person updating is the owner of the opportunity
    if (application.opportunity.businessOwner.toString() !== businessOwnerId.toString()) {
        throw new Error('Not authorized to update this application');
    }

    application.status = status;
    if (rejectionReason) {
        application.rejectionReason = rejectionReason;
    }
    application.reviewedAt = Date.now();
    application.reviewedBy = businessOwnerId;

    await application.save();

    return application;
};
