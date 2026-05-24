import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { href: '#capabilities', label: 'Platform' },
  { href: '#trust', label: 'Trust' },
  { href: '#modules', label: 'Modules' },
  { href: '#invite', label: 'Start' },
];

export default function LandingNav() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const sections = ['hero', 'capabilities', 'trust', 'modules', 'invite'];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: '-30% 0px -40% 0px',
          threshold: 0.1,
        }
      );

      observer.observe(el);
      return { observer, el };
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  const isDarkHeader = activeSection === 'trust';

  const headerClass = `fixed inset-x-0 top-0 z-50 aacp-font-body transition-all duration-500 ease-out ${scrolled
      ? isDarkHeader
        ? 'py-3.5 bg-aacp-charcoal/90 border-b border-aacp-gold/15 backdrop-blur-xl shadow-lg shadow-black/25'
        : 'py-3.5 bg-aacp-cream/90 border-b border-aacp-olive/15 backdrop-blur-xl shadow-md shadow-aacp-olive/5'
      : 'py-5 bg-transparent border-b border-transparent'
    }`;

  const logoTextClass = `aacp-font-display text-3xl font-semibold tracking-tight transition-colors duration-500 ${scrolled && isDarkHeader ? 'text-aacp-cream' : 'text-aacp-ink'
    } sm:text-4xl`;

  const logoBorderClass = `group flex items-baseline gap-3 border-b pb-1 transition-colors duration-500 ${scrolled && isDarkHeader ? 'border-aacp-gold/25 hover:border-aacp-gold' : 'border-aacp-olive/25 hover:border-aacp-ink'
    }`;

  const getNavLinkClass = (href: string) => {
    const isActive = href === `#${activeSection}`;
    return `relative py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.22em] transition-colors duration-500 ${scrolled && isDarkHeader
        ? isActive ? 'text-aacp-gold' : 'text-aacp-gold/55 hover:text-aacp-cream'
        : isActive ? 'text-aacp-olive' : 'text-aacp-smoke hover:text-aacp-ink'
      }`;
  };

  const signInClass = `font-mono text-[0.65rem] uppercase tracking-[0.2em] transition-colors duration-500 ${scrolled && isDarkHeader ? 'text-aacp-gold/60 hover:text-aacp-cream' : 'text-aacp-smoke hover:text-aacp-ink'
    }`;

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 transition-all duration-500 sm:px-8 lg:px-12">
        <Link
          to="/"
          className={logoBorderClass}
        >
          <span className={logoTextClass}>
            AACP
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={getNavLinkClass(item.href)}
            >
              {item.label}
              {`#${activeSection}` === item.href && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full ${scrolled && isDarkHeader ? 'bg-aacp-gold' : 'bg-aacp-olive'
                    }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-6 lg:flex">
          <SignedOut>
            <Link
              to="/auth/login"
              className={signInClass}
            >
              Sign in
            </Link>
            <Link to="/auth/register" className="aacp-btn-primary text-[0.7rem] py-2.5! px-5! transition-transform duration-300">
              Register
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="aacp-btn-primary text-[0.7rem] py-2.5! px-5! transition-transform duration-300">
              Dashboard
            </Link>
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className={`h-9 w-9 border object-cover transition-colors duration-500 ${scrolled && isDarkHeader ? 'border-aacp-gold/40' : 'border-aacp-olive/40'
                  }`}
              />
            ) : (
              <span className={`flex h-9 w-9 items-center justify-center border bg-aacp-gold/40 aacp-font-display text-lg transition-all duration-500 ${scrolled && isDarkHeader ? 'border-aacp-gold/40 text-aacp-cream' : 'border-aacp-olive/40 text-aacp-ink'
                }`}>
                {user?.firstName?.[0]}
              </span>
            )}
          </SignedIn>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          className="flex flex-col gap-1.5 p-2 lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-px w-7 transition-all duration-500 ${open ? 'translate-y-[7.5px] rotate-45' : ''
              } ${scrolled && isDarkHeader ? 'bg-aacp-cream' : 'bg-aacp-ink'}`}
          />
          <span className={`block h-px w-5 transition-opacity duration-300 ${open ? 'opacity-0' : 'opacity-100'
            } ${scrolled && isDarkHeader ? 'bg-aacp-gold/70' : 'bg-aacp-olive'}`} />
          <span
            className={`block h-px w-7 transition-all duration-500 ${open ? '-translate-y-[7.5px] -rotate-45' : ''
              } ${scrolled && isDarkHeader ? 'bg-aacp-cream' : 'bg-aacp-ink'}`}
          />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`border-t px-6 py-8 backdrop-blur-md lg:hidden transition-colors duration-500 ${isDarkHeader
                ? 'border-aacp-gold/15 bg-aacp-charcoal/95'
                : 'border-aacp-olive/25 bg-aacp-cream/95'
              }`}
          >
            <ul className="space-y-5">
              {links.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`aacp-font-display text-3xl transition-colors duration-300 ${isDarkHeader ? 'text-aacp-cream hover:text-aacp-gold' : 'text-aacp-ink hover:text-aacp-olive'
                      }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-4 border-t border-aacp-olive/15 mt-6">
                <SignedOut>
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/auth/login"
                      onClick={() => setOpen(false)}
                      className={`aacp-btn-ghost w-full justify-center transition-colors duration-300 ${isDarkHeader ? 'border-aacp-gold/40 text-aacp-cream bg-white/5' : ''
                        }`}
                    >
                      Sign in
                    </Link>
                    <Link to="/auth/register" onClick={() => setOpen(false)} className="aacp-btn-primary w-full justify-center">
                      Register
                    </Link>
                  </div>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="aacp-btn-primary w-full justify-center">
                    Dashboard
                  </Link>
                </SignedIn>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
