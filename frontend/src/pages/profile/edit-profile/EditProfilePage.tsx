import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Globe,
  Mail,
  Lock,
  Bell,
  Shield,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  X,
  LogOut,
  MapPin,
  Briefcase,
  Info,
  Share2,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Check,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { SocialConnectionModal } from '../components/SocialConnectionModal';
import toast from 'react-hot-toast';
import { useClerk, useUser as useClerkUser } from '@clerk/clerk-react';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { cn } from '@/src/shared/utils/cn';
import { useApiClient } from '@/src/api/apiClient';
import { userApi } from '@/src/api/userApi';

export default function EditProfilePage() {
  const { userRole, logout: localLogout } = useUser();
  const { profile, updateProfile, refreshProfile, isLoading } = useProfile();
  const { signOut } = useClerk();
  const { user: clerkUser } = useClerkUser();
  const api = useApiClient();
  const location = useLocation();

  const isBusiness = location.pathname.includes('/business') || userRole === 'business_owner';
  const Layout = isBusiness ? BusinessLayout : AdvertiserLayout;

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Local form state – seeded from context
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [businessName, setBusinessName] = useState(profile.businessName || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [industry, setIndustry] = useState(profile.industry || 'Food & Beverage');
  const [businessLocation, setBusinessLocation] = useState(profile.businessLocation || '');
  const [companySize, setCompanySize] = useState(profile.companySize || '1-10');
  const [monthlyBudget, setMonthlyBudget] = useState(profile.monthlyBudget || 50000);
  const [maxSpendPerPostETB, setMaxSpendPerPostETB] = useState((profile as any).budget || 15000);
  const [minEngagementPercent, setMinEngagementPercent] = useState((profile as any).minEngagement || '3');
  const [brandVoice, setBrandVoice] = useState((profile as any).brandVoice || 'Friendly');
  const [servicesOffered, setServicesOffered] = useState((profile as any).servicesOffered || '');
  const [primaryKpis, setPrimaryKpis] = useState<string[]>((profile as any).primaryKpis || []);
  const [promotionGoals, setPromotionGoals] = useState<string[]>((profile as any).promotionGoals || []);
  const [promotersNeededCount, setPromotersNeededCount] = useState((profile as any).promotersNeededCount || '');
  const [targetAudienceAgeRanges, setTargetAudienceAgeRanges] = useState<string[]>((profile as any).targetAudienceAgeRanges || []);

  const [youtubeHandle, setYoutubeHandle] = useState(profile.youtubeHandle || '');
  const [tiktokHandle, setTiktokHandle] = useState(profile.tiktokHandle || '');
  const [instagramHandle, setInstagramHandle] = useState(profile.instagramHandle || '');
  const [xHandle, setXHandle] = useState(profile.xHandle || '');

  const [followers, setFollowers] = useState<string | number>(profile.followers || '');
  const [avgViews, setAvgViews] = useState<string | number>(profile.avgViews || '');
  const [engagementRate, setEngagementRate] = useState<string | number>(profile.engagementRate || '');
  const [baseRate, setBaseRate] = useState(profile.baseRate || '');
  // Track if metrics are auto-imported from a verified platform
  const [metricsAutoImported, setMetricsAutoImported] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState(profile.website || '');
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [isTiktokConnected, setIsTiktokConnected] = useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [activeConnectionModal, setActiveConnectionModal] = useState<'tiktok' | 'instagram' | null>(null);
  const [platformToDisconnect, setPlatformToDisconnect] = useState<string | null>(null);

  // Complete Profile fields
  const [niche, setNiche] = useState(profile.niche || '');
  const [contentTypes, setContentTypes] = useState<string[]>(profile.contentTypes || []);
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel || '');
  const [ageRange, setAgeRange] = useState(profile.targetAudience?.ageRange || '');
  const [gender, setGender] = useState(profile.targetAudience?.gender || '');
  const [interests, setInterests] = useState<string[]>(profile.targetAudience?.interests || []);
  const [interestInput, setInterestInput] = useState('');

  // Sync local state when profile loads/refreshes
  useEffect(() => {
    if (profile && !isLoading) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setBusinessName(profile.businessName || '');
      setWebsite(profile.website || '');
      setIndustry(profile.industry || 'Food & Beverage');
      setBusinessLocation(profile.businessLocation || '');
      setCompanySize(profile.companySize || '1-10');
      setMonthlyBudget(profile.monthlyBudget || 50000);
      setMaxSpendPerPostETB((profile as any).budget || 15000);
      setMinEngagementPercent((profile as any).minEngagement || '3');
      setBrandVoice((profile as any).brandVoice || 'Friendly');
      setServicesOffered((profile as any).servicesOffered || '');
      setPrimaryKpis((profile as any).primaryKpis || []);
      setPromotionGoals((profile as any).promotionGoals || []);
      setPromotersNeededCount((profile as any).promotersNeededCount || '');
      setTargetAudienceAgeRanges((profile as any).targetAudienceAgeRanges || []);

      setYoutubeHandle(profile.youtubeHandle || '');
      setTiktokHandle(profile.tiktokHandle || '');
      setInstagramHandle(profile.instagramHandle || '');
      setXHandle(profile.xHandle || '');

      setFollowers(profile.followers || '');
      // Auto-import metrics from connectedAccounts if present
      const ca = (profile as any).connectedAccounts || {};
      const caT = ca.tiktok?.metrics || {};
      const caI = ca.instagram?.metrics || {};
      const caF = ca.facebook?.metrics || {};
      const hasConnectedMetrics = caT.avgViews || caI.avgViews || caT.engagementRate || caI.engagementRate || caF.engagementRate;
      if (hasConnectedMetrics) {
        const computedAvgViews = (caT.avgViews || 0) + (caI.avgViews || 0);
        const computedER = Math.max(caT.engagementRate || 0, caI.engagementRate || 0, caF.engagementRate || 0);
        setAvgViews(computedAvgViews || profile.avgViews || '');
        setEngagementRate(computedER || profile.engagementRate || '');
        setMetricsAutoImported(true);
      } else {
        setAvgViews(profile.avgViews || '');
        setEngagementRate(profile.engagementRate || '');
        setMetricsAutoImported(false);
      }
      setPhone(profile.phone || profile.phoneNumber || '');
      setBaseRate(profile.baseRate || '');
      setPortfolioUrl(profile.website || '');
      setCoverPreview(profile.coverImageUrl || '');

      setIsFacebookConnected(!!profile.facebook || !!profile.facebookConnected || !!(profile as any).connectedAccounts?.facebook?.connected);
      setIsTiktokConnected(!!(profile as any).connectedAccounts?.tiktok?.connected);
      setIsInstagramConnected(!!(profile as any).connectedAccounts?.instagram?.connected);

      // Sync completed profile details for advertisers
      setNiche((profile as any).niche || '');
      setContentTypes((profile as any).contentTypes || []);
      setExperienceLevel((profile as any).experienceLevel || '');
      const ta = (profile as any).targetAudience || {};
      setAgeRange(ta.ageRange || '');
      setGender(ta.gender || '');
      setInterests(ta.interests || []);
    }
  }, [profile, isLoading]);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string>(profile.avatarUrl || '');
  const [coverPreview, setCoverPreview] = useState<string>(profile.coverImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Notification toggles
  const [notifOpportunities, setNotifOpportunities] = useState(true);
  const [notifCampaignUpdates, setNotifCampaignUpdates] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [needsReverify, setNeedsReverify] = useState(false);

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setIsChangingPassword(true);
    try {
      if (!clerkUser) {
        console.error('Clerk user not found');
        setPasswordError('User not authenticated. Please sign in again.');
        return;
      }

      // Check if updatePassword method exists
      if (!clerkUser.updatePassword || typeof clerkUser.updatePassword !== 'function') {
        console.error('updatePassword method not available on user object', clerkUser);
        setPasswordError('Password update is not available. Please try signing out and in again.');
        return;
      }

      console.log('Attempting password update...');

      // Use Clerk's updatePassword method
      const result = await clerkUser.updatePassword({
        currentPassword,
        newPassword,
      });

      console.log('Password update successful:', result);

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNeedsReverify(false);
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (error: any) {
      console.error('Password update error:', error);

      // Handle Clerk-specific errors
      const clerkError = error?.errors?.[0];
      const errorCode = clerkError?.code || error?.code;
      const errorMsg = clerkError?.message || error?.message || 'Failed to update password.';

      console.error('Error details:', { errorCode, errorMsg, fullError: error });

      // Check if reverification is needed
      if (
        errorCode === 'session_reverification_required' ||
        errorMsg.includes('reverification') ||
        errorMsg.includes('re-verification') ||
        errorMsg.includes('additional verification') ||
        errorCode === 'verification_expired'
      ) {
        setNeedsReverify(true);
        setPasswordError('⚠️ For security, please sign out and sign back in, then try updating your password again.');
      } else if (errorCode === 'password_incorrect' || errorMsg.includes('current password') || errorMsg.includes('incorrect')) {
        setPasswordError('Your current password is incorrect. Please try again.');
      } else if (errorCode === 'user_session_expired' || errorMsg.includes('session')) {
        setPasswordError('Your session has expired. Please sign out and sign in again to continue.');
      } else if (errorMsg.includes('password_too_weak') || errorMsg.includes('weak')) {
        setPasswordError('Your new password is too weak. Use a mix of uppercase, lowercase, numbers, and symbols.');
      } else {
        setPasswordError(errorMsg || 'Failed to update password. Please try again.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: User },
    { id: 'company', label: isBusiness ? 'Company Details' : 'Professional Details', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'social', label: 'Social Connections', icon: Share2 },
  ];

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) { // 2MB
      alert('Image must be under 2MB.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/users/profile/picture?type=avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newUrl = res.data.user.profilePicture;
      setAvatarPreview(newUrl);
      updateProfile({ avatarUrl: newUrl });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload image.');
    } finally {
      setIsSaving(false);
    }
  }, [api, updateProfile]);

  const handleCoverChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[EditProfile] Starting cover upload for file:', file.name);
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/users/profile/picture?type=cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('[EditProfile] Cover upload response:', res.data);
      const newUrl = res.data.user.coverImage;
      if (newUrl) {
        setCoverPreview(newUrl);
        updateProfile({ coverImageUrl: newUrl, coverImage: newUrl });
        console.log('[EditProfile] Updated cover preview and profile context with:', newUrl);
      }
    } catch (error) {
      console.error('[EditProfile] Failed to upload cover:', error);
      alert('Failed to upload image. Please check your connection or file size.');
    } finally {
      setIsSaving(false);
      if (e.target) e.target.value = ''; // Reset input to allow re-uploading same file
    }
  }, [api, updateProfile]);

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'general') {
        const profileData = {
          bio,
          phone,
          phoneNumber: phone,
          coverImage: coverPreview,
        };

        if (!isBusiness) {
          // Sync basic details through specialized advertiser endpoint
          await api.put('/advertiser/profile/basic', {
            firstName,
            lastName,
            phoneNumber: phone,
          });
        }

        await userApi.updateProfile(api, {
          firstName,
          lastName,
          bio,
          location: businessLocation,
          profileData,
        });
        updateProfile({ firstName, lastName, businessLocation, ...profileData });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else if (activeTab === 'company') {
        if (!isBusiness) {
          // Sync professional details through specialized advertiser endpoint
          await api.put('/advertiser/profile/content', {
            niche,
            contentTypes,
            targetAudience: {
              ageRange,
              gender,
              interests,
            },
            experienceLevel,
          });
        }

        const profileData = {
          businessName,
          website: isBusiness ? website : portfolioUrl,
          industry,
          businessLocation,
          companySize,
          monthlyBudget,
          budget: maxSpendPerPostETB,
          minEngagement: Number(minEngagementPercent),
          brandVoice,
          servicesOffered,
          primaryKpis,
          promotionGoals,
          promotersNeededCount,
          targetAudienceAgeRanges,
          youtubeHandle,
          tiktokHandle,
          instagramHandle,
          xHandle,

          followers,
          avgViews,
          engagementRate,
          baseRate,
          geoTags: profile.geoTags,
          niches: profile.niches,
          ageRanges: profile.ageRanges,
          primaryLanguage: profile.primaryLanguage,
        };
        await userApi.submitProfile(api, {
          profileData,
        });

        if (!isBusiness) {
          updateProfile({
            niche,
            contentTypes,
            targetAudience: {
              ageRange,
              gender,
              interests,
            },
            experienceLevel,
            website: portfolioUrl,
            youtubeHandle,
            tiktokHandle,
            instagramHandle,
            xHandle,
            followers,
            avgViews,
            engagementRate,
            baseRate,
          });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          setShowSubmitModal(true);
        }
      }

      await refreshProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectFacebook = async () => {
    setPlatformToDisconnect('Facebook');
  };

  const handleConnectFacebook = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/social/initiate/facebook`;
  };

  const handleDisconnectPlatform = async (platform: string) => {
    setPlatformToDisconnect(platform);
  };

  const confirmDisconnect = async () => {
    if (!platformToDisconnect) return;

    setIsSaving(true);
    try {
      await api.delete(`/social/disconnect/${platformToDisconnect.toLowerCase()}`);

      if (platformToDisconnect.toLowerCase() === 'tiktok') setIsTiktokConnected(false);
      else if (platformToDisconnect.toLowerCase() === 'instagram') setIsInstagramConnected(false);
      else if (platformToDisconnect.toLowerCase() === 'facebook') setIsFacebookConnected(false);

      toast.success(`${platformToDisconnect} account disconnected successfully.`);
      refreshProfile();
    } catch (error) {
      console.error(`Failed to disconnect ${platformToDisconnect}:`, error);
      toast.error(`Failed to disconnect ${platformToDisconnect}. Please try again.`);
    } finally {
      setIsSaving(false);
      setPlatformToDisconnect(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const inputCls =
    'w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white';
  const labelCls = 'text-xs font-bold text-gray-500 uppercase tracking-wider';
  const profilePlaceholder = (value: string | number | undefined, fallback: string) =>
    value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : fallback;

  const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45+'];
  const companySizes = ['1-10', '11-50', '51-200', '200+'];
  const industriesList = [
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
  const businessGoals = [
    'More Customers',
    'Brand Awareness',
    'Product Promotion',
    'Online Visibility',
    'Lead Generation',
    'Launch / Relaunch',
  ];
  const brandVoiceOptions = ['Professional', 'Friendly', 'Luxury', 'Fun', 'Modern'];
  const kpiOptions = [
    'Sales / Orders',
    'Leads & Inquiries',
    'Brand Awareness',
    'Store Visits',
    'App Installs',
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  return (
    <Layout>
      <main className="p-4 sm:p-8 max-w-[1000px] mx-auto w-full pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your profile information and preferences.</p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg',
              showSuccess
                ? 'bg-cyan-500 text-white shadow-cyan-500/20'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20',
              isSaving && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : showSuccess ? (
              <><CheckCircle2 size={18} /> Saved!</>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => {
                  localLogout();
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="md:col-span-9">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none min-h-[500px]"
            >
              {/* ── GENERAL INFO ── */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">General Information</h2>

                  {/* Cover Image Upload */}
                  <div className="mb-8 space-y-4">
                    <label className={labelCls}>Cover Image</label>
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden group border border-gray-200 dark:border-white/10">
                      <img
                        src={coverPreview || (isBusiness
                          ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop'
                          : 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop')}
                        alt="Cover"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/30 transition-all active:scale-95 shadow-xl"
                      >
                        <ImageIcon size={16} />
                        Change Cover
                      </button>

                      <input
                        ref={coverInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverChange}
                      />
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden">
                        <img
                          src={avatarPreview || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=10b981&color=fff`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <ImageIcon size={20} className="text-white" />
                      </div>
                    </div>

                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                        id="avatar-upload"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-2 mb-2 border border-gray-200 dark:border-white/10"
                      >
                        <ImageIcon size={16} />
                        Upload New Photo
                      </button>
                      <button
                        onClick={handleRemoveAvatar}
                        className="px-4 py-2 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2 mb-2"
                      >
                        <X size={16} />
                        Remove
                      </button>
                      <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelCls}>First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className={labelCls}>Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={email}
                          readOnly
                          className={cn(inputCls, "cursor-not-allowed opacity-60 bg-gray-100 dark:bg-white/5 select-none")}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className={labelCls}>Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputCls}
                          placeholder="+251 ..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className={labelCls}>{isBusiness ? 'Brand Description' : 'About Me / Biography'}</label>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={isBusiness ? "Describe your brand in a few sentences..." : "Tell us about your content creation style, niches, and personality..."}
                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── COMPANY DETAILS ── */}
              {activeTab === 'company' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isBusiness ? 'Business Profile' : 'Professional Details'}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {isBusiness && (
                      <>
                        <div className="space-y-2 sm:col-span-2">
                          <label className={labelCls}>Business Name</label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              className={inputCls}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={labelCls}>Industry</label>
                          <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none"
                          >
                            {industriesList.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className={labelCls}>Website URL</label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="url"
                              value={website}
                              onChange={(e) => setWebsite(e.target.value)}
                              className={inputCls}
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={labelCls}>Location</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              value={businessLocation}
                              onChange={(e) => setBusinessLocation(e.target.value)}
                              className={inputCls}
                              placeholder={profilePlaceholder(profile.businessLocation, 'City, Country')}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={labelCls}>Company Size</label>
                          <select
                            value={companySize}
                            onChange={(e) => setCompanySize(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none"
                          >
                            {companySizes.map(cs => <option key={cs} value={cs}>{cs}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {isBusiness ? (
                      <>
                        <div className="space-y-2 sm:col-span-2">
                          <label className={labelCls}>Products or Services</label>
                          <textarea
                            rows={3}
                            value={servicesOffered}
                            onChange={(e) => setServicesOffered(e.target.value)}
                            placeholder="What do you offer? (e.g. Restaurant services, catering, etc.)"
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white resize-none"
                          />
                        </div>

                        {/* Marketing Strategy */}
                        <div className="sm:col-span-2 pt-4 border-t border-gray-100 dark:border-white/5 space-y-6">
                          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Marketing Strategy</h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className={labelCls}>Monthly Budget (ETB)</label>
                              <input
                                type="number"
                                value={monthlyBudget}
                                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                                className={inputCls.replace('pl-10', 'pl-4')}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className={labelCls}>Max Budget per Post (ETB)</label>
                              <input
                                type="number"
                                value={maxSpendPerPostETB}
                                onChange={(e) => setMaxSpendPerPostETB(Number(e.target.value))}
                                className={inputCls.replace('pl-10', 'pl-4')}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className={labelCls}>Min. Engagement (%)</label>
                              <input
                                type="text"
                                value={minEngagementPercent}
                                onChange={(e) => setMinEngagementPercent(e.target.value)}
                                className={inputCls.replace('pl-10', 'pl-4')}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className={labelCls}>Promoters Needed</label>
                              <input
                                type="text"
                                value={promotersNeededCount}
                                onChange={(e) => setPromotersNeededCount(e.target.value)}
                                className={inputCls.replace('pl-10', 'pl-4')}
                                placeholder="e.g. 5"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className={labelCls}>Brand Voice</label>
                              <select
                                value={brandVoice}
                                onChange={(e) => setBrandVoice(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none"
                              >
                                {brandVoiceOptions.map(bv => <option key={bv} value={bv}>{bv}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Goals & KPIs */}
                        <div className="sm:col-span-2 pt-4 border-t border-gray-100 dark:border-white/5 space-y-6">
                          <div className="space-y-4">
                            <label className={labelCls}>Promotion Goals</label>
                            <div className="flex flex-wrap gap-2">
                              {businessGoals.map(goal => (
                                <button
                                  key={goal}
                                  onClick={() => toggleItem(promotionGoals, setPromotionGoals, goal)}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                    promotionGoals.includes(goal)
                                      ? "bg-emerald-500 text-black border-emerald-500"
                                      : "bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10 hover:border-emerald-500/50"
                                  )}
                                >
                                  {goal}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className={labelCls}>Primary Success Metrics (KPIs)</label>
                            <div className="flex flex-wrap gap-2">
                              {kpiOptions.map(kpi => (
                                <button
                                  key={kpi}
                                  onClick={() => toggleItem(primaryKpis, setPrimaryKpis, kpi)}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                    primaryKpis.includes(kpi)
                                      ? "bg-cyan-500 text-white border-cyan-500"
                                      : "bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10 hover:border-cyan-500/50"
                                  )}
                                >
                                  {kpi}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Target Audience */}
                        <div className="sm:col-span-2 pt-4 border-t border-gray-100 dark:border-white/5 space-y-6">
                          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Target Audience</h3>
                          <div className="flex flex-wrap gap-2">
                            {ageRanges.map(age => (
                              <button
                                key={age}
                                onClick={() => toggleItem(targetAudienceAgeRanges, setTargetAudienceAgeRanges, age)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                  targetAudienceAgeRanges.includes(age)
                                    ? "bg-amber-500 text-black border-amber-500"
                                    : "bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10 hover:border-amber-500/50"
                                )}
                              >
                                {age}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className={labelCls}>Portfolio URL</label>
                          <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder={profilePlaceholder(profile.website, 'https://')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelCls}>Base Rate (ETB)</label>
                          <input
                            type="number"
                            value={baseRate}
                            onChange={(e) => setBaseRate(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder={profilePlaceholder(profile.baseRate, '500')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelCls}>Followers</label>
                          <input
                            type="text"
                            value={followers}
                            onChange={(e) => setFollowers(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder={profilePlaceholder(profile.followers, '1.2M')}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className={labelCls}>Avg Views</label>
                            {metricsAutoImported && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">⚡ Auto-imported</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={avgViews}
                            onChange={(e) => { setAvgViews(e.target.value); setMetricsAutoImported(false); }}
                            className={cn(inputCls.replace('pl-10', 'pl-4'), metricsAutoImported && 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold')}
                            placeholder={profilePlaceholder(profile.avgViews, '450k')}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className={labelCls}>Engagement Rate (%)</label>
                            {metricsAutoImported && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">⚡ Auto-imported</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={engagementRate}
                            onChange={(e) => { setEngagementRate(e.target.value); setMetricsAutoImported(false); }}
                            className={cn(inputCls.replace('pl-10', 'pl-4'), metricsAutoImported && 'bg-emerald-500/5 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold')}
                            placeholder={profilePlaceholder(profile.engagementRate, '4.2%')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelCls}>YouTube Handle</label>
                          <input
                            type="text"
                            value={youtubeHandle}
                            onChange={(e) => setYoutubeHandle(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder={profilePlaceholder(profile.youtubeHandle, '@handle')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelCls}>TikTok Handle</label>
                          <input
                            type="text"
                            value={tiktokHandle}
                            onChange={(e) => setTiktokHandle(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder={profilePlaceholder(profile.tiktokHandle, '@handle')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelCls}>Instagram Handle</label>
                          <input
                            type="text"
                            value={instagramHandle}
                            onChange={(e) => setInstagramHandle(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder={profilePlaceholder(profile.instagramHandle, '@handle')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className={labelCls}>X (Twitter) Handle</label>
                          <input
                            type="text"
                            value={xHandle}
                            onChange={(e) => setXHandle(e.target.value)}
                            className={inputCls.replace('pl-10', 'pl-4')}
                            placeholder={profilePlaceholder(profile.xHandle, '@handle')}
                          />
                        </div>

                        {/* ── Content & Niche Advertiser Settings (Synced from Complete Profile) ── */}
                        <div className="sm:col-span-2 pt-6 mt-6 border-t border-gray-100 dark:border-white/5 space-y-6">
                          <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="p-1 bg-emerald-500/10 rounded-lg">🎯</span> Content & Niche Selection
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Primary Niche Category */}
                            <div className="space-y-2">
                              <label className={labelCls}>Primary Niche Category</label>
                              <select
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                              >
                                <option value="" disabled>Select Primary Niche</option>
                                <option value="beauty">Beauty & Cosmetics</option>
                                <option value="fashion">Fashion & Style</option>
                                <option value="tech">Technology & Gaming</option>
                                <option value="gaming">Gaming & Esports</option>
                                <option value="food">Food & Culinary</option>
                                <option value="travel">Travel & Adventure</option>
                                <option value="fitness">Fitness & Wellness</option>
                                <option value="lifestyle">Lifestyle & Blogs</option>
                                <option value="business">Business & Finance</option>
                                <option value="comedy">Comedy & Entertainment</option>
                                <option value="education">Education & Science</option>
                                <option value="music">Music & Dance</option>
                                <option value="sports">Sports & Outdoors</option>
                                <option value="other">Other / General</option>
                              </select>
                            </div>

                            {/* Experience Level */}
                            <div className="space-y-2">
                              <label className={labelCls}>Experience Level</label>
                              <select
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                              >
                                <option value="" disabled>Select Experience Level</option>
                                <option value="beginner">Beginner (Under 1 Year / Passionate)</option>
                                <option value="intermediate">Intermediate (1-2 Years / Rising Star)</option>
                                <option value="advanced">Advanced (3-5 Years / Professional)</option>
                                <option value="professional">Professional (5+ Years / Elite Influence)</option>
                              </select>
                            </div>
                          </div>

                          {/* Content Formats Checkboxes */}
                          <div className="space-y-3">
                            <label className={labelCls}>Content Formats / Formats of Choice</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {[
                                { id: 'tutorials', label: '🎥 Tutorials' },
                                { id: 'reviews', label: '⭐ Product Reviews' },
                                { id: 'unboxings', label: '📦 Unboxings' },
                                { id: 'vlogs', label: '🚶 Everyday Vlogs' },
                                { id: 'comedy', label: '🎭 Skits & Comedy' },
                                { id: 'educational', label: '🧠 Educational' },
                                { id: 'storytime', label: '🗣️ Storytimes' },
                                { id: 'challenges', label: '🏆 Challenges' },
                                { id: 'duets', label: '👥 Duets & Collabs' },
                                { id: 'live_streams', label: '🔴 Live Streaming' }
                              ].map(c => {
                                const selected = contentTypes.includes(c.id);
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setContentTypes(selected
                                        ? contentTypes.filter(x => x !== c.id)
                                        : [...contentTypes, c.id]
                                      );
                                    }}
                                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${selected
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500 dark:text-emerald-400"
                                      : "bg-gray-50 dark:bg-black/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-emerald-500/50"
                                      }`}
                                  >
                                    {c.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* ── Demographics section ── */}
                        <div className="sm:col-span-2 pt-6 border-t border-gray-100 dark:border-white/5 space-y-6">
                          <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="p-1 bg-emerald-500/10 rounded-lg">📊</span> Target Audience Demographics
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Target Age Range */}
                            <div className="space-y-2">
                              <label className={labelCls}>Target Age Range</label>
                              <select
                                value={ageRange}
                                onChange={(e) => setAgeRange(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                              >
                                <option value="">Select Age Group</option>
                                <option value="13-17">Gen Z Teens (13-17)</option>
                                <option value="18-24">Gen Z Adults (18-24)</option>
                                <option value="25-34">Young Millennials (25-34)</option>
                                <option value="35-44">Mature Millennials (35-44)</option>
                                <option value="45+">Boomers & Older (45+)</option>
                              </select>
                            </div>

                            {/* Target Gender Balance */}
                            <div className="space-y-2">
                              <label className={labelCls}>Audience Gender Balance</label>
                              <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                              >
                                <option value="">Select Gender Balance</option>
                                <option value="all">Balanced / All Genders</option>
                                <option value="male">Mostly Male Audience</option>
                                <option value="female">Mostly Female Audience</option>
                                <option value="other">Diverse / Queer Audience</option>
                              </select>
                            </div>
                          </div>

                          {/* Audience Interests Tagging */}
                          <div className="space-y-3">
                            <label className={labelCls}>Audience Key Interests</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Press enter or click add (e.g. tech, fashion)"
                                value={interestInput}
                                onChange={(e) => setInterestInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = interestInput.trim().toLowerCase();
                                    if (val && !interests.includes(val)) {
                                      setInterests([...interests, val]);
                                      setInterestInput('');
                                    }
                                  }
                                }}
                                className="flex-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all text-gray-900 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const val = interestInput.trim().toLowerCase();
                                  if (val && !interests.includes(val)) {
                                    setInterests([...interests, val]);
                                    setInterestInput('');
                                  }
                                }}
                                className="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs hover:opacity-90 transition-all"
                              >
                                Add
                              </button>
                            </div>
                            {interests.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {interests.map(tag => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/10"
                                  >
                                    #{tag}
                                    <button
                                      type="button"
                                      onClick={() => setInterests(interests.filter(x => x !== tag))}
                                      className="hover:text-red-500 text-[10px] font-bold p-0.5"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>

                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Change Password</h4>
                    {passwordError && (
                      <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl space-y-3">
                        <p className="text-red-600 dark:text-red-400 text-sm">{passwordError}</p>
                        {needsReverify && (
                          <button
                            onClick={async () => {
                              try {
                                setPasswordError('');
                                setNeedsReverify(false);
                                // Sign out with Clerk and redirect to login
                                await signOut({ redirectUrl: '/login' });
                              } catch (err) {
                                console.error('Sign out error:', err);
                                // Fallback: manually clear local state and redirect
                                localLogout();
                                window.location.href = '/login';
                              }
                            }}
                            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                          >
                            ✓ Sign Out & Sign In Again
                          </button>
                        )}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        {passwordSuccess}
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Current Password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="w-full mt-2 bg-emerald-500 text-black text-sm font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                      >
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'New Opportunities',
                        desc: 'Get notified when an AI match is found.',
                        value: notifOpportunities,
                        onChange: setNotifOpportunities,
                      },
                      {
                        title: 'Campaign Updates',
                        desc: 'Status changes and workflow alerts.',
                        value: notifCampaignUpdates,
                        onChange: setNotifCampaignUpdates,
                      },
                      {
                        title: 'Marketing Invites',
                        desc: 'News, events, and feature updates.',
                        value: notifMarketing,
                        onChange: setNotifMarketing,
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/50 rounded-2xl border border-gray-100 dark:border-white/5"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={item.value}
                            onChange={(e) => item.onChange(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SOCIAL CONNECTIONS ── */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Connected Accounts</h2>
                  <div className="space-y-4">
                    {/* Facebook Connection */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <FaFacebook className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">Facebook</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Used for analytics and ad campaign management.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isFacebookConnected ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-xl cursor-default"
                          >
                            Connected
                          </button>
                        ) : (
                          <button
                            onClick={handleConnectFacebook}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>

                    {/* TikTok Connection */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-200 dark:bg-white/10 rounded-xl">
                          <FaTiktok className="text-black dark:text-white" size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">TikTok</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Used to showcase your creator profile and engagement metrics.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isTiktokConnected ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-xl cursor-default"
                          >
                            Connected
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveConnectionModal('tiktok')}
                            disabled={isSaving}
                            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl hover:opacity-80 transition-colors disabled:opacity-50"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Instagram Connection */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                          <FaInstagram className="text-pink-600 dark:text-pink-400" size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">Instagram</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Used to showcase your creator profile and engagement metrics.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isInstagramConnected ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-xl cursor-default"
                          >
                            Connected
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveConnectionModal('instagram')}
                            disabled={isSaving}
                            className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Link to Data Deletion Instructions */}
                    <div className="p-4 bg-gray-50 dark:bg-black/50 border border-dashed border-gray-300 dark:border-white/10 rounded-xl">
                      <p className="text-xs text-gray-500 text-center">
                        Want to delete your Facebook data? See our{' '}
                        <a href="/data-deletion" className="text-blue-600 hover:underline font-semibold">
                          Data Deletion Instructions
                        </a>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Submission Success Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[440px] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 border border-emerald-500/20">
                  <Info className="text-emerald-500" size={32} />
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                  Submission Received!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                  Your detailed business information has been submitted for admin review.
                  <br /><br />
                  <span className="text-emerald-500 font-bold">What happens next?</span><br />
                  Our team will verify the details, and once approved, your public profile will be updated automatically.
                </p>

                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  Great, Thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Connection Modal */}
      <AnimatePresence>
        {activeConnectionModal && (
          <SocialConnectionModal
            platform={activeConnectionModal}
            onClose={() => setActiveConnectionModal(null)}
            onSuccess={() => {
              setActiveConnectionModal(null);
              refreshProfile();
            }}
          />
        )}
      </AnimatePresence>

      {/* Disconnect Confirmation Modal */}
      <AnimatePresence>
        {platformToDisconnect && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlatformToDisconnect(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-4xl p-8 shadow-2xl text-center overflow-hidden"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertTriangle size={32} />
              </div>

              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                Disconnect {platformToDisconnect}?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Are you sure you want to disconnect your <strong>{platformToDisconnect}</strong> account? This will remove all associated analytics and data from your profile.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setPlatformToDisconnect(null)}
                  disabled={isSaving}
                  className="flex-1 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDisconnect}
                  disabled={isSaving}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Disconnect'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
