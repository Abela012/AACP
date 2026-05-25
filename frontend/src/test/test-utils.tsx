import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '@/src/shared/context/UserContext';
import { ProfileProvider } from '@/src/shared/context/ProfileContext';
import { ThemeProvider } from '@/src/shared/context/ThemeContext';

type Options = {
  route?: string;
  userRole?: 'business_owner' | 'advertiser' | 'admin' | 'super_admin' | null;
  onboardingStatus?: 'incomplete' | 'pending' | 'approved';
};

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { route = '/', userRole = null, onboardingStatus = 'approved' } = options;

  if (userRole) {
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('onboardingStatus', onboardingStatus);
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <UserProvider>
            <ProfileProvider>
              <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </ProfileProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
