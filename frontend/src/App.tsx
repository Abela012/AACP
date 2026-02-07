import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import AuthLayout from './pages/auth/AuthLayout'
import LoginPage from './pages/auth/login/LoginPage'
import RegisterPage from './pages/auth/register/RegisterPage'
import ForgotPasswordPage from './pages/auth/forgot-password/ForgotPasswordPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/auth/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
      <Route path="/auth/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback signInForceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard" />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={
          <SignedIn>
            <DashboardPage />
          </SignedIn>
        }
      />

      {/* Default redirect or dashboard redirect if signed in */}
      <Route
        path="/"
        element={
          <>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
            <SignedOut>
              <Navigate to="/auth/login" replace />
            </SignedOut>
          </>
        }
      />
    </Routes>
  )
}

export default App
