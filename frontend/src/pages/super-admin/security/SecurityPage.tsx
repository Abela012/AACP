import { motion } from 'framer-motion';
import { Loader2, Shield, ShieldCheck, AlertTriangle, Activity, Clock } from 'lucide-react';
import SuperAdminLayout from '@/src/shared/components/layouts/SuperAdminLayout';
import { useSecuritySummary } from '@/src/hooks/useSuperAdmin';

export default function SuperAdminSecurityPage() {
  const { data, isLoading, isError, refetch } = useSecuritySummary();

  const cards = [
    {
      label: 'Active Admins',
      value: data?.overview.activeAdmins ?? 0,
      icon: Shield,
      color: 'text-[#14a800]',
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-green-100 dark:border-green-500/20',
    },
    {
      label: 'Super Admins',
      value: data?.overview.superAdmins ?? 0,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-100 dark:border-emerald-500/20',
    },
    {
      label: 'Critical Events (7d)',
      value: data?.overview.criticalEvents7d ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-amber-100 dark:border-amber-500/20',
    },
    {
      label: 'Audit Events',
      value: data?.overview.auditEvents ?? 0,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-100 dark:border-blue-500/20',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Security Audit</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              Review platform security posture, access controls, and recent risk events.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all"
          >
            Refresh Status
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loader2 className="w-10 h-10 text-[#14a800] animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-white dark:bg-[#111111] p-10 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm text-center">
            <p className="font-bold">Failed to load security summary.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-[#111111] p-6 rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg} ${card.color} border ${card.border} mb-6`}>
                    <card.icon size={20} />
                  </div>
                  <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">{card.label}</p>
                  <span className="text-2xl font-black">{card.value}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-black mb-8">Security Controls</h3>
                <div className="space-y-5">
                  {data?.controls.map((control, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4 p-5 bg-[#FAFAFD] dark:bg-white/5 rounded-2xl border border-[#F0F0F5] dark:border-white/10">
                      <div>
                        <p className="text-sm font-black mb-1">{control.label}</p>
                        <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">{control.value}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          control.status === 'healthy'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600'
                        }`}
                      >
                        {control.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Clock className="text-[#14a800]" size={20} />
                  <h3 className="text-xl font-black">Recent Security Events</h3>
                </div>
                <div className="space-y-4">
                  {data?.recentLogs.length ? (
                    data.recentLogs.map((log, idx) => {
                      const actorName =
                        log.actor?.firstName || log.actor?.lastName
                          ? `${log.actor?.firstName ?? ''} ${log.actor?.lastName ?? ''}`.trim()
                          : log.actor?.username || log.actor?.email || 'Unknown';
                      return (
                        <motion.div
                          key={log._id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="p-5 bg-[#FAFAFD] dark:bg-white/5 rounded-2xl border border-[#F0F0F5] dark:border-white/10"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-black">{log.message || log.action}</p>
                              <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium mt-1">
                                {actorName} • {log.actorRole} • {log.targetType || 'system'}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-[#9A9FA5] whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">No recent security events found.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}

