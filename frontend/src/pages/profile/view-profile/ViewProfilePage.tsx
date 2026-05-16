import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
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
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import BusinessProfileInsights from '@/src/components/profile/BusinessProfileInsights';
import { formatBirr } from '@/src/features/business-onboarding/constants';

export default function ViewProfilePage() {
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
    const t = pd.tiktok || {};
    const i = pd.instagram || {};
    const followersTotal = computeNum(t.followers) + computeNum(i.followers);
    const avgViewsTotal = computeNum(t.avgViews) + computeNum(i.avgViews);
    const computeER = (p: any) => {
      const stored = computeNum(p.engagementRate);
      if (stored > 0 && stored <= 100) return stored;
      const f = computeNum(p.followers);
      if (f <= 0) return 0;
      const likes = computeNum(p.totalLikes);
      const comments = computeNum(p.avgComments);
      const shares = computeNum(p.avgShares);
      const rawER = ((likes + comments + shares) / f) * 100;
      return Math.min(rawER, 100);
    };
    const erTik = computeER(t);
    const erIg = computeER(i);
    const maxER = Math.max(erTik, erIg);

    return {
      firstName: raw.firstName || '',
      lastName: raw.lastName || '',
      email: raw.email || '',
      bio: raw.bio || '',
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
      followers: followersTotal,
      avgViews: avgViewsTotal,
      engagementRate: parseFloat(maxER.toFixed(2)),
      // Ensure location syncs
      ...(pud.location ? { businessLocation: pud.location } : {}),
      ...(pud.profilePicture ? { avatarUrl: pud.profilePicture } : {}),
      ...(pud.coverImage ? { coverImageUrl: pud.coverImage, coverImage: pud.coverImage } : {}),
    };
  };

  const profile = profileId ? normalizeRawProfile(targetProfileData) : myProfile;

  if (profileId && isFetchingProfile) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  const isViewerBusiness = userRole === 'business_owner';
  const Layout = isViewerBusiness ? BusinessLayout : AdvertiserLayout;

  const isTargetProfileBusiness = profile.role === 'business_owner';

  // When viewing someone else's profile, derive status from their data
  const targetStatus = profileId 
    ? ((profile as any).status === 'active' || (profile as any).status === 'approved' ? 'approved' : (profile as any).status || 'incomplete')
    : onboardingStatus;

  const isPending = targetStatus === 'pending' || (profile as any).pendingProfileData;
  const statusLabel = targetStatus === 'approved' || targetStatus === 'active' ? 'Approved Profile' : targetStatus === 'pending' ? 'Pending Review' : 'Incomplete Profile';
  const statusColor = targetStatus === 'approved' || targetStatus === 'active' ? 'bg-emerald-500' : targetStatus === 'pending' ? 'bg-amber-500' : 'bg-gray-500';

  // Build profile display data from context
  const profileData = {
    name: profile.businessName || `${profile.firstName} ${profile.lastName}` || 'User Profile',
    type: isTargetProfileBusiness ? profile.industry || 'Business' : 'Premium Content Creator',
    bio: profile.bio || 'No bio provided yet.',
    established: '2024',
    rating: '5.0',
    reviews: isTargetProfileBusiness ? 0 : 0,
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
      services: (profile as any).servicesOffered || 'General Services',
      voice: (profile as any).brandVoice || 'Professional',
      companySize: (profile as any).companySize || 'Private',
      kpis: (profile as any).primaryKpis || [],
      goals: (profile as any).promotionGoals || [],
      audienceAge: (profile as any).targetAudienceAgeRanges || [],
      promoterTypes: (profile as any).preferredPromoterTypes || [],
      promoterCount: (profile as any).promotersNeededCount || 'As needed',
      avgOrder: (profile as any).avgOrderValueETB ? `${(profile as any).avgOrderValueETB} ETB` : 'Not set',
      maxPerPost: (profile as any).budget ? `${(profile as any).budget} ETB` : 'Not set',
      minEng: (profile as any).minEngagement ? `${(profile as any).minEngagement}%` : 'Not set',
    },

    stats: isTargetProfileBusiness
      ? [
        { label: 'Monthly Budget', value: profile.monthlyBudget ? `${profile.monthlyBudget.toLocaleString()} ETB` : 'Flexible' },
        { label: 'Platforms', value: profile.selectedPlatforms?.length.toString() || '0' },
        { label: 'Company Size', value: (profile as any).companySize || 'Private' },
      ]
      : [
        { label: 'Followers', value: profile.followers || '0' },
        { label: 'Avg Views', value: profile.avgViews || '0' },
        { label: 'Engagement', value: (() => {
          const er = profile.engagementRate;
          if (!er) return '0%';
          if (typeof er === 'number') return `${Math.min(er, 100).toFixed(1)}%`;
          const parsed = parseFloat(String(er));
          return isNaN(parsed) ? String(er) : `${Math.min(parsed, 100).toFixed(1)}%`;
        })() },
      ],
  };

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
    <span className="px-3 py-1 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
      {label}
    </span>
  );

  return (
    <Layout>
      <main className="p-4 sm:p-8 max-w-[1400px] mx-auto w-full pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Profile Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#111] rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none"
          >
            {/* Cover Image */}
            <div className="h-48 md:h-72 w-full relative">
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                <span className={cn(
                  "text-black text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xl",
                  statusColor
                )}>
                  <ShieldCheck size={14} />
                  {statusLabel}
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xl">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {profileData.rating} ({profileData.reviews})
                </span>
              </div>
            </div>

            <div className="p-8 md:p-12 relative">
              {/* Avatar */}
              <div className="absolute -top-16 md:-top-24 left-8 md:left-12 w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-8 border-white dark:border-[#111] overflow-hidden bg-white z-20 shadow-2xl">
                <img
                  src={profileData.avatarImage || `https://ui-avatars.com/api/?name=${profileData.name}&background=10b981&color=fff`}
                  alt={profileData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-16 md:mt-20 lg:mt-0 lg:ml-56 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                    {profileData.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <p className="text-emerald-500 font-bold text-base md:text-lg flex items-center gap-2">
                      {isTargetProfileBusiness ? <Building2 size={20} /> : <Briefcase size={20} />}
                      {profileData.type}
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/10 hidden md:block" />
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <MapPin size={16} />
                      {profileData.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.badges.map((badge: string, i: number) => (
                      <span
                        key={i}
                        className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-full text-xs font-bold border border-gray-200 dark:border-white/10 uppercase tracking-wider"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[240px]">
                  {!profileId && (
                    <button
                      onClick={() =>
                        navigate(isViewerBusiness ? '/profile/edit/business' : '/profile/edit/advertiser')
                      }
                      className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl mb-1 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  )}
                  <a
                    href={`http://${profileData.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all"
                  >
                    <Globe size={16} className="text-cyan-500" />
                    {profileData.website}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (8 Columns) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* About & Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Award size={14} className="text-emerald-500" />
                    {isTargetProfileBusiness ? 'Brand Description' : 'About Creator'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {profileData.bio}
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    {isTargetProfileBusiness ? 'Products & Services' : 'Content Niches & Styles'}
                  </h3>
                  {isTargetProfileBusiness ? (
                    <>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                        {profileData.businessDetails.services}
                      </p>
                      <div className="mt-6 flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Voice:</span>
                        <DataTag label={profileData.businessDetails.voice} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.badges.length > 0 ? (
                        profileData.badges.map((badge: string, i: number) => (
                          <DataTag key={i} label={badge} />
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 font-medium">No specific niches listed</span>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Stats Highlights */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {profileData.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] text-center shadow-sm hover:border-emerald-500/30 transition-all group"
                  >
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 group-hover:text-emerald-500 transition-colors">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                ))}
              </motion.div>

              {/* Marketing & Goals OR Professional Portfolio */}
              {isTargetProfileBusiness ? (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Campaign & Marketing Strategy</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Marketing Goals</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.businessDetails.goals.map((goal: string) => <DataTag key={goal} label={goal} />)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Success Metrics (KPIs)</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.businessDetails.kpis.map((kpi: string) => <DataTag key={kpi} label={kpi} />)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-gray-50 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Max/Post</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{profileData.businessDetails.maxPerPost}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Min. Eng.</p>
                      <p className="text-sm font-bold text-emerald-500">{profileData.businessDetails.minEng}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. Order</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{profileData.businessDetails.avgOrder}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Openings</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{profileData.businessDetails.promoterCount}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Professional Portfolio</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Base Rate (ETB)</h4>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">
                        {profile.baseRate ? `${profile.baseRate} ETB` : 'Negotiable'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Portfolio Link</h4>
                      {profileData.website && profileData.website !== 'No website' ? (
                         <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-500/20 transition-colors">
                           View Work <Globe size={16} />
                         </a>
                      ) : (
                         <span className="text-sm font-medium text-gray-500">Not provided</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar (4 Columns) */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
              
              {/* Target Audience */}
              {isTargetProfileBusiness && (
                <div className="bg-gray-900 dark:bg-white p-10 rounded-[3rem] text-white dark:text-black shadow-xl">
                  <h3 className="text-xs font-black text-white/50 dark:text-black/50 uppercase tracking-[0.2em] mb-6">Target Audience</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60">Demographics</p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.businessDetails.audienceAge.map((age: string) => (
                          <span key={age} className="px-3 py-1 bg-white/10 dark:bg-black/5 border border-white/20 dark:border-black/10 rounded-full text-[10px] font-bold">{age}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60">Preferred Creators</p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.businessDetails.promoterTypes.map((type: string) => (
                          <span key={type} className="px-3 py-1 bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-bold text-emerald-400 dark:text-emerald-600">{type}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white dark:bg-[#111] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Contact & Network</h3>

                <div className="space-y-4">
                  <a
                    href={`mailto:${profileData.email}`}
                    className="flex items-center gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors shadow-sm border border-gray-100 dark:border-white/5">
                      <Mail size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {profileData.email}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`tel:${profileData.phone}`}
                    className="flex items-center gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors shadow-sm border border-gray-100 dark:border-white/5">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{profileData.phone}</p>
                    </div>
                  </a>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 dark:border-white/5">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Social Ecosystem</p>
                   <div className="flex gap-3">
                      {isTargetProfileBusiness ? (
                        profile.selectedPlatforms?.map((p: string) => (
                          <div key={p} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-colors border border-gray-100 dark:border-white/5">
                            {p[0]}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {profile.youtubeHandle && (
                            <a href={`https://youtube.com/${profile.youtubeHandle}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors">
                              YT
                            </a>
                          )}
                          {profile.tiktokHandle && (
                            <a href={`https://tiktok.com/@${profile.tiktokHandle.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-900/10 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl text-xs font-bold hover:bg-gray-900/20 dark:hover:bg-white/20 transition-colors">
                              TikTok
                            </a>
                          )}
                          {profile.instagramHandle && (
                            <a href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-600 rounded-xl text-xs font-bold hover:bg-pink-500/20 transition-colors">
                              IG
                            </a>
                          )}
                          {profile.xHandle && (
                            <a href={`https://x.com/${profile.xHandle.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors">
                              X
                            </a>
                          )}
                          {!profile.youtubeHandle && !profile.tiktokHandle && !profile.instagramHandle && !profile.xHandle && (
                            <span className="text-sm text-gray-500 font-medium">No linked socials</span>
                          )}
                        </div>
                      )}
                   </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-10 rounded-[3rem] relative overflow-hidden text-white shadow-2xl shadow-emerald-500/30">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-black/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">AI Insights</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 leading-tight">Optimization Required</h3>
                  <p className="text-sm font-medium text-white/80 mb-8 leading-relaxed">
                    Based on your profile, we recommend connecting with creators who focus on <span className="text-black font-bold">UGC Video Content</span> to maximize your ROAS.
                  </p>
                  <button onClick={() => navigate('/matches')} className="w-full bg-white text-black rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl active:scale-[0.98]">
                    Explore Matches
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl" />
              </div>

            </motion.div>
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}
