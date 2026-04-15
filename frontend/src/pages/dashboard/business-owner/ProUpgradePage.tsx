import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Rocket, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  ArrowLeft,
  Star,
  Sparkles,
  Lock,
  Megaphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';

export default function ProUpgradePage() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Perfect for getting started and exploring the platform.',
      features: [
        'Up to 3 active campaigns',
        'Basic AI matching',
        'Standard analytics',
        'Community support'
      ],
      cta: 'Current Plan',
      current: true
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      desc: 'For growing businesses that need more power and reach.',
      features: [
        'Unlimited active campaigns',
        'Advanced AI audience targeting',
        'Real-time detailed analytics',
        'Priority 24/7 support',
        'Custom brand reports',
        'Early access to new features'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      color: 'bg-indigo-600 text-white'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'Tailored solutions for large-scale operations and agencies.',
      features: [
        'Dedicated account manager',
        'API access & integrations',
        'White-label reports',
        'Custom contract terms',
        'Onboarding & training',
        'SLA guarantees'
      ],
      cta: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/10 py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/dashboard/business-owner" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Megaphone className="text-white w-5 h-5 -rotate-12" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">AACP</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} />
            Unlock Full Potential
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            Choose the perfect plan for <br /> your business growth
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Whether you're a startup or a global enterprise, we have a plan that fits your needs and helps you scale your collaborations.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx + 0.3 }}
              className={cn(
                "relative bg-white dark:bg-white/5 p-10 rounded-[3rem] border-2 transition-all flex flex-col",
                plan.popular ? "border-indigo-600 shadow-2xl shadow-indigo-100 dark:shadow-none scale-105 z-10" : "border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none hover:border-indigo-200 dark:hover:border-indigo-500/30"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">{plan.desc}</p>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 dark:text-gray-500 font-bold">{plan.period}</span>}
                </div>
              </div>

              <div className="flex-1 space-y-5 mb-12">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="text-green-500 dark:text-green-400 w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={cn(
                "w-full py-5 rounded-2xl font-bold text-sm transition-all shadow-lg",
                plan.current ? "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-default" : 
                plan.popular ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none" : 
                "bg-white dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 text-gray-900 dark:text-white hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Section */}
        <div className="bg-white dark:bg-white/5 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none p-12 overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why upgrade to Pro?</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">Unlock advanced tools designed to accelerate your brand's growth and collaboration efficiency.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Zap size={32} />
                </div>
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Star size={32} />
                </div>
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Sparkles size={32} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Rocket size={20} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">10x Faster Matching</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">Our Pro AI engine processes thousands of data points to find your perfect match in seconds.</p>
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Verified Partners</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">Exclusive access to top-tier, verified creators and businesses with proven track records.</p>
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BarChart3 size={20} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Deep Analytics</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">Go beyond basic metrics with predictive ROI modeling and audience sentiment analysis.</p>
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Users size={20} />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Priority Support</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">Skip the queue with a dedicated support channel and faster response times for your queries.</p>
              </div>
            </div>
          </div>
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50/50 dark:bg-purple-900/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">Trusted by 2,000+ businesses worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale dark:invert">
            <div className="text-2xl font-black tracking-tighter">TECHFLOW</div>
            <div className="text-2xl font-black tracking-tighter">NEXUS</div>
            <div className="text-2xl font-black tracking-tighter">CREATIVE</div>
            <div className="text-2xl font-black tracking-tighter">GLOBAL</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/10 py-12 px-6 sm:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Megaphone className="text-white w-4 h-4 -rotate-12" />
            </div>
            <span className="text-sm font-bold tracking-tighter text-gray-900 dark:text-white uppercase">AACP</span>
          </div>
          <div className="flex gap-8">
            {['Terms', 'Privacy', 'Refunds', 'Support'].map((item) => (
              <a key={item} href="#" className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-widest">{item}</a>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">© 2024 AACP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
