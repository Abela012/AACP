import { motion } from 'framer-motion';
import { PLATFORM_MODULES, ROLE_PATHS } from '../landingContent';

export default function LandingPlatform() {
  return (
    <section id="modules" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="mb-14 max-w-2xl">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary-blue">
            03 — Modules
          </p>
          <h2 className="mt-3 aacp-font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.06] text-neutral-dark">
            Everything in one <span className="italic">connected</span> system
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-neutral-medium sm:text-base">
            These are live product areas in AACP—matching, messaging, wallet, SSO, AI analytics, and
            campaign management—not roadmap placeholders.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.article
                key={mod.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="group border border-primary-blue/25 bg-neutral-light/50 p-6 transition-colors hover:border-primary-blue/45 hover:bg-neutral-border/15 sm:p-7"
              >
                <Icon className="h-5 w-5 text-primary-blue" strokeWidth={1.25} />
                <h3 className="mt-5 aacp-font-display text-xl text-neutral-dark">{mod.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-medium">{mod.detail}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {ROLE_PATHS.map((path) => (
            <div
              key={path.role}
              className="border border-primary-blue/25 bg-neutral-border/15 px-6 py-7"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-primary-blue">
                {path.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-medium">{path.actions}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
