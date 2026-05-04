import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useUser as useClerkUser, useAuth } from '@clerk/clerk-react';
import { connectSocket, getSocket } from '@/src/api/socketService';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

type UserRole = 'business_owner' | 'advertiser' | 'admin' | 'super_admin' | null;
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
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  // Initialize from localStorage to persist state across refreshes
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('userRole') as UserRole) || null;
  });
  
  const [onboardingStatus, setOnboardingStatusState] = useState<OnboardingStatus>(() => {
    // Only trust 'approved' from localStorage (safe to cache).
    // 'pending' and 'incomplete' must always be re-validated by useUserSync
    // to avoid showing the wrong screen to new users on re-login.
    const stored = localStorage.getItem('onboardingStatus') as OnboardingStatus;
    return stored === 'approved' ? 'approved' : 'incomplete';
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

  // Real-time Status Updates via Socket.IO
  useEffect(() => {
    if (!isSignedIn) return;

    let mounted = true;

    const initSocket = async () => {
      const token = await getToken();
      if (!token || !mounted) return;

      const socket = connectSocket(token);

      socket.on('user:status_update', (data: { status: string }) => {
        if (!mounted) return;
        
        console.log('[UserContext] Real-time status update received:', data.status);
        
        // Map backend status to frontend OnboardingStatus
        let newStatus: OnboardingStatus = 'incomplete';
        if (data.status === 'pending') newStatus = 'pending';
        if (data.status === 'active' || data.status === 'approved') newStatus = 'approved';

        if (newStatus !== onboardingStatus) {
          setOnboardingStatus(newStatus);
          
          // Invalidate all queries to refresh data across the dashboard
          queryClient.invalidateQueries();

          // Visual Feedback
          if (newStatus === 'approved') {
            toast.success('Your account has been approved! Dashboard unlocked.', {
              duration: 6000,
              icon: '🎉',
              style: { borderRadius: '16px', background: '#10b981', color: '#fff' }
            });
          }
        }
      });
    };

    initSocket();

    return () => {
      mounted = false;
      const socket = getSocket();
      if (socket) {
        socket.off('user:status_update');
      }
    };
  }, [isSignedIn, getToken, onboardingStatus, queryClient]);

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
