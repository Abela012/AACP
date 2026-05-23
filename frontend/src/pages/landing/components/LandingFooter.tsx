import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer className="border-t border-aacp-olive/25 bg-aacp-charcoal text-aacp-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="aacp-font-display text-4xl text-aacp-gold">
              AACP
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-aacp-gold/50">
              AI Advertisement Collaboration Platform — connecting Business Owners and Advertisers
              with recommendations, collaborations, and verified trust.
            </p>
          </div>

          {[
            {
              title: 'Product',
              links: [
                { label: 'Capabilities', href: '#capabilities' },
                { label: 'Trust & verification', href: '#trust' },
                { label: 'Modules', href: '#modules' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Register', to: '/auth/register' },
                { label: 'Sign in', to: '/auth/login' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Terms', to: '/terms-of-service' },
                { label: 'Privacy', to: '/privacy-policy' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-aacp-gold/45">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link ? (
                      <Link
                        to={link.to}
                        className="text-sm text-aacp-gold/65 transition-colors hover:text-aacp-cream"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-aacp-gold/65 transition-colors hover:text-aacp-cream"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-aacp-gold/10 pt-8 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-aacp-gold/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} AACP</span>
          <span>Node · Express · MongoDB · Gemini · Chapa</span>
        </div>
      </div>
    </footer>
  );
}
