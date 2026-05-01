import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, Settings2, ShieldCheck, Coins, KeyRound, Mail } from 'lucide-react';
import SuperAdminLayout from '@/src/shared/components/layouts/SuperAdminLayout';
import { usePlatformConfig, useUpdatePlatformConfig } from '@/src/hooks/useSuperAdmin';

export default function SuperAdminPlatformPage() {
  const { data, isLoading, isError, refetch } = usePlatformConfig();
  const updateConfig = useUpdatePlatformConfig();
  const [form, setForm] = useState({
    maintenanceMode: false,
    coinCostPostingAds: 50,
    coinCostApplicationFee: 10,
    globalCommissionRate: 12.5,
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    if (data) {
      setForm({
        maintenanceMode: data.maintenanceMode,
        coinCostPostingAds: data.coinCostPostingAds,
        coinCostApplicationFee: data.coinCostApplicationFee,
        globalCommissionRate: data.globalCommissionRate,
      });
    }
  }, [data]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync(form);
      showToast('Platform configuration saved');
    } catch {
      showToast('Failed to save configuration', 'error');
    }
  };

  const emailCards = data?.emailTemplates
    ? [
        data.emailTemplates.welcomeEmail,
        data.emailTemplates.adApproved,
        data.emailTemplates.passwordReset,
      ]
    : [];

  return (
    <SuperAdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">System Settings</h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              Manage platform economics, system controls, and integration visibility.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all"
            >
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={updateConfig.isPending}
              className="px-5 py-2.5 bg-[#14a800] text-white rounded-2xl text-xs font-bold hover:bg-[#108a00] transition-all shadow-lg shadow-green-100 dark:shadow-none flex items-center gap-2 disabled:opacity-60"
            >
              {updateConfig.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save All Configurations
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loader2 className="w-10 h-10 text-[#14a800] animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-white dark:bg-[#111111] p-10 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm text-center">
            <p className="font-bold">Failed to load platform settings.</p>
          </div>
        ) : (
          <>
            <div className="bg-[#F1FFF0] dark:bg-[#14a800]/10 p-8 rounded-[2.5rem] border border-green-100 dark:border-green-500/20 flex items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black mb-2">Maintenance Mode</h2>
                <p className="text-sm font-medium text-[#6F767E] dark:text-gray-300 max-w-2xl">
                  Suspend user transactions and public access to the platform for migrations or controlled upgrades.
                </p>
              </div>
              <button
                onClick={() => setForm(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                className={`w-28 h-14 rounded-2xl px-3 flex items-center justify-between transition-all ${
                  form.maintenanceMode ? 'bg-[#14a800] text-white' : 'bg-white text-[#6F767E]'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-widest">
                  {form.maintenanceMode ? 'Live' : 'Off'}
                </span>
                <div className={`w-8 h-8 rounded-xl ${form.maintenanceMode ? 'bg-white/20' : 'bg-[#ECECEC]'}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Coins className="text-[#14a800]" size={20} />
                  <h3 className="text-xl font-black">Platform Economics</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-3 block">Coin Cost: Posting Ads</label>
                    <input
                      type="number"
                      value={form.coinCostPostingAds}
                      onChange={(e) => setForm(prev => ({ ...prev, coinCostPostingAds: Number(e.target.value) }))}
                      className="w-full bg-[#F4F4F4] dark:bg-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-3 block">Coin Cost: Application Fee</label>
                    <input
                      type="number"
                      value={form.coinCostApplicationFee}
                      onChange={(e) => setForm(prev => ({ ...prev, coinCostApplicationFee: Number(e.target.value) }))}
                      className="w-full bg-[#F4F4F4] dark:bg-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-3 block">Global Commission (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.globalCommissionRate}
                      onChange={(e) => setForm(prev => ({ ...prev, globalCommissionRate: Number(e.target.value) }))}
                      className="w-full bg-[#F4F4F4] dark:bg-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-8">
                <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <KeyRound className="text-amber-600" size={20} />
                    <h3 className="text-xl font-black">Integration Keys</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-3 block">Chapa Secret Key</label>
                      <div className="w-full bg-[#F4F4F4] dark:bg-white/5 rounded-2xl px-5 py-4 text-sm font-bold">{data?.chapaSecretKeyMasked}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-3 block">Cloudinary API Environment Variable</label>
                      <div className="w-full bg-[#F4F4F4] dark:bg-white/5 rounded-2xl px-5 py-4 text-xs font-mono break-all">{data?.cloudinaryEnvironmentVariable}</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5 flex items-start gap-3">
                      <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
                      <div>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">API Health Check</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">All integrations are responding within normal latency parameters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111111] p-8 rounded-[2.5rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Mail className="text-[#14a800]" size={20} />
                  <h3 className="text-xl font-black">Email Templates</h3>
                </div>
                <button className="text-xs font-black text-[#14a800] uppercase tracking-widest">Create New Template</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {emailCards.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-[#FAFAFD] dark:bg-white/5 p-6 rounded-[2rem] border border-[#F0F0F5] dark:border-white/10"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center text-[#14a800] mb-5">
                      <Settings2 size={18} />
                    </div>
                    <h4 className="font-black mb-2">{item.title}</h4>
                    <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium leading-relaxed">{item.description}</p>
                    <p className="text-[10px] font-bold text-[#9A9FA5] mt-5">
                      Modified {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'recently'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

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
              <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SuperAdminLayout>
  );
}

