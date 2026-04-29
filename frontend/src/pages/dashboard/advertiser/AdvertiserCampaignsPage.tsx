import { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useMyApplications } from '@/src/hooks/useApplications';

export default function AdvertiserCampaignsPage() {
  const { user: clerkUser } = useClerkUser();
  const myId = clerkUser?.id ?? '';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');

  const { data: appsData, isLoading } = useMyApplications(myId);
  // appsData is the direct array from the API success response
  const applications = Array.isArray(appsData) ? appsData : (appsData as any)?.applications ?? [];

  const filteredCampaigns = applications.filter((app: any) => {
    const statusMap: Record<string, string> = {
      'pending': 'Applied',
      'accepted': 'In Progress',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn'
    };
    const currentStatus = statusMap[app.status] || app.status;
    
    const matchesStatus = selectedStatus === 'All Status' || currentStatus === selectedStatus;
    // Platform isn't directly on application usually, but on opportunity. 
    // We'll assume opportunity has category or platform.
    const opp = typeof app.opportunity === 'object' ? app.opportunity : {};
    
    const matchesPlatform = selectedPlatform === 'All Platforms' || 
                           (opp.category && opp.category.includes(selectedPlatform));
                           
    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower || 
                         (opp.title && opp.title.toLowerCase().includes(searchLower)) || 
                         (opp.category && opp.category.toLowerCase().includes(searchLower));
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

        {/* Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                 <Loader2 size={16} className="animate-spin" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {applications.filter((a: any) => a.status === 'pending').length}
            </p>
            <p className="text-xs font-bold text-gray-400 mt-1">Applications awaiting brand review</p>
          </div>

          <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Accepted</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {applications.filter((a: any) => a.status === 'accepted').length}
            </p>
            <p className="text-xs font-bold text-gray-400 mt-1">Active collaborations in progress</p>
          </div>

          <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Rejected</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                 <XCircle size={16} />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {applications.filter((a: any) => a.status === 'rejected').length}
            </p>
            <p className="text-xs font-bold text-gray-400 mt-1">Declined opportunities</p>
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
              <option>Applied</option>
              <option>In Progress</option>
              <option>Rejected</option>
              <option>Withdrawn</option>
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
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Application Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Journey</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Budget</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Deadline</th>
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
                  filteredCampaigns.map((app: any) => {
                    const opp = typeof app.opportunity === 'object' ? app.opportunity : {};
                    const owner = opp.businessOwner && typeof opp.businessOwner === 'object' ? `${opp.businessOwner.firstName} ${opp.businessOwner.lastName}` : 'Direct Brand';
                    const progress = app.status === 'accepted' ? 75 : app.status === 'pending' ? 10 : app.status === 'rejected' ? 0 : 100;
                    
                    return (
                      <tr key={app._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-500 transition-colors">{opp.title || 'Untitled Campaign'}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{owner}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            app.status === 'accepted' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                            app.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            app.status === 'rejected' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" :
                            "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                          )}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{opp.category || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="w-24">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-gray-900 dark:text-white">{progress}%</span>
                            </div>
                            <div className="h-1 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-500" 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">${opp?.budget?.amount?.toLocaleString() || '0'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{opp?.deadline ? new Date(opp.deadline).toLocaleDateString() : 'No Deadline'}</p>
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
                    );
                  })
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
