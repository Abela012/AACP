import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  ArrowRight,
  Sparkles,
  X,
  Zap,
  MapPin,
  Clock,
  CheckCircle2,
  MessageSquare,
  Users,
  ShieldCheck,
  ExternalLink,
  Target,
  Loader2,
  Heart,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useRecommendations } from '@/src/hooks/useRecommendations';
import { useQueryClient } from '@tanstack/react-query';
import { usePredictiveAnalysis } from '@/src/hooks/useMarketingAnalysis';
import PredictiveAnalysisDashboard from '@/src/shared/components/analysis/PredictiveAnalysisDashboard';
import { useSavedCreators, useToggleSaveCreator } from '@/src/hooks/useSavedCreators';

const TABS = ['Recommended Creators', 'Recently Joined', 'Creator Feed', 'Bookmarked Creators'];

export default function MatchesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('Recommended Creators');

  const { data: recoData, isLoading } = useRecommendations();
  const recommendations = (recoData as any)?.recommendations || [];

  const formatMatchScore = (value: unknown): number => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue) ? Math.round(numericValue) : 0;
  };

  const getAvatarInitials = (name: string | undefined): string => {
    if (!name) return 'A';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'A';
  };

  const { data: bookmarkedCreators = [], isLoading: isLoadingBookmarks } = useSavedCreators();
  const toggleBookmark = useToggleSaveCreator();

  // Predictive Analysis Hook (must be top-level)
  const { data: predictionData, isLoading: isLoadingPrediction } = usePredictiveAnalysis(
    selectedCreator?.targetId || null
  );

  const isCreatorBookmarked = (creatorId: string) => {
    if (!creatorId || !bookmarkedCreators) return false;
    return bookmarkedCreators.some((c: any) => {
      const id = typeof c === 'string' ? c : (c._id || c.targetId || c.id);
      return id?.toString() === creatorId.toString();
    });
  };

  const handleToggleBookmark = (e: React.MouseEvent, creatorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark.mutate(creatorId);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const filteredCreators = recommendations.filter((c: any) => {
    const matchesNiche = selectedNiche === 'All Niches' ||
      (c.category && c.category.toLowerCase().includes(selectedNiche.toLowerCase()));

    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower ||
      (c.name && c.name.toLowerCase().includes(searchLower)) ||
      (c.location && c.location.toLowerCase().includes(searchLower));

    return matchesNiche && matchesSearch;
  });

  const displayCreators = (() => {
    if (activeTab === 'Bookmarked Creators') return bookmarkedCreators;
    if (activeTab === 'Recently Joined') {
      return [...filteredCreators].sort((a, b) => new Date(b.meta?.createdAt || 0).getTime() - new Date(a.meta?.createdAt || 0).getTime());
    }
    if (activeTab === 'Creator Feed') {
      // Just a shuffle or alternative sort for 'Feed'
      return [...filteredCreators].reverse();
    }
    return filteredCreators;
  })();

  return (
    <BusinessLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <AnimatePresence>
          {selectedCreator && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedCreator(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-[#0d0d0d] w-full max-w-6xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 z-10 flex flex-col max-h-[90vh]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCreator(null)}
                  className="absolute top-6 right-6 bg-black/40 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md text-white p-2.5 rounded-full transition-all z-30 shadow-lg"
                >
                  <X size={20} />
                </button>

                {/* Main Grid Content */}
                <div className="p-6 md:p-10 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8 scrollbar-thin">

                  {/* Left Column: Creator Profile Showcase (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Immersive Image Display */}
                    <div className="w-full h-64 rounded-3xl overflow-hidden relative shadow-md group">
                      <img
                        src={selectedCreator.meta?.profilePicture || `https://ui-avatars.com/api/?name=${selectedCreator.name}&background=10b981&color=fff`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-neutral-border text-xs font-bold bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <ShieldCheck size={14} className="fill-current" />
                        <span>Verified Creator Partner</span>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-white/3 p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Niche</span>
                        <span className="text-xs font-black text-primary-blue dark:text-neutral-border truncate block">{selectedCreator.category || 'Lifestyle'}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/3 p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Reach</span>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 block truncate">{typeof (selectedCreator.meta?.followers || selectedCreator.profileData?.followers) === 'number' ? (selectedCreator.meta?.followers || selectedCreator.profileData?.followers).toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/3 p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Rating</span>
                        <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          {selectedCreator.meta?.averageRating || '0.0'}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/3 p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Location</span>
                        <span className="text-xs font-black text-gray-700 dark:text-gray-300 truncate block">{selectedCreator.location || 'Remote'}</span>
                      </div>
                    </div>

                    {/* Biography block */}
                    <div className="bg-gray-50/50 dark:bg-white/2 p-5 rounded-3xl border border-gray-100/50 dark:border-white/5 space-y-2 shadow-xs">
                      <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">About Creator</h3>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">
                        {selectedCreator.meta?.bio || "A passionate content creator focused on delivering high-quality visual stories and engaging community experiences."}
                      </p>
                    </div>

                    {/* Active Channels */}
                    <div className="bg-gray-50/50 dark:bg-white/2 p-5 rounded-3xl border border-gray-100/50 dark:border-white/5 space-y-3 shadow-xs">
                      <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Platforms</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCreator.meta?.platforms?.map((p: string) => (
                          <span key={p} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 px-3 py-1.5 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 shadow-xs">{p}</span>
                        )) || <span className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 px-3 py-1.5 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 shadow-xs">Instagram</span>}
                      </div>
                    </div>

                    {/* Quick Profile Actions */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                      <button
                        onClick={() => navigate('/messages', { state: { creator: selectedCreator } })}
                        className="w-full py-4 bg-primary-blue hover:bg-neutral-border text-black rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary-blue/20 flex items-center justify-center gap-2"
                      >
                        Invite to Campaign
                        <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/users/${selectedCreator.targetId}`)}
                        className="w-full py-3.5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary-blue hover:bg-neutral-border/15 dark:hover:bg-primary-blue/10 transition-all shadow-xs"
                      >
                        <ExternalLink size={14} /> View Full Profile
                      </button>
                    </div>
                  </div>

                  {/* Right Column: AI Insights & ROI Projections (8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-blue/10 text-primary-blue rounded-xl flex items-center justify-center shadow-inner">
                          <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                            Gemini AI Market Analysis
                          </h4>
                          <p className="text-[10px] text-primary-blue font-bold">Real-time Strategy & Profit Projections</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Match Strength</span>
                        <p className="text-[10px] text-emerald-600 font-bold">{formatMatchScore(selectedCreator.score)}% Match</p>
                      </div>
                    </div>

                    {/* Loaded dashboard container */}
                    {isLoadingPrediction ? (
                      <div className="py-32 flex flex-col items-center justify-center gap-4 bg-gray-50/50 dark:bg-white/2 rounded-4xl border border-gray-100 dark:border-white/5">
                        <Loader2 size={40} className="animate-spin text-primary-blue" />
                        <div className="text-center">
                          <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest animate-pulse">Running Calculations...</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 px-4 max-w-sm mx-auto leading-relaxed">
                            Gemini is evaluating platform statistics, ROI conversion funnels, and target audience synergies.
                          </p>
                        </div>
                      </div>
                    ) : predictionData ? (
                      <div className="bg-white dark:bg-white/2 rounded-4xl border border-gray-100 dark:border-white/5 p-2 shadow-xs">
                        <PredictiveAnalysisDashboard data={predictionData} />
                      </div>
                    ) : (
                      <div className="py-24 text-center bg-gray-50/50 dark:bg-white/2 rounded-4xl border border-gray-100 dark:border-white/5">
                        <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Analysis Unavailable</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                          Please ensure that the creator's social profiles are connected and populated with verified metrics.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Discover Creators</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Our AI has identified the best creators for your brand's unique niche.</p>
          </div>
        </div>

        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700/50 mb-6">
          <div className="flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 font-semibold whitespace-nowrap transition-colors border-b-2",
                  activeTab === tab
                    ? 'text-gray-900 dark:text-white border-gray-900 dark:border-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border-transparent'
                )}
              >
                {tab === 'Bookmarked Creators' ? `${tab} (${bookmarkedCreators.length})` : tab}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-blue text-primary-blue dark:text-primary-blue text-sm font-medium hover:bg-primary-blue/10 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none mb-8 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, location or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm focus:border-primary-blue outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="px-6 py-3 rounded-2xl border border-gray-100 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-400 outline-none bg-white/50 dark:bg-white/5 backdrop-blur-sm cursor-pointer"
            >
              <option>All Niches</option>
              <option>Technology</option>
              <option>Fashion</option>
              <option>Fitness</option>
              <option>Food</option>
              <option>Travel</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-24 text-center">
              <Loader2 size={48} className="animate-spin text-primary-blue mx-auto mb-4" />
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Finding best matches...</p>
            </div>
          ) : displayCreators.length > 0 ? (
            displayCreators.map((c: any) => (
              <motion.div
                key={c.targetId || c._id}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedCreator(c)}
                className="bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all overflow-hidden group cursor-pointer"
              >
                <div className="h-48 relative">
                  {c.meta?.profilePicture || c.profilePicture ? (
                    <img
                      src={c.meta?.profilePicture || c.profilePicture}
                      alt={c.name || c.firstName}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-violet-500 via-indigo-500 to-emerald-500 flex items-center justify-center text-white text-4xl font-black tracking-widest">
                      {getAvatarInitials(c.name || c.firstName)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 bg-primary-blue text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                    <Sparkles size={10} />
                    {formatMatchScore(c.score)}% Match
                  </div>
                  <button
                    onClick={(e) => handleToggleBookmark(e, c.targetId || c._id)}
                    className={cn(
                      "absolute bottom-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-lg z-20",
                      isCreatorBookmarked(c.targetId || c._id)
                        ? "bg-red-500 text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    <Heart size={18} className={isCreatorBookmarked(c.targetId || c._id) ? "fill-current" : ""} />
                  </button>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 line-clamp-1">{c.name || `${c.firstName} ${c.lastName}`}</h3>
                      <div className="flex gap-1 overflow-hidden">
                        {(c.meta?.niches || c.profileData?.niches || [c.category]).slice(0, 2).map((n: string, idx: number) => (
                          <span key={`${n || 'niche'}-${idx}`} className="text-[9px] text-primary-blue dark:text-primary-blue font-black uppercase tracking-widest bg-neutral-border/15 dark:bg-primary-blue/10 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {c.meta?.averageRating > 0 ? c.meta.averageRating.toFixed(1) : c.averageRating > 0 ? c.averageRating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-border/15 dark:bg-primary-blue/10 rounded-lg flex items-center justify-center text-primary-blue dark:text-primary-blue">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reach</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{typeof (c.meta?.followers || c.profileData?.followers) === 'number' ? (c.meta?.followers || c.profileData?.followers).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-500">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Engagement</p>
                        <p className={cn("text-sm font-black", (c.meta?.engagementRate || 0) > 20 ? "text-amber-600" : "text-gray-900 dark:text-white")}>{typeof (c.meta?.engagementRate || c.profileData?.engagementRate) === 'number' ? Math.min((c.meta?.engagementRate || c.profileData?.engagementRate), 100).toFixed(1) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/messages', { state: { creator: c } }); }}
                      className="flex-1 py-4 bg-primary-blue text-black rounded-2xl font-black text-sm hover:bg-neutral-border transition-all shadow-lg shadow-primary-blue/20 flex items-center justify-center gap-2"
                    >
                      Invite Now
                      <ArrowRight size={18} />
                    </button>
                    <button
                      onClick={(e) => handleToggleBookmark(e, c.targetId || c._id)}
                      className="w-14 h-14 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-4xl flex items-center justify-center mx-auto mb-6">
                <Search className="text-gray-300 dark:text-gray-600 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No creators found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </main>
    </BusinessLayout>
  );
}
