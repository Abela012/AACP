import { useState } from 'react';
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

  return (
    <header className="fixed inset-x-0 top-0 z-50 aacp-font-body">
      <div className="mx-auto flex max-w-[1400px] items-end justify-between gap-6 px-5 py-5 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="group flex items-baseline gap-3 border-b border-aacp-olive/30 pb-1"
        >
          <span className="aacp-font-display text-3xl font-semibold tracking-tight text-aacp-ink sm:text-4xl">
            AACP
          </span>
          <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.35em] text-aacp-smoke sm:inline">
            AI collaboration
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-aacp-smoke transition-colors hover:text-aacp-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <SignedOut>
            <Link
              to="/auth/login"
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-aacp-smoke transition-colors hover:text-aacp-ink"
            >
              Sign in
            </Link>
            <Link to="/auth/register" className="aacp-btn-primary text-[0.7rem]">
              Register
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="aacp-btn-primary text-[0.7rem]">
              Dashboard
            </Link>
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="h-9 w-9 border border-aacp-olive/40 object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center border border-aacp-olive/40 bg-aacp-gold/40 aacp-font-display text-lg text-aacp-ink">
                {user?.firstName?.[0]}
              </span>
            )}
          </SignedIn>
        </div>

        <button
          type="button"
          className="flex flex-col gap-1.5 p-2 lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-px w-7 bg-aacp-ink transition-transform ${open ? 'translate-y-[5px] rotate-45' : ''}`}
          />
          <span className={`block h-px w-5 bg-aacp-olive transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span
            className={`block h-px w-7 bg-aacp-ink transition-transform ${open ? '-translate-y-[5px] -rotate-45' : ''}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-t border-aacp-olive/25 bg-aacp-cream/95 px-6 py-8 backdrop-blur-md lg:hidden"
          >
            <ul className="space-y-5">
              {links.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="aacp-font-display text-3xl text-aacp-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <SignedOut>
                  <div className="flex flex-col gap-3">
                    <Link to="/auth/login" onClick={() => setOpen(false)} className="aacp-btn-ghost w-full">
                      Sign in
                    </Link>
                    <Link to="/auth/register" onClick={() => setOpen(false)} className="aacp-btn-primary w-full">
                      Register
                    </Link>
                  </div>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="aacp-btn-primary w-full">
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
