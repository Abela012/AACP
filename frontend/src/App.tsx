import { Routes, Route } from 'react-router-dom'
import { SignedIn, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
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

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default App
