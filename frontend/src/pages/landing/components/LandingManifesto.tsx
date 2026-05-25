import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TRUST_PILLARS } from '../landingContent';

export default function LandingManifesto() {
  const navigate = useNavigate();

  return (
    <section id="trust" className="relative mx-3 overflow-hidden sm:mx-6 lg:mx-10">
      <div className="bg-neutral-dark px-6 py-20 sm:px-12 sm:py-28 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(228,214,169,0.12),transparent_45%)]" />

        <div className="relative mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-neutral-border/70">
              02 — Trust
            </p>
            <h2 className="mt-5 aacp-font-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.02] text-neutral-light">
              Verification, ratings,
              <span className="block italic text-neutral-border"> and accountability.</span>
            </h2>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-neutral-border/60">
              AACP connects Business Owners with Advertisers through admin-reviewed profiles,
              structured applications, collaboration tooling, Chapa payments, and Gemini-backed
              intelligence—not anonymous listings.
            </p>
          </motion.div>

          <ul className="space-y-10">
            {TRUST_PILLARS.map((p, i) => (
              <motion.li
                key={p.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.65 }}
                className="grid grid-cols-[3rem_1fr] gap-6 border-t border-neutral-border/15 pt-8"
              >
                <span className="aacp-font-display text-3xl text-neutral-border/40">{p.num}</span>
                <div>
                  <h3 className="aacp-font-display text-2xl text-neutral-light">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-border/55">{p.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto mt-16 flex max-w-[1200px] flex-col items-start justify-between gap-6 border border-neutral-border/20 bg-neutral-dark/30 p-8 sm:flex-row sm:items-center"
        >
          <p className="max-w-xl text-sm leading-relaxed text-neutral-border/55">
            Ready to post a campaign or apply as an advertiser? Create an account with Clerk, pick
            your role, and complete onboarding—SSO via Google or Facebook is available at sign-in.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth/register')}
            className="aacp-btn-primary shrink-0"
          >
            Register on AACP
          </button>
        </motion.div>
      </div>
    </section>
  );
}
