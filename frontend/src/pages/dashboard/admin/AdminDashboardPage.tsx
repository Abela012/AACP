import { motion } from 'framer-motion';
import { 
  Users, 
  Coins, 
  BarChart3, 
  Shield, 
  Zap,
  Mail,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  History,
  ArrowRight,
  Activity
} from 'lucide-react';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStats } from '@/src/hooks/useAdminStats';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { userRole } = useUser();
  const { user: clerkUser } = useClerkUser();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();

  const permissions = [
    { 
      label: 'Users', 
      desc: 'Modify roles, approve accounts, and manage creator tiers.', 
      icon: Users,
      action: 'MANAGE',
      path: '/admin/users',
      bg: 'bg-green-100 dark:bg-green-500/10',
      color: 'text-[#14a800]'
    },
    { 
      label: 'Coin Requests', 
      desc: 'Full authority to verify, reject, or reverse transactions.', 
      icon: Coins,
      action: 'MANAGE',
      path: '/admin/payments',
      bg: 'bg-blue-100 dark:bg-blue-500/10',
      color: 'text-blue-600'
    },
    { 
      label: 'Disputes', 
      desc: 'Resolve platform disputes and manage three-way collaborations.', 
      icon: AlertCircle,
      action: 'RESOLVE',
      path: '/admin/disputes',
      bg: 'bg-amber-100 dark:bg-amber-500/10',
      color: 'text-amber-600'
    },
  ];

  const recentActivity = [
    { 
      type: 'payment', 
      title: 'Verified payment for #8923', 
      desc: 'Transaction ID: TXN_A812_CC • Amount: 50,000 Credits', 
      time: '2 hours ago',
      icon: CheckCircle2,
      color: 'border-green-500',
      iconBg: 'bg-green-100 dark:bg-green-500/20 text-green-600'
    },
    { 
      type: 'user', 
      title: 'Updated user status for @creator_one', 
      desc: 'Elevated status to \'Verified Creator\' after background check completion.', 
      time: '5 hours ago',
      icon: Users,
      color: 'border-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600'
    },
    { 
      type: 'alert', 
      title: 'Rejected Coin Request #7712', 
      desc: 'Reason: Duplicate invoice documentation provided. Notified user @brand_alpha.', 
      time: 'Yesterday',
      icon: AlertCircle,
      color: 'border-red-500',
      iconBg: 'bg-red-100 dark:bg-red-500/20 text-red-600'
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
        {/* Top Permissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">System Permissions</h2>
            <button 
              onClick={() => navigate('/admin/messages')}
              className="text-[#14a800] font-bold text-sm hover:underline"
            >
              Request Access Change
            </button>
          </div>
          {permissions.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(p.path)}
              className="bg-white dark:bg-[#111111] p-6 rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#14a800] transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.bg} ${p.color}`}>
                  <p.icon size={24} />
                </div>
                <button className="text-[10px] font-black tracking-widest bg-[#14a800] text-white px-3 py-1.5 rounded-lg group-hover:scale-105 transition-transform">
                  {p.action}
                </button>
              </div>
              <div>
                <h3 className="font-bold mb-2 group-hover:text-[#14a800] transition-colors">{p.label}</h3>
                <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Middle Section: Profile & Security & Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Platform Activity Insights */}
          <div className="lg:col-span-3 bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-black mb-6">Platform Insights</h3>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-[#14a800] animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-5 bg-green-50 dark:bg-green-500/5 rounded-[1.5rem] border border-green-100 dark:border-green-500/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-[#14a800] uppercase tracking-widest">Active Users</span>
                    <Activity size={14} className="text-[#14a800]" />
                  </div>
                  <p className="text-2xl font-black text-[#1A1D1F] dark:text-white">{(stats?.totalUsers || 0).toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-green-600 mt-1">Total registered users</p>
                </div>

                <div className="p-5 bg-blue-50 dark:bg-blue-500/5 rounded-[1.5rem] border border-blue-100 dark:border-blue-500/10 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navigate('/admin/payments')}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pending Coins</span>
                    <Coins size={14} className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-[#1A1D1F] dark:text-white">{stats?.pendingCoinRequests || 0}</p>
                  <p className="text-[10px] font-bold text-blue-400 mt-1">Requires urgent review</p>
                </div>

                <div className="p-5 bg-amber-50 dark:bg-amber-500/5 rounded-[1.5rem] border border-amber-100 dark:border-amber-500/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Verified Users</span>
                    <AlertCircle size={14} className="text-amber-600" />
                  </div>
                  <p className="text-2xl font-black text-[#1A1D1F] dark:text-white">{stats?.verifiedUsers || 0}</p>
                  <p className="text-[10px] font-bold text-amber-500 mt-1">Identity verified creators</p>
                </div>
              </div>
            )}
          </div>

          {/* Security & Efficiency */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Security Settings */}
            <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Shield className="text-[#14a800]" size={20} />
                <h3 className="font-bold">Security</h3>
              </div>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold mb-1">2-Factor Authentication</h4>
                    <p className="text-[10px] text-[#6F767E] dark:text-gray-400 font-medium whitespace-nowrap">Enabled • Authenticator App</p>
                  </div>
                  <div className="w-12 h-6 bg-[#14a800]/10 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-[#14a800] rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold mb-1">Password</h4>
                    <p className="text-[10px] text-[#6F767E] dark:text-gray-400 font-medium">Last changed 2 months ago</p>
                  </div>
                  <button className="text-xs font-bold border border-[#EFEFEF] dark:border-white/10 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                    Update
                  </button>
                </div>
                <p className="text-[10px] text-[#9A9FA5] italic pt-4">
                  Next mandatory password rotation in 32 days.
                </p>
              </div>
            </div>

            {/* Efficiency Pulse */}
            <div className="bg-[#14a800] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-bold mb-8">Efficiency Pulse</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest opacity-80">
                      <span>Task Completion Rate</span>
                      <span>98.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[98%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest opacity-80">
                      <span>Response Time</span>
                      <span>1.2m</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[65%]" />
                    </div>
                  </div>
                </div>
                <div className="mt-12">
                  <span className="text-4xl font-black">2.4k</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Actions logged this month</p>
                </div>
              </div>
              {/* Background Accent */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Activity */}
        <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <History className="text-[#9A9FA5]" size={20} />
              <h3 className="font-bold">Recent Activity</h3>
            </div>
            <button 
              onClick={() => navigate('/admin/logs')}
              className="flex items-center gap-2 text-xs font-bold border border-[#EFEFEF] dark:border-white/10 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all uppercase tracking-widest"
            >
              Full Log <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity, idx) => (
              <div 
                key={idx}
                className={`flex items-start gap-4 p-5 border-l-4 ${activity.color} bg-gray-50 dark:bg-white/5 rounded-r-2xl hover:bg-white dark:hover:bg-white/10 transition-all cursor-default relative overflow-hidden`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activity.iconBg}`}>
                  <activity.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-[#1A1D1F] dark:text-white truncate pr-4">{activity.title}</h4>
                    <span className="text-[10px] font-bold text-[#9A9FA5] whitespace-nowrap">{activity.time}</span>
                  </div>
                  <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium mt-1 leading-relaxed">
                    {activity.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
