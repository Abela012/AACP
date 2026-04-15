import { motion } from 'framer-motion';
import { 
  Rocket, 
  CreditCard, 
  Plus, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

export default function BalancePage() {
  const navigate = useNavigate();
  
  const transactions = [
    { id: 1, type: 'spent', title: 'Campaign: Summer Collection', amount: '-150 Coins', date: 'Oct 24, 2024', status: 'Completed' },
    { id: 2, type: 'topup', title: 'Coin Top-up (500 Coins)', amount: '+500 Coins', date: 'Oct 20, 2024', status: 'Completed' },
    { id: 3, type: 'spent', title: 'AI Matching Enhancement', amount: '-25 Coins', date: 'Oct 18, 2024', status: 'Completed' },
    { id: 4, type: 'spent', title: 'Campaign: Holiday Gift Guide', amount: '-100 Coins', date: 'Oct 15, 2024', status: 'Completed' },
    { id: 5, type: 'topup', title: 'Coin Top-up (1000 Coins)', amount: '+1000 Coins', date: 'Oct 10, 2024', status: 'Completed' },
  ];

  const coinPackages = [
    { id: 1, name: 'Starter Pack', coins: 100, price: '$10.00', bonus: '0%' },
    { id: 2, name: 'Growth Pack', coins: 500, price: '$45.00', bonus: '10%', popular: true },
    { id: 3, name: 'Enterprise Pack', coins: 2500, price: '$200.00', bonus: '25%' },
  ];

  return (
    <BusinessLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Coin Balance</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your coins and view transaction history.</p>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
            <Plus size={18} />
            Add Coins
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Balance Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-100 dark:shadow-none">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-orange-400 rounded-full" />
                      <h2 className="text-5xl font-bold">1,250 Coins</h2>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Zap className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="flex gap-10">
                  <div>
                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-xl font-bold">4,200 Coins</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div>
                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Earned</p>
                    <p className="text-xl font-bold">150 Coins</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-24 -mb-24 blur-3xl" />
            </div>

            {/* Transaction History */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <History className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaction History</h3>
                </div>
                <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">View all</button>
              </div>
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {transactions.map((t) => (
                    <div key={t.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          t.type === 'spent' ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-green-50 dark:bg-green-500/10 text-green-500"
                        )}>
                          {t.type === 'spent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{t.title}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{t.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-bold",
                          t.type === 'spent' ? "text-red-500" : "text-green-500"
                        )}>
                          {t.amount}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{t.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Area - Top-up Packages */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Top-up Coins</h3>
              <div className="space-y-4">
                {coinPackages.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all cursor-pointer group",
                      pkg.popular ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20" : "border-gray-50 dark:border-white/5 hover:border-indigo-100 dark:hover:border-indigo-900/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{pkg.name}</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 bg-orange-400 rounded-full" />
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{pkg.coins} Coins</span>
                        </div>
                      </div>
                      {pkg.popular && (
                        <span className="bg-indigo-600 text-white text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">Popular</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{pkg.price}</span>
                      <button className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        pkg.popular ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-indigo-600 group-hover:text-white"
                      )}>
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-8 leading-relaxed">
                Secure payments powered by Stripe. Coins are non-refundable and expire after 12 months.
              </p>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Payment Methods</h3>
                <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Manage</button>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <div className="w-10 h-6 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-white/10 flex items-center justify-center font-bold text-[8px] text-blue-800 dark:text-blue-400">VISA</div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">•••• 4242</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Expires 12/26</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </BusinessLayout>
  );
}
