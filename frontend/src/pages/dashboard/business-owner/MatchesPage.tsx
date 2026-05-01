import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Users, 
  Search, 
  Filter, 
  Star, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

import { useBusinessOwnerApplications } from '@/src/hooks/useApplications';

export default function MatchesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');

  const { data: applicationsData, isLoading } = useBusinessOwnerApplications();
  const matches = applicationsData || [];

  const filteredMatches = matches.filter((app: any) => {
    const opp = app.opportunity || {};
    const adv = app.advertiser || {};
    
    // We assume the advertiser matches the platforms required by the opportunity for now, or we can check opp platforms
    const matchPlatform = opp.platforms?.[0] || 'Unknown';
    const matchesPlatform = selectedPlatform === 'All Platforms' || opp.platforms?.includes(selectedPlatform);
    
    const searchLower = searchQuery.trim().toLowerCase();
    const fullName = `${adv.firstName || ''} ${adv.lastName || ''}`.toLowerCase();
    const matchesSearch = !searchLower || 
                         fullName.includes(searchLower) || 
                         (opp.category && opp.category.toLowerCase().includes(searchLower)) ||
                         (opp.title && opp.title.toLowerCase().includes(searchLower));
    return matchesPlatform && matchesSearch;
  });

  return (
    <BusinessLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Creator Matches</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Our AI has identified the best creators for your active campaigns.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
              <Sparkles size={18} />
              Refine AI
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none mb-8 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search creators..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-600 dark:focus:border-emerald-500 outline-none text-sm dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">
              <Filter size={16} />
              Category
            </button>
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
              <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-500">Loading applicants...</p>
            </div>
          ) : filteredMatches.length > 0 ? (
            filteredMatches.map((app: any) => {
              const opp = app.opportunity || {};
              const adv = app.advertiser || {};
              const fullName = `${adv.firstName || ''} ${adv.lastName || ''}`;
              
              return (
              <motion.div 
                key={app._id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden group"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-emerald-50 dark:border-emerald-900/20">
                        <img 
                          src={adv.profilePicture || `https://ui-avatars.com/api/?name=${fullName}&background=10b981&color=fff`} 
                          alt={fullName} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl shadow-lg">
                        <CheckCircle2 size={14} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-2">
                        {app.status === 'accepted' ? 'Hired' : app.status === 'rejected' ? 'Rejected' : 'Applicant'}
                      </div>
                      <div className="flex items-center gap-1 justify-end text-amber-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{app.aiMatchScore || '4.9'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{fullName}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-4">Applied for: {opp.title || 'Unknown Campaign'}</p>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{app.status}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100 dark:bg-white/10" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Platform</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{opp.platforms?.[0] || 'Any'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link to="/messages" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2">
                      <MessageCircle size={18} />
                      Message
                    </Link>
                    <button className="w-14 h-14 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">
                      <CheckCircle2 size={20} />
                    </button>
                    <button className="w-14 h-14 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )})
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400 dark:text-gray-500 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No creators found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>
    </BusinessLayout>
  );
}
