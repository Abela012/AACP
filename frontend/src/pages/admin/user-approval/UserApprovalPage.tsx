import { motion } from 'framer-motion';
import {
  Fingerprint,
  Mail,
  MapPin,
  Maximize2,
  Download,
  Globe,
  Link,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Ban,
  Info,
  BarChart3,
  Music2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { FaInstagram, FaTiktok } from 'react-icons/fa6';
import { cn } from '@/src/shared/utils/cn';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/src/api/apiClient';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';

export default function UserApprovalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApiClient();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => api.get(`/admin/users/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => api.put(`/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUser', id] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      navigate('/admin/users');
    }
  });

  if (isLoading || !user) {
    return (
      <AdminLayout>
        <div className="max-w-[1400px] mx-auto pb-12 flex justify-center py-20">
          <p className="text-[#6F767E] dark:text-gray-400 font-bold">Loading User Details...</p>
        </div>
      </AdminLayout>
    );
  }

  const displayUser = user ? {
    ...user,
    ...(user.pendingUpdates || {})
  } : user;

  const displayProfileData = user ? {
    ...(user.profileData || {}),
    ...(user.pendingProfileData || {})
  } : {};
  
  const hasPendingChanges = !!user?.pendingProfileData || !!user?.pendingUpdates;
  const isBusiness = user?.role === 'business_owner';

  const formatMetric = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  // Validate platform analytics for suspicious values
  const validatePlatformAnalytics = (platform: any) => {
    if (!platform) return { warnings: [] as string[], isValid: true };
    const warnings: string[] = [];
    const likes = platform.totalLikes || 0;
    const views = platform.avgViews || 0;
    const er = platform.engagementRate || 0;

    if (likes > 0 && views > 0 && likes > views) {
      warnings.push(`Likes (${formatMetric(likes)}) exceed Views (${formatMetric(views)})`);
    }
    if (er > 20) {
      warnings.push(`Engagement rate (${typeof er === 'number' ? er.toFixed(1) : er}%) is unusually high`);
    }
    if (er > 100) {
      warnings.push(`Engagement rate exceeds 100% — data is invalid`);
    }
    return { warnings, isValid: warnings.length === 0 };
  };

  const formatER = (er: any): string => {
    if (typeof er === 'number') return Math.min(er, 100).toFixed(1);
    return String(er || '0');
  };

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Breadcrumbs & Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded">Pending Review</span>
            <span className="text-gray-300 dark:text-white/10">/</span>
            <span className="text-xs font-bold text-[#6F767E] dark:text-gray-400">Advertiser Applications</span>
          </div>
          <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">Review {isBusiness ? 'Business' : 'Advertiser'} Profile</h1>
          <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
            {displayUser.firstName} {displayUser.lastName} — <span className="opacity-60">Applied {new Date(displayUser.createdAt).toLocaleDateString()}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Score */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-extrabold text-lg">Profile Details</h3>
                <Fingerprint size={20} className="text-[#9A9FA5] opacity-20" />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2 block">Email Address</label>
                  <div className="p-4 bg-[#F4F4F4]/50 dark:bg-white/5 rounded-2xl border border-[#EFEFEF] dark:border-white/5 font-bold text-sm">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2 block">{isBusiness ? 'Industry' : 'Primary Niche'}</label>
                  <div className="flex flex-wrap gap-2">
                    {isBusiness ? (
                      <span className="px-4 py-2 bg-neutral-border/15 dark:bg-primary-blue/10 text-primary-blue rounded-xl text-xs font-bold ring-1 ring-neutral-border/25 dark:ring-primary-blue/20">{displayProfileData.industry || 'General'}</span>
                    ) : (
                      (displayProfileData.selectedStyles || ['Lifestyle']).map((style: string) => (
                        <span key={style} className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-[#6F767E] dark:text-gray-400 rounded-xl text-xs font-bold border border-gray-100 dark:border-white/10">{style}</span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2 block">Location</label>
                  <div className="flex items-center gap-2 font-bold text-[#1A1D1F] dark:text-white">
                    <MapPin size={16} className="text-primary-blue" />
                    <span className="text-sm">{displayProfileData.businessLocation || displayProfileData.geoTags?.[0] || displayUser.location || 'Remote'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2 block">Bio / Pitch</label>
                  <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">
                    {displayProfileData.bio || displayUser.bio || 'No bio provided.'}
                  </p>
                </div>

                {hasPendingChanges && (
                  <div className="pt-4 mt-4 border-t border-dashed border-amber-200 dark:border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Awaiting Approval</span>
                    </div>
                    <p className="text-[10px] text-amber-600/70 font-medium leading-relaxed italic">
                      The details shown include newly submitted updates currently pending your review.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary-blue p-8 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="font-bold mb-8">Application Score</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-black">94</span>
                <span className="text-lg font-bold opacity-60">/100</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">AI Matching Probability: High</p>
            </div>
          </div>

          {/* Middle Column: Documents */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-extrabold text-lg">Verification Documents</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-[#9A9FA5]">
                    <Maximize2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-[#9A9FA5]">
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* ID or Trade License Preview */}
              <div className="relative group cursor-pointer mb-8">
                <div className="aspect-4/3 rounded-4xl overflow-hidden border border-[#EFEFEF] dark:border-white/5 bg-[#F4F4F4] dark:bg-white/10 relative">
                  <img
                    src={user.tradeLicenseUrl || "https://images.unsplash.com/photo-1554224155-1696413575b8?auto=format&fit=crop&q=80&w=800"}
                    alt="Verification Document"
                    className="w-full h-full object-cover grayscale opacity-50 contrast-125 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 text-white pointer-events-none">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{isBusiness ? 'Trade License' : 'Government ID'}</p>
                    <div className="text-sm font-bold flex items-center gap-2">
                      {user.tradeLicenseUrl ? 'License_File.view' : 'Document_Pending.pdf'}
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <ShieldCheck size={10} className="text-black fill-current" />
                      </div>
                    </div>
                  </div>
                  {user.tradeLicenseUrl && (
                    <a
                      href={user.tradeLicenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="text-white" size={32} />
                    </a>
                  )}
                </div>
              </div>


              {/* Portfolio & Socials */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-4">Portfolio & Socials</p>

                {displayProfileData.website && (
                  <a 
                    href={displayProfileData.website.startsWith('http') ? displayProfileData.website : `https://${displayProfileData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-4 bg-[#F4F4F4]/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all rounded-2xl flex items-center justify-between group border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-border/25 dark:bg-primary-blue/20 text-primary-blue flex items-center justify-center">
                        <Globe size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold leading-none mb-1">Website / Portfolio</p>
                        <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">{displayProfileData.website}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#9A9FA5] group-hover:translate-x-1 transition-transform" />
                  </a>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {displayProfileData.tiktok?.username && (
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-transparent">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">TikTok</p>
                      <p className="text-xs font-bold truncate">@{displayProfileData.tiktok.username}</p>
                    </div>
                  )}
                  {displayProfileData.instagram?.username && (
                    <div className="p-4 bg-pink-50/50 dark:bg-pink-500/5 rounded-2xl border border-transparent">
                      <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-1">Instagram</p>
                      <p className="text-xs font-bold truncate">@{displayProfileData.instagram.username}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics Review Section - Only for Advertisers */}
            {!isBusiness && (displayProfileData.tiktok || displayProfileData.instagram) && (
              <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm space-y-8">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary-blue" />
                  Analytics Review
                </h3>

                {/* TikTok Detailed Stats */}
                {displayProfileData.tiktok && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                          <FaTiktok size={16} />
                        </div>
                        <span className="text-sm font-black tracking-tight">TikTok Insights</span>
                      </div>
                      <a href={displayProfileData.tiktok.profileLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">View Profile</a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Followers', value: formatMetric(displayProfileData.tiktok.followers) },
                        { label: 'Avg Likes', value: formatMetric(displayProfileData.tiktok.totalLikes), warn: displayProfileData.tiktok.totalLikes > displayProfileData.tiktok.avgViews && displayProfileData.tiktok.avgViews > 0 },
                        { label: 'Avg Views', value: formatMetric(displayProfileData.tiktok.avgViews) },
                        { label: 'Engagement', value: `${formatER(displayProfileData.tiktok.engagementRate)}%`, highlight: true, warn: displayProfileData.tiktok.engagementRate > 20 },
                      ].map((stat, i) => (
                        <div key={i} className={cn(
                          'p-4 rounded-2xl border',
                          (stat as any).warn
                            ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/10'
                            : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'
                        )}>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className={cn(
                            'text-sm font-black',
                            (stat as any).warn ? 'text-amber-600' : stat.highlight ? 'text-primary-blue' : ''
                          )}>{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {(() => {
                      const { warnings } = validatePlatformAnalytics(displayProfileData.tiktok);
                      return warnings.length > 0 ? (
                        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl space-y-1 mt-4">
                          {warnings.map((w, i) => (
                            <p key={i} className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertCircle size={12} className="shrink-0" /> {w}
                            </p>
                          ))}
                        </div>
                      ) : null;
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Demographics</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-500 uppercase tracking-wider">Top Country</span>
                            <span>{displayProfileData.tiktok.audienceTopCountry || 'Global'}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-500 uppercase tracking-wider">Gender</span>
                            <span>{displayProfileData.tiktok.audienceGender || 'Mixed'}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-500 uppercase tracking-wider">Age Range</span>
                            <span>{displayProfileData.tiktok.audienceAgeRange || '18-24'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Content Style</p>
                        <div className="flex flex-wrap gap-2">
                          {(displayProfileData.tiktok.contentStyle || []).map((style: string) => (
                            <span key={style} className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100 dark:border-white/5">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider if both exist */}
                {displayProfileData.tiktok && displayProfileData.instagram && (
                  <div className="border-t border-gray-100 dark:border-white/5" />
                )}

                {/* Instagram Detailed Stats */}
                {displayProfileData.instagram && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white">
                          <FaInstagram size={16} />
                        </div>
                        <span className="text-sm font-black tracking-tight">Instagram Insights</span>
                      </div>
                      <a href={displayProfileData.instagram.profileLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">View Profile</a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Followers', value: formatMetric(displayProfileData.instagram.followers) },
                        { label: 'Avg Likes', value: formatMetric(displayProfileData.instagram.totalLikes), warn: displayProfileData.instagram.totalLikes > displayProfileData.instagram.avgViews && displayProfileData.instagram.avgViews > 0 },
                        { label: 'Avg Views', value: formatMetric(displayProfileData.instagram.avgViews) },
                        { label: 'Engagement', value: `${formatER(displayProfileData.instagram.engagementRate)}%`, highlight: true, warn: displayProfileData.instagram.engagementRate > 20 },
                      ].map((stat, i) => (
                        <div key={i} className={cn(
                          'p-4 rounded-2xl border',
                          (stat as any).warn
                            ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/10'
                            : 'bg-pink-50/30 dark:bg-pink-500/5 border-pink-100/50 dark:border-pink-500/10'
                        )}>
                          <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-1">{stat.label}</p>
                          <p className={cn(
                            'text-sm font-black',
                            (stat as any).warn ? 'text-amber-600' : stat.highlight ? 'text-pink-600' : ''
                          )}>{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {(() => {
                      const { warnings } = validatePlatformAnalytics(displayProfileData.instagram);
                      return warnings.length > 0 ? (
                        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl space-y-1 mt-4">
                          {warnings.map((w, i) => (
                            <p key={i} className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertCircle size={12} className="shrink-0" /> {w}
                            </p>
                          ))}
                        </div>
                      ) : null;
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Demographics</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-500 uppercase tracking-wider">Top Country</span>
                            <span>{displayProfileData.instagram.audienceTopCountry || 'Global'}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-500 uppercase tracking-wider">Gender</span>
                            <span>{displayProfileData.instagram.audienceGender || 'Mixed'}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-500 uppercase tracking-wider">Age Range</span>
                            <span>{displayProfileData.instagram.audienceAgeRange || '18-24'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Content Style</p>
                        <div className="flex flex-wrap gap-2">
                          {(displayProfileData.instagram.contentStyle || []).map((style: string) => (
                            <span key={style} className="px-3 py-1 bg-pink-50/50 dark:bg-pink-500/10 text-pink-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-pink-100 dark:border-pink-500/20">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Business Review Section - Only for Business Owners */}
            {isBusiness && (
              <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm space-y-8">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Building2 size={20} className="text-primary-blue" />
                  Business Review
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Business Name</label>
                    <p className="text-sm font-black">{displayProfileData.businessName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Monthly Budget</label>
                    <p className="text-sm font-black text-primary-blue">${displayProfileData.monthlyBudget?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Business Type</label>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{displayProfileData.businessType || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Industry</label>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{displayProfileData.industry || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Promotion Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {(displayProfileData.promotionGoals || []).map((goal: string) => (
                      <span key={goal} className="px-3 py-1 bg-neutral-border/15 dark:bg-primary-blue/10 text-primary-blue rounded-lg text-[10px] font-bold border border-neutral-border/25 dark:border-primary-blue/20">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Target Audience</p>
                  <div className="flex flex-wrap gap-2">
                    {(displayProfileData.targetAudienceTags || []).map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100 dark:border-blue-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Approval Controls */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-28">
            <div className="bg-neutral-border/20 dark:bg-white/5 p-8 rounded-[3rem] text-center border border-white dark:border-white/5 shadow-inner">
              <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldCheck size={24} className="text-primary-blue" />
              </div>
              <h3 className="font-black text-xl mb-2">Approval<br />Controls</h3>
              <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium mb-8 leading-relaxed">
                Select an action for this profile application.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => updateStatus.mutate('approved')}
                  disabled={updateStatus.isPending || ((user.status === 'approved' || user.status === 'active') && !hasPendingChanges)}
                  className="w-full h-16 bg-primary-blue hover:bg-primary-blue text-white rounded-1.5rem font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-neutral-border/25 dark:shadow-none transition-all group disabled:opacity-50"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/10">
                    <ShieldCheck size={14} className="fill-current" />
                  </div>
                  {(user.status === 'approved' || user.status === 'active')
                    ? (hasPendingChanges ? 'Approve Updates' : 'Already Approved') 
                    : 'Approve Profile'}
                </button>

                <button className="w-full h-16 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-[#1A1D1F] dark:text-white rounded-3xl font-bold text-sm flex items-center justify-center gap-3 border border-[#EFEFEF] dark:border-white/10 transition-all">
                  <RotateCcw size={18} className="text-[#6F767E]" />
                  Request Changes
                </button>

                <button
                  onClick={() => updateStatus.mutate('suspended')}
                  disabled={updateStatus.isPending || user.status === 'suspended'}
                  className="w-full h-16 flex items-center justify-center gap-3 text-red-500 font-bold text-sm hover:underline transition-all disabled:opacity-50"
                >
                  <Ban size={18} />
                  Reject Profile
                </button>
              </div>

              <div className="mt-12 p-6 bg-white/30 dark:bg-black/20 rounded-4xl text-left flex gap-4">
                <Info size={16} className="text-[#9A9FA5] shrink-0 mt-1" />
                <p className="text-[10px] text-[#6F767E] dark:text-gray-400 font-bold uppercase leading-relaxed tracking-tight">
                  Approval will grant the advertiser access to all campaign tools and platform features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
