import User from '../../database/models/User';
import Opportunity from '../../database/models/Opportunity';
import Application from '../../database/models/Application';
import BusinessOwner from '../../database/models/businessOwner';
import AdvertiserProfile from '../../database/models/AdvertiserProfile';
import logger from '../../utils/logger';
import { extractMetrics, normalizeEngagementRate } from '../../utils/metrics';
import { buildRecommendationInsightsPrompt, RecommendationPromptCandidate } from '../../services/ai/prompts/recommendation.prompts';
import { generateJSON } from '../../services/ai/gemini.service';
import { getCached, setCached } from '../../services/ai/ai.cache';
import { clamp, flattenProfileData, normalizeToList } from '../../services/ai/ai.utils';

/**
 * Recommendation Service
 *
 * Generates compatibility-based recommendations for business owners and advertisers.
 */

interface RecommendationCompatibility {
    nicheCompatibility: number;
    audienceCompatibility: number;
    audienceLocationCompatibility: number;
    platformCompatibility: number;
    engagementQuality: number;
    audienceRelevance: number;
    total: number;
}

interface RecommendationInsights {
    targetId: string;
    explanation: string;
    recommendationReason: string;
    audienceCompatibility: string;
    platformCompatibility: string;
    nicheCompatibility: string;
    engagementQualityInsight: string;
    strategicInsight: string;
}

export interface RecommendationItem {
    targetId: string;
    type: 'advertiser' | 'opportunity';
    score: number;
    name: string;
    category?: string;
    location?: string;
    reason: string;
    recommendationReason: string;
    audienceCompatibility: string;
    platformCompatibility: string;
    nicheCompatibility: string;
    engagementQualityInsight: string;
    strategicInsight: string;
    compatibility: RecommendationCompatibility;
    aiInsights?: RecommendationInsights | null;
    meta?: Record<string, any>;
}

export interface RecommendationResult {
    recommendations: RecommendationItem[];
    userRole: string;
    generatedAt: Date;
    cached?: boolean;
}

const toList = (value: unknown): string[] => normalizeToList(value);

const unique = (values: string[]): string[] => Array.from(new Set(values.filter(Boolean)));

const jaccardOverlap = (a: string[], b: string[]): number => {
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

const normalizeText = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
};

const normalizeGender = (value: unknown): string => {
    const text = normalizeText(value);
    if (!text) return '';
    if (text.includes('mixed') || text.includes('all') || text.includes('any')) return 'mixed';
    if (text.includes('female')) return 'female';
    if (text.includes('male')) return 'male';
    return text;
};

const normalizeAgeRange = (value: unknown): { min: number; max: number } | null => {
    const text = normalizeText(value);
    if (!text) return null;

    const rangeMatch = text.match(/(\d{1,2})\s*(?:-|to)\s*(\d{1,2})/);
    if (rangeMatch) {
        return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
    }

    if (text.includes('18+')) return { min: 18, max: 65 };
    if (text.includes('all') || text.includes('mixed')) return { min: 13, max: 65 };

    const singleMatch = text.match(/(\d{1,2})/);
    if (singleMatch) {
        const start = Number(singleMatch[1]);
        return { min: start, max: Math.min(start + 6, 65) };
    }

    return null;
};

const ageRangeCompatibility = (leftValue?: unknown, rightValue?: unknown): number => {
    const left = normalizeAgeRange(leftValue);
    const right = normalizeAgeRange(rightValue);
    if (!left || !right) return 0;

    const overlapStart = Math.max(left.min, right.min);
    const overlapEnd = Math.min(left.max, right.max);
    if (overlapEnd < overlapStart) return 0;

    const overlap = overlapEnd - overlapStart + 1;
    const span = Math.max(Math.max(left.max, right.max) - Math.min(left.min, right.min) + 1, 1);
    return overlap / span;
};

const locationCompatibility = (leftValue?: unknown, rightValue?: unknown): number => {
    const left = normalizeText(leftValue);
    const right = normalizeText(rightValue);
    if (!left || !right) return 0;
    if (left === right) return 1;
    if (left.includes(right) || right.includes(left)) return 0.85;

    return jaccardOverlap(unique(left.split(' ')), unique(right.split(' ')));
};

const describeOverlap = (label: string, ratio: number, high: string, medium: string, low: string): string => {
    if (ratio >= 0.7) return `${label} is strong because ${high}`;
    if (ratio >= 0.35) return `${label} is moderate because ${medium}`;
    return `${label} is limited because ${low}`;
};

const buildBusinessSummary = (userRole: string, profile: Record<string, any>): string => {
    return [
        `Role: ${userRole}`,
        `Category: ${profile.businessCategory || profile.category || profile.industry || 'N/A'}`,
        `Niche: ${(toList([profile.businessNiche, profile.businessTags, profile.targetAudienceTags, profile.industry].flat())).join(', ') || 'N/A'}`,
        `Target audience: ${(toList(profile.targetAudience)).join(', ') || 'N/A'}`,
        `Preferred platforms: ${(toList([profile.preferredPlatform, profile.selectedPlatforms, profile.platforms].flat())).join(', ') || 'Any'}`,
        `Location: ${profile.location || profile.city || 'N/A'}`,
        `Goals: ${(toList(profile.marketingGoals)).join(', ') || 'N/A'}`,
        `Budget: ${profile.monthlyBudget || profile.budget || profile.adSpend || 0}`,
    ].join('\n');
};

const buildTargetSummary = (target: Record<string, any>): string => {
    return [
        `Niche: ${(target.niches || []).join(', ') || target.niche || 'General'}`,
        `Platforms: ${(target.platforms || []).join(', ') || 'N/A'}`,
        `Audience location: ${target.audienceLocation || 'N/A'}`,
        `Audience age range: ${target.audienceAgeRange || 'N/A'}`,
        `Audience gender: ${target.audienceGender || 'N/A'}`,
        `Content style: ${target.contentStyle || 'N/A'}`,
        `Followers: ${target.followers || 0}`,
        `Avg views: ${target.avgViews || 0}`,
        `Engagement rate: ${target.engagementRate || 0}%`,
    ].join('\n');
};

const calculateCompatibility = (business: Record<string, any>, target: Record<string, any>): RecommendationCompatibility => {
    const businessNiches = unique(toList([
        business.businessCategory,
        business.businessNiche,
        business.businessTags,
        business.targetAudienceTags,
        business.marketingGoals,
        business.industry,
    ].flat()));
    const targetNiches = unique(toList([
        target.niches,
        target.niche,
        target.contentStyle,
        target.categories,
    ].flat()));
    const nicheCompatibility = Math.round(clamp(jaccardOverlap(businessNiches, targetNiches) * 30, 0, 30));

    const businessAudience = unique(toList([
        business.targetAudience,
        business.targetAudienceTags,
        business.audienceInterests,
        business.marketingGoals,
    ].flat()));
    const targetAudience = unique(toList([
        target.audienceInterests,
        target.audienceTags,
        target.audienceSegments,
        target.niches,
    ].flat()));
    const audienceInterestOverlap = jaccardOverlap(businessAudience, targetAudience);
    const ageFit = ageRangeCompatibility(business.audienceAgeRange, target.audienceAgeRange);
    const businessGender = normalizeGender(business.audienceGender);
    const targetGender = normalizeGender(target.audienceGender);
    const genderFit = !businessGender || !targetGender
        ? 0.35
        : businessGender === targetGender
            ? 1
            : businessGender === 'mixed' || targetGender === 'mixed'
                ? 0.6
                : 0.15;
    const audienceCompatibility = Math.round(clamp(
        audienceInterestOverlap * 10 + ageFit * 6 + genderFit * 4,
        0,
        20
    ));

    const audienceLocationCompatibility = Math.round(clamp(
        locationCompatibility(business.location, target.audienceLocation) * 15,
        0,
        15
    ));

    const platformCompatibility = Math.round(clamp(
        jaccardOverlap(
            unique(toList([business.preferredPlatforms, business.preferredPlatform].flat())),
            unique(toList([target.platforms, target.platform, target.primaryPlatform].flat()))
        ) * 15,
        0,
        15
    ));

    const engagementRate = normalizeEngagementRate(Number(target.engagementRate || 0));
    const avgViews = Number(target.avgViews || 0);
    const avgLikes = Number(target.avgLikes || 0);
    const avgComments = Number(target.avgComments || 0);
    const avgShares = Number(target.avgShares || 0);
    const followerCount = Number(target.followers || 0);
    const reachQuality = avgViews > 0 && followerCount > 0 ? clamp((avgViews / followerCount) * 100, 0, 1) : 0;
    const interactionDepth = avgViews > 0 ? clamp(((avgLikes + avgComments * 2 + avgShares * 3) / avgViews) * 10, 0, 4) : 0;
    const engagementBase = engagementRate >= 15 ? 1 : engagementRate >= 8 ? 0.85 : engagementRate >= 4 ? 0.65 : engagementRate > 0 ? 0.45 : 0;
    const engagementQuality = Math.round(clamp(engagementBase * 10 + reachQuality * 3 + interactionDepth * 2, 0, 15));

    const audienceRelevanceOverlap = jaccardOverlap(
        unique(toList([
            business.businessCategory,
            business.businessTags,
            business.marketingGoals,
            business.targetAudience,
        ].flat())),
        unique(toList([
            target.niches,
            target.contentStyle,
            target.platforms,
        ].flat()))
    );
    const audienceRelevance = Math.round(clamp(audienceRelevanceOverlap * 5, 0, 5));

    return {
        nicheCompatibility,
        audienceCompatibility,
        audienceLocationCompatibility,
        platformCompatibility,
        engagementQuality,
        audienceRelevance,
        total: Math.round(clamp(
            nicheCompatibility + audienceCompatibility + audienceLocationCompatibility + platformCompatibility + engagementQuality + audienceRelevance,
            0,
            100
        )),
    };
};

const buildFallbackInsight = (name: string, compatibility: RecommendationCompatibility): RecommendationInsights => {
    return {
        targetId: '',
        explanation: `${name} is relevant because ${describeOverlap('niche fit', compatibility.nicheCompatibility / 30, 'the content niche closely matches the business category', 'there is partial category overlap', 'the niche overlap is weak')}, ${describeOverlap('audience fit', compatibility.audienceCompatibility / 20, 'the audience demographics align well', 'there is some demographic overlap', 'the audience profile is broad or mismatched')}, and ${describeOverlap('platform fit', compatibility.platformCompatibility / 15, 'the preferred platform is directly supported', 'there is partial platform overlap', 'the platform match is limited')}.`,
        recommendationReason: compatibility.total >= 75
            ? 'Strong compatibility across the key signals.'
            : compatibility.total >= 55
                ? 'Moderate compatibility with meaningful overlap.'
                : 'Lower compatibility, but still relevant as a broader match.',
        audienceCompatibility: describeOverlap('Audience compatibility', compatibility.audienceCompatibility / 20, 'the age, gender, and interest signals line up well', 'there is partial demographic overlap', 'the audience signals are broad or weakly aligned'),
        platformCompatibility: describeOverlap('Platform compatibility', compatibility.platformCompatibility / 15, 'the preferred platform match is strong', 'one platform overlaps, but not all signals align', 'the platform match is weak'),
        nicheCompatibility: describeOverlap('Niche compatibility', compatibility.nicheCompatibility / 30, 'the niche closely matches the business category', 'there is partial niche overlap', 'the niche overlap is weak'),
        engagementQualityInsight: describeOverlap('Engagement quality', compatibility.engagementQuality / 15, 'the engagement level suggests active audience trust', 'the engagement is acceptable but not exceptional', 'the engagement quality is limited'),
        strategicInsight: compatibility.total >= 75
            ? `Prioritize this match for focused outreach and shortlisting.`
            : `Keep this match in the set, but compare it against higher-scoring options first.`,
    };
};

const buildRecommendationItem = (
    base: Omit<RecommendationItem, 'reason' | 'recommendationReason' | 'audienceCompatibility' | 'platformCompatibility' | 'nicheCompatibility' | 'engagementQualityInsight' | 'strategicInsight' | 'aiInsights'>,
    targetSummary: string,
    insight?: RecommendationInsights | null
): RecommendationItem => {
    const chosen = insight || buildFallbackInsight(base.name, base.compatibility);
    return {
        ...base,
        reason: chosen.recommendationReason,
        recommendationReason: chosen.recommendationReason,
        audienceCompatibility: chosen.audienceCompatibility,
        platformCompatibility: chosen.platformCompatibility,
        nicheCompatibility: chosen.nicheCompatibility,
        engagementQualityInsight: chosen.engagementQualityInsight,
        strategicInsight: chosen.strategicInsight,
        aiInsights: insight || null,
        meta: {
            ...base.meta,
            targetSummary,
        },
    };
};

const compatibilitySummary = (compatibility: RecommendationCompatibility): string => {
    return `Niche ${compatibility.nicheCompatibility}/30, Audience ${compatibility.audienceCompatibility}/20, Location ${compatibility.audienceLocationCompatibility}/15, Platform ${compatibility.platformCompatibility}/15, Engagement ${compatibility.engagementQuality}/15, Relevance ${compatibility.audienceRelevance}/5.`;
};

/** @internal Exported via recommendationScoring for unit tests */
const listOverlapRatio = jaccardOverlap;

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

const scoreFollowers = (followers: number): number => {
    if (followers <= 0) return 0;
    const logMin = 3;
    const logMax = 7;
    const logF = Math.log10(followers + 1);
    return clamp(((logF - logMin) / (logMax - logMin)) * 25, 0, 25);
};

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

export const getRecommendationsForUser = async (userId: string): Promise<RecommendationResult> => {
    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error('User not found');
    }

    let userProfileDoc: any = null;
    if (user.role === 'business_owner') {
        userProfileDoc = await BusinessOwner.findOne({ userId: user._id }).lean();
    } else if (user.role === 'advertiser') {
        userProfileDoc = await AdvertiserProfile.findOne({ userId: user._id }).lean();
    }

    const userProfile = flattenProfileData(userProfileDoc);
    const userLocation = userProfileDoc?.location || userProfile.location;
    const results: RecommendationItem[] = [];

    const cacheInput = { version: 2, userRole: user.role, userLocation, userProfile };
    const cached = getCached<RecommendationResult>('recommendation-insights', userId, cacheInput);
    if (cached) {
        return { ...cached, cached: true };
    }

    if (user.role === 'business_owner') {
        const advertisers = await User.find({
            role: 'advertiser',
            status: { $in: ['active', 'approved'] },
            _id: { $ne: user._id },
        }).lean();

        const advertiserIds = advertisers.map((advertiser) => advertiser._id);
        const advProfilesDocs = await AdvertiserProfile.find({ userId: { $in: advertiserIds } }).lean();
        const advProfileMap = new Map(advProfilesDocs.map((profile: any) => [profile.userId.toString(), profile]));

        for (const advertiser of advertisers) {
            const advDoc: any = advProfileMap.get((advertiser._id as any).toString());
            const advProfile = flattenProfileData(advDoc);
            const advMetrics = extractMetrics(advProfile);

            const target = {
                businessCategory: advProfile.businessCategory || advProfile.category || advMetrics.niche,
                businessNiches: advMetrics.niches,
                targetAudience: advProfile.targetAudience || [],
                preferredPlatforms: advMetrics.platforms,
                location: advDoc?.location || advProfile.location,
                marketingGoals: advProfile.contentStyle || [],
                audienceAgeRange: advMetrics.audienceInfo?.ageRange,
                audienceGender: advMetrics.audienceInfo?.gender,
                audienceLocation: advMetrics.audienceInfo?.topCountry || advDoc?.location,
                audienceInterests: advMetrics.niches,
                niches: advMetrics.niches,
                platforms: advMetrics.platforms,
                contentStyle: advMetrics.contentStyle,
                followers: advMetrics.followers,
                avgViews: advMetrics.avgViews,
                avgComments: advMetrics.avgComments,
                avgShares: advMetrics.avgShares,
                avgLikes: advMetrics.totalLikes,
                engagementRate: advMetrics.engagementRate,
            };

            const compatibility = calculateCompatibility(userProfile, target);
            const targetSummary = buildTargetSummary(target);

            results.push(buildRecommendationItem({
                targetId: (advertiser._id as any).toString(),
                type: 'advertiser',
                score: compatibility.total,
                name: `${advertiser.firstName} ${advertiser.lastName}`.trim() || advertiser.username,
                category: advMetrics.niche,
                location: advDoc?.location,
                compatibility,
                meta: {
                    profilePicture: advertiser.profilePicture,
                    followers: advMetrics.followers,
                    engagementRate: advMetrics.engagementRate,
                    username: advertiser.username,
                    niches: advMetrics.niches,
                    bio: advProfile.bio || advDoc?.bio || advertiser.about || '',
                    platforms: advMetrics.platforms,
                    averageRating: advDoc?.averageRating || 0,
                    totalReviews: advDoc?.totalReviews || 0,
                    audienceInfo: advMetrics.audienceInfo,
                    contentStyle: advMetrics.contentStyle,
                    compatibilitySummary: compatibilitySummary(compatibility),
                },
            }, targetSummary));
        }

        logger.info(`[Recommendations] Generated ${results.length} advertiser recommendations for business_owner ${userId}`);
    } else if (user.role === 'advertiser') {
        const opportunities = await Opportunity.find({ status: 'open' })
            .populate('businessOwner', 'firstName lastName profilePicture username averageRating totalReviews')
            .lean();

        const ownerIds = opportunities
            .map((opportunity: any) => (opportunity.businessOwner as any)?._id || (opportunity.businessOwner as any))
            .filter(Boolean)
            .map((id: any) => id.toString());
        const ownerProfiles = await BusinessOwner.find({ userId: { $in: ownerIds } }).lean();
        const ownerProfileMap = new Map(ownerProfiles.map((profile: any) => [profile.userId.toString(), profile]));

        for (const opportunity of opportunities) {
            const ownerDoc = ownerProfileMap.get(((opportunity.businessOwner as any)?._id || opportunity.businessOwner)?.toString());
            const ownerProfile = flattenProfileData(ownerDoc);
            const ownerMetrics = extractMetrics(ownerProfile);

            const target = {
                businessCategory: opportunity.category || ownerProfile.industry || ownerProfile.businessCategory,
                businessNiches: toList([opportunity.category, opportunity.tags, opportunity.requirements?.preferredNiches, ownerProfile.industry, ownerProfile.businessTags].flat()),
                targetAudience: toList([ownerProfile.targetAudience, ownerProfile.businessTags].flat()),
                preferredPlatforms: toList([opportunity.platforms, ownerProfile.preferredPlatform, ownerProfile.selectedPlatforms].flat()),
                location: ownerProfile.location || ownerDoc?.location || opportunity.requirements?.location,
                marketingGoals: toList([ownerProfile.marketingGoals, opportunity.category, opportunity.tags].flat()),
                audienceAgeRange: ownerProfile.targetAudienceAgeRange || ownerMetrics.audienceInfo?.ageRange,
                audienceGender: ownerProfile.targetAudienceGender || ownerMetrics.audienceInfo?.gender,
                audienceLocation: ownerMetrics.audienceInfo?.topCountry || ownerProfile.location || ownerDoc?.location,
                audienceInterests: toList([ownerProfile.targetAudience, opportunity.tags, opportunity.category].flat()),
                niches: toList([opportunity.category, opportunity.tags, ownerProfile.industry].flat()),
                platforms: toList([opportunity.platforms, ownerProfile.preferredPlatform, ownerProfile.selectedPlatforms].flat()),
                contentStyle: ownerProfile.contentStyle || 'N/A',
                followers: opportunity.requirements?.minFollowers || 0,
                avgViews: ownerMetrics.avgViews,
                avgComments: ownerMetrics.avgComments,
                avgShares: ownerMetrics.avgShares,
                avgLikes: ownerMetrics.totalLikes,
                engagementRate: ownerMetrics.engagementRate,
            };

            const compatibility = calculateCompatibility(userProfile, target);
            const targetSummary = buildTargetSummary(target);
            const applicantCount = await Application.countDocuments({ opportunity: opportunity._id });

            const owner = opportunity.businessOwner as any;
            results.push(buildRecommendationItem({
                targetId: (opportunity._id as any).toString(),
                type: 'opportunity',
                score: compatibility.total,
                name: opportunity.title,
                category: opportunity.category,
                location: opportunity.requirements?.location,
                compatibility,
                meta: {
                    description: opportunity.description,
                    deliverables: opportunity.deliverables,
                    budget: opportunity.budget,
                    platforms: opportunity.platforms,
                    deadline: opportunity.deadline,
                    tags: opportunity.tags,
                    requirements: opportunity.requirements,
                    createdAt: opportunity.createdAt,
                    applicants: Array(applicantCount).fill({}),
                    businessOwner: owner ? {
                        name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
                        profilePicture: owner.profilePicture,
                        username: owner.username,
                        averageRating: owner.averageRating || 0,
                        totalReviews: owner.totalReviews || 0,
                    } : undefined,
                    ownerMetrics,
                    compatibilitySummary: compatibilitySummary(compatibility),
                },
            }, targetSummary));
        }

        logger.info(`[Recommendations] Generated ${results.length} opportunity recommendations for advertiser ${userId}`);
    } else {
        logger.warn(`[Recommendations] Unsupported role "${user.role}" for user ${userId}`);
    }

    results.sort((left, right) => right.score - left.score);

    const businessSummary = buildBusinessSummary(user.role, userProfile);
    const promptCandidates: RecommendationPromptCandidate[] = results.slice(0, 10).map((item) => ({
        targetId: item.targetId,
        name: item.name,
        type: item.type,
        score: item.score,
        businessSummary,
        targetSummary: item.meta?.targetSummary || '',
        compatibility: item.compatibility,
    }));

    let insightsById = new Map<string, RecommendationInsights>();
    let geminiLatencyMs = 0;

    if (promptCandidates.length > 0) {
        const prompt = buildRecommendationInsightsPrompt(businessSummary, promptCandidates);
        const geminiResult = await generateJSON<{ insights: RecommendationInsights[] }>(prompt, { insights: [] }, {
            temperature: 0.35,
            timeoutMs: 10_000,
        });

        geminiLatencyMs = geminiResult.latencyMs;
        insightsById = new Map(
            (geminiResult.data?.insights || []).map((insight) => [insight.targetId, insight])
        );
    }

    const finalRecommendations = results.map((item) => {
        const insight = insightsById.get(item.targetId) || null;
        return buildRecommendationItem(item, item.meta?.targetSummary || '', insight ? {
            ...insight,
            targetId: item.targetId,
        } : null);
    });

    const result: RecommendationResult = {
        recommendations: finalRecommendations.slice(0, 100),
        userRole: user.role,
        generatedAt: new Date(),
        cached: false,
    };

    setCached('recommendation-insights', userId, cacheInput, result, geminiLatencyMs);

    return result;
};

/** Exported for unit tests — scoring primitives only */
export const recommendationScoring = {
    calculateMatchScore,
    listOverlapRatio,
    scoreEngagement,
    scoreFollowers,
    spreadAdvertiserMatchScores,
};
