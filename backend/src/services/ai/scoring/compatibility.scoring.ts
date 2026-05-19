import { clamp, normalizeToList } from '../ai.utils';
import { CompatibilityScoreBreakdown } from '../ai.types';

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

export const calculateCompatibility = (
    businessPrefs: Record<string, any>,
    businessLocation: string | undefined,
    creatorData: Record<string, any>,
    creatorLocation: string | undefined
): CompatibilityScoreBreakdown => {
    const businessNiches = normalizeToList(
        businessPrefs.preferredNiches ||
        businessPrefs.niches ||
        businessPrefs.targetAudienceTags ||
        businessPrefs.niche ||
        businessPrefs.industry
    );
    const creatorNiches = normalizeToList(
        creatorData.niches || creatorData.allNiches || (creatorData.niche ? [creatorData.niche] : [])
    );
    const nicheOverlap = Math.round(jaccardOverlap(businessNiches, creatorNiches) * 30);

    const businessPlatforms = normalizeToList(
        businessPrefs.preferredPlatform || businessPrefs.selectedPlatforms || businessPrefs.platforms
    );
    const creatorPlatforms = normalizeToList(creatorData.platforms);
    const platformOverlap = Math.round(jaccardOverlap(businessPlatforms, creatorPlatforms) * 20);

    const creatorER = creatorData.engagementRate || 0;
    const minER = businessPrefs.minEngagement || businessPrefs.minEngagementRate || 0;
    let engagementFit = 0;
    if (creatorER > 0) {
        if (minER > 0 && creatorER >= minER) {
            engagementFit = 20;
        } else if (minER > 0) {
            engagementFit = Math.round((creatorER / minER) * 15);
        } else {
            engagementFit = Math.round(clamp((creatorER / 10) * 20, 0, 20));
        }
    }

    const creatorFollowers = creatorData.followers || 0;
    const logMin = 3;
    const logMax = 7;
    const logF = Math.log10(Math.max(creatorFollowers, 1) + 1);
    const followerFit = Math.round(clamp(((logF - logMin) / (logMax - logMin)) * 15, 0, 15));

    const businessBudget = businessPrefs.budget || businessPrefs.monthlyBudget || 0;
    const creatorRate = creatorData.pricePerPost || creatorData.minRate || creatorData.preferredRate || 0;
    let budgetFit = 0;
    if (businessBudget > 0 && creatorRate > 0) {
        budgetFit = Math.round(clamp(Math.min(businessBudget / creatorRate, 1) * 10, 0, 10));
    } else if (businessBudget > 0) {
        budgetFit = 5;
    }

    const locationMatch =
        businessLocation && creatorLocation &&
        businessLocation.toLowerCase().trim() === creatorLocation.toLowerCase().trim()
            ? 5
            : 0;

    const rating = creatorData.averageRating || 0;
    const ratingBonus = Math.round(clamp((rating / 5) * 5, 0, 5));

    const total = clamp(
        nicheOverlap + platformOverlap + engagementFit + followerFit + budgetFit + locationMatch + ratingBonus,
        0,
        100
    );

    return {
        nicheOverlap,
        platformOverlap,
        engagementFit,
        followerFit,
        budgetFit,
        locationMatch,
        ratingBonus,
        total,
    };
};

export const calculateAudienceOverlap = (
    businessTarget: {
        ageRange?: string;
        gender?: string;
        interests?: string[];
        location?: string;
    },
    creatorAudience: {
        ageRange?: string;
        gender?: string;
        topCountry?: string;
        interests?: string[];
    }
): number => {
    let score = 0;

    if (businessTarget.ageRange && creatorAudience.ageRange) {
        if (businessTarget.ageRange.toLowerCase() === creatorAudience.ageRange.toLowerCase()) {
            score += 30;
        } else {
            score += 10;
        }
    }

    if (businessTarget.gender && creatorAudience.gender) {
        const bg = businessTarget.gender.toLowerCase();
        const cg = creatorAudience.gender.toLowerCase();
        if (bg === cg) {
            score += 20;
        } else if (bg === 'mixed' || cg === 'mixed' || bg === 'all') {
            score += 10;
        }
    }

    const businessInterests = normalizeToList(businessTarget.interests);
    const creatorInterests = normalizeToList(creatorAudience.interests);
    if (businessInterests.length > 0 && creatorInterests.length > 0) {
        score += Math.round(jaccardOverlap(businessInterests, creatorInterests) * 30);
    }

    if (businessTarget.location && creatorAudience.topCountry) {
        if (businessTarget.location.toLowerCase().includes(creatorAudience.topCountry.toLowerCase()) ||
            creatorAudience.topCountry.toLowerCase().includes(businessTarget.location.toLowerCase())) {
            score += 20;
        }
    }

    return clamp(score, 0, 100);
};
