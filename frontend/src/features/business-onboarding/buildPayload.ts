import type { BusinessOnboardingForm } from './types';
import { computeCompletion } from './completion';

const num = (v: string) => {
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : undefined;
};

/** Builds nested profileData for API while keeping legacy flat keys for compatibility. */
export const buildProfilePayload = (form: BusinessOnboardingForm) => {
  const completion = computeCompletion(form);
  const avgOrder = num(form.averageOrderValue);
  const minEng = Math.min(50, Math.max(0, parseFloat(form.minEngagementPercent) || 0));

  const businessProfile = {
    businessCategory: form.businessCategory,
    businessTags: form.businessTags,
    priceRange: form.priceRange,
    businessAgeYears: num(form.businessAgeYears),
    brandPopularityScore: form.brandPopularityScore,
    openingHours: form.openingHours.trim(),
  };

  const capacity = {
    seatingCapacity: num(form.seatingCapacity),
    dailyCustomerCapacity: num(form.dailyCustomerCapacity),
  };

  const financialData = {
    averageOrderValue: avgOrder,
    profitMarginPercentage: form.profitMarginPercentage,
    averageDailyCustomers: num(form.averageDailyCustomers),
    averageMonthlyRevenue: num(form.averageMonthlyRevenue),
    averageMonthlyProfit: num(form.averageMonthlyProfit),
  };

  const targetAudience = {
    gender: form.audienceGender,
    ageRange: form.audienceAgeRanges,
    locations: form.audienceLocations,
    interests: form.audienceInterests,
    incomeLevel: form.incomeLevel,
  };

  const marketingGoals = form.marketingGoals;

  const marketingHistory = {
    hasRunAdsBefore: form.hasRunAdsBefore,
    pastPlatforms: form.pastPlatforms,
    notes: form.marketingHistoryNotes.trim(),
    monthlyAdSpendETB: num(form.monthlyAdSpendETB),
  };

  const customerAnalytics = {
    repeatCustomerRate: form.repeatCustomerRate,
    topCustomerSegments: form.topCustomerSegments,
    peakHours: form.peakHours,
    seasonalNotes: form.seasonalNotes.trim(),
  };

  const profileCompletion = {
    percent: completion.percent,
    aiReadiness: completion.aiReadiness,
    dataQuality: completion.dataQuality,
    aiScore: completion.aiScore,
    qualityScore: completion.qualityScore,
    completedSections: Object.entries(completion.sections)
      .filter(([, v]) => v)
      .map(([k]) => k),
    missingSections: completion.missingSections,
    updatedAt: new Date().toISOString(),
  };

  return {
    businessName: form.businessName.trim(),
    website: form.websiteUrl.trim(),
    industry: form.businessCategory,
    category: form.businessCategory,
    niche: form.businessCategory,
    bio: form.brandDescription.trim(),
    businessLocation: form.businessLocation.trim(),
    servicesOffered: form.servicesOffered.trim(),
    companySize: form.companySize,
    targetAudienceTags: form.businessTags,
    targetAudienceAgeRanges: form.audienceAgeRanges,
    monthlyBudget: form.monthlyBudget,
    currency: 'ETB',
    budget: form.maxSpendPerPostETB,
    minEngagement: minEng,
    avgOrderValueETB: avgOrder,
    brandVoice: form.brandVoice,
    primaryKpis: form.primaryKpis,
    selectedPlatforms: form.selectedPlatforms,
    tradeLicenseUrl: form.tradeLicenseUrl,
    promotionGoals: form.marketingGoals,
    preferredPromotionTypes: form.preferredPromotionTypes,
    preferredPromoterTypes: form.preferredPromoterTypes,
    promotersNeededCount: form.promotersNeededCount.trim(),
    phone: form.phone.trim(),
    businessProfile,
    capacity,
    financialData,
    targetAudience,
    marketingGoals,
    marketingHistory,
    customerAnalytics,
    profileCompletion,
  };
};
