import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useAdminNotifications } from '@/src/hooks/useAdminNotifications';
import type { AdminNotification } from '@/src/api/adminApi';

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'system', label: 'System' },
  { id: 'user_activity', label: 'User activity' },
  { id: 'payments', label: 'Payments' },
] as const;

type NotificationFilter = (typeof filterOptions)[number]['id'];

const READ_STORAGE_KEY = 'adminNotificationsRead';

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]));
}

export default function AdminNotificationsPage() {
  const { data, isLoading, isError, refetch } = useAdminNotifications();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());

  const notifications = useMemo(() => {
    const all = data?.notifications ?? [];
    const withRead = all.map((n) => ({
      ...n,
      read: n.read || readIds.has(n.id),
    }));
    return filter === 'all' ? withRead : withRead.filter((n) => n.category === filter);
  }, [data, filter, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const iconFor = (category: AdminNotification['category']) => {
    if (category === 'payments') return CreditCard;
    if (category === 'user_activity') return Info;
    return ShieldCheck;
  };

  const markRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set(readIds);
    (data?.notifications ?? []).forEach((n) => next.add(n.id));
    setReadIds(next);
    saveReadIds(next);
  };

  return (
    <AdminLayout>
      <div className="max-w-[1000px] mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">Notifications</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              Platform alerts from audit activity, wallet events, and user actions.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={16} /> Mark all as read
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === item.id
                  ? 'bg-[#14a800] text-white'
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
              <p className="text-sm font-bold text-red-600">Failed to load notifications</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 text-xs font-bold text-[#14a800] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notif, idx) => {
                const Icon = iconFor(notif.category);
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => markRead(notif.id)}
                    className={`flex gap-6 p-5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/5 ${
                      !notif.read ? 'bg-green-50/30 dark:bg-green-500/5' : ''
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.priority === 'high'
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                          : 'bg-green-50 dark:bg-green-500/10 text-[#14a800]'
                      } ${!notif.read ? 'ring-2 ring-green-500/20' : ''}`}
                    >
                      <Icon size={20} />
                    </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className="font-bold text-[#1A1D1F] dark:text-white">{notif.title}</h3>
                        <span className="text-[10px] font-bold text-[#9A9FA5] whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">
                        {notif.action}
                        {notif.targetType ? ` • ${notif.targetType}` : ''}
                        {notif.actorName ? ` • ${notif.actorName}` : ''}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-4xl flex items-center justify-center mx-auto mb-6">
                <Bell size={32} className="text-[#9A9FA5]" />
              </div>
              <h3 className="text-lg font-black text-[#1A1D1F] dark:text-white mb-2">All caught up</h3>
              <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
                No notifications match the current filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
