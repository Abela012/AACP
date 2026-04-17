import { motion } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  Activity,
  ArrowUpRight,
  UserCheck,
  Ban
} from 'lucide-react';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { cn } from '@/src/shared/utils/cn';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Users', value: '1,284', trend: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Verifications', value: '42', trend: 'High Priority', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'System Health', value: '99.9%', trend: 'Stable', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Campaigns', value: '312', trend: '+5%', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const recentActivities = [
    { type: 'user', title: 'New Advertiser registered', user: 'TechFlow Systems', time: '5m ago', icon: ArrowUpRight },
    { type: 'verification', title: 'Identity Verified', user: 'Sarah Jenkins', time: '12m ago', icon: UserCheck },
    { type: 'warning', title: 'Flagged Content detected', user: 'Unknown Campaign', time: '45m ago', icon: AlertCircle },
    { type: 'security', title: 'Unauthorized access attempt', user: 'System Watchdog', time: '1h ago', icon: Ban },
  ];

  return (
    <AdminLayout>
      <main className="p-4 sm:p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">System Console</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time oversight of the AACP marketplace.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{stat.trend}</span>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-white/5 pb-4">Live Activity Log</h3>
              <div className="space-y-6">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                        <activity.icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{activity.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{activity.user}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activity.time}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-gray-50 dark:bg-white/5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-white/10">
                View All System Logs
              </button>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-8">
            <div className="bg-black dark:bg-white p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-white dark:text-black font-bold mb-4">Security Overview</h3>
              <p className="text-white/60 dark:text-black/60 text-xs leading-relaxed mb-6">
                All firewalls are active. No critical vulnerabilities detected in the last 24 hours.
              </p>
              <div className="space-y-4">
                <div className="h-1.5 w-full bg-white/10 dark:bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white dark:bg-black w-[92%]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/40 dark:text-black/40 uppercase tracking-widest">
                  <span>Encryption Level</span>
                  <span>92% Higher Strength</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
