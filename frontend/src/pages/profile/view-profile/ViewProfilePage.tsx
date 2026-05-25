import { useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/src/api/apiClient';
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Star,
  ShieldCheck,
  Award,
  TrendingUp,
  Sparkles,
  Briefcase,
  Edit,
  UserCheck,
  BarChart3,
  DollarSign,
  ExternalLink,
  Share2,
  Heart,
  Eye,
  Flame,
  CheckCircle2,
  Lock,
  ArrowRight,
  MessageSquare,
  Users
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import BusinessProfileInsights from '@/src/components/profile/BusinessProfileInsights';
import { formatBirr } from '@/src/features/business-onboarding/constants';

export default function ViewProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'terms' | 'insights'>('overview');
  const { userRole, onboardingStatus } = useUser();
  const { profile: myProfile } = useProfile();
  const { id: urlProfileId } = useParams();
  const profileId = urlProfileId;
  const api = useApiClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch target profile if viewing someone else's
  const { data: targetProfileData, isLoading: isFetchingProfile } = useQuery({
    queryKey: ['userProfile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const res = await api.get(`/users/${profileId}`);
      return res.data.user;
    },
    enabled: !!profileId,
  });

  // When viewing someone else's profile, the backend returns raw user data with
  // fields nested under profileData. We need to flatten it to match ProfileContext format.
  const normalizeRawProfile = (raw: any) => {
    if (!raw) return null;
    // If already flattened (from ProfileContext), return as-is
    if (!raw.profileData && raw.selectedStyles) return raw;

    const pd = raw.profileData || {};
    const ppd = raw.pendingProfileData || {};
    const pud = raw.pendingUpdates || {};

    // Compute follower/view/engagement stats from platform data
    const computeNum = (v: any) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') return parseInt(v.replace(/[^0-9]/g, ''), 10) || 0;
      return 0;
    };
    const ca = raw.connectedAccounts || {};
    const tMetrics = ca.tiktok?.metrics || pd.tiktok || {};
    const iMetrics = ca.instagram?.metrics || pd.instagram || {};
    const fMetrics = ca.facebook?.metrics || {};

    const followersTotal = computeNum(tMetrics.followers) + computeNum(iMetrics.followers) + computeNum(fMetrics.followers);
    const avgViewsTotal = computeNum(tMetrics.avgViews) + computeNum(iMetrics.avgViews);
    const computeER = (p: any) => {
      const stored = computeNum(p.engagementRate);
      if (stored > 0 && stored <= 100) return stored;
      const f = computeNum(p.followers);
      if (f <= 0) return 0;
      const likes = computeNum(p.totalLikes) || computeNum(p.avgLikes);
      const comments = computeNum(p.avgComments);
      const shares = computeNum(p.avgShares);
      const rawER = ((likes + comments + shares) / f) * 100;
      return Math.min(rawER, 100);
    };
    const erTik = computeER(tMetrics);
    const erIg = computeER(iMetrics);
    const erFb = computeER(fMetrics);
    const maxER = Math.max(erTik, erIg, erFb);

    return {
      firstName: raw.firstName || '',
      lastName: raw.lastName || '',
      email: raw.email || '',
      bio: raw.about || raw.bio || '',
      businessLocation: raw.location || '',
      avatarUrl: raw.profilePicture || '',
      coverImageUrl: raw.coverImage || '',
      coverImage: raw.coverImage || '',
      profilePicture: raw.profilePicture || '',
      _id: raw._id,
      clerkId: raw.clerkId,
      role: raw.role,
      ...pd,
      ...ppd,
      ...pud,
      tiktokHandle: ca.tiktok?.username || raw.tiktokHandle || pd.tiktokHandle,
      instagramHandle: ca.instagram?.username || raw.instagramHandle || pd.instagramHandle,
      facebookHandle: ca.facebook?.username || raw.facebookHandle || pd.facebookHandle,
      youtubeHandle: raw.youtubeHandle || pd.youtubeHandle,
      xHandle: raw.xHandle || pd.xHandle,
      followers: followersTotal,
      avgViews: avgViewsTotal,
      engagementRate: parseFloat(maxER.toFixed(2)),
      ...(pud.location ? { businessLocation: pud.location } : {}),
      ...(pud.profilePicture ? { avatarUrl: pud.profilePicture } : {}),
      ...(pud.coverImage ? { coverImageUrl: pud.coverImage, coverImage: pud.coverImage } : {}),
      connectedAccounts: ca,
      averageRating: raw.averageRating || 0,
      totalReviews: raw.totalReviews || 0,
    };
  };

  const profile = profileId ? normalizeRawProfile(targetProfileData) : myProfile;

  // Fetch target profile's reviews
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['userReviews', profile?._id],
    queryFn: async () => {
      if (!profile?._id) return [];
      const res = await api.get(`/reviews/user/${profile._id}`);
      return res.data?.data || [];
    },
    enabled: !!profile?._id,
  });

  const reviews = reviewsData || [];

  const ratingBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!reviews.length) return counts;
    reviews.forEach((r: any) => {
      const rating = Math.round(r.rating);
      if (rating >= 1 && rating <= 5) {
        counts[rating as 5 | 4 | 3 | 2 | 1]++;
      }
    });
    return counts;
  }, [reviews]);

  if (profileId && isFetchingProfile) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!profile) return null;

  const isViewerBusiness = userRole === 'business_owner';
  const Layout = isViewerBusiness ? BusinessLayout : AdvertiserLayout;

  const isTargetProfileBusiness = profile.role === 'business_owner';

  const benchmarkBarWidth = (engagementRate: number) => `${Math.min(engagementRate * 10, 100)}%`;
  const tiktokBenchmarkEngagementRate = 2.4;
  const instagramBenchmarkEngagementRate = 1.8;

  // When viewing someone else's profile, derive status from their data
  const targetStatus = profileId
    ? ((profile as any).status === 'active' || (profile as any).status === 'approved' ? 'approved' : (profile as any).status || 'incomplete')
    : onboardingStatus;

  const isPending = targetStatus === 'pending' || (profile as any).pendingProfileData;
  const statusLabel = targetStatus === 'approved' || targetStatus === 'active' ? 'Approved Profile' : targetStatus === 'pending' ? 'Pending Review' : 'Incomplete Profile';
  const statusColor = targetStatus === 'approved' || targetStatus === 'active' ? 'bg-primary-blue' : targetStatus === 'pending' ? 'bg-amber-500' : 'bg-gray-500';

  // Build profile display data from context
  const profileData = {
    name: profile.businessName || `${profile.firstName} ${profile.lastName}` || 'User Profile',
    type: isTargetProfileBusiness ? profile.industry || 'Business' : 'Premium Content Creator',
    bio: profile.bio || 'No bio provided yet.',
    established: profile.createdAt ? new Date(profile.createdAt).getFullYear().toString() : 'N/A',
    rating: profile.averageRating ? profile.averageRating.toFixed(1) : '0.0',
    reviews: profile.totalReviews || 0,
    location: profile.businessLocation || profile.location || (isTargetProfileBusiness ? 'Not Set' : (profile.geoTags?.[0] || 'Global')),
    website: profile.website || 'No website',
    email: profile.email,
    phone: profile.phone,
    coverImage: profile.coverImageUrl || profile.coverImage || (isTargetProfileBusiness
      ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop'),
    avatarImage: profile.avatarUrl || profile.profilePicture,
    badges: isTargetProfileBusiness
      ? (profile as any).promotionGoals?.length > 0 ? (profile as any).promotionGoals : ['Verified Business', 'Direct Advertiser']
      : profile.selectedStyles?.length > 0 ? profile.selectedStyles : ['Content Creator', 'Social Media'],

    // Extended Business Data
    businessDetails: {
      services: (profile as any).servicesOffered || 'Not set',
      voice: (profile as any).brandVoice || 'Not set',
      companySize: (profile as any).companySize || 'Not set',
      kpis: (profile as any).primaryKpis || [],
      goals: (profile as any).promotionGoals || [],
      audienceAge: (profile as any).targetAudienceAgeRanges || [],
      promoterTypes: (profile as any).preferredPromoterTypes || [],
      promoterCount: (profile as any).promotersNeededCount || 'Not set',
      avgOrder: (profile as any).avgOrderValueETB ? `${(profile as any).avgOrderValueETB} ETB` : 'Not set',
      maxPerPost: (profile as any).budget ? `${(profile as any).budget} ETB` : 'Not set',
      minEng: (profile as any).minEngagement ? `${(profile as any).minEngagement}%` : 'Not set',
    },

    stats: isTargetProfileBusiness
      ? [
        { label: 'Monthly Budget', value: profile.monthlyBudget ? `${profile.monthlyBudget.toLocaleString()} ETB` : 'Not set' },
        { label: 'Platforms', value: profile.selectedPlatforms?.length.toString() || '0' },
        { label: 'Company Size', value: (profile as any).companySize || 'Not set' },
      ]
      : [],
  };

  const getSocialStats = (p: any) => {
    const formatNumber = (num: number) => {
      if (!num) return '0';
      if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      return String(num);
    };

    const computeNum = (v: any) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const cleaned = v.toUpperCase().replace(/[^0-9.KMB]/g, '');
        let multiplier = 1;
        if (cleaned.endsWith('K')) multiplier = 1000;
        else if (cleaned.endsWith('M')) multiplier = 1000000;
        else if (cleaned.endsWith('B')) multiplier = 1000000000;
        const num = parseFloat(cleaned.replace(/[KMB]/g, ''));
        return isNaN(num) ? 0 : num * multiplier;
      }
      return 0;
    };

    const computeER = (metrics: any) => {
      const stored = computeNum(metrics.engagementRate);
      if (stored > 0 && stored <= 100) return stored;
      
      const v = computeNum(metrics.avgViews);
      const f = computeNum(metrics.followers);
      const denominator = v > 0 ? v : (f > 0 ? f : 1);
      
      const likes = computeNum(metrics.avgLikes) || computeNum(metrics.totalLikes);
      const comments = computeNum(metrics.avgComments);
      const shares = computeNum(metrics.avgShares);
      const rawER = ((likes + comments + shares) / denominator) * 100;
      return Math.min(rawER, 100);
    };

    const ca = p.connectedAccounts || {};

    const tMetrics = ca.tiktok?.metrics || ca.tiktok || {};
    const tFollowers = computeNum(tMetrics.followers);
    const tAvgViews = computeNum(tMetrics.avgViews);
    const tER = computeER(tMetrics);

    const iMetrics = ca.instagram?.metrics || ca.instagram || {};
    const iFollowers = computeNum(iMetrics.followers);
    const iAvgViews = computeNum(iMetrics.avgViews);
    const iER = computeER(iMetrics);

    return {
      tiktok: {
        followers: formatNumber(tFollowers),
        avgViews: formatNumber(tAvgViews),
        engagementRate: tER ? `${tER.toFixed(1)}%` : '0%'
      },
      instagram: {
        followers: formatNumber(iFollowers),
        avgViews: formatNumber(iAvgViews),
        engagementRate: iER ? `${iER.toFixed(1)}%` : '0%'
      }
    };
  };

  const socialStats = getSocialStats(profile);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const DataTag = ({ label }: { label: string }) => (
    <span className="px-3 py-1 bg-primary-blue/5 dark:bg-primary-blue/10 text-primary-blue dark:text-neutral-border border border-primary-blue/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
      {label}
    </span>
  );

  return (
    <Layout>
      <main className="p-4 sm:p-8 max-w-350 mx-auto w-full pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Profile Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl relative"
          >
            {/* Cover Image with Ambient Light Overlay */}
            <div className="h-56 md:h-80 w-full relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-t from-[#0c0c0c] via-black/30 to-transparent z-10" />
              <img
                src={profileData.coverImage}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-6 right-6 z-20 flex flex-wrap gap-2">
                <span className={cn(
                  "text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xl backdrop-blur-md bg-opacity-85 border border-white/10",
                  statusColor
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {statusLabel}
                </span>
                <span className="bg-white/10 dark:bg-black/40 backdrop-blur-md text-white border border-white/20 dark:border-white/5 text-xs font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xl">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {profileData.rating} ({profileData.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-10 md:p-12 relative">
              {/* Avatar overlapping cover boundary */}
              <div className="absolute -top-16 md:-top-24 left-6 sm:left-10 md:left-12 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-3xl border-4 md:border-8 border-white dark:border-[#0c0c0c] overflow-hidden bg-white dark:bg-[#111] z-20 shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src={profileData.avatarImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=10b981&color=fff`}
                  alt={profileData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Identity & Direct Call-to-Actions */}
              <div className="mt-14 sm:mt-16 md:mt-20 lg:mt-0 lg:ml-52 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                        {profileData.name}
                      </h1>
                      {(targetStatus === 'approved' || targetStatus === 'active') && (
                        <CheckCircle2 className="text-primary-blue fill-primary-blue/10 w-6 h-6 md:w-7 md:h-7" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
                      <p className="text-primary-blue dark:text-neutral-border flex items-center gap-1.5 uppercase tracking-wider text-xs">
                        {isTargetProfileBusiness ? <Building2 size={16} /> : <Briefcase size={16} />}
                        {profileData.type}
                      </p>
                      <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20 hidden md:block" />
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <MapPin size={16} className="text-gray-400" />
                        {profileData.location}
                      </div>
                    </div>
                  </div>

                  {/* Custom badges styles with animated micro-interactivity */}
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.badges.map((badge: string, i: number) => (
                      <span
                        key={i}
                        className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl text-[10px] font-extrabold border border-gray-100 dark:border-white/5 uppercase tracking-wider"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Panel Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-65">
                  {!profileId ? (
                    <button
                      onClick={() =>
                        navigate(isViewerBusiness ? '/profile/edit/business' : '/profile/edit/advertiser')
                      }
                      className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 border border-transparent dark:border-white/10"
                    >
                      <Edit size={15} />
                      Edit Profile Settings
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/messages?user=${profileId}`)}
                      className="w-full bg-primary-blue hover:bg-primary-blue text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-lg shadow-primary-blue/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={15} />
                      Send Private Proposal
                    </button>
                  )}
                  {profileData.website && profileData.website !== 'No website' && (
                    <a
                      href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2.5 text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                    >
                      <Globe size={15} className="text-primary-blue" />
                      View Website
                      <ExternalLink size={12} className="opacity-50" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sliding Pill Tab Switcher */}
            <div className="border-t border-gray-100 dark:border-white/5 px-6 sm:px-10 py-4 bg-gray-50/50 dark:bg-[#0e0e0e]/50 flex flex-wrap gap-2 items-center justify-start overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: UserCheck },
                { id: 'analytics', label: 'Social & Reach', icon: BarChart3 },
                { id: 'terms', label: 'Commercial Terms', icon: DollarSign },
                { id: 'insights', label: 'AI Optimization', icon: Sparkles }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 relative",
                      isActive
                        ? "text-white bg-primary-blue shadow-md shadow-primary-blue/20"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                    )}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                    {isActive && (
                      <motion.span
                        layoutId="activeProfileTab"
                        className="absolute inset-0 bg-primary-blue rounded-2xl -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Animated Tab Content Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >

              {/* TAB CONTENT: OVERVIEW */}
              {activeTab === 'overview' && (
                <>
                  {/* Left Main (8 cols) */}
                  <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-36 h-36 bg-primary-blue/5 rounded-full blur-2xl" />
                      <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Award size={14} className="text-primary-blue" />
                        {isTargetProfileBusiness ? 'Brand Story & Vision' : 'Creator Background'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-base sm:text-lg">
                        {profileData.bio}
                      </p>
                    </div>

                    {/* Target Audience / Demographic Stats */}
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl">
                      <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <Globe size={14} className="text-cyan-500" />
                        Target Audience & Reach
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Gender Distribution Gauge */}
                        <div className="space-y-6">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Gender Distribution</p>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-cyan-500 flex items-center gap-1">âœ¦ Male Audience</span>
                                <span className="text-gray-900 dark:text-white">64%</span>
                              </div>
                              <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '64%' }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-pink-500 flex items-center gap-1">âœ¦ Female Audience</span>
                                <span className="text-gray-900 dark:text-white">36%</span>
                              </div>
                              <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-pink-500 rounded-full" style={{ width: '36%' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Demographics Age range capsules */}
                        <div className="space-y-6">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Core Demographics</p>
                          <div className="space-y-4">
                            <div>
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">Age Ranges Focus</span>
                              <div className="flex flex-wrap gap-1.5">
                                {isTargetProfileBusiness ? (
                                  profileData.businessDetails.audienceAge.length > 0 ? (
                                    profileData.businessDetails.audienceAge.map((age: string) => (
                                      <span key={age} className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide">{age}</span>
                                    ))
                                  ) : (
                                    ['18-24', '25-34'].map((age: string) => (
                                      <span key={age} className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide">{age}</span>
                                    ))
                                  )
                                ) : (
                                  profile.targetAudience?.ageRange ? (
                                    <span className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide">{profile.targetAudience?.ageRange}</span>
                                  ) : (
                                    ['18-24', '25-34'].map((age: string) => (
                                      <span key={age} className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide">{age}</span>
                                    ))
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">Geographic Footprint</span>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="px-3 py-1 bg-primary-blue/5 dark:bg-primary-blue/10 text-primary-blue dark:text-neutral-border border border-primary-blue/20 dark:border-primary-blue/10 rounded-lg text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                                  <MapPin size={10} />
                                  Addis Ababa, ET
                                </span>
                                <span className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide">Regional (East Africa)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ratings & Reviews Section */}
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-8">
                      <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Star size={14} className="text-amber-500 fill-amber-500/20" />
                        Ratings & Feedbacks
                      </h3>

                      {isLoadingReviews ? (
                        <div className="py-8 flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* Rating Summary Card */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 sm:p-8 rounded-3xl">
                            {/* Score Block */}
                            <div className="md:col-span-4 text-center md:border-r border-gray-100 dark:border-white/5 md:pr-8 py-2">
                              <p className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                                {profileData.rating}
                              </p>
                              <div className="flex justify-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const ratingVal = parseFloat(profileData.rating);
                                  return (
                                    <Star
                                      key={star}
                                      size={18}
                                      className={cn(
                                        star <= ratingVal
                                          ? "text-amber-400 fill-amber-400"
                                          : star - 0.5 <= ratingVal
                                          ? "text-amber-400 fill-amber-400 opacity-50"
                                          : "text-gray-300 dark:text-gray-700"
                                      )}
                                    />
                                  );
                                })}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                                {profileData.reviews} verified {profileData.reviews === 1 ? 'review' : 'reviews'}
                              </p>
                            </div>

                            {/* Progress Bars Block */}
                            <div className="md:col-span-8 space-y-2 md:pl-4">
                              {[5, 4, 3, 2, 1].map((stars) => {
                                const count = ratingBreakdown[stars as 5|4|3|2|1] || 0;
                                const percent = reviews.length ? (count / reviews.length) * 100 : 0;
                                return (
                                  <div key={stars} className="flex items-center gap-3 text-xs">
                                    <span className="w-12 font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                                      {stars} <Star size={12} className="text-amber-400 fill-amber-400" />
                                    </span>
                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary-blue rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                    <span className="w-8 text-right font-black text-gray-700 dark:text-gray-300">
                                      {count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Feedbacks List */}
                          {reviews.length === 0 ? (
                            <div className="text-center py-10 space-y-4 border border-dashed border-gray-200 dark:border-white/5 rounded-3xl p-6 bg-gray-50/20 dark:bg-white/[0.01]">
                              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
                              <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">No feedbacks yet</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
                                  This {isTargetProfileBusiness ? 'business owner' : 'creator'} has not received any post-collaboration reviews yet.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {reviews.map((r: any) => {
                                const reviewer = r.reviewerId || {};
                                const reviewerName = reviewer.firstName
                                  ? `${reviewer.firstName} ${reviewer.lastName || ''}`.trim()
                                  : 'Collaborator';
                                const reviewerRole = reviewer.role === 'business_owner' ? 'Brand Owner' : 'Premium Creator';
                                const formattedDate = new Date(r.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                });
                                
                                return (
                                  <div
                                    key={r._id}
                                    className="p-6 rounded-3xl border border-gray-100 dark:border-white/5 bg-white dark:bg-black/20 hover:border-primary-blue/20 dark:hover:border-primary-blue/10 transition-all space-y-4"
                                  >
                                    {/* Reviewer Meta info */}
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                      <div className="flex items-center gap-3.5">
                                        <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                          {reviewer.profilePicture ? (
                                            <img
                                              src={reviewer.profilePicture}
                                              alt={reviewerName}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-blue/5 text-primary-blue text-xs font-black">
                                              {reviewerName[0]?.toUpperCase() || 'C'}
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-sm text-gray-950 dark:text-white leading-none">
                                              {reviewerName}
                                            </h4>
                                            {r.isVerified && (
                                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider scale-90">
                                                <CheckCircle2 size={10} className="fill-emerald-500/10 text-emerald-500" />
                                                Verified
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 block">
                                            {reviewerRole}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-1.5 text-right">
                                        <div className="flex gap-0.5">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              size={13}
                                              className={cn(
                                                star <= r.rating
                                                  ? "text-amber-400 fill-amber-400"
                                                  : "text-gray-250 dark:text-gray-700"
                                              )}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">
                                          {formattedDate}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Comment text */}
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">
                                      {r.comment}
                                    </p>

                                    {/* Tags: Collaboration type */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                      <span className="px-2.5 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 rounded-xl text-[9px] font-extrabold uppercase tracking-wide">
                                        {r.collaborationType || 'fixed-price'}
                                      </span>
                                      {r.trustScore && r.trustScore > 0.8 && (
                                        <span className="px-2.5 py-1 bg-primary-blue/5 dark:bg-primary-blue/10 text-primary-blue dark:text-neutral-border border border-primary-blue/20 dark:border-primary-blue/10 rounded-xl text-[9px] font-extrabold uppercase tracking-wide">
                                          Trust score: {(r.trustScore * 100).toFixed(0)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Sidebar (4 cols) */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* Brand Voice / Styles */}
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl">
                      <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" />
                        {isTargetProfileBusiness ? 'Identity & Strategy' : 'Core Niches'}
                      </h3>
                      {isTargetProfileBusiness ? (
                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Brand Voice</p>
                            <DataTag label={profileData.businessDetails.voice} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Offerings & Products</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                              {profileData.businessDetails.services}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Creative Topics</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.niche ? (
                              <DataTag label={profile.niche} />
                            ) : (
                              profileData.badges.map((badge: string, i: number) => (
                                <DataTag key={i} label={badge} />
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Contacts */}
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-6">
                      <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Mail size={14} className="text-cyan-500" />
                        Direct Communication
                      </h3>

                      <div className="space-y-3">
                        <a href={`mailto:${profileData.email}`} className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-primary-blue/30 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-black flex items-center justify-center text-gray-400 group-hover:text-primary-blue transition-colors shadow-sm">
                            <Mail size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Email</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate block">{profileData.email}</span>
                          </div>
                        </a>

                        <a href={`tel:${profileData.phone}`} className="flex items-center gap-3.5 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-primary-blue/30 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-black flex items-center justify-center text-gray-400 group-hover:text-primary-blue transition-colors shadow-sm">
                            <Phone size={16} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Phone</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">{profileData.phone}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB CONTENT: ANALYTICS & REACH */}
              {activeTab === 'analytics' && (
                <div className="lg:col-span-12 space-y-8">
                  {isTargetProfileBusiness ? (
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl text-center space-y-6">
                      <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto text-primary-blue">
                        <Building2 size={32} />
                      </div>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white">Corporate Brand Analytics</h4>
                      <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">
                        Detailed marketing campaign analytics, ROAS tracking, and past collaborations metrics are currently restricted to authorized active campaign promoters only.
                      </p>
                      <button onClick={() => navigate('/matches')} className="px-6 py-3 bg-primary-blue hover:bg-primary-blue text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                        Apply to promote this brand
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* TikTok Card */}
                      {profile.tiktokHandle ? (
                        <div className="bg-[#050505] text-white p-8 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl opacity-60" />
                          <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-xl">
                                ðŸŽµ
                              </div>
                              <div>
                                <h4 className="font-black text-lg">TikTok Reach</h4>
                                <p className="text-xs text-gray-400 font-bold">@{profile.tiktokHandle.replace('@', '')}</p>
                              </div>
                            </div>
                            <span className="px-3.5 py-1.5 bg-primary-blue/20 text-neutral-border border border-primary-blue/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-border animate-pulse" />
                              Synced Live
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-8 text-center bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><Users size={12} /> Followers</p>
                              <p className="text-3xl font-black text-white">{socialStats.tiktok.followers}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><Eye size={12} /> Avg Views</p>
                              <p className="text-3xl font-black text-white">{socialStats.tiktok.avgViews}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><Flame size={12} /> Engagement</p>
                              <p className="text-3xl font-black text-neutral-border">{socialStats.tiktok.engagementRate}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator Engagement vs Industry Standard</p>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-gray-400">@{profile.tiktokHandle.replace('@', '')}</span>
                                  <span className="text-neutral-border">{socialStats.tiktok.engagementRate}</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-neutral-border rounded-full" style={{ width: parseFloat(socialStats.tiktok.engagementRate) > 0 ? `${Math.min(parseFloat(socialStats.tiktok.engagementRate) * 10, 100)}%` : '40%' }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-gray-500">Standard Benchmarks (Ethiopian Market)</span>
                                  <span className="text-gray-400">{tiktokBenchmarkEngagementRate.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gray-500 rounded-full" style={{ width: benchmarkBarWidth(tiktokBenchmarkEngagementRate) }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#050505] p-8 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                          <Lock className="text-gray-600 w-12 h-12" />
                          <h4 className="text-white font-black uppercase tracking-wider text-sm">TikTok Account Unlinked</h4>
                          <p className="text-gray-400 text-xs font-semibold max-w-xs">Connecting TikTok live analytics grants access to certified followers and reach metrics.</p>
                        </div>
                      )}

                      {/* Instagram Card */}
                      {profile.instagramHandle ? (
                        <div className="bg-linear-to-br from-[#120610] to-[#040003] text-white p-8 sm:p-10 rounded-[2.5rem] border border-pink-500/10 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-44 h-44 bg-pink-500/5 rounded-full blur-3xl opacity-60" />
                          <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                                ðŸ“¸
                              </div>
                              <div>
                                <h4 className="font-black text-lg">Instagram Reach</h4>
                                <p className="text-xs text-gray-400 font-bold">@{profile.instagramHandle.replace('@', '')}</p>
                              </div>
                            </div>
                            <span className="px-3.5 py-1.5 bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                              Synced Live
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-8 text-center bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/5">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><Users size={12} /> Followers</p>
                              <p className="text-3xl font-black text-white">{socialStats.instagram.followers}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><Eye size={12} /> Avg Views</p>
                              <p className="text-3xl font-black text-white">{socialStats.instagram.avgViews}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1"><Flame size={12} /> Engagement</p>
                              <p className="text-3xl font-black text-pink-400">{socialStats.instagram.engagementRate}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator Engagement vs Industry Standard</p>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-gray-400">@{profile.instagramHandle.replace('@', '')}</span>
                                  <span className="text-pink-400">{socialStats.instagram.engagementRate}</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-pink-400 rounded-full" style={{ width: parseFloat(socialStats.instagram.engagementRate) > 0 ? `${Math.min(parseFloat(socialStats.instagram.engagementRate) * 10, 100)}%` : '40%' }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-gray-500">Standard Benchmarks (Ethiopian Market)</span>
                                  <span className="text-gray-400">{instagramBenchmarkEngagementRate.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-gray-500 rounded-full" style={{ width: benchmarkBarWidth(instagramBenchmarkEngagementRate) }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#050505] p-8 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                          <Lock className="text-gray-600 w-12 h-12" />
                          <h4 className="text-white font-black uppercase tracking-wider text-sm">Instagram Account Unlinked</h4>
                          <p className="text-gray-400 text-xs font-semibold max-w-xs">Connecting Instagram live analytics grants access to certified followers and reach metrics.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: COMMERCIAL TERMS */}
              {activeTab === 'terms' && (
                <div className="lg:col-span-12">
                  {isTargetProfileBusiness ? (
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-10">
                      <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Campaign & Budget Parameters</h3>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Brand Marketing Terms</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">Allocated Budget</span>
                          <span className="text-2xl font-black text-gray-900 dark:text-white block">{profileData.businessDetails.maxPerPost}</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">Minimum Engagement Req.</span>
                          <span className="text-2xl font-black text-primary-blue block">{profileData.businessDetails.minEng}</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">Average Order Value</span>
                          <span className="text-2xl font-black text-gray-900 dark:text-white block">{profileData.businessDetails.avgOrder}</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-2">Target Openings</span>
                          <span className="text-2xl font-black text-gray-900 dark:text-white block">{profileData.businessDetails.promoterCount}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Marketing Focus Goals</p>
                          <div className="flex flex-wrap gap-2">
                            {profileData.businessDetails.goals.length > 0 ? (
                              profileData.businessDetails.goals.map((g: string) => <DataTag key={g} label={g} />)
                            ) : (
                              ['Brand Awareness', 'Lead Generation'].map((g) => <DataTag key={g} label={g} />)
                            )}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Success KPI Targets</p>
                          <div className="flex flex-wrap gap-2">
                            {profileData.businessDetails.kpis.length > 0 ? (
                              profileData.businessDetails.kpis.map((k: string) => <span key={k} className="px-3 py-1.5 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider">{k}</span>)
                            ) : (
                              ['Conversions', 'Impression Count'].map((k) => <span key={k} className="px-3 py-1.5 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider">{k}</span>)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-8">
                      <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Creator Commercial Partnership</h3>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Financials & Deliverables</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Base Rate Card */}
                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-blue/5 rounded-full blur-xl" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block"><DollarSign size={14} className="inline mr-1" /> Base Rate (ETB)</span>
                          <span className="text-4xl font-black text-gray-900 dark:text-white block">
                            {profile.baseRate ? `${profile.baseRate.toLocaleString()} ETB` : 'Negotiable'}
                          </span>
                          <p className="text-xs font-semibold text-gray-400">Estimate per single dedicated platform integration. Rates can fluctuate based on customization.</p>
                        </div>

                        {/* Standard Package Deliverables */}
                        <div className="p-8 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block"><Award size={14} className="inline mr-1" /> Standard Deal Deliverables</span>
                          <ul className="space-y-2.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                            <li className="flex items-center gap-2 text-primary-blue">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-blue" />
                              1x Custom Video Integration (TikTok / Reel)
                            </li>
                            <li className="flex items-center gap-2 text-primary-blue">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-blue" />
                              2x Amplification Stories with Swipe-up Link
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              30 Days Paid Media Usage Rights
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Direct Portfolio Link Access
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: AI MATCH & OPTIMIZATION */}
              {activeTab === 'insights' && (
                <div className="lg:col-span-12 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Radial Affinity Gauge (5 cols) */}
                    <div className="lg:col-span-5 bg-[#070707] text-white p-8 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-primary-blue/10 via-transparent to-transparent opacity-60" />

                      <div className="space-y-2 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-border">Velocity Intelligence</span>
                        <h4 className="text-xl font-black leading-tight">AI Matching Score</h4>
                      </div>

                      {/* Giant Gauge Visual */}
                      <div className="py-10 flex flex-col items-center justify-center relative z-10">
                        <div className="w-40 h-40 rounded-full border-10 border-primary-blue/20 flex items-center justify-center relative">
                          <div className="absolute inset-0 rounded-full border-10 border-primary-blue border-t-transparent border-l-transparent animate-spin duration-3000" />
                          <span className="text-4xl font-black text-white">96%</span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold mt-4">Extraordinary Affinity Match</p>
                      </div>

                      <div className="p-4 bg-white/5 border border-white/5 rounded-2xl relative z-10 text-xs font-semibold text-gray-300">
                        This match score is computed using historic engagement patterns, brand safety evaluation, content niche overlap, and local audience metrics.
                      </div>
                    </div>

                    {/* AI Suggestions & Insights (7 cols) */}
                    <div className="lg:col-span-7 bg-white dark:bg-[#0c0c0c] p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-6">
                      <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" />
                        AI Profile Insights & ROAS Optimization
                      </h3>

                      <div className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <div className="p-4 bg-primary-blue/5 dark:bg-primary-blue/10 border border-primary-blue/10 rounded-2xl">
                          <p className="font-bold text-gray-900 dark:text-white mb-1">ðŸ”¥ Strengths</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Excellent audience capture rates on TikTok, highly responsive Ethiopian demographic, robust trade reputation.</p>
                        </div>
                        <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-2xl">
                          <p className="font-bold text-gray-900 dark:text-white mb-1">âš¡ Improvement Areas</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Relatively low average posting frequency during holiday cycles, missing connected YouTube analytics channel.</p>
                        </div>
                        <div className="p-4 bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/10 rounded-2xl">
                          <p className="font-bold text-gray-900 dark:text-white mb-1">ðŸŽ¯ ROAS Strategy Recommendation</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">We strongly recommend leveraging <span className="font-black text-primary-blue dark:text-neutral-border">UGC Video Ad Integrations</span> to gain a projected 1.6x yield bump over traditional banners.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>
    </Layout>
  );
}
