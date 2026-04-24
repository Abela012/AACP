import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  DollarSign,
  Wallet,
  Download,
  CheckCircle2,
  FileText,
  CreditCard,
  Coins,
  X,
  Zap,
  ChevronRight,
  Headset,
  Smartphone
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';

import { useWalletBalance, useWalletHistory } from '@/src/hooks/useWallet';
import { Loader2 } from 'lucide-react';

export default function AdvertiserBalancePage() {
  const navigate = useNavigate();
  const { data: balanceData, isLoading: balanceLoading } = useWalletBalance();
  const { data: txHistoryData, isLoading: historyLoading } = useWalletHistory();

  const availableBalance = balanceData?.balance || 0;
  const totalPurchased = txHistoryData
    ?.filter((t: any) => t.type === 'credit')
    .reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
  const totalSpent = txHistoryData
    ?.filter((t: any) => t.type === 'debit')
    .reduce((acc: number, t: any) => acc + t.amount, 0) || 0;

  const isLoading = balanceLoading || historyLoading;


  return (
    <AdvertiserLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Coin Balance</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your coins to apply for collaborations.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/advertiser/buy-coins')}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Coins size={18} />
              Buy Coins
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Wallet Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-emerald-500 p-10 rounded-[2.5rem] text-black relative overflow-hidden shadow-2xl shadow-emerald-100 dark:shadow-none">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-emerald-900/60 text-xs font-bold uppercase tracking-widest mb-2">Available Coins</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-5xl font-bold">{availableBalance.toLocaleString('en-US')}</h2>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center">
                    <Coins className="text-black w-8 h-8" />
                  </div>
                </div>
                <div className="flex gap-10">
                  <div>
                    <p className="text-emerald-900/60 text-[10px] font-bold uppercase tracking-widest mb-1">Total Coins Received</p>
                    <p className="text-xl font-bold">{totalPurchased.toLocaleString()}</p>
                  </div>
                  <div className="w-px h-10 bg-black/10" />
                  <div>
                    <p className="text-emerald-900/60 text-[10px] font-bold uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-xl font-bold">{totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/30 rounded-full -ml-24 -mb-24 blur-3xl" />
            </div>

            {/* Transaction History */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <History className="text-emerald-600 dark:text-emerald-500 w-5 h-5" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment History</h3>
                </div>
                <button className="text-xs font-bold text-emerald-600 dark:text-emerald-500 hover:underline">Download CSV</button>
              </div>
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {isLoading ? (
                    <div className="p-12 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                  ) : txHistoryData?.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-500">No transactions found.</p>
                    </div>
                  ) : (
                    txHistoryData?.map((t: any) => (
                      <div key={t._id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            t.type === 'debit' ? "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                          )}>
                            {t.type === 'debit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{t.description}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{new Date(t.createdAt).toLocaleDateString()} • {t.type.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-sm font-bold",
                            t.type === 'debit' ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-500"
                          )}>
                            {t.type === 'debit' ? '-' : '+'}{t.amount} Coins
                          </p>
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            t.status === 'pending' ? "text-amber-500 dark:text-amber-400" : "text-gray-400 dark:text-gray-500"
                          )}>{t.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AdvertiserLayout>
  );
}
