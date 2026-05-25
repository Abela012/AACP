import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import ThemeToggle from '@/src/shared/components/ThemeToggle';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="aacp-grain aacp-font-body flex min-h-dvh w-full bg-neutral-light text-neutral-dark dark:bg-[#12100d] dark:text-neutral-light">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-neutral-dark p-10 lg:flex xl:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(228,214,169,0.14),transparent_50%)]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-primary-blue/20 blur-[100px]" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-baseline gap-3 border-b border-neutral-border/25 pb-2">
            <span className="aacp-font-display text-3xl text-neutral-light">AACP</span>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-neutral-border/50">
              Marketplace
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md"
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-neutral-border/55">
            AI Advertisement Collaboration Platform
          </p>
          <h2 className="mt-4 aacp-font-display text-[clamp(2.5rem,4vw,3.75rem)] leading-[1.05] text-neutral-light">
            Match, collaborate,
            <span className="block italic text-neutral-border">and measure.</span>
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-neutral-border/50">
            AI recommendations, campaign applications, collaboration workspaces, Chapa coin
            payments, profile verification, and Gemini-powered analytics—for business owners and
            advertisers.
          </p>
        </motion.div>

        <div className="relative z-10 flex items-center justify-between border-t border-neutral-border/15 pt-8 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-neutral-border/40">
          <span>© {new Date().getFullYear()} AACP</span>
          <div className="flex gap-5">
            <Link to="/privacy-policy" className="hover:text-neutral-light">
              Privacy
            </Link>
            <Link to="/terms-of-service" className="hover:text-neutral-light">
              Terms
            </Link>
          </div>
        </div>
      </aside>

      <div className="relative flex w-full flex-col justify-center px-6 py-16 sm:px-10 lg:w-[56%] lg:px-14 xl:px-20">
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between sm:top-8 sm:left-10 sm:right-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-neutral-medium transition-colors hover:text-neutral-dark dark:text-neutral-border/50 dark:hover:text-neutral-light"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Home
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
