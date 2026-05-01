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
  Rocket,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useMyOpportunities } from '@/src/hooks/useOpportunities';
import { type Opportunity } from '@/src/api/opportunityApi';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { user: clerkUser } = useClerkUser();
  const myId = clerkUser?.id ?? '';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const { data: oppsData, isLoading } = useMyOpportunities(myId);
  const opportunities = oppsData?.opportunities ?? [];

  const filteredCampaigns = opportunities.filter((c: Opportunity) => {
    const statusMap: Record<string, string> = {
      'open': 'Active',
      'in_progress': 'In Progress',
      'closed': 'Completed'
    };
    const currentStatus = statusMap[c.status] || c.status;
    
    const matchesStatus = selectedStatus === 'All Status' || currentStatus === selectedStatus;
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower || 
                         c.title.toLowerCase().includes(searchLower) || 
                         c.category.toLowerCase().includes(searchLower);
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
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
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
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-600 dark:focus:border-emerald-500 outline-none text-sm dark:text-white"
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
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                ) : filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((c: Opportunity) => (
                    <tr 
                      key={c._id} 
                      onClick={() => navigate(`/campaign/${c._id}/applicants`)}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{c.title}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                           "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                           c.status === 'open' ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" :
                           c.status === 'in_progress' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                           "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        )}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{c.category}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{c.applicants?.length ?? 0}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ${(typeof c.budget === 'object' ? c.budget.amount : (c.budget || 0)).toLocaleString()}
                        </p>
                      </td>

                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
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
