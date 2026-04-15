import { SignedIn, SignedOut, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './pages/auth/AuthLayout'
import LoginPage from './pages/auth/login/LoginPage'
import RegisterPage from './pages/auth/register/RegisterPage'
import ForgotPasswordPage from './pages/auth/forgot-password/ForgotPasswordPage'
import RoleDashboardRedirectPage from './pages/dashboard/RoleDashboardRedirectPage'
import BusinessDashboardPage from './pages/dashboard/business-owner/BusinessDashboardPage'
import AdvertiserDashboardPage from './pages/dashboard/advertiser/AdvertiserDashboardPage'
import CampaignsPage from './pages/dashboard/business-owner/CampaignsPage'
import MatchesPage from './pages/dashboard/business-owner/MatchesPage'
import AnalyticsPage from './pages/dashboard/business-owner/AnalyticsPage'
import BalancePage from './pages/dashboard/business-owner/BalancePage'
import AdvertiserCampaignsPage from './pages/dashboard/advertiser/AdvertiserCampaignsPage'
import AdvertiserMatchesPage from './pages/dashboard/advertiser/AdvertiserMatchesPage'
import AdvertiserApplyMatchPage from './pages/dashboard/advertiser/AdvertiserApplyMatchPage'
import AdvertiserAnalyticsPage from './pages/dashboard/advertiser/AdvertiserAnalyticsPage'
import AdvertiserBalancePage from './pages/dashboard/advertiser/AdvertiserBalancePage'
import AdvertiserCheckoutPage from './pages/dashboard/advertiser/AdvertiserCheckoutPage'
import AdvertiserBuyCoinsPage from './pages/dashboard/advertiser/AdvertiserBuyCoinsPage'
import AdvertiserManualCheckoutPage from './pages/dashboard/advertiser/AdvertiserManualCheckoutPage'
import ViewProfilePage from './pages/profile/view-profile/ViewProfilePage'
import EditProfilePage from './pages/profile/edit-profile/EditProfilePage'
import LandingPage from './pages/landing/LandingPage'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth/login"
        element={
          <>
            <SignedOut>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        }
      />
      <Route
        path="/auth/register"
        element={
          <>
            <SignedOut>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <>
            <SignedOut>
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        }
      />
      <Route
        path="/sso-callback"
        element={
          <>
            <SignedOut>
              <AuthenticateWithRedirectCallback signInForceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard" />
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <>
            <SignedIn>
              <RoleDashboardRedirectPage />
            </SignedIn>
            <SignedOut>
              <Navigate to="/auth/login" replace />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/dashboard/business-owner"
        element={
          <>
            <SignedIn>
              <BusinessDashboardPage />
            </SignedIn>
            <SignedOut>
              <Navigate to="/auth/login" replace />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/dashboard/advertiser"
        element={
          <>
            <SignedIn>
              <AdvertiserDashboardPage />
            </SignedIn>
            <SignedOut>
              <Navigate to="/auth/login" replace />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/campaigns"
        element={
          <>
            <SignedIn><CampaignsPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/matches"
        element={
          <>
            <SignedIn><MatchesPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/analytics"
        element={
          <>
            <SignedIn><AnalyticsPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/balance"
        element={
          <>
            <SignedIn><BalancePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/advertiser/campaigns"
        element={
          <>
            <SignedIn><AdvertiserCampaignsPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/advertiser/matches"
        element={
          <>
            <SignedIn><AdvertiserMatchesPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/advertiser/matches/:id/apply"
        element={
          <>
            <SignedIn><AdvertiserApplyMatchPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/advertiser/analytics"
        element={
          <>
            <SignedIn><AdvertiserAnalyticsPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/advertiser/balance"
        element={
          <>
            <SignedIn><AdvertiserBalancePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/advertiser/checkout"
        element={
          <>
            <SignedIn><AdvertiserCheckoutPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/advertiser/buy-coins"
        element={
          <>
            <SignedIn><AdvertiserBuyCoinsPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/advertiser/manual-checkout"
        element={
          <>
            <SignedIn><AdvertiserManualCheckoutPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/profile/view/business"
        element={
          <>
            <SignedIn><ViewProfilePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/profile/view/advertiser"
        element={
          <>
            <SignedIn><ViewProfilePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/profile/complete/business"
        element={
          <>
            <SignedIn><EditProfilePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/profile/complete/advertiser"
        element={
          <>
            <SignedIn><EditProfilePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default App
