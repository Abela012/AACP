import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Briefcase, Loader2, AlertCircle, CheckCircle2,
  ThumbsDown, Heart, MapPin, Star, Filter, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOpportunities } from '@/src/hooks/useOpportunities';
import { useApply } from '@/src/hooks/useApplications';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import type { Opportunity } from '@/src/api/opportunityApi';

const TABS = ['Best Matches', 'Most Recent', 'My Feed', 'Saved Jobs (1)'];

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export default function OpportunityListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Best Matches');
  const [page, setPage] = useState(1);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const { data, isLoading, isError } = useOpportunities({
    page,
    limit: 20,
  });

  const apply = useApply();

  const opportunities: Opportunity[] = data?.opportunities ?? [];
  const filtered = searchQuery
    ? opportunities.filter(o =>
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : opportunities;

  const handleApply = (opp: Opportunity) => {
    setApplyingTo(opp._id);
    apply.mutate(
      { opportunity: opp._id },
      {
        onSuccess: () => { showToast(`Applied to "${opp.title}" successfully!`); setApplyingTo(null); },
        onError: () => { showToast('Failed to apply. You may have already applied.', 'error'); setApplyingTo(null); },
      }
    );
  };

  return (
    <AdvertiserLayout>
      <div className="max-w-[1000px] mx-auto pb-12 pt-8">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-[#1A1D1F] dark:text-white mb-6">
          Jobs you might like
        </h1>

        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700/50 mb-6">
          {/* Tabs */}
          <div className="flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`pb-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab
                    ? 'text-[#1A1D1F] dark:text-white border-[#1A1D1F] dark:border-white'
                    : 'text-gray-500 hover:text-[#1A1D1F] dark:text-gray-400 dark:hover:text-white border-transparent'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-aacp-olive text-aacp-olive text-sm font-medium hover:bg-aacp-olive/10 transition-colors">
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
            <Loader2 size={40} className="text-aacp-olive animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-500">Loading opportunities...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-32">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">Could not load opportunities</p>
            <p className="text-xs text-gray-500">Check your connection and try again.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <Briefcase size={48} className="text-[#9A9FA5] mx-auto mb-4" />
            <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">No opportunities found</p>
            <p className="text-xs text-gray-500">Try a different search term or tab.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((opp, idx) => {
              // Extract all tags safely
              const tags = [
                ...(opp.deliverables || []),
                ...(opp.requirements?.preferredNiches || []),
                ...(opp.platforms || []),
              ].filter(Boolean);

              // Handle application count string
              const applicantCount = Array.isArray(opp.applicants) ? opp.applicants.length : 0;
              const proposalText = applicantCount.toString();

              if (idx === 0) {
                return (
                  <motion.div
                    key={opp._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 mb-10 rounded-3xl bg-gradient-to-br from-aacp-olive/10 via-[#1A1D1F]/5 to-transparent dark:from-aacp-olive/10 dark:via-[#111111]/50 dark:to-transparent border border-aacp-olive/20 dark:border-aacp-olive/30 relative overflow-hidden group shadow-2xl"
                  >
                    {/* Glowing ambient background blur */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-aacp-olive/10 dark:bg-aacp-olive/5 rounded-full filter blur-[80px] -mr-20 -mt-20 pointer-events-none" />

                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400 mb-4">
                      <span className="px-3 py-1 rounded-full bg-aacp-olive text-white font-extrabold uppercase tracking-widest text-[9px] shadow-lg shadow-aacp-olive/20 animate-pulse">
                        🆕 Latest Campaign
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-200/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider text-[9px]">
                        Posted {formatTimeAgo(opp.createdAt)}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-200/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider text-[9px]">
                        Proposals: {proposalText}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <div className="flex-1">
                        <Link to={`/opportunities/${opp._id}`}>
                          <h2 className="text-2xl md:text-3xl font-black text-[#1A1D1F] dark:text-white group-hover:text-aacp-olive dark:group-hover:text-aacp-gold transition-colors tracking-tight leading-tight">
                            {opp.title}
                          </h2>
                        </Link>
                        <div className="text-sm font-bold text-aacp-olive dark:text-aacp-gold mt-2.5 flex flex-wrap items-center gap-2">
                          <span>{opp.paymentType || 'Fixed-price'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                          <span>{opp.experienceLevel || 'Expert'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                          <span>Est. Budget: {opp.budget?.amount?.toLocaleString() || '0'} {opp.budget?.currency || 'ETB'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2.5 shrink-0 self-end md:self-start mt-2 md:mt-0">
                        <button className="p-3 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm">
                          <Heart size={20} />
                        </button>
                        <button
                          onClick={() => handleApply(opp)}
                          disabled={applyingTo === opp._id}
                          className="px-6 py-3 rounded-full bg-aacp-olive hover:bg-aacp-gold text-white text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-aacp-olive/20 disabled:opacity-50 flex items-center gap-2"
                        >
                          {applyingTo === opp._id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Applying...
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-3.5 py-1.5 bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-bold text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200/50 dark:border-white/5">
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
                        <span>{opp.requirements?.location || "Global"}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={opp._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="py-8 border-b border-gray-200 dark:border-gray-700/50 group"
                >
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                    <span className="px-2 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      Posted {formatTimeAgo(opp.createdAt)}
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      Proposals: {proposalText}
                    </span>
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/opportunities/${opp._id}`}>
                      <h3 className="text-xl font-semibold text-[#1A1D1F] dark:text-white hover:text-aacp-olive dark:hover:text-aacp-olive cursor-pointer transition-colors line-clamp-2">
                        {opp.title}
                      </h3>
                    </Link>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <ThumbsDown size={20} />
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Heart size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                    {opp.paymentType || 'Fixed-price'} - {opp.experienceLevel || 'Expert'} - Est. Budget: {opp.budget?.amount?.toLocaleString() || '0'} {opp.budget?.currency || 'ETB'}
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-6 relative">
                    <span className="line-clamp-3 md:line-clamp-4">
                      {opp.description}
                    </span>
                    <Link to={`/opportunities/${opp._id}`} className="text-aacp-olive hover:underline font-medium inline-block mt-1">
                      more
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
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
                      <span>{opp.requirements?.location || "Global"}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Page {data.page} of {data.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-6 py-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success' ? 'bg-aacp-olive text-white border-green-400' : 'bg-red-500 text-white border-red-400'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AdvertiserLayout>
  );
}
