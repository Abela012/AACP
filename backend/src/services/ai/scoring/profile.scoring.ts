import { clamp } from '../ai.utils';
import { ProfileCompletenessBreakdown, AdvertiserScores } from '../ai.types';
import { calculateEngagementScore } from './engagement.scoring';

export const calculateProfileCompleteness = (
    profile: any,
    user: any
): ProfileCompletenessBreakdown => {
    const hasBio = !!(profile.bio && profile.bio.length > 10);
    const hasNiche = !!profile.niche;
    const hasExperience = !!profile.experienceLevel;
    const hasContentFormats = !!(profile.contentFormats && profile.contentFormats.length > 0);
    const hasTargetAudience = !!(
        profile.targetAudience &&
        (profile.targetAudience.ageRange || profile.targetAudience.gender)
    );
    const hasSocialProfile = !!(profile.socialProfiles && profile.socialProfiles.length > 0);
    const hasRateExpectations = !!(
        profile.rateExpectations &&
        (profile.rateExpectations.minRate || profile.rateExpectations.preferredRate)
    );
    const hasPortfolio = !!(profile.portfolioLinks && profile.portfolioLinks.length > 0);
    const hasProfilePicture = !!(user?.profilePicture && user.profilePicture.length > 0);
    const hasFollowers = !!(profile.socialProfiles?.some((sp: any) => sp.followers > 0));

    let total = 0;
    if (hasBio) total += 10;
    if (hasNiche) total += 10;
    if (hasExperience) total += 5;
    if (hasContentFormats) total += 10;
    if (hasTargetAudience) total += 10;
    if (hasSocialProfile) total += 15;
    if (hasRateExpectations) total += 10;
    if (hasPortfolio) total += 10;
    if (hasProfilePicture) total += 10;
    if (hasFollowers) total += 10;

    return {
        hasBio,
        hasNiche,
        hasExperience,
        hasContentFormats,
        hasTargetAudience,
        hasSocialProfile,
        hasRateExpectations,
        hasPortfolio,
        hasProfilePicture,
        hasFollowers,
        total: clamp(total, 0, 100),
    };
};

export const calculateContentDiversity = (profile: any, metrics: any): number => {
    const uniqueFormats = new Set(profile.contentFormats || []).size;
    const uniqueNiches = new Set(metrics.niches || metrics.allNiches || []).size;
    const platformCount = metrics.platforms?.length || 0;

    const formatScore = clamp((uniqueFormats / 6) * 40, 0, 40);
    const nicheScore = clamp((uniqueNiches / 3) * 30, 0, 30);
    const platformScore = clamp((platformCount / 3) * 30, 0, 30);

    return Math.round(formatScore + nicheScore + platformScore);
};

export const calculatePlatformReach = (totalFollowers: number): number => {
    if (totalFollowers <= 0) return 0;
    const logMin = 3;
    const logMax = 7;
    const logF = Math.log10(totalFollowers + 1);
    return Math.round(clamp(((logF - logMin) / (logMax - logMin)) * 100, 0, 100));
};

export const calculateReputation = (averageRating: number, totalReviews: number): number => {
    const ratingComponent = (Math.min(averageRating, 5) / 5) * 70;
    const reviewComponent = (Math.min(totalReviews, 50) / 50) * 30;
    return Math.round(ratingComponent + reviewComponent);
};

export const calculateAdvertiserScores = (
    profile: any,
    user: any,
    metrics: any
): AdvertiserScores => {
    const engagementBreakdown = calculateEngagementScore({
        followers: metrics.followers,
        engagementRate: metrics.engagementRate,
        totalLikes: metrics.totalLikes,
        avgComments: metrics.avgComments,
        avgShares: metrics.avgShares,
    });

    const completeness = calculateProfileCompleteness(profile, user);
    const diversity = calculateContentDiversity(profile, metrics);
    const reach = calculatePlatformReach(metrics.followers);
    const reputation = calculateReputation(
        profile.averageRating || 0,
        profile.totalReviews || 0
    );

    const overall = Math.round(
        engagementBreakdown.total * 0.35 +
        completeness.total * 0.15 +
        diversity * 0.10 +
        reach * 0.20 +
        reputation * 0.20
    );

    return {
        engagement: engagementBreakdown.total,
        profileCompleteness: completeness.total,
        contentDiversity: diversity,
        platformReach: reach,
        reputation,
        overall: clamp(overall, 0, 100),
    };
};
