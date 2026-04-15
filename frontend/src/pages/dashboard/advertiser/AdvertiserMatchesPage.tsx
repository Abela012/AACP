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

export default function AdvertiserMatchesPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState('All Budgets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);

  const opportunities: JobOpportunity[] = [
    { id: 1, brand: 'Global Tech Corp', campaign: 'AI Workstation Launch', match: '98%', budget: '$2,500 - $5,000', platform: 'TikTok', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', location: 'Remote', description: 'Tech innovator looking for high-energy creators to demonstrate our latest AI workstation capabilities.', requirements: ['Tech fluency', '100k+ followers', 'Video editing skills'] },
    { id: 2, brand: 'Creative Studio', campaign: 'Sustainable Living', match: '95%', budget: '$1,200 - $3,000', platform: 'Instagram', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', location: 'New York, USA', description: 'Promoting eco-friendly home products. Seeking authentic UGC showing seamless integration into daily life.', requirements: ['Lifestyle focus', 'High engagement rate', 'Eco-conscious'] },
    { id: 3, brand: 'NexGen Retail', campaign: 'Smart Home Series', match: '92%', budget: '$3,000 - $7,500', platform: 'YouTube', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop', location: 'Remote', description: 'In-depth review campaigns for our upcoming Q4 smart home ecosystem rollout.', requirements: ['Experience with long-form reviews', 'Tech audience', 'High production value'] },
    { id: 4, brand: 'EcoStyle', campaign: 'Fall Fashion Week', match: '89%', budget: '$800 - $1,500', platform: 'TikTok', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop', location: 'London, UK', description: 'Highlight our sustainable fall fashion lines during fashion week.', requirements: ['Fashion focus', 'Trendsetter', 'Quick turnarounds'] },
    { id: 5, brand: 'HealthHub', campaign: 'Wellness Challenge', match: '87%', budget: '$1,500 - $2,500', platform: 'Instagram', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop', location: 'Remote', description: '30-day wellness challenge influencer partnerships to drive app downloads.', requirements: ['Fitness/Health niche', 'Community builder', 'High trust score'] },
  ];

  const parseBudget = (budgetStr: string) => {
    const numbers = budgetStr.replace(/[$,]/g, '').split('-').map(n => parseInt(n.trim()));
    return { min: numbers[0], max: numbers[1] || numbers[0] };
  };

  const filteredOpportunities = opportunities.filter(o => {
    const matchesPlatform = selectedPlatform === 'All Platforms' || o.platform === selectedPlatform;
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower || 
                         o.brand.toLowerCase().includes(searchLower) || 
                         o.campaign.toLowerCase().includes(searchLower) ||
                         o.platform.toLowerCase().includes(searchLower);
    
    let matchesBudget = true;
    if (selectedBudgetRange !== 'All Budgets') {
      const { min, max } = parseBudget(o.budget);
      if (selectedBudgetRange === 'Under $1,000') matchesBudget = min < 1000;
      else if (selectedBudgetRange === '$1,000 - $3,000') matchesBudget = (min >= 1000 && min <= 3000) || (max >= 1000 && max <= 3000);
      else if (selectedBudgetRange === '$3,000 - $5,000') matchesBudget = (min >= 3000 && min <= 5000) || (max >= 3000 && max <= 5000);
      else if (selectedBudgetRange === 'Over $5,000') matchesBudget = max > 5000;
    }

    return matchesPlatform && matchesSearch && matchesBudget;
  });

  const handleApply = (e: React.MouseEvent, job: JobOpportunity) => {
    e.stopPropagation();
    navigate(`/advertiser/matches/${job.id}/apply`, { state: { job } });
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
                    <h2 className="text-3xl font-black text-white mb-1">{selectedJob.campaign}</h2>
                    <p className="text-emerald-400 font-bold flex items-center gap-2"><Building2 size={16} />{selectedJob.brand}</p>
                  </div>
                </div>
                
                <div className="p-8 overflow-y-auto">
                  <div className="flex flex-wrap gap-4 mb-8">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"><DollarSign size={16} />{selectedJob.budget}</span>
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Zap size={16} />{selectedJob.platform}</span>
                    <span className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2"><MapPin size={16} />{selectedJob.location}</span>
                  </div>

                  <div className="space-y-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Campaign Overview</h3>
                      <p>{selectedJob.description}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Requirements</h3>
                      <ul className="space-y-2">
                        {selectedJob.requirements?.map((req, i) => (
                          <li key={i} className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500 shrink-0" size={16} /> {req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                     <button 
                      onClick={(e) => handleApply(e, selectedJob)}
                      className="flex-1 bg-emerald-500 text-black py-4 rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      Apply for Campaign
                      <ArrowRight size={20} />
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
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((o) => (
              <motion.div 
                key={o.id}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedJob(o)}
                className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden group cursor-pointer"
              >
                <div className="h-48 relative">
                  <img src={o.image} alt={o.brand} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    {o.match} Match
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{o.brand}</h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest">{o.campaign}</p>
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
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{o.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Platform</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{o.platform}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => handleApply(e, o)}
                      className="flex-1 bg-emerald-500 text-black py-4 rounded-2xl font-bold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2"
                    >
                      Apply Now
                      <ArrowRight size={18} />
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
