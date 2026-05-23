import { motion } from 'framer-motion';
import { CORE_CAPABILITIES } from '../landingContent';

export default function LandingDiscovery() {
  return (
    <section id="capabilities" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-aacp-olive">
              01 — Platform
            </p>
            <h2 className="mt-3 aacp-font-display text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.05] text-aacp-ink">
              Built for the full
              <br />
              <span className="italic">collaboration lifecycle.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-aacp-smoke lg:text-right">
            From AI-assisted discovery through verified onboarding, campaign applications, active
            collaborations, payments, and analytics—AACP covers what teams actually run day to day.
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
                className={`group relative flex flex-col justify-between overflow-hidden border border-aacp-olive/25 bg-aacp-cream/60 p-6 transition-colors hover:border-aacp-olive/50 hover:bg-aacp-gold/20 sm:p-8 ${cap.span} ${cap.tall ? 'min-h-[240px] lg:min-h-[300px]' : 'min-h-[180px]'}`}
              >
                <Icon className="h-5 w-5 text-aacp-olive" strokeWidth={1.25} />
                <div className="mt-auto pt-8">
                  <h3 className="aacp-font-display text-2xl text-aacp-ink sm:text-[1.65rem]">{cap.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-aacp-smoke">{cap.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
