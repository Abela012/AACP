import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  ShieldCheck,
  Info,
  Coins,
  Smartphone,
  CreditCard,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { walletApi } from '@/src/api/walletApi';
import { useApiClient } from '@/src/api/apiClient';
import { CHAPA_PENDING_TX_KEY } from '@/src/hooks/useWallet';
import { formatBirr, type CheckoutPackState } from '@/src/shared/constants/coinPacks';

type ChapaCheckoutPanelProps = {
  packDetails: CheckoutPackState;
  returnUrl: string;
  buyCoinsPath: string;
};

export default function ChapaCheckoutPanel({ packDetails, returnUrl, buyCoinsPath }: ChapaCheckoutPanelProps) {
  const navigate = useNavigate();
  const api = useApiClient();
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
        coins: Number(packDetails.coins),
        currency: 'ETB',
        callbackUrl: `${apiRoot}/payments/chapa/callback`,
        returnUrl: `${origin}${returnUrl}`,
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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const msg =
        axiosErr?.response?.data?.message ||
        axiosErr?.response?.data?.error ||
        axiosErr?.message ||
        'Could not start Chapa payment. Please try again.';
      toast.error(msg);
      console.error('Chapa initialization failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate(buyCoinsPath)}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-gray-900 dark:text-gray-400"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chapa checkout</h1>
          <p className="text-gray-500 text-sm">Pay in Ethiopian Birr (ETB) — coins credit after payment confirms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-white/5">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Pay with Chapa</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Smartphone, label: 'Mobile money', sub: 'Telebirr, M-Pesa & more' },
                { icon: CreditCard, label: 'Cards', sub: 'Visa & Mastercard' },
                { icon: ShieldCheck, label: 'Secure', sub: 'Encrypted checkout' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 p-4 text-center"
                >
                  <Icon className="w-5 h-5 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  You will pay <strong>{formatBirr(packDetails.price)}</strong> and receive{' '}
                  <strong>{packDetails.coins.toLocaleString()} coins</strong> in your wallet.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayWithChapa}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Redirecting to Chapa…
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Pay {formatBirr(packDetails.price, { decimals: false })} with Chapa
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/5 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Order summary</h2>

            <div className="rounded-2xl bg-linear-to-br from-emerald-500/10 to-transparent border border-emerald-100 dark:border-emerald-500/20 p-5 mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                You receive
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Coins className="text-black w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {packDetails.coins.toLocaleString()} coins
                  </p>
                  <p className="text-xs text-gray-500">{packDetails.title}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
              <div className="flex justify-between">
                <span className="text-gray-500">Coin package</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {packDetails.coins.toLocaleString()} coins
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment amount</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatBirr(packDetails.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Currency</span>
                <span className="font-bold text-emerald-600">ETB (Birr)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Processing fee</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-900 dark:text-white">Total due</span>
              <span className="text-2xl font-black text-emerald-600">{formatBirr(packDetails.price)}</span>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex gap-3 items-start">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                After Chapa confirms payment, <strong>{packDetails.coins.toLocaleString()} coins</strong> are added
                to your balance — not the ETB amount you paid.
              </p>
            </div>

            <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-6">
              Powered by Chapa
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
