import { motion } from 'framer-motion';
import { CORE_CAPABILITIES } from '../landingContent';

export default function LandingDiscovery() {
  return (
    <section id="capabilities" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary-blue">
              01 — Platform
            </p>
            <h2 className="mt-3 aacp-font-display text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.05] text-neutral-dark">
              Core capabilities for
              <br />
              <span className="italic text-primary-blue">modern brand–creator teams.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-neutral-medium lg:text-right">
            AI matching, opportunities, collaboration workspaces, wallets, and analytics—everything
            your team needs in one verified marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(140px,auto)]">
          {CORE_CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.article
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex flex-col justify-between overflow-hidden border border-primary-blue/25 bg-neutral-light/60 p-6 transition-colors hover:border-primary-blue/50 hover:bg-neutral-border/20 sm:p-8 ${cap.span} ${cap.tall ? 'min-h-[240px] lg:min-h-[300px]' : 'min-h-[180px]'}`}
              >
                <Icon className="h-5 w-5 text-primary-blue" strokeWidth={1.25} />
                <div className="mt-auto pt-8">
                  <h3 className="aacp-font-display text-2xl text-neutral-dark sm:text-[1.65rem]">{cap.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-medium">{cap.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
