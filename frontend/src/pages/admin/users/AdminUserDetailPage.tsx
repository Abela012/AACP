import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Coins, 
  BarChart3, 
  History,
  Lock,
  Ban,
  Settings2,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  Zap,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/src/api/apiClient';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const { data: user, isLoading } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => api.get(`/admin/users/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: (newStatus: string) => api.put(`/admin/users/${id}/status`, { status: newStatus }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['adminUser', id] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      showToast(`User account status updated to ${vars}.`);
    },
    onError: () => {
      showToast('Failed to update status', 'error');
    }
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(newStatus);
  };

  const handleResetPassword = () => {
    showToast('Password reset instructions sent to user email.');
  };

  const handleEditPermissions = () => {
    showToast('Permission editor coming soon!');
  };
  const transactions = [
    { id: '#TX-99210-BC', type: 'Coin Deposit', amount: '+ 2,500 AACP', date: 'Oct 26, 2023', status: 'COMPLETED', typeColor: 'text-emerald-500', statusBg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' },
    { id: '#TX-99188-BC', type: 'Platform Fee', amount: '- 120 AACP', date: 'Oct 24, 2023', status: 'COMPLETED', typeColor: 'text-red-500', statusBg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' },
    { id: '#TX-99052-BC', type: 'Ad Buyback', amount: '+ 800 AACP', date: 'Oct 20, 2023', status: 'PROCESSING', typeColor: 'text-blue-500', statusBg: 'bg-green-100 dark:bg-green-500/20 text-green-600' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-6 mb-10">
          <Link to="/admin/users" className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center border border-[#EFEFEF] dark:border-white/10 hover:bg-gray-50 transition-all shadow-sm">
            <ArrowLeft size={20} className="text-[#6F767E]" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#1A1D1F] dark:text-white leading-none mb-1">User Profile</h1>
            <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">Viewing details for UID: {id || '8842-XJ92'}</p>
          </div>
        </div>

        {isLoading || !user ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-[#6F767E] dark:text-gray-400 font-bold">Loading user details...</p>
          </div>
        ) : (
          <>
            {/* Top Section: User Summary and Primary Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* User Info Card */}
          <div className="lg:col-span-8 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="relative shrink-0">
              <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-[#1A1A1A] shadow-lg flex items-center justify-center bg-gray-100">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.firstName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">{user.firstName?.[0] || user.username?.[0]}</span>
                )}
              </div>
              {user.status === 'active' && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-[#111111] flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-3xl font-black">{user.firstName} {user.lastName}</h2>
                <div className="flex gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 rounded">{user.role.replace('_', ' ')}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                    user.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' :
                    user.status === 'suspended' ? 'bg-red-100 dark:bg-red-500/20 text-red-600' :
                    'bg-amber-100 dark:bg-amber-500/20 text-amber-600'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400 mb-8 leading-relaxed max-w-xl">
                {user.profileData?.bio || 'No bio provided for this user.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1 block">Email Address</label>
                  <p className="text-xs font-bold truncate">{user.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1 block">Phone Number</label>
                  <p className="text-xs font-bold">{user.profileData?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1 block">Location</label>
                  <p className="text-xs font-bold">{user.profileData?.businessLocation || user.location || 'Remote'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Boxes */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <button 
              onClick={handleEditPermissions}
              className="flex-1 bg-[#14a800] hover:bg-[#108a00] text-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-lg shadow-green-100 dark:shadow-none transition-all group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Settings2 size={24} />
              </div>
              <span className="font-bold">Edit Permissions</span>
            </button>
            <div className="grid grid-cols-2 gap-6 flex-1">
              <button 
                onClick={handleResetPassword}
                className="bg-[#F0F0FA] dark:bg-white/5 hover:bg-[#E5E5F5] dark:hover:bg-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all p-4"
              >
                <History size={20} className="text-[#14a800]" />
                <span className="text-xs font-bold text-[#1A1D1F] dark:text-white">Reset PW</span>
              </button>

              {user.status === 'pending' ? (
                <button 
                  onClick={() => handleStatusChange('active')}
                  disabled={updateStatus.isPending}
                  className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all p-4 border border-emerald-100 dark:border-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">Approve</span>
                </button>
              ) : user.status === 'suspended' || user.status === 'banned' ? (
                <button 
                  onClick={() => handleStatusChange('active')}
                  disabled={updateStatus.isPending}
                  className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all p-4 border border-emerald-100 dark:border-emerald-500/20 disabled:opacity-50"
                >
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">Reinstate</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleStatusChange('suspended')}
                  disabled={updateStatus.isPending}
                  className="bg-[#FFF0F0] dark:bg-red-500/10 hover:bg-[#FFE5E5] dark:hover:bg-red-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all p-4 disabled:opacity-50"
                >
                  <Ban size={20} className="text-red-500" />
                  <span className="text-xs font-bold text-red-500">Suspend</span>
                </button>
              )}
            </div>
            
            {user.status === 'pending' && (
              <button 
                onClick={() => handleStatusChange('banned')}
                disabled={updateStatus.isPending}
                className="w-full py-4 bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500 rounded-2xl text-xs font-bold transition-all border border-red-100 dark:border-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle size={16} /> Reject Application
              </button>
            )}
          </div>
        </div>

        {/* Detailed Profile Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-12 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-extrabold text-xl">Full Profile Details</h3>
              <span className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                {user.role.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Common Fields */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Website / Portfolio</label>
                <p className="text-sm font-bold flex items-center gap-2">
                  <Globe size={14} className="text-indigo-500" />
                  {user.profileData?.website || 'Not provided'}
                </p>
              </div>

              {user.role === 'business_owner' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Business Name</label>
                    <p className="text-sm font-bold">{user.profileData?.businessName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Industry</label>
                    <p className="text-sm font-bold">{user.profileData?.industry || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Company Size</label>
                    <p className="text-sm font-bold">{user.profileData?.companySize || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Monthly Budget</label>
                    <p className="text-sm font-bold text-emerald-500">{user.profileData?.monthlyBudget || 'Not provided'}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">Target Audience Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {user.profileData?.targetAudienceTags?.map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 dark:border-indigo-500/20">
                          {tag}
                        </span>
                      )) || <span className="text-xs text-gray-400">None</span>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Followers</label>
                    <p className="text-sm font-bold">{user.profileData?.followers || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Avg Views</label>
                    <p className="text-sm font-bold">{user.profileData?.avgViews || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Base Rate</label>
                    <p className="text-sm font-bold text-emerald-500">${user.profileData?.baseRate || '0'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">Youtube Handle</label>
                    <p className="text-sm font-bold text-red-500">{user.profileData?.youtubeHandle || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block">TikTok Handle</label>
                    <p className="text-sm font-bold text-pink-500">{user.profileData?.tiktokHandle || 'N/A'}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">Content Styles</label>
                    <div className="flex flex-wrap gap-2">
                      {user.profileData?.selectedStyles?.map((style: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-[#14a800] rounded-lg text-[10px] font-bold border border-green-100 dark:border-green-500/20">
                          {style}
                        </span>
                      )) || <span className="text-xs text-gray-400">None</span>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Wallet Card */}
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-lg">Wallet & Earnings</h3>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center text-[#14a800]">
                <Coins size={18} />
              </div>
            </div>
            
            <div className="mb-10 text-center bg-[#F8F8FD] dark:bg-white/5 p-6 rounded-3xl">
              <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Available Coins</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-black">12,450</span>
                <span className="text-sm font-bold text-[#14a800] uppercase">AACP</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#6F767E] dark:text-gray-400">Total Spent</span>
                <span className="text-sm font-bold">$4,210.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#6F767E] dark:text-gray-400">Active Requests</span>
                <span className="text-sm font-bold text-amber-600">3 Pending</span>
              </div>
            </div>

            <button className="w-full py-4 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              View Ledger History
            </button>
          </div>

          {/* Activity Card */}
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-lg">Platform Activity</h3>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600">
                <BarChart3 size={18} />
              </div>
            </div>

            <div className="bg-[#F8F8FD] dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center text-[#14a800]">
                  <Zap size={14} fill="currentColor" />
                </div>
                <span className="text-xs font-bold">Campaign Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#14a800] w-[94%]" />
                </div>
                <span className="text-xs font-black">94%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-center">
                <span className="text-2xl font-black block mb-1">42</span>
                <span className="text-[10px] font-bold text-[#9A9FA5] uppercase">Active Ads</span>
              </div>
              <div className="p-6 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-center">
                <span className="text-2xl font-black block mb-1">156</span>
                <span className="text-[10px] font-bold text-[#9A9FA5] uppercase">Collaborators</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <CheckCircle2 size={16} fill="currentColor" className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">KYC Verification Complete</span>
            </div>
          </div>

          {/* Logs Card */}
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-extrabold text-lg">Recent Logs</h3>
              <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-[#9A9FA5]">
                <History size={18} />
              </div>
            </div>

            <div className="space-y-8 mb-8">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold leading-tight mb-0.5">Updated Campaign "Summer_AI"</p>
                  <p className="text-[10px] font-medium text-[#9A9FA5]">Today, 14:22 PM</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold leading-tight mb-0.5">Login from IP 192.168.1.1</p>
                  <p className="text-[10px] font-medium text-[#9A9FA5]">Yesterday, 09:15 AM</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold leading-tight mb-0.5">Withdrew 500 AACP Coins</p>
                  <p className="text-[10px] font-medium text-[#9A9FA5]">Oct 24, 2023</p>
                </div>
              </div>
            </div>

            <button className="w-full py-2 text-[#14a800] font-bold text-xs uppercase tracking-widest hover:underline">
              Full Activity Audit
            </button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h3 className="font-extrabold text-xl mb-1">Transaction History</h3>
              <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">Visual ledger of all financial movements for this account.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-3 bg-[#F4F4F4] dark:bg-white/5 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-all">Export CSV</button>
              <button className="px-6 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all">Filter</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#F4F4F4] dark:border-white/5">
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Reference ID</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Type</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Amount</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Date</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4">Status</th>
                  <th className="pb-6 text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F4] dark:divide-white/5">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="group hover:bg-[#F8F8FD] dark:hover:bg-white/5 transition-colors">
                    <td className="py-6 px-4 text-xs font-black">{tx.id}</td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0`}>
                           <ChevronRight size={10} className={tx.typeColor} />
                        </div>
                        <span className="text-xs font-bold">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-xs font-black">{tx.amount}</td>
                    <td className="py-6 px-4 text-xs font-medium text-[#6F767E] dark:text-gray-400">{tx.date}</td>
                    <td className="py-6 px-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${tx.statusBg} uppercase tracking-widest`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-[#9A9FA5] group-hover:text-[#14a800]">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' 
                ? 'bg-[#14a800] text-white border-green-400' 
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
