import Opportunity, { IOpportunity } from '../../database/models/Opportunity';
import User from '../../database/models/User';
import mongoose from 'mongoose';

/**
 * Opportunity Service
 * Owner: Backend Developer 2
 * Handles all database interactions for the Opportunity module
 */

/**
 * Create a new opportunity
 * @param data - Opportunity data including businessOwner
 * @returns Created opportunity document
 */
export const createOpportunity = async (data: Partial<IOpportunity>): Promise<IOpportunity> => {
    const opportunity = await Opportunity.create(data);
    return opportunity;
};

/**
 * Get all opportunities (with optional population of businessOwner)
 * @returns List of all opportunities
 */
export const getAllOpportunities = async (): Promise<IOpportunity[]> => {
    const opportunities = await Opportunity.find()
        .populate('businessOwner', 'fullName email')
        .sort({ createdAt: -1 });
    return opportunities;
};

/**
 * Get a single opportunity by ID
 * @param id - Opportunity ID
 * @returns Opportunity document or null
 */
export const getOpportunityById = async (id: string): Promise<IOpportunity | null> => {
    const opportunity = await Opportunity.findById(id)
        .populate('businessOwner', 'name email');
    return opportunity;
};

/**
 * Update an opportunity by ID
 * @param id - Opportunity ID
 * @param data - Fields to update
 * @returns Updated opportunity document or null
 */
export const updateOpportunity = async (id: string, data: Partial<IOpportunity>): Promise<IOpportunity | null> => {
    const opportunity = await Opportunity.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate('businessOwner', 'name email');
    return opportunity;
};

/**
 * Delete an opportunity by ID
 * @param id - Opportunity ID
 * @returns Deleted opportunity document or null
 */
export const deleteOpportunity = async (id: string): Promise<IOpportunity | null> => {
    const opportunity = await Opportunity.findByIdAndDelete(id);
    return opportunity;
};

/**
 * Get all opportunities posted by a specific business owner
 * @param userId - Business Owner user ID
 * @returns List of opportunities by the user
 */
export const getOpportunitiesByUser = async (userId: string): Promise<IOpportunity[]> => {
    let mongoUserId = userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const user = await User.findOne({ clerkId: userId });
        if (!user) return [];
        mongoUserId = (user._id as any).toString();
    }

    const opportunities = await Opportunity.find({ businessOwner: mongoUserId })
        .populate('businessOwner', 'fullName email')
        .sort({ createdAt: -1 });
    return opportunities;
};
