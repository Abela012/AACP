const Collaboration = require('../../database/models/Collaboration');
const Application = require('../../database/models/Application');

/**
 * Collaboration Service
 * Owner: Backend Developer 2
 * Handles business logic for collaborations
 */

/**
 * Start a collaboration when an application is accepted
 * @param {String} applicationId - Application ID
 * @param {String} businessOwnerId - User ID of the business owner
 * @returns {Promise<Object>} Created collaboration
 */
exports.startCollaboration = async (applicationId, businessOwnerId) => {
    // 1. Find the application and populate opportunity
    const application = await Application.findById(applicationId).populate('opportunity');

    if (!application) {
        throw new Error('Application not found');
    }

    // 2. Verify that the application is accepted
    if (application.status !== 'accepted') {
        throw new Error('Only accepted applications can start collaborations');
    }

    // 3. Verify that the business owner is the owner of the opportunity
    if (application.opportunity.businessOwner.toString() !== businessOwnerId.toString()) {
        throw new Error('Not authorized to start this collaboration');
    }

    // 4. Check if collaboration already exists for this application
    const existingCollaboration = await Collaboration.findOne({ application: applicationId });
    if (existingCollaboration) {
        throw new Error('Collaboration already started for this application');
    }

    // 5. Create the collaboration
    const collaboration = await Collaboration.create({
        opportunity: application.opportunity._id,
        application: application._id,
        businessOwner: businessOwnerId,
        advertiser: application.advertiser,
        agreedBudget: application.proposedRate,
        startDate: Date.now(),
        status: 'active'
    });

    return collaboration;
};

/**
 * Mark a collaboration as completed
 * @param {String} id - Collaboration ID
 * @param {String} businessOwnerId - User ID of the business owner
 * @returns {Promise<Object>} Updated collaboration
 */
exports.completeCollaboration = async (id, businessOwnerId) => {
    const collaboration = await Collaboration.findById(id);

    if (!collaboration) {
        throw new Error('Collaboration not found');
    }

    // Only business owner can mark as complete (or advertiser if specified, but usually owner)
    if (collaboration.businessOwner.toString() !== businessOwnerId.toString()) {
        throw new Error('Not authorized to complete this collaboration');
    }

    if (collaboration.status === 'completed') {
        throw new Error('Collaboration is already completed');
    }

    collaboration.status = 'completed';
    collaboration.completedDate = Date.now();
    await collaboration.save();

    return collaboration;
};

/**
 * Get all collaborations for a user (Business Owner or Advertiser)
 * @param {String} userId - User ID
 * @returns {Promise<Array>} List of collaborations
 */
exports.getCollaborationsByUser = async (userId) => {
    const collaborations = await Collaboration.find({
        $or: [
            { businessOwner: userId },
            { advertiser: userId }
        ]
    })
        .populate('opportunity', 'title budget')
        .populate('businessOwner', 'name email')
        .populate('advertiser', 'name email')
        .sort({ createdAt: -1 });

    return collaborations;
};

/**
 * Get collaboration details by ID
 * @param {String} id - Collaboration ID
 * @returns {Promise<Object>} Collaboration details
 */
exports.getCollaborationById = async (id) => {
    const collaboration = await Collaboration.findById(id)
        .populate('opportunity')
        .populate('application')
        .populate('businessOwner', 'name email')
        .populate('advertiser', 'name email');

    if (!collaboration) {
        throw new Error('Collaboration not found');
    }

    return collaboration;
};
