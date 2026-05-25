import type { ReactNode } from 'react';

type AuthState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
};

let authState: AuthState = {
  isLoaded: true,
  isSignedIn: false,
  userId: null,
};

export function __setClerkAuthState(state: Partial<AuthState>) {
  authState = { ...authState, ...state };
}

export function __resetClerkAuthState() {
  authState = { isLoaded: true, isSignedIn: false, userId: null };
}

export function useAuth() {
  return {
    isLoaded: authState.isLoaded,
    isSignedIn: authState.isSignedIn,
    userId: authState.userId,
    getToken: async () => (authState.isSignedIn ? 'mock-clerk-token' : null),
  };
}

export function useUser() {
  return {
    isLoaded: authState.isLoaded,
    isSignedIn: authState.isSignedIn,
    user: authState.isSignedIn
      ? {
          id: authState.userId,
          fullName: 'Test User',
          primaryEmailAddress: { emailAddress: 'test@aacp.local' },
        }
      : null,
  };
}

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignIn() {
  return <div data-testid="clerk-sign-in">Sign In</div>;
}

export function SignUp() {
  return <div data-testid="clerk-sign-up">Sign Up</div>;
}

export function AuthenticateWithRedirectCallback() {
  return <div data-testid="clerk-sso-callback">SSO</div>;
}
