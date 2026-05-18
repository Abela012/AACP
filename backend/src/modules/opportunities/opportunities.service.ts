import Opportunity, { IOpportunity } from '../../database/models/Opportunity';
import User from '../../database/models/User';
import mongoose from 'mongoose';

/**
 * Opportunity Service
 * Owner: Backend Developer 2
 * Handles all database interactions for the Opportunity module
 */

const isMongoObjectId = (id: string): boolean => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    try {
        return String(new mongoose.Types.ObjectId(id)) === id;
    } catch {
        return false;
    }
};

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
    try {
        console.log('[OpportunityService] Fetching all opportunities...');
        const opportunities = await Opportunity.find()
            .populate('businessOwner', 'firstName lastName email profilePicture')
            .sort({ createdAt: -1 })
            .maxTimeMS(15000);
        console.log(`[OpportunityService] Found ${opportunities.length} opportunities`);
        return opportunities;
    } catch (err: any) {
        console.error(`[OpportunityService] Error in getAllOpportunities: ${err.message}`);
        throw err;
    }
};

/**
 * Get a single opportunity by ID
 * @param id - Opportunity ID
 * @returns Opportunity document or null
 */
export const getOpportunityById = async (id: string): Promise<IOpportunity | null> => {
    try {
        console.log(`[OpportunityService] Fetching opportunity ${id}...`);
        const opportunity = await Opportunity.findById(id)
            .populate('businessOwner', 'firstName lastName email profilePicture')
            .maxTimeMS(10000);
        return opportunity;
    } catch (err: any) {
        console.error(`[OpportunityService] Error in getOpportunityById: ${err.message}`);
        throw err;
    }
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
    }).populate('businessOwner', 'firstName lastName email profilePicture');
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
 * @param userId - MongoDB user _id or Clerk user id
 * @returns List of opportunities by the user
 */
export const getOpportunitiesByUser = async (userId: string): Promise<IOpportunity[]> => {
    try {
        let ownerId: mongoose.Types.ObjectId;

        if (isMongoObjectId(userId)) {
            ownerId = new mongoose.Types.ObjectId(userId);
        } else {
            const user = await User.findOne({ clerkId: userId }).select('_id').lean().maxTimeMS(8000);
            if (!user?._id) {
                console.warn(`[OpportunityService] No user for clerkId/id: ${userId}`);
                return [];
            }
            ownerId = user._id as mongoose.Types.ObjectId;
        }

        const opportunities = await Opportunity.find({ businessOwner: ownerId })
            .populate('businessOwner', 'firstName lastName email profilePicture')
            .sort({ createdAt: -1 })
            .maxTimeMS(15000)
            .lean();

        return opportunities as unknown as IOpportunity[];
    } catch (err: any) {
        console.error(`[OpportunityService] getOpportunitiesByUser failed for ${userId}:`, err.message);
        throw err;
    }
};
