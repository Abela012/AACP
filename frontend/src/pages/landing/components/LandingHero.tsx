import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { ArrowUpRight, Check } from 'lucide-react';
import { HERO_FEATURES, PLATFORM_TAGLINE } from '../landingContent';
import { useUser } from '../../../shared/context/UserContext';

const ease = [0.22, 1, 0.36, 1] as const;

function roleDashboardPath(role: string | null | undefined): string {
  switch (role) {
    case 'business_owner':
      return '/dashboard/business-owner';
    case 'advertiser':
      return '/dashboard/advertiser';
    case 'admin':
      return '/dashboard/admin';
    case 'super_admin':
      return '/dashboard/super-admin';
    default:
      return '/dashboard';
  }
}

export default function LandingHero() {
  const navigate = useNavigate();
  const { userRole } = useUser();

  const handleDashboardClick = () => {
    const role = userRole || localStorage.getItem('userRole');
    navigate(roleDashboardPath(role), { replace: false });
  };

  return (
    <section id="hero" className="relative min-h-[88svh] overflow-hidden pt-28 sm:pt-32 lg:min-h-svh">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-[center_30%] bg-no-repeat"
        style={{ backgroundImage: "url('/images/aacp-landing-hero-bg.png')" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-neutral-light/96 via-neutral-light/88 to-neutral-light/25 lg:to-transparent" />
      <div className="landing-vignette pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-px w-2/3 bg-linear-to-l from-primary-blue/40 to-transparent" />

      <div className="relative mx-auto flex max-w-[1400px] flex-col px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          className="relative z-10 max-w-3xl py-6 lg:max-w-2xl lg:py-12"
        >
          <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.32em] text-primary-blue">
            AACP — Advertise &amp; Connect
          </p>

          <h1 className="aacp-font-display max-w-[14ch] text-[clamp(2.75rem,8.5vw,6.25rem)] font-medium leading-[0.94] tracking-[-0.03em] text-neutral-dark">
            Smarter collaborations between{' '}
            <span className="italic text-primary-blue">brands</span> and{' '}
            <span className="italic text-primary-blue">creators.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-[1.65] text-neutral-medium sm:text-[1.05rem]">
            {PLATFORM_TAGLINE}
          </p>

          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2 sm:gap-x-6">
            {HERO_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-medium">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-blue" strokeWidth={1.75} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <SignedOut>
              <button type="button" onClick={() => navigate('/auth/register')} className="aacp-btn-primary">
                Create account
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <Link to="/auth/login" className="aacp-btn-ghost">
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <button type="button" onClick={handleDashboardClick} className="aacp-btn-primary">
                Go to dashboard
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </SignedIn>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between border-t border-primary-blue/20 px-5 py-5 sm:px-8 lg:px-12">
        <a
          href="#how-it-works"
          className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-neutral-medium transition-colors hover:text-neutral-dark"
        >
          How it works
        </a>
        <SignedOut>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-primary-blue transition-colors hover:text-neutral-dark"
          >
            Get started <ArrowUpRight className="h-3 w-3" />
          </Link>
        </SignedOut>
      </div>
    </section>
  );
}
