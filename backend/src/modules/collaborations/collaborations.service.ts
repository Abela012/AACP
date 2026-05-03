import mongoose from 'mongoose';
import Collaboration, { ICollaboration } from '../../database/models/Collaboration';
import Application from '../../database/models/Application';
import { IOpportunity } from '../../database/models/Opportunity';
import User from '../../database/models/User';

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
    let mongoUserId = userId;

    // Handle Clerk ID if provided instead of MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return []; // No user found, return empty collaborations
        }
        mongoUserId = (user._id as any).toString();
    }

    const collaborations = await Collaboration.find({
        $or: [
            { businessOwner: mongoUserId },
            { advertiser: mongoUserId }
        ]
    })
        .populate('opportunity', 'title budget')
        .populate('businessOwner', 'fullName email firstName lastName profilePicture')
        .populate('advertiser', 'fullName email firstName lastName profilePicture')
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
        .populate('businessOwner', 'fullName email firstName lastName profilePicture')
        .populate('advertiser', 'fullName email firstName lastName profilePicture');

    if (!collaboration) {
        throw new Error('Collaboration not found');
    }

    return collaboration;
};

/**
 * Add a milestone to a collaboration
 */
export const addMilestone = async (
    id: string, 
    businessOwnerId: string, 
    milestoneData: { title: string; description?: string; dueDate?: Date }
): Promise<ICollaboration> => {
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) throw new Error('Collaboration not found');
    
    if (collaboration.businessOwner.toString() !== businessOwnerId.toString()) {
        throw new Error('Not authorized to add milestones');
    }

    collaboration.milestones.push(milestoneData as any);
    await collaboration.save();
    return collaboration;
};

/**
 * Submit a deliverable for a milestone
 */
export const submitDeliverable = async (
    id: string, 
    advertiserId: string, 
    milestoneId: string, 
    submissionData: { fileUrl: string; fileName?: string; notes?: string }
): Promise<ICollaboration> => {
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) throw new Error('Collaboration not found');

    if (collaboration.advertiser.toString() !== advertiserId.toString()) {
        throw new Error('Not authorized to submit deliverables');
    }

    const milestone = (collaboration.milestones as any).id(milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    milestone.submissions.push({
        ...submissionData,
        submittedAt: new Date(),
        status: 'pending'
    } as any);

    milestone.status = 'submitted';
    await collaboration.save();
    return collaboration;
};

/**
 * Review a submission (Approve/Reject)
 */
export const reviewSubmission = async (
    id: string, 
    businessOwnerId: string, 
    milestoneId: string, 
    submissionId: string, 
    reviewData: { status: 'approved' | 'revision_requested' | 'rejected'; feedback?: string }
): Promise<ICollaboration> => {
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) throw new Error('Collaboration not found');

    if (collaboration.businessOwner.toString() !== businessOwnerId.toString()) {
        throw new Error('Not authorized to review submissions');
    }

    const milestone = (collaboration.milestones as any).id(milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const submission = (milestone.submissions as any).id(submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.status = reviewData.status;
    submission.feedbackFromOwner = reviewData.feedback;
    submission.reviewedAt = new Date();

    // Update milestone status based on submission status
    if (reviewData.status === 'approved') {
        milestone.status = 'approved';
        
        // Update overall progress
        const approvedCount = collaboration.milestones.filter(m => m.status === 'approved').length;
        collaboration.overallProgress = Math.round((approvedCount / collaboration.milestones.length) * 100);
    } else {
        milestone.status = 'rejected';
    }

    await collaboration.save();
    return collaboration;
};
