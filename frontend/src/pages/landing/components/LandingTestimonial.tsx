import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'AACP turned our creator outreach from spreadsheets into a verified pipeline—we see match scores, applicants, and ROI in one place.',
    role: 'Business owner',
    name: 'Campaign lead, Addis Ababa',
  },
  {
    quote:
      'The AI match feed surfaces opportunities that actually fit my niche and platform, so I spend coins where collaborations are likely to convert.',
    role: 'Advertiser',
    name: 'Creator partner',
  },
] as const;

export default function LandingTestimonial() {
  return (
    <section id="testimonial" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="mb-14 max-w-3xl">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary-blue">
            Built for the full collaboration lifecycle
          </p>
          <h2 className="mt-3 aacp-font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.06] text-neutral-dark">
            From discovery through payment—<span className="italic text-primary-blue">one platform.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-medium sm:text-base">
            Teams use AACP for AI-assisted matching, structured applications, active collaborations,
            Chapa payments, and post-campaign analytics—not disconnected tools.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {TESTIMONIALS.map((item, i) => (
            <motion.blockquote
              key={item.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.65 }}
              className="relative border border-primary-blue/25 bg-white/85 p-8 shadow-sm backdrop-blur-sm"
            >
              <Quote className="h-8 w-8 text-primary-blue/40" strokeWidth={1.25} aria-hidden />
              <p className="mt-4 text-base leading-relaxed text-neutral-dark sm:text-lg">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-6 border-t border-primary-blue/15 pt-4">
                <p className="text-sm font-semibold text-neutral-dark">{item.name}</p>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-primary-blue">
                  {item.role}
                </p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
