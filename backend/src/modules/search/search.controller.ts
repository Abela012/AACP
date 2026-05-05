import { Request, Response } from 'express';
import Opportunity from '../../database/models/Opportunity';
import User from '../../database/models/User';
import { success, error } from '../../utils/response';

/**
 * @desc    Global platform search — returns campaigns and creators matching a query
 * @route   GET /api/v1/search?q=&limit=5
 * @access  Private
 */
export const globalSearch = async (req: Request, res: Response) => {
    try {
        const q = (req.query.q as string || '').trim();
        const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);

        if (!q || q.length < 2) {
            return success(res, 'Search results', { campaigns: [], creators: [] });
        }

        const regex = new RegExp(q, 'i');

        // Search campaigns (opportunities) by title, description, category, tags
        const campaigns = await Opportunity.find({
            status: { $in: ['open', 'draft', 'in_review'] },
            $or: [
                { title: regex },
                { description: regex },
                { category: regex },
                { tags: regex },
                { platforms: regex },
            ],
        })
            .select('_id title category status budget platforms tags createdAt')
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        // Search creators (advertisers) by name, username, bio, category
        const creators = await User.find({
            role: 'advertiser',
            status: { $in: ['active', 'approved'] },
            $or: [
                { firstName: regex },
                { lastName: regex },
                { username: regex },
                { 'profileData.bio': regex },
                { 'profileData.niche': regex },
                { 'profileData.category': regex },
                { location: regex },
            ],
        })
            .select('_id clerkId firstName lastName username profilePicture location averageRating totalReviews profileData.niche profileData.bio')
            .limit(limit)
            .lean();

        return success(res, 'Search results', {
            campaigns: campaigns.map((c: any) => ({
                _id: c._id,
                title: c.title,
                category: c.category,
                status: c.status,
                budget: c.budget,
                platforms: c.platforms,
            })),
            creators: creators.map((u: any) => ({
                _id: u._id,
                clerkId: u.clerkId,
                name: `${u.firstName} ${u.lastName}`.trim() || u.username,
                username: u.username,
                avatar: u.profilePicture,
                location: u.location,
                niche: u.profileData?.niche,
                rating: u.averageRating || 0,
            })),
        });
    } catch (err: any) {
        return error(res, err.message || 'Search failed', 500);
    }
};
