import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { __setClerkAuthState, __resetClerkAuthState } from '@/src/shared/lib/clerk-mock';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const hasTikTokAuth = !!localStorage.getItem('tiktok_jwt');
  if (!isLoaded && !hasTikTokAuth) return null;
  if (!isSignedIn && !hasTikTokAuth) {
    return <div data-testid="redirect-login">redirect</div>;
  }
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const hasTikTokAuth = !!localStorage.getItem('tiktok_jwt');
  if (!isLoaded && !hasTikTokAuth) return null;
  if (isSignedIn || hasTikTokAuth) {
    return <div data-testid="redirect-dashboard">redirect</div>;
  }
  return <>{children}</>;
}

describe('Auth guards (App pattern)', () => {
  beforeEach(() => {
    __resetClerkAuthState();
    localStorage.clear();
  });

  it('blocks unauthenticated users from protected content', () => {
    __setClerkAuthState({ isLoaded: true, isSignedIn: false });

    render(
      <MemoryRouter>
        <AuthGuard>
          <div data-testid="secret">Secret</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByTestId('redirect-login')).toBeInTheDocument();
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
  });

  it('allows TikTok JWT without Clerk session', () => {
    __setClerkAuthState({ isLoaded: true, isSignedIn: false });
    localStorage.setItem('tiktok_jwt', 'demo-token');

    render(
      <MemoryRouter>
        <AuthGuard>
          <div data-testid="secret">Secret</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByTestId('secret')).toBeInTheDocument();
  });

  it('redirects signed-in users away from guest routes', () => {
    __setClerkAuthState({ isLoaded: true, isSignedIn: true });

    render(
      <MemoryRouter>
        <GuestGuard>
          <div data-testid="login-form">Login</div>
        </GuestGuard>
      </MemoryRouter>
    );

    expect(screen.getByTestId('redirect-dashboard')).toBeInTheDocument();
  });
});
