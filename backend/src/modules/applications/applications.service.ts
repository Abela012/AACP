import Application, { IApplication } from '../../database/models/Application';
import Opportunity, { IOpportunity } from '../../database/models/Opportunity';

/**
 * Application Service
 * Owner: Backend Developer 2
 * Handles business logic for applications
 */

/**
 * Apply for an opportunity
 * @param data - Application data
 * @returns Created application
 */
export const applyToOpportunity = async (data: Partial<IApplication>): Promise<IApplication> => {
    // Check if opportunity exists
    const opportunity = await Opportunity.findById(data.opportunity) as IOpportunity | null;
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
 * @param id - Application ID
 * @param advertiserId - User ID of the advertiser
 * @returns Removed application
 */
export const withdrawApplication = async (id: string, advertiserId: string): Promise<IApplication> => {
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
 * @param opportunityId - Opportunity ID
 * @returns List of applications
 */
export const getApplicationsByOpportunity = async (opportunityId: string): Promise<IApplication[]> => {
    const applications = await Application.find({ opportunity: opportunityId })
        .populate('advertiser', 'name email profilePicture')
        .sort({ createdAt: -1 });

    return applications;
};

/**
 * Get applications submitted by an advertiser
 * @param advertiserId - Advertiser ID
 * @returns List of applications
 */
export const getApplicationsByAdvertiser = async (advertiserId: string): Promise<IApplication[]> => {
    const applications = await Application.find({ advertiser: advertiserId })
        .populate('opportunity', 'title company budget deadline')
        .sort({ createdAt: -1 });

    return applications;
};

/**
 * Update application status (Accept/Reject)
 * @param id - Application ID
 * @param businessOwnerId - User ID of the business owner
 * @param status - New status (accepted/rejected)
 * @param rejectionReason - Reason for rejection
 * @returns Updated application
 */
export const updateApplicationStatus = async (
    id: string,
    businessOwnerId: string,
    status: 'accepted' | 'rejected',
    rejectionReason?: string
): Promise<IApplication> => {
    // Find application and populate opportunity to check ownership
    const application = await Application.findById(id).populate('opportunity') as (IApplication & { opportunity: IOpportunity }) | null;

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
    application.reviewedAt = new Date();
    application.reviewedBy = businessOwnerId as any;

    await application.save();

    return application;
};
