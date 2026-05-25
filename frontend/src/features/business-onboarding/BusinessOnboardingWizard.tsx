import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  BarChart3,
  Target,
  Megaphone,
  LineChart,
  CheckCircle2,
  Camera,
  Save,
  Lock,
  Plus,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/src/shared/utils/cn';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { useApiClient } from '@/src/api/apiClient';
import { userApi } from '@/src/api/userApi';
import { useBusinessOnboarding } from './useBusinessOnboarding';
import { validateStep } from './validation';
import { buildProfilePayload } from './buildPayload';
import {
  ONBOARDING_STEPS,
  BUSINESS_CATEGORIES,
  PRICE_RANGES,
  COMPANY_SIZES,
  AGE_RANGES,
  GENDER_OPTIONS,
  INCOME_LEVELS,
  PLATFORM_OPTIONS,
  MARKETING_GOALS,
  KPI_OPTIONS,
  PROMOTION_TYPES,
  PROMOTER_TYPES,
  PEAK_HOURS,
  AUDIENCE_INTERESTS,
  MONTHLY_BUDGET_MIN_ETB,
  MONTHLY_BUDGET_MAX_ETB,
  MONTHLY_BUDGET_STEP_ETB,
  formatBirr,
} from './constants';
import ReviewSummary from './ReviewSummary';
import CompletionProgress from '@/src/components/onboarding/CompletionProgress';
import SectionCard from '@/src/components/onboarding/SectionCard';
import FormField, { inputClass } from '@/src/components/onboarding/FormField';
import MultiTagSelector from '@/src/components/onboarding/MultiTagSelector';
import PercentageSlider from '@/src/components/onboarding/PercentageSlider';
import CurrencyInput from '@/src/components/onboarding/CurrencyInput';

type Props = {
  isInsideDashboard?: boolean;
  mode?: 'onboarding' | 'edit';
};

export default function BusinessOnboardingWizard({ isInsideDashboard, mode = 'onboarding' }: Props) {
  const navigate = useNavigate();
  const api = useApiClient();
  const { setOnboardingStatus } = useUser();
  const { profile, refreshProfile } = useProfile();
  const isApproved =
    profile?.status === 'active' ||
    profile?.status === 'approved' ||
    (profile as { onboardingStatus?: string })?.onboardingStatus === 'approved';
  const isEditMode = mode === 'edit' || isApproved;
  const { form, patch, completion, hydrated } = useBusinessOnboarding();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLicense, setIsUploadingLicense] = useState(false);

  const currentMeta = ONBOARDING_STEPS.find((s) => s.id === step)!;

  const goNext = () => {
    const result = validateStep(step, form);
    setErrors(result.errors);
    if (!result.valid) {
      toast.error('Please complete required fields before continuing.');
      return;
    }
    setStep((s) => Math.min(8, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const profileData = buildProfilePayload(form);
      await userApi.updateProfile(api, {
        firstName: form.firstName,
        lastName: form.lastName,
        profilePicture: form.profilePicture,
        bio: form.brandDescription,
        location: form.businessLocation,
        tradeLicenseUrl: form.tradeLicenseUrl,
        profileData,
      });
      toast.success('Progress saved');
      await refreshProfile();
    } catch {
      toast.error('Could not save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    const result = validateStep(8, form);
    setErrors(result.errors);
    if (!result.valid) {
      toast.error('Complete all required sections before submitting.');
      setStep(1);
      return;
    }
    setIsSubmitting(true);
    try {
      const profileData = buildProfilePayload(form);
      const body = {
        firstName: form.firstName,
        lastName: form.lastName,
        profilePicture: form.profilePicture,
        bio: form.brandDescription.trim() || undefined,
        location: form.businessLocation,
        tradeLicenseUrl: form.tradeLicenseUrl,
        profileData,
      };

      const res = await userApi.submitProfile(api, body);
      const payload = (res.data as { data?: { appliedDirectly?: boolean }; appliedDirectly?: boolean })?.data ?? res.data;
      const appliedDirectly = payload?.appliedDirectly === true;

      await refreshProfile();

      if (appliedDirectly) {
        toast.success('Profile saved successfully.');
        if (isEditMode) {
          navigate('/profile/view/business');
          return;
        }
      } else if (isApproved) {
        toast.success('Changes submitted — admin will review updates to required fields.');
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = useCallback(
    async (file: File, type: 'avatar' | 'license') => {
      const formData = new FormData();
      formData.append('image', file);
      const query = type === 'license' ? '?type=license' : '?type=avatar';
      const res = await api.post(`/users/profile/picture${query}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.user as { profilePicture?: string; tradeLicenseUrl?: string };
    },
    [api]
  );

  if (!hydrated) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#111] rounded-3xl border p-10 max-w-md w-full text-center shadow-xl">
          <CheckCircle2 size={48} className="text-primary-blue mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Profile submitted</h2>
          <p className="text-sm text-gray-500 mb-6">Our team will review your business profile within 24–48 hours.</p>
          <button
            type="button"
            onClick={() => {
              setOnboardingStatus('pending');
              navigate('/dashboard');
            }}
            className="w-full bg-primary-blue text-black font-bold py-3 rounded-2xl"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a]', isInsideDashboard && 'min-h-0')}>
      {!isInsideDashboard && (
        <header className="text-center pt-8 pb-4 px-4 max-w-3xl mx-auto">
          <p className="text-sm font-bold text-gray-500 mb-1">AACP Business Onboarding</p>
          <h1 className="text-3xl font-black text-primary-blue">
            {isEditMode ? 'Business profile' : 'AI-ready business profile'}
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            Structured data helps us predict campaign performance, audience match, and ROI in Ethiopian Birr (ETB).
          </p>
        </header>
      )}

      <div className="max-w-3xl mx-auto px-4 pb-32 space-y-6">
        <div className="p-4 rounded-2xl bg-neutral-border/15 dark:bg-primary-blue/10 border border-neutral-border/25 dark:border-primary-blue/20 text-sm text-gray-700 dark:text-gray-300">
          <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Better data, better AI insights</p>
          <p>
            The more you complete your profile, the more accurate our campaign suggestions and performance
            predictions will be. Optional sections can be filled anytime — empty fields are saved as blank.
          </p>
        </div>

        <CompletionProgress step={step} completion={completion} onStepClick={setStep} />

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-bold text-primary-blue">Step {step} of 8</span>
          <span>·</span>
          <span>{currentMeta.title}</span>
          <span className="text-gray-400">— {currentMeta.subtitle}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <SectionCard icon={<Users size={20} />} title="Basic business info" description="Contact and legal details">
                <div className="flex flex-col items-center mb-6">
                  <label className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary-blue/20 cursor-pointer group">
                    <img
                      src={
                        form.profilePicture ||
                        `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=10b981&color=fff`
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                      <Camera size={22} />
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingAvatar(true);
                        try {
                          const u = await uploadFile(file, 'avatar');
                          if (u.profilePicture) patch('profilePicture', u.profilePicture);
                        } finally {
                          setIsUploadingAvatar(false);
                        }
                      }}
                    />
                  </label>
                  {isUploadingAvatar && <p className="text-xs mt-2 text-gray-500">Uploading…</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="First name" required error={errors.firstName}>
                    <input className={inputClass} value={form.firstName} onChange={(e) => patch('firstName', e.target.value)} />
                  </FormField>
                  <FormField label="Last name" required error={errors.lastName}>
                    <input className={inputClass} value={form.lastName} onChange={(e) => patch('lastName', e.target.value)} />
                  </FormField>
                </div>
                <FormField label="Phone" helper="Used for account verification." example="+251 911 234 567" required error={errors.phone}>
                  <input className={inputClass} value={form.phone} onChange={(e) => patch('phone', e.target.value)} placeholder="+251 …" />
                </FormField>
                <FormField label="Business name" required error={errors.businessName}>
                  <input className={inputClass} value={form.businessName} onChange={(e) => patch('businessName', e.target.value)} placeholder="Abebe Coffee House" />
                </FormField>
                <FormField label="Business location" helper="City, sub-city, or landmark." example="Bole, Addis Ababa" required error={errors.businessLocation}>
                  <input className={inputClass} value={form.businessLocation} onChange={(e) => patch('businessLocation', e.target.value)} />
                </FormField>
                <FormField label="Trade license" helper="Upload a clear photo or PDF of your business license." required error={errors.tradeLicenseUrl}>
                  {form.tradeLicenseUrl ? (
                    <div className="flex flex-col items-center p-4 border border-neutral-border/25 dark:border-primary-blue/20 bg-neutral-border/15/30 dark:bg-primary-blue/5 rounded-2xl">
                      {form.tradeLicenseUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center font-bold text-xs">PDF</div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Trade License Document</p>
                            <a
                              href={form.tradeLicenseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-blue hover:underline font-semibold"
                            >
                              View uploaded PDF
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group mb-3 w-full max-h-48 overflow-hidden rounded-xl border border-gray-100 bg-white">
                          <img
                            src={form.tradeLicenseUrl}
                            alt="Trade License"
                            className="w-full h-full object-contain max-h-48"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a
                              href={form.tradeLicenseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white bg-primary-blue px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-blue transition-colors"
                            >
                              Open Full Image
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <label className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer transition-colors bg-white dark:bg-white/5 border border-red-200 dark:border-red-500/20 px-4 py-2 rounded-xl">
                        Replace File
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploadingLicense(true);
                            try {
                              const u = await uploadFile(file, 'license');
                              if (u.tradeLicenseUrl) patch('tradeLicenseUrl', u.tradeLicenseUrl);
                            } finally {
                              setIsUploadingLicense(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-8 cursor-pointer hover:border-neutral-border transition-colors w-full">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingLicense(true);
                          try {
                            const u = await uploadFile(file, 'license');
                            if (u.tradeLicenseUrl) patch('tradeLicenseUrl', u.tradeLicenseUrl);
                          } finally {
                            setIsUploadingLicense(false);
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3">
                        <Camera size={20} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {isUploadingLicense ? 'Uploading document...' : 'Click to upload'}
                      </span>
                      <span className="text-xs text-gray-400">PDF, PNG, JPG, or JPEG up to 10MB</span>
                    </label>
                  )}
                </FormField>
              </SectionCard>
            )}

            {step === 2 && (
              <SectionCard icon={<Building2 size={20} />} title="Business profile" description="How customers perceive your brand">
                <FormField label="Business category" helper="Choose the closest match." required error={errors.businessCategory}>
                  <select
                    className={inputClass}
                    value={form.businessCategory}
                    onChange={(e) => patch('businessCategory', e.target.value)}
                  >
                    <option value="">Select category…</option>
                    {BUSINESS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Business tags" helper="Add keywords that describe your business (press Enter).">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.businessTags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-blue/10 text-xs font-bold">
                        {t}
                        <button type="button" onClick={() => patch('businessTags', form.businessTags.filter((x) => x !== t))}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          if (!form.businessTags.includes(tagInput.trim())) {
                            patch('businessTags', [...form.businessTags, tagInput.trim()]);
                          }
                          setTagInput('');
                        }
                      }}
                      placeholder="e.g. specialty coffee, brunch"
                    />
                    <button
                      type="button"
                      className="px-3 rounded-xl bg-gray-100 dark:bg-white/10"
                      onClick={() => {
                        if (tagInput.trim() && !form.businessTags.includes(tagInput.trim())) {
                          patch('businessTags', [...form.businessTags, tagInput.trim()]);
                          setTagInput('');
                        }
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </FormField>
                <FormField label="Price range" helper="Typical price level for your customers.">
                  <select className={inputClass} value={form.priceRange} onChange={(e) => patch('priceRange', e.target.value)}>
                    {PRICE_RANGES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Years in business" example="3">
                  <input className={inputClass} value={form.businessAgeYears} onChange={(e) => patch('businessAgeYears', e.target.value)} placeholder="5" />
                </FormField>
                <FormField label="Opening hours (optional)" example="Mon–Sat 7:00–22:00">
                  <input className={inputClass} value={form.openingHours} onChange={(e) => patch('openingHours', e.target.value)} />
                </FormField>
                <FormField label="Brand description (optional)" helper="What makes your business unique? Helps AI tailor suggestions.">
                  <textarea
                    className={inputClass + ' min-h-[100px]'}
                    value={form.brandDescription}
                    onChange={(e) => patch('brandDescription', e.target.value)}
                    placeholder="We serve specialty Ethiopian coffee with a modern café experience…"
                  />
                </FormField>
                <FormField label="Services offered">
                  <input className={inputClass} value={form.servicesOffered} onChange={(e) => patch('servicesOffered', e.target.value)} placeholder="Dine-in, delivery, catering" />
                </FormField>
                <FormField label="Website (optional)">
                  <input className={inputClass} value={form.websiteUrl} onChange={(e) => patch('websiteUrl', e.target.value)} placeholder="https://…" />
                </FormField>
              </SectionCard>
            )}

            {step === 3 && (
              <SectionCard icon={<BarChart3 size={20} />} title="Capacity & operations" description="Optional — improves operational insights">
                <FormField label="Daily customer capacity (optional)" helper="Typical customers served per day." example="120">
                  <input className={inputClass} value={form.dailyCustomerCapacity} onChange={(e) => patch('dailyCustomerCapacity', e.target.value)} placeholder="120" />
                </FormField>
                <FormField label="Company size">
                  <select className={inputClass} value={form.companySize} onChange={(e) => patch('companySize', e.target.value)}>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s} employees
                      </option>
                    ))}
                  </select>
                </FormField>
              </SectionCard>
            )}

            {step === 4 && (
              <SectionCard
                icon={<Lock size={20} />}
                title="Financial information"
                description="Private — used only for AI marketing predictions"
              >
                <p className="text-xs text-gray-500 bg-gray-50 dark:bg-white/5 rounded-xl p-3 mb-4 border border-gray-100 dark:border-white/10">
                  This information is private and only used for AI marketing predictions. It is not shown publicly.
                </p>
                <CurrencyInput
                  label="Average order value"
                  helper="Average amount customers spend per order."
                  example="250 ETB"
                  value={form.averageOrderValue}
                  onChange={(v) => patch('averageOrderValue', v)}
                  error={errors.averageOrderValue}
                  required
                  placeholder="250"
                />
                <PercentageSlider
                  label="Profit margin"
                  helper="Approximate profit margin after costs."
                  value={form.profitMarginPercentage}
                  onChange={(v) => patch('profitMarginPercentage', v)}
                />
                {errors.profitMarginPercentage && (
                  <p className="text-xs text-red-600 -mt-2">{errors.profitMarginPercentage}</p>
                )}
                <CurrencyInput
                  label="Average daily customers"
                  value={form.averageDailyCustomers}
                  onChange={(v) => patch('averageDailyCustomers', v)}
                  placeholder="80"
                />
                <CurrencyInput
                  label="Average monthly revenue"
                  value={form.averageMonthlyRevenue}
                  onChange={(v) => patch('averageMonthlyRevenue', v)}
                  placeholder="150000"
                />
                <CurrencyInput
                  label="Average monthly profit"
                  value={form.averageMonthlyProfit}
                  onChange={(v) => patch('averageMonthlyProfit', v)}
                  placeholder="45000"
                />
              </SectionCard>
            )}

            {step === 5 && (
              <SectionCard icon={<Target size={20} />} title="Target audience">
                <MultiTagSelector
                  label="Audience gender"
                  options={GENDER_OPTIONS}
                  selected={form.audienceGender}
                  onChange={(v) => patch('audienceGender', v)}
                  error={errors.audienceGender}
                />
                <MultiTagSelector
                  label="Age ranges"
                  options={AGE_RANGES}
                  selected={form.audienceAgeRanges}
                  onChange={(v) => patch('audienceAgeRanges', v)}
                  error={errors.audienceAgeRanges}
                />
                <MultiTagSelector
                  label="Interests"
                  options={AUDIENCE_INTERESTS}
                  selected={form.audienceInterests}
                  onChange={(v) => patch('audienceInterests', v)}
                />
                <FormField label="Income level">
                  <select className={inputClass} value={form.incomeLevel} onChange={(e) => patch('incomeLevel', e.target.value)}>
                    {INCOME_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Locations" helper="Areas where your customers come from.">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.audienceLocations.map((loc) => (
                      <span key={loc} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold">
                        {loc}
                        <button type="button" onClick={() => patch('audienceLocations', form.audienceLocations.filter((x) => x !== loc))}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Bole, Sarbet…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && locationInput.trim()) {
                          e.preventDefault();
                          patch('audienceLocations', [...form.audienceLocations, locationInput.trim()]);
                          setLocationInput('');
                        }
                      }}
                    />
                  </div>
                </FormField>
              </SectionCard>
            )}

            {step === 6 && (
              <SectionCard icon={<Megaphone size={20} />} title="Marketing goals">
                <MultiTagSelector
                  label="Marketing goals"
                  options={MARKETING_GOALS}
                  selected={form.marketingGoals}
                  onChange={(v) => patch('marketingGoals', v)}
                  error={errors.marketingGoals}
                />
                <MultiTagSelector label="Primary KPIs" options={KPI_OPTIONS} selected={form.primaryKpis} onChange={(v) => patch('primaryKpis', v)} />
                <MultiTagSelector
                  label="Platforms"
                  options={PLATFORM_OPTIONS}
                  selected={form.selectedPlatforms}
                  onChange={(v) => patch('selectedPlatforms', v)}
                  error={errors.selectedPlatforms}
                />
                <MultiTagSelector label="Promotion types" options={PROMOTION_TYPES} selected={form.preferredPromotionTypes} onChange={(v) => patch('preferredPromotionTypes', v)} />
                <MultiTagSelector label="Promoter types" options={PROMOTER_TYPES} selected={form.preferredPromoterTypes} onChange={(v) => patch('preferredPromoterTypes', v)} />
                <FormField label="Monthly marketing budget (ETB)" helper={`${formatBirr(MONTHLY_BUDGET_MIN_ETB)} – ${formatBirr(MONTHLY_BUDGET_MAX_ETB)}`}>
                  <input
                    type="range"
                    min={MONTHLY_BUDGET_MIN_ETB}
                    max={MONTHLY_BUDGET_MAX_ETB}
                    step={MONTHLY_BUDGET_STEP_ETB}
                    value={form.monthlyBudget}
                    onChange={(e) => patch('monthlyBudget', Number(e.target.value))}
                    className="w-full accent-primary-blue"
                  />
                  <p className="text-sm font-black text-primary-blue mt-1">{formatBirr(form.monthlyBudget)}</p>
                </FormField>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={form.hasRunAdsBefore} onChange={(e) => patch('hasRunAdsBefore', e.target.checked)} />
                  We have run paid ads before
                </label>
                {form.hasRunAdsBefore && (
                  <>
                    <MultiTagSelector label="Past platforms" options={PLATFORM_OPTIONS} selected={form.pastPlatforms} onChange={(v) => patch('pastPlatforms', v)} />
                    <CurrencyInput label="Monthly ad spend (ETB)" value={form.monthlyAdSpendETB} onChange={(v) => patch('monthlyAdSpendETB', v)} />
                    <FormField label="Notes">
                      <textarea className={inputClass + ' min-h-[80px]'} value={form.marketingHistoryNotes} onChange={(e) => patch('marketingHistoryNotes', e.target.value)} />
                    </FormField>
                  </>
                )}
              </SectionCard>
            )}

            {step === 7 && (
              <SectionCard icon={<LineChart size={20} />} title="Customer analytics">
                <PercentageSlider
                  label="Repeat customer rate"
                  helper="Percentage of customers who return."
                  value={form.repeatCustomerRate}
                  onChange={(v) => patch('repeatCustomerRate', v)}
                />
                <MultiTagSelector label="Peak hours" options={PEAK_HOURS} selected={form.peakHours} onChange={(v) => patch('peakHours', v)} />
                <FormField label="Top customer segments" helper="e.g. office workers, students">
                  <input
                    className={inputClass}
                    value={form.topCustomerSegments.join(', ')}
                    onChange={(e) =>
                      patch(
                        'topCustomerSegments',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="Office workers, tourists"
                  />
                </FormField>
                <FormField label="Seasonal notes">
                  <textarea className={inputClass + ' min-h-[80px]'} value={form.seasonalNotes} onChange={(e) => patch('seasonalNotes', e.target.value)} placeholder="Busier during holidays…" />
                </FormField>
              </SectionCard>
            )}

            {step === 8 && (
              <SectionCard icon={<CheckCircle2 size={20} />} title="Review & finish" description="Confirm your details before submitting">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">Completion</p>
                    <p className="font-bold text-primary-blue">{completion.percent}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">AI readiness</p>
                    <p className="font-bold">{completion.aiReadiness}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">Data quality</p>
                    <p className="font-bold">{completion.dataQuality}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">Monthly budget</p>
                    <p className="font-bold">{formatBirr(form.monthlyBudget)}</p>
                  </div>
                </div>

                {completion.missingSections.length > 0 && (
                  <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 text-sm">
                    <p className="font-bold text-amber-800 dark:text-amber-300 mb-2">
                      Optional sections you can complete later
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                      You can still submit now. Filling these in later will improve AI campaign suggestions.
                    </p>
                    <ul className="list-disc list-inside text-amber-700 dark:text-amber-400 text-xs space-y-1">
                      {completion.missingSections.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <ReviewSummary form={form} />
              </SectionCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#111]/95 backdrop-blur border-t border-gray-100 dark:border-white/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {step > 1 && (
            <button type="button" onClick={goBack} className="px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-1">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button
            type="button"
            onClick={saveDraft}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-1 ml-auto"
          >
            <Save size={16} /> {isSaving ? 'Saving…' : 'Save'}
          </button>
          {step < 8 ? (
            <button type="button" onClick={goNext} className="px-6 py-2.5 rounded-xl bg-primary-blue text-black font-bold text-sm flex items-center gap-1">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary-blue text-black font-bold text-sm"
            >
              {isSubmitting
                ? 'Submitting…'
                : isApproved
                  ? 'Save profile'
                  : 'Submit for review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
