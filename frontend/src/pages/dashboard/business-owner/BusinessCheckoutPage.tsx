import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap,
  ShieldCheck, 
  Info,
  Package,
} from 'lucide-react';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { walletApi } from '@/src/api/walletApi';
import { useApiClient } from '@/src/api/apiClient';
import { CHAPA_PENDING_TX_KEY } from '@/src/hooks/useWallet';

export default function BusinessCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useApiClient();
  
  // Passed state from the Buy Coins modal or fallback
  const packDetails = location.state?.pack || {
    coins: 500,
    price: 45.00,
    title: '500 Coins Package',
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const handlePayWithChapa = async () => {
    setIsProcessing(true);
    try {
      const origin = window.location.origin;
      const apiRoot = (
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        'http://localhost:5000/api/v1'
      ).replace(/\/$/, '');
      const response = await walletApi.initializeChapaTopup(api, {
        amount: Number(packDetails.price),
        currency: 'ETB',
        callbackUrl: `${apiRoot}/payments/chapa/callback`,
        returnUrl: `${origin}/balance`,
      });

      const pkg = response.data?.data;
      if (pkg?.txRef) {
        sessionStorage.setItem(CHAPA_PENDING_TX_KEY, pkg.txRef);
      }
      const checkoutUrl = pkg?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('No Chapa checkout URL returned');
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Chapa initialization failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BusinessLayout>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12 relative">
        
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
            <p className="text-gray-500 text-sm">Complete your secure transaction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Left Column: Chapa only */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-white/5">
              <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Pay With Chapa</h2>

              {/* Chapa Secure Banner */}
              <div className="bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Chapa Secure Payment Gateway</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  You will be redirected to Chapa checkout to complete your payment.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePayWithChapa}
                disabled={isProcessing}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-6 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={16} /> Continue to Chapa (${packDetails.price.toFixed(2)})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/5 lg:sticky lg:top-32">
              <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-white">Order Summary</h2>
              
              <div className="bg-emerald-50/50 dark:bg-[#222] border border-emerald-100 dark:border-white/5 rounded-2xl p-4 flex gap-4 items-center mb-8">
                <div className="w-14 h-14 bg-emerald-500 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="text-black dark:text-emerald-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{packDetails.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">AI Ads Collaboration Platform</p>
                  <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400 mt-2">${packDetails.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">${packDetails.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Transaction Fee</span>
                  <span className="font-medium text-emerald-500">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tax (0%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-gray-900 dark:text-white text-lg">Total Amount</span>
                <span className="text-3xl font-black text-emerald-500 dark:text-emerald-500">${packDetails.price.toFixed(2)}</span>
              </div>

              <div className="bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-xl p-5 flex gap-3 items-start mb-8">
                <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-3 h-3 text-black dark:text-emerald-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  Coins will be credited to your account instantly after successful payment. You will receive a receipt via your registered email.
                </p>
              </div>

              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Powered by Chapa
              </p>
            </div>
          </div>

        </div>
      </main>
    </BusinessLayout>
  );
}
