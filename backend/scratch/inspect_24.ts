import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disConnect } from '../src/config/database';
import User from '../src/database/models/User';
import AdvertiserProfile from '../src/database/models/AdvertiserProfile';
import BusinessOwner from '../src/database/models/businessOwner';
import { flattenProfileData } from '../src/services/ai/ai.utils';
import { extractMetrics, normalizeEngagementRate } from '../src/utils/metrics';
import { getRecommendationsForUser } from '../src/modules/recommendations/recommendation.service';

const unique = (values: string[] = []) => Array.from(new Set(values.filter(Boolean)));
const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v).toLowerCase().trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((s) => s.toLowerCase().trim()).filter(Boolean);
  return [];
};

const jaccard = (a: string[], b: string[]) => {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size === 0 || B.size === 0) return { ratio: 0, intersection: 0, union: 0 };
  let intersection = 0;
  for (const v of B) if (A.has(v)) intersection++;
  const union = new Set([...a, ...b]).size;
  return { ratio: union > 0 ? intersection / union : 0, intersection, union };
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const normalizeText = (v: any) => (v === null || v === undefined ? '' : String(v).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim());

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
  if (rangeMatch) return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  if (text.includes('18+')) return { min: 18, max: 65 };
  if (text.includes('all') || text.includes('mixed')) return { min: 13, max: 65 };
  const singleMatch = text.match(/(\d{1,2})/);
  if (singleMatch) { const start = Number(singleMatch[1]); return { min: start, max: Math.min(start + 6, 65) }; }
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

(async () => {
  await connectDB();
  const owner = await User.findOne({ role: 'business_owner', status: { $in: ['active', 'approved'] } }).lean();
  if (!owner) {
    console.log('NO_OWNER_FOUND');
    await disConnect();
    return;
  }

  const recs = await getRecommendationsForUser(String(owner._id));
  const only24 = (recs.recommendations || []).filter((r: any) => Number(r.score) === 24);
  if (!only24.length) {
    console.log('NO_24_RECOMMENDATIONS_FOUND');
    console.log('Total recommendations:', (recs.recommendations || []).length);
    await disConnect();
    return;
  }

  const pick = only24[0];
  console.log('Picked recommendation:', pick.targetId, pick.name, 'score=', pick.score);

  // fetch raw advertiser user + profile
  const advUser = await User.findById(pick.targetId).lean();
  const advProfileDoc = await AdvertiserProfile.findOne({ userId: pick.targetId }).lean();
  const ownerProfileDoc = await BusinessOwner.findOne({ userId: owner._id }).lean();

  const ownerProfile = flattenProfileData(ownerProfileDoc);
  const advProfile = flattenProfileData(advProfileDoc);
  const advMetrics = extractMetrics(advProfile);

  console.log('\n--- OWNER RAW FIELDS ---');
  console.log({ businessCategory: ownerProfile.businessCategory, businessNiche: ownerProfile.businessNiche, businessTags: ownerProfile.businessTags, targetAudience: ownerProfile.targetAudience, preferredPlatforms: ownerProfile.preferredPlatform || ownerProfile.selectedPlatforms, location: ownerProfile.location, audienceAgeRange: ownerProfile.targetAudienceAgeRange, audienceGender: ownerProfile.targetAudienceGender });

  console.log('\n--- ADVERTISER RAW FIELDS ---');
  console.log({ profileDocLocation: advProfileDoc?.location, advProfileSample: { niches: advMetrics.niches, platforms: advMetrics.platforms, followers: advMetrics.followers, engagementRate: advMetrics.engagementRate, avgViews: advMetrics.avgViews, audienceInfo: advMetrics.audienceInfo, contentStyle: advMetrics.contentStyle } });

  // Recompute niche sets like recommendation.service
  const businessNiches = unique(toList([ownerProfile.businessCategory, ownerProfile.businessNiche, ownerProfile.businessTags, ownerProfile.targetAudienceTags, ownerProfile.marketingGoals, ownerProfile.industry].flat()));
  const targetNiches = unique(toList([advMetrics.niches, advProfile.niche, advProfile.contentStyle, advProfile.categories].flat()));
  const nicheJ = jaccard(businessNiches, targetNiches);
  const nicheCompatibility = Math.round(clamp(nicheJ.ratio * 30, 0, 30));

  console.log('\n--- NICHE DETAILS ---');
  console.log('businessNiches:', businessNiches);
  console.log('targetNiches:', targetNiches);
  console.log('intersection/union:', nicheJ.intersection, '/', nicheJ.union, 'ratio=', nicheJ.ratio.toFixed(3));
  console.log('nicheCompatibility:', nicheCompatibility, '/30');

  // Audience compatibility
  const businessAudience = unique(toList([ownerProfile.targetAudience, ownerProfile.targetAudienceTags, ownerProfile.audienceInterests, ownerProfile.marketingGoals].flat()));
  const targetAudience = unique(toList([advProfile.audienceInterests, advProfile.audienceTags, advProfile.audienceSegments, advMetrics.niches].flat()));
  const audienceJ = jaccard(businessAudience, targetAudience);
  const ageFit = ageRangeCompatibility(ownerProfile.audienceAgeRange || ownerProfile.targetAudienceAgeRange, advMetrics.audienceInfo?.ageRange);
  const businessGender = normalizeGender(ownerProfile.audienceGender || ownerProfile.targetAudienceGender);
  const targetGender = normalizeGender(advMetrics.audienceInfo?.gender || advProfile.audienceGender);
  const genderFit = !businessGender || !targetGender ? 0.35 : (businessGender === targetGender ? 1 : (businessGender === 'mixed' || targetGender === 'mixed' ? 0.6 : 0.15));
  const audienceCompatibility = Math.round(clamp(audienceJ.ratio * 10 + ageFit * 6 + genderFit * 4, 0, 20));

  console.log('\n--- AUDIENCE DETAILS ---');
  console.log('businessAudience:', businessAudience);
  console.log('targetAudience:', targetAudience);
  console.log('audienceOverlap ratio:', audienceJ.ratio.toFixed(3), 'intersection/union:', audienceJ.intersection, '/', audienceJ.union);
  console.log('ageFit:', ageFit.toFixed(3), 'genderFit:', genderFit.toFixed(3));
  console.log('audienceCompatibility:', audienceCompatibility, '/20');

  // Location
  const locLeft = normalizeText(ownerProfile.location || ownerProfile.city);
  const locRight = normalizeText(advProfileDoc?.location || advProfile.location || advMetrics.audienceInfo?.topCountry);
  const locationRatio = locLeft && locRight ? (locLeft === locRight ? 1 : (locLeft.includes(locRight) || locRight.includes(locLeft) ? 0.85 : jaccard(unique(locLeft.split(' ')), unique(locRight.split(' '))).ratio)) : 0;
  const audienceLocationCompatibility = Math.round(clamp(locationRatio * 15, 0, 15));
  console.log('\n--- LOCATION DETAILS ---');
  console.log('owner.location:', ownerProfile.location || ownerProfile.city, 'adv.location:', advProfileDoc?.location || advProfile.location || advMetrics.audienceInfo?.topCountry);
  console.log('locationRatio:', locationRatio.toFixed(3), 'audienceLocationCompatibility:', audienceLocationCompatibility, '/15');

  // Platform
  const businessPlatforms = unique(toList([ownerProfile.preferredPlatform, ownerProfile.preferredPlatforms, ownerProfile.selectedPlatforms].flat()));
  const targetPlatforms = unique(advMetrics.platforms || []);
  const platformJ = jaccard(businessPlatforms, targetPlatforms);
  const platformCompatibility = Math.round(clamp(platformJ.ratio * 15, 0, 15));
  console.log('\n--- PLATFORM DETAILS ---');
  console.log('businessPlatforms:', businessPlatforms, 'targetPlatforms:', targetPlatforms);
  console.log('platformOverlap ratio:', platformJ.ratio.toFixed(3), 'platformCompatibility:', platformCompatibility, '/15');

  // Engagement
  const engagementRate = normalizeEngagementRate(Number(advMetrics.engagementRate || 0));
  const avgViews = Number(advMetrics.avgViews || 0);
  const avgLikes = Number(advMetrics.totalLikes || 0);
  const avgComments = Number(advMetrics.avgComments || 0);
  const avgShares = Number(advMetrics.avgShares || 0);
  const followerCount = Number(advMetrics.followers || 0);
  const reachQuality = avgViews > 0 && followerCount > 0 ? clamp((avgViews / followerCount) * 100, 0, 1) : 0;
  const interactionDepth = avgViews > 0 ? clamp(((avgLikes + avgComments * 2 + avgShares * 3) / (avgViews || 1)) * 10, 0, 4) : 0;
  const engagementBase = engagementRate >= 15 ? 1 : engagementRate >= 8 ? 0.85 : engagementRate >= 4 ? 0.65 : engagementRate > 0 ? 0.45 : 0;
  const engagementQuality = Math.round(clamp(engagementBase * 10 + reachQuality * 3 + interactionDepth * 2, 0, 15));
  console.log('\n--- ENGAGEMENT DETAILS ---');
  console.log({ engagementRate, followerCount, avgViews, avgLikes, avgComments, avgShares });
  console.log('reachQuality:', reachQuality.toFixed(4), 'interactionDepth:', interactionDepth.toFixed(4), 'engagementBase:', engagementBase.toFixed(3));
  console.log('engagementQuality:', engagementQuality, '/15');

  // Audience relevance
  const relevanceJ = jaccard(unique(toList([ownerProfile.businessCategory, ownerProfile.businessTags, ownerProfile.marketingGoals, ownerProfile.targetAudience].flat())), unique(toList([advMetrics.niches, advProfile.contentStyle, advMetrics.platforms].flat())));
  const audienceRelevance = Math.round(clamp(relevanceJ.ratio * 5, 0, 5));
  console.log('\n--- RELEVANCE DETAILS ---');
  console.log('relevanceOverlap ratio:', relevanceJ.ratio.toFixed(3), 'audienceRelevance:', audienceRelevance, '/5');

  const total = Math.round(clamp(nicheCompatibility + audienceCompatibility + audienceLocationCompatibility + platformCompatibility + engagementQuality + audienceRelevance, 0, 100));
  console.log('\n--- FINAL SUM ---');
  console.log({ nicheCompatibility, audienceCompatibility, audienceLocationCompatibility, platformCompatibility, engagementQuality, audienceRelevance, total });

  await disConnect();
})();
