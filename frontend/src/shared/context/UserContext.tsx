import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';

type UserRole = 'business' | 'advertiser' | 'admin' | 'super_admin' | null;
type OnboardingStatus = 'incomplete' | 'pending' | 'approved';

interface UserContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onboardingStatus: OnboardingStatus;
  setOnboardingStatus: (status: OnboardingStatus) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useClerkUser();

  // Initialize from localStorage to persist state across refreshes
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('userRole') as UserRole) || null;
  });
  
  const [onboardingStatus, setOnboardingStatusState] = useState<OnboardingStatus>(() => {
    return (localStorage.getItem('onboardingStatus') as OnboardingStatus) || 'incomplete';
  });

  // Keep track of the current user to detect session changes
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('currentClerkId'));

  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser) {
      // User logged out - clear all local state
      logout();
      setCurrentUserId(null);
      localStorage.removeItem('currentClerkId');
    } else if (clerkUser.id !== currentUserId) {
      // Different user logged in - reset state to prevent leaks from previous user
      console.log("[UserProvider] Session change detected. Resetting local state.");
      setUserRole(null);
      setOnboardingStatus('incomplete');
      setCurrentUserId(clerkUser.id);
      localStorage.setItem('currentClerkId', clerkUser.id);
    }
  }, [clerkUser, isLoaded, currentUserId]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole');
    }
  };

  const setOnboardingStatus = (status: OnboardingStatus) => {
    setOnboardingStatusState(status);
    localStorage.setItem('onboardingStatus', status);
  };

  const logout = () => {
    setUserRole(null);
    setOnboardingStatus('incomplete');
    localStorage.removeItem('userRole');
    localStorage.removeItem('onboardingStatus');
  };

  return (
    <UserContext.Provider value={{ userRole, setUserRole, onboardingStatus, setOnboardingStatus, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
