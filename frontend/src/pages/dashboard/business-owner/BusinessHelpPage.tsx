import { motion } from 'framer-motion';
import {
  Search,
  Book,
  MessageSquare,
  Shield,
  ExternalLink,
  ChevronRight,
  Zap,
  LifeBuoy,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

export default function BusinessHelpPage() {
  const categories = [
    {
      title: 'Campaigns',
      desc: 'Create campaigns, review applicants, and manage deliverables.',
      icon: Megaphone,
      color: 'text-primary-blue',
      bg: 'bg-primary-blue/10',
    },
    {
      title: 'Discover & matching',
      desc: 'Find creators, interpret match scores, and send invitations.',
      icon: Sparkles,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
    },
    {
      title: 'Wallet & billing',
      desc: 'Coins, checkout, campaign budgets, and transaction history.',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      title: 'Policies & safety',
      desc: 'Community guidelines, disputes, and account verification.',
      icon: Shield,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
  ];

  const faqs = [
    'How do I invite a creator to a campaign?',
    'What does the AI match score mean on Discover?',
    'How do I fund my wallet with coins?',
    'When will my business profile be approved?',
  ];

  return (
    <BusinessLayout>
      <div className="mx-auto max-w-[1000px] pb-12">
        <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-tr from-primary-blue to-[#005A9E] p-8 text-white shadow-xl shadow-primary-blue/20 sm:p-12">
          <div className="relative z-10">
            <h1 className="mb-4 text-3xl font-black sm:text-4xl">Business Help Center</h1>
            <p className="mb-8 max-w-lg font-medium leading-relaxed text-white/85">
              Guides and answers for running campaigns, discovering creators, and managing your business account on AACP.
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" aria-hidden />
              <input
                type="search"
                placeholder="Search help articles..."
                aria-label="Search help articles"
                className="w-full rounded-2xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-sm text-white backdrop-blur-md placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
          <LifeBuoy className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rotate-12 text-white/10" aria-hidden />
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="cursor-pointer rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-primary-blue/25 hover:shadow-md dark:border-white/5 dark:bg-[#141820]"
            >
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${cat.bg} ${cat.color}`}>
                <cat.icon size={24} aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-black text-gray-900 transition-colors group-hover:text-primary-blue dark:text-white">
                {cat.title}
              </h3>
              <p className="mb-6 text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                {cat.desc}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-blue">
                Read guide <ChevronRight size={14} aria-hidden />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-[#141820]">
          <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Frequently asked questions</h2>
            <button
              type="button"
              className="text-[10px] font-black uppercase tracking-widest text-primary-blue hover:underline"
            >
              View all FAQ
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {faqs.map((faq) => (
              <button
                key={faq}
                type="button"
                className="group flex w-full items-center justify-between p-6 text-left transition-all hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              >
                <span className="text-sm font-bold text-gray-900 transition-colors group-hover:text-primary-blue dark:text-white">
                  {faq}
                </span>
                <ExternalLink
                  size={14}
                  className="text-gray-400 transition-colors group-hover:text-primary-blue"
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-[2.5rem] border border-primary-blue/15 bg-primary-blue/5 p-8 text-center">
          <p className="mb-4 text-sm font-bold text-primary-blue">Still need help?</p>
          <h3 className="mb-6 text-xl font-black text-gray-900 dark:text-white">Contact business support</h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:support@aacp.io"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-blue px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary-blue/20 transition-all hover:bg-primary-blue-hover"
            >
              <MessageSquare size={16} aria-hidden />
              Email support
            </a>
            <a
              href="/messages"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-700 transition-all hover:border-primary-blue/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200"
            >
              <Book size={16} aria-hidden />
              Open messages
            </a>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
