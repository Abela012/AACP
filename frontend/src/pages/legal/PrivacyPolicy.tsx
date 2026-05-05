import React, { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ShieldCheck, Eye, Lock, Database, Globe, Mail, CheckCircle2, ChevronRight, Fingerprint, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Section = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    className="mb-20 scroll-mt-24"
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

export default function PrivacyPolicy() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [activeSection, setActiveSection] = useState('collection');

  const sections = [
    { id: 'collection', title: 'Data Collection', icon: Database },
    { id: 'usage', title: 'Data Usage', icon: Eye },
    { id: 'security', title: 'Security Protocols', icon: Lock },
    { id: 'services', title: 'Privacy Services', icon: RefreshCcw },
    { id: 'thirdparty', title: 'Third-Party Partners', icon: Globe },
    { id: 'rights', title: 'Your Data Rights', icon: Fingerprint },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-[#0a0a0a] selection:bg-emerald-500/30 font-sans">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-60 origin-left" style={{ scaleX }} />

      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">A</div>
            <span className="font-black text-2xl tracking-tighter text-gray-900 dark:text-white">AACP</span>
          </Link>
          <Link to="/auth/register" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16 pt-16">

        <aside className="hidden lg:block sticky top-32 h-fit">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Policy Sections</h3>
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
              </a>
            ))}
          </nav>
        </aside>

        <div className="pb-32">
          <header className="mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest uppercase mb-8"
            >
              <ShieldCheck size={14} /> Security-First Platform
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-8 leading-[0.95]"
            >
              Privacy <br />
              <span className="text-emerald-500">Policy.</span>
            </motion.h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
              Your data is your asset. We treat it with the highest level of cryptographic
              security and transparency.
            </p>
          </header>

          <div className="bg-white dark:bg-[#111] rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 md:p-16 shadow-2xl shadow-black/5">

            <Section id="collection" title="1. Information We Collect" icon={Database}>
              <p>
                We collect information to provide unmatched services. This includes:
              </p>
              <ul className="list-none space-y-4 mt-6">
                {[
                  { label: 'Identity Data', desc: 'Encrypted name, email, and biometric verification data.' },
                  { label: 'Social Metadata', desc: 'API-level access to social reach, engagement, and audience growth.' },
                  { label: 'Transaction Logs', desc: 'Secure hash of all financial interactions within the marketplace.' },
                  { label: 'Network Data', desc: 'Masked IP addresses and encrypted session identifiers.' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-[10px] font-black">{i + 1}</div>
                    <div>
                      <span className="block font-black text-gray-900 dark:text-white">{item.label}</span>
                      <span className="text-sm opacity-80">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="usage" title="2. How We Use Data" icon={Eye}>
              <p>We use your data to power the AACP ecosystem:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <h4 className="font-black mb-2">AI Optimization</h4>
                  <p className="text-sm opacity-70">Powering our match-making engine to find the perfect synergy between businesses and creators.</p>
                </div>
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <h4 className="font-black mb-2">Marketplace Integrity</h4>
                  <p className="text-sm opacity-70">Ensuring all campaign participants meet our high-fidelity verification standards.</p>
                </div>
              </div>
            </Section>

            <Section id="security" title="3. Security Protocols" icon={Lock}>
              <p>
                AACP utilizes state-of-the-art security including AES-256 encryption for data
                at rest and TLS 1.3 for all communications. Our infrastructure undergoes
                monthly penetration testing by certified third-party security audits.
              </p>
            </Section>

            <Section id="services" title="4. Privacy Services" icon={RefreshCcw}>
              <p>
                We provide specialized privacy-focused services to protect our users'
                competitive advantage:
              </p>
              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-4 p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="p-2 bg-emerald-500 rounded-xl text-white">
                    <Fingerprint size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-900 dark:text-emerald-300">Identity Masking</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 opacity-80">Option to remain anonymous in public listings while retaining verified status.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="p-2 bg-emerald-500 rounded-xl text-white">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-900 dark:text-emerald-300">Data Vaulting</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 opacity-80">Highly sensitive business strategies are stored in isolated, air-gapped secure vaults.</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section id="thirdparty" title="5. Third-Party Partners" icon={Globe}>
              <p>
                We integrate with official social media APIs (Facebook, Instagram, TikTok)
                to sync metrics. These partners only receive the minimum data necessary
                to facilitate authentication and data ingestion.
              </p>
            </Section>

            <Section id="rights" title="6. Your Data Rights" icon={Fingerprint}>
              <p>
                Under GDPR and CCPA regulations, you have full control over your data.
                You can request a data purge, an export of all stored information,
                or revoke API permissions at any time through your dashboard.
              </p>
            </Section>

            <div className="mt-24 pt-16 border-t border-gray-100 dark:border-white/5 text-center">
              <Mail className="w-10 h-10 text-emerald-500 mx-auto mb-6" />
              <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Privacy Questions?</h4>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Reach our DPO at privacy@aacp.io</p>
              <Link to="/auth/register" className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black shadow-xl">
                Secure Your Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-16 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-lg" />
            <span className="text-sm font-black text-gray-900 dark:text-white">AACP LEGAL</span>
          </div>
          <div className="flex gap-10 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            <Link to="/terms-of-service" className="hover:text-emerald-500 transition-colors">Terms of Service</Link>
            <Link to="/help" className="hover:text-emerald-500 transition-colors">Help Center</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 AACP Global Inc.</p>
        </div>
      </footer>
    </div>
  );
}
