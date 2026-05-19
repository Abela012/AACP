import User from '../../database/models/User';
import Opportunity from '../../database/models/Opportunity';
import Application from '../../database/models/Application';
import BusinessOwner from '../../database/models/businessOwner';
import AdvertiserProfile from '../../database/models/AdvertiserProfile';
import logger from '../../utils/logger';
import { extractMetrics, normalizeEngagementRate } from '../../utils/metrics';

/**
 * Recommendation Service
 * 
 * Generates personalized recommendations based on user profile data:
 *   - Business Owners → Recommended Advertisers (users with role 'advertiser')
 *   - Advertisers → Recommended Opportunities (open opportunities matching their profile)
 * 
 * Scoring is based on niche, platform, engagement rate, followers, budget, and location.
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

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizeToList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).toLowerCase().trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
        return value.split(',').map((item) => item.toLowerCase().trim()).filter(Boolean);
    }
    return [];
};

/** Jaccard overlap 0–1 between two string lists. */
const listOverlapRatio = (a: string[], b: string[]): number => {
    if (a.length === 0 || b.length === 0) return 0;
    const setA = new Set(a);
    const setB = new Set(b);
    let intersection = 0;
    for (const item of setB) {
        if (setA.has(item)) intersection++;
    }
    const union = new Set([...a, ...b]).size;
    return union > 0 ? intersection / union : 0;
};

/**
 * Engagement points (0–30): scales with actual ER; never uses a flat cap that ties similar creators.
 */
const scoreEngagement = (targetER: number, userMinER: number): number => {
    const er = normalizeEngagementRate(targetER);
    if (er <= 0) return 0;

    const maxPts = 30;
    let pts = (er / 100) * maxPts;

    const minNorm = normalizeEngagementRate(userMinER);
    if (minNorm > 0) {
        if (er < minNorm) {
            pts = (er / minNorm) * (maxPts * 0.55);
        } else {
            const headroom = Math.max(100 - minNorm, 1);
            const excess = er - minNorm;
            pts = maxPts * 0.55 + (excess / headroom) * (maxPts * 0.45);
        }
    }

    return clamp(pts, 0, maxPts);
};

/** Follower reach points (0–25): log-scaled from ~1k to ~10M. */
const scoreFollowers = (followers: number): number => {
    if (followers <= 0) return 0;
    const logMin = 3;
    const logMax = 7;
    const logF = Math.log10(followers + 1);
    return clamp(((logF - logMin) / (logMax - logMin)) * 25, 0, 25);
};

/**
 * Raw match score (0–100) between business preferences and a creator/opportunity.
 * Uses continuous partial credit so different metrics produce different totals.
 */
const calculateMatchScore = (
    userProfile: Record<string, any>,
    userLocation: string | undefined,
    target: Record<string, any>,
    targetLocation: string | undefined
): number => {
    let score = 0;

    const userPreferredNiches = normalizeToList(
        userProfile.preferredNiches ||
        userProfile.niches ||
        userProfile.targetAudienceTags ||
        userProfile.category ||
        userProfile.niche ||
        userProfile.industry
    );
    const userTags = normalizeToList(userProfile.targetAudienceTags);
    const targetNiches = normalizeToList(target.niches || (target.category ? [target.category] : []));

    // Niche overlap (0–30) — partial credit via Jaccard, not all-or-nothing
    const nicheOverlap = listOverlapRatio(userPreferredNiches, targetNiches);
    if (nicheOverlap > 0) {
        score += nicheOverlap * 30;
    } else if (userTags.length > 0 && targetNiches.length > 0) {
        score += listOverlapRatio(userTags, targetNiches) * 20;
    }

    const userPreferredPlatforms = normalizeToList(
        userProfile.preferredPlatform || userProfile.selectedPlatforms || userProfile.platform || userProfile.platforms
    );
    const targetPlatforms = normalizeToList(target.platforms || target.platform || target.primaryPlatform);
    if (userPreferredPlatforms.length > 0 && targetPlatforms.length > 0) {
        score += listOverlapRatio(userPreferredPlatforms, targetPlatforms) * 20;
    }

    const targetEngagement = target.engagementRate ?? target.profileData?.engagementRate ?? 0;
    const userMinEngagement = userProfile.minEngagement ?? userProfile.minEngagementRate ?? 0;
    score += scoreEngagement(targetEngagement, userMinEngagement);

    const targetFollowers = target.followers ?? target.profileData?.followers ?? 0;
    score += scoreFollowers(targetFollowers);

    const userBudget = userProfile.budget ?? 0;
    const targetPrice = target.pricePerPost ?? target.profileData?.pricePerPost ?? target.budget?.amount ?? 0;
    if (userBudget > 0 && targetPrice > 0) {
        score += clamp(Math.min(userBudget / targetPrice, 1) * 15, 0, 15);
    }

    if (userLocation && targetLocation && userLocation.toLowerCase() === targetLocation.toLowerCase()) {
        score += 10;
    }

    const rating = target.averageRating ?? target.meta?.averageRating ?? 0;
    if (rating > 0) {
        score += clamp((rating / 5) * 5, 0, 5);
    }

    return Math.min(score, 100);
};

/**
 * Maps raw scores onto a visible 42–98% band so the Discover page reflects real differences.
 * When raw scores still tie, falls back to engagement + reach + rating.
 */
const spreadAdvertiserMatchScores = (items: RecommendationItem[]): void => {
    if (items.length === 0) return;

    const rawScores = items.map((item) => (item.meta?.rawScore as number) ?? item.score);
    const min = Math.min(...rawScores);
    const max = Math.max(...rawScores);

    if (max - min >= 2) {
        items.forEach((item, index) => {
            const raw = rawScores[index];
            item.score = Math.round(42 + ((raw - min) / (max - min)) * 56);
        });
        return;
    }

    items.forEach((item) => {
        const er = normalizeEngagementRate((item.meta?.engagementRate as number) ?? 0);
        const followers = (item.meta?.followers as number) ?? 0;
        const rating = (item.meta?.averageRating as number) ?? 0;
        item.score = Math.round(
            clamp(44 + er * 1.35 + Math.log10(followers + 1) * 2.8 + rating * 4, 40, 98)
        );
    });
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

    let userProfileDoc: any = null;
    if (user.role === 'business_owner') {
        userProfileDoc = await BusinessOwner.findOne({ userId: user._id });
    } else if (user.role === 'advertiser') {
        userProfileDoc = await AdvertiserProfile.findOne({ userId: user._id });
    }

    const userProfile = {
        ...(userProfileDoc?.profileData || {}),
        ...(userProfileDoc?.pendingProfileData || {}),
        ...(userProfileDoc?.pendingUpdates || {}),
    };
    const userLocation = userProfileDoc?.location || userProfile.location;
    const results: RecommendationItem[] = [];

    // ── CASE 1: Business Owner → Recommend Advertisers ──
    if (user.role === 'business_owner') {
        const advertisers = await User.find({
            role: 'advertiser',
            status: { $in: ['active', 'approved'] },
            _id: { $ne: user._id },
        }).lean();

        const advertiserIds = advertisers.map(a => a._id);
        const advProfilesDocs = await AdvertiserProfile.find({ userId: { $in: advertiserIds } }).lean();
        const advProfileMap = new Map(advProfilesDocs.map((p: any) => [p.userId.toString(), p]));

        for (const adv of advertisers) {
            const advDoc: any = advProfileMap.get((adv._id as any).toString());
            const advProfile = advDoc?.profileData || {};
            const advMetrics = extractMetrics(advProfile);

            const rawScore = calculateMatchScore(
                userProfile,
                userLocation,
                {
                    ...advProfile,
                    niches: advMetrics.niches,
                    platforms: advMetrics.platforms,
                    followers: advMetrics.followers,
                    engagementRate: advMetrics.engagementRate,
                    averageRating: advDoc?.averageRating || 0,
                },
                advDoc?.location
            );

            results.push({
                targetId: (adv._id as any).toString(),
                type: 'advertiser',
                score: rawScore,
                name: `${adv.firstName} ${adv.lastName}`.trim() || adv.username,
                category: advMetrics.niche,
                location: advDoc?.location,
                meta: {
                    rawScore,
                    profilePicture: adv.profilePicture,
                    followers: advMetrics.followers,
                    engagementRate: advMetrics.engagementRate,
                    username: adv.username,
                    niches: advMetrics.niches,
                    bio: advProfile.bio || '',
                    platforms: advMetrics.platforms,
                    averageRating: advDoc?.averageRating || 0,
                    totalReviews: advDoc?.totalReviews || 0,
                },
            });
        }

        spreadAdvertiserMatchScores(results);

        logger.info(`[Recommendations] Generated ${results.length} advertiser recommendations for business_owner ${userId}`);
    }
    // ── CASE 2: Advertiser → Recommend Opportunities ──
    else if (user.role === 'advertiser') {
        const opportunities = await Opportunity.find({
            status: 'open',
        })
            .populate('businessOwner', 'firstName lastName profilePicture username averageRating totalReviews')
            .lean();

        for (const opp of opportunities) {
            const score = calculateMatchScore(
                userProfile,
                userLocation,
                {
                    category: opp.category,
                    budget: opp.budget,
                    followers: opp.requirements?.minFollowers,
                },
                opp.requirements?.location
            );

            // Fetch the actual count of applications submitted for this opportunity
            const applicantCount = await Application.countDocuments({ opportunity: opp._id });

            const owner = opp.businessOwner as any;
            results.push({
                targetId: (opp._id as any).toString(),
                type: 'opportunity',
                score,
                name: opp.title,
                category: opp.category,
                location: opp.requirements?.location,
                meta: {
                    description: opp.description,
                    deliverables: opp.deliverables,
                    budget: opp.budget,
                    platforms: opp.platforms,
                    deadline: opp.deadline,
                    tags: opp.tags,
                    requirements: opp.requirements,
                    createdAt: opp.createdAt,
                    applicants: Array(applicantCount).fill({}), // Map counts to a dummy array of identical size so frontend maps length
                    businessOwner: owner ? {
                        name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
                        profilePicture: owner.profilePicture,
                        username: owner.username,
                        averageRating: owner.averageRating || 0,
                        totalReviews: owner.totalReviews || 0,
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
