import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProfile } from '@/src/shared/context/ProfileContext';
import type { BusinessOnboardingForm } from './types';
import { computeCompletion } from './completion';

const defaultForm = (): BusinessOnboardingForm => ({
  firstName: '',
  lastName: '',
  phone: '',
  profilePicture: '',
  businessName: '',
  businessLocation: '',
  websiteUrl: '',
  companySize: '1-10',
  servicesOffered: '',
  brandDescription: '',
  tradeLicenseUrl: '',
  businessCategory: '',
  businessTags: [],
  priceRange: 'mid',
  businessAgeYears: '',
  brandPopularityScore: 5,
  openingHours: '',
  seatingCapacity: '',
  dailyCustomerCapacity: '',
  averageOrderValue: '',
  profitMarginPercentage: 25,
  averageDailyCustomers: '',
  averageMonthlyRevenue: '',
  averageMonthlyProfit: '',
  audienceGender: [],
  audienceAgeRanges: [],
  audienceLocations: [],
  audienceInterests: [],
  incomeLevel: 'Middle',
  marketingGoals: [],
  primaryKpis: [],
  brandVoice: 'Professional',
  selectedPlatforms: [],
  preferredPromotionTypes: [],
  preferredPromoterTypes: [],
  promotersNeededCount: '',
  monthlyBudget: 50_000,
  maxSpendPerPostETB: 15_000,
  minEngagementPercent: '3',
  hasRunAdsBefore: false,
  pastPlatforms: [],
  marketingHistoryNotes: '',
  monthlyAdSpendETB: '',
  repeatCustomerRate: 0,
  topCustomerSegments: [],
  peakHours: [],
  seasonalNotes: '',
});

export function useBusinessOnboarding() {
  const { profile } = useProfile();
  const [form, setForm] = useState<BusinessOnboardingForm>(defaultForm);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!profile?._id || hydrated) return;
    const p = profile as Record<string, unknown>;
    const bp = (p.businessProfile || {}) as Record<string, unknown>;
    const cap = (p.capacity || {}) as Record<string, unknown>;
    const fd = (p.financialData || {}) as Record<string, unknown>;
    const ta = (p.targetAudience || {}) as Record<string, unknown>;
    const mh = (p.marketingHistory || {}) as Record<string, unknown>;
    const ca = (p.customerAnalytics || {}) as Record<string, unknown>;

    setForm({
      ...defaultForm(),
      firstName: String(profile.firstName || ''),
      lastName: String(profile.lastName || ''),
      phone: String(p.phone || ''),
      profilePicture: String(profile.avatarUrl || profile.profilePicture || ''),
      businessName: String(p.businessName || ''),
      businessLocation: String(p.businessLocation || ''),
      websiteUrl: String(p.website || ''),
      companySize: String(p.companySize || '1-10'),
      servicesOffered: String(p.servicesOffered || ''),
      brandDescription: String(p.bio || ''),
      tradeLicenseUrl: String(p.tradeLicenseUrl || profile.tradeLicenseUrl || ''),
      businessCategory: String(bp.businessCategory || p.industry || ''),
      businessTags: Array.isArray(bp.businessTags) ? (bp.businessTags as string[]) : [],
      priceRange: String(bp.priceRange || 'mid'),
      businessAgeYears: bp.businessAgeYears != null ? String(bp.businessAgeYears) : '',
      brandPopularityScore: Number(bp.brandPopularityScore) || 5,
      openingHours: String(bp.openingHours || ''),
      seatingCapacity: cap.seatingCapacity != null ? String(cap.seatingCapacity) : '',
      dailyCustomerCapacity: cap.dailyCustomerCapacity != null ? String(cap.dailyCustomerCapacity) : '',
      averageOrderValue:
        fd.averageOrderValue != null
          ? String(fd.averageOrderValue)
          : p.avgOrderValueETB != null
            ? String(p.avgOrderValueETB)
            : '',
      profitMarginPercentage: Number(fd.profitMarginPercentage ?? 25),
      averageDailyCustomers: fd.averageDailyCustomers != null ? String(fd.averageDailyCustomers) : '',
      averageMonthlyRevenue: fd.averageMonthlyRevenue != null ? String(fd.averageMonthlyRevenue) : '',
      averageMonthlyProfit: fd.averageMonthlyProfit != null ? String(fd.averageMonthlyProfit) : '',
      audienceGender: Array.isArray(ta.gender) ? (ta.gender as string[]) : [],
      audienceAgeRanges: Array.isArray(ta.ageRange)
        ? (ta.ageRange as string[])
        : Array.isArray(p.targetAudienceAgeRanges)
          ? (p.targetAudienceAgeRanges as string[])
          : [],
      audienceLocations: Array.isArray(ta.locations) ? (ta.locations as string[]) : [],
      audienceInterests: Array.isArray(ta.interests) ? (ta.interests as string[]) : [],
      incomeLevel: String(ta.incomeLevel || 'Middle'),
      marketingGoals: Array.isArray(p.marketingGoals)
        ? (p.marketingGoals as string[])
        : Array.isArray(p.promotionGoals)
          ? (p.promotionGoals as string[])
          : [],
      primaryKpis: Array.isArray(p.primaryKpis) ? (p.primaryKpis as string[]) : [],
      brandVoice: String(p.brandVoice || 'Professional'),
      selectedPlatforms: Array.isArray(p.selectedPlatforms) ? (p.selectedPlatforms as string[]) : [],
      preferredPromotionTypes: Array.isArray(p.preferredPromotionTypes)
        ? (p.preferredPromotionTypes as string[])
        : [],
      preferredPromoterTypes: Array.isArray(p.preferredPromoterTypes)
        ? (p.preferredPromoterTypes as string[])
        : [],
      promotersNeededCount: String(p.promotersNeededCount || ''),
      monthlyBudget: typeof p.monthlyBudget === 'number' ? p.monthlyBudget : 50_000,
      maxSpendPerPostETB: typeof p.budget === 'number' ? p.budget : 15_000,
      minEngagementPercent: p.minEngagement != null ? String(p.minEngagement) : '3',
      hasRunAdsBefore: Boolean(mh.hasRunAdsBefore),
      pastPlatforms: Array.isArray(mh.pastPlatforms) ? (mh.pastPlatforms as string[]) : [],
      marketingHistoryNotes: String(mh.notes || ''),
      monthlyAdSpendETB: mh.monthlyAdSpendETB != null ? String(mh.monthlyAdSpendETB) : '',
      repeatCustomerRate: Number(ca.repeatCustomerRate) || 0,
      topCustomerSegments: Array.isArray(ca.topCustomerSegments) ? (ca.topCustomerSegments as string[]) : [],
      peakHours: Array.isArray(ca.peakHours) ? (ca.peakHours as string[]) : [],
      seasonalNotes: String(ca.seasonalNotes || ''),
    });
    setHydrated(true);
  }, [profile, hydrated]);

  const patch = useCallback(<K extends keyof BusinessOnboardingForm>(key: K, value: BusinessOnboardingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const completion = useMemo(() => computeCompletion(form), [form]);

  return { form, setForm, patch, completion, hydrated };
}
