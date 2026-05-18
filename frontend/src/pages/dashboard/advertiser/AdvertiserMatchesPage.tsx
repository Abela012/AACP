import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  ThumbsDown,
  Heart,
  MapPin,
  CheckCircle2,
  Loader2,
  Briefcase,
  Sparkles,
  Clock,
  Globe,
  Coins,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Building2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useRecommendations } from '@/src/hooks/useRecommendations';
import { useSavedOpportunities, useToggleSaveOpportunity } from '@/src/hooks/useSavedOpportunities';
import { useMyApplications } from '@/src/hooks/useApplications';
import { useWalletBalance } from '@/src/hooks/useWallet';
import { toast } from 'react-hot-toast';

const TABS = ['Recommended Campaigns', 'Recently Posted', 'Campaign Feed', 'Bookmarked Campaigns'];

function formatTimeAgo(dateString: string | undefined) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function AdvertiserMatchesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Recommended Campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState('All Budgets');
  const [sortBy, setSortBy] = useState('Best Match Score');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<string[]>([]);
  const [dismissedJobs, setDismissedJobs] = useState<string[]>([]);
  
  const { data: recoData, isLoading: isLoadingRecos } = useRecommendations();
  const { data: savedJobs = [], isLoading: isLoadingSaved } = useSavedOpportunities();
  const { data: walletData } = useWalletBalance();
  const toggleSave = useToggleSaveOpportunity();

  const { user: clerkUser } = useClerkUser();
  const myId = clerkUser?.id ?? '';
  const { data: appsData } = useMyApplications(myId);
  const applications = Array.isArray(appsData) ? appsData : (appsData as any)?.applications ?? [];

  const hasApplied = (opportunityId: string) => {
    if (!applications || !opportunityId) return false;
    return applications.some((app: any) => {
      const oppId = typeof app.opportunity === 'object' ? app.opportunity?._id : app.opportunity;
      return oppId?.toString() === opportunityId.toString() && app.status !== 'withdrawn';
    });
  };

  const isLoading = activeTab === 'Bookmarked Campaigns' ? isLoadingSaved : isLoadingRecos;

  const isJobSaved = (jobId: string) => {
    if (!jobId || !savedJobs) return false;
    return savedJobs.some((j: any) => {
      const id = typeof j === 'string' ? j : (j._id || j.id);
      return id?.toString() === jobId.toString();
    });
  };

  const handleToggleSave = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasSaved = isJobSaved(jobId);
    toggleSave.mutate(jobId, {
      onSuccess: () => {
        if (wasSaved) {
          toast.success('Campaign removed from bookmarks', {
            icon: '🗑️',
            style: { borderRadius: '1rem', background: '#333', color: '#fff' }
          });
        } else {
          toast.success('Campaign bookmarked successfully', {
            icon: '💖',
            style: { borderRadius: '1rem', background: '#333', color: '#fff' }
          });
        }
      }
    });
  };

  const handleDismissJob = (jobId: string) => {
    setDismissedJobs(prev => [...prev, jobId]);
    toast.success('Campaign hidden from matching engine', {
      icon: '🙈',
      style: { borderRadius: '1rem', background: '#333', color: '#fff' }
    });
  };

  const toggleExpandJob = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (expandedJobs.includes(jobId)) {
      setExpandedJobs(prev => prev.filter(id => id !== jobId));
    } else {
      setExpandedJobs(prev => [...prev, jobId]);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Recommended Campaigns') {
      setSortBy('Best Match Score');
    } else if (tab === 'Recently Posted') {
      setSortBy('Newest Posted');
    } else if (tab === 'Campaign Feed') {
      setSortBy('Highest Budget');
    }
  };
  
  const opportunities = (recoData?.recommendations || []).map((r: any) => ({
    _id: r.targetId,
    title: r.name,
    category: r.category,
    location: r.location,
    score: r.score,
    ...r.meta,
    owner: r.meta?.businessOwner ? {
      ...r.meta.businessOwner,
      firstName: r.meta.businessOwner.name?.split(' ')[0] || r.meta.businessOwner.username || 'Business',
      profilePicture: r.meta.businessOwner.profilePicture,
      averageRating: r.meta.businessOwner.averageRating || 0,
      totalReviews: r.meta.businessOwner.totalReviews || 0,
    } : undefined,
    brand: r.meta?.businessOwner?.name || 'Business Partner',
    campaign: r.name,
    budget: r.meta?.budget,
    createdAt: r.meta?.createdAt,
    description: r.meta?.description || 'No campaign description provided by the brand.',
    requirements: r.meta?.requirements || [],
    deliverables: r.meta?.deliverables || [],
    platforms: r.meta?.platforms || [r.category].filter(Boolean),
    applicants: r.meta?.applicants || [],
    paymentType: r.meta?.paymentType || 'Fixed-price',
    experienceLevel: r.meta?.experienceLevel || 'Expert'
  }));

  const bookmarkedOpportunities = (savedJobs || []).map((opp: any) => {
    const ownerObj = typeof opp.owner === 'object' ? opp.owner : null;
    const brandName = ownerObj ? `${ownerObj.firstName || ''} ${ownerObj.lastName || ''}`.trim() : 'Business Partner';
    
    return {
      _id: opp._id,
      title: opp.title,
      category: opp.category,
      location: opp.requirements?.location || opp.location,
      score: undefined, 
      owner: ownerObj ? {
        ...ownerObj,
        firstName: ownerObj.firstName || 'Business'
      } : undefined,
      brand: brandName || 'Business Partner',
      campaign: opp.title,
      budget: opp.budget,
      createdAt: opp.createdAt,
      description: opp.description || 'No campaign description provided by the brand.',
      requirements: opp.requirements || {},
      deliverables: opp.deliverables || [],
      platforms: opp.platforms || [opp.category].filter(Boolean),
      applicants: opp.applicants || [],
      paymentType: opp.paymentType || 'Fixed-price',
      experienceLevel: opp.experienceLevel || 'Expert'
    };
  });

  const filteredOpportunities = opportunities.filter((o: any) => {
    const matchesPlatform = selectedPlatform === 'All Platforms' ||
      o.platforms?.some((p: string) => p.toLowerCase().includes(selectedPlatform.toLowerCase())) ||
      (o.category && o.category.toLowerCase().includes(selectedPlatform.toLowerCase()));

    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower ||
      (o.title && o.title.toLowerCase().includes(searchLower)) ||
      (o.description && o.description.toLowerCase().includes(searchLower)) ||
      (o.brand && o.brand.toLowerCase().includes(searchLower)) ||
      (o.category && o.category.toLowerCase().includes(searchLower));

    let matchesBudget = true;
    if (selectedBudgetRange !== 'All Budgets') {
      const budget = typeof o.budget === 'object' ? o.budget.amount : (o.budget || 0);
      if (selectedBudgetRange === 'Under $1,000') matchesBudget = budget < 1000;
      else if (selectedBudgetRange === '$1,000 - $3,000') matchesBudget = budget >= 1000 && budget <= 3000;
      else if (selectedBudgetRange === '$3,000 - $5,000') matchesBudget = budget >= 3000 && budget <= 5000;
      else if (selectedBudgetRange === 'Over $5,000') matchesBudget = budget > 5000;
    }

    return matchesPlatform && matchesSearch && matchesBudget;
  });

  const sortedFilteredOpportunities = [...filteredOpportunities].sort((a: any, b: any) => {
    const budgetA = typeof a.budget === 'object' ? (a.budget.amount || 0) : (a.budget || 0);
    const budgetB = typeof b.budget === 'object' ? (b.budget.amount || 0) : (b.budget || 0);
    
    if (sortBy === 'Highest Budget') {
      return budgetB - budgetA;
    }
    if (sortBy === 'Newest Posted') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    return scoreB - scoreA;
  });

  const visibleOpportunities = sortedFilteredOpportunities.filter(
    (o: any) => !dismissedJobs.includes(o._id)
  );

  const displayOpportunities = activeTab === 'Bookmarked Campaigns'
    ? bookmarkedOpportunities
    : visibleOpportunities;

  const hasActiveFilters = selectedPlatform !== 'All Platforms' || 
    selectedBudgetRange !== 'All Budgets' || 
    sortBy !== 'Best Match Score';

  return (
    <AdvertiserLayout>
      <div className="max-w-[1050px] mx-auto pb-24 pt-8 px-4 sm:px-6">
        
        {/* AI Banner and Stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-gray-150 dark:border-white/5 bg-gradient-to-br from-emerald-500/[0.06] via-emerald-600/[0.02] to-violet-500/[0.04] p-8 sm:p-10 mb-8"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse duration-[8000ms]" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-4 border border-emerald-500/20">
                <Sparkles size={11} className="animate-spin duration-3000" />
                AI Match Engine Active
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
                Discover campaigns that <span className="bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">match you perfectly</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Our advanced recommendation model scans campaign objectives, platform requirements, and budget ranges to map high-relevance matches specifically to your creator profile.
              </p>
            </div>

            {/* Quick stats widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:w-auto shrink-0">
              <div className="bg-white/70 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-3xl p-5 backdrop-blur-md">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Avg. Match Rate</span>
                <div className="flex items-baseline gap-1 text-2xl font-black text-emerald-500">
                  96%
                  <span className="text-xs text-gray-400 font-medium">accuracy</span>
                </div>
              </div>
              <div className="bg-white/70 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-3xl p-5 backdrop-blur-md">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Match Power</span>
                <div className="flex items-baseline gap-1 text-2xl font-black text-violet-500">
                  High
                  <span className="text-xs text-gray-400 font-medium">relevance</span>
                </div>
              </div>
              <div className="bg-white/70 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-3xl p-5 backdrop-blur-md col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Your Coins</span>
                <Link to="/advertiser/buy-coins" className="flex items-baseline gap-1 text-2xl font-black text-amber-500 hover:text-amber-400 transition-colors">
                  {walletData?.availableBalance ?? walletData?.balance ?? 0}
                  <span className="text-xs text-gray-400 font-medium">coins</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar matching design details */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by keywords, niches, platform or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.01] focus:border-emerald-500 dark:focus:border-emerald-500/50 outline-none text-gray-900 dark:text-white transition-all text-sm shadow-sm focus:shadow-[0_0_20px_rgba(16,185,129,0.06)]"
            />
          </div>
          
          <button 
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border transition-all text-sm font-bold shadow-sm cursor-pointer",
              showFiltersPanel || hasActiveFilters
                ? "bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400"
                : "bg-white dark:bg-white/[0.01] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-500 ring-2 ring-white dark:ring-black" />
            )}
          </button>
        </div>

        {/* Expandable Filter Drawer Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-50/50 dark:bg-white/[0.015] border border-gray-200/60 dark:border-white/5 rounded-3xl p-6 mb-6 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Platforms Filter */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Platform Focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {['All Platforms', 'Instagram', 'TikTok', 'YouTube'].map(p => (
                        <button
                          key={p}
                          onClick={() => setSelectedPlatform(p)}
                          className={cn(
                            "px-3.5 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer",
                            selectedPlatform === p
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : "bg-white dark:bg-black/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-emerald-500/30 hover:text-emerald-500"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range Filter */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Budget Range</h4>
                    <div className="flex flex-wrap gap-2">
                      {['All Budgets', 'Under $1,000', '$1,000 - $3,000', '$3,000 - $5,000', 'Over $5,000'].map(b => (
                        <button
                          key={b}
                          onClick={() => setSelectedBudgetRange(b)}
                          className={cn(
                            "px-3.5 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer",
                            selectedBudgetRange === b
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : "bg-white dark:bg-black/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-emerald-500/30 hover:text-emerald-500"
                          )}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By Filter */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Order & Sort</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Best Match Score', 'Highest Budget', 'Newest Posted'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSortBy(s)}
                          className={cn(
                            "px-3.5 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer",
                            sortBy === s
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : "bg-white dark:bg-black/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-emerald-500/30 hover:text-emerald-500"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters Action */}
                {hasActiveFilters && (
                  <div className="mt-6 pt-4 border-t border-gray-150 dark:border-white/5 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Filters are applying to your matching feed.
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPlatform('All Platforms');
                        setSelectedBudgetRange('All Budgets');
                        setSortBy('Best Match Score');
                        toast.success('Filters cleared successfully', {
                          style: { borderRadius: '1rem', background: '#333', color: '#fff' }
                        });
                      }}
                      className="text-xs font-black text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Building2 size={13} className="rotate-45" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-gray-200 dark:border-white/5 pb-4 mb-8">
          {/* Framer Motion Pill Switcher */}
          <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-2xl overflow-x-auto">
            {TABS.map((tab) => {
              const isBookmarked = tab === 'Bookmarked Campaigns';
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "relative px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-300 cursor-pointer",
                    isActive
                      ? "text-gray-950 dark:text-white"
                      : "text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-white dark:bg-[#151515] border border-gray-200/80 dark:border-white/10 rounded-xl shadow-sm z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab === 'Recommended Campaigns' && <Sparkles size={13} className="text-emerald-500" />}
                    {tab === 'Recently Posted' && <Clock size={13} className="text-violet-500" />}
                    {tab === 'Campaign Feed' && <TrendingUp size={13} className="text-blue-500" />}
                    {isBookmarked && <Heart size={13} className="text-pink-500" />}
                    {tab}
                    {isBookmarked && savedJobs.length > 0 && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-full text-[9px] font-black",
                        isActive ? "bg-emerald-500 text-black" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {savedJobs.length}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center text-xs font-bold text-gray-400 dark:text-gray-500 justify-end">
            Sort: <span className="text-[#10b981] dark:text-[#10b981] ml-1">{sortBy}</span>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col items-center py-32">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[10px] pointer-events-none animate-pulse" />
              <Loader2 size={44} className="text-emerald-500 animate-spin relative z-10" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Scanning matching campaigns...</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This takes only a second</p>
          </div>
        ) : displayOpportunities.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-28 bg-gray-50 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/5 rounded-[2.5rem] p-10"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase size={30} className="text-[#9A9FA5]" />
            </div>
            <p className="text-lg font-bold text-[#1A1D1F] dark:text-white mb-2">
              {activeTab === 'Bookmarked Campaigns' ? 'No bookmarked campaigns found' : 'No matching campaigns found'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
              {activeTab === 'Bookmarked Campaigns' 
                ? 'Save and bookmark campaigns you like from your matches feed to keep track of them here.' 
                : 'Try adjusting your search query, clearing filters, or switching tabs to discover more opportunities.'}
            </p>
            {hasActiveFilters && (
              <button 
                onClick={() => {
                  setSelectedPlatform('All Platforms');
                  setSelectedBudgetRange('All Budgets');
                  setSortBy('Best Match Score');
                }}
                className="mt-6 px-6 py-2.5 bg-gray-200 dark:bg-white/10 hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-black text-gray-700 dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Clear Active Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {displayOpportunities.map((opp: any, idx: number) => {
                const applicantCount = Array.isArray(opp.applicants) ? opp.applicants.length : 0;
                const proposalText = applicantCount === 0 
                  ? "Be the first to apply!" 
                  : applicantCount === 1
                    ? "1 applicant"
                    : `${applicantCount} applicants`;
                
                const budgetAmount = typeof opp.budget === 'object' ? (opp.budget.amount || 0) : (opp.budget || 0);
                const paymentType = opp.paymentType || 'Fixed-price';
                const expLevel = opp.experienceLevel || 'Expert';
                const locationText = opp.location || opp.requirements?.location || "Global Campaign";
                
                const isSaved = isJobSaved(opp._id);

                const averageRating = opp.businessOwner?.averageRating || opp.owner?.averageRating || 0;
                const totalReviews = opp.businessOwner?.totalReviews || opp.owner?.totalReviews || 0;

                // Initial Avatar Gradient generator
                const brandInitials = opp.brand ? opp.brand.slice(0, 2).toUpperCase() : 'CO';
                const gradientIndex = (opp.brand || '').length % 5;
                const gradients = [
                  'from-emerald-400 to-teal-500',
                  'from-pink-500 to-rose-400',
                  'from-violet-500 to-purple-600',
                  'from-blue-400 to-indigo-500',
                  'from-amber-400 to-orange-500',
                ];
                const avatarGradient = gradients[gradientIndex];
                const avatarUrl = opp.owner?.profilePicture;

                // Match insights factors
                const score = opp.score;
                const roundedScore = score !== undefined ? Math.round(score) : undefined;
                const fitLabel = roundedScore !== undefined
                  ? roundedScore >= 85
                    ? 'Highly Compatible'
                    : roundedScore >= 70
                      ? 'Strong Fit'
                      : roundedScore >= 45
                        ? 'Good Match'
                        : 'Potential Match'
                  : '';
                const fitColor = roundedScore !== undefined
                  ? roundedScore >= 85
                    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                    : roundedScore >= 70
                      ? 'text-violet-500 bg-violet-500/10 border-violet-500/20'
                      : roundedScore >= 45
                        ? 'text-sky-500 bg-sky-500/10 border-sky-500/20'
                        : 'text-gray-500 bg-gray-500/10 border-gray-200/20 dark:text-gray-400 dark:bg-white/5 dark:border-white/10'
                  : '';

                return (
                  <motion.div
                    layout
                    key={opp._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                    className={cn(
                      "relative overflow-hidden rounded-[2rem] border transition-all duration-300 p-6 sm:p-8 bg-white dark:bg-white/[0.015] border-gray-150 dark:border-white/5",
                      "hover:border-emerald-500/30 dark:hover:border-emerald-500/20 hover:shadow-[0_20px_50px_rgba(16,185,129,0.03)] dark:hover:shadow-[0_20px_50px_rgba(16,185,129,0.06)] hover:-translate-y-1"
                    )}
                  >
                    {/* Glow Accents */}
                    {score && score >= 85 && (
                      <div className="absolute top-0 left-0 w-[4px] h-full bg-emerald-500" />
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      {/* Posted & Applicant Meta */}
                      <div className="flex items-center gap-2.5 text-xs font-bold text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          Posted {formatTimeAgo(opp.createdAt)}
                        </span>
                        <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full"></span>
                        <span className="text-[#10b981] dark:text-[#10b981] font-black uppercase tracking-wider text-[10px]">
                          {proposalText}
                        </span>
                      </div>

                      {/* AI Match Progress Badge */}
                      {roundedScore !== undefined ? (
                        <div className={cn("inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-black shadow-sm shrink-0", fitColor)}>
                          <Sparkles size={13} className="animate-pulse" />
                          <span>✨ {roundedScore}% AI Match • {fitLabel}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black shrink-0">
                          <Heart size={13} className="fill-current text-amber-500 animate-pulse" />
                          <span>Bookmarked</span>
                        </div>
                      )}
                    </div>

                    {/* Brand details and Title */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Brand Avatar */}
                      <div className="shrink-0">
                        {avatarUrl ? (
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
                            <img src={avatarUrl} alt={opp.brand} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm bg-gradient-to-tr shadow-md", avatarGradient)}>
                            {brandInitials}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                          <span>{opp.brand}</span>
                          <span className="inline-flex items-center justify-center p-0.5 rounded-full bg-blue-500/10 text-blue-500" title="Verified Brand">
                            <CheckCircle2 size={11} className="fill-blue-500/10" />
                          </span>
                        </div>
                        <Link to={`/advertiser/matches/${opp._id}/apply`}>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                            {opp.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    {/* Description with Expandable accordion */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed bg-gray-50/20 dark:bg-white/[0.005] p-4 rounded-2xl border border-gray-100/50 dark:border-white/5">
                      <p className={cn(
                        "transition-all duration-300",
                        expandedJobs.includes(opp._id) ? "" : "line-clamp-3"
                      )}>
                        {opp.description}
                      </p>
                      {opp.description && opp.description.length > 200 && (
                        <button
                          onClick={(e) => toggleExpandJob(e, opp._id)}
                          className="text-emerald-500 hover:text-emerald-400 font-black text-xs mt-3 flex items-center gap-0.5 transition-colors cursor-pointer focus:outline-none"
                        >
                          {expandedJobs.includes(opp._id) ? (
                            <>Show Less Details <ChevronUp size={13} /></>
                          ) : (
                            <>Read Full Details & Requirements <ChevronDown size={13} /></>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Highly Interactive Platforms & Deliverables Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {opp.platforms?.map((platform: string) => {
                        const isInstagram = platform.toLowerCase().includes('instagram');
                        const isTikTok = platform.toLowerCase().includes('tiktok');
                        const isYouTube = platform.toLowerCase().includes('youtube');
                        
                        return (
                          <span
                            key={platform}
                            className={cn(
                              "px-3.5 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-sm",
                              isInstagram && "bg-pink-500/10 text-pink-500 border-pink-500/20 dark:bg-pink-500/5",
                              isTikTok && "bg-black/10 dark:bg-white/10 text-gray-800 dark:text-white border-gray-300 dark:border-white/20",
                              isYouTube && "bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/5",
                              !isInstagram && !isTikTok && !isYouTube && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isInstagram && "bg-pink-500 animate-pulse",
                              isTikTok && "bg-gray-800 dark:bg-white animate-pulse",
                              isYouTube && "bg-red-500 animate-pulse",
                              !isInstagram && !isTikTok && !isYouTube && "bg-emerald-500 animate-pulse"
                            )} />
                            {platform}
                          </span>
                        );
                      })}

                      {opp.deliverables?.slice(0, 3).map((del: string) => (
                        <span
                          key={del}
                          className="px-3.5 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-500 dark:text-gray-400 text-xs font-bold rounded-xl"
                        >
                          {del}
                        </span>
                      ))}

                      {opp.category && !opp.platforms?.includes(opp.category) && (
                        <span className="px-3.5 py-1.5 bg-violet-500/10 text-violet-500 border border-violet-500/20 text-xs font-bold rounded-xl">
                          {opp.category}
                        </span>
                      )}
                    </div>

                    {/* AI Insights bullet points */}
                    {roundedScore !== undefined && (
                      <div className={cn(
                        "mb-6 px-4 py-3 border rounded-2xl flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold",
                        roundedScore >= 70
                          ? "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] border-emerald-500/15 text-gray-600 dark:text-gray-300"
                          : roundedScore >= 45
                            ? "bg-sky-500/[0.03] dark:bg-sky-500/[0.01] border-sky-500/15 text-gray-600 dark:text-gray-300"
                            : "bg-gray-50 dark:bg-white/[0.01] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400"
                      )}>
                        {roundedScore >= 70 ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Check className="text-emerald-500" size={13} />
                              <span>Niche Aligns with Creator Profile</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="text-emerald-500" size={13} />
                              <span>Platform matches focus</span>
                            </div>
                            {budgetAmount >= 1000 && (
                              <div className="flex items-center gap-1.5">
                                <Check className="text-emerald-500" size={13} />
                                <span>High-paying premium budget</span>
                              </div>
                            )}
                          </>
                        ) : roundedScore >= 45 ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Check className="text-sky-500" size={13} />
                              <span>Platform matches focus</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="text-sky-500" size={13} />
                              <span>Open active campaign</span>
                            </div>
                            {budgetAmount >= 1000 && (
                              <div className="flex items-center gap-1.5">
                                <Check className="text-sky-500" size={13} />
                                <span>Good budget potential</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="text-gray-400 dark:text-gray-500" size={13} />
                              <span>Open generic campaign</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="text-gray-400 dark:text-gray-500" size={13} />
                              <span>Exploratory compatibility</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="text-gray-400 dark:text-gray-500" size={13} />
                              <span>Direct client connection</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Client Verification Stats & Budget details */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-6 border-t border-gray-150 dark:border-white/5">
                      <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs font-bold text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={15} className="text-blue-500 fill-blue-500/10" />
                          <span className="text-gray-800 dark:text-gray-200">Verified Partner</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {averageRating > 0 ? (
                            <>
                              <div className="flex text-amber-500 gap-0.5">
                                {[...Array(5)].map((_, i) => {
                                  const isFilled = i < Math.round(averageRating);
                                  return (
                                    <Star 
                                      key={i} 
                                      size={13} 
                                      className={isFilled ? "fill-amber-500 text-amber-500" : "text-gray-300 dark:text-gray-600"} 
                                    />
                                  );
                                })}
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 ml-1 font-bold">
                                {averageRating.toFixed(1)} <span className="text-gray-400 font-normal">({totalReviews})</span>
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider">
                              New Partner
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Globe size={14} />
                          <span>{locationText}</span>
                        </div>
                      </div>

                      {/* Call to Actions */}
                      <div className="flex justify-between sm:justify-end items-center gap-4 mt-2 lg:mt-0">
                        <div className="flex gap-2">
                          {/* Dismiss Button */}
                          {score !== undefined && (
                            <button
                              onClick={() => handleDismissJob(opp._id)}
                              className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-gray-200/50 dark:border-white/5 transition-all duration-300 cursor-pointer"
                              title="Dismiss Campaign"
                            >
                              <ThumbsDown size={17} />
                            </button>
                          )}
                          
                          {/* Save Button */}
                          <button
                            onClick={(e) => handleToggleSave(e, opp._id)}
                            className={cn(
                              "p-3 rounded-2xl border transition-all duration-300 cursor-pointer",
                              isSaved
                                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500 border-rose-200 dark:border-rose-500/20"
                                : "bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-rose-500 border-gray-200/50 dark:border-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/5"
                            )}
                            title={isSaved ? "Remove Bookmark" : "Bookmark Campaign"}
                          >
                            <Heart size={17} className={isSaved ? "fill-current" : ""} />
                          </button>
                        </div>

                        {/* Apply CTA with Wallet / Budget summary */}
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Est. Budget</span>
                            <span className="text-base font-black text-emerald-500">{budgetAmount.toLocaleString()} ETB</span>
                          </div>

                          {hasApplied(opp._id) ? (
                            <button disabled className="px-6 py-3.5 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 text-xs font-black rounded-2xl border border-gray-200/50 dark:border-white/5 flex items-center gap-1.5 cursor-not-allowed">
                              Applied
                              <CheckCircle2 size={14} className="text-emerald-500" />
                            </button>
                          ) : (
                            <Link to={`/advertiser/matches/${opp._id}/apply`}>
                              <button className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-1.5 group cursor-pointer">
                                Apply to Match
                                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdvertiserLayout>
  );
}
