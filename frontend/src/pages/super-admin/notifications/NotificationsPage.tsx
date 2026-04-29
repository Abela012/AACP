import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, Info } from 'lucide-react';
import SuperAdminLayout from '@/src/shared/components/layouts/SuperAdminLayout';
import { useSuperAdminNotifications } from '@/src/hooks/useSuperAdmin';

export default function SuperAdminNotificationsPage() {
  const { data, isLoading, isError, refetch } = useSuperAdminNotifications();
  const [filter, setFilter] = useState<'all' | 'system' | 'user_activity' | 'payments'>('all');

  const notifications = useMemo(() => {
    const all = data?.notifications ?? [];
    return filter === 'all' ? all : all.filter(n => n.category === filter);
  }, [data, filter]);

  const iconFor = (category: string) => {
    if (category === 'payments') return CreditCard;
    if (category === 'user_activity') return Info;
    return ShieldCheck;
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-[1100px] mx-auto pb-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Notification Center</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              Manage platform alerts, user activity, and financial events from a unified layer.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'system', label: 'System' },
            { id: 'user_activity', label: 'User Activity' },
            { id: 'payments', label: 'Payments' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                filter === item.id
                  ? 'bg-[#14a800] text-white shadow-lg shadow-green-100 dark:shadow-none'
                  : 'bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 text-[#6F767E]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
          {isLoading ? (
            <div className="py-20 text-center">
              <Bell className="w-10 h-10 text-[#14a800] mx-auto mb-4 animate-pulse" />
              <p className="text-sm font-bold text-[#6F767E]">Loading notifications...</p>
            </div>
          ) : isError ? (
            <div className="py-20 text-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <p className="text-sm font-bold">Failed to load notifications</p>
            </div>
          ) : notifications.length ? (
            <div className="space-y-4">
              {notifications.map((notif, idx) => {
                const Icon = iconFor(notif.category);
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex gap-6 p-5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/5"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.priority === 'high'
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                        : 'bg-green-50 dark:bg-green-500/10 text-[#14a800]'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-[#1A1D1F] dark:text-white">{notif.title}</h3>
                        <span className="text-[10px] font-bold text-[#9A9FA5] whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">
                        {notif.action} {notif.targetType ? `• ${notif.targetType}` : ''}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-[#9A9FA5]" />
              </div>
              <h3 className="text-lg font-black mb-2">All Caught Up</h3>
              <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">No notifications match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}

