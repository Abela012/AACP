import { createContext, useContext, useState, type ReactNode } from 'react';

type UserRole = 'business' | 'advertiser' | null;
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
  // Initialize from localStorage to persist state across refreshes in this mock app
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('userRole') as UserRole) || null;
  });
  
  const [onboardingStatus, setOnboardingStatusState] = useState<OnboardingStatus>(() => {
    return (localStorage.getItem('onboardingStatus') as OnboardingStatus) || 'incomplete';
  });

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
