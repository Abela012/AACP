export const BUSINESS_CATEGORIES = [
  'Coffee House',
  'Restaurant',
  'Bakery',
  'Hotel',
  'Clothing Store',
  'Gym',
  'Beauty Salon',
  'Electronics',
  'Supermarket',
  'Pharmacy',
  'Technology',
  'Healthcare',
  'Education',
  'E-commerce',
  'Food & Beverage',
  'Other',
] as const;

export const PRICE_RANGES = [
  { value: 'budget', label: 'Budget-friendly' },
  { value: 'mid', label: 'Mid-range' },
  { value: 'premium', label: 'Premium' },
] as const;

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '200+'] as const;
export const AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45+'] as const;
export const GENDER_OPTIONS = ['Mixed', 'Mostly male', 'Mostly female', 'All genders'] as const;
export const INCOME_LEVELS = ['Low', 'Middle', 'Upper-middle', 'High', 'Mixed'] as const;
export const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook', 'Telegram'] as const;
export const MARKETING_GOALS = [
  'More customers',
  'Online visibility',
  'Product promotion',
  'Brand awareness',
  'Lead generation',
  'Launch / relaunch',
] as const;
export const KPI_OPTIONS = ['Sales / orders', 'Leads & inquiries', 'Brand awareness', 'App installs', 'Store foot traffic'] as const;
export const BRAND_VOICE_OPTIONS = ['Professional', 'Friendly', 'Bold & premium', 'Educational', 'Playful'] as const;
export const PROMOTION_TYPES = [
  'Short-form video (Reels/TikTok)',
  'Static posts & carousels',
  'Stories & UGC',
  'Live or event coverage',
  'Reviews & testimonials',
  'Affiliate / codes',
] as const;
export const PROMOTER_TYPES = [
  'Micro creators (10K–100K)',
  'Mid-tier creators',
  'Local / niche creators',
  'Professional creators',
] as const;
export const PEAK_HOURS = ['Morning (6–11)', 'Midday (11–14)', 'Afternoon (14–18)', 'Evening (18–22)', 'Late night'] as const;
export const AUDIENCE_INTERESTS = [
  'Food & dining',
  'Fitness',
  'Fashion',
  'Tech',
  'Family',
  'Students',
  'Professionals',
  'Tourists',
  'Local community',
] as const;

export const ONBOARDING_STEPS = [
  { id: 1, key: 'basic', title: 'Basic info', subtitle: 'Contact & identity' },
  { id: 2, key: 'businessProfile', title: 'Business profile', subtitle: 'Category & brand' },
  { id: 3, key: 'capacity', title: 'Capacity', subtitle: 'Operations' },
  { id: 4, key: 'financial', title: 'Financials', subtitle: 'Private ETB data' },
  { id: 5, key: 'audience', title: 'Audience', subtitle: 'Who you serve' },
  { id: 6, key: 'marketing', title: 'Marketing', subtitle: 'Goals & channels' },
  { id: 7, key: 'analytics', title: 'Customers', subtitle: 'Analytics' },
  { id: 8, key: 'review', title: 'Review', subtitle: 'Finish' },
] as const;

export const MONTHLY_BUDGET_MIN_ETB = 5_000;
export const MONTHLY_BUDGET_MAX_ETB = 2_000_000;
export const MONTHLY_BUDGET_STEP_ETB = 5_000;

export const formatBirr = (amount: number) =>
  new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(amount);
