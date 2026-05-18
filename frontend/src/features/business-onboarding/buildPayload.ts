import type { BusinessOnboardingForm } from './types';
import { computeCompletion } from './completion';

const num = (v: string) => {
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : undefined;
};

const optStr = (v: string) => {
  const t = v.trim();
  return t || null;
};

/** Builds nested profileData for API while keeping legacy flat keys for compatibility. */
export const buildProfilePayload = (form: BusinessOnboardingForm) => {
  const completion = computeCompletion(form);
  const avgOrder = num(form.averageOrderValue);
  const minEng = Math.min(50, Math.max(0, parseFloat(form.minEngagementPercent) || 0));

  const businessProfile = {
    businessCategory: form.businessCategory || null,
    businessTags: form.businessTags,
    priceRange: form.priceRange,
    businessAgeYears: num(form.businessAgeYears) ?? null,
    openingHours: optStr(form.openingHours),
  };

  const capacity = {
    dailyCustomerCapacity: num(form.dailyCustomerCapacity) ?? null,
  };

  const financialData = {
    averageOrderValue: avgOrder ?? null,
    profitMarginPercentage: form.profitMarginPercentage,
    averageDailyCustomers: num(form.averageDailyCustomers) ?? null,
    averageMonthlyRevenue: num(form.averageMonthlyRevenue) ?? null,
    averageMonthlyProfit: num(form.averageMonthlyProfit) ?? null,
  };

  const targetAudience = {
    gender: form.audienceGender,
    ageRange: form.audienceAgeRanges,
    locations: form.audienceLocations,
    interests: form.audienceInterests,
    incomeLevel: form.incomeLevel || null,
  };

  const marketingGoals = form.marketingGoals;

  const marketingHistory = {
    hasRunAdsBefore: form.hasRunAdsBefore,
    pastPlatforms: form.pastPlatforms,
    notes: optStr(form.marketingHistoryNotes),
    monthlyAdSpendETB: num(form.monthlyAdSpendETB) ?? null,
  };

  const customerAnalytics = {
    repeatCustomerRate: form.repeatCustomerRate,
    topCustomerSegments: form.topCustomerSegments,
    peakHours: form.peakHours,
    seasonalNotes: optStr(form.seasonalNotes),
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
    website: optStr(form.websiteUrl),
    industry: form.businessCategory || null,
    category: form.businessCategory || null,
    niche: form.businessCategory || null,
    bio: optStr(form.brandDescription),
    businessLocation: form.businessLocation.trim(),
    servicesOffered: optStr(form.servicesOffered),
    companySize: form.companySize,
    targetAudienceTags: form.businessTags,
    targetAudienceAgeRanges: form.audienceAgeRanges,
    monthlyBudget: form.monthlyBudget,
    currency: 'ETB',
    budget: form.maxSpendPerPostETB,
    minEngagement: minEng,
    avgOrderValueETB: avgOrder ?? null,
    primaryKpis: form.primaryKpis,
    selectedPlatforms: form.selectedPlatforms,
    tradeLicenseUrl: form.tradeLicenseUrl,
    promotionGoals: form.marketingGoals,
    preferredPromotionTypes: form.preferredPromotionTypes,
    preferredPromoterTypes: form.preferredPromoterTypes,
    promotersNeededCount: optStr(form.promotersNeededCount),
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
