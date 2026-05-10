import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Coins, 
  BarChart3, 
  History,
  Lock,
  Ban,
  Settings2,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  Zap,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { FaInstagram, FaTiktok } from 'react-icons/fa6';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/src/api/apiClient';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const { data: user, isLoading } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => api.get(`/admin/users/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const displayProfileData = user ? {
    ...(user.profileData || {}),
    ...(user.pendingProfileData || {})
  } : null;

  const updateStatus = useMutation({
    mutationFn: (newStatus: string) => api.put(`/admin/users/${id}/status`, { status: newStatus }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['adminUser', id] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      showToast(`User account status updated to ${vars}.`);
    },
    onError: () => {
      showToast('Failed to update status', 'error');
    }
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(newStatus);
  };

  const formatMetric = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleResetPassword = () => {
    showToast('Password reset instructions sent to user email.');
  };

  const handleEditPermissions = () => {
    showToast('Permission editor coming soon!');
  };


  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-6 mb-10">
          <Link to="/admin/users" className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center border border-[#EFEFEF] dark:border-white/10 hover:bg-gray-50 transition-all shadow-sm">
            <ArrowLeft size={20} className="text-[#6F767E]" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#1A1D1F] dark:text-white leading-none mb-1">User Profile</h1>
            <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">Viewing details for UID: {id || '8842-XJ92'}</p>
          </div>
        </div>

        {isLoading || !user ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-[#6F767E] dark:text-gray-400 font-bold">Loading user details...</p>
          </div>
        ) : (
          <>
            {/* Top Section: User Summary and Primary Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* User Info Card */}
          <div className="lg:col-span-8 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="relative shrink-0">
              <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-[#1A1A1A] shadow-lg flex items-center justify-center bg-gray-100">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.firstName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">{user.firstName?.[0] || user.username?.[0]}</span>
                )}
              </div>
              {(user.status === 'active' || user.role === 'admin' || user.role === 'super_admin') && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-[#111111] flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-3xl font-black">{user.firstName} {user.lastName}</h2>
                <div className="flex gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 rounded">{user.role.replace('_', ' ')}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                    (user.role === 'admin' || user.role === 'super_admin' || user.status === 'active') ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' :
                    user.status === 'suspended' ? 'bg-red-100 dark:bg-red-500/20 text-red-600' :
                    'bg-amber-100 dark:bg-amber-500/20 text-amber-600'
                  }`}>
                    {(user.role === 'admin' || user.role === 'super_admin') ? 'active' : user.status}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400 mb-8 leading-relaxed max-w-xl">
                {displayProfileData?.bio || 'No bio provided for this user.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1 block">Email Address</label>
                  <p className="text-xs font-bold truncate">{user.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1 block">Phone Number</label>
                  <p className="text-xs font-bold">{displayProfileData?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1 block">Location</label>
                  <p className="text-xs font-bold">{displayProfileData?.businessLocation || user.location || 'Remote'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Boxes */}
          {user.role !== 'admin' && user.role !== 'super_admin' && (
            <div className="lg:col-span-4 flex flex-col gap-6">
              <button 
                onClick={handleEditPermissions}
                className="flex-1 bg-[#14a800] hover:bg-[#108a00] text-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-lg shadow-green-100 dark:shadow-none transition-all group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Settings2 size={24} />
                </div>
                <span className="font-bold">Edit Permissions</span>
              </button>
              <div className="grid grid-cols-2 gap-6 flex-1">
                <button 
                  onClick={handleResetPassword}
                  className="bg-[#F0F0FA] dark:bg-white/5 hover:bg-[#E5E5F5] dark:hover:bg-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all p-4"
                >
                  <History size={20} className="text-[#14a800]" />
                  <span className="text-xs font-bold text-[#1A1D1F] dark:text-white">Reset PW</span>
                </button>

                {user.status === 'pending' ? (
                  <button 
                    onClick={() => handleStatusChange('active')}
                    disabled={updateStatus.isPending}
                    className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all p-4 border border-emerald-100 dark:border-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600">Approve</span>
                  </button>
                ) : user.status === 'suspended' || user.status === 'banned' ? (
                  <button 
                    onClick={() => handleStatusChange('active')}
                    disabled={updateStatus.isPending}
                    className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all p-4 border border-emerald-100 dark:border-emerald-500/20 disabled:opacity-50"
                  >
                    <ShieldCheck size={20} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600">Reinstate</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStatusChange('suspended')}
                    disabled={updateStatus.isPending}
                    className="bg-[#FFF0F0] dark:bg-red-500/10 hover:bg-[#FFE5E5] dark:hover:bg-red-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all p-4 disabled:opacity-50"
                  >
                    <Ban size={20} className="text-red-500" />
                    <span className="text-xs font-bold text-red-500">Suspend</span>
                  </button>
                )}
              </div>
              
              {user.status === 'pending' && (
                <button 
                  onClick={() => handleStatusChange('banned')}
                  disabled={updateStatus.isPending}
                  className="w-full py-4 bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500 rounded-2xl text-xs font-bold transition-all border border-red-100 dark:border-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle size={16} /> Reject Application
                </button>
              )}
            </div>
          )}
        </div>

        {/* Detailed Profile Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-12 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-extrabold text-xl">Full Profile Details</h3>
              <span className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                {user.role.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Common Fields */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Website / Portfolio</label>
                <p className="text-sm font-bold flex items-center gap-2">
                  <Globe size={14} className="text-indigo-500" />
                  {displayProfileData?.website || 'Not provided'}
                </p>
              </div>

              {user.role === 'business_owner' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Business Name</label>
                    <p className="text-sm font-bold">{displayProfileData?.businessName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Business Type</label>
                    <p className="text-sm font-bold">{displayProfileData?.businessType || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Industry</label>
                    <p className="text-sm font-bold">{displayProfileData?.industry || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Opening Hours</label>
                    <p className="text-sm font-bold">{displayProfileData?.openingHours || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Price Range</label>
                    <p className="text-sm font-bold">{displayProfileData?.priceRange || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Monthly Budget</label>
                    <p className="text-sm font-bold text-emerald-500">${displayProfileData?.monthlyBudget || '0'}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">Services Offered</label>
                    <p className="text-sm font-medium">{displayProfileData?.servicesOffered || 'None'}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">Target Audience / Promotion Goals</label>
                    <div className="flex flex-wrap gap-2">
                      {displayProfileData?.targetAudienceTags?.map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 dark:border-indigo-500/20">
                          {tag}
                        </span>
                      ))}
                      {displayProfileData?.promotionGoals?.map((tag: string, i: number) => (
                        <span key={`pg-${i}`} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Followers</label>
                    <p className="text-sm font-bold">{displayProfileData?.followers || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Avg Views</label>
                    <p className="text-sm font-bold">{displayProfileData?.avgViews || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Engagement %</label>
                    <p className="text-sm font-bold">{displayProfileData?.engagementRate || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Base Rate</label>
                    <p className="text-sm font-bold text-emerald-500">${displayProfileData?.baseRate || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Social Handles</label>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {displayProfileData?.youtubeHandle && <span className="text-red-500 mr-2">YT: {displayProfileData?.youtubeHandle}</span>}
                      {displayProfileData?.tiktokHandle && <span className="text-pink-500 mr-2">TT: {displayProfileData?.tiktokHandle}</span>}
                      {displayProfileData?.instagramHandle && <span className="text-purple-500 mr-2">IG: {displayProfileData?.instagramHandle}</span>}
                      {displayProfileData?.xHandle && <span className="text-blue-400 mr-2">X: {displayProfileData?.xHandle}</span>}
                      {displayProfileData?.facebookHandle && <span className="text-blue-600">FB: {displayProfileData?.facebookHandle}</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Payment & Availability</label>
                    <p className="text-sm font-bold">
                      {displayProfileData?.paymentPreference || 'N/A'} • {displayProfileData?.availability || 'N/A'}
                    </p>
                  </div>
                  <div className="lg:col-span-3">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">Niches / Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {displayProfileData?.niches?.map((niche: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-[#14a800] rounded-lg text-[10px] font-bold border border-green-100 dark:border-green-500/20">
                          {niche}
                        </span>
                      )) || <span className="text-xs text-gray-400">None</span>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Detailed Social Analytics - Only for Advertisers */}
            {user.role === 'advertiser' && (displayProfileData.tiktok || displayProfileData.instagram) && (
              <div className="mt-12 pt-12 border-t border-gray-100 dark:border-white/5 space-y-12">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#9A9FA5]">Social Performance Analytics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* TikTok */}
                  {displayProfileData.tiktok && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                            <FaTiktok size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">TikTok</p>
                            <p className="text-sm font-bold">@{displayProfileData.tiktok.username}</p>
                          </div>
                        </div>
                        <a href={displayProfileData.tiktok.profileLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Followers', value: formatMetric(displayProfileData.tiktok.followers) },
                          { label: 'Engagement', value: `${displayProfileData.tiktok.engagementRate}%` },
                          { label: 'Avg Views', value: formatMetric(displayProfileData.tiktok.avgViews) },
                          { label: 'Avg Likes', value: formatMetric(displayProfileData.tiktok.totalLikes) },
                        ].map((s, i) => (
                          <div key={i} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-lg font-black">{s.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Audience</span>
                            <span className="text-xs font-bold">{displayProfileData.tiktok.audienceTopCountry || 'Global'}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Core Age</span>
                            <span className="text-xs font-bold">{displayProfileData.tiktok.audienceAgeRange || '18-24'}</span>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* Instagram */}
                  {displayProfileData.instagram && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                            <FaInstagram size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-pink-400">Instagram</p>
                            <p className="text-sm font-bold">@{displayProfileData.instagram.username}</p>
                          </div>
                        </div>
                        <a href={displayProfileData.instagram.profileLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-50 dark:bg-pink-500/10 rounded-lg hover:bg-pink-100 transition-colors">
                          <ExternalLink size={14} className="text-pink-600" />
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Followers', value: formatMetric(displayProfileData.instagram.followers) },
                          { label: 'Engagement', value: `${displayProfileData.instagram.engagementRate}%` },
                          { label: 'Avg Views', value: formatMetric(displayProfileData.instagram.avgViews) },
                          { label: 'Avg Likes', value: formatMetric(displayProfileData.instagram.totalLikes) },
                        ].map((s, i) => (
                          <div key={i} className="p-4 bg-pink-50/30 dark:bg-pink-500/5 rounded-2xl border border-pink-100/50 dark:border-pink-500/10">
                            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-lg font-black text-pink-600">{s.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-pink-50/30 dark:bg-pink-500/5 rounded-3xl space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Top Audience</span>
                            <span className="text-xs font-bold">{displayProfileData.instagram.audienceTopCountry || 'Global'}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Core Age</span>
                            <span className="text-xs font-bold">{displayProfileData.instagram.audienceAgeRange || '18-24'}</span>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Documents Section */}
        {user.role === 'business_owner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-12 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-extrabold text-xl">Verification Documents</h3>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  user.isVerified ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
                }`}>
                  {user.isVerified ? 'KYC Verified' : 'Pending Verification'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Trade License */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Trade License Image</label>
                    {user.tradeLicenseUrl && (
                      <a 
                        href={user.tradeLicenseUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                      >
                        <Download size={12} /> Download
                      </a>
                    )}
                  </div>
                  <div className="aspect-video rounded-3xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 flex items-center justify-center group relative">
                    {user.tradeLicenseUrl ? (
                      <>
                        <img 
                          src={user.tradeLicenseUrl} 
                          alt="Trade License" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={user.tradeLicenseUrl} target="_blank" rel="noopener noreferrer" className="p-4 bg-white rounded-2xl text-black hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
                            <Eye size={24} />
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                          <AlertCircle size={32} />
                        </div>
                        <p className="text-xs font-bold text-gray-500">No trade license uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ID Verification */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">ID Verification Image</label>
                    {user.idVerificationUrl && (
                      <a 
                        href={user.idVerificationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                      >
                        <Download size={12} /> Download
                      </a>
                    )}
                  </div>
                  <div className="aspect-video rounded-3xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 flex items-center justify-center group relative">
                    {user.idVerificationUrl ? (
                      <>
                        <img 
                          src={user.idVerificationUrl} 
                          alt="ID Verification" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={user.idVerificationUrl} target="_blank" rel="noopener noreferrer" className="p-4 bg-white rounded-2xl text-black hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
                            <Eye size={24} />
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                          <AlertCircle size={32} />
                        </div>
                        <p className="text-xs font-bold text-gray-500">No ID document uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Wallet Card */}
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-lg">Wallet & Earnings</h3>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center text-[#14a800]">
                <Coins size={18} />
              </div>
            </div>
            
            <div className="mb-10 text-center bg-[#F8F8FD] dark:bg-white/5 p-6 rounded-3xl">
              <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Available Coins</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-black">{user.wallet?.availableCoins?.toLocaleString() || '0'}</span>
                <span className="text-sm font-bold text-[#14a800] uppercase">AACP</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#6F767E] dark:text-gray-400">Total Spent</span>
                <span className="text-sm font-bold">{user.stats?.totalSpent?.toLocaleString() || '0'} AACP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#6F767E] dark:text-gray-400">Active Requests</span>
                <span className="text-sm font-bold text-amber-600">{user.stats?.activeRequests || '0'} Pending</span>
              </div>
            </div>

            <button className="w-full py-4 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              View Ledger History
            </button>
          </div>

          {/* Activity Card */}
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-lg">Platform Activity</h3>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600">
                <BarChart3 size={18} />
              </div>
            </div>

            <div className="bg-[#F8F8FD] dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center text-[#14a800]">
                  <Zap size={14} fill="currentColor" />
                </div>
                <span className="text-xs font-bold">Campaign Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#14a800] w-[94%]" />
                </div>
                <span className="text-xs font-black">94%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-center">
                <span className="text-2xl font-black block mb-1">{user.stats?.activeAds || '0'}</span>
                <span className="text-[10px] font-bold text-[#9A9FA5] uppercase">Active Ads</span>
              </div>
              <div className="p-6 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-center">
                <span className="text-2xl font-black block mb-1">{user.stats?.collaborators || '0'}</span>
                <span className="text-[10px] font-bold text-[#9A9FA5] uppercase">Collaborators</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <CheckCircle2 size={16} fill="currentColor" className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">KYC Verification Complete</span>
            </div>
          </div>

          {/* Logs Card */}
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-lg">Recent Logs</h3>
              <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-[#9A9FA5]">
                <History size={18} />
              </div>
            </div>

            <div className="space-y-8 mb-8">
              {user.logs && user.logs.length > 0 ? (
                user.logs.map((log: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'} mt-1.5 shrink-0`} />
                    <div>
                      <p className="text-sm font-bold leading-tight mb-0.5">{log.message}</p>
                      <p className="text-[10px] font-medium text-[#9A9FA5]">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No recent activity.</p>
              )}
            </div>

            <button className="w-full py-2 text-[#14a800] font-bold text-xs uppercase tracking-widest hover:underline">
              Full Activity Audit
            </button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h3 className="font-extrabold text-xl mb-1">Transaction History</h3>
              <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">Visual ledger of all financial movements for this account.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-3 bg-[#F4F4F4] dark:bg-white/5 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-all">Export CSV</button>
              <button className="px-6 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all">Filter</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#F4F4F4] dark:border-white/5">
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Reference ID</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Type</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Amount</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Date</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Status</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F4] dark:divide-white/5">
                {user.transactions && user.transactions.length > 0 ? (
                  user.transactions.map((tx: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-[#F8F8FD] dark:hover:bg-white/5 transition-colors">
                      <td className="py-6 px-4 text-xs font-black">#{tx._id.slice(-8).toUpperCase()}</td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0`}>
                             <ChevronRight size={10} className={tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'} />
                          </div>
                          <span className="text-xs font-bold">{tx.type === 'credit' ? 'Deposit' : 'Withdrawal'}</span>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-xs font-black">{tx.type === 'credit' ? '+' : '-'} {tx.amount} AACP</td>
                      <td className="py-6 px-4 text-xs font-medium text-[#6F767E] dark:text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-6 px-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          tx.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' :
                          tx.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' :
                          'bg-red-100 dark:bg-red-500/20 text-red-600'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-right">
                        <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-[#9A9FA5] group-hover:text-[#14a800]">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm font-medium text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' 
                ? 'bg-[#14a800] text-white border-green-400' 
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
