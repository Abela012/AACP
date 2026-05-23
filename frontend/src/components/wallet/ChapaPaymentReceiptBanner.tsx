import { CheckCircle2, X, Coins } from 'lucide-react';
import { type ChapaPaymentReceipt, CHAPA_RECEIPT_DISPLAY_MS } from '@/src/hooks/useWallet';
import { formatBirr } from '@/src/shared/constants/coinPacks';

type Props = {
  receipt: ChapaPaymentReceipt;
  onDismiss: () => void;
};

export default function ChapaPaymentReceiptBanner({ receipt, onDismiss }: Props) {
  const seconds = Math.round(CHAPA_RECEIPT_DISPLAY_MS / 1000);

  return (
    <div
      role="status"
      className="mb-8 rounded-2xl border border-aacp-gold/30 dark:border-aacp-olive/30 bg-aacp-gold/15 dark:bg-aacp-olive/10 p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-aacp-olive flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-black w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-aacp-olive dark:text-aacp-gold mb-1">
              Payment receipt
            </p>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Payment successful</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              <strong>{receipt.coins.toLocaleString()} coins</strong> were added to your wallet
              {receipt.priceEtb > 0 && (
                <>
                  {' '}
                  (paid {formatBirr(receipt.priceEtb)})
                </>
              )}
              .
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Coins size={14} className="text-orange-400" />
                {receipt.coins.toLocaleString()} coins credited
              </span>
              <span>Ref: {receipt.txRef}</span>
              <span>
                {new Date(receipt.verifiedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-3">
              This receipt closes automatically in about {seconds} seconds, or dismiss it now.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-2 rounded-lg hover:bg-aacp-gold/25 dark:hover:bg-aacp-olive/20 text-gray-500 transition-colors shrink-0"
          aria-label="Dismiss receipt"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
