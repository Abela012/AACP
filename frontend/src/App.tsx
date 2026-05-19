import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/clerk-react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
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
import BusinessCompleteProfilePage from './pages/profile/complete-profile/BusinessCompleteProfilePage'
import LandingPage from './pages/landing/LandingPage'
import ConversationPage from './pages/chat/conversation/ConversationPage'
import AdminDashboardPage from './pages/dashboard/admin/AdminDashboardPage'
import SuperAdminDashboardPage from './pages/dashboard/super-admin/SuperAdminDashboardPage'
import AdminUsersPage from './pages/admin/users/AdminUsersPage'
import AdminUserDetailPage from './pages/admin/users/AdminUserDetailPage'
import AdminSuspendedUserPage from './pages/admin/users/AdminSuspendedUserPage'
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
import EditCampaignPage from './pages/dashboard/business-owner/EditCampaignPage'
import CampaignApplicantsPage from './pages/dashboard/business-owner/CampaignApplicantsPage'
import PendingApprovalPage from './pages/auth/PendingApprovalPage'
import SSOCallbackPage from './pages/auth/SSOCallbackPage'
import SuperAdminAdminManagementPage from './pages/super-admin/admin-management/AdminManagementPage'
import SuperAdminAuditTrailPage from './pages/super-admin/audit-trail/AuditTrailPage'
import SuperAdminPlatformPage from './pages/super-admin/platform/PlatformPage'
import SuperAdminSecurityPage from './pages/super-admin/security/SecurityPage'
import SuperAdminNotificationsPage from './pages/super-admin/notifications/NotificationsPage'
import SuperAdminProfilePage from './pages/super-admin/profile/ProfilePage'
import RoleGuard from './core/guards/RoleGuard'
import TermsOfService from './pages/legal/TermsOfService'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import CollaborationsPage from './pages/collaboration/list/CollaborationsPage'
import CollaborationDetailsPage from './pages/collaboration/details/CollaborationDetailsPage'
import FacebookAnalyticsPage from './pages/social/facebook-analytics/FacebookAnalyticsPage'
import DataDeletionPage from './pages/social/DataDeletionPage'
import './App.css'

// Custom wrappers to support both Clerk Auth and Custom TikTok JWT
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const hasTikTokAuth = !!localStorage.getItem('tiktok_jwt');

  if (!isLoaded && !hasTikTokAuth) return null;
  if (!isSignedIn && !hasTikTokAuth) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
};

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const hasTikTokAuth = !!localStorage.getItem('tiktok_jwt');

  if (!isLoaded && !hasTikTokAuth) return null;
  if (isSignedIn || hasTikTokAuth) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function AdminVerificationRedirect() {
  const { id } = useParams()
  return <Navigate to={id ? `/admin/users/${id}?review=1` : '/admin/users'} replace />
}

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 6000 }} />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/auth/login"
          element={
            <GuestGuard>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </GuestGuard>
          }
        />
        <Route
          path="/auth/register"
          element={
            <GuestGuard>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </GuestGuard>
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            <GuestGuard>
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </GuestGuard>
          }
        />
        <Route
          path="/sso-callback"
          element={<SSOCallbackPage />}
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <RoleDashboardRedirectPage />
            </AuthGuard>
          }
        />

        {/* Business Owner Routes */}
        <Route
          path="/dashboard/business-owner"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <BusinessDashboardPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/campaigns"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <CampaignsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/campaign/:id/applicants"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <CampaignApplicantsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/campaign/new"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <CreateCampaignPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/campaign/edit/:id"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <EditCampaignPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/matches"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <MatchesPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/analytics"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <AnalyticsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/wallet"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <BalancePage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/business/buy-coins"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <BusinessBuyCoinsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/business/manual-checkout"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <BusinessManualCheckoutPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/business/checkout"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <BusinessCheckoutPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/profile/view/business"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <ViewProfilePage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/profile/edit/business"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <BusinessCompleteProfilePage mode="edit" />
              </RoleGuard>
            </AuthGuard>
          }
        />

        <Route
          path="/collaborations"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['business_owner']}>
                <CollaborationsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/collaborations/:id"
          element={
            <AuthGuard>
              <CollaborationDetailsPage />
            </AuthGuard>
          }
        />

        {/* Advertiser Routes */}
        <Route
          path="/dashboard/advertiser"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserDashboardPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/advertiser/campaigns"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserCampaignsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/advertiser/matches"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserMatchesPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/advertiser/matches/:id/apply"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserApplyMatchPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/advertiser/analytics"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserAnalyticsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/advertiser/wallet"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserBalancePage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/advertiser/checkout"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserCheckoutPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/advertiser/buy-coins"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserBuyCoinsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/advertiser/manual-checkout"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <AdvertiserManualCheckoutPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/profile/view/advertiser"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <ViewProfilePage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/profile/edit/advertiser"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <EditProfilePage />
              </RoleGuard>
            </AuthGuard>
          }
        />

        <Route
          path="/advertiser/collaborations"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={['advertiser']}>
                <CollaborationsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* Profile Completion / Common Redirects */}
        <Route
          path="/profile/complete/business"
          element={<BusinessCompleteProfilePage />}
        />
        <Route
          path="/profile/complete/advertiser"
          element={<CompleteProfilePage />}
        />
        <Route
          path="/pending-approval"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Public/Shared Profile View */}
        <Route
          path="/profile/:id"
          element={
            <AuthGuard>
              <ViewProfilePage />
            </AuthGuard>
          }
        />

        {/* Admin Specific Routes */}
        <Route path="/dashboard/admin" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminDashboardPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/users" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminUsersPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/users/:id" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminUserDetailPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/users/:id/suspended" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminSuspendedUserPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/verification" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/verification/:id" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminVerificationRedirect /></RoleGuard></AuthGuard>} />
        <Route path="/admin/payments" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminPaymentsPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/analytics" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminAnalyticsPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/settings" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminSettingsPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/notifications" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminNotificationsPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/profile" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminProfilePage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/disputes" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><DisputesPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/messages" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminChatPage /></RoleGuard></AuthGuard>} />
        <Route path="/admin/help" element={<AuthGuard><RoleGuard allowedRoles={['admin']}><AdminHelpPage /></RoleGuard></AuthGuard>} />

        {/* Super Admin Specific Routes */}
        <Route path="/dashboard/super-admin" element={<AuthGuard><RoleGuard allowedRoles={['super_admin']}><SuperAdminDashboardPage /></RoleGuard></AuthGuard>} />
        <Route path="/super-admin/admin-management" element={<AuthGuard><RoleGuard allowedRoles={['super_admin']}><SuperAdminAdminManagementPage /></RoleGuard></AuthGuard>} />
        <Route path="/super-admin/audit-trail" element={<AuthGuard><RoleGuard allowedRoles={['super_admin']}><SuperAdminAuditTrailPage /></RoleGuard></AuthGuard>} />
        <Route path="/super-admin/platform" element={<AuthGuard><RoleGuard allowedRoles={['super_admin']}><SuperAdminPlatformPage /></RoleGuard></AuthGuard>} />
        <Route path="/super-admin/security" element={<AuthGuard><RoleGuard allowedRoles={['super_admin']}><SuperAdminSecurityPage /></RoleGuard></AuthGuard>} />
        <Route path="/super-admin/notifications" element={<AuthGuard><RoleGuard allowedRoles={['super_admin']}><SuperAdminNotificationsPage /></RoleGuard></AuthGuard>} />
        <Route path="/super-admin/profile" element={<AuthGuard><RoleGuard allowedRoles={['super_admin']}><SuperAdminProfilePage /></RoleGuard></AuthGuard>} />

        {/* Chat / Common Auth Routes */}
        <Route
          path="/messages"
          element={
            <AuthGuard>
              <ConversationPage />
            </AuthGuard>
          }
        />

        {/* Facebook Analytics — accessible after SSO login */}
        <Route
          path="/facebook-analytics"
          element={
            <AuthGuard>
              <FacebookAnalyticsPage />
            </AuthGuard>
          }
        />

        {/* Legacy Balance Redirects */}
        <Route path="/balance" element={<Navigate to="/wallet" replace />} />
        <Route path="/advertiser/balance" element={<Navigate to="/advertiser/wallet" replace />} />

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Legal Pages */}
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App
