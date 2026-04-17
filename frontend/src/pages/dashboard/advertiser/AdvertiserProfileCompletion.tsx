import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  DollarSign, 
  Users, 
  BarChart3, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';

// Custom Brand Icons (since lucide-react@1.7.0 might miss them)
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.39-2.81-.12-1.07.32-1.95 1.17-2.27 2.23-.23.93-.05 1.97.49 2.75.51.78 1.41 1.3 2.33 1.35.84.03 1.69-.26 2.34-.81.67-.61.99-1.53.93-2.44-.02-3.15-.02-6.3.01-9.45z"/>
  </svg>
);

export default function AdvertiserProfileCompletion() {
  const navigate = useNavigate();
  const { setOnboardingStatus } = useUser();
  const { profile, updateProfile } = useProfile();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    youtubeConnected: false,
    tiktokConnected: false,
    followers: '',
    avgViews: '',
    engagementRate: '',
    portfolioUrl: '',
    baseRate: '',
    bio: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Update global context
      setOnboardingStatus('pending');
      updateProfile({
        ...profile,
        bio: formData.bio,
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard/advertiser');
      }, 2000);
    }, 1500);
  };

  return (
    <AdvertiserLayout>
      <main className="p-4 sm:p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Complete <span className="text-[#14a800]">Your Profile</span></h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-2xl">Connect your platforms and set your rates to start receiving offers from brands. High-quality profiles get 4x more matches.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Platform Connection */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#14a800]/10 rounded-lg flex items-center justify-center text-[#14a800]">
                  <Plus size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Platform Connection</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, youtubeConnected: !p.youtubeConnected }))}
                  className={cn(
                    "flex items-center justify-center gap-4 p-5 rounded-2xl border-2 transition-all",
                    formData.youtubeConnected 
                      ? "border-[#14a800] bg-[#14a800]/5 text-[#14a800]" 
                      : "border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 text-gray-500 hover:border-[#14a800]/30 hover:bg-gray-50"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", formData.youtubeConnected ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400")}>
                    <YouTubeIcon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">Connect YouTube</span>
                  {formData.youtubeConnected && <CheckCircle2 size={16} className="ml-auto" />}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, tiktokConnected: !p.tiktokConnected }))}
                  className={cn(
                    "flex items-center justify-center gap-4 p-5 rounded-2xl border-2 transition-all",
                    formData.tiktokConnected 
                      ? "border-[#14a800] bg-[#14a800]/5 text-[#14a800]" 
                      : "border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 text-gray-500 hover:border-[#14a800]/30 hover:bg-gray-50"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", formData.tiktokConnected ? "bg-black text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400")}>
                    <TikTokIcon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">Connect TikTok</span>
                  {formData.tiktokConnected && <CheckCircle2 size={16} className="ml-auto" />}
                </button>
              </div>
            </section>

            {/* Audience Metrics */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#14a800]/10 rounded-lg flex items-center justify-center text-[#14a800]">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Audience Metrics</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Followers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      name="followers"
                      value={formData.followers}
                      onChange={handleInputChange}
                      placeholder="e.g. 50,000"
                      className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#14a800]/20 focus:border-[#14a800] outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Avg. Views</label>
                  <div className="relative">
                    <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      name="avgViews"
                      value={formData.avgViews}
                      onChange={handleInputChange}
                      placeholder="e.g. 12k"
                      className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#14a800]/20 focus:border-[#14a800] outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Engagement Rate</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      name="engagementRate"
                      value={formData.engagementRate}
                      onChange={handleInputChange}
                      placeholder="e.g. 4.5%"
                      className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#14a800]/20 focus:border-[#14a800] outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Work & Pricing */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#14a800]/10 rounded-lg flex items-center justify-center text-[#14a800]">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Work & Pricing</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Portfolio / Social URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="url" 
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/@channel"
                      className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#14a800]/20 focus:border-[#14a800] outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Base Rate (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number" 
                      name="baseRate"
                      value={formData.baseRate}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#14a800]/20 focus:border-[#14a800] outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell brands about your content style and audience..."
                    rows={4}
                    className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-[#14a800]/20 focus:border-[#14a800] outline-none transition-all dark:text-white resize-none shadow-sm"
                    required
                  ></textarea>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting || showSuccess}
              className="w-full p-6 bg-[#14a800] text-white rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl shadow-[#14a800]/20 hover:bg-[#108a00] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : showSuccess ? (
                <><CheckCircle2 size={24} /> Application Submitted</>
              ) : (
                <><ShieldCheck size={24} /> Submit for Admin Approval</>
              )}
            </button>
          </div>

          {/* Right Column: Live Profile Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Live Profile Preview</h3>
                <div className="px-2 py-0.5 rounded bg-[#14a800]/10 text-[#14a800] text-[10px] font-bold">REAL-TIME</div>
              </div>

              {/* Preview Card */}
              <div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden group">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-[#14a800] to-[#108a00] relative">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)]"></div>
                </div>
                
                <div className="px-8 pb-8 -mt-10 relative">
                  {/* Profile Info */}
                  <div className="flex justify-between items-end mb-6">
                    <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-[#111] bg-gray-100 dark:bg-white/5 overflow-hidden shadow-xl">
                      <img 
                        src={profile.avatarUrl || "https://i.pravatar.cc/150?u=techvision"} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      {formData.youtubeConnected && (
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                          <YouTubeIcon className="w-4 h-4" />
                        </div>
                      )}
                      {formData.tiktokConnected && (
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center border border-gray-200 dark:border-white/10">
                          <TikTokIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{profile.firstName || 'Alex'} {profile.lastName || 'Rivera'}</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{profile.industry || 'Tech & Lifestyle Creator'}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Followers</p>
                      <p className="text-sm font-black text-[#14a800]">{formData.followers || '0'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Views</p>
                      <p className="text-sm font-black text-[#14a800]">{formData.avgViews || '0'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Rate</p>
                      <p className="text-sm font-black text-[#14a800]">${formData.baseRate || '0'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-4">
                      {formData.bio || 'Creating high-quality content for a modern audience. Expert in cinematography and storytelling that drives high engagement.'}
                    </p>
                  </div>

                  <div className="mt-8">
                    <div className="w-full py-4 bg-gray-900 dark:bg-white/10 text-white dark:text-gray-300 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-center opacity-50">
                      In Review
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100 dark:border-blue-500/10 flex gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-900 dark:text-blue-300 font-medium leading-relaxed">
                    Your profile will be visible to brands once an administrator reviews and approves your application. This usually takes <span className="font-bold underline italic">24-48 hours</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        <footer className="mt-20 py-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© 2024 AACP Advertiser Portal. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-[#14a800] uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-[#14a800] uppercase tracking-widest transition-colors">Terms of Service</a>
            <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-[#14a800] uppercase tracking-widest transition-colors">Help Center</a>
          </div>
        </footer>
      </main>
    </AdvertiserLayout>
  );
}
