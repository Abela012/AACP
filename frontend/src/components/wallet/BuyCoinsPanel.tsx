import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, CheckCircle2, Zap, Headset, Coins } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import {
  COIN_PACKS,
  formatBirr,
  type CoinPackId,
} from '@/src/shared/constants/coinPacks';
import { useWalletBalance } from '@/src/hooks/useWallet';

type BuyCoinsPanelProps = {
  checkoutPath: string;
  manualCheckoutPath: string;
  subtitle: string;
  extraSection?: React.ReactNode;
};

export default function BuyCoinsPanel({
  checkoutPath,
  manualCheckoutPath,
  subtitle,
  extraSection,
}: BuyCoinsPanelProps) {
  const navigate = useNavigate();
  const { data: balanceData } = useWalletBalance();
  const [selectedPack, setSelectedPack] = useState<CoinPackId>('popular');
  const [paymentMethod, setPaymentMethod] = useState<'chapa' | 'manual'>('chapa');

  const pack = COIN_PACKS[selectedPack];
  const balance = balanceData?.balance ?? 0;

  const handleProceed = () => {
    const statePack = {
      title: `${pack.coins} Coins Package`,
      price: pack.priceEtb,
      coins: pack.coins,
    };
    if (paymentMethod === 'chapa') {
      navigate(checkoutPath, { state: { pack: statePack } });
    } else {
      navigate(manualCheckoutPath, { state: { pack: statePack } });
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 pb-36">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-aacp-olive mb-2">Wallet top-up</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy coins</h1>
          <p className="text-gray-500 text-sm max-w-lg">{subtitle}</p>
        </div>
        <div className="bg-aacp-gold/15 dark:bg-aacp-olive/10 border border-aacp-gold/25 dark:border-aacp-olive/20 px-6 py-4 rounded-2xl">
          <span className="text-xs font-bold text-aacp-olive dark:text-aacp-gold block mb-1">Current balance</span>
          <div className="flex items-center gap-2">
            <Wallet className="text-aacp-olive w-5 h-5" />
            <span className="text-xl font-black text-gray-900 dark:text-white">{balance.toLocaleString()} coins</span>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Select package</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(COIN_PACKS) as CoinPackId[]).map((id) => {
            const p = COIN_PACKS[id];
            const selected = selectedPack === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedPack(id)}
                className={cn(
                  'text-left p-8 rounded-3xl border-2 transition-all flex flex-col relative',
                  selected
                    ? 'border-aacp-olive shadow-xl shadow-aacp-olive/15 bg-white dark:bg-white/5'
                    : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#111] hover:border-gray-300'
                )}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-aacp-olive text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Best value
                  </span>
                )}
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{p.title}</h3>
                <div className="flex items-baseline gap-2 mb-1 text-gray-900 dark:text-white">
                  <span className={cn('font-black', id === 'popular' ? 'text-4xl' : 'text-3xl')}>
                    {formatBirr(p.priceEtb, { decimals: false })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                  <Coins size={14} className="text-orange-400" />
                  {p.coins.toLocaleString()} coins
                </p>
                {p.save && <span className="text-xs font-bold text-aacp-olive mb-4 block">{p.save}</span>}
                <ul className="space-y-3 mb-6 flex-1 mt-4">
                  {p.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle2 size={15} className="text-aacp-olive shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <span
                  className={cn(
                    'w-full py-3 rounded-xl text-center text-sm font-bold block',
                    selected ? 'bg-aacp-olive text-black' : 'bg-gray-50 dark:bg-white/5 text-gray-700'
                  )}
                >
                  {selected ? 'Selected' : `Choose ${p.title}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Payment method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('chapa')}
            className={cn(
              'p-6 rounded-2xl border-2 text-left flex items-center justify-between transition-all',
              paymentMethod === 'chapa'
                ? 'border-aacp-olive bg-aacp-gold/15/50 dark:bg-aacp-olive/5'
                : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#111]'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-aacp-gold/25 dark:bg-aacp-olive/10 rounded-xl flex items-center justify-center">
                <Zap className="text-aacp-olive w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Chapa (ETB)</h3>
                <p className="text-xs text-gray-500 mt-1">Instant — mobile money & cards in Birr</p>
              </div>
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2',
                paymentMethod === 'chapa' ? 'border-aacp-olive bg-aacp-olive' : 'border-gray-300'
              )}
            />
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('manual')}
            className={cn(
              'p-6 rounded-2xl border-2 text-left flex items-center justify-between transition-all',
              paymentMethod === 'manual'
                ? 'border-aacp-olive bg-aacp-gold/15/50 dark:bg-aacp-olive/5'
                : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#111]'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Headset className="text-blue-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Manual transfer</h3>
                <p className="text-xs text-gray-500 mt-1">Bank transfer — admin approves coins</p>
              </div>
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 shrink-0',
                paymentMethod === 'manual' ? 'border-aacp-olive bg-aacp-olive' : 'border-gray-300'
              )}
            />
          </button>
        </div>
      </div>

      {extraSection}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Selected</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {pack.coins.toLocaleString()} coins · {formatBirr(pack.priceEtb)}
              {paymentMethod === 'chapa' && (
                <span className="text-aacp-olive text-xs font-bold ml-2">via Chapa</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleProceed}
            className="w-full sm:w-auto bg-aacp-olive hover:bg-aacp-gold text-black px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-aacp-olive/25 transition-all"
          >
            Continue to payment
          </button>
        </div>
      </div>
    </main>
  );
}
