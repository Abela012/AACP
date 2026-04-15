import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Info,
  Building2,
  Smartphone,
  Copy,
  Check,
  UploadCloud,
  Clock,
  Lock,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';

export default function AdvertiserManualCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Passed state from the Buy Coins page or fallback
  const packDetails = location.state?.pack || {
    coins: 500,
    price: 45.00,
    title: '500 Coins Package',
  };

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <AdvertiserLayout>
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-10 max-w-md w-full text-center border border-gray-100 dark:border-white/5 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="text-emerald-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Request Sent!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
              Your manual payment request has been submitted successfully. Please wait 24-48 hours for admin approval. Once verified, {packDetails.coins} coins will be credited to your wallet.
            </p>
            <button 
              onClick={() => navigate('/advertiser/balance')}
              className="w-full bg-[#8b5cf6] hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
            >
              Back to Wallet
            </button>
          </div>
        </main>
      </AdvertiserLayout>
    );
  }

  return (
    <AdvertiserLayout>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12 relative">
        
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Payment</h1>
              <p className="text-gray-500 text-sm">Complete your transaction manually</p>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest hidden sm:flex">
            <div className="w-5 h-5 bg-[#8b5cf6] rounded-md flex items-center justify-center">
              <ShieldIcon className="text-white w-3 h-3" />
            </div>
            Secure Payment Gateway
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Instructions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Transfer Instructions */}
            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0">
                  <Info className="text-white w-3.5 h-3.5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manual Payment Instructions</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                Please transfer the exact amount to one of the accounts below. Once finished, upload a screenshot or photo of your receipt for verification.
              </p>

              {/* Bank Card */}
              <div className="bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Building2 className="text-white w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Bank Transfer</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Bank Name</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Commercial Bank of Ethiopia</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Account Name</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">AACP Platform</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Account Number</p>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-lg text-[#8b5cf6] tracking-wider">100013456789</p>
                    <button 
                      onClick={() => handleCopy('100013456789', 'cbe')}
                      className="text-gray-400 dark:text-gray-500 hover:text-[#8b5cf6] transition-colors"
                    >
                      {copiedField === 'cbe' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Telebirr Card */}
              <div className="bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Smartphone className="text-white w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Telebirr</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Merchant Name</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">AACP Payments</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Telebirr Number</p>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-lg text-[#8b5cf6] tracking-wider">+251 912 345 678</p>
                      <button 
                        onClick={() => handleCopy('+251912345678', 'telebirr')}
                        className="text-gray-400 dark:text-gray-500 hover:text-[#8b5cf6] transition-colors"
                      >
                        {copiedField === 'telebirr' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Step 2: Upload Proof */}
            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0">
                  <UploadCloud className="text-white w-3.5 h-3.5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Proof of Payment</h2>
              </div>

              <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center hover:border-[#8b5cf6] hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all cursor-pointer mb-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-[#222] rounded-full flex items-center justify-center mb-4">
                  <FileReceiptIcon className="text-gray-400 dark:text-gray-500 w-5 h-5" />
                </div>
                <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">Click to upload or drag and drop</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium tracking-wide">SVG, PNG, JPG or PDF (max. 5MB)</p>
              </div>

              <div className="flex gap-3 bg-purple-50/50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/10 p-4 rounded-xl mb-6">
                <Clock className="text-[#8b5cf6] w-5 h-5 shrink-0" />
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <span className="font-bold text-gray-900 dark:text-white">Note:</span> Manual payments are processed within <span className="font-bold text-[#8b5cf6]">24-48 hours</span>. You will receive a notification once your coins are credited to your account.
                </p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#8b5cf6] hover:bg-purple-500 text-white py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-purple-500/30 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Submit Payment Request"
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 lg:sticky lg:top-32">
              <h2 className="font-bold text-xl mb-6 text-gray-900 dark:text-white">Order Summary</h2>
              
              <div className="bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-xl p-4 flex gap-4 items-center mb-6">
                <div className="w-12 h-12 bg-[#2d1b11] rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-amber-900/50">
                  <div className="w-6 h-6 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center justify-center text-amber-900 font-bold text-[10px]">₿</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-0.5">SELECTED PACKAGE</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{packDetails.title}</h3>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Package Price</span>
                  <span className="font-bold text-gray-900 dark:text-white">${packDetails.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Processing Fee</span>
                  <span className="font-bold text-emerald-500">Free</span>
                </div>
              </div>

              <div className="mb-8">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold block mb-1">Total Payable</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-[#8b5cf6]">${packDetails.price.toFixed(2)}</span>
                  <span className="text-[8px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest mt-2">INCLUDED TAXES</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex gap-2 items-center text-[11px] text-gray-500 dark:text-gray-400"><Lock size={12} /> Secure encrypted transaction</li>
                <li className="flex gap-2 items-center text-[11px] text-gray-500 dark:text-gray-400"><HelpCircle size={12} /> Need help? Contact Support</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

    </AdvertiserLayout>
  );
}

// Small icon components
function ShieldIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function FileReceiptIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17V7" />
    </svg>
  );
}

function RocketIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}
