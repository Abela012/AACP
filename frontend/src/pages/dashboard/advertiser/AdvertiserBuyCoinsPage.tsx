import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet,
  CheckCircle2,
  Zap,
  BookOpen,
  Award,
  Users,
  Calendar,
  CreditCard,
  Headset
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';

import { useWalletBalance } from '@/src/hooks/useWallet';
import { Loader2 } from 'lucide-react';

export default function AdvertiserBuyCoinsPage() {
  const navigate = useNavigate();
  const { data: balanceData, isLoading: balanceLoading } = useWalletBalance();
  
  const [selectedPack, setSelectedPack] = useState<'starter' | 'popular' | 'pro'>('popular');
  const [paymentMethod, setPaymentMethod] = useState<'chapa' | 'manual'>('chapa');

  const packs = {
    starter: { title: 'STARTER', price: 10, coins: 100, save: '', features: ['Standard access to all modules', 'No expiration on coins'] },
    popular: { title: 'POPULAR', price: 45, coins: 500, save: 'Save 10%', features: ['Priority customer support', 'Bonus resource downloads'] },
    pro: { title: 'PRO', price: 80, coins: 1000, save: 'Save 20%', features: ['Unlock all premium features', 'Lifetime account verification'] },
  };

  const balance = balanceData?.balance || 0;

  const handleProceed = () => {
    const pack = packs[selectedPack];
    if (paymentMethod === 'chapa') {
      navigate('/advertiser/checkout', { 
        state: { pack: { title: `${pack.coins} Coins Package`, price: pack.price, coins: pack.coins } } 
      });
    } else {
      navigate('/advertiser/manual-checkout', { 
        state: { pack: { title: `${pack.coins} Coins Package`, price: pack.price, coins: pack.coins } } 
      });
    }
  };

  return (
    <AdvertiserLayout>
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 pb-32">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Coins</h1>
            <p className="text-gray-500 text-sm">Top up your account to access premium features and exclusive content.</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-6 py-4 rounded-2xl flex flex-col">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Current Wallet Balance</span>
            <div className="flex items-center gap-2">
              <Wallet className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
              <span className="text-xl font-black text-gray-900 dark:text-white">{balance} Coins</span>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded bg-purple-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Your Package</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Starter */}
            <div 
              onClick={() => setSelectedPack('starter')}
              className={cn(
                "p-8 rounded-3xl cursor-pointer transition-all border-2 flex flex-col",
                selectedPack === 'starter' ? "border-emerald-500 shadow-xl shadow-emerald-500/10 bg-white dark:bg-white/5" : "border-gray-200 dark:border-white/5 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/10"
              )}
            >
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Starter</h3>
              <div className="flex items-baseline gap-2 mb-6 text-gray-900 dark:text-white">
                <span className="text-4xl font-black">${packs.starter.price}</span>
                <span className="text-gray-500 font-medium">/ 100 Coins</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {packs.starter.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {feature}
                  </li>
                ))}
              </ul>
              <button className={cn(
                "w-full py-3.5 rounded-xl font-bold transition-colors",
                selectedPack === 'starter' ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" : "bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-100"
              )}>Select Starter</button>
            </div>

            {/* Popular */}
            <div 
              onClick={() => setSelectedPack('popular')}
              className={cn(
                "p-8 rounded-3xl cursor-pointer transition-all border-2 flex flex-col relative",
                selectedPack === 'popular' ? "border-emerald-500 shadow-2xl shadow-emerald-500/20 bg-white dark:bg-white/5" : "border-gray-200 dark:border-white/5 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/10"
              )}
            >
              {/* Best Value Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Best Value
              </div>

              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Popular</h3>
              <div className="flex items-baseline gap-2 mb-2 text-gray-900 dark:text-white">
                <span className="text-5xl font-black">${packs.popular.price}</span>
                <span className="text-gray-500 font-medium">/ 500 Coins</span>
              </div>
              <span className="text-xs font-bold text-emerald-500 mb-6 block">Save 10%</span>
              <ul className="space-y-4 mb-8 flex-1">
                {packs.popular.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {feature}
                  </li>
                ))}
              </ul>
              <button className={cn(
                "w-full py-3.5 rounded-xl font-bold transition-colors",
                selectedPack === 'popular' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400" : "bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-100"
              )}>Select Popular</button>
            </div>

            {/* Pro */}
            <div 
              onClick={() => setSelectedPack('pro')}
              className={cn(
                "p-8 rounded-3xl cursor-pointer transition-all border-2 flex flex-col",
                selectedPack === 'pro' ? "border-emerald-500 shadow-xl shadow-emerald-500/10 bg-white dark:bg-white/5" : "border-gray-200 dark:border-white/5 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/10"
              )}
            >
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Pro</h3>
              <div className="flex items-baseline gap-2 mb-2 text-gray-900 dark:text-white">
                <span className="text-4xl font-black">${packs.pro.price}</span>
                <span className="text-gray-500 font-medium">/ 1000 Coins</span>
              </div>
              <span className="text-xs font-bold text-emerald-500 mb-6 block">Save 20%</span>
              <ul className="space-y-4 mb-8 flex-1">
                {packs.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {feature}
                  </li>
                ))}
              </ul>
              <button className={cn(
                "w-full py-3.5 rounded-xl font-bold transition-colors",
                selectedPack === 'pro' ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" : "bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-100"
              )}>Select Pro</button>
            </div>

          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div 
              onClick={() => setPaymentMethod('chapa')}
              className={cn(
                "p-6 rounded-2xl cursor-pointer transition-all border-2 flex items-center justify-between",
                paymentMethod === 'chapa' ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5 shadow-sm" : "border-gray-200 dark:border-white/5 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Zap className="text-emerald-500 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Chapa Quick Payment</h3>
                  <p className="text-xs text-gray-500 mt-1">Instant activation. Supports cards and mobile money.</p>
                </div>
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === 'chapa' ? "border-emerald-500" : "border-gray-300 dark:border-gray-600")}>
                {paymentMethod === 'chapa' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
              </div>
            </div>

            <div 
              onClick={() => setPaymentMethod('manual')}
              className={cn(
                "p-6 rounded-2xl cursor-pointer transition-all border-2 flex items-center justify-between",
                paymentMethod === 'manual' ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5 shadow-sm" : "border-gray-200 dark:border-white/5 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Headset className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Manual Payment</h3>
                  <p className="text-xs text-gray-500 mt-1">Bank transfer or direct payment. (Admin Assisted)</p>
                </div>
              </div>
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === 'manual' ? "border-emerald-500" : "border-gray-300 dark:border-gray-600")}>
                {paymentMethod === 'manual' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
              </div>
            </div>

          </div>
        </div>

        {/* Proceed Button */}
        <div className="flex justify-center mb-16">
          <button 
            onClick={handleProceed}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-12 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
          >
            Proceed to Payment
          </button>
        </div>

        {/* How to use your coins */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to use your coins?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Coins are the official currency of the AACP platform. Use them to unlock specialized content and services tailored to your professional growth.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <BookOpen className="text-emerald-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Premium Modules</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Access advanced learning tracks and certifications.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Users className="text-emerald-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Expert Consultations</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Book 1-on-1 sessions with industry leaders.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Award className="text-emerald-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Verified Badges</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Enhance your profile credibility with verified skills.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="text-emerald-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">Exclusive Events</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Register for premium webinars and local meetups.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </AdvertiserLayout>
  );
}
