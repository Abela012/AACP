import { SignedIn, SignedOut, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './pages/auth/AuthLayout'
import LoginPage from './pages/auth/login/LoginPage'
import RegisterPage from './pages/auth/register/RegisterPage'
import ForgotPasswordPage from './pages/auth/forgot-password/ForgotPasswordPage'
import DashboardPage from './pages/dashboard/DashboardPage'
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
              <Navigate to="/" replace />
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
              <Navigate to="/" replace />
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
              <Navigate to="/" replace />
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
              <Navigate to="/" replace />
            </SignedIn>
          </>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={
          <>
            <SignedIn>
              <DashboardPage />
            </SignedIn>
            <SignedOut>
              <Navigate to="/auth/login" replace />
            </SignedOut>
          </>
        }
      />

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default App
