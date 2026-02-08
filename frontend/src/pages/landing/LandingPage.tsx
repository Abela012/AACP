import { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Megaphone,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

/* ─── Animation Variants ─── */
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ─── Data ─── */
const features = [
  {
    icon: Megaphone,
    title: 'Smart Campaigns',
    description:
      'Launch precision-targeted ad campaigns powered by intelligent algorithms that find your perfect audience.',
    color: '#0FE073',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description:
      'Monitor every metric in real-time with beautifully crafted dashboards and actionable conversion insights.',
    color: '#22D3EE',
  },
  {
    icon: Users,
    title: 'Creator Network',
    description:
      'Tap into a curated marketplace of advertisers and businesses ready to collaborate and co-create.',
    color: '#A78BFA',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Reach',
    description:
      'Every impression is authenticated. Enterprise-grade verification ensures zero fraudulent ad placement.',
    color: '#F59E0B',
  },
];

const stats = [
  { value: '10K+', label: 'Active Campaigns' },
  { value: '98%', label: 'Verified Reach' },
  { value: '2.4M', label: 'Impressions / Day' },
  { value: '4.8★', label: 'Platform Rating' },
];

/* ─── Component ─── */
export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#060A08] text-gray-100 font-sans overflow-x-hidden selection:bg-[#0FE073]/30 selection:text-white">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#060A08]/70 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#0F1E16] border border-[#2A3E31] flex items-center justify-center text-[#0FE073] transition-all group-hover:border-[#0FE073]/50 group-hover:shadow-[0_0_20px_rgba(15,224,115,0.15)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-wide text-white">AACP</span>
            </Link>

            {/* Nav Links (desktop) */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#stats" className="hover:text-white transition-colors">Stats</a>
              <a href="#cta" className="hover:text-white transition-colors">Get Started</a>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-3">
              <SignedOut>
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:inline-block"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0FE073] text-sm font-bold text-black hover:bg-[#0BC463] transition-all shadow-lg shadow-[#0FE073]/20 hover:shadow-[#0FE073]/40 active:scale-[0.97]"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0FE073] text-sm font-bold text-black hover:bg-[#0BC463] transition-all shadow-lg shadow-[#0FE073]/20 hover:shadow-[#0FE073]/40 active:scale-[0.97]"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#0FE073] opacity-[0.07] blur-[150px]" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#22D3EE] opacity-[0.05] blur-[130px]" />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#0FE073] opacity-[0.03] blur-[100px]" />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center"
        >
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge */}
            <motion.div variants={fadeUp} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0FE073]/10 border border-[#0FE073]/20 text-[#0FE073] text-xs font-bold uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5" />
                Now in Public Beta
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8"
            >
              <span className="text-white">Empowering</span>
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0FE073] to-[#22D3EE]">
                Creative
              </span>{' '}
              <span className="text-white">Intelligence</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Where AI meets advertising excellence. Connect advertisers with businesses,
              launch verified campaigns, and ensure authentic, measurable ad reach — all in one platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignedOut>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0FE073] text-base font-bold text-black shadow-xl shadow-[#0FE073]/25 transition-all hover:bg-[#0BC463] hover:shadow-[#0FE073]/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Creating For Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-gray-300 bg-white/5 border border-white/8 backdrop-blur-sm hover:bg-white/0.08 hover:border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                  <ChevronRight className="w-4 h-4" />
                </button>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0FE073] text-base font-bold text-black shadow-xl shadow-[#0FE073]/25 transition-all hover:bg-[#0BC463] hover:shadow-[#0FE073]/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Enter Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignedIn>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#060A08] to-transparent pointer-events-none" />
      </section>

      {/* ─── Stats Bar ─── */}
      <section id="stats" className="relative py-20 border-y border-white/6 bg-[#080C0A]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/6"
          >
            {stats.map((stat, i) => (
              <motion.div key={i} variants={scaleIn} className="text-center px-4">
                <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-b from-white to-gray-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="relative py-28 bg-[#060A08]">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#0FE073] opacity-[0.03] blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0FE073]/10 border border-[#0FE073]/20 text-[#0FE073] text-xs font-bold uppercase tracking-widest mb-6">
              Platform Capabilities
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl font-bold text-white mb-5"
            >
              Everything you need to{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0FE073] to-[#22D3EE]">
                succeed
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">
              A complete toolkit for advertisers and businesses to collaborate, launch campaigns,
              and measure authentic results.
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="group relative p-8 sm:p-10 rounded-2xl bg-[#0A1410] border border-white/6 hover:border-white/12 transition-all duration-500 overflow-hidden"
                >
                  {/* Card glow on hover */}
                  <div
                    className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-700 pointer-events-none"
                    style={{ backgroundColor: feature.color + '15' }}
                  />

                  <div className="relative z-10">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: feature.color + '15',
                        border: `1px solid ${feature.color}25`,
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section className="py-28 bg-[#080C0A] border-t border-white/6">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0FE073]/10 border border-[#0FE073]/20 text-[#0FE073] text-xs font-bold uppercase tracking-widest mb-6">
              How it Works
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-white mb-5">
              Three steps to{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0FE073] to-[#22D3EE]">launch</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign up as a business owner or advertiser and set up your professional profile in minutes.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Launch Campaign',
                desc: 'Post opportunities or apply to collaborate. Our matching engine connects the right partners.',
                icon: TrendingUp,
              },
              {
                step: '03',
                title: 'Track & Grow',
                desc: 'Monitor verified impressions, analyze conversion data, and scale your winning strategies.',
                icon: BarChart3,
              },
            ].map((item, i) => {
              const StepIcon = item.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative p-8 rounded-2xl bg-[#0A1410] border border-white/6 text-center group hover:border-[#0FE073]/20 transition-all duration-500"
                >
                  <div className="text-[#0FE073]/30 text-6xl font-black absolute top-4 right-6 select-none">{item.step}</div>
                  <div className="w-14 h-14 rounded-xl bg-[#0FE073]/10 border border-[#0FE073]/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <StepIcon className="w-7 h-7 text-[#0FE073]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="cta" className="relative py-32 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#0FE073] opacity-[0.06] blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to accelerate <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0FE073] to-[#22D3EE]">
                your growth?
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
              Join the next generation of advertisers and businesses building authentic connections and driving verifiable results.
            </motion.p>
            <motion.div variants={fadeUp}>
              <SignedOut>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-[#0FE073] text-lg font-bold text-black shadow-2xl shadow-[#0FE073]/30 transition-all hover:bg-[#0BC463] hover:shadow-[#0FE073]/50 hover:scale-[1.03] active:scale-[0.98]"
                >
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </button>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-[#0FE073] text-lg font-bold text-black shadow-2xl shadow-[#0FE073]/30 transition-all hover:bg-[#0BC463] hover:shadow-[#0FE073]/50 hover:scale-[1.03] active:scale-[0.98]"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              </SignedIn>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/6 bg-[#060A08] py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1E16] border border-[#2A3E31] flex items-center justify-center text-[#0FE073]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">AACP</span>
          </div>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} AACP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
