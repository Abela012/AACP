import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Bell, 
  User, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Upload,
  Info,
  XCircle,
  Copy,
  ShieldCheck,
  Lock,
  ChevronLeft,
  PartyPopper,
  AlertCircle,
  Clock,
  MessageCircle,
  Rocket,
  DollarSign,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';

type Step = 'SELECTION' | 'CHAPA_CHECKOUT' | 'MANUAL_PAYMENT' | 'SUCCESS' | 'FAILURE';

export default function BuyCoinsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('SELECTION');
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CHAPA' | 'MANUAL'>('CHAPA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [prevFormData, setPrevFormData] = useState(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'name') {
      newValue = value.replace(/[0-9]/g, '');
    } else if (name === 'cardNumber' || name === 'cvv' || name === 'expiry') {
      if (name === 'cardNumber') {
        newValue = value.replace(/[^0-9 ]/g, '');
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

    setFormData(prev => {
      const next = { ...prev, [name]: newValue };
      setPrevFormData(prev);
      return next;
    });
  };

  const validateCardData = () => {
    const { name, cardNumber, expiry, cvv } = formData;
    const newErrors: Record<string, string> = {};
    
    if (name.trim().length < 3) {
      newErrors.name = 'Valid name required.';
    }

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      newErrors.cardNumber = 'Invalid card number.';
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = 'Use MM/YY.';
    } else {
      const [month, year] = expiry.split('/').map(Number);
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month.';
      } else {
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          newErrors.expiry = 'Expired.';
        }
      }
    }

    if (cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const packages = [
    { id: 'starter', name: 'STARTER', price: 10, coins: 100, features: ['Standard access to all modules', 'No expiration on coins'] },
    { id: 'popular', name: 'POPULAR', price: 45, coins: 500, bonus: 'Save 10%', features: ['Priority customer support', 'Bonus resource downloads'], bestValue: true },
    { id: 'pro', name: 'PRO', price: 80, coins: 1000, bonus: 'Save 20%', features: ['Unlock all premium features', 'Lifetime account verification'] },
  ];

  const handleProceed = () => {
    if (!selectedPackage) return;
    if (paymentMethod === 'CHAPA') setStep('CHAPA_CHECKOUT');
    else setStep('MANUAL_PAYMENT');
  };

  const handlePayment = () => {
    if (paymentMethod === 'CHAPA' && !validateCardData()) return;
    
    setIsSubmitting(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      // Randomly succeed or fail for demo purposes
      const success = Math.random() > 0.2;
      setStep(success ? 'SUCCESS' : 'FAILURE');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/10 py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">AACP</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-gray-50 dark:bg-white/5 rounded-full">
            <Bell size={20} />
          </button>
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
            <User size={20} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {step === 'SELECTION' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Buy Coins</h1>
                  <p className="text-gray-500 dark:text-gray-400">Top up your account to access premium features and exclusive content.</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center shadow-sm">
                    <CreditCard className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-1">Current Wallet Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">450 Coins</p>
                  </div>
                </div>
              </div>

              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Your Package</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {packages.map((pkg) => (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={cn(
                        "relative bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group",
                        selectedPackage?.id === pkg.id ? "border-indigo-600 shadow-xl shadow-indigo-100/50 dark:shadow-none" : "border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-900/30 shadow-sm dark:shadow-none",
                        pkg.bestValue && "md:scale-105 z-10"
                      )}
                    >
                      {pkg.bestValue && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                          Best Value
                        </div>
                      )}
                      <div className="mb-8">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{pkg.name}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-gray-900 dark:text-white">${pkg.price}</span>
                          <span className="text-gray-400 dark:text-gray-500 font-medium">/ {pkg.coins} Coins</span>
                        </div>
                        {pkg.bonus && <p className="text-green-500 dark:text-green-400 text-xs font-bold mt-2">{pkg.bonus}</p>}
                      </div>

                      <ul className="space-y-4 mb-10">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="text-green-500 dark:text-green-400 w-5 h-5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <button className={cn(
                        "w-full py-4 rounded-2xl font-bold text-sm transition-all",
                        selectedPackage?.id === pkg.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" : "bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20"
                      )}>
                        Select {pkg.name.charAt(0) + pkg.name.slice(1).toLowerCase()}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Payment Methods</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setPaymentMethod('CHAPA')}
                    className={cn(
                      "p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                      paymentMethod === 'CHAPA' ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20" : "border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-indigo-200 dark:hover:border-indigo-900/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
                        <Zap size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Chapa Quick Payment</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Instant activation. Supports cards and mobile money.</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      paymentMethod === 'CHAPA' ? "border-indigo-600 bg-indigo-600" : "border-gray-200 dark:border-white/20"
                    )}>
                      {paymentMethod === 'CHAPA' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('MANUAL')}
                    className={cn(
                      "p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                      paymentMethod === 'MANUAL' ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20" : "border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-indigo-200 dark:hover:border-indigo-900/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Manual Payment</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Bank transfer or direct payment. (Admin Assisted)</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      paymentMethod === 'MANUAL' ? "border-indigo-600 bg-indigo-600" : "border-gray-200 dark:border-white/20"
                    )}>
                      {paymentMethod === 'MANUAL' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={handleProceed}
                  disabled={!selectedPackage}
                  className={cn(
                    "px-12 py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center gap-3",
                    selectedPackage ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none" : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  )}
                >
                  Proceed to Payment
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="mt-20 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[3rem] p-12 border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-10">How to use your coins?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Premium Modules</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Access advanced learning tracks and certifications tailored to your growth.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Expert Consultations</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Book 1-on-1 sessions with industry leaders to refine your strategy.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Verified Badges</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Enhance your profile credibility with verified skills and achievements.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Bell size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">Exclusive Events</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Register for premium webinars, workshops, and local networking meetups.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'CHAPA_CHECKOUT' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-5xl mx-auto"
            >
              <button 
                onClick={() => setStep('SELECTION')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm mb-8 transition-colors"
              >
                <ChevronLeft size={20} />
                Back to Selection
              </button>

              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1">
                  <div className="bg-white dark:bg-white/5 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Payment Method</h2>
                    
                    <div className="flex gap-4 mb-10">
                      <button className="flex-1 py-4 px-6 rounded-2xl border-2 border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20 flex items-center justify-center gap-3 font-bold text-sm text-indigo-600 dark:text-indigo-400">
                        <CreditCard size={20} />
                        Card Payment
                      </button>
                      <button className="flex-1 py-4 px-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center justify-center gap-3 font-bold text-sm text-gray-400 dark:text-gray-500">
                        <Smartphone size={20} />
                        Telebirr
                      </button>
                    </div>

                    <div className="p-6 bg-indigo-50/30 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 mb-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Chapa Secure Payment Gateway</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-5 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-white/10 flex items-center justify-center text-[8px] font-bold text-blue-800 dark:text-blue-400">VISA</div>
                        <div className="w-8 h-5 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-white/10 flex items-center justify-center text-[8px] font-bold text-red-600 dark:text-red-400">MC</div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={cn("block text-xs font-bold uppercase tracking-widest mb-3 transition-colors", errors.name ? "text-red-500 font-black" : "text-gray-500 dark:text-gray-400 font-bold")}>
                          Cardholder Name {errors.name && <span className="ml-2 italic font-medium">({errors.name})</span>}
                        </label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Full Name on Card" 
                          className={cn(
                            "w-full px-6 py-4 rounded-2xl border bg-white dark:bg-white/5 focus:ring-1 outline-none transition-all text-sm dark:text-white",
                            errors.name ? "border-red-500 ring-red-500/20" : "border-gray-100 dark:border-white/10 focus:border-indigo-600 dark:focus:border-indigo-500"
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn("block text-xs font-bold uppercase tracking-widest mb-3 transition-colors", errors.cardNumber ? "text-red-500 font-black" : "text-gray-500 dark:text-gray-400 font-bold")}>
                          Card Number {errors.cardNumber && <span className="ml-2 italic font-medium">({errors.cardNumber})</span>}
                        </label>
                        <div className="relative">
                          <input 
                            type="text" 
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="0000 0000 0000 0000" 
                            maxLength={19}
                            className={cn(
                              "w-full px-6 py-4 rounded-2xl border bg-white dark:bg-white/5 focus:ring-1 outline-none transition-all text-sm dark:text-white",
                              errors.cardNumber ? "border-red-500 ring-red-500/20" : "border-gray-100 dark:border-white/10 focus:border-indigo-600 dark:focus:border-indigo-500"
                            )}
                          />
                          <CreditCard className={cn("absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", errors.cardNumber ? "text-red-500" : "text-gray-400 dark:text-gray-500")} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className={cn("block text-xs font-bold uppercase tracking-widest mb-3 transition-colors", errors.expiry ? "text-red-500 font-black" : "text-gray-500 dark:text-gray-400 font-bold")}>
                            Expiry Date {errors.expiry && <span className="ml-1 italic font-medium text-[9px]">({errors.expiry})</span>}
                          </label>
                          <input 
                            type="text" 
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            placeholder="MM/YY" 
                            maxLength={5}
                            className={cn(
                              "w-full px-6 py-4 rounded-2xl border bg-white dark:bg-white/5 focus:ring-1 outline-none transition-all text-sm dark:text-white",
                              errors.expiry ? "border-red-500 ring-red-500/20" : "border-gray-100 dark:border-white/10 focus:border-indigo-600 dark:focus:border-indigo-500"
                            )}
                          />
                        </div>
                        <div>
                          <label className={cn("block text-xs font-bold uppercase tracking-widest mb-3 transition-colors", errors.cvv ? "text-red-500 font-black" : "text-gray-500 dark:text-gray-400 font-bold")}>
                            CVV {errors.cvv && <span className="ml-1 italic font-medium text-[9px]">({errors.cvv})</span>}
                          </label>
                          <input 
                            type="text" 
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123" 
                            maxLength={4}
                            className={cn(
                              "w-full px-6 py-4 rounded-2xl border bg-white dark:bg-white/5 focus:ring-1 outline-none transition-all text-sm dark:text-white",
                              errors.cvv ? "border-red-500 ring-red-500/20" : "border-gray-100 dark:border-white/10 focus:border-indigo-600 dark:focus:border-indigo-500"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handlePayment}
                      disabled={isSubmitting}
                      className="w-full mt-12 bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock size={20} />
                          Pay ${selectedPackage?.price}.00 Now
                        </>
                      )}
                    </button>

                    <div className="flex justify-center gap-8 mt-8">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <ShieldCheck size={14} />
                        SSL Secure
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <ShieldCheck size={14} />
                        PCI Compliant
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <Lock size={14} />
                        Encrypted
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-96">
                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none sticky top-32">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Order Summary</h3>
                    
                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 mb-8 flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                        <Zap size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{selectedPackage?.coins} Coins Package</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">AI Ads Collaboration Platform</p>
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">${selectedPackage?.price}.00</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                        <span className="font-bold text-gray-900 dark:text-white">${selectedPackage?.price}.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Transaction Fee</span>
                        <span className="text-green-500 dark:text-green-400 font-bold">Free</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Tax (0%)</span>
                        <span className="font-bold text-gray-900 dark:text-white">$0.00</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex justify-between items-center mb-8">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                      <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">${selectedPackage?.price}.00</span>
                    </div>

                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex gap-4">
                      <Info className="text-blue-500 dark:text-blue-400 w-5 h-5 shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Coins will be credited to your account instantly after successful payment. You will receive a receipt via your registered email.
                      </p>
                    </div>

                    <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-8 font-medium">
                      Powered by Chapa Financial Technologies
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'MANUAL_PAYMENT' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-5xl mx-auto"
            >
              <button 
                onClick={() => setStep('SELECTION')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm mb-8 transition-colors"
              >
                <ChevronLeft size={20} />
                Back to Selection
              </button>

              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-8">
                  <div className="bg-white dark:bg-white/5 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Info size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Payment Instructions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Please transfer the exact amount to one of the accounts below.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-8 rounded-[2rem] border-2 border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                            <Building2 size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bank Transfer</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Bank Name</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Commercial Bank of Ethiopia</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Account Name</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">AACP Platform</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Account Number</p>
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">100013456789</p>
                              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 rounded-[2rem] border-2 border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                            <Smartphone size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Telebirr</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Merchant Name</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">AACP Payments</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Telebirr Number</p>
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-wider">+251 912 345 678</p>
                              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Upload size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Proof of Payment</h2>
                    </div>

                    <div className="border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center group hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all cursor-pointer">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all mb-6">
                        <Upload size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Click to upload or drag and drop</h4>
                      <p className="text-sm text-gray-400 dark:text-gray-500">SVG, PNG, JPG or PDF (max. 5MB)</p>
                    </div>

                    <div className="mt-8 p-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex gap-4">
                      <Clock className="text-indigo-600 dark:text-indigo-400 w-5 h-5 shrink-0" />
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                        <span className="font-bold">Note:</span> Manual payments are processed within <span className="font-bold">24-48 hours</span>. You will receive a notification once your coins are credited to your account.
                      </p>
                    </div>

                    <button 
                      onClick={handlePayment}
                      disabled={isSubmitting}
                      className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Submit Payment Request'
                      )}
                    </button>
                  </div>
                </div>

                <div className="w-full lg:w-96">
                  <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none sticky top-32">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Order Summary</h3>
                    
                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 mb-8 flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1974&auto=format&fit=crop" alt="Coins" className="w-full h-full object-cover opacity-50" />
                        <Zap className="absolute text-white w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Selected Package</p>
                        <p className="font-bold text-gray-900 dark:text-white">{selectedPackage?.coins} Coins Package</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Package Price</span>
                        <span className="font-bold text-gray-900 dark:text-white">${selectedPackage?.price}.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Processing Fee</span>
                        <span className="text-green-500 dark:text-green-400 font-bold">Free</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10 mb-8">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Payable</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">${selectedPackage?.price}.00</span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Included Taxes</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                        <Lock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Secure encrypted transaction</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                        <MessageCircle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Need help? Contact Support</span>
                      </div>
                    </div>

                    <div className="mt-10 bg-indigo-600 p-8 rounded-[2rem] text-white relative overflow-hidden group">
                      <div className="relative z-10">
                        <h4 className="font-bold mb-2">AACP Premium</h4>
                        <p className="text-[10px] text-indigo-100 leading-relaxed">Boost your ad visibility by 300% with premium features and priority placement.</p>
                      </div>
                      <Rocket className="absolute -bottom-4 -right-4 text-white/10 w-24 h-24 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {step === 'SUCCESS' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#121212] rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-gray-100 dark:border-white/5"
            >
              <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="text-green-500 dark:text-green-400 w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Your {selectedPackage?.coins} Coins have been credited to your account.</p>
              
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-10 flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Transaction ID:</span>
                <span className="text-[10px] font-mono font-bold text-gray-900 dark:text-white">#CH-892410</span>
              </div>

              <button 
                onClick={() => navigate('/dashboard/business-owner')}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
              >
                Go to Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Failure Modal */}
      <AnimatePresence>
        {step === 'FAILURE' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#121212] rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border-b-8 border-red-500 border border-gray-100 dark:border-white/5"
            >
              <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <XCircle className="text-red-500 dark:text-red-400 w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Failed</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-10">We couldn't process your payment. Please check your card details or try again later.</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setStep('CHAPA_CHECKOUT')}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
                >
                  Try Again
                </button>
                <button 
                  className="w-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                >
                  Contact Support
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/10 py-10 px-6 sm:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 dark:bg-gray-600 rounded flex items-center justify-center">
              <DollarSign className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-tighter uppercase">AACP</span>
          </div>
          <div className="flex gap-8">
            {['Terms of Service', 'Privacy Policy', 'Refund Policy', 'Support'].map((item) => (
              <a key={item} href="#" className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{item}</a>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2024 AACP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
