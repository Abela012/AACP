import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Coins, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  UserPlus,
  UserCheck,
  Calendar,
  Globe,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useAdminStats, parseRoleBreakdown } from '@/src/hooks/useAdminStats';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('1M');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const { data: stats, isLoading, isError } = useAdminStats();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleExport = (format: string) => {
    showToast(`Generating ${format} report...`);
    setShowExportMenu(false);
  };

  // Derive display values from real API data
  const totalUsers = stats?.totalUsers ?? 0;
  const recentUsers = stats?.recentUsers ?? 0;
  const verifiedUsers = stats?.verifiedUsers ?? 0;
  const suspendedUsers = stats?.suspendedUsers ?? 0;
  const roleBreakdown = stats?.byRole ? parseRoleBreakdown(stats.byRole, totalUsers) : [];

  // Overview stat cards driven by real data
  const overviewStats = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: recentUsers > 0 ? `+${recentUsers} this month` : 'No new users',
      up: recentUsers > 0,
      icon: Users,
      bg: 'bg-green-50 dark:bg-green-500/10',
      iconColor: 'text-[#14a800]',
      border: 'border-green-100 dark:border-green-500/20',
    },
    {
      label: 'Verified Users',
      value: verifiedUsers.toLocaleString(),
      change: totalUsers > 0 ? `${Math.round((verifiedUsers / totalUsers) * 100)}% of total` : '0%',
      up: true,
      icon: ShieldCheck,
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      iconColor: 'text-blue-600',
      border: 'border-blue-100 dark:border-blue-500/20',
    },
    {
      label: 'New This Month',
      value: recentUsers.toLocaleString(),
      change: recentUsers > 0 ? 'Recent growth' : 'No new signups',
      up: recentUsers > 0,
      icon: TrendingUp,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-100 dark:border-emerald-500/20',
    },
    {
      label: 'Suspended',
      value: suspendedUsers.toLocaleString(),
      change: suspendedUsers === 0 ? 'All accounts healthy' : 'Requires attention',
      up: suspendedUsers === 0,
      icon: Activity,
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      iconColor: 'text-amber-600',
      border: 'border-amber-100 dark:border-amber-500/20',
    },
  ];

  // Registration breakdown from role data
  const registrationStats = [
    { period: 'Total Users', count: totalUsers, icon: UserPlus },
    { period: 'Verified', count: verifiedUsers, icon: UserCheck },
    { period: 'New (30d)', count: recentUsers, icon: Calendar },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 size={48} className="text-[#14a800] animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-[#6F767E]">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">Platform Analytics</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              {isError ? 'Could not load live data — showing partial view.' : 'Live overview of platform performance and user metrics.'}
            </p>
          </div>
          <div className="flex gap-3 relative">
            <div className="flex gap-2 bg-[#F4F4F4] dark:bg-white/5 p-1 rounded-2xl">
              {['1M', '3M', '1Y'].map((range) => (
                <button
                  key={range}
                  onClick={() => { setTimeRange(range); showToast(`Range set to ${range}`); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    timeRange === range ? 'bg-white dark:bg-white/10 shadow-sm text-[#14a800]' : 'text-[#6F767E] hover:text-[#1A1D1F]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-5 py-2.5 bg-[#14a800] text-white rounded-2xl text-xs font-bold hover:bg-[#108a00] transition-all shadow-lg shadow-green-100 dark:shadow-none flex items-center gap-2"
              >
                <Download size={14} /> Export Report
              </button>
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-2xl border border-[#EFEFEF] dark:border-white/10 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {[
                        { label: 'Portable Document (PDF)', format: 'PDF', icon: '📄' },
                        { label: 'Spreadsheet (CSV)', format: 'CSV', icon: '📊' },
                        { label: 'Excel Workbook (XLSX)', format: 'Excel', icon: '📑' },
                      ].map((item) => (
                        <button
                          key={item.format}
                          onClick={() => handleExport(item.format)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all text-left"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-[#1A1D1F] dark:text-white leading-none mb-1">{item.format}</p>
                            <p className="text-[10px] text-[#6F767E] font-medium leading-none">{item.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {isError && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Could not fetch live data from the API. Ensure the backend is running at {import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}.
            </p>
          </div>
        )}

        {/* Overview Stats — Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {overviewStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white dark:bg-[#111111] p-6 rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.iconColor} border ${stat.border}`}>
                  <stat.icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span className="max-w-[80px] text-right leading-tight">{stat.change}</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1">{stat.label}</p>
              <span className="text-2xl font-black">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Role Distribution — Real Data */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <h3 className="font-extrabold text-lg mb-8">Role Distribution</h3>

            {/* Donut chart */}
            <div className="relative w-40 h-40 mx-auto mb-10">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {roleBreakdown.reduce((acc, role, idx) => {
                  const offset = acc.offset;
                  acc.elements.push(
                    <circle
                      key={idx}
                      cx="18" cy="18" r="14"
                      fill="none"
                      stroke={role.color}
                      strokeWidth="4"
                      strokeDasharray={`${role.percentage * 0.88} ${88 - role.percentage * 0.88}`}
                      strokeDashoffset={-offset}
                      className="transition-all duration-500"
                    />
                  );
                  acc.offset += role.percentage * 0.88;
                  return acc;
                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-black block">{totalUsers.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-[#9A9FA5] uppercase">Total</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {roleBreakdown.length > 0 ? (
                roleBreakdown.map((role, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                      <span className="text-xs font-bold">{role.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[#9A9FA5]">{role.count.toLocaleString()}</span>
                      <span className="text-xs font-black">{role.percentage}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#9A9FA5] text-center">No role data available</p>
              )}
            </div>
          </div>

          {/* Registration Stats — Real Data */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <h3 className="font-extrabold text-lg mb-8">Registrations</h3>
              <div className="space-y-6">
                {registrationStats.map((signup, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center text-[#14a800]">
                        <signup.icon size={18} />
                      </div>
                      <span className="text-xs font-bold">{signup.period}</span>
                    </div>
                    <span className="text-lg font-black">{signup.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="lg:col-span-4 bg-[#14a800] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold mb-2">Platform Health</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-8">Live Status</p>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest opacity-80">
                    <span>Verification Rate</span>
                    <span>{totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-white"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest opacity-80">
                    <span>Account Health</span>
                    <span>{totalUsers > 0 ? Math.round(((totalUsers - suspendedUsers) / totalUsers) * 100) : 100}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalUsers > 0 ? ((totalUsers - suspendedUsers) / totalUsers) * 100 : 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <span className="text-4xl font-black">{(totalUsers - suspendedUsers).toLocaleString()}</span>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Active Accounts</p>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-[#14a800] text-white border-green-400' : 'bg-red-500 text-white border-red-400'
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
