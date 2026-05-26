import { motion } from 'framer-motion';

const STEPS = [
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
] as const;

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative border-t border-primary-blue/15 bg-neutral-light/90 py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary-blue">
          How it works
        </p>
        <h2 className="mt-3 aacp-font-display max-w-2xl text-[clamp(2rem,5vw,3.25rem)] leading-[1.08] text-neutral-dark">
          Three steps from signup to measurable campaigns
        </h2>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((item, i) => (
            <motion.li
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="border border-primary-blue/20 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8"
            >
              <span className="aacp-font-display text-3xl text-primary-blue/70">{item.step}</span>
              <h3 className="mt-4 aacp-font-display text-xl text-neutral-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-medium">{item.body}</p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <div className="aacp-surface-card p-5">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-neutral-medium">For brands</p>
            <p className="mt-2 text-sm leading-snug text-neutral-medium">
              Post opportunities, review applicants, manage collaborations.
            </p>
          </div>
          <div className="aacp-surface-card p-5">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-neutral-medium">For creators</p>
            <p className="mt-2 text-sm leading-snug text-neutral-medium">
              Apply to campaigns, negotiate in chat, grow verified reputation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
