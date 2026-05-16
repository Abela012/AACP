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
  CheckCircle,
  Loader2,
  Briefcase
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { useRecommendations } from '@/src/hooks/useRecommendations';
import { useSavedOpportunities, useToggleSaveOpportunity } from '@/src/hooks/useSavedOpportunities';

const TABS = ['Recommended Campaigns', 'Recently Posted', 'Campaign Feed', 'Bookmarked Campaigns'];

function formatTimeAgo(dateString: string | undefined) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default function AdvertiserMatchesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Recommended Campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState('All Budgets');
  
  const { data: recoData, isLoading: isLoadingRecos } = useRecommendations();
  const { data: savedJobs = [], isLoading: isLoadingSaved } = useSavedOpportunities();
  const toggleSave = useToggleSaveOpportunity();

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
    toggleSave.mutate(jobId);
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
      firstName: r.meta.businessOwner.name.split(' ')[0] || 'Business'
    } : undefined,
    brand: r.meta?.businessOwner?.name || 'Business',
    campaign: r.name,
    budget: r.meta?.budget,
    createdAt: r.meta?.createdAt,
    description: r.meta?.description || 'No description provided.',
    requirements: r.meta?.requirements || [],
    deliverables: r.meta?.deliverables || [],
    platforms: r.meta?.platforms || [r.category].filter(Boolean),
    applicants: r.meta?.applicants || [],
    paymentType: r.meta?.paymentType || 'Fixed-price',
    experienceLevel: r.meta?.experienceLevel || 'Expert'
  }));

  const filteredOpportunities = opportunities.filter((o: any) => {
    const matchesPlatform = selectedPlatform === 'All Platforms' ||
      (o.category && o.category.includes(selectedPlatform));

    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower ||
      (o.title && o.title.toLowerCase().includes(searchLower)) ||
      (o.description && o.description.toLowerCase().includes(searchLower));

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

  const displayOpportunities = activeTab === 'Bookmarked Campaigns'
    ? savedJobs
    : filteredOpportunities;

  return (
    <AdvertiserLayout>
      <div className="max-w-[1000px] mx-auto pb-12 pt-8 px-4 sm:px-0">
        
        {/* Search Bar matching screenshot */}
        <div className="relative mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for jobs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:border-[#14a800] dark:focus:border-[#14a800] outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-8 flex items-center gap-2">
          Saved Searches: <span className="text-[#14a800]">audio transcription</span>
        </div>

        <h1 className="text-3xl font-semibold text-[#1A1D1F] dark:text-white mb-6">
          Jobs you might like
        </h1>

        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700/50 mb-6">
          {/* Tabs */}
          <div className="flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 font-semibold whitespace-nowrap transition-colors border-b-2",
                  activeTab === tab
                    ? 'text-[#1A1D1F] dark:text-white border-[#1A1D1F] dark:border-white'
                    : 'text-gray-500 hover:text-[#1A1D1F] dark:text-gray-400 dark:hover:text-white border-transparent'
                )}
              >
                {tab === 'Bookmarked Campaigns' ? `${tab} (${savedJobs.length})` : tab}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#14a800] text-[#14a800] text-sm font-medium hover:bg-[#14a800]/10 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Browse jobs that match your experience to a client's hiring preferences. Ordered by most relevant.
          </p>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col items-center py-32">
            <Loader2 size={40} className="text-[#14a800] animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-500">Loading opportunities...</p>
          </div>
        ) : displayOpportunities.length === 0 ? (
          <div className="text-center py-32">
            <Briefcase size={48} className="text-[#9A9FA5] mx-auto mb-4" />
            <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">
              {activeTab === 'Bookmarked Campaigns' ? 'No bookmarked campaigns found' : 'No opportunities found'}
            </p>
            <p className="text-xs text-gray-500">
              {activeTab === 'Bookmarked Campaigns' ? 'Campaigns you bookmark will appear here.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {displayOpportunities.map((opp: any, idx: number) => {
              const tags = [
                ...(opp.deliverables || []),
                ...(opp.platforms || []),
                opp.category
              ].filter(Boolean);

              const applicantCount = Array.isArray(opp.applicants) ? opp.applicants.length : 0;
              const proposalText = applicantCount < 5 ? "Less than 5" : applicantCount.toString();
              const budgetAmount = typeof opp.budget === 'object' ? (opp.budget.amount || 0) : (opp.budget || 0);
              const paymentType = opp.paymentType || 'Fixed-price';
              const expLevel = opp.experienceLevel || 'Expert';
              const locationText = opp.location || opp.requirements?.location || "Global";

              return (
                <motion.div
                  key={opp._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="py-8 border-b border-gray-200 dark:border-gray-700/50 group"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-bold">
                      Posted {formatTimeAgo(opp.createdAt)}
                    </span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="font-bold">
                      Proposals: {proposalText}
                    </span>
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/advertiser/matches/${opp._id}/apply`}>
                      <h3 className="text-xl font-semibold text-[#1A1D1F] dark:text-white hover:text-[#14a800] dark:hover:text-[#14a800] cursor-pointer transition-colors line-clamp-2">
                        {opp.title}
                      </h3>
                    </Link>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <ThumbsDown size={20} />
                      </button>
                      <button 
                        onClick={(e) => handleToggleSave(e, opp._id)}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          isJobSaved(opp._id)
                            ? "bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
                            : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <Heart size={20} className={isJobSaved(opp._id) ? "fill-current" : ""} />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                    {paymentType} - {expLevel} - Est. Budget: ${budgetAmount.toLocaleString()}
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-6 relative leading-relaxed">
                    <span className="line-clamp-3 md:line-clamp-4">
                      {opp.description}
                    </span>
                    <Link to={`/advertiser/matches/${opp._id}/apply`} className="text-[#14a800] hover:underline font-medium inline-block mt-1">
                      more
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={16} className="text-blue-500 fill-blue-500/20" />
                      <span className="text-gray-900 dark:text-white">Payment verified</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-500 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-500" />
                        ))}
                      </div>
                    </div>

                    <div>$40K+ spent</div>

                    <div className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      <span>{locationText}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdvertiserLayout>
  );
}
