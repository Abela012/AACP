import { Building2, Smartphone, Copy, Check } from 'lucide-react';
import { useManualPaymentInstructions } from '@/src/hooks/useWallet';

type Props = {
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
};

export default function ManualPaymentInstructions({ copiedField, onCopy }: Props) {
  const { data, isLoading } = useManualPaymentInstructions();

  if (isLoading || !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 bg-gray-100 dark:bg-white/5 rounded-2xl" />
        <div className="h-32 bg-gray-100 dark:bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-aacp-olive flex items-center justify-center shadow-lg shadow-aacp-olive/20">
            <Building2 className="text-black w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Bank Transfer</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Bank Name</p>
            <p className="font-bold text-sm text-gray-900 dark:text-white">{data.bankName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Account Name</p>
            <p className="font-bold text-sm text-gray-900 dark:text-white">{data.accountName}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Account Number</p>
          <div className="flex items-center gap-3">
            <p className="font-bold text-lg text-aacp-olive tracking-wider">{data.accountNumber}</p>
            <button
              type="button"
              onClick={() => onCopy(data.accountNumber, 'cbe')}
              className="text-gray-400 dark:text-gray-500 hover:text-aacp-olive transition-colors"
            >
              {copiedField === 'cbe' ? <Check size={16} className="text-aacp-olive" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-aacp-olive flex items-center justify-center shadow-lg shadow-aacp-olive/20">
            <Smartphone className="text-black w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Telebirr</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Merchant Name</p>
            <p className="font-bold text-sm text-gray-900 dark:text-white">{data.telebirrMerchantName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Telebirr Number</p>
            <div className="flex items-center gap-3">
              <p className="font-bold text-lg text-aacp-olive tracking-wider">{data.telebirrNumber}</p>
              <button
                type="button"
                onClick={() => onCopy(data.telebirrNumber.replace(/\s/g, ''), 'telebirr')}
                className="text-gray-400 dark:text-gray-500 hover:text-aacp-olive transition-colors"
              >
                {copiedField === 'telebirr' ? <Check size={16} className="text-aacp-olive" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
