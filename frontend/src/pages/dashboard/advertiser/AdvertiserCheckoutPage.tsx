import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  Info,
  Package,
  ShieldAlert,
  Key,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';

export default function AdvertiserCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Passed state from the Buy Coins modal or fallback
  const packDetails = location.state?.pack || {
    coins: 500,
    price: 45.00,
    title: '500 Coins Package',
  };

  const [paymentType, setPaymentType] = useState<'card' | 'telebirr'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment process
    setTimeout(() => {
      setIsProcessing(false);
      
      // Update balance
      const currentCoins = parseInt(localStorage.getItem('advertiser_coins') || '450', 10);
      localStorage.setItem('advertiser_coins', (currentCoins + packDetails.coins).toString());

      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <AdvertiserLayout>
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-10 max-w-md w-full text-center border border-gray-100 dark:border-white/5 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-emerald-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
              Your transaction was completed via Chapa Secure Gateway. <strong className="text-emerald-500">{packDetails.coins} coins</strong> have been added to your wallet instantly!
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
          
          {/* Left Column: Payment Form */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-white/5">
              <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Payment Method</h2>
              
              {/* Payment Type Toggle */}
              <div className="flex gap-4 mb-8 bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={cn(
                    "flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
                    paymentType === 'card' 
                      ? "bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white" 
                      : "bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  <CreditCard size={18} /> Card Payment
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentType('telebirr')}
                  className={cn(
                    "flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
                    paymentType === 'telebirr' 
                      ? "bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white" 
                      : "bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  <Smartphone size={18} /> Telebirr
                </button>
              </div>

              {/* Chapa Secure Banner */}
              <div className="bg-purple-50/50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-2xl p-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-[#8b5cf6] dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Chapa Secure Payment Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mock card icons matching design */}
                  <div className="w-8 h-5 bg-gradient-to-br from-orange-200 to-orange-300 rounded-[3px] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-orange-500/80"></div></div>
                  <div className="w-8 h-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-[3px] border border-gray-300 flex items-center justify-center"><div className="w-3 h-1.5 bg-blue-400 rounded-sm"></div></div>
                  <div className="w-8 h-5 bg-[#008080] rounded-[3px] flex items-center justify-center"><div className="w-3 h-0.5 bg-white rounded-full"></div></div>
                </div>
              </div>

              {/* Form */}
              {paymentType === 'card' ? (
                <form onSubmit={handlePay} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">Cardholder Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      placeholder="Full Name on Card"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-purple-500/50 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">Card Number</label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        name="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-purple-500/50 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                      />
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">Expiry Date</label>
                      <input 
                        required
                        type="text" 
                        name="expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.expiry}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-purple-500/50 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">CVV</label>
                      <input 
                        required
                        type="password" 
                        name="cvv"
                        placeholder="123"
                        maxLength={4}
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-purple-500/50 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#8b5cf6] hover:bg-purple-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-8 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock size={16} /> Pay ${packDetails.price.toFixed(2)} Now
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-20 text-center text-gray-500">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Telebirr payment interface will be loaded here.</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-gray-100 dark:border-white/5 text-[11px] font-bold text-gray-400 dark:text-gray-600 tracking-widest uppercase">
                <span className="flex items-center gap-1.5"><ShieldAlert size={14} /> SSL SECURE</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> PCI COMPLIANT</span>
                <span className="flex items-center gap-1.5"><Key size={14} /> ENCRYPTED</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/5 lg:sticky lg:top-32">
              <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-white">Order Summary</h2>
              
              <div className="bg-purple-50/50 dark:bg-[#222] border border-purple-100 dark:border-white/5 rounded-2xl p-4 flex gap-4 items-center mb-8">
                <div className="w-14 h-14 bg-[#8b5cf6] dark:bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="text-white dark:text-purple-400 w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{packDetails.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">AI Ads Collaboration Platform</p>
                  <p className="text-sm font-bold text-[#8b5cf6] dark:text-purple-400 mt-2">${packDetails.price.toFixed(2)}</p>
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
                <span className="text-3xl font-black text-[#8b5cf6] dark:text-purple-500">${packDetails.price.toFixed(2)}</span>
              </div>

              <div className="bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-xl p-5 flex gap-3 items-start mb-8">
                <div className="w-5 h-5 rounded-full bg-[#8b5cf6] dark:bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-3 h-3 text-white dark:text-purple-400" />
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
    </AdvertiserLayout>
  );
}
