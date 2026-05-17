import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Share2, 
  Eye, 
  ThumbsUp, 
  MessageCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  Target,
  CheckCircle2,
  PieChart,
  DollarSign
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color, trend }) => (
  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

export const AnalyticsDashboard: React.FC<any> = ({ analytics, budget, onRefresh, onSubmitUrl }) => {
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [urlData, setUrlData] = useState({ url: '', platform: 'TikTok' });

  // Mock aggregates if analytics exist
  const totalViews = analytics?.reduce((acc: number, curr: any) => acc + curr.metrics.views, 0) || 0;
  const totalLikes = analytics?.reduce((acc: number, curr: any) => acc + curr.metrics.likes, 0) || 0;
  const totalEngagement = analytics?.length > 0 ? (totalLikes / (totalViews || 1) * 100).toFixed(1) : 0;
  const cpv = budget > 0 && totalViews > 0 ? (budget / totalViews).toFixed(2) : '0.00';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
          <p className="text-sm text-gray-500">Live campaign tracking and ROI metrics</p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={onRefresh}
             className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-gray-400 hover:text-emerald-500 transition-all"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => setIsAddingUrl(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all shadow-lg text-sm"
          >
            <Plus size={18} />
            Submit Post Link
          </button>
        </div>
      </div>

      {analytics?.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5">
           <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <TrendingUp className="text-gray-200" size={40} />
           </div>
           <h3 className="text-xl font-black text-gray-900 dark:text-white">No Analytics Found</h3>
           <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 mb-8">
             Submit a published post URL to start tracking views, engagement, and campaign performance.
           </p>
           <button 
            onClick={() => setIsAddingUrl(true)}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
           >
             Connect First Post
           </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Total Views" value={totalViews.toLocaleString()} icon={<Eye size={20} className="text-blue-500" />} color="bg-blue-500/10" trend="+12%" />
            <MetricCard label="Total Likes" value={totalLikes.toLocaleString()} icon={<ThumbsUp size={20} className="text-emerald-500" />} color="bg-emerald-500/10" />
            <MetricCard label="Engagement" value={`${totalEngagement}%`} icon={<TrendingUp size={20} className="text-amber-500" />} color="bg-amber-500/10" trend="High" />
            <MetricCard label="Cost Per View" value={`${cpv} ETB`} icon={<DollarSign size={20} className="text-purple-500" />} color="bg-purple-500/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-black text-gray-900 dark:text-white">Published Content</h3>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking {analytics.length} Posts</span>
                </div>
                
                <div className="space-y-4">
                   {analytics.map((post: any) => (
                     <div key={post.id} className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/10">
                              <Target size={24} className="text-emerald-500" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {post.platform} Post 
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(post.createdAt).toLocaleDateString()}</span>
                              </p>
                              <a href={post.postUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-0.5">
                                 View Post <ExternalLink size={10} />
                              </a>
                           </div>
                        </div>
                        <div className="flex items-center gap-6 pr-4">
                           <div className="text-center">
                              <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Views</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{post.metrics.views.toLocaleString()}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Likes</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{post.metrics.likes.toLocaleString()}</p>
                           </div>
                           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                              <CheckCircle2 size={16} />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                   <Target size={20} /> ROI Overview
                </h3>
                <div className="space-y-6">
                   <div className="p-4 bg-white/10 rounded-2xl">
                      <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Ad Spend Efficiency</p>
                      <p className="text-xl font-black">2.4x <span className="text-xs font-bold opacity-70">Target</span></p>
                   </div>
                   <div className="p-4 bg-white/10 rounded-2xl">
                      <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Estimated Reach</p>
                      <p className="text-xl font-black">{ (totalViews * 1.2).toLocaleString() } <span className="text-xs font-bold opacity-70">Total</span></p>
                   </div>
                   <div className="pt-4 border-t border-white/10">
                      <p className="text-xs font-medium text-white/80 leading-relaxed italic">
                        "Your campaign is currently outperforming the category average by 18% in engagement rate."
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </>
      )}

      {/* Add URL Modal */}
      <AnimatePresence>
        {isAddingUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/10"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Submit Post Link</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Select Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['TikTok', 'Instagram', 'YouTube'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setUrlData({...urlData, platform: p})}
                        className={cn(
                          "py-3 rounded-xl text-xs font-bold border transition-all",
                          urlData.platform === p 
                            ? "bg-emerald-600 border-emerald-600 text-white" 
                            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-500"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Post URL</label>
                  <input 
                    type="url" 
                    placeholder="https://..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    value={urlData.url}
                    onChange={(e) => setUrlData({...urlData, url: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsAddingUrl(false)}
                    className="flex-1 py-3 border border-gray-100 dark:border-white/10 text-gray-500 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onSubmitUrl(urlData);
                      setIsAddingUrl(false);
                      setUrlData({ url: '', platform: 'TikTok' });
                    }}
                    disabled={!urlData.url}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Connect Post
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
