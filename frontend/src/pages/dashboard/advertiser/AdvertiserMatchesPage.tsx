import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  ArrowRight,
  Sparkles,
  X,
  DollarSign,
  Zap,
  Building2,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';

type PlatformString = 'TikTok' | 'Instagram' | 'YouTube';

export interface JobOpportunity {
  id: number;
  brand: string;
  campaign: string;
  match: string;
  budget: string;
  platform: PlatformString;
  image: string;
  location?: string;
  description?: string;
  requirements?: string[];
}

import { useOpportunities } from '@/src/hooks/useOpportunities';
import { Loader2 } from 'lucide-react';

export default function AdvertiserMatchesPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState('All Budgets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);

  const { data: oppsData, isLoading } = useOpportunities();
  const opportunities = oppsData?.opportunities ?? [];

  useEffect(() => {
    const stored = localStorage.getItem('appliedJobs');
    if (stored) {
      setAppliedJobs(JSON.parse(stored));
    }
  }, []);

  const isApplied = (job: any) => {
    return appliedJobs.some(aj => aj.title === job.title);
  };

  const filteredOpportunities = opportunities.filter((o: any) => {
    const matchesPlatform = selectedPlatform === 'All Platforms' || 
                           (o.category && o.category.includes(selectedPlatform));
                           
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower || 
                         (o.title && o.title.toLowerCase().includes(searchLower)) || 
                         (o.description && o.description.toLowerCase().includes(searchLower));
    
    let matchesBudget = true;
    if (selectedBudgetRange !== 'All Budgets') {
      const budget = o.budget?.amount || 0;
      if (selectedBudgetRange === 'Under $1,000') matchesBudget = budget < 1000;
      else if (selectedBudgetRange === '$1,000 - $3,000') matchesBudget = budget >= 1000 && budget <= 3000;
      else if (selectedBudgetRange === '$3,000 - $5,000') matchesBudget = budget >= 3000 && budget <= 5000;
      else if (selectedBudgetRange === 'Over $5,000') matchesBudget = budget > 5000;
    }

    return matchesPlatform && matchesSearch && matchesBudget;
  });

  const handleApply = (e: React.MouseEvent, job: any) => {
    e.stopPropagation();
    navigate(`/advertiser/matches/${job._id}/apply`, { state: { job } });
  };

  return (
    <AdvertiserLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">

        {/* Modal Overlay for Job Details */}
        <AnimatePresence>
          {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 z-10 flex flex-col max-h-[90vh]"
              >
                <div className="h-48 relative shrink-0">
                  <img src={selectedJob.image} alt={selectedJob.brand} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-6 left-8">
                    <h2 className="text-3xl font-black text-white mb-1">{selectedJob.title}</h2>
                    <p className="text-emerald-400 font-bold flex items-center gap-2"><Building2 size={16} />{selectedJob.owner?.firstName || 'Business Owner'}</p>
                  </div>
                </div>
                
                <div className="p-8 overflow-y-auto">
                  <div className="flex flex-wrap gap-4 mb-8">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"><DollarSign size={16} />${(typeof selectedJob.budget === 'object' ? selectedJob.budget.amount : (selectedJob.budget || 0)).toLocaleString()}</span>
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Zap size={16} />{selectedJob.category || 'Any'}</span>
                    <span className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"><MapPin size={16} />Remote</span>
                  </div>

                  <div className="space-y-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Campaign Overview</h3>
                      <p>{selectedJob.description}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Requirements</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500 shrink-0" size={16} /> High engagement rate</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500 shrink-0" size={16} /> Content alignment</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                     <button 
                      onClick={(e) => !isApplied(selectedJob) && handleApply(e, selectedJob)}
                      disabled={isApplied(selectedJob)}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2",
                        isApplied(selectedJob)
                          ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed shadow-none"
                          : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20"
                      )}
                    >
                      {isApplied(selectedJob) ? 'Already Applied' : 'Apply for Campaign'}
                      {!isApplied(selectedJob) && <ArrowRight size={20} />}
                      {isApplied(selectedJob) && <CheckCircle2 size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">New Opportunities</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Our AI has matched you with these high-synergy brand opportunities.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all">
              <Sparkles size={18} />
              Refine My Profile
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none mb-8 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search brands or campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none text-sm dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedBudgetRange}
              onChange={(e) => setSelectedBudgetRange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none bg-white dark:bg-white/5"
            >
              <option>All Budgets</option>
              <option>Under $1,000</option>
              <option>$1,000 - $3,000</option>
              <option>$3,000 - $5,000</option>
              <option>Over $5,000</option>
            </select>
            <select 
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none bg-white dark:bg-white/5"
            >
              <option>All Platforms</option>
              <option>TikTok</option>
              <option>Instagram</option>
              <option>YouTube</option>
            </select>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">Finding best matches...</p>
            </div>
          ) : filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((o: any) => (
              <motion.div 
                key={o._id}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedJob(o)}
                className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden group cursor-pointer"
              >
                <div className="h-48 relative">
                  <div className="w-full h-full bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-400">
                    <Building2 size={48} />
                  </div>
                  <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    95% Match
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{o.owner?.firstName || 'Business'}</h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest line-clamp-1">{o.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">4.9</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Budget</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">${(typeof o.budget === 'object' ? o.budget.amount : (o.budget || 0)).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Platform</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{o.category || 'Any'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => !isApplied(o) && handleApply(e, o)}
                      disabled={isApplied(o)}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2",
                        isApplied(o) 
                          ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed shadow-none" 
                          : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-100 dark:shadow-none"
                      )}
                    >
                      {isApplied(o) ? 'Applied' : 'Apply Now'}
                      {!isApplied(o) && <ArrowRight size={18} />}
                      {isApplied(o) && <CheckCircle2 size={18} />}
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()} 
                      className="w-14 h-14 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400 dark:text-gray-500 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </main>
    </AdvertiserLayout>
  );
}
