import User, { IUser } from '../../database/models/User';
import Opportunity, { IOpportunity } from '../../database/models/Opportunity';
import logger from '../../utils/logger';

// ─── Profile Data Helper ─────────────────────────────────────────────────────

const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const cleaned = val.toUpperCase().replace(/[^0-9.KMB]/g, '');
        let multiplier = 1;
        if (cleaned.endsWith('K')) multiplier = 1000;
        else if (cleaned.endsWith('M')) multiplier = 1000000;
        else if (cleaned.endsWith('B')) multiplier = 1000000000;
        const num = parseFloat(cleaned.replace(/[KMB]/g, ''));
        return isNaN(num) ? 0 : num * multiplier;
    }
    return 0;
};

const extractMetrics = (profileData: any) => {
    if (!profileData) return { followers: 0, engagementRate: 0, niche: '', niches: [] as string[], platforms: [] as string[] };

    let bestFollowers = 0;
    let bestEngagement = 0;
    let niches: string[] = [];
    const platforms: string[] = [];

    // 1. Check Nested Platforms
    if (profileData.tiktok) {
        const t = profileData.tiktok;
        const f = parseNum(t.followers);
        const e = parseNum(t.engagementRate);
        if (f > 0) platforms.push('tiktok');
        if (f > bestFollowers) bestFollowers = f;
        if (e > bestEngagement) bestEngagement = e;
        if (t.niche) {
            if (typeof t.niche === 'string') niches.push(t.niche);
            else if (Array.isArray(t.niche)) niches.push(...t.niche);
            else if (typeof t.niche === 'object') niches.push(...Object.values(t.niche).filter(Boolean) as string[]);
        }
    }

    if (profileData.instagram) {
        const ig = profileData.instagram;
        const f = parseNum(ig.followers);
        const e = parseNum(ig.engagementRate);
        if (f > 0) platforms.push('instagram');
        if (f > bestFollowers) bestFollowers = f;
        if (e > bestEngagement) bestEngagement = e;
        if (ig.niche) {
            if (typeof ig.niche === 'string') niches.push(ig.niche);
            else if (Array.isArray(ig.niche)) niches.push(...ig.niche);
            else if (typeof ig.niche === 'object') niches.push(...Object.values(ig.niche).filter(Boolean) as string[]);
        }
    }

    // 2. Flat field fallback (legacy or business profiles)
    if (bestFollowers === 0 && profileData.followers) bestFollowers = parseNum(profileData.followers);
    if (bestEngagement === 0 && profileData.engagementRate) bestEngagement = parseNum(profileData.engagementRate);
    
    // Niche fallbacks
    if (niches.length === 0) {
        if (profileData.category) niches.push(profileData.category);
        if (profileData.industry) niches.push(profileData.industry);
        if (Array.isArray(profileData.targetAudienceTags)) niches.push(...profileData.targetAudienceTags);
    }

    niches = [...new Set(niches.filter(Boolean))];

    return {
        followers: bestFollowers,
        engagementRate: bestEngagement,
        niche: niches[0] || '',
        niches,
        platforms,
    };
};

/**
 * Recommendation Service
 * 
 * Generates personalized recommendations based on user profile data:
 *   - Business Owners → Recommended Advertisers (users with role 'advertiser')
 *   - Advertisers → Recommended Opportunities (open opportunities matching their profile)
 * 
 * Scoring is based on category, engagement rate, followers, budget, and location.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RecommendationItem {
    targetId: string;
    type: 'advertiser' | 'opportunity';
    score: number;
    name: string;
    category?: string;
    location?: string;
    /** Extra context for the frontend to display */
    meta?: Record<string, any>;
}

export interface RecommendationResult {
    recommendations: RecommendationItem[];
    userRole: string;
    generatedAt: Date;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Calculate a match score (0–100) between a user's preferences and a target.
 * 
 * Scoring breakdown:
 *   - Category match:      30 pts
 *   - Engagement rate:     25 pts
 *   - Follower count:      20 pts
 *   - Budget fit:          15 pts
 *   - Location match:      10 pts
 */
const calculateMatchScore = (
    userProfile: Record<string, any>,
    userLocation: string | undefined,
    target: Record<string, any>,
    targetLocation: string | undefined
): number => {
    let score = 0;

    // ── Category/Niche Match (30 pts) ──
    const userCategory = (userProfile.category || userProfile.niche || userProfile.industry || '').toLowerCase();
    const userTags = Array.isArray(userProfile.targetAudienceTags) ? userProfile.targetAudienceTags.map((t: string) => t.toLowerCase()) : [];
    
    const targetNiches = (target.niches || (target.category ? [target.category] : [])).map((n: string) => n.toLowerCase());
    
    if (userCategory && targetNiches.length > 0) {
        const hasMatch = targetNiches.some((n: string) => n === userCategory);
        if (hasMatch) {
            score += 30;
        } else if (userTags.length > 0) {
            // Partial match via tags
            const hasTagMatch = targetNiches.some((n: string) => userTags.includes(n));
            if (hasTagMatch) score += 20;
        }
    }

    // ── Engagement Rate (25 pts) ──
    const targetEngagement = target.engagementRate ?? target.profileData?.engagementRate ?? 0;
    const userMinEngagement = userProfile.minEngagement ?? 0;
    if (targetEngagement && userMinEngagement) {
        if (targetEngagement >= userMinEngagement) {
            score += 25;
        } else {
            score += (targetEngagement / userMinEngagement) * 25;
        }
    } else if (targetEngagement > 0) {
        // If no min requirement, give partial credit for having engagement data
        score += Math.min(targetEngagement * 5, 15);
    }

    // ── Follower Count (20 pts) ──
    const targetFollowers = target.followers ?? target.profileData?.followers ?? 0;
    if (targetFollowers > 0) {
        score += Math.min((targetFollowers / 100000) * 20, 20);
    }

    // ── Budget Fit (15 pts) ──
    const userBudget = userProfile.budget ?? 0;
    const targetPrice = target.pricePerPost ?? target.profileData?.pricePerPost ?? target.budget?.amount ?? 0;
    if (userBudget && targetPrice) {
        if (targetPrice <= userBudget) {
            score += 15;
        } else {
            score += (userBudget / targetPrice) * 15;
        }
    }

    // ── Location Match (10 pts) ──
    if (userLocation && targetLocation) {
        if (userLocation.toLowerCase() === targetLocation.toLowerCase()) {
            score += 10;
        }
    }

    return Math.round(score);
};

// ─── Core Logic ──────────────────────────────────────────────────────────────

/**
 * Generate recommendations for a user based on their role and profile data.
 * @param userId - MongoDB ObjectId of the user
 * @returns Top 10 scored recommendations
 */
export const getRecommendationsForUser = async (userId: string): Promise<RecommendationResult> => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const userProfile = user.profileData || {};
    const results: RecommendationItem[] = [];

    // ── CASE 1: Business Owner → Recommend Advertisers ──
    if (user.role === 'business_owner') {
        const advertisers = await User.find({
            role: 'advertiser',
            status: { $in: ['active', 'approved'] },
            _id: { $ne: user._id },
        }).lean();

        for (const adv of advertisers) {
            const advProfile = adv.profileData || {};
            const advMetrics = extractMetrics(advProfile);

            const score = calculateMatchScore(
                userProfile,
                user.location,
                { ...advProfile, niches: advMetrics.niches, followers: advMetrics.followers, engagementRate: advMetrics.engagementRate },
                adv.location
            );

            results.push({
                targetId: (adv._id as any).toString(),
                type: 'advertiser',
                score,
                name: `${adv.firstName} ${adv.lastName}`.trim() || adv.username,
                category: advMetrics.niche,
                location: adv.location,
                meta: {
                    profilePicture: adv.profilePicture,
                    followers: advMetrics.followers,
                    engagementRate: advMetrics.engagementRate,
                    username: adv.username,
                    niches: advMetrics.niches,
                    bio: advProfile.bio || '',
                    platforms: advMetrics.platforms,
                    averageRating: adv.averageRating || 0,
                    totalReviews: adv.totalReviews || 0,
                },
            });
        }

        logger.info(`[Recommendations] Generated ${results.length} advertiser recommendations for business_owner ${userId}`);
    }
    // ── CASE 2: Advertiser → Recommend Opportunities ──
    else if (user.role === 'advertiser') {
        const opportunities = await Opportunity.find({
            status: 'open',
        })
            .populate('businessOwner', 'firstName lastName profilePicture username')
            .lean();

        for (const opp of opportunities) {
            const score = calculateMatchScore(
                userProfile,
                user.location,
                {
                    category: opp.category,
                    budget: opp.budget,
                    followers: opp.requirements?.minFollowers,
                },
                opp.requirements?.location
            );

            const owner = opp.businessOwner as any;
            results.push({
                targetId: (opp._id as any).toString(),
                type: 'opportunity',
                score,
                name: opp.title,
                category: opp.category,
                location: opp.requirements?.location,
                meta: {
                    budget: opp.budget,
                    platforms: opp.platforms,
                    deadline: opp.deadline,
                    tags: opp.tags,
                    businessOwner: owner ? {
                        name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
                        profilePicture: owner.profilePicture,
                        username: owner.username,
                    } : undefined,
                },
            });
        }

        logger.info(`[Recommendations] Generated ${results.length} opportunity recommendations for advertiser ${userId}`);
    } else {
        logger.warn(`[Recommendations] Unsupported role "${user.role}" for user ${userId}`);
    }

    // Sort by score descending and return top 10
    results.sort((a, b) => b.score - a.score);

    return {
        recommendations: results.slice(0, 100),
        userRole: user.role,
        generatedAt: new Date(),
    };
};
