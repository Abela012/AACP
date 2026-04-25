import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, Mail, Info } from 'lucide-react';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleMarkAllRead = () => {
    setNotifications([]);
  };

  const handleMarkRead = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AdminLayout>
      <div className="max-w-[1000px] mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">Notifications</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">View and manage your system alerts and notifications.</p>
          </div>
          <button 
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
            className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> Mark all as read
          </button>
        </div>

        <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleMarkRead(notif.id)}
                  className={`flex gap-6 p-5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/5 ${
                    !notif.read ? 'bg-green-50/30 dark:bg-green-500/5' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notif.bg} ${notif.color} ${!notif.read ? 'ring-2 ring-green-500/20' : ''}`}>
                    <notif.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-[#1A1D1F] dark:text-white">{notif.title}</h3>
                      <span className="text-[10px] font-bold text-[#9A9FA5] whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-sm text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">{notif.desc}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Bell size={32} className="text-[#9A9FA5]" />
                </div>
                <h3 className="text-lg font-black text-[#1A1D1F] dark:text-white mb-2">All Caught Up!</h3>
                <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">You have no new notifications at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
