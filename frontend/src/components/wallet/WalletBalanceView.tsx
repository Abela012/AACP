import { useNavigate } from 'react-router-dom';
import {
  Plus,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Loader2,
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import {
  useFinalizeChapaTopupOnReturn,
  useWalletBalance,
  useWalletHistory,
  useChapaPaymentReceipt,
} from '@/src/hooks/useWallet';
import { COIN_PACK_LIST, formatBirr } from '@/src/shared/constants/coinPacks';
import ChapaPaymentReceiptBanner from './ChapaPaymentReceiptBanner';

type WalletBalanceViewProps = {
  buyCoinsPath: string;
  subtitle: string;
};

export default function WalletBalanceView({ buyCoinsPath, subtitle }: WalletBalanceViewProps) {
  const navigate = useNavigate();
  useFinalizeChapaTopupOnReturn();
  const { receipt, dismissReceipt } = useChapaPaymentReceipt();
  const { data: balanceData, isLoading: balanceLoading } = useWalletBalance();
  const { data: txHistoryData, isLoading: historyLoading } = useWalletHistory();

  const availableBalance = balanceData?.availableBalance ?? balanceData?.balance ?? 0;
  const totalSpent =
    txHistoryData
      ?.filter((t: { type: string }) => t.type === 'debit')
      .reduce((acc: number, t: { amount: number }) => acc + t.amount, 0) ?? 0;
  const totalReceived =
    txHistoryData
      ?.filter((t: { type: string }) => t.type === 'credit')
      .reduce((acc: number, t: { amount: number }) => acc + t.amount, 0) ?? 0;

  const isLoading = balanceLoading || historyLoading;

  const coinPackages = COIN_PACK_LIST.map((p) => ({
    id: p.id,
    name: `${p.title} pack`,
    coins: p.coins,
    priceLabel: formatBirr(p.priceEtb),
    popular: p.popular,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Coin Balance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(buyCoinsPath)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
        >
          <Plus size={18} />
          Buy coins
        </button>
      </div>

      {receipt && <ChapaPaymentReceiptBanner receipt={receipt} onDismiss={dismissReceipt} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-emerald-600 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-emerald-100 dark:shadow-none">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">
                    Available balance
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full" />
                    <h2 className="text-5xl font-bold">{availableBalance.toLocaleString()} coins</h2>
                  </div>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Zap className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="flex gap-10">
                <div>
                  <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Total received
                  </p>
                  <p className="text-xl font-bold">{totalReceived.toLocaleString()} coins</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Total spent
                  </p>
                  <p className="text-xl font-bold">{totalSpent.toLocaleString()} coins</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full -ml-24 -mb-24 blur-3xl" />
          </div>

          <section>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <History className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaction history</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {isLoading ? (
                  <div className="p-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : txHistoryData?.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">No transactions yet. Buy coins to get started.</p>
                  </div>
                ) : (
                  txHistoryData?.map(
                    (t: {
                      _id: string;
                      type: string;
                      description: string;
                      createdAt: string;
                      amount: number;
                      status: string;
                    }) => (
                      <div
                        key={t._id}
                        className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              t.type === 'debit'
                                ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                                : 'bg-green-50 dark:bg-green-500/10 text-green-500'
                            )}
                          >
                            {t.type === 'debit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{t.description}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              'text-sm font-bold',
                              t.type === 'debit' ? 'text-red-500' : 'text-green-500'
                            )}
                          >
                            {t.type === 'debit' ? '-' : '+'}
                            {t.amount.toLocaleString()} coins
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                            {t.status}
                          </p>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Coin packages</h3>
            <div className="space-y-4">
              {coinPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={cn(
                    'p-6 rounded-3xl border-2 transition-all',
                    pkg.popular
                      ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/20'
                      : 'border-gray-50 dark:border-white/5'
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{pkg.name}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-orange-400 rounded-full" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {pkg.coins.toLocaleString()} coins
                        </span>
                      </div>
                    </div>
                    {pkg.popular && (
                      <span className="bg-emerald-600 text-white text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {pkg.priceLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(buyCoinsPath)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all',
                        pkg.popular
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-emerald-600 hover:text-white'
                      )}
                    >
                      Buy now
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-8 leading-relaxed">
              Pay with Chapa in ETB or use manual bank transfer. Coins are credited after confirmation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
