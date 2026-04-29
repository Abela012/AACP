import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  X,
  CheckCircle2,
  Music2,
  Globe,
  MapPin,
  ChevronDown,
  Lightbulb,
  Save,
  ArrowRight,
  Sparkles,
  BarChart3,
  Briefcase,
  Building2,
  DollarSign,
  Palette,
  Users,
  Target,
  Camera,
} from 'lucide-react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { cn } from '@/src/shared/utils/cn';
import { useApiClient } from '@/src/api/apiClient';
import { userApi } from '@/src/api/userApi';

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
      className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/[0.06] p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ██  MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function CompleteProfilePage({ isInsideDashboard = false }: { isInsideDashboard?: boolean }) {
  console.log("[CompleteProfilePage] Initializing component state...");
  const { userRole, setOnboardingStatus } = useUser();
  const { user: clerkUser } = useClerkUser();
  const { updateProfile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApiClient();

  useEffect(() => {
    if (clerkUser) {
      setFirstName(clerkUser.firstName || '');
      setLastName(clerkUser.lastName || '');
      setProfilePicture(clerkUser.imageUrl || '');
    }
  }, [clerkUser]);

  const isBusiness =
    location.pathname.includes('/business') || userRole === 'business';

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
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  /* ── Business-specific state ── */
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [businessLocation, setBusinessLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companySize, setCompanySize] = useState('1-10');
  const [targetAudienceTags, setTargetAudienceTags] = useState<TagItem[]>([]);
  const [newAudienceTag, setNewAudienceTag] = useState('');
  const [showAudienceInput, setShowAudienceInput] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [brandDescription, setBrandDescription] = useState('');

  /* ── Constants ── */
  const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45+'];
  const contentStyles = [
    'Minimalist',
    'Energetic',
    'Educational',
    'Cinematic',
    'Lo-fi / Raw',
    'Humorous',
  ];
  const companySizes = ['1-10', '11-50', '51-200', '200+'];
  const industries = [
    'Organic Agriculture',
    'Technology',
    'Healthcare',
    'Education',
    'E-commerce',
    'Fintech',
    'SaaS',
    'Fashion & Apparel',
    'Food & Beverage',
    'Other',
  ];
  const languages = [
    'English (US)',
    'English (UK)',
    'Spanish',
    'French',
    'German',
    'Amharic',
    'Arabic',
    'Chinese',
    'Other',
  ];
  const platformOptions = ['Instagram', 'TikTok', 'LinkedIn'];

  /* ── Computed ── */
  const profileCompletion = useMemo(() => {
    if (isBusiness) {
      let filled = 0;
      const total = 7;
      if (businessName) filled++;
      if (industry) filled++;
      if (businessLocation) filled++;
      if (websiteUrl) filled++;
      if (companySize) filled++;
      if (targetAudienceTags.length > 0) filled++;
      if (brandDescription) filled++;
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
    websiteUrl,
    companySize,
    targetAudienceTags,
    brandDescription,
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

  /* ── Handlers ── */
  const toggleAgeRange = (range: string) =>
    setSelectedAgeRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );

  const toggleStyle = (style: string) =>
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );

  const togglePlatform = (platform: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );

  const addGeoTag = useCallback(() => {
    if (newGeo.trim()) {
      setGeoTags((prev) => [...prev, { label: newGeo.trim(), removable: true }]);
      setNewGeo('');
      setShowGeoInput(false);
    }
  }, [newGeo]);

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
      if (isBusiness) {
        profileData = {
          businessName,
          website: websiteUrl,
          industry,
          bio: brandDescription,
          businessLocation,
          companySize,
          targetAudienceTags: targetAudienceTags.map((t) => t.label),
          monthlyBudget,
          selectedPlatforms,
        };
      } else {
        profileData = {
          bio: bioPitch,
          website: portfolioUrl,
          youtubeHandle,
          tiktokHandle,
          instagramHandle,
          xHandle,
          followers,
          avgViews,
          engagementRate,
          geoTags: geoTags.map((t) => t.label),
          ageRanges: selectedAgeRanges,
          primaryLanguage,
          baseRate,
          selectedStyles,
        };
      }

      await userApi.updateProfile(api, {
        firstName,
        lastName,
        profilePicture,
        profileData,
        status: 'pending'
      });

      updateProfile({
        firstName,
        lastName,
        avatarUrl: profilePicture,
        ...profileData
      });
      setOnboardingStatus('approved');
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit profile:', error);
      // Fallback or show toast
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ██  RENDER
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  // ── Success overlay ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/[0.06] p-10 max-w-md w-full text-center shadow-xl"
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
            onClick={() => navigate('/dashboard')}
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
              Craft your brand's digital identity to connect with creators who
              share your organic vision.
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
        <AnimatePresence mode="wait">
          {/* ━━ SHARED: PERSONAL INFORMATION ━━ */}
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

            <div className="grid grid-cols-2 gap-4">
              <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
              <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Doe" />
            </div>
          </SectionCard>

          {isBusiness ? (
            /* ━━ BUSINESS PROFILE ━━ */
            <>
              {/* Business Information */}
              <SectionCard
                icon={<Building2 size={20} />}
                title="Business Information"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                  The core details that define your brand identity.
                </p>

                <div className="space-y-5">
                  <InputField
                    label="Business Name"
                    placeholder="e.g. Verdant Ventures"
                    value={businessName}
                    onChange={setBusinessName}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SelectField
                      label="Industry"
                      value={industry}
                      onChange={setIndustry}
                      options={industries}
                    />
                    <InputField
                      label="Location"
                      placeholder="City, Country"
                      value={businessLocation}
                      onChange={setBusinessLocation}
                      icon={<MapPin size={16} />}
                    />
                  </div>

                  <InputField
                    label="Website URL"
                    placeholder="www.yourbrand.com"
                    value={websiteUrl}
                    onChange={setWebsiteUrl}
                    prefix="https://"
                  />

                  {/* Company Size */}
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
              </SectionCard>

              {/* Campaign Preferences */}
              <SectionCard
                icon={<Target size={20} />}
                title="Campaign Preferences"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                  Define your target audience and engagement channels.
                </p>

                <div className="space-y-6">
                  {/* Target Audience Tags */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                      Target Audience
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {targetAudienceTags.map((tag) => (
                        <RemovableTag
                          key={tag.label}
                          label={tag.label}
                          onRemove={() =>
                            setTargetAudienceTags((prev) =>
                              prev.filter((t) => t.label !== tag.label)
                            )
                          }
                        />
                      ))}
                      {showAudienceInput ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={newAudienceTag}
                            onChange={(e) => setNewAudienceTag(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && addAudienceTag()
                            }
                            placeholder="Add tag"
                            className="w-28 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={addAudienceTag}
                            className="text-emerald-500 hover:text-emerald-400 transition-colors"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => setShowAudienceInput(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAudienceInput(true)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-gray-300 dark:border-white/15 rounded-full text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-all"
                        >
                          <Plus size={14} /> Add Tag
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Monthly Budget Slider */}
                  <div className="bg-gray-50 dark:bg-black/30 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                        Monthly Budget
                      </label>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ${monthlyBudget.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={20000}
                      step={100}
                      value={monthlyBudget}
                      onChange={(e) =>
                        setMonthlyBudget(Number(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                      <span>$100</span>
                      <span>$20,000</span>
                    </div>
                  </div>

                  {/* Primary Platforms */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                      Primary Platforms
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {platformOptions.map((platform) => {
                        const isSelected =
                          selectedPlatforms.includes(platform);
                        const Icon =
                          platform === 'Instagram'
                            ? FaInstagram
                            : platform === 'TikTok'
                            ? Music2
                            : FaLinkedin;
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => togglePlatform(platform)}
                            className={cn(
                              'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all',
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-gray-900 dark:text-white'
                                : 'bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-emerald-300'
                            )}
                          >
                            {isSelected && (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500"
                              />
                            )}
                            {!isSelected && (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-white/20" />
                            )}
                            <Icon size={16} />
                            {platform}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* About the Brand */}
              <SectionCard
                icon={<Palette size={20} />}
                title="About the Brand"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                  Share your mission and brand narrative.
                </p>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                    Brand Description
                  </label>
                  <div className="relative">
                    <textarea
                      rows={5}
                      value={brandDescription}
                      onChange={(e) => setBrandDescription(e.target.value)}
                      placeholder="Tell us your story..."
                      maxLength={500}
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] text-gray-400">
                      {brandDescription.length} / 500 characters
                    </span>
                  </div>
                </div>
              </SectionCard>
            </>
          ) : (
            /* ━━ ADVERTISER (CREATOR) PROFILE ━━ */
            <>
              {/* Social Media Details */}
              <SectionCard
                icon={<Sparkles size={20} />}
                title="Social Media Details"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <PlatformButton
                      icon={
                        <FaYoutube
                          size={18}
                          className="text-red-500"
                        />
                      }
                      label="YouTube"
                      connected={youtubeConnected}
                      onClick={() =>
                        setYoutubeConnected(!youtubeConnected)
                      }
                    />
                    <input
                      value={youtubeHandle}
                      onChange={(e) => setYoutubeHandle(e.target.value)}
                      placeholder="@youtube_handle"
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <PlatformButton
                      icon={
                        <Music2
                          size={18}
                          className="text-gray-900 dark:text-white"
                        />
                      }
                      label="TikTok"
                      connected={tiktokConnected}
                      onClick={() =>
                        setTiktokConnected(!tiktokConnected)
                      }
                    />
                    <input
                      value={tiktokHandle}
                      onChange={(e) => setTiktokHandle(e.target.value)}
                      placeholder="@tiktok_handle"
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <PlatformButton
                      icon={
                        <FaInstagram
                          size={18}
                          className="text-pink-500"
                        />
                      }
                      label="Instagram"
                      connected={instagramConnected}
                      onClick={() =>
                        setInstagramConnected(!instagramConnected)
                      }
                    />
                    <input
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@instagram_handle"
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <PlatformButton
                      icon={
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-current text-gray-900 dark:text-white">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                      }
                      label="X (Twitter)"
                      connected={xConnected}
                      onClick={() =>
                        setXConnected(!xConnected)
                      }
                    />
                    <input
                      value={xHandle}
                      onChange={(e) => setXHandle(e.target.value)}
                      placeholder="@x_handle"
                      className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Audience Metrics */}
              <SectionCard
                icon={<BarChart3 size={20} />}
                title="Audience Metrics"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField
                      label="Followers"
                      placeholder="e.g. 1.2M"
                      value={followers}
                      onChange={setFollowers}
                    />
                    <InputField
                      label="Avg. Views"
                      placeholder="e.g. 450k"
                      value={avgViews}
                      onChange={setAvgViews}
                    />
                    <InputField
                      label="Engagement %"
                      placeholder="e.g. 4.2%"
                      value={engagementRate}
                      onChange={setEngagementRate}
                    />
                  </div>

                  {/* Geographies */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                      Top Audience Geographies
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {geoTags.map((tag) => (
                        <RemovableTag
                          key={tag.label}
                          label={tag.label}
                          onRemove={() =>
                            setGeoTags((prev) =>
                              prev.filter((t) => t.label !== tag.label)
                            )
                          }
                        />
                      ))}
                      {showGeoInput ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={newGeo}
                            onChange={(e) => setNewGeo(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && addGeoTag()
                            }
                            placeholder="Country"
                            className="w-28 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={addGeoTag}
                            className="text-emerald-500 hover:text-emerald-400 transition-colors"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => setShowGeoInput(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowGeoInput(true)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-gray-300 dark:border-white/15 rounded-full text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-all"
                        >
                          <Plus size={14} /> Add Country
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                      Audience Age Range
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {ageRanges.map((range) => (
                        <TagPill
                          key={range}
                          label={range}
                          selected={selectedAgeRanges.includes(range)}
                          onClick={() => toggleAgeRange(range)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Work & Pricing */}
              <SectionCard
                icon={<Briefcase size={20} />}
                title="Work & Pricing"
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <InputField
                        label="Portfolio URL"
                        placeholder="https://youtube.com/c/creator"
                        value={portfolioUrl}
                        onChange={setPortfolioUrl}
                        icon={<Globe size={16} />}
                      />
                    </div>
                    <SelectField
                      label="Primary Language"
                      value={primaryLanguage}
                      onChange={setPrimaryLanguage}
                      options={languages}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="Base Rate (USD)"
                      placeholder="500"
                      value={baseRate}
                      onChange={setBaseRate}
                      icon={<DollarSign size={16} />}
                      type="number"
                    />
                    <InputField
                      label="Bio / Pitch"
                      placeholder="Short intro..."
                      value={bioPitch}
                      onChange={setBioPitch}
                    />
                  </div>

                  {/* Content Style / Vibe */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">
                      Content Style / Vibe
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {contentStyles.map((style) => (
                        <TagPill
                          key={style}
                          label={style}
                          selected={selectedStyles.includes(style)}
                          onClick={() => toggleStyle(style)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </>
          )}
        </AnimatePresence>

        {/* ── Submit CTA (Advertiser) ── */}
        {!isBusiness && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center pt-4"
          >
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                'px-10 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl shadow-emerald-500/20',
                isSubmitting
                  ? 'bg-emerald-400 text-white cursor-wait'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5'
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
            className="bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-100 dark:border-emerald-500/15 rounded-2xl p-4 flex items-start gap-3"
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/[0.06] px-4 py-4 z-50">
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
      <footer className="text-center py-8 px-4 border-t border-gray-100 dark:border-white/[0.04]">
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
