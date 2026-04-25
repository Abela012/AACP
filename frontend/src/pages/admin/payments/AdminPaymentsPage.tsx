import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  User,
  History,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useAdminWalletRequests, useApproveWalletRequest, useRejectWalletRequest } from '@/src/hooks/useAdminWallet';
import { cn } from '@/src/shared/utils/cn';

export default function AdminPaymentsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading, refetch } = useAdminWalletRequests({ 
    status: statusFilter === 'All' ? undefined : statusFilter,
    search: searchQuery || undefined
  });
  
  const approve = useApproveWalletRequest();
  const reject = useRejectWalletRequest();

  const handleApprove = async (id: string) => {
    if (window.confirm('Are you sure you want to approve this coin purchase? The user will be credited immediately.')) {
      try {
        await approve.mutateAsync(id);
      } catch (err) {
        console.error('Failed to approve:', err);
      }
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason !== null) {
      try {
        await reject.mutateAsync({ requestId: id, reason });
      } catch (err) {
        console.error('Failed to reject:', err);
      }
    }
  };

  const requests = data?.requests || [];

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/dashboard/admin')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Coin Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Verify and process coin purchase requests from platform users.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-center gap-2">
                <Clock className="text-blue-600 w-4 h-4" />
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{requests.filter((r: any) => r.status === 'PENDING').length} Pending</span>
             </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-[#111111] p-4 rounded-3xl border border-[#EFEFEF] dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by username, email, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-[#14a800] transition-all outline-none text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl">
            {['All', 'Pending', 'Completed', 'Failed'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  statusFilter === f 
                    ? "bg-white dark:bg-white/10 text-[#14a800] shadow-sm" 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Request Table */}
        <div className="bg-white dark:bg-[#111111] rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-[#EFEFEF] dark:border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">User / Account</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction Details</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Date</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF] dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-[#14a800] animate-spin" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Request Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="max-w-xs mx-auto space-y-4">
                         <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                           <History size={32} />
                         </div>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">No requests found</h3>
                         <p className="text-sm text-gray-500">No coin purchase requests match your current filters.</p>
                         <button
                            onClick={() => refetch()}
                            className="mt-4 px-6 py-2 bg-[#14a800] text-white rounded-xl text-xs font-bold"
                          >
                            Refresh
                          </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((request: any) => (
                    <tr key={request._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                            {request.avatar ? (
                              <img src={request.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="text-gray-400" size={24} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{request.user}</p>
                            <p className="text-[10px] font-bold text-[#14a800] uppercase tracking-widest mt-0.5">{request.role?.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{request.type}</p>
                          <p className="text-[10px] font-mono text-gray-400 font-medium">#{request._id.toString().slice(-8).toUpperCase()}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-gray-900 dark:text-white">{request.value}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(request.date).toLocaleDateString()}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{new Date(request.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase inline-block border",
                          request.status === 'PENDING' ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
                          request.status === 'COMPLETED' ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
                          "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                        )}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {request.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleApprove(request._id)}
                              disabled={approve.isPending}
                              className="p-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-[#14a800] hover:text-white rounded-xl transition-all disabled:opacity-50"
                              title="Approve Request"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleReject(request._id)}
                              disabled={reject.isPending}
                              className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all disabled:opacity-50"
                              title="Reject Request"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <MoreHorizontal size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <ShieldCheck size={20} />
                 </div>
                 <h3 className="font-bold">Security & Compliance</h3>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                All coin purchase requests are logged and audited. approving a request will immediately update the user's wallet balance and generate a non-reversible transaction record.
              </p>
           </div>
           
           <div className="bg-[#14a800] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
              <div className="relative z-10 flex items-center justify-between h-full">
                 <div>
                    <h3 className="font-bold mb-2">Need Help?</h3>
                    <p className="text-xs font-medium opacity-80 max-w-[200px]">Check the admin handbook for payment verification guidelines.</p>
                 </div>
                 <button className="bg-white text-[#14a800] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg group-hover:scale-105 transition-transform">
                    Handbook
                 </button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
