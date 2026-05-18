/** Flatten nested business onboarding profileData for admin review. */
export function flattenBusinessProfileForAdmin(profileData: Record<string, unknown> | null | undefined) {
  if (!profileData || typeof profileData !== 'object') return {};

  const bp = (profileData.businessProfile || {}) as Record<string, unknown>;
  const cap = (profileData.capacity || {}) as Record<string, unknown>;
  const fin = (profileData.financialData || {}) as Record<string, unknown>;
  const ta = (profileData.targetAudience || {}) as Record<string, unknown>;
  const mh = (profileData.marketingHistory || {}) as Record<string, unknown>;
  const ca = (profileData.customerAnalytics || {}) as Record<string, unknown>;
  const mg = profileData.marketingGoals;
  const marketingGoals = Array.isArray(mg) ? mg : (profileData.promotionGoals as string[]) || [];

  return {
    businessName: profileData.businessName,
    phone: profileData.phone,
    businessLocation: profileData.businessLocation,
    industry: profileData.industry ?? bp.businessCategory,
    businessCategory: bp.businessCategory ?? profileData.industry,
    businessTags: bp.businessTags ?? profileData.targetAudienceTags,
    priceRange: bp.priceRange,
    businessAgeYears: bp.businessAgeYears,
    openingHours: bp.openingHours,
    bio: profileData.bio,
    servicesOffered: profileData.servicesOffered,
    website: profileData.website,
    companySize: profileData.companySize,
    dailyCustomerCapacity: cap.dailyCustomerCapacity,
    averageOrderValue: fin.averageOrderValue,
    profitMarginPercentage: fin.profitMarginPercentage,
    averageDailyCustomers: fin.averageDailyCustomers,
    averageMonthlyRevenue: fin.averageMonthlyRevenue,
    averageMonthlyProfit: fin.averageMonthlyProfit,
    audienceGender: ta.gender,
    audienceAgeRanges: ta.ageRange,
    audienceLocations: ta.locations,
    audienceInterests: ta.interests,
    incomeLevel: ta.incomeLevel,
    marketingGoals,
    primaryKpis: profileData.primaryKpis,
    selectedPlatforms: profileData.selectedPlatforms,
    monthlyBudget: profileData.monthlyBudget,
    hasRunAdsBefore: mh.hasRunAdsBefore,
    pastPlatforms: mh.pastPlatforms,
    marketingHistoryNotes: mh.notes,
    monthlyAdSpendETB: mh.monthlyAdSpendETB,
    repeatCustomerRate: ca.repeatCustomerRate,
    topCustomerSegments: ca.topCustomerSegments,
    peakHours: ca.peakHours,
    seasonalNotes: ca.seasonalNotes,
    preferredPromotionTypes: profileData.preferredPromotionTypes,
    preferredPromoterTypes: profileData.preferredPromoterTypes,
    promotersNeededCount: profileData.promotersNeededCount,
    tradeLicenseUrl: profileData.tradeLicenseUrl,
    profileCompletion: profileData.profileCompletion,
  };
}
