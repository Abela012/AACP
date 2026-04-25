import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Briefcase, Coins, Clock, Users, Filter,
  CheckCircle2, AlertCircle, Loader2, ExternalLink, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOpportunities } from '@/src/hooks/useOpportunities';
import { useApply } from '@/src/hooks/useApplications';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import type { Opportunity } from '@/src/api/opportunityApi';

const CATEGORIES = ['All', 'Social Media', 'Video', 'Photography', 'Writing', 'Design'];

export default function OpportunityListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const { data, isLoading, isError } = useOpportunities({
    page,
    limit: 12,
    category: activeCategory !== 'All' ? activeCategory : undefined,
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
      <div className="max-w-[1200px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">Opportunities</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              {data?.total !== undefined ? `${data.total.toLocaleString()} live opportunities available` : 'Browse all campaigns and collaborations'}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14a800]/20 w-72 transition-all"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-[#14a800] text-white border-transparent shadow-lg shadow-green-100 dark:shadow-none'
                  : 'bg-white dark:bg-white/5 text-[#6F767E] border-[#EFEFEF] dark:border-white/10 hover:border-[#14a800]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center py-32">
            <Loader2 size={40} className="text-[#14a800] animate-spin mb-4" />
            <p className="text-sm font-bold text-[#6F767E]">Loading opportunities...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-32">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">Could not load opportunities</p>
            <p className="text-xs text-[#6F767E]">Check your connection and try again.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <Briefcase size={48} className="text-[#9A9FA5] mx-auto mb-4" />
            <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">No opportunities found</p>
            <p className="text-xs text-[#6F767E]">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((opp, idx) => (
              <motion.div
                key={opp._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-[#111111] border border-[#EFEFEF] dark:border-white/5 rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col"
              >
                {/* Status badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    opp.status === 'open' ? 'bg-green-100 dark:bg-green-500/20 text-[#14a800]' :
                    opp.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' :
                    'bg-gray-100 dark:bg-white/10 text-[#6F767E]'
                  }`}>
                    {opp.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold text-[#9A9FA5] uppercase">{opp.category}</span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-black text-[#1A1D1F] dark:text-white mb-2 line-clamp-2 group-hover:text-[#14a800] transition-colors">
                  {opp.title}
                </h3>
                <p className="text-xs font-medium text-[#6F767E] dark:text-gray-400 mb-6 line-clamp-3 flex-1">
                  {opp.description}
                </p>

                {/* Meta */}
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#14a800]">
                    <Coins size={14} />
                    {opp.budget.amount.toLocaleString()} AACP
                  </div>
                  {opp.deadline && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#6F767E]">
                      <Clock size={14} />
                      {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  {Array.isArray(opp.applicants) && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#6F767E]">
                      <Users size={14} />
                      {opp.applicants.length} applied
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApply(opp)}
                    disabled={opp.status !== 'open' || apply.isPending}
                    className="flex-1 py-3 bg-[#14a800] hover:bg-[#108a00] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {applyingTo === opp._id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Apply Now
                  </button>
                  <Link
                    to={`/opportunities/${opp._id}`}
                    className="p-3 bg-[#F4F4F4] dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-[#6F767E]"
                    title="View Details"
                  >
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-6 py-3 text-xs font-bold text-[#6F767E]">
              Page {data.page} of {data.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-6 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold disabled:opacity-40"
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
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-[#14a800] text-white border-green-400' : 'bg-red-500 text-white border-red-400'
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
