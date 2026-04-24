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
  Info
} from 'lucide-react';
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

  const profile = user.profileData || {};
  const isBusiness = user.role === 'business_owner';
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
            {user.firstName} {user.lastName} — <span className="opacity-60">Applied {new Date(user.createdAt).toLocaleDateString()}</span>
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
                      <span className="px-4 py-2 bg-green-50 dark:bg-green-500/10 text-[#14a800] rounded-xl text-xs font-bold ring-1 ring-green-100 dark:ring-green-500/20">{profile.industry || 'General'}</span>
                    ) : (
                      (profile.selectedStyles || ['Lifestyle']).map((style: string) => (
                        <span key={style} className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-[#6F767E] dark:text-gray-400 rounded-xl text-xs font-bold border border-gray-100 dark:border-white/10">{style}</span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2 block">Location</label>
                  <div className="flex items-center gap-2 font-bold text-[#1A1D1F] dark:text-white">
                    <MapPin size={16} className="text-[#14a800]" />
                    <span className="text-sm">{profile.businessLocation || profile.geoTags?.[0] || user.location || 'Remote'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2 block">Bio</label>
                  <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">
                    {profile.bio || 'No bio provided.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#14a800] p-8 rounded-[2.5rem] text-white shadow-xl">
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

              {/* ID Preview */}
              <div className="relative group cursor-pointer mb-8">
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border border-[#EFEFEF] dark:border-white/5 bg-[#F4F4F4] dark:bg-white/10 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1554224155-1696413575b8?auto=format&fit=crop&q=80&w=800" 
                    alt="ID Card Mockup" 
                    className="w-full h-full object-cover grayscale opacity-50 contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Government ID</p>
                    <div className="text-sm font-bold flex items-center gap-2">
                      Passport_AnyaS.pdf
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <ShieldCheck size={10} className="text-black fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              

              {/* Portfolio & Socials */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-4">Portfolio & Socials</p>
                
                {profile.website && (
                  <button className="w-full p-4 bg-[#F4F4F4]/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all rounded-2xl flex items-center justify-between group border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 text-[#14a800] flex items-center justify-center">
                        <Globe size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold leading-none mb-1">Website / Portfolio</p>
                        <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">{profile.website}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#9A9FA5] group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {(profile.youtubeHandle || profile.tiktokHandle) && (
                  <button className="w-full p-4 bg-[#F4F4F4]/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all rounded-2xl flex items-center justify-between group border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-[#2563EB] flex items-center justify-center">
                        <Link size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold leading-none mb-1">Social Handles</p>
                        <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">
                          {profile.youtubeHandle && `YT: ${profile.youtubeHandle} `}
                          {profile.tiktokHandle && `TT: ${profile.tiktokHandle}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#9A9FA5] group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Approval Controls */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-28">
            <div className="bg-[#F1FFF0] dark:bg-white/5 p-8 rounded-[3rem] text-center border border-white dark:border-white/5 shadow-inner">
              <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldCheck size={24} className="text-[#14a800]" />
              </div>
              <h3 className="font-black text-xl mb-2">Approval<br/>Controls</h3>
              <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium mb-8 leading-relaxed">
                Select an action for this profile application.
              </p>

              <div className="space-y-4">
                <button 
                  onClick={() => updateStatus.mutate('active')}
                  disabled={updateStatus.isPending || user.status === 'active'}
                  className="w-full h-16 bg-[#14a800] hover:bg-[#108a00] text-white rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-green-100 dark:shadow-none transition-all group disabled:opacity-50"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/10">
                    <ShieldCheck size={14} className="fill-current" />
                  </div>
                  {user.status === 'active' ? 'Approved' : 'Approve Profile'}
                </button>

                <button className="w-full h-16 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-[#1A1D1F] dark:text-white rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-3 border border-[#EFEFEF] dark:border-white/10 transition-all">
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

              <div className="mt-12 p-6 bg-white/30 dark:bg-black/20 rounded-[2rem] text-left flex gap-4">
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
