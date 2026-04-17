import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './shared/context/UserContext'
import { ThemeProvider } from './shared/context/ThemeContext'
import { ProfileProvider } from './shared/context/ProfileContext'

// Global React Query client
const queryClient = new QueryClient()

// Clerk Publishable Key (from environment)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/auth/login"
      signUpUrl="/auth/register"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <UserProvider>
            <ProfileProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ProfileProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
)
