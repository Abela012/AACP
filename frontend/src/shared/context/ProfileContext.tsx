import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useApiClient } from '@/src/api/apiClient';
import { userApi } from '@/src/api/userApi';
import { useUser } from '@clerk/clerk-react';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  businessName: string;
  website: string;
  industry: string;
  avatarUrl: string;
  coverImageUrl: string;
  phone: string;
  businessLocation?: string;
  companySize?: string;
  targetAudienceTags?: string[];
  monthlyBudget?: number;
  selectedPlatforms?: string[];
  youtubeHandle?: string;
  tiktokHandle?: string;
  followers?: string;
  avgViews?: string;
  engagementRate?: string;
  geoTags?: string[];
  ageRanges?: string[];
  primaryLanguage?: string;
  baseRate?: string;
  selectedStyles?: string[];
}

interface ProfileContextType {
  profile: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
}

const EMPTY_PROFILE: ProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  bio: '',
  businessName: '',
  website: '',
  industry: '',
  avatarUrl: '',
  coverImageUrl: '',
  phone: '',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApiClient();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();

  const refreshProfile = async () => {
    if (!isSignedIn) {
        setIsLoading(false);
        return;
    }
    try {
      const response = await userApi.getMe(api);
      const userData = response.data.user;
      if (userData) {
        setProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          avatarUrl: userData.profilePicture || '',
          coverImageUrl: userData.coverImage || '',
          ...userData.profileData,
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // User not synced yet. This is expected for brand new users.
        console.log('[ProfileContext] User not found yet. Awaiting sync...');
      } else {
        console.error('[ProfileContext] Failed to fetch profile:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshProfile();
    } else if (isLoaded && !isSignedIn) {
        setProfile(EMPTY_PROFILE);
        setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...data };
      return next;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, refreshProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
