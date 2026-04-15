import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Rocket
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const campaigns = [
    { id: 1, title: 'Summer Collection Launch', status: 'Active', platform: 'TikTok', matches: 12, spent: '$1,200', date: 'Oct 24, 2024' },
    { id: 2, title: 'Holiday Gift Guide', status: 'Draft', platform: 'Instagram', matches: 0, spent: '$0', date: 'Oct 20, 2024' },
    { id: 3, title: 'Tech Review Series', status: 'Completed', platform: 'YouTube', matches: 24, spent: '$3,500', date: 'Sep 15, 2024' },
    { id: 4, title: 'Brand Awareness 2024', status: 'Active', platform: 'TikTok', matches: 8, spent: '$800', date: 'Oct 10, 2024' },
  ];

  const filteredCampaigns = campaigns.filter(c => {
    const matchesStatus = selectedStatus === 'All Status' || c.status === selectedStatus;
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower || 
                         c.title.toLowerCase().includes(searchLower) || 
                         c.platform.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  return (
    <BusinessLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Campaigns</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage and track all your creator collaboration opportunities.</p>
          </div>
          <Link 
            to="/campaign/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <Plus size={18} />
            New Campaign
          </Link>
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
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none text-sm dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">
              <Filter size={16} />
              Filter
            </button>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none bg-white dark:bg-white/5"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Draft</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 dark:border-white/5">
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Campaign Name</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Platform</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Matches</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Spent</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date Created</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{c.title}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          c.status === 'Active' ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" :
                          c.status === 'Draft' ? "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400" :
                          "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        )}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{c.platform}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{c.matches}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{c.spent}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{c.date}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <MoreVertical size={18} />
                        </button>
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
    </BusinessLayout>
  );
}
