import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';

export default function AdvertiserCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');

  const campaigns = [
    { id: 1, title: 'Summer Collection Review', brand: 'Global Tech Corp', status: 'In Progress', platform: 'TikTok', progress: 75, earnings: '$800', deadline: 'Oct 28, 2024' },
    { id: 2, title: 'Holiday Gift Guide Feature', brand: 'Creative Studio', status: 'Pending Brief', platform: 'Instagram', progress: 10, earnings: '$1,200', deadline: 'Nov 15, 2024' },
    { id: 3, title: 'Tech Review Series', brand: 'NexGen Retail', status: 'Completed', platform: 'YouTube', progress: 100, earnings: '$2,500', deadline: 'Sep 15, 2024' },
    { id: 4, title: 'Brand Awareness 2024', brand: 'EcoStyle', status: 'In Progress', platform: 'TikTok', progress: 40, earnings: '$500', deadline: 'Oct 30, 2024' },
    { id: 5, title: 'AI Workstation Launch Campaign', brand: 'Global Tech Corp', status: 'Applied', platform: 'TikTok', progress: 0, earnings: '$2,500 - $5,000', deadline: 'Pending Review' },
  ];

  const [allCampaigns, setAllCampaigns] = useState(campaigns);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('appliedJobs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAllCampaigns([...campaigns, ...parsed]);
      }
    } catch (e) {
      console.error('Failed to parse applied jobs', e);
    }
  }, []);

  const filteredCampaigns = allCampaigns.filter(c => {
    const matchesStatus = selectedStatus === 'All Status' || c.status === selectedStatus;
    const matchesPlatform = selectedPlatform === 'All Platforms' || c.platform === selectedPlatform;
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower || 
                         c.title.toLowerCase().includes(searchLower) || 
                         c.brand.toLowerCase().includes(searchLower) ||
                         c.platform.toLowerCase().includes(searchLower);
    return matchesStatus && matchesPlatform && matchesSearch;
  });

  return (
    <AdvertiserLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Campaigns</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Track your active collaborations and manage your deliverables.</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none mb-8 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none text-sm dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
              <Filter size={16} />
              Filter
            </button>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none bg-white dark:bg-white/5"
            >
              <option>All Status</option>
              <option>In Progress</option>
              <option>Pending Brief</option>
              <option>Applied</option>
              <option>Completed</option>
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

        {/* Campaigns Table */}
        <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 dark:border-white/5">
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Campaign & Brand</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Platform</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Progress</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Earnings</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Deadline</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-500 transition-colors">{c.title}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{c.brand}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          c.status === 'In Progress' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                          c.status === 'Pending Brief' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          c.status === 'Applied' ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                          "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                        )}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{c.platform}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="w-24">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-gray-900 dark:text-white">{c.progress}%</span>
                          </div>
                          <div className="h-1 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500" 
                              style={{ width: `${c.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{c.earnings}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{c.deadline}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to="/messages" className="p-2 text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors">
                            <MessageSquare size={18} />
                          </Link>
                          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-400 dark:text-gray-500 w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">No campaigns found</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdvertiserLayout>
  );
}
