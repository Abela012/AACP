import { useState, useEffect } from 'react';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'name') {
      // Don't let numbers in the name part
      newValue = value.replace(/[0-9]/g, '');
    } else if (name === 'cardNumber' || name === 'cvv' || name === 'expiry') {
      // Don't let strings on the number parts (allow / for expiry and space for card formatting)
      if (name === 'cardNumber') {
        newValue = value.replace(/[^0-9 ]/g, '');
        // Auto-format card number: 0000 0000 0000 0000
        newValue = newValue.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
      } else if (name === 'cvv') {
        newValue = value.replace(/[^0-9]/g, '');
      } else if (name === 'expiry') {
        newValue = value.replace(/[^0-9/]/g, '');
        if (newValue.length === 2 && !newValue.includes('/') && value.length > prevFormData.expiry.length) {
          newValue = newValue + '/';
        }
      }
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const [prevFormData, setPrevFormData] = useState(formData);
  useEffect(() => {
    setPrevFormData(formData);
  }, [formData]);

  const validateForm = () => {
    const { name, cardNumber, expiry, cvv } = formData;
    const newErrors: Record<string, string> = {};
    
    // Check reliable data
    if (name.trim().length < 3) {
      newErrors.name = 'Please enter a valid cardholder name.';
    }

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number.';
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = 'Use format MM/YY.';
    } else {
      const [month, year] = expiry.split('/').map(Number);
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month.';
      } else {
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          newErrors.expiry = 'Card is expired.';
        }
      }
    }

    if (cvv.length < 3) {
      newErrors.cvv = 'Valid CVV required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsProcessing(true);
    // Simulate payment process
    setTimeout(() => {
      setIsProcessing(false);
      
      // Record transaction
      const transactions = JSON.parse(localStorage.getItem('advertiser_transactions') || '[]');
      const newTransaction = {
        id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        type: 'Coin Purchase',
        amount: packDetails.price,
        coins: packDetails.coins,
        status: 'Completed',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        method: paymentType === 'card' ? 'Visa •••• 4242' : 'Telebirr',
      };
      localStorage.setItem('advertiser_transactions', JSON.stringify([newTransaction, ...transactions]));

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
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
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
              <div className="bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-emerald-500 dark:text-emerald-400" />
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
                    <label className={cn("text-sm font-medium transition-colors", errors.name ? "text-red-500" : "text-gray-600 dark:text-gray-400")}>
                      Cardholder Name {errors.name && <span className="text-[10px] ml-2 italic font-bold">({errors.name})</span>}
                    </label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      placeholder="Full Name on Card"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full bg-white dark:bg-[#222] border rounded-xl px-4 py-4 text-sm focus:outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600",
                        errors.name ? "border-red-500/50 ring-1 ring-red-500/20" : "border-gray-200 dark:border-white/5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={cn("text-sm font-medium transition-colors", errors.cardNumber ? "text-red-500" : "text-gray-600 dark:text-gray-400")}>
                      Card Number {errors.cardNumber && <span className="text-[10px] ml-2 italic font-bold">({errors.cardNumber})</span>}
                    </label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        name="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full bg-white dark:bg-[#222] border rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600",
                          errors.cardNumber ? "border-red-500/50 ring-1 ring-red-500/20" : "border-gray-200 dark:border-white/5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                        )}
                      />
                      <CreditCard className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5", errors.cardNumber ? "text-red-500" : "text-gray-400 dark:text-gray-600")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium transition-colors", errors.expiry ? "text-red-500" : "text-gray-600 dark:text-gray-400")}>
                        Expiry Date {errors.expiry && <span className="text-[10px] ml-2 italic font-bold">({errors.expiry})</span>}
                      </label>
                      <input 
                        required
                        type="text" 
                        name="expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.expiry}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full bg-white dark:bg-[#222] border rounded-xl px-4 py-4 text-sm focus:outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600",
                          errors.expiry ? "border-red-500/50 ring-1 ring-red-500/20" : "border-gray-200 dark:border-white/5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-sm font-medium transition-colors", errors.cvv ? "text-red-500" : "text-gray-600 dark:text-gray-400")}>
                        CVV {errors.cvv && <span className="text-[10px] ml-2 italic font-bold">({errors.cvv})</span>}
                      </label>
                      <input 
                        required
                        type="password" 
                        name="cvv"
                        placeholder="123"
                        maxLength={4}
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full bg-white dark:bg-[#222] border rounded-xl px-4 py-4 text-sm focus:outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600",
                          errors.cvv ? "border-red-500/50 ring-1 ring-red-500/20" : "border-gray-200 dark:border-white/5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                        )}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-8 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
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
    </AdvertiserLayout>
  );
}
