import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaYoutube, FaInstagram, FaLinkedin, FaFacebook, FaTiktok } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  X,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  ChevronDown,
  Lightbulb,
  Save,
  ArrowRight,
  Sparkles,
  BarChart3,
  Building2,
  Users,
  Camera,
  ShieldCheck,
  Award,
  Video,
  DollarSign,
  Link as LinkIcon,
  MessageSquare
} from 'lucide-react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { cn } from '@/src/shared/utils/cn';
import { useApiClient } from '@/src/api/apiClient';
import { userApi } from '@/src/api/userApi';
import { socialApi } from '../../../api/socialApi';
import { facebookAnalyticsApi } from '../../../api/facebookAnalyticsApi';
import type { SocialConnection } from '../../../api/socialApi';
import { toast } from 'react-hot-toast';
import AdvertiserCompleteProfile from './AdvertiserCompleteProfile';
import { SocialConnectionModal } from '../components/SocialConnectionModal';

/* ─── Types ─── */
interface TagItem {
  label: string;
  removable?: boolean;
}

/* ─── Reusable sub-components ─── */

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/6 p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-aacp-olive dark:text-aacp-gold">{icon}</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
      </div>
      {children}
    </motion.section>
  );
}

function TagPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200',
        selected
          ? 'bg-aacp-olive text-white border-aacp-olive shadow-sm shadow-aacp-olive/20'
          : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-emerald-300 hover:text-aacp-olive dark:hover:text-aacp-gold'
      )}
    >
      {label}
    </button>
  );
}

function RemovableTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-aacp-olive text-white shadow-sm shadow-aacp-olive/20">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
      >
        <X size={14} />
      </button>
    </span>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  icon,
  type = 'text',
  prefix,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  type?: string;
  prefix?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-0 top-0 bottom-0 flex items-center px-3 text-xs font-bold text-aacp-olive bg-aacp-gold/15 dark:bg-aacp-olive/10 dark:text-aacp-gold rounded-l-xl border-r border-gray-200 dark:border-white/10">
            {prefix}
          </span>
        )}
        {icon && !prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
            'focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 transition-all duration-200',
            prefix ? 'pl-16 pr-4' : icon ? 'pl-10 pr-4' : 'pl-4 pr-4'
          )}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 transition-all duration-200 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

const countryCodes = [
  { code: '+251', country: 'ET', flag: '🇪🇹' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+254', country: 'KE', flag: '🇰🇪' },
  { code: '+234', country: 'NG', flag: '🇳🇬' },
  { code: '+27', country: 'ZA', flag: '🇿🇦' },
  { code: '+251', country: 'DJ', flag: '🇩🇯' },
  { code: '+252', country: 'SO', flag: '🇸🇴' },
  { code: '+249', country: 'SD', flag: '🇸🇩' },
  { code: '+211', country: 'SS', flag: '🇸🇸' },
  { code: '+256', country: 'UG', flag: '🇺🇬' },
  { code: '+250', country: 'RW', flag: '🇷🇼' },
  { code: '+255', country: 'TZ', flag: '🇹🇿' },
];

function PhoneInputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [selectedCode, setSelectedCode] = useState(() => {
    const match = value.match(/^(\+\d+)/);
    return match ? match[1] : '+251';
  });

  const [number, setNumber] = useState(() => {
    const codeMatch = value.match(/^(\+\d+)/);
    if (codeMatch) {
      return value.replace(codeMatch[1], '').trim();
    }
    return value;
  });

  const handleCodeChange = (newCode: string) => {
    setSelectedCode(newCode);
    onChange(`${newCode} ${number}`.trim());
  };

  const handleNumberChange = (newNumber: string) => {
    const cleaned = newNumber.replace(/\D/g, '');
    setNumber(cleaned);
    onChange(`${selectedCode} ${cleaned}`.trim());
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
        {label}
      </label>
      <div className="flex gap-2">
        <div className="relative w-32 shrink-0">
          <select
            value={selectedCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl pl-3 pr-8 py-3 text-sm text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 transition-all duration-200 cursor-pointer"
          >
            {countryCodes.map((c) => (
              <option key={`${c.country}-${c.code}`} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <input
          type="tel"
          value={number}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="912 345 678"
          className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 transition-all duration-200"
        />
      </div>
    </div>
  );
}

const parseMetric = (val: string | number): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.toString().toUpperCase().replace(/[^0-9.KMB]/g, '');
  let multiplier = 1;
  if (cleaned.endsWith('K')) multiplier = 1000;
  else if (cleaned.endsWith('M')) multiplier = 1000000;
  else if (cleaned.endsWith('B')) multiplier = 1000000000;

  const num = parseFloat(cleaned.replace(/[KMB]/g, ''));
  return isNaN(num) ? 0 : num * multiplier;
};

const formatMetric = (num: number | undefined): string => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
};

export default function CompleteProfilePage({ isInsideDashboard = false }: { isInsideDashboard?: boolean }) {
  const { userRole, setOnboardingStatus } = useUser();
  const { user: clerkUser } = useClerkUser();
  const { profile, updateProfile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApiClient();

  const isBusiness = location.pathname.includes('/business') || userRole === 'business_owner';

  /* ── Shared state ── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [phone, setPhone] = useState('');

  /* ── Business-specific state ── */
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Food & Beverage');
  const [businessLocation, setBusinessLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companySize, setCompanySize] = useState('1-10');
  const [targetAudienceTags, setTargetAudienceTags] = useState<TagItem[]>([]);
  const [newAudienceTag, setNewAudienceTag] = useState('');
  const [showAudienceInput, setShowAudienceInput] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(50000);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [brandDescription, setBrandDescription] = useState('');
  const [tradeLicenseUrl, setTradeLicenseUrl] = useState('');
  const [isUploadingLicense, setIsUploadingLicense] = useState(false);
  const [servicesOffered, setServicesOffered] = useState('');
  const [promotionGoals, setPromotionGoals] = useState<string[]>([]);
  const [preferredPromotionTypes, setPreferredPromotionTypes] = useState<string[]>([]);
  const [preferredPromoterTypes, setPreferredPromoterTypes] = useState<string[]>([]);
  const [promotersNeededCount, setPromotersNeededCount] = useState('');
  const [maxSpendPerPostETB, setMaxSpendPerPostETB] = useState(15000);
  const [minEngagementPercent, setMinEngagementPercent] = useState('3');
  const [avgOrderValueETB, setAvgOrderValueETB] = useState('');
  const [brandVoice, setBrandVoice] = useState('Friendly');
  const [primaryKpis, setPrimaryKpis] = useState<string[]>([]);
  const [targetAudienceAgeRanges, setTargetAudienceAgeRanges] = useState<string[]>([]);

  /* ── Advertiser Onboarding State (For User Onboarding Form) ── */
  const [advNiche, setAdvNiche] = useState('Comedy');
  const [advExperience, setAdvExperience] = useState('Rising Star (1-2 years)');
  const [advFormats, setAdvFormats] = useState<string[]>([]);
  const [advTargetAudience, setAdvTargetAudience] = useState('Gen Z (13-24)');
  const [advRate, setAdvRate] = useState('');
  const [advBrands, setAdvBrands] = useState('');
  const [advLinks, setAdvLinks] = useState('');
  const [advNotes, setAdvNotes] = useState('');

  /* ── Auto-fetched TikTok metrics ── */
  const [tiktokMetricsData, setTiktokMetricsData] = useState<any>(null);
  const [isLoadingTikTokMetrics, setIsLoadingTikTokMetrics] = useState(false);

  // Sync Clerk Info
  useEffect(() => {
    if (clerkUser) {
      setFirstName(prev => prev || clerkUser.firstName || '');
      setLastName(prev => prev || clerkUser.lastName || '');
      setProfilePicture(prev => prev || clerkUser.imageUrl || '');
    }
  }, [clerkUser]);

  // Fetch TikTok Profile metrics for Advertiser on mount
  useEffect(() => {
    if (!isBusiness && userRole === 'advertiser') {
      const loadAdvertiserMetrics = async () => {
        setIsLoadingTikTokMetrics(true);
        try {
          const res = await userApi.getAdvertiserProfile(api);
          if (res.data && res.data.user) {
            setTiktokMetricsData(res.data.user);
            // Prepopulate some fields if they exist in DB
            const profileInfo = res.data.user.profileInfo;
            if (profileInfo) {
              if (profileInfo.niche) setAdvNiche(profileInfo.niche);
              if (profileInfo.experienceLevel) setAdvExperience(profileInfo.experienceLevel);
              if (Array.isArray(profileInfo.contentFormats)) setAdvFormats(profileInfo.contentFormats);
              if (profileInfo.targetAudience) setAdvTargetAudience(profileInfo.targetAudience);
              if (profileInfo.rateExpectations) setAdvRate(String(profileInfo.rateExpectations));
              if (profileInfo.brands) setAdvBrands(profileInfo.brands);
              if (profileInfo.links) setAdvLinks(profileInfo.links);
              if (profileInfo.additionalNotes) setAdvNotes(profileInfo.additionalNotes);
            }
          }
        } catch (err) {
          console.error("Failed to load advertiser profile metrics:", err);
        } finally {
          setIsLoadingTikTokMetrics(false);
        }
      };
      loadAdvertiserMetrics();
    }
  }, [isBusiness, userRole, api]);

  // Sync Business Profile Info from DB
  useEffect(() => {
    if (!profile?._id || !isBusiness) return;
    const p = profile as unknown as Record<string, unknown>;
    if (typeof p.businessName === 'string' && p.businessName) setBusinessName(p.businessName);
    if (typeof p.industry === 'string' && p.industry) setIndustry(p.industry);
    if (typeof p.businessLocation === 'string' && p.businessLocation) setBusinessLocation(p.businessLocation);
    if (typeof p.website === 'string' && p.website) setWebsiteUrl(p.website);
    if (typeof p.companySize === 'string' && p.companySize) setCompanySize(p.companySize);
    if (typeof p.bio === 'string' && p.bio) setBrandDescription(p.bio);
    if (Array.isArray(p.targetAudienceTags) && p.targetAudienceTags.length) {
      setTargetAudienceTags((p.targetAudienceTags as string[]).map((label) => ({ label, removable: true })));
    }
    if (typeof p.monthlyBudget === 'number' && p.monthlyBudget > 0) setMonthlyBudget(p.monthlyBudget);
    if (Array.isArray(p.selectedPlatforms) && p.selectedPlatforms.length) setSelectedPlatforms(p.selectedPlatforms as string[]);
    if (typeof p.tradeLicenseUrl === 'string' && p.tradeLicenseUrl) setTradeLicenseUrl(p.tradeLicenseUrl);
    if (typeof p.servicesOffered === 'string' && p.servicesOffered) setServicesOffered(p.servicesOffered);
    if (Array.isArray(p.promotionGoals)) setPromotionGoals(p.promotionGoals as string[]);
    if (Array.isArray(p.preferredPromotionTypes)) setPreferredPromotionTypes(p.preferredPromotionTypes as string[]);
    if (Array.isArray(p.preferredPromoterTypes)) setPreferredPromoterTypes(p.preferredPromoterTypes as string[]);
    if (typeof p.promotersNeededCount === 'string' && p.promotersNeededCount) setPromotersNeededCount(p.promotersNeededCount);
    if (typeof p.budget === 'number' && p.budget > 0) setMaxSpendPerPostETB(p.budget);
    if (typeof p.minEngagement === 'number' && p.minEngagement >= 0) setMinEngagementPercent(String(p.minEngagement));
    if (typeof p.avgOrderValueETB === 'number') setAvgOrderValueETB(String(p.avgOrderValueETB));
    else if (typeof p.avgOrderValueETB === 'string' && p.avgOrderValueETB) setAvgOrderValueETB(p.avgOrderValueETB);
    if (typeof p.brandVoice === 'string' && p.brandVoice) setBrandVoice(p.brandVoice);
    if (Array.isArray(p.primaryKpis) && p.primaryKpis.length) setPrimaryKpis(p.primaryKpis as string[]);
    if (Array.isArray(p.targetAudienceAgeRanges) && p.targetAudienceAgeRanges.length) {
      setTargetAudienceAgeRanges(p.targetAudienceAgeRanges as string[]);
    }
  }, [profile, isBusiness]);

  /* ── Business Constants ── */
  const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45+'];
  const companySizes = ['1-10', '11-50', '51-200', '200+'];
  const industries = [
    'Food & Beverage', 'Fashion', 'Technology', 'Beauty', 'Real Estate',
    'Organic Agriculture', 'Healthcare', 'Education', 'E-commerce', 'Fintech', 'Other'
  ];
  const platformOptions = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn'];
  const businessGoals = [
    'More Customers', 'Brand Awareness', 'Product Promotion',
    'Online Visibility', 'Lead Generation', 'Launch / Relaunch'
  ];
  const promotionTypes = [
    'Short Videos (Reels/TikTok)', 'Photos & Carousels',
    'Stories / UGC', 'Reviews & Testimonials', 'Live Coverage'
  ];
  const promoterTypes = [
    'Local Creators', 'Micro Creators', 'Mid-tier Creators', 'Professional Creators'
  ];
  const brandVoiceOptions = ['Professional', 'Friendly', 'Luxury', 'Fun', 'Modern'];
  const kpiOptions = [
    'Sales / Orders', 'Leads & Inquiries', 'Brand Awareness', 'Store Visits', 'App Installs'
  ];
  const MONTHLY_BUDGET_MIN_ETB = 5_000;
  const MONTHLY_BUDGET_MAX_ETB = 2_000_000;
  const MONTHLY_BUDGET_STEP_ETB = 5_000;

  /* ── Advertiser Onboarding Options ── */
  const advertiserNicheOptions = [
    'Comedy', 'Fashion', 'Beauty', 'Food & Dining', 'Fitness & Health',
    'Technology & Gaming', 'Travel & Lifestyle', 'Education', 'DIY & Crafts',
    'Finance & Business', 'Pets & Animals', 'Music & Dance', 'Other'
  ];

  const advertiserExperienceOptions = [
    'Rising Star (1-2 years)',
    'Professional (3-5 years)',
    'Expert Creator (5+ years)'
  ];

  const advertiserFormatOptions = [
    'Short Videos (Reels/TikTok)',
    'Photos & Carousels',
    'UGC / Reviews',
    'Stories & Takeovers',
    'Live Streams',
    'Long-form Videos'
  ];

  const advertiserAudienceOptions = [
    'Gen Z (13-24)',
    'Millennials (25-40)',
    'Families & Parents',
    'Professionals & Entrepreneurs',
    'All Ages'
  ];

  /* ── Business Progress ── */
  const profileCompletion = useMemo(() => {
    if (!isBusiness) return 100;
    let filled = 0;
    const total = 12;
    if (businessName) filled++;
    if (industry) filled++;
    if (businessLocation) filled++;
    if (servicesOffered) filled++;
    if (companySize) filled++;
    if (brandDescription) filled++;
    if (targetAudienceTags.length > 0) filled++;
    if (monthlyBudget >= MONTHLY_BUDGET_MIN_ETB) filled++;
    if (maxSpendPerPostETB > 0) filled++;
    if (selectedPlatforms.length > 0) filled++;
    if (tradeLicenseUrl) filled++;
    if (promotionGoals.length > 0 || primaryKpis.length > 0) filled++;
    return Math.round((filled / total) * 100);
  }, [
    isBusiness, businessName, industry, businessLocation, servicesOffered,
    companySize, targetAudienceTags, brandDescription, monthlyBudget,
    maxSpendPerPostETB, selectedPlatforms, tradeLicenseUrl, promotionGoals,
    primaryKpis, MONTHLY_BUDGET_MIN_ETB
  ]);

  /* ── Handlers ── */
  const toggleBusinessGoal = (goal: string) => {
    setPromotionGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const toggleKPI = (kpi: string) => {
    setPrimaryKpis(prev => prev.includes(kpi) ? prev.filter(k => k !== kpi) : [...prev, kpi]);
  };

  const togglePromotionType = (type: string) => {
    setPreferredPromotionTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const togglePromoterType = (type: string) => {
    setPreferredPromoterTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]);
  };

  const toggleAudienceAgeRange = (range: string) => {
    setTargetAudienceAgeRanges(prev => prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]);
  };

  const addAudienceTag = useCallback(() => {
    if (newAudienceTag.trim()) {
      setTargetAudienceTags(prev => [...prev, { label: newAudienceTag.trim(), removable: true }]);
      setNewAudienceTag('');
      setShowAudienceInput(false);
    }
  }, [newAudienceTag]);

  // Submit profile logic
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isBusiness) {
        const minEng = Math.min(50, Math.max(0, parseFloat(minEngagementPercent) || 0));
        const avgOrder = avgOrderValueETB.replace(/,/g, '').trim();
        const profileData = {
          businessName,
          website: websiteUrl,
          industry,
          category: industry,
          niche: industry,
          bio: brandDescription,
          businessLocation,
          servicesOffered,
          companySize,
          targetAudienceTags: targetAudienceTags.map(t => t.label),
          targetAudienceAgeRanges,
          monthlyBudget,
          currency: 'ETB',
          budget: maxSpendPerPostETB,
          minEngagement: minEng,
          avgOrderValueETB: avgOrder ? Number(avgOrder) : undefined,
          brandVoice,
          primaryKpis,
          selectedPlatforms,
          tradeLicenseUrl,
          promotionGoals,
          preferredPromotionTypes,
          preferredPromoterTypes,
          promotersNeededCount,
          phone,
        };

        const res = await userApi.submitProfile(api, {
          firstName,
          lastName,
          profilePicture,
          bio: brandDescription,
          location: businessLocation,
          tradeLicenseUrl,
          profileData,
          socialProfiles: [],
        });

        const updatedUser = res.data.user;
        updateProfile({
          firstName,
          lastName,
          avatarUrl: profilePicture,
          status: updatedUser.status,
          ...profileData
        });

        if (updatedUser.status === 'active' || updatedUser.status === 'approved') {
          toast.success("Business profile configured successfully!");
          setOnboardingStatus('approved');
          window.location.href = '/dashboard';
        } else {
          setSubmitted(true);
        }
      } else {
        // Advertiser Profile Completion Flow
        const payload = {
          niche: advNiche,
          experienceLevel: advExperience,
          contentFormats: advFormats,
          targetAudience: advTargetAudience,
          rateExpectations: advRate ? Number(advRate) : 0,
          brands: advBrands,
          links: advLinks,
          additionalNotes: advNotes
        };

        const res = await userApi.completeAdvertiserProfile(api, payload);
        if (res.data && res.data.user) {
          toast.success("TikTok profile configured successfully!");
          setOnboardingStatus('approved');
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      console.error('Failed to submit profile:', error);
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success overlay ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/6 p-10 max-w-md w-full text-center shadow-xl"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-aacp-gold/15 dark:bg-aacp-olive/10 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-aacp-olive" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
            Profile Submitted!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            Your profile has been successfully submitted for review. Our team will verify
            your details within 24-48 hours.
          </p>
          <button
            onClick={() => {
              setOnboardingStatus('pending');
              window.location.href = '/dashboard';
            }}
            className="w-full bg-aacp-olive text-white font-bold py-3.5 rounded-2xl hover:bg-aacp-gold transition-all shadow-lg shadow-aacp-olive/20"
          >
            Continue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a] pb-24">
      {/* ── Header ── */}
      {!isInsideDashboard && isBusiness && (
        <header className="text-center pt-10 pb-8 px-4">
          {isBusiness ? (
            <>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-2">
                AACP
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-aacp-olive dark:text-aacp-gold tracking-tight mb-3">
                Business Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Tell us who you sell to, how you market, and what you can invest in ETB (Birr). These fields
                directly power AI marketing analysis and creator recommendations.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-aacp-olive dark:text-aacp-gold tracking-[0.15em] uppercase mb-3">
                Creator onboarding • 5 steps
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                Build Your Creator Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto leading-relaxed mb-5">
                Rich analytics power AI matching, ROI forecasts, and campaign recommendations with premium brands.
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aacp-gold/15 dark:bg-aacp-olive/10 border border-aacp-gold/30 dark:border-aacp-olive/20 text-aacp-olive dark:text-aacp-gold text-xs font-bold">
                <Shield size={14} /> Secure Application
              </span>
            </>
          )}
        </header>
      )}

      {/* ── Main Form ── */}
      <div className={cn('mx-auto px-4 pb-32', isBusiness ? 'max-w-[620px] space-y-6' : 'max-w-4xl space-y-6')}>
        {!isBusiness && (
          <AdvertiserCompleteProfile />
        )}

        {/* ━━ A. BUSINESS PROFILE WORKFLOW ━━ */}
        {isBusiness && (
          <>
            {/* 1. Account Owner */}
            <SectionCard icon={<Users size={20} />} title="1. Account Owner">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Basic information about the person managing the business account.
              </p>
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-aacp-olive/20 overflow-hidden bg-gray-100 dark:bg-white/5 shadow-xl">
                    <img
                      src={profilePicture || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=10b981&color=fff`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={24} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append('image', file);
                          const res = await api.post('/users/profile/picture?type=avatar', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          setProfilePicture(res.data.user.profilePicture);
                        } catch (err) {
                          console.error('Upload failed:', err);
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                    />
                  </label>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Picture</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
                <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Doe" />
              </div>
              <PhoneInputField label="Phone Number" value={phone} onChange={setPhone} />
            </SectionCard>

            {/* 2. Business Information */}
            <SectionCard icon={<Building2 size={20} />} title="2. Business Information">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Tell us about your business so we can personalize recommendations and campaigns.
              </p>
              <div className="space-y-6">
                <InputField
                  label="Business Name"
                  placeholder="e.g. Green Bloom Trading PLC"
                  value={businessName}
                  onChange={setBusinessName}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SelectField label="Industry" value={industry} onChange={setIndustry} options={industries} />
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                      Company Size
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {companySizes.map((size) => (
                        <TagPill
                          key={size}
                          label={size}
                          selected={companySize === size}
                          onClick={() => setCompanySize(size)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <InputField
                  label="City & Country"
                  placeholder="e.g. Addis Ababa, Ethiopia"
                  value={businessLocation}
                  onChange={setBusinessLocation}
                  icon={<MapPin size={16} />}
                />
                <InputField
                  label="Website (Optional)"
                  placeholder="www.yourbrand.com"
                  value={websiteUrl}
                  onChange={setWebsiteUrl}
                  prefix="https://"
                />
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    Products or Services
                  </label>
                  <textarea
                    rows={3}
                    value={servicesOffered}
                    onChange={(e) => setServicesOffered(e.target.value)}
                    placeholder="Example: Restaurant services, bakery products, catering, coffee shop, etc."
                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 resize-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    Brand Description
                  </label>
                  <p className="text-[10px] text-gray-400 mb-1">Describe your brand in a few sentences (max 300 characters)</p>
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={brandDescription}
                      onChange={(e) => setBrandDescription(e.target.value)}
                      placeholder="“We provide fresh, affordable, and high-quality meals in a clean and welcoming environment.”"
                      maxLength={300}
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-aacp-olive focus:ring-1 focus:ring-aacp-olive/30 resize-none transition-all"
                    />
                    <span className={cn(
                      "absolute bottom-3 right-3 text-[10px] font-bold",
                      brandDescription.length > 280 ? "text-amber-500" : "text-gray-400"
                    )}>
                      {brandDescription.length} / 300
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 3. Business Verification */}
            <SectionCard icon={<ShieldCheck size={20} />} title="3. Business Verification">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Upload your business trade license for verification.
              </p>

              <div
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all group",
                  tradeLicenseUrl
                    ? "border-aacp-olive bg-aacp-gold/15/30 dark:bg-aacp-olive/5"
                    : "border-gray-200 dark:border-white/10 hover:border-aacp-gold bg-gray-50 dark:bg-white/5"
                )}
              >
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  accept="image/*,application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploadingLicense(true);
                    try {
                      const formData = new FormData();
                      formData.append('image', file);
                      const res = await api.post('/users/profile/picture?type=license', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      setTradeLicenseUrl(res.data.user.tradeLicenseUrl);
                    } catch (err) {
                      console.error('License upload failed:', err);
                      toast.error('Upload failed. Please try again.');
                    } finally {
                      setIsUploadingLicense(false);
                    }
                  }}
                />

                {isUploadingLicense ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-aacp-olive animate-spin" />
                    <span className="text-xs font-bold text-aacp-olive uppercase tracking-widest">Uploading...</span>
                  </div>
                ) : tradeLicenseUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-aacp-olive text-white rounded-2xl flex items-center justify-center shadow-lg shadow-aacp-olive/20">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Trade License Verified</p>
                      <p className="text-[10px] text-aacp-olive font-bold uppercase tracking-widest mt-1">File Uploaded Successfully</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-aacp-olive group-hover:scale-110 transition-all duration-300 shadow-sm">
                      <Plus size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Upload Trade License</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-1">JPG, PNG, PDF (MAX 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* 4. Marketing Goals */}
            <SectionCard icon={<BarChart3 size={20} />} title="4. Marketing Goals">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Help us match you with the right creators and campaigns.
              </p>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    What are your main goals? (Multi-select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {businessGoals.map((goal) => (
                      <TagPill
                        key={goal}
                        label={goal}
                        selected={promotionGoals.includes(goal)}
                        onClick={() => toggleBusinessGoal(goal)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    What results matter most to you?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {kpiOptions.map((kpi) => (
                      <TagPill
                        key={kpi}
                        label={kpi}
                        selected={primaryKpis.includes(kpi)}
                        onClick={() => toggleKPI(kpi)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    Brand Tone
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {brandVoiceOptions.map((tone) => (
                      <TagPill
                        key={tone}
                        label={tone}
                        selected={brandVoice === tone}
                        onClick={() => setBrandVoice(tone)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 5. Creator Preferences */}
            <SectionCard icon={<Sparkles size={20} />} title="5. Creator Preferences">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Define the type of creators and content you want to work with.
              </p>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    Content Types You Want (Multi-select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {promotionTypes.map((type) => (
                      <TagPill
                        key={type}
                        label={type}
                        selected={preferredPromotionTypes.includes(type)}
                        onClick={() => togglePromotionType(type)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    Preferred Creator Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {promoterTypes.map((type) => (
                      <TagPill
                        key={type}
                        label={type}
                        selected={preferredPromoterTypes.includes(type)}
                        onClick={() => togglePromoterType(type)}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField
                    label="Expected Minimum Engagement (%)"
                    placeholder="Example: 3%"
                    value={minEngagementPercent}
                    onChange={setMinEngagementPercent}
                    icon={<BarChart3 size={16} />}
                  />
                  <InputField
                    label="Number of Creators Needed"
                    placeholder="Example: 3"
                    value={promotersNeededCount}
                    onChange={setPromotersNeededCount}
                    icon={<Users size={16} />}
                  />
                </div>
              </div>
            </SectionCard>

            {/* 6. Target Audience */}
            <SectionCard icon={<Users size={20} />} title="6. Target Audience">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Who are your ideal customers?
              </p>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    Customer Tags
                  </label>
                  <p className="text-[10px] text-gray-400 mb-2">Example: University Students, Young Professionals, Families, English Speakers in Addis</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {targetAudienceTags.map((tag) => (
                      <RemovableTag
                        key={tag.label}
                        label={tag.label}
                        onRemove={() =>
                          setTargetAudienceTags((prev) => prev.filter((t) => t.label !== tag.label))
                        }
                      />
                    ))}
                    {showAudienceInput ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={newAudienceTag}
                          onChange={(e) => setNewAudienceTag(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addAudienceTag()}
                          placeholder="Add tag"
                          className="w-36 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-aacp-olive text-gray-900 dark:text-white transition-all"
                        />
                        <button type="button" onClick={addAudienceTag} className="w-8 h-8 flex items-center justify-center bg-aacp-olive text-white rounded-lg shadow-sm hover:bg-aacp-gold transition-all">
                          <CheckCircle2 size={16} />
                        </button>
                        <button type="button" onClick={() => setShowAudienceInput(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAudienceInput(true)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-dashed border-gray-300 dark:border-white/15 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:border-aacp-gold hover:text-aacp-olive hover:bg-aacp-gold/15/30 transition-all"
                      >
                        <Plus size={14} /> Add Tag
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    Audience Age Groups
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ageRanges.map((range) => (
                      <TagPill
                        key={range}
                        label={range}
                        selected={targetAudienceAgeRanges.includes(range)}
                        onClick={() => toggleAudienceAgeRange(range)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 7. Budget & Campaign Settings */}
            <SectionCard icon={<Shield size={20} />} title="7. Budget & Campaign Settings">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Financial parameters for your marketing activities.
              </p>

              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField
                    label="Average Customer Order Value (ETB)"
                    placeholder="Example: 2500 ETB"
                    value={avgOrderValueETB}
                    onChange={setAvgOrderValueETB}
                    type="text"
                    prefix="Br"
                  />
                  <InputField
                    label="Maximum Budget Per Creator Post (ETB)"
                    placeholder="Example: 15,000 ETB"
                    value={maxSpendPerPostETB.toString()}
                    onChange={(val) => setMaxSpendPerPostETB(Number(val) || 0)}
                    type="text"
                    prefix="Br"
                  />
                </div>

                <div className="bg-gray-50 dark:bg-black/30 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                      Monthly Marketing Budget
                    </label>
                    <div className="text-right">
                      <span className="text-2xl font-black text-aacp-olive dark:text-aacp-gold tabular-nums">
                        Br {monthlyBudget.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Estimated Monthly Cap</p>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={MONTHLY_BUDGET_MIN_ETB}
                    max={MONTHLY_BUDGET_MAX_ETB}
                    step={MONTHLY_BUDGET_STEP_ETB}
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-aacp-olive [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-aacp-olive [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-aacp-olive/30 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                  />
                  <div className="flex justify-between mt-3 text-[10px] text-gray-400 font-bold tracking-widest">
                    <span>BR 5K</span>
                    <span>BR 2,000K</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 8. Campaign Platforms */}
            <SectionCard icon={<Globe size={20} />} title="8. Campaign Platforms">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Where do you want to promote your business?
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {platformOptions.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform);
                  const Icon =
                    platform === 'Instagram'
                      ? FaInstagram
                      : platform === 'TikTok'
                        ? FaTiktok
                        : platform === 'YouTube'
                          ? FaYoutube
                          : platform === 'Facebook'
                            ? FaFacebook
                            : FaLinkedin;
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 group',
                        isSelected
                          ? 'bg-aacp-gold/15 dark:bg-aacp-olive/10 border-emerald-300 dark:border-aacp-olive/40 text-aacp-olive dark:text-aacp-gold shadow-md shadow-aacp-olive/5'
                          : 'bg-white dark:bg-black/40 border-gray-100 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:border-aacp-gold/30 dark:hover:border-aacp-olive/20'
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                        isSelected ? "bg-aacp-olive text-white shadow-lg shadow-aacp-olive/20" : "bg-gray-50 dark:bg-white/5 text-gray-400 group-hover:text-aacp-olive"
                      )}>
                        <Icon size={20} />
                      </div>
                      <span className="text-xs font-bold tracking-tight">{platform}</span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </>
        )}
      </div>

      {/* ── Bottom Bar (Business Only) ── */}
      {isBusiness && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 px-4 py-4 z-50">
          <div className="max-w-[620px] mx-auto flex items-center gap-4">
            {/* Progress */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profile Completion
                </span>
                <span className="text-sm font-black text-aacp-olive dark:text-aacp-gold">
                  {profileCompletion}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-aacp-olive rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Save */}
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              <Save size={16} /> Save
            </button>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-aacp-olive/20',
                isSubmitting
                  ? 'bg-aacp-gold text-white cursor-wait'
                  : 'bg-aacp-olive text-white hover:bg-aacp-gold'
              )}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Submit Review <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!isInsideDashboard && (
        <footer className="text-center py-8 px-4 border-t border-gray-100 dark:border-white/4 mt-12">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400 mb-3">
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-wider font-semibold">
              Terms
            </a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-wider font-semibold">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-wider font-semibold">
              Support
            </a>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            © 2026 AACP. Built for the Organic Professional.
          </p>
        </footer>
      )}
    </div>
  );
}
