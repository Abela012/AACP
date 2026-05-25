import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { ArrowUpRight, Check } from 'lucide-react';
import { HERO_FEATURES, PLATFORM_TAGLINE } from '../landingContent';
import { useUser } from '../../../shared/context/UserContext';

const ease = [0.22, 1, 0.36, 1] as const;

/** Returns the direct dashboard path for a role, avoiding the /dashboard redirect chain. */
function roleDashboardPath(role: string | null | undefined): string {
  switch (role) {
    case 'business_owner': return '/dashboard/business-owner';
    case 'advertiser':     return '/dashboard/advertiser';
    case 'admin':          return '/dashboard/admin';
    case 'super_admin':    return '/dashboard/super-admin';
    default:               return '/dashboard';
  }
}

export default function LandingHero() {
  const navigate = useNavigate();
  const { userRole } = useUser();

  const handleDashboardClick = () => {
    // Prefer in-memory context, fall back to localStorage cache.
    const role = userRole || localStorage.getItem('userRole');
    navigate(roleDashboardPath(role), { replace: false });
  };

  return (
    <section id="hero" className="relative min-h-svh overflow-hidden pt-28 sm:pt-32">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/aacp-landing-hero-bg.png')" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-neutral-light/95 via-neutral-light/80 to-neutral-light/40" />
      <div className="landing-vignette pointer-events-none absolute inset-0" />
      <div className="landing-hero-glow pointer-events-none absolute -left-20 top-16 h-[75vh] w-[75vw] opacity-60" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-px w-2/3 bg-linear-to-l from-primary-blue/40 to-transparent" />

      <p
        className="pointer-events-none absolute right-0 top-[22%] hidden origin-center rotate-90 font-mono text-[0.5rem] uppercase tracking-[0.5em] text-primary-blue/45 xl:block"
        aria-hidden
      >
        AI Advertisement Collaboration Platform
      </p>

      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch lg:gap-10 lg:px-12 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          className="relative z-10 flex flex-col justify-center lg:py-6"
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

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.12, ease }}
          className="relative z-10 flex flex-col justify-end"
        >
          <div className="relative border border-primary-blue/35 bg-linear-to-br from-neutral-border/70 via-neutral-light to-neutral-light p-6 shadow-[28px_40px_72px_-28px_rgba(26,22,16,0.38)] sm:p-8">
            <div className="absolute inset-4 border border-primary-blue/15 pointer-events-none" />

            <p className="relative font-mono text-[0.6rem] uppercase tracking-[0.28em] text-neutral-medium">
              How it works
            </p>
            <ol className="relative mt-6 space-y-5">
              {[
                {
                  step: '01',
                  title: 'Onboard & verify',
                  body: 'Business owners and advertisers complete profiles; admins approve before full access.',
                },
                {
                  step: '02',
                  title: 'Match with AI',
                  body: 'Recommendations rank partners by niche, platform, engagement, budget, and fit.',
                },
                {
                  step: '03',
                  title: 'Collaborate & measure',
                  body: 'Chat, deliverables, coins via Chapa, reviews, and analytics through completion.',
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-primary-blue/20 pt-5 first:border-t-0 first:pt-0"
                >
                  <span className="aacp-font-display text-2xl text-primary-blue/70">{item.step}</span>
                  <div>
                    <h3 className="aacp-font-display text-xl text-neutral-dark">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-medium">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <div className="aacp-surface-card p-4">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-neutral-medium">For brands</p>
              <p className="mt-2 text-sm leading-snug text-neutral-medium">
                Post opportunities, review applicants, manage collaborations.
              </p>
            </div>
            <div className="aacp-surface-card p-4">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-neutral-medium">For creators</p>
              <p className="mt-2 text-sm leading-snug text-neutral-medium">
                Apply to campaigns, negotiate in chat, grow verified reputation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto flex max-w-[1400px] items-center justify-between border-t border-primary-blue/20 px-5 py-5 sm:px-8 lg:px-12">
        <a
          href="#capabilities"
          className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-neutral-medium transition-colors hover:text-neutral-dark"
        >
          Explore platform
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
