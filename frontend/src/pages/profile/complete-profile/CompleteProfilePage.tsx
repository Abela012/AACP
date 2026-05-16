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
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
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
          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
          : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400'
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
    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
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
          <span className="absolute left-0 top-0 bottom-0 flex items-center px-3 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-l-xl border-r border-gray-200 dark:border-white/10">
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
            'focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200',
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
          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200 cursor-pointer"
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
  // Extract code and number from value (format: "+XXX YYYYYYYY")
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
    // Only allow numbers
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
            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl pl-3 pr-8 py-3 text-sm text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200 cursor-pointer"
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
          className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
        />
      </div>
    </div>
  );
}

/* ─── Platform Button ─── */
function PlatformButton({
  icon,
  label,
  connected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  connected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 w-full',
        connected
          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-gray-900 dark:text-white'
          : 'bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/30'
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {connected && (
        <CheckCircle2 size={18} className="text-emerald-500" />
      )}
    </button>
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
  if (num === undefined || num === null) return '';
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

  // Initialization ref to prevent redundant logs/logic on mount
  const hasInitialized = useRef(false);
  if (!hasInitialized.current) {
    console.log("[CompleteProfilePage] Initializing component state...");
    hasInitialized.current = true;
  }

  useEffect(() => {
    if (clerkUser) {
      setFirstName(prev => prev || clerkUser.firstName || '');
      setLastName(prev => prev || clerkUser.lastName || '');
      setProfilePicture(prev => prev || clerkUser.imageUrl || '');
    }
  }, [clerkUser]);

  useEffect(() => {
    if (profile && profile._id) {
      // Auto-populate TikTok
      if (profile.tiktok) {
        setTiktokUsername(profile.tiktok.username || '');
        setTiktokFollowers(formatMetric(profile.tiktok.followers));
        setTiktokTotalLikes(formatMetric(profile.tiktok.totalLikes));
        setTiktokAvgViews(formatMetric(profile.tiktok.avgViews));
        setTiktokAvgComments(formatMetric(profile.tiktok.avgComments));
        setTiktokAvgShares(formatMetric(profile.tiktok.avgShares));
        setTiktokAccountType(profile.tiktok.accountType || 'Creator');
        setTiktokProfileLink(profile.tiktok.profileLink || '');
        setTiktokPostingFrequency(profile.tiktok.postingFrequency || '3-5 per week');
        setTiktokNiche(profile.tiktok.niche || []);
        setTiktokAudienceGender(profile.tiktok.audienceGender || 'Mixed');
        setTiktokAudienceTopCountry(profile.tiktok.audienceTopCountry || '');
        setTiktokAudienceAgeRange(profile.tiktok.audienceAgeRange || '18-24');
        setTiktokContentStyle(profile.tiktok.contentStyle || []);
        setShowTiktokAnalytics(true);
      }

      // Auto-populate Instagram
      if (profile.instagram) {
        setInstagramUsername(profile.instagram.username || '');
        setInstagramFollowers(formatMetric(profile.instagram.followers));
        setInstagramTotalLikes(formatMetric(profile.instagram.totalLikes));
        setInstagramAvgViews(formatMetric(profile.instagram.avgViews));
        setInstagramAvgComments(formatMetric(profile.instagram.avgComments));
        setInstagramAvgShares(formatMetric(profile.instagram.avgShares));
        setInstagramAccountType(profile.instagram.accountType || 'Creator');
        setInstagramProfileLink(profile.instagram.profileLink || '');
        setInstagramPostingFrequency(profile.instagram.postingFrequency || '3-5 per week');
        setInstagramNiche(profile.instagram.niche || []);
        setInstagramAudienceGender(profile.instagram.audienceGender || 'Mixed');
        setInstagramAudienceTopCountry(profile.instagram.audienceTopCountry || '');
        setInstagramAudienceAgeRange(profile.instagram.audienceAgeRange || '18-24');
        setInstagramContentStyle(profile.instagram.contentStyle || []);
        setShowInstagramAnalytics(true);
      }
    }
  }, [profile]);

  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([]);
  const [isSocialLoading, setIsSocialLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  const fetchSocialConnections = useCallback(async () => {
    try {
      const res = await socialApi.getConnections(api);
      if (res.success) {
        setSocialConnections(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch social connections:', err);
    } finally {
      setIsSocialLoading(false);
    }
  }, [api]);

  const handleConnectWithToken = useCallback(async (platform: string, accessToken: string) => {
    setConnectingPlatform(platform);
    setTokenError(null);
    try {
      const res = await socialApi.connectWithToken(api, platform, accessToken);
      if (res.success) {
        toast.success(`Successfully connected to ${platform}!`);
        setShowTokenModal(null);
        setTokenInput('');
        await fetchSocialConnections();
      } else {
        setTokenError(res.message || 'Connection failed');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || `Failed to connect ${platform}`;
      setTokenError(message);
      toast.error(message);
    } finally {
      setConnectingPlatform(null);
    }
  }, [api, fetchSocialConnections]);

  // Fetch initial connections
  useEffect(() => {
    fetchSocialConnections();
  }, [fetchSocialConnections]);

  // Handle OAuth callback status separately to avoid loops
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const platform = params.get('platform');
    const message = params.get('message');

    if (status) {
      if (status === 'success') {
        toast.success(`Successfully connected to ${platform}`);
        fetchSocialConnections();
      } else if (status === 'error') {
        toast.error(message || 'Failed to connect');
      }
      // Clean up URL and redirect to current path without params
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate, fetchSocialConnections]);

  const isBusiness =
    location.pathname.includes('/business') || userRole === 'business_owner';

  /* ── Shared state ── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  /* ── Advertiser-specific state ── */
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [xConnected, setXConnected] = useState(false);

  const [youtubeHandle, setYoutubeHandle] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [xHandle, setXHandle] = useState('');

  const [followers, setFollowers] = useState('');
  const [avgViews, setAvgViews] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [geoTags, setGeoTags] = useState<TagItem[]>([]);
  const [newGeo, setNewGeo] = useState('');
  const [showGeoInput, setShowGeoInput] = useState(false);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('English (US)');
  const [baseRate, setBaseRate] = useState('');
  const [bioPitch, setBioPitch] = useState('');
  const [nicheTags, setNicheTags] = useState<TagItem[]>([]);
  const [newNiche, setNewNiche] = useState('');
  const [showNicheInput, setShowNicheInput] = useState(false);
  const [phone, setPhone] = useState('');

  const [paymentPreference, setPaymentPreference] = useState('Negotiable');
  const [availability, setAvailability] = useState('Part-time');
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);
  const [campaignTypes, setCampaignTypes] = useState<string[]>([]);

  /* ── TikTok Analytics state ── */
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [tiktokFollowers, setTiktokFollowers] = useState('');
  const [tiktokTotalLikes, setTiktokTotalLikes] = useState('');
  const [tiktokAvgViews, setTiktokAvgViews] = useState('');
  const [tiktokEngagementRate, setTiktokEngagementRate] = useState('');
  const [tiktokAvgComments, setTiktokAvgComments] = useState('');
  const [tiktokAvgShares, setTiktokAvgShares] = useState('');
  const [tiktokAccountType, setTiktokAccountType] = useState('Creator');
  const [tiktokProfileLink, setTiktokProfileLink] = useState('');
  const [tiktokPostingFrequency, setTiktokPostingFrequency] = useState('3-5 per week');
  const [tiktokNiche, setTiktokNiche] = useState<string[]>([]);
  const [tiktokAudienceGender, setTiktokAudienceGender] = useState('Mixed');
  const [tiktokAudienceTopCountry, setTiktokAudienceTopCountry] = useState('');
  const [tiktokAudienceAgeRange, setTiktokAudienceAgeRange] = useState('18-24');
  const [tiktokContentStyle, setTiktokContentStyle] = useState<string[]>([]);
  const [showTiktokAnalytics, setShowTiktokAnalytics] = useState(false);

  /* ── Instagram Analytics state ── */
  const [instagramUsername, setInstagramUsername] = useState('');
  const [instagramFollowers, setInstagramFollowers] = useState('');
  const [instagramTotalLikes, setInstagramTotalLikes] = useState('');
  const [instagramAvgViews, setInstagramAvgViews] = useState('');
  const [instagramEngagementRate, setInstagramEngagementRate] = useState('');
  const [instagramAvgComments, setInstagramAvgComments] = useState('');
  const [instagramAvgShares, setInstagramAvgShares] = useState('');
  const [instagramAccountType, setInstagramAccountType] = useState('Creator');
  const [instagramProfileLink, setInstagramProfileLink] = useState('');
  const [instagramPostingFrequency, setInstagramPostingFrequency] = useState('3-5 per week');
  const [instagramNiche, setInstagramNiche] = useState<string[]>([]);
  const [instagramAudienceGender, setInstagramAudienceGender] = useState('Mixed');
  const [instagramAudienceTopCountry, setInstagramAudienceTopCountry] = useState('');
  const [instagramAudienceAgeRange, setInstagramAudienceAgeRange] = useState('18-24');
  const [instagramContentStyle, setInstagramContentStyle] = useState<string[]>([]);
  const [showInstagramAnalytics, setShowInstagramAnalytics] = useState(false);

  // ── Analytics Validation ──
  interface MetricWarning {
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }

  const validatePlatformMetrics = (metrics: {
    followers: number; likes: number; views: number; comments: number; shares: number;
  }): MetricWarning[] => {
    const warnings: MetricWarning[] = [];
    const { followers, likes, views, comments, shares } = metrics;

    if (likes > 0 && views > 0 && likes > views) {
      warnings.push({ field: 'likes', message: 'Avg. Likes cannot exceed Avg. Views — please double-check your numbers', severity: 'error' });
    }
    if (comments > 0 && likes > 0 && comments > likes) {
      warnings.push({ field: 'comments', message: 'Avg. Comments should not exceed Avg. Likes', severity: 'warning' });
    }
    if (shares > 0 && likes > 0 && shares > likes) {
      warnings.push({ field: 'shares', message: 'Avg. Shares should not exceed Avg. Likes', severity: 'warning' });
    }
    if (followers > 0 && views > 0 && views > followers * 10) {
      warnings.push({ field: 'views', message: 'Avg. Views seems unusually high relative to followers', severity: 'warning' });
    }
    return warnings;
  };

  const computeEngagementRate = (metrics: {
    followers: number; likes: number; views: number; comments: number; shares: number;
  }): { rate: string; isAbnormal: boolean; hasErrors: boolean; warnings: MetricWarning[] } => {
    const warnings = validatePlatformMetrics(metrics);
    const hasErrors = warnings.some(w => w.severity === 'error');
    const { followers, likes, comments, shares } = metrics;

    if (followers <= 0) return { rate: '0.00', isAbnormal: false, hasErrors, warnings };

    // If there are validation errors, show a capped/flagged rate
    const rawRate = ((likes + comments + shares) / followers) * 100;
    const isAbnormal = rawRate > 20; // Typical social media ER is 1-10%, >20% is suspicious
    const cappedRate = Math.min(rawRate, 100); // Cap display at 100%

    return {
      rate: hasErrors ? '—' : cappedRate.toFixed(2),
      isAbnormal: isAbnormal && !hasErrors,
      hasErrors,
      warnings,
    };
  };

  // Compute ER dynamically with validation
  const tiktokMetrics = useMemo(() => ({
    followers: parseMetric(tiktokFollowers),
    likes: parseMetric(tiktokTotalLikes),
    views: parseMetric(tiktokAvgViews),
    comments: parseMetric(tiktokAvgComments),
    shares: parseMetric(tiktokAvgShares),
  }), [tiktokFollowers, tiktokTotalLikes, tiktokAvgViews, tiktokAvgComments, tiktokAvgShares]);

  const tiktokER = useMemo(() => computeEngagementRate(tiktokMetrics), [tiktokMetrics]);
  const computedTiktokER = tiktokER.rate;

  const instagramMetrics = useMemo(() => ({
    followers: parseMetric(instagramFollowers),
    likes: parseMetric(instagramTotalLikes),
    views: parseMetric(instagramAvgViews),
    comments: parseMetric(instagramAvgComments),
    shares: parseMetric(instagramAvgShares),
  }), [instagramFollowers, instagramTotalLikes, instagramAvgViews, instagramAvgComments, instagramAvgShares]);

  const instagramER = useMemo(() => computeEngagementRate(instagramMetrics), [instagramMetrics]);
  const computedInstagramER = instagramER.rate;

  // Validation Logic
  const isTiktokFormComplete = useMemo(() => {
    return !!(
      tiktokUsername &&
      tiktokFollowers &&
      tiktokTotalLikes &&
      tiktokAvgViews &&
      tiktokAvgComments &&
      tiktokAvgShares &&
      tiktokProfileLink &&
      tiktokNiche.length > 0 &&
      tiktokAudienceTopCountry
    );
  }, [
    tiktokUsername, tiktokFollowers, tiktokTotalLikes, tiktokAvgViews,
    tiktokAvgComments, tiktokAvgShares, tiktokProfileLink, tiktokNiche,
    tiktokAudienceTopCountry
  ]);

  const isInstagramFormComplete = useMemo(() => {
    return !!(
      instagramUsername &&
      instagramFollowers &&
      instagramTotalLikes &&
      instagramAvgViews &&
      instagramAvgComments &&
      instagramAvgShares &&
      instagramProfileLink &&
      instagramNiche.length > 0 &&
      instagramAudienceTopCountry
    );
  }, [
    instagramUsername, instagramFollowers, instagramTotalLikes, instagramAvgViews,
    instagramAvgComments, instagramAvgShares, instagramProfileLink, instagramNiche,
    instagramAudienceTopCountry
  ]);

  const canSubmitAdvertiser = isTiktokFormComplete || isInstagramFormComplete;

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

  /* ── Constants ── */
  const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45+'];
  const companySizes = ['1-10', '11-50', '51-200', '200+'];
  const industries = [
    'Food & Beverage',
    'Fashion',
    'Technology',
    'Beauty',
    'Real Estate',
    'Organic Agriculture',
    'Healthcare',
    'Education',
    'E-commerce',
    'Fintech',
    'Other',
  ];
  const platformOptions = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn'];
  const businessGoals = [
    'More Customers',
    'Brand Awareness',
    'Product Promotion',
    'Online Visibility',
    'Lead Generation',
    'Launch / Relaunch',
  ];
  const promotionTypes = [
    'Short Videos (Reels/TikTok)',
    'Photos & Carousels',
    'Stories / UGC',
    'Reviews & Testimonials',
    'Live Coverage',
  ];
  const promoterTypes = [
    'Local Creators',
    'Micro Creators',
    'Mid-tier Creators',
    'Professional Creators',
  ];
  const brandVoiceOptions = ['Professional', 'Friendly', 'Luxury', 'Fun', 'Modern'];
  const kpiOptions = [
    'Sales / Orders',
    'Leads & Inquiries',
    'Brand Awareness',
    'Store Visits',
    'App Installs',
  ];
  const MONTHLY_BUDGET_MIN_ETB = 5_000;
  const MONTHLY_BUDGET_MAX_ETB = 2_000_000;
  const MONTHLY_BUDGET_STEP_ETB = 5_000;

  /* ── Computed ── */
  const profileCompletion = useMemo(() => {
    if (isBusiness) {
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
    } else {
      let filled = 0;
      const total = 8;
      if (youtubeConnected || tiktokConnected) filled++;
      if (followers) filled++;
      if (avgViews) filled++;
      if (engagementRate) filled++;
      if (geoTags.length > 0) filled++;
      if (portfolioUrl) filled++;
      if (baseRate) filled++;
      if (bioPitch) filled++;
      return Math.round((filled / total) * 100);
    }
  }, [
    isBusiness,
    businessName,
    industry,
    businessLocation,
    servicesOffered,
    companySize,
    targetAudienceTags,
    brandDescription,
    monthlyBudget,
    maxSpendPerPostETB,
    selectedPlatforms,
    tradeLicenseUrl,
    promotionGoals,
    primaryKpis,
    MONTHLY_BUDGET_MIN_ETB,
    youtubeConnected,
    tiktokConnected,
    followers,
    avgViews,
    engagementRate,
    geoTags,
    portfolioUrl,
    baseRate,
    bioPitch,
  ]);

  // ── Inline warning banner component ──
  const ValidationWarnings = ({ warnings, platform }: { warnings: MetricWarning[]; platform: string }) => {
    if (warnings.length === 0) return null;
    return (
      <div className="mt-4 space-y-2">
        {warnings.map((w, i) => (
          <div
            key={`${platform}-${i}`}
            className={cn(
              'flex items-start gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border',
              w.severity === 'error'
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'
            )}
          >
            <span className="mt-0.5 shrink-0">{w.severity === 'error' ? '⛔' : '⚠️'}</span>
            <span>{w.message}</span>
          </div>
        ))}
      </div>
    );
  };

  /* ── Handlers ── */
  const toggleAgeRange = (range: string) =>
    setSelectedAgeRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );

  const togglePlatform = (platform: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );

  const toggleAudienceAgeRange = (range: string) =>
    setTargetAudienceAgeRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );

  const addGeoTag = useCallback(() => {
    if (newGeo.trim()) {
      setGeoTags((prev) => [...prev, { label: newGeo.trim(), removable: true }]);
      setNewGeo('');
      setShowGeoInput(false);
    }
  }, [newGeo]);

  const addNicheTag = useCallback(() => {
    if (newNiche.trim()) {
      setNicheTags((prev) => [...prev, { label: newNiche.trim(), removable: true }]);
      setNewNiche('');
      setShowNicheInput(false);
    }
  }, [newNiche]);

  const addAudienceTag = useCallback(() => {
    if (newAudienceTag.trim()) {
      setTargetAudienceTags((prev) => [
        ...prev,
        { label: newAudienceTag.trim(), removable: true },
      ]);
      setNewAudienceTag('');
      setShowAudienceInput(false);
    }
  }, [newAudienceTag]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let profileData;
      let socialProfiles: any[] = [];
      if (isBusiness) {
        const minEng = Math.min(50, Math.max(0, parseFloat(minEngagementPercent) || 0));
        const avgOrder = avgOrderValueETB.replace(/,/g, '').trim();
        profileData = {
          businessName,
          website: websiteUrl,
          industry,
          category: industry,
          niche: industry,
          bio: brandDescription,
          businessLocation,
          servicesOffered,
          companySize,
          targetAudienceTags: targetAudienceTags.map((t) => t.label),
          targetAudienceAgeRanges,
          monthlyBudget,
          currency: 'ETB',
          /** Used by recommendation “budget fit” vs creator proposed rates */
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
      } else {
        // Block submission if there are validation errors
        if (tiktokER.hasErrors || instagramER.hasErrors) {
          toast.error('Please fix the highlighted analytics errors before submitting.');
          setIsSubmitting(false);
          return;
        }

        // For Advertisers, save platform-specific analytics to socialProfiles array
        if (isTiktokFormComplete) {
          socialProfiles.push({
            platform: "TikTok",
            username: tiktokUsername,
            profileLink: tiktokProfileLink,
            verified: false,
            engagementRate: tiktokER.hasErrors ? 0 : parseFloat(computedTiktokER),
            postingFrequency: tiktokPostingFrequency,
            niches: tiktokNiche,
            contentStyles: tiktokContentStyle,
            tiktokAnalytics: {
              followers: parseMetric(tiktokFollowers),
              following: 0,
              avgViews: parseMetric(tiktokAvgViews),
              avgLikes: parseMetric(tiktokTotalLikes),
              avgComments: parseMetric(tiktokAvgComments),
              avgShares: parseMetric(tiktokAvgShares),
              averageWatchTime: 0,
              completionRate: 0,
              totalLikes: parseMetric(tiktokTotalLikes),
              viralVideoPercentage: 0
            },
            audience: {
              topCountries: [{ country: tiktokAudienceTopCountry, percentage: 100 }]
            }
          });
        }

        // Map existing Instagram fields to YouTube format based on backend update
        if (isInstagramFormComplete) {
          socialProfiles.push({
            platform: "YouTube",
            username: instagramUsername,
            profileLink: instagramProfileLink,
            verified: false,
            engagementRate: instagramER.hasErrors ? 0 : parseFloat(computedInstagramER),
            postingFrequency: instagramPostingFrequency,
            niches: instagramNiche,
            contentStyles: instagramContentStyle,
            youtubeAnalytics: {
              subscribers: parseMetric(instagramFollowers),
              watchHours: 0,
              ctr: 0,
              impressions: 0,
              averageViewDuration: 0,
              totalVideos: 0,
              engagementMetrics: {
                likes: parseMetric(instagramTotalLikes),
                comments: parseMetric(instagramAvgComments),
                shares: parseMetric(instagramAvgShares)
              }
            },
            audience: {
              topCountries: [{ country: instagramAudienceTopCountry, percentage: 100 }]
            }
          });
        }
      }

      await userApi.submitProfile(api, {
        firstName,
        lastName,
        profilePicture,
        bio: isBusiness ? brandDescription : "",
        location: isBusiness ? businessLocation : "",
        tradeLicenseUrl,
        profileData,
        socialProfiles,
      });

      updateProfile({
        firstName,
        lastName,
        avatarUrl: profilePicture,
        socialProfiles,
        ...profileData
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit profile:', error);
      // Fallback or show toast
    } finally {
      setIsSubmitting(false);
    }
  };


  // ── Success overlay ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/6 p-10 max-w-md w-full text-center shadow-xl"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
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
              navigate('/dashboard');
            }}
            className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Continue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a]">
      {/* ── Header ── */}
      {!isInsideDashboard && (
        <header className="text-center pt-10 pb-8 px-4">
          {isBusiness ? (
            <>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-2">
                AACP
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mb-3">
                Business Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Tell us who you sell to, how you market, and what you can invest in ETB (Birr). These fields
                directly power AI marketing analysis and creator recommendations.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-[0.15em] uppercase mb-3">
                Step 2 of 4 • Profile Setup
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                Complete Your Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto leading-relaxed mb-5">
                Let's showcase your digital footprint. High-fidelity profiles
                receive 4x more engagement from premium brands.
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <Shield size={14} /> Secure Application
              </span>
            </>
          )}
        </header>
      )}

      {/* ── Main Form ── */}
      <div className="max-w-[620px] mx-auto px-4 pb-32 space-y-6">
        {/* ━━ SHARED: PERSONAL INFORMATION (ADVERTISERS ONLY) ━━ */}
        {!isBusiness && (
          <SectionCard icon={<Users size={20} />} title="Personal Information">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 overflow-hidden bg-gray-100 dark:bg-white/5 shadow-xl">
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
              <p className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Profile Picture</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
              <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Doe" />
            </div>
            <PhoneInputField label="Phone Number" value={phone} onChange={setPhone} />
          </SectionCard>
        )}

        {/* Social Connections — creators only (not used for business-owner AI signals) */}
        {!isBusiness && (
          <SectionCard icon={<Sparkles size={20} />} title="Social Connections">
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
              Connect your social media accounts to sync metrics and verify your presence.
            </p>
            <div className="space-y-4">
              {[
                { id: 'facebook', name: 'Facebook', icon: <FaFacebook />, color: 'text-blue-600', useToken: false },
                { id: 'instagram', name: 'Instagram', icon: <FaInstagram />, color: 'text-pink-600', useToken: false, comingSoon: true },
                { id: 'tiktok', name: 'TikTok', icon: <FaTiktok />, color: 'text-black dark:text-white', useToken: false, comingSoon: true },
              ].map((platform) => {
                const conn = socialConnections.find(c => c.platform === platform.id);
                const status = conn?.status || 'none';
                const isConnected = status === 'approved' || (conn?.isConnected && status !== 'none');
                const isCurrentlyConnecting = connectingPlatform === platform.id;

                return (
                  <div key={platform.id} className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                    isConnected
                      ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
                      : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2.5 rounded-xl shadow-sm transition-all",
                        isConnected
                          ? "bg-emerald-100 dark:bg-emerald-500/15"
                          : "bg-white dark:bg-white/5",
                        platform.color
                      )}>
                        {platform.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{platform.name}</p>
                        <p className={cn(
                          "text-[10px] uppercase tracking-wider font-bold",
                          isConnected ? "text-emerald-600 dark:text-emerald-400" :
                            status === 'pending' ? "text-amber-600 dark:text-amber-400" :
                              "text-gray-500"
                        )}>
                          {isCurrentlyConnecting ? 'Connecting...' :
                            isConnected ? 'Connected' :
                              status === 'pending' ? 'Pending Approval' :
                                platform.comingSoon ? 'Launching Soon' :
                                  'Not Connected'}
                        </p>
                      </div>
                    </div>

                    {isCurrentlyConnecting ? (
                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-xs font-bold">
                        <Loader2 size={14} className="animate-spin" /> Connecting...
                      </div>
                    ) : isConnected ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 size={14} /> Connected
                      </div>
                    ) : status === 'pending' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-xs font-bold">
                        <Loader2 size={14} className="animate-spin" /> Pending
                      </div>
                    ) : platform.comingSoon ? (
                      <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-white/5">
                        Coming Soon
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          if (platform.id === 'facebook') {
                            setShowTokenModal('facebook');
                            setTokenError(null);
                          } else {
                            setConnectingPlatform(platform.id);
                            try {
                              const res = await socialApi.initiateAuth(api, platform.id, location.pathname);
                              if (res.success && res.data?.authUrl) {
                                window.location.href = res.data.authUrl;
                              }
                            } catch (err) {
                              toast.error(`Failed to connect ${platform.name}`);
                              setConnectingPlatform(null);
                            }
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* ── Facebook OAuth Connection Modal ── */}
        <AnimatePresence>
          {showTokenModal === 'facebook' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
              onClick={() => { setShowTokenModal(null); setTokenError(null); }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white dark:bg-[#0f0f14] rounded-3xl border border-gray-100 dark:border-white/8 p-0 max-w-md w-full shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header with gradient */}
                <div className="relative px-8 pt-8 pb-6 bg-linear-to-b from-blue-50 dark:from-blue-500/5 to-transparent">
                  <button
                    type="button"
                    onClick={() => { setShowTokenModal(null); setTokenError(null); }}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#1877F2] to-[#0d47a1] flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-5">
                      <FaFacebook size={28} />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1.5">Connect Facebook Analytics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                      Connect your Facebook account to fetch followers, reach, engagement, and Page insights.
                    </p>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-8 pb-8">
                  {tokenError && (
                    <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-500/8 border border-red-200 dark:border-red-500/15 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M8 5v3.5M8 10.5h.007" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      {tokenError}
                    </div>
                  )}

                  {/* What gets synced */}
                  <div className="mb-6 space-y-2.5">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">What gets synced automatically</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: '👥', label: 'Followers & Fans' },
                        { icon: '📈', label: 'Page Engagement' },
                        { icon: '👁️', label: 'Impressions & Reach' },
                        { icon: '📊', label: 'Page Insights' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                          <span className="text-base">{item.icon}</span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security note */}
                  <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/10">
                    <Shield size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      Your connection is secure. We only request read-only access to your Page analytics — we can never post or modify anything on your behalf.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={connectingPlatform === 'facebook'}
                      onClick={async () => {
                        setConnectingPlatform('facebook');
                        setTokenError(null);
                        try {
                          const res = await facebookAnalyticsApi.initiateAuth(api);
                          if (res.success && res.data?.authUrl) {
                            window.location.href = res.data.authUrl;
                          } else {
                            setTokenError('Unable to start Facebook authorization. Please try again.');
                            setConnectingPlatform(null);
                          }
                        } catch (err: any) {
                          const message = err?.response?.data?.message || 'Unable to connect to Facebook. Please try again.';
                          setTokenError(message);
                          setConnectingPlatform(null);
                        }
                      }}
                      className="w-full py-3.5 rounded-2xl bg-[#1877F2] text-white text-sm font-bold hover:bg-[#1565c0] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/20"
                    >
                      {connectingPlatform === 'facebook' ? (
                        <><Loader2 size={18} className="animate-spin" /> Connecting to Facebook...</>
                      ) : (
                        <><FaFacebook size={18} /> Continue with Facebook</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowTokenModal(null); setTokenError(null); }}
                      className="w-full py-3 rounded-2xl border border-gray-200 dark:border-white/8 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/3 transition-all"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-4">
                    By connecting, you agree to share your Page analytics with AACP.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {isBusiness ? (
          /* ━━ BUSINESS PROFILE ━━ */
          <>
            {/* 1. Account Owner */}
            <SectionCard icon={<Users size={20} />} title="1. Account Owner">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Basic information about the person managing the business account.
              </p>
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 overflow-hidden bg-gray-100 dark:bg-white/5 shadow-xl">
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
                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 resize-none transition-all"
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
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 resize-none transition-all"
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
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5"
                    : "border-gray-200 dark:border-white/10 hover:border-emerald-400 bg-gray-50 dark:bg-white/5"
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
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Uploading...</span>
                  </div>
                ) : tradeLicenseUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Trade License Verified</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">File Uploaded Successfully</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
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
                        onClick={() =>
                          setPromotionGoals((prev) =>
                            prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
                          )
                        }
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
                        onClick={() =>
                          setPrimaryKpis((prev) =>
                            prev.includes(kpi) ? prev.filter((k) => k !== kpi) : [...prev, kpi]
                          )
                        }
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
                        onClick={() =>
                          setPreferredPromotionTypes((prev) =>
                            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                          )
                        }
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
                        onClick={() =>
                          setPreferredPromoterTypes((prev) =>
                            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                          )
                        }
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
                          className="w-36 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white transition-all"
                        />
                        <button type="button" onClick={addAudienceTag} className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-lg shadow-sm hover:bg-emerald-400 transition-all">
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
                        className="flex items-center gap-1.5 px-4 py-2 border border-dashed border-gray-300 dark:border-white/15 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all"
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
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
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
                    className="w-full h-2.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
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
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-500/5'
                          : 'bg-white dark:bg-black/40 border-gray-100 dark:border-white/8 text-gray-500 dark:text-gray-400 hover:border-emerald-200 dark:hover:border-emerald-500/20'
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                        isSelected ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-gray-50 dark:bg-white/5 text-gray-400 group-hover:text-emerald-500"
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
        ) : (
          /* ━━ ADVERTISER (CREATOR) PROFILE ━━ */
          <>
            {/* ━━ TikTok Analytics Section ━━ */}
            <SectionCard icon={<FaTiktok size={20} />} title="TikTok Creator Analytics">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-5">
                Provide your TikTok metrics so brands can evaluate your reach and engagement.
              </p>

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowTiktokAnalytics(!showTiktokAnalytics)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                  showTiktokAnalytics
                    ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
                    : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    showTiktokAnalytics ? "bg-emerald-500 text-white" : "bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400"
                  )}>
                    <FaTiktok size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">TikTok Analytics</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      {showTiktokAnalytics ? 'Editing' : tiktokUsername ? 'Configured' : 'Click to add your TikTok data'}
                    </p>
                  </div>
                </div>
                <ChevronDown size={18} className={cn(
                  "text-gray-400 transition-transform duration-200",
                  showTiktokAnalytics && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {showTiktokAnalytics && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-8">

                      {/* ── Account Info ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Account Info</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="TikTok Username" placeholder="@username" value={tiktokUsername} onChange={setTiktokUsername} icon={<FaTiktok size={14} />} />
                            <InputField label="Profile Link" placeholder="https://tiktok.com/@username" value={tiktokProfileLink} onChange={setTiktokProfileLink} prefix="https://" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <SelectField label="Account Type" value={tiktokAccountType} onChange={setTiktokAccountType} options={['Creator', 'Business', 'Personal']} />
                            <SelectField label="Posting Frequency" value={tiktokPostingFrequency} onChange={setTiktokPostingFrequency} options={['Daily', '3-5 per week', '1-2 per week', 'Bi-weekly', 'Monthly']} />
                          </div>
                        </div>
                      </div>

                      {/* ── Performance Metrics ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Performance Metrics</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Followers</label>
                            <div className="relative">
                              <input type="text" value={tiktokFollowers} onChange={e => setTiktokFollowers(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 50000"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Avg. Likes</label>
                            <input type="text" value={tiktokTotalLikes} onChange={e => setTiktokTotalLikes(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 1200000"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Avg. Views</label>
                            <input type="text" value={tiktokAvgViews} onChange={e => setTiktokAvgViews(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 10000"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className={cn(
                              "text-[11px] font-bold uppercase tracking-[0.08em]",
                              tiktokER.hasErrors ? 'text-red-600 dark:text-red-400' :
                                tiktokER.isAbnormal ? 'text-amber-600 dark:text-amber-400' :
                                  'text-emerald-600 dark:text-emerald-400'
                            )}>Engagement Rate (Computed)</label>
                            <div className="relative">
                              <input type="text" value={tiktokER.hasErrors ? '—' : `${computedTiktokER}`} readOnly disabled
                                className={cn(
                                  'w-full rounded-xl py-3 pl-4 pr-8 text-sm font-bold cursor-not-allowed opacity-80 border',
                                  tiktokER.hasErrors
                                    ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                                    : tiktokER.isAbnormal
                                      ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'
                                      : 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                )} />
                              <span className={cn(
                                'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold',
                                tiktokER.hasErrors ? 'text-red-500' : tiktokER.isAbnormal ? 'text-amber-500' : 'text-emerald-500'
                              )}>{tiktokER.hasErrors ? '' : '%'}</span>
                            </div>
                            {tiktokER.isAbnormal && !tiktokER.hasErrors && (
                              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                                ⚠️ Unusually high — typical engagement is 1-10%
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Avg. Comments</label>
                            <input type="text" value={tiktokAvgComments} onChange={e => setTiktokAvgComments(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 200"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Avg. Shares</label>
                            <input type="text" value={tiktokAvgShares} onChange={e => setTiktokAvgShares(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 50"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                          </div>
                        </div>
                        <ValidationWarnings warnings={tiktokER.warnings} platform="tiktok" />
                      </div>

                      {/* ── Content Niche ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-purple-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Content Niche</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Comedy', 'Dance', 'Education', 'Fashion', 'Beauty', 'Food', 'Fitness', 'Tech', 'Gaming', 'Travel', 'Lifestyle', 'Music', 'DIY', 'Finance', 'Pets'].map(niche => (
                            <TagPill
                              key={niche}
                              label={niche}
                              selected={tiktokNiche.includes(niche)}
                              onClick={() => setTiktokNiche(prev =>
                                prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* ── Content Style ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-pink-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Content Style</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Talking Head', 'Voiceover', 'Trending Audio', 'Transitions', 'Storytelling', 'Tutorial', 'Behind-the-Scenes', 'Product Review', 'Unboxing', 'Day in My Life'].map(style => (
                            <TagPill
                              key={style}
                              label={style}
                              selected={tiktokContentStyle.includes(style)}
                              onClick={() => setTiktokContentStyle(prev =>
                                prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* ── Audience Demographics ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Audience Demographics</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <SelectField label="Primary Gender" value={tiktokAudienceGender} onChange={setTiktokAudienceGender} options={['Mixed', 'Mostly Male', 'Mostly Female']} />
                          <SelectField label="Top Age Range" value={tiktokAudienceAgeRange} onChange={setTiktokAudienceAgeRange} options={['13-17', '18-24', '25-34', '35-44', '45+']} />
                          <InputField label="Top Country" placeholder="e.g. Ethiopia" value={tiktokAudienceTopCountry} onChange={setTiktokAudienceTopCountry} icon={<Globe size={14} />} />
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>

            {/* ━━ Instagram Analytics Section ━━ */}
            <SectionCard icon={<FaInstagram size={20} />} title="Instagram Creator Analytics">
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-5">
                Provide your Instagram metrics so brands can evaluate your reach and engagement.
              </p>

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowInstagramAnalytics(!showInstagramAnalytics)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                  showInstagramAnalytics
                    ? "bg-pink-50 dark:bg-pink-500/5 border-pink-200 dark:border-pink-500/20"
                    : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-pink-300 dark:hover:border-pink-500/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    showInstagramAnalytics ? "bg-pink-500 text-white" : "bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400"
                  )}>
                    <FaInstagram size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Instagram Analytics</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      {showInstagramAnalytics ? 'Editing' : instagramUsername ? 'Configured' : 'Click to add your Instagram data'}
                    </p>
                  </div>
                </div>
                <ChevronDown size={18} className={cn(
                  "text-gray-400 transition-transform duration-200",
                  showInstagramAnalytics && "rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {showInstagramAnalytics && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-8">

                      {/* ── Account Info ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-pink-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Account Info</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Instagram Username" placeholder="@username" value={instagramUsername} onChange={setInstagramUsername} icon={<FaInstagram size={14} />} />
                            <InputField label="Profile Link" placeholder="https://instagram.com/username" value={instagramProfileLink} onChange={setInstagramProfileLink} prefix="https://" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <SelectField label="Account Type" value={instagramAccountType} onChange={setInstagramAccountType} options={['Creator', 'Business', 'Personal']} />
                            <SelectField label="Posting Frequency" value={instagramPostingFrequency} onChange={setInstagramPostingFrequency} options={['Daily', '3-5 per week', '1-2 per week', 'Bi-weekly', 'Monthly']} />
                          </div>
                        </div>
                      </div>

                      {/* ── Performance Metrics ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Performance Metrics</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Followers</label>
                            <div className="relative">
                              <input type="text" value={instagramFollowers} onChange={e => setInstagramFollowers(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 50000"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Avg. Likes</label>
                            <input type="text" value={instagramTotalLikes} onChange={e => setInstagramTotalLikes(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 1200000"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Avg. Views (Reels)</label>
                            <input type="text" value={instagramAvgViews} onChange={e => setInstagramAvgViews(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 10000"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className={cn(
                              "text-[11px] font-bold uppercase tracking-[0.08em]",
                              instagramER.hasErrors ? 'text-red-600 dark:text-red-400' :
                                instagramER.isAbnormal ? 'text-amber-600 dark:text-amber-400' :
                                  'text-pink-600 dark:text-pink-400'
                            )}>Engagement Rate (Computed)</label>
                            <div className="relative">
                              <input type="text" value={instagramER.hasErrors ? '—' : `${computedInstagramER}`} readOnly disabled
                                className={cn(
                                  'w-full rounded-xl py-3 pl-4 pr-8 text-sm font-bold cursor-not-allowed opacity-80 border',
                                  instagramER.hasErrors
                                    ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                                    : instagramER.isAbnormal
                                      ? 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'
                                      : 'bg-pink-50/50 dark:bg-pink-500/5 border-pink-200 dark:border-pink-500/20 text-pink-700 dark:text-pink-400'
                                )} />
                              <span className={cn(
                                'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold',
                                instagramER.hasErrors ? 'text-red-500' : instagramER.isAbnormal ? 'text-amber-500' : 'text-pink-500'
                              )}>{instagramER.hasErrors ? '' : '%'}</span>
                            </div>
                            {instagramER.isAbnormal && !instagramER.hasErrors && (
                              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                                ⚠️ Unusually high — typical engagement is 1-10%
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Avg. Comments</label>
                            <input type="text" value={instagramAvgComments} onChange={e => setInstagramAvgComments(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 200"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">Avg. Shares</label>
                            <input type="text" value={instagramAvgShares} onChange={e => setInstagramAvgShares(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g. 50"
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all" />
                          </div>
                        </div>
                        <ValidationWarnings warnings={instagramER.warnings} platform="instagram" />
                      </div>

                      {/* ── Content Niche ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-purple-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Content Niche</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Comedy', 'Dance', 'Education', 'Fashion', 'Beauty', 'Food', 'Fitness', 'Tech', 'Gaming', 'Travel', 'Lifestyle', 'Music', 'DIY', 'Finance', 'Pets'].map(niche => (
                            <TagPill
                              key={niche}
                              label={niche}
                              selected={instagramNiche.includes(niche)}
                              onClick={() => setInstagramNiche(prev =>
                                prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* ── Content Style ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-orange-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Content Style</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Reels', 'Static Posts', 'Carousels', 'Stories', 'Live Streams', 'Aesthetic', 'Vlogs', 'Tutorials', 'Photography', 'Meme Content'].map(style => (
                            <TagPill
                              key={style}
                              label={style}
                              selected={instagramContentStyle.includes(style)}
                              onClick={() => setInstagramContentStyle(prev =>
                                prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* ── Audience Demographics ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Audience Demographics</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <SelectField label="Primary Gender" value={instagramAudienceGender} onChange={setInstagramAudienceGender} options={['Mixed', 'Mostly Male', 'Mostly Female']} />
                          <SelectField label="Top Age Range" value={instagramAudienceAgeRange} onChange={setInstagramAudienceAgeRange} options={['13-17', '18-24', '25-34', '35-44', '45+']} />
                          <InputField label="Top Country" placeholder="e.g. Ethiopia" value={instagramAudienceTopCountry} onChange={setInstagramAudienceTopCountry} icon={<Globe size={14} />} />
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>
          </>
        )}

        {/* ── Submit CTA (Advertiser) ── */}
        {!isBusiness && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center pt-4"
          >
            {!canSubmitAdvertiser && (
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
                Please complete at least one TikTok or Instagram analytics form to proceed
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmitAdvertiser}
              className={cn(
                'px-10 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl',
                isSubmitting || !canSubmitAdvertiser
                  ? 'bg-gray-300 dark:bg-white/5 text-gray-500 dark:text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 shadow-emerald-500/20'
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit for Admin Approval'
              )}
            </button>
          </motion.div>
        )}

        {/* ── Pro Tip (Advertiser) ── */}
        {!isBusiness && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-emerald-50 dark:bg-emerald-500/6 border border-emerald-100 dark:border-emerald-500/15 rounded-2xl p-4 flex items-start gap-3"
          >
            <Lightbulb
              size={18}
              className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <span className="font-bold text-gray-900 dark:text-white">
                Pro Tip:
              </span>{' '}
              Brands filter by engagement rate and geography. Ensure your
              metrics and top markets are up-to-date to appear in premium
              search results.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Bottom Bar (Business) ── */}
      {isBusiness && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 px-4 py-4 z-50">
          <div className="max-w-[620px] mx-auto flex items-center gap-4">
            {/* Progress */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profile Completion
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {profileCompletion}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
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
                'flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20',
                isSubmitting
                  ? 'bg-emerald-400 text-white cursor-wait'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400'
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
        <footer className="text-center py-8 px-4 border-t border-gray-100 dark:border-white/4">
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
            © 2024 AACP. Built for the Organic Professional.
          </p>
        </footer>
      )}
    </div>
  );
}
