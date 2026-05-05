import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Shield, Scale, FileText, CheckCircle2, AlertCircle, Clock, ChevronRight, Download, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

const Section = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    className="mb-16 scroll-mt-24"
  >
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
        <Icon size={26} />
      </div>
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h2>
        <div className="h-1 w-12 bg-emerald-500 rounded-full mt-1 opacity-50" />
      </div>
    </div>
    <div className="prose prose-emerald dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium space-y-4">
      {children}
    </div>
  </motion.section>
);

export default function TermsOfService() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [activeSection, setActiveSection] = useState('agreement');

  const sections = [
    { id: 'agreement', title: 'Agreement', icon: FileText },
    { id: 'account', title: 'Account Registration', icon: Shield },
    { id: 'usage', title: 'Platform Usage', icon: CheckCircle2 },
    { id: 'payments', title: 'Payments & Coins', icon: Clock },
    { id: 'property', title: 'Intellectual Property', icon: Scale },
    { id: 'liability', title: 'Limitation of Liability', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a] selection:bg-emerald-500/30 font-sans">
      {/* Professional Reading Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-60 origin-left" style={{ scaleX }} />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">A</div>
            <span className="font-black text-2xl tracking-tighter text-gray-900 dark:text-white">AACP</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors" title="Print Document">
              <Printer size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors" title="Download PDF">
              <Download size={20} />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-2" />
            <Link to="/auth/register" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-black/5 dark:shadow-none">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16 pt-16">

        {/* Sidebar Navigation */}
        <aside className="hidden lg:block sticky top-32 h-fit">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Contents</h3>
          <nav className="space-y-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === s.id
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <s.icon size={16} />
                {s.title}
                {activeSection === s.id && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </a>
            ))}
          </nav>

          <div className="mt-12 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Need help?</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Our support team is available 24/7 for any legal inquiries.
            </p>
            <Link to="/help" className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">
              Contact Support <ChevronRight size={14} />
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="pb-32">
          {/* Hero Header */}
          <header className="mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest uppercase mb-8"
            >
              <Scale size={14} /> Official Documentation
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-8 leading-[0.95]"
            >
              Terms of <br />
              <span className="text-emerald-500">Service.</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400 font-bold text-sm"
            >
              <div className="flex items-center gap-2">
                <Clock size={16} /> Last Updated: May 5, 2026
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} /> Version 2.4.0
              </div>
            </motion.div>
          </header>

          <div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 md:p-16 shadow-2xl shadow-black/5">

            <Section id="agreement" title="1. Agreement to Terms" icon={FileText}>
              <p>
                Welcome to AACP (AI-powered Advertising and Influencer Analytics Platform). By accessing, browsing, or using our services, you signify your irrevocable agreement to be bound by these Terms of Service.
              </p>
              <p>
                If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms.
              </p>
              <div className="mt-8 p-6 rounded-4xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10 flex gap-4">
                <AlertCircle size={24} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200 leading-relaxed italic">
                  CAUTION: These terms contain a binding arbitration provision and a class action waiver. They affect your legal rights. Please read them thoroughly.
                </p>
              </div>
            </Section>

            <Section id="account" title="2. Account Registration" icon={Shield}>
              <p>To access the premium features of AACP, you must register for an authenticated account. During registration, you agree to:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  'Provide verified credentials',
                  'Maintain extreme security',
                  'Update data in real-time',
                  'Accept full responsibility'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="usage" title="3. Platform Usage" icon={CheckCircle2}>
              <p>
                AACP is a sophisticated marketplace connecting advertisers with businesses.
                Our AI-driven algorithms provide data-backed insights. Usage is strictly prohibited if:
              </p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>You engage in fraudulent traffic generation or metric manipulation.</li>
                <li>You attempt to reverse-engineer our proprietary AI matching engine.</li>
                <li>You bypass the platform's escrow and payment protocols.</li>
                <li>You misrepresent audience demographics or engagement rates.</li>
              </ul>
            </Section>

            <Section id="payments" title="4. Payments & Coins" icon={Clock}>
              <p>
                The platform utilizes a dual-currency system involving fiat and AACP Coins.
                Coins facilitate instant transactions and access to premium analytics.
              </p>
              <p className="text-sm italic opacity-80">
                Refunds are processed within 5-10 business days only for technical failures
                verified by our engineering audit team.
              </p>
            </Section>

            <Section id="property" title="5. Intellectual Property" icon={Scale}>
              <p>
                All proprietary technology, including the AACP AI engine, UI components, and
                brand assets, are protected by international intellectual property laws.
                Users retain ownership of their content but grant AACP a perpetual, worldwide,
                royalty-free license to utilize such content for platform improvement.
              </p>
            </Section>

            <Section id="liability" title="6. Limitation of Liability" icon={AlertCircle}>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AACP SHALL NOT BE LIABLE
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES,
                OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
            </Section>
          </div>
        </div>
      </div>

      {/* Modern Mini Footer */}
      <footer className="py-16 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-lg" />
            <span className="text-sm font-black text-gray-900 dark:text-white">AACP LEGAL</span>
          </div>
          <div className="flex gap-10 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            <Link to="/privacy-policy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link>
            <Link to="/help" className="hover:text-emerald-500 transition-colors">Help Center</Link>
            <Link to="/security" className="hover:text-emerald-500 transition-colors">Security</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 AACP Global Inc.</p>
        </div>
      </footer>
    </div>
  );
}
