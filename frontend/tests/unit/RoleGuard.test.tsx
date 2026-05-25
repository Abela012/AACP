import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import RoleGuard from '@/src/core/guards/RoleGuard';
import { renderWithProviders } from '@/src/test/test-utils';
import { __setClerkAuthState, __resetClerkAuthState } from '@/src/shared/lib/clerk-mock';

vi.mock('@/src/api/apiClient', () => ({
  useApiClient: () => ({ get: vi.fn(), post: vi.fn() }),
}));

vi.mock('@/src/api/userApi', () => ({
  userApi: {
    getMe: vi.fn(),
  },
}));

import { userApi } from '@/src/api/userApi';

function ProtectedPage() {
  return <div data-testid="protected-content">Protected</div>;
}

describe('RoleGuard', () => {
  beforeEach(() => {
    __resetClerkAuthState();
    localStorage.clear();
    vi.mocked(userApi.getMe).mockReset();
  });

  it('renders children when role is allowed via localStorage', async () => {
    __setClerkAuthState({ isLoaded: true, isSignedIn: true, userId: 'user_1' });
    vi.mocked(userApi.getMe).mockResolvedValue({
      data: { user: { role: 'business_owner', onboardingStatus: 'approved' } },
    } as never);

    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <RoleGuard allowedRoles={['business_owner']}>
              <ProtectedPage />
            </RoleGuard>
          }
        />
      </Routes>,
      { route: '/', userRole: 'business_owner' }
    );

    expect(await screen.findByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects when role is not in allowedRoles', async () => {
    __setClerkAuthState({ isLoaded: true, isSignedIn: true });
    vi.mocked(userApi.getMe).mockResolvedValue({
      data: { user: { role: 'advertiser', onboardingStatus: 'approved' } },
    } as never);

    renderWithProviders(
      <Routes>
        <Route path="/dashboard" element={<div data-testid="dashboard-hub">Hub</div>} />
        <Route
          path="/"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <ProtectedPage />
            </RoleGuard>
          }
        />
      </Routes>,
      { route: '/', userRole: 'advertiser' }
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
