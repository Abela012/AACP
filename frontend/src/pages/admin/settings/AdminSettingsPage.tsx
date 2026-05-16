import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Settings,
  Shield,
  Database,
  Server,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import { useApiClient } from '@/src/api/apiClient';
import { adminApi } from '@/src/api/adminApi';

export default function AdminSettingsPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [supportContactEmail, setSupportContactEmail] = useState('');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const res = await adminApi.getSettings(api);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (!data?.settings) return;
    setMaintenanceMode(!!data.settings.maintenanceMode);
    setSupportContactEmail(data.settings.supportContactEmail || '');
  }, [data?.settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await adminApi.patchSettings(api, {
        maintenanceMode,
        supportContactEmail,
      });
      return res.data.data;
    },
    onSuccess: (payload) => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      if (payload?.settings) {
        setMaintenanceMode(payload.settings.maintenanceMode);
        setSupportContactEmail(payload.settings.supportContactEmail || '');
      }
      toast.success('Settings saved');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to save settings';
      toast.error(msg);
    },
  });

  const services = data?.services ?? [];
  const recentAudit = data?.recentAudit ?? [];

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">System Settings</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              Platform configuration and live connection status. Changes are stored in the database and recorded in the audit log.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || isLoading}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        {isError && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-300">
            {(error as any)?.response?.data?.message || (error as any)?.message || 'Could not load settings.'}
          </div>
        )}

        {/* Live service status (no fake CDN / CPU metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {isLoading ? (
            <div className="col-span-full h-32 rounded-4xl bg-white dark:bg-[#111111] border border-[#EFEFEF] dark:border-white/5 animate-pulse" />
          ) : (
            services.map((service, idx) => {
              const ok = service.status === 'operational';
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white dark:bg-[#111111] p-6 rounded-4xl border border-[#EFEFEF] dark:border-white/5 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        ok
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20'
                      }`}
                    >
                      {service.id === 'database' ? <Database size={20} /> : <Server size={20} />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {ok ? 'Operational' : 'Degraded'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#1A1D1F] dark:text-white mb-1">{service.name}</p>
                  <p className="text-xs text-[#6F767E] dark:text-gray-400 leading-relaxed">{service.detail}</p>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-5 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-extrabold text-lg text-[#1A1D1F] dark:text-white">Support contact</h3>
              <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-emerald-600">
                <Mail size={18} />
              </div>
            </div>
            <p className="text-xs text-[#6F767E] dark:text-gray-400 mb-4 leading-relaxed">
              Shown to admins and used in platform communications. Leave blank if not set.
            </p>
            <label className="text-[11px] font-bold text-[#6F767E] dark:text-gray-400 uppercase tracking-widest block mb-2">
              Email
            </label>
            <input
              type="email"
              value={supportContactEmail}
              onChange={(e) => setSupportContactEmail(e.target.value)}
              placeholder="support@yourdomain.com"
              className="w-full rounded-2xl border border-[#EFEFEF] dark:border-white/10 bg-[#F8F8FD] dark:bg-black/30 px-4 py-3 text-sm text-[#1A1D1F] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-extrabold text-lg text-[#1A1D1F] dark:text-white">Platform</h3>
              <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-[#9A9FA5]">
                <Settings size={18} />
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/10 transition-all">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-[#1A1D1F] dark:text-white">Maintenance mode</h4>
                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded">
                    Caution
                  </span>
                </div>
                <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">
                  When enabled, the public API returns 503 for most routes. Admin, super-admin, payments webhooks, and{' '}
                  <code className="text-[10px] bg-black/5 dark:bg-white/10 px-1 rounded">/health</code> stay available so you can turn this off again.
                </p>
              </div>
              <button
                type="button"
                aria-pressed={maintenanceMode}
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-14 h-7 rounded-full relative transition-all duration-200 shrink-0 ${
                  maintenanceMode ? 'bg-red-500' : 'bg-gray-200 dark:bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                    maintenanceMode ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Zap className="text-emerald-600" size={20} />
              <h3 className="font-extrabold text-lg text-[#1A1D1F] dark:text-white">Recent audit activity</h3>
            </div>
            <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-widest">Last 30 entries</span>
          </div>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-[#6F767E] dark:text-gray-400 text-center py-8">No audit entries yet.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {recentAudit.map((entry) => {
                const t = entry.action?.includes('WALLET')
                  ? 'warning'
                  : entry.action?.includes('SYSTEM') || entry.action?.includes('STATUS')
                    ? 'info'
                    : 'success';
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl hover:bg-white dark:hover:bg-white/[0.07] transition-all"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        t === 'success'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500'
                          : t === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-500'
                            : 'bg-blue-100 dark:bg-blue-500/20 text-blue-500'
                      }`}
                    >
                      {t === 'success' ? (
                        <CheckCircle2 size={16} />
                      ) : t === 'warning' ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <Shield size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-wider mb-0.5">{entry.action}</p>
                      <p className="text-sm font-bold text-[#1A1D1F] dark:text-white break-words">{entry.message}</p>
                      <p className="text-[11px] text-[#6F767E] dark:text-gray-500 mt-1">By {entry.actorName}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#9A9FA5] whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
