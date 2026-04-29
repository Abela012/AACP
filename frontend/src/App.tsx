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
import BusinessBuyCoinsPage from './pages/dashboard/business-owner/BuyCoinsPage'
import BusinessManualCheckoutPage from './pages/dashboard/business-owner/BusinessManualCheckoutPage'
import BusinessCheckoutPage from './pages/dashboard/business-owner/BusinessCheckoutPage'
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
import CompleteProfilePage from './pages/profile/complete-profile/CompleteProfilePage'
import LandingPage from './pages/landing/LandingPage'
import ConversationPage from './pages/chat/conversation/ConversationPage'
import AdminDashboardPage from './pages/dashboard/admin/AdminDashboardPage'
import SuperAdminDashboardPage from './pages/dashboard/super-admin/SuperAdminDashboardPage'
import AdminUsersPage from './pages/admin/users/AdminUsersPage'
import AdminUserDetailPage from './pages/admin/users/AdminUserDetailPage'
import AdminSuspendedUserPage from './pages/admin/users/AdminSuspendedUserPage'
import UserApprovalPage from './pages/admin/user-approval/UserApprovalPage'
import AdminPaymentsPage from './pages/admin/payments/AdminPaymentsPage'
import AdminAnalyticsPage from './pages/admin/analytics/AdminAnalyticsPage'
import AdminSettingsPage from './pages/admin/settings/AdminSettingsPage'
import DisputesPage from './pages/admin/disputes/DisputesPage'
import AdminNotificationsPage from './pages/admin/notifications/AdminNotificationsPage'
import AdminProfilePage from './pages/admin/profile/AdminProfilePage'
import AdminChatPage from './pages/admin/messages/AdminChatPage'
import AdminHelpPage from './pages/admin/help/AdminHelpPage'
import AuditLogsPage from './pages/system/audit-logs/AuditLogsPage'
import CreateCampaignPage from './pages/dashboard/business-owner/CreateCampaignPage'
import SuperAdminAdminManagementPage from './pages/super-admin/admin-management/AdminManagementPage'
import SuperAdminAuditTrailPage from './pages/super-admin/audit-trail/AuditTrailPage'
import SuperAdminPlatformPage from './pages/super-admin/platform/PlatformPage'
import SuperAdminSecurityPage from './pages/super-admin/security/SecurityPage'
import SuperAdminNotificationsPage from './pages/super-admin/notifications/NotificationsPage'
import SuperAdminProfilePage from './pages/super-admin/profile/ProfilePage'
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
        path="/dashboard/admin"
        element={<AdminDashboardPage />}
      />
      <Route
        path="/dashboard/super-admin"
        element={<SuperAdminDashboardPage />}
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

      {/* Admin Specific Routes */}
      <Route
        path="/admin/users"
        element={<SignedIn><AdminUsersPage /></SignedIn>}
      />
      <Route
        path="/admin/users/:id"
        element={<SignedIn><AdminUserDetailPage /></SignedIn>}
      />
      <Route
        path="/admin/users/:id/suspended"
        element={<SignedIn><AdminSuspendedUserPage /></SignedIn>}
      />
      <Route
        path="/admin/verification/:id"
        element={<SignedIn><UserApprovalPage /></SignedIn>}
      />
      <Route
        path="/admin/payments"
        element={<SignedIn><AdminPaymentsPage /></SignedIn>}
      />
      <Route
        path="/admin/analytics"
        element={<SignedIn><AdminAnalyticsPage /></SignedIn>}
      />
      <Route
        path="/admin/settings"
        element={<SignedIn><AdminSettingsPage /></SignedIn>}
      />
      <Route
        path="/admin/notifications"
        element={<SignedIn><AdminNotificationsPage /></SignedIn>}
      />
      <Route
        path="/admin/profile"
        element={<SignedIn><AdminProfilePage /></SignedIn>}
      />
      <Route
        path="/admin/disputes"
        element={<SignedIn><DisputesPage /></SignedIn>}
      />
      <Route
        path="/admin/messages"
        element={<SignedIn><AdminChatPage /></SignedIn>}
      />
      <Route
        path="/admin/help"
        element={<SignedIn><AdminHelpPage /></SignedIn>}
      />
      <Route
        path="/admin/logs"
        element={<SignedIn><AuditLogsPage /></SignedIn>}
      />

      {/* Super Admin Specific Routes */}
      <Route
        path="/super-admin/admin-management"
        element={<SignedIn><SuperAdminAdminManagementPage /></SignedIn>}
      />
      <Route
        path="/super-admin/audit-trail"
        element={<SignedIn><SuperAdminAuditTrailPage /></SignedIn>}
      />
      <Route
        path="/super-admin/platform"
        element={<SignedIn><SuperAdminPlatformPage /></SignedIn>}
      />
      <Route
        path="/super-admin/security"
        element={<SignedIn><SuperAdminSecurityPage /></SignedIn>}
      />
      <Route
        path="/super-admin/notifications"
        element={<SignedIn><SuperAdminNotificationsPage /></SignedIn>}
      />
      <Route
        path="/super-admin/profile"
        element={<SignedIn><SuperAdminProfilePage /></SignedIn>}
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
        path="/campaign/new"
        element={
          <>
            <SignedIn><CreateCampaignPage /></SignedIn>
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
        path="/business/buy-coins"
        element={
          <>
            <SignedIn><BusinessBuyCoinsPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/business/manual-checkout"
        element={
          <>
            <SignedIn><BusinessManualCheckoutPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/business/checkout"
        element={
          <>
            <SignedIn><BusinessCheckoutPage /></SignedIn>
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
            <SignedIn><CompleteProfilePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/profile/complete/advertiser"
        element={
          <>
            <SignedIn><CompleteProfilePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/profile/edit/business"
        element={
          <>
            <SignedIn><EditProfilePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
      <Route
        path="/profile/edit/advertiser"
        element={
          <>
            <SignedIn><EditProfilePage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/messages"
        element={
          <>
            <SignedIn><ConversationPage /></SignedIn>
            <SignedOut><Navigate to="/auth/login" replace /></SignedOut>
          </>
        }
      />
    </Routes>
  )
}

export default App
