import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/database';
import User from '../src/database/models/User';
import BusinessOwner from '../src/database/models/businessOwner';
import AdvertiserProfile from '../src/database/models/AdvertiserProfile';
import { extractMetrics, normalizeEngagementRate } from '../src/utils/metrics';
import { clamp, flattenProfileData, normalizeToList } from '../src/services/ai/ai.utils';

interface RecommendationCompatibility {
  nicheCompatibility: number;
  audienceCompatibility: number;
  audienceLocationCompatibility: number;
  platformCompatibility: number;
  engagementQuality: number;
  audienceRelevance: number;
  total: number;
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

async function main() {
  await connectDB();

  const ownerUser = await User.findOne({ role: 'business_owner', status: { $in: ['active', 'approved'] } }).lean();
  if (!ownerUser) {
    throw new Error('No active business_owner found in DB');
  }

  const ownerDoc = await BusinessOwner.findOne({ userId: ownerUser._id }).lean();
  const ownerProfile = flattenProfileData(ownerDoc);

  const advertiserUser = await User.findOne({
    role: 'advertiser',
    status: { $in: ['active', 'approved'] },
    _id: { $ne: ownerUser._id },
  }).lean();
  if (!advertiserUser) {
    throw new Error('No active advertiser found in DB');
  }

  const advDoc = await AdvertiserProfile.findOne({ userId: advertiserUser._id }).lean();
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

  const compatibility = calculateCompatibility(ownerProfile, target);

  const output = {
    owner: {
      userId: String(ownerUser._id),
      name: `${ownerUser.firstName || ''} ${ownerUser.lastName || ''}`.trim() || ownerUser.username,
      location: ownerDoc?.location || ownerProfile.location || null,
      preferredPlatforms: ownerProfile.preferredPlatforms || ownerProfile.preferredPlatform || null,
      businessCategory: ownerProfile.businessCategory || ownerProfile.industry || null,
    },
    advertiser: {
      userId: String(advertiserUser._id),
      name: `${advertiserUser.firstName || ''} ${advertiserUser.lastName || ''}`.trim() || advertiserUser.username,
      profilePicture: advertiserUser.profilePicture || null,
      location: advDoc?.location || advProfile.location || null,
      metrics: {
        followers: advMetrics.followers,
        engagementRate: advMetrics.engagementRate,
        avgViews: advMetrics.avgViews,
        avgComments: advMetrics.avgComments,
        avgShares: advMetrics.avgShares,
        totalLikes: advMetrics.totalLikes,
        niches: advMetrics.niches,
        platforms: advMetrics.platforms,
        audienceInfo: advMetrics.audienceInfo,
      },
    },
    scoreBreakdown: compatibility,
    finalPercentShownOnUI: `${compatibility.total}%`,
  };

  console.log(JSON.stringify(output, null, 2));
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('[recommendation_score_audit] Error:', err.message || err);
  await mongoose.disconnect();
  process.exit(1);
});
