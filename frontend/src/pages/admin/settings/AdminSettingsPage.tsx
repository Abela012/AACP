import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Shield,
  Database,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  UserPlus,
  Coins,
  Wrench,
  Activity,
  Lock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';
import AdminChangePasswordCard from '@/src/components/admin/AdminChangePasswordCard';
import { useApiClient } from '@/src/api/apiClient';
import { adminApi } from '@/src/api/adminApi';

type SettingsTab = 'account' | 'operations' | 'system' | 'activity';

const TABS: { id: SettingsTab; label: string; icon: typeof Lock }[] = [
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'operations', label: 'Operations', icon: Wrench },
  { id: 'system', label: 'System health', icon: Activity },
  { id: 'activity', label: 'Audit log', icon: Zap },
];

function Toggle({
  enabled,
  onChange,
  danger,
}: {
  enabled: boolean;
  onChange: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onChange}
      className={`w-14 h-7 rounded-full relative transition-all duration-200 shrink-0 ${
        enabled ? (danger ? 'bg-red-500' : 'bg-[#14a800]') : 'bg-gray-200 dark:bg-white/10'
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
          enabled ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  );
}

export default function AdminSettingsPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowPublicSignup, setAllowPublicSignup] = useState(true);
  const [newUserStartingCoins, setNewUserStartingCoins] = useState(1000);
  const [dirty, setDirty] = useState(false);

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
    setAllowPublicSignup(data.settings.allowPublicSignup !== false);
    setNewUserStartingCoins(data.settings.newUserStartingCoins ?? 1000);
    setDirty(false);
  }, [data?.settings]);

  const markDirty = () => setDirty(true);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await adminApi.patchSettings(api, {
        maintenanceMode,
        allowPublicSignup,
        newUserStartingCoins,
      });
      return res.data.data;
    },
    onSuccess: (payload) => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      if (payload?.settings) {
        setMaintenanceMode(payload.settings.maintenanceMode);
        setAllowPublicSignup(payload.settings.allowPublicSignup !== false);
        setNewUserStartingCoins(payload.settings.newUserStartingCoins ?? 1000);
      }
      setDirty(false);
      toast.success('Settings saved');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      const msg =
        axiosErr?.response?.data?.error ||
        axiosErr?.response?.data?.message ||
        'Failed to save settings';
      toast.error(msg);
    },
  });

  const services = data?.services ?? [];
  const recentAudit = data?.recentAudit ?? [];
  const showSaveBar = activeTab === 'operations' && dirty;

  return (
    <AdminLayout>
      <div className="max-w-[1200px] mx-auto pb-24">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14a800]/10 text-[#14a800] text-[10px] font-black uppercase tracking-widest mb-3">
              <Settings size={12} /> Admin
            </div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">Settings</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400 max-w-xl">
              Manage your account security, platform operations, and review system health and audit history.
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
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-300">
            {(error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
              ?.message ||
              (error as Error)?.message ||
              'Could not load settings.'}
          </div>
        )}

        <div className="flex flex-wrap gap-2 p-1.5 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl border border-[#EFEFEF] dark:border-white/5 mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === id
                  ? 'bg-white dark:bg-[#1a1a1a] text-[#1A1D1F] dark:text-white shadow-sm'
                  : 'text-[#6F767E] hover:text-[#1A1D1F] dark:hover:text-white'
              }`}
            >
              <Icon size={14} className={activeTab === id ? 'text-[#14a800]' : ''} />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'account' && (
              <div className="space-y-6">
                <AdminChangePasswordCard />
              </div>
            )}

            {activeTab === 'operations' && (
              <div className="space-y-6">
                <section className="bg-white dark:bg-[#111111] rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm p-8">
                  <h2 className="text-lg font-black text-[#1A1D1F] dark:text-white mb-1">Platform operations</h2>
                  <p className="text-xs text-[#6F767E] dark:text-gray-400 mb-8">
                    These settings are stored in the database and apply to new sign-ups and public API access.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-6 p-5 rounded-2xl bg-[#F8F8FD] dark:bg-white/5 border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/10 transition-all">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                          <Wrench size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-[#1A1D1F] dark:text-white">Maintenance mode</h3>
                            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded">
                              Caution
                            </span>
                          </div>
                          <p className="text-xs text-[#6F767E] dark:text-gray-400 leading-relaxed">
                            Returns 503 for most public routes. Admin, super-admin, webhooks, and{' '}
                            <code className="text-[10px] bg-black/5 dark:bg-white/10 px-1 rounded">/health</code>{' '}
                            stay available.
                          </p>
                        </div>
                      </div>
                      <Toggle
                        enabled={maintenanceMode}
                        danger
                        onChange={() => {
                          setMaintenanceMode(!maintenanceMode);
                          markDirty();
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-6 p-5 rounded-2xl bg-[#F8F8FD] dark:bg-white/5 border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/10 transition-all">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-[#14a800]/10 text-[#14a800] flex items-center justify-center shrink-0">
                          <UserPlus size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1A1D1F] dark:text-white mb-1">Public registration</h3>
                          <p className="text-xs text-[#6F767E] dark:text-gray-400 leading-relaxed">
                            When off, new users cannot complete account sync after signing in with Clerk.
                          </p>
                        </div>
                      </div>
                      <Toggle
                        enabled={allowPublicSignup}
                        onChange={() => {
                          setAllowPublicSignup(!allowPublicSignup);
                          markDirty();
                        }}
                      />
                    </div>

                    <div className="p-5 rounded-2xl bg-[#F8F8FD] dark:bg-white/5 border border-transparent hover:border-[#EFEFEF] dark:hover:border-white/10 transition-all">
                      <div className="flex gap-4 mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                          <Coins size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1A1D1F] dark:text-white mb-1">New user starting coins</h3>
                          <p className="text-xs text-[#6F767E] dark:text-gray-400 leading-relaxed">
                            Credited once when a new advertiser or business owner account is created (0–100,000).
                          </p>
                        </div>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={100000}
                        value={newUserStartingCoins}
                        onChange={(e) => {
                          setNewUserStartingCoins(Number(e.target.value));
                          markDirty();
                        }}
                        className="w-full max-w-xs rounded-2xl border border-[#EFEFEF] dark:border-white/10 bg-white dark:bg-black/30 px-4 py-3 text-sm font-bold text-[#1A1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14a800]/30"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {isLoading ? (
                  <div className="col-span-full h-32 rounded-[2rem] bg-white dark:bg-[#111111] border border-[#EFEFEF] dark:border-white/5 animate-pulse" />
                ) : (
                  services.map((service, idx) => {
                    const ok = service.status === 'operational';
                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="bg-white dark:bg-[#111111] p-6 rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm"
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
            )}

            {activeTab === 'activity' && (
              <section className="bg-white dark:bg-[#111111] p-8 rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <Zap className="text-[#14a800]" size={20} />
                    <h3 className="font-extrabold text-lg text-[#1A1D1F] dark:text-white">Recent audit activity</h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#9A9FA5] uppercase tracking-widest">Last 30 entries</span>
                </div>
                {recentAudit.length === 0 ? (
                  <p className="text-sm text-[#6F767E] dark:text-gray-400 text-center py-8">No audit entries yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
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
                            <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-wider mb-0.5">
                              {entry.action}
                            </p>
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
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showSaveBar && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-4 bg-[#1A1D1F] dark:bg-white text-white dark:text-[#1A1D1F] rounded-2xl shadow-2xl"
            >
              <span className="text-xs font-bold">Unsaved operation changes</span>
              <button
                type="button"
                onClick={() => {
                  if (data?.settings) {
                    setMaintenanceMode(!!data.settings.maintenanceMode);
                    setAllowPublicSignup(data.settings.allowPublicSignup !== false);
                    setNewUserStartingCoins(data.settings.newUserStartingCoins ?? 1000);
                  }
                  setDirty(false);
                }}
                className="text-xs font-bold opacity-70 hover:opacity-100"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
