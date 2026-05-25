import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function LandingInvitation() {
  const navigate = useNavigate();

  return (
    <section id="invite" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden border border-primary-blue/30 bg-gradient-to-br from-neutral-border/45 via-neutral-light to-neutral-light px-8 py-14 sm:px-14 sm:py-18"
        >
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rotate-12 bg-primary-blue/12 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_auto] lg:items-center">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary-blue">
                04 — Start
              </p>
              <h2 className="mt-4 aacp-font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] text-neutral-dark">
                Post an opportunity or apply with your profile.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-medium sm:text-base">
                Business owners publish campaigns in the opportunities module. Advertisers spend
                wallet coins to apply, then move into collaborations with chat, deliverables, and
                reviews when accepted.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="aacp-btn-primary shrink-0"
              >
                Create account
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="aacp-btn-ghost shrink-0"
              >
                Sign in
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
