import Collaboration, { ICollaboration } from '../../database/models/Collaboration';
import Application from '../../database/models/Application';
import { IOpportunity } from '../../database/models/Opportunity';

/**
 * Collaboration Service
 * Owner: Backend Developer 2
 * Handles business logic for collaborations
 */

/**
 * Start a collaboration when an application is accepted
 * @param applicationId - Application ID
 * @param businessOwnerId - User ID of the business owner
 * @returns Created collaboration
 */
export const startCollaboration = async (applicationId: string, businessOwnerId: string): Promise<ICollaboration> => {
    // 1. Find the application and populate opportunity
    const application = await Application.findById(applicationId).populate('opportunity') as (any);

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
        startDate: new Date(),
        status: 'active'
    });

    return collaboration;
};

/**
 * Mark a collaboration as completed
 * @param id - Collaboration ID
 * @param businessOwnerId - User ID of the business owner
 * @returns Updated collaboration
 */
export const completeCollaboration = async (id: string, businessOwnerId: string): Promise<ICollaboration> => {
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
    collaboration.completedDate = new Date();
    await collaboration.save();

    return collaboration;
};

/**
 * Get all collaborations for a user (Business Owner or Advertiser)
 * @param userId - User ID
 * @returns List of collaborations
 */
export const getCollaborationsByUser = async (userId: string): Promise<ICollaboration[]> => {
    const collaborations = await Collaboration.find({
        $or: [
            { businessOwner: userId },
            { advertiser: userId }
        ]
    })
        .populate('opportunity', 'title budget')
        .populate('businessOwner', 'fullName email')
        .populate('advertiser', 'fullName email')
        .sort({ createdAt: -1 });

    return collaborations;
};

/**
 * Get collaboration details by ID
 * @param id - Collaboration ID
 * @returns Collaboration details
 */
export const getCollaborationById = async (id: string): Promise<ICollaboration> => {
    const collaboration = await Collaboration.findById(id)
        .populate('opportunity')
        .populate('application')
        .populate('businessOwner', 'fullName email')
        .populate('advertiser', 'fullName email');

    if (!collaboration) {
        throw new Error('Collaboration not found');
    }

    return collaboration;
};
