import type { BusinessOnboardingForm } from './types';

export type ReadinessLevel = 'Beginner' | 'Good' | 'Excellent';

export type CompletionReport = {
  percent: number;
  sections: Record<string, boolean>;
  missingSections: string[];
  aiReadiness: ReadinessLevel;
  dataQuality: ReadinessLevel;
  aiScore: number;
  qualityScore: number;
};

const SECTION_CHECKS: {
  key: string;
  label: string;
  weight: number;
  required: boolean;
  test: (f: BusinessOnboardingForm) => boolean;
}[] = [
  {
    key: 'basic',
    label: 'Basic info',
    weight: 15,
    required: true,
    test: (f) =>
      Boolean(
        f.firstName.trim() &&
          f.lastName.trim() &&
          f.phone.trim() &&
          f.businessName.trim() &&
          f.businessLocation.trim() &&
          f.tradeLicenseUrl
      ),
  },
  {
    key: 'businessProfile',
    label: 'Business profile',
    weight: 12,
    required: true,
    test: (f) => Boolean(f.businessCategory),
  },
  {
    key: 'capacity',
    label: 'Capacity & operations',
    weight: 8,
    required: false,
    test: (f) => Boolean(f.dailyCustomerCapacity.trim() || f.companySize),
  },
  {
    key: 'financial',
    label: 'Financials',
    weight: 18,
    required: true,
    test: (f) =>
      Boolean(
        f.averageOrderValue.trim() &&
          f.profitMarginPercentage >= 0 &&
          (f.averageMonthlyRevenue.trim() || f.averageDailyCustomers.trim())
      ),
  },
  {
    key: 'audience',
    label: 'Target audience',
    weight: 14,
    required: true,
    test: (f) =>
      f.audienceAgeRanges.length > 0 &&
      f.audienceGender.length > 0 &&
      (f.audienceLocations.length > 0 || f.audienceInterests.length > 0),
  },
  {
    key: 'marketing',
    label: 'Marketing goals',
    weight: 14,
    required: true,
    test: (f) => f.marketingGoals.length > 0 && f.selectedPlatforms.length > 0 && f.monthlyBudget >= 5000,
  },
  {
    key: 'analytics',
    label: 'Customer analytics',
    weight: 10,
    required: false,
    test: (f) => f.peakHours.length > 0 || f.repeatCustomerRate > 0 || f.topCustomerSegments.length > 0,
  },
  {
    key: 'history',
    label: 'Marketing history',
    weight: 9,
    required: false,
    test: (f) => f.hasRunAdsBefore === false || f.pastPlatforms.length > 0 || Boolean(f.marketingHistoryNotes.trim()),
  },
];

const scoreToLevel = (score: number): ReadinessLevel => {
  if (score >= 80) return 'Excellent';
  if (score >= 55) return 'Good';
  return 'Beginner';
};

export const computeCompletion = (form: BusinessOnboardingForm): CompletionReport => {
  const sections: Record<string, boolean> = {};
  let earned = 0;
  let totalWeight = 0;

  for (const s of SECTION_CHECKS) {
    const done = s.test(form);
    sections[s.key] = done;
    totalWeight += s.weight;
    if (done) earned += s.weight;
  }

  const percent = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;
  const missingSections = SECTION_CHECKS.filter((s) => !s.required && !sections[s.key]).map(
    (s) => s.label
  );

  const aiScore = Math.min(
    100,
    (form.averageOrderValue.trim() ? 15 : 0) +
      (form.averageMonthlyRevenue.trim() ? 15 : 0) +
      (form.profitMarginPercentage > 0 ? 10 : 0) +
      (form.audienceAgeRanges.length ? 10 : 0) +
      (form.audienceInterests.length ? 10 : 0) +
      (form.marketingGoals.length ? 15 : 0) +
      (form.selectedPlatforms.length ? 10 : 0) +
      (form.businessCategory ? 10 : 0) +
      (form.peakHours.length ? 5 : 0) +
      (form.brandDescription.trim().length >= 40 ? 10 : 0)
  );

  const qualityScore = Math.min(
    100,
    (form.brandDescription.trim().length >= 40 ? 20 : 0) +
      (form.businessTags.length >= 1 ? 15 : 0) +
      (form.openingHours.trim() ? 10 : 0) +
      (form.averageDailyCustomers.trim() ? 15 : 0) +
      (form.incomeLevel ? 10 : 0) +
      (form.tradeLicenseUrl ? 30 : 0)
  );

  return {
    percent,
    sections,
    missingSections,
    aiReadiness: scoreToLevel(aiScore),
    dataQuality: scoreToLevel(qualityScore),
    aiScore,
    qualityScore,
  };
};
