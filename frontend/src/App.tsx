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
import CampaignApplicantsPage from './pages/dashboard/business-owner/CampaignApplicantsPage'
import PendingApprovalPage from './pages/auth/PendingApprovalPage'
import SuperAdminAdminManagementPage from './pages/super-admin/admin-management/AdminManagementPage'
import SuperAdminAuditTrailPage from './pages/super-admin/audit-trail/AuditTrailPage'
import SuperAdminPlatformPage from './pages/super-admin/platform/PlatformPage'
import SuperAdminSecurityPage from './pages/super-admin/security/SecurityPage'
import SuperAdminNotificationsPage from './pages/super-admin/notifications/NotificationsPage'
import SuperAdminProfilePage from './pages/super-admin/profile/ProfilePage'
import RoleGuard from './core/guards/RoleGuard'
import CollaborationsPage from './pages/collaboration/list/CollaborationsPage'
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
      
      {/* Business Owner Routes */}
      <Route
        path="/dashboard/business-owner"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <BusinessDashboardPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/campaigns"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <CampaignsPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/campaign/:id/applicants"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <CampaignApplicantsPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/campaign/new"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <CreateCampaignPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/matches"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <MatchesPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/analytics"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <AnalyticsPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/balance"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <BalancePage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/business/buy-coins"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <BusinessBuyCoinsPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/business/manual-checkout"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <BusinessManualCheckoutPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/business/checkout"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <BusinessCheckoutPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/profile/view/business"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <ViewProfilePage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/profile/edit/business"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <EditProfilePage />
            </RoleGuard>
          </SignedIn>
        }
      />

      <Route
        path="/collaborations"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['business_owner']}>
              <CollaborationsPage />
            </RoleGuard>
          </SignedIn>
        }
      />

      {/* Advertiser Routes */}
      <Route
        path="/dashboard/advertiser"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserDashboardPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/advertiser/campaigns"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserCampaignsPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/advertiser/matches"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserMatchesPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/advertiser/matches/:id/apply"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserApplyMatchPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/advertiser/analytics"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserAnalyticsPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/advertiser/balance"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserBalancePage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/advertiser/checkout"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserCheckoutPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/advertiser/buy-coins"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserBuyCoinsPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/advertiser/manual-checkout"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <AdvertiserManualCheckoutPage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/profile/view/advertiser"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <ViewProfilePage />
            </RoleGuard>
          </SignedIn>
        }
      />
      <Route
        path="/profile/edit/advertiser"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <EditProfilePage />
            </RoleGuard>
          </SignedIn>
        }
      />

      <Route
        path="/advertiser/collaborations"
        element={
          <SignedIn>
            <RoleGuard allowedRoles={['advertiser']}>
              <CollaborationsPage />
            </RoleGuard>
          </SignedIn>
        }
      />

      {/* Profile Completion / Common Redirects */}
      <Route
        path="/profile/complete/business"
        element={<CompleteProfilePage />}
      />
      <Route
        path="/profile/complete/advertiser"
        element={<CompleteProfilePage />}
      />
      <Route
        path="/pending-approval"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Admin Specific Routes */}
      <Route path="/dashboard/admin" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminDashboardPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/users" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminUsersPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/users/:id" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminUserDetailPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/users/:id/suspended" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminSuspendedUserPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/verification" element={<Navigate to="/admin/users" replace />} />
      <Route path="/admin/verification/:id" element={<SignedIn><RoleGuard allowedRoles={['admin']}><UserApprovalPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/payments" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminPaymentsPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/analytics" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminAnalyticsPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/settings" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminSettingsPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/notifications" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminNotificationsPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/profile" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminProfilePage /></RoleGuard></SignedIn>} />
      <Route path="/admin/disputes" element={<SignedIn><RoleGuard allowedRoles={['admin']}><DisputesPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/messages" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminChatPage /></RoleGuard></SignedIn>} />
      <Route path="/admin/help" element={<SignedIn><RoleGuard allowedRoles={['admin']}><AdminHelpPage /></RoleGuard></SignedIn>} />

      {/* Super Admin Specific Routes */}
      <Route path="/dashboard/super-admin" element={<SignedIn><RoleGuard allowedRoles={['super_admin']}><SuperAdminDashboardPage /></RoleGuard></SignedIn>} />
      <Route path="/super-admin/admin-management" element={<SignedIn><RoleGuard allowedRoles={['super_admin']}><SuperAdminAdminManagementPage /></RoleGuard></SignedIn>} />
      <Route path="/super-admin/audit-trail" element={<SignedIn><RoleGuard allowedRoles={['super_admin']}><SuperAdminAuditTrailPage /></RoleGuard></SignedIn>} />
      <Route path="/super-admin/platform" element={<SignedIn><RoleGuard allowedRoles={['super_admin']}><SuperAdminPlatformPage /></RoleGuard></SignedIn>} />
      <Route path="/super-admin/security" element={<SignedIn><RoleGuard allowedRoles={['super_admin']}><SuperAdminSecurityPage /></RoleGuard></SignedIn>} />
      <Route path="/super-admin/notifications" element={<SignedIn><RoleGuard allowedRoles={['super_admin']}><SuperAdminNotificationsPage /></RoleGuard></SignedIn>} />
      <Route path="/super-admin/profile" element={<SignedIn><RoleGuard allowedRoles={['super_admin']}><SuperAdminProfilePage /></RoleGuard></SignedIn>} />

      {/* Chat / Common Auth Routes */}
      <Route
        path="/messages"
        element={
          <SignedIn>
            <ConversationPage />
          </SignedIn>
        }
      />

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default App
