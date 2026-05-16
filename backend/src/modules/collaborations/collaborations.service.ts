import mongoose from 'mongoose';
import Collaboration, { ICollaboration } from '../../database/models/Collaboration';
import Application from '../../database/models/Application';
import User from '../../database/models/User';
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
 * @param userId - User ID (MongoDB ID or Clerk ID)
 * @returns List of collaborations
 */
export const getCollaborationsByUser = async (userId: string): Promise<ICollaboration[]> => {
    let mongoId = userId;

    // Resolve Clerk ID to MongoDB ID if necessary
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const user = await User.findOne({ clerkId: userId });
        if (user) {
            mongoId = user._id.toString();
        } else {
            // If it's not a valid ObjectId and not a found Clerk ID, return empty
            return [];
        }
    }

    const collaborations = await Collaboration.find({
        $or: [
            { businessOwner: mongoId },
            { advertiser: mongoId }
        ]
    })
        .populate('opportunity', 'title budget')
        .populate('businessOwner', 'firstName lastName email username')
        .populate('advertiser', 'firstName lastName email username')
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
/**
 * Add a new task to a collaboration
 */
export const addTask = async (id: string, taskData: any, userId: string): Promise<ICollaboration> => {
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) throw new Error('Collaboration not found');

    // Only business owner can create tasks
    if (collaboration.businessOwner.toString() !== userId) {
        throw new Error('Not authorized to create tasks');
    }

    collaboration.tasks.push({
        ...taskData,
        status: 'pending',
        assignedTo: collaboration.advertiser
    });

    await collaboration.save();
    return collaboration;
};

/**
 * Update task status
 */
export const updateTaskStatus = async (id: string, taskId: string, status: string, userId: string): Promise<ICollaboration> => {
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) throw new Error('Collaboration not found');

    const task = (collaboration.tasks as any).id(taskId);
    if (!task) throw new Error('Task not found');

    // Business owner can approve, Advertiser can start/submit
    if (status === 'approved' && collaboration.businessOwner.toString() !== userId) {
        throw new Error('Only business owner can approve tasks');
    }

    task.status = status as any;
    await collaboration.save();
    return collaboration;
};

/**
 * Add a deliverable (milestone submission)
 */
export const addDeliverable = async (id: string, deliverableData: any, userId: string): Promise<ICollaboration> => {
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) throw new Error('Collaboration not found');

    if (collaboration.advertiser.toString() !== userId) {
        throw new Error('Only the advertiser can submit deliverables');
    }

    // For now, we add it to the first milestone or create a generic one
    if (collaboration.milestones.length === 0) {
        collaboration.milestones.push({
            title: 'Project Deliverables',
            status: 'in_progress',
            submissions: []
        } as any);
    }

    collaboration.milestones[0].submissions.push({
        ...deliverableData,
        submittedAt: new Date(),
        status: 'pending'
    });

    await collaboration.save();
    return collaboration;
};

/**
 * Update deliverable status (Approve/Reject/Revision)
 */
export const updateDeliverableStatus = async (id: string, submissionId: string, status: string, feedback: string, userId: string): Promise<ICollaboration> => {
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) throw new Error('Collaboration not found');

    if (collaboration.businessOwner.toString() !== userId) {
        throw new Error('Only the business owner can review deliverables');
    }

    // Find submission in milestones
    let found = false;
    for (const milestone of collaboration.milestones) {
        const submission = (milestone.submissions as any).id(submissionId);
        if (submission) {
            submission.status = status as any;
            if (feedback) submission.feedbackFromOwner = feedback;
            submission.reviewedAt = new Date();
            found = true;
            break;
        }
    }

    if (!found) throw new Error('Submission not found');

    await collaboration.save();
    return collaboration;
};
