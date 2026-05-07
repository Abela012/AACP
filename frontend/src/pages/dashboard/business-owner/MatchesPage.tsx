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
  Target
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useRecommendations } from '@/src/hooks/useRecommendations';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function MatchesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: recoData, isLoading } = useRecommendations();
  const recommendations = (recoData as any)?.recommendations || [];

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

  return (
    <BusinessLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">

        {/* Modal Overlay for Creator Details */}
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
                className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 z-10 flex flex-col max-h-[90vh]"
              >
                <div className="h-48 relative shrink-0">
                  <img 
                    src={selectedCreator.meta?.profilePicture || `https://ui-avatars.com/api/?name=${selectedCreator.name}&background=10b981&color=fff`} 
                    alt={selectedCreator.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <button onClick={() => setSelectedCreator(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-6 left-8">
                    <h2 className="text-3xl font-black text-white mb-1">{selectedCreator.name}</h2>
                    <p className="text-emerald-400 font-bold flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Verified Creator
                    </p>
                  </div>
                </div>
                
                <div className="p-8 overflow-y-auto">
                  <div className="flex flex-wrap gap-4 mb-8">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                      <Target size={16} />
                      {selectedCreator.category || 'Lifestyle'}
                    </span>
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                      <Users size={16} />
                      {selectedCreator.meta?.followers?.toLocaleString() || '10K+'} Followers
                    </span>
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                      <Star size={16} fill="currentColor" />
                      {selectedCreator.meta?.averageRating || '0.0'} ({selectedCreator.meta?.totalReviews || 0} reviews)
                    </span>
                    <span className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                      <MapPin size={16} />
                      {selectedCreator.location || 'Remote'}
                    </span>
                  </div>

                  <div className="space-y-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About Content Creator</h3>
                      <p>{selectedCreator.meta?.bio || "A passionate content creator focused on delivering high-quality visual stories and engaging community experiences."}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Primary Platforms</h3>
                      <div className="flex gap-2">
                        {selectedCreator.meta?.platforms?.map((p: string) => (
                           <span key={p} className="bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg font-bold text-xs">{p}</span>
                        )) || <span className="bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-lg font-bold text-xs">Instagram</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                     <button 
                      onClick={() => navigate('/messages', { state: { creator: selectedCreator } })}
                      className="flex-1 py-4 bg-emerald-500 text-black rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      Invite to Campaign
                      <ArrowRight size={20} />
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/users/${selectedCreator.targetId}`)}
                      className="w-14 h-14 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                    >
                      <ExternalLink size={20} />
                    </button>
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
          <div className="flex gap-3">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all border border-emerald-100 dark:border-emerald-500/20 disabled:opacity-50"
            >
              <Sparkles size={18} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? 'Syncing...' : 'Refine AI'}
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none mb-8 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, location or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm focus:border-emerald-500 outline-none text-sm transition-all"
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

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-24 text-center">
              <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Finding best matches...</p>
            </div>
          ) : filteredCreators.length > 0 ? (
            filteredCreators.map((c: any) => (
              <motion.div 
                key={c.targetId}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedCreator(c)}
                className="bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all overflow-hidden group cursor-pointer"
              >
                <div className="h-48 relative">
                  <img 
                    src={c.meta?.profilePicture || `https://ui-avatars.com/api/?name=${c.name}&background=10b981&color=fff`} 
                    alt={c.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 bg-emerald-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                    <Sparkles size={10} />
                    {c.score}% Match
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 line-clamp-1">{c.name}</h3>
                      <div className="flex gap-1 overflow-hidden">
                        {(c.meta?.niches || [c.category]).slice(0, 2).map((n: string) => (
                          <span key={n} className="text-[9px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {c.meta?.averageRating > 0 ? c.meta.averageRating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reach</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{c.meta?.followers?.toLocaleString() || '10K+'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-500">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Engagement</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{c.meta?.engagementRate || '4.5'}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/messages', { state: { creator: c } }); }}
                      className="flex-1 py-4 bg-emerald-500 text-black rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      Invite Now
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
