import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useApiClient } from '@/src/api/apiClient';
import { userApi } from '@/src/api/userApi';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useUser as useAppUser } from './UserContext';

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
  instagramHandle?: string;
  xHandle?: string;

  followers?: string | number;
  avgViews?: number;
  engagementRate?: number;
  geoTags?: string[];
  niches?: string[];
  ageRanges?: string[];
  primaryLanguage?: string;
  baseRate?: string;
  selectedStyles?: string[];
  _id?: string;
  clerkId?: string;
  tiktok?: any;
  instagram?: any;
  facebook?: any;
  facebookConnected?: boolean;
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
  const { isLoaded, isSignedIn, user: clerkUser } = useClerkUser();
  const { setUserRole } = useAppUser();

  const refreshProfile = async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await userApi.getMe(api);
      const userData = response.data.user;
      if (userData) {
        if (userData.role) {
          setUserRole(userData.role);
          localStorage.setItem('userRole', userData.role);
        }
        // Compute flattened metrics (followers, avgViews, engagementRate)
        const computeNum = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.toUpperCase().replace(/[^0-9.KMB]/g, '');
            let multiplier = 1;
            if (cleaned.endsWith('K')) multiplier = 1000;
            else if (cleaned.endsWith('M')) multiplier = 1000000;
            else if (cleaned.endsWith('B')) multiplier = 1000000000;
            const num = parseFloat(cleaned.replace(/[KMB]/g, ''));
            return isNaN(num) ? 0 : num * multiplier;
          }
          return 0;
        };

        const pd = userData.profileData || {};
        const t = pd.tiktok || {};
        const i = pd.instagram || {};

        const followersTotal = computeNum(t.followers) + computeNum(i.followers);
        const avgViewsTotal = computeNum(t.avgViews) + computeNum(i.avgViews);

        const computeER = (p: any) => {
          const stored = computeNum(p.engagementRate);
          if (stored > 0 && stored <= 100) return stored;
          const f = computeNum(p.followers);
          if (f <= 0) return 0;
          const likes = computeNum(p.totalLikes);
          const comments = computeNum(p.avgComments);
          const shares = computeNum(p.avgShares);
          const raw = ((likes + comments + shares) / f) * 100;
          return Math.min(raw, 100);
        };

        const erTik = computeER(t);
        const erIg = computeER(i);
        const maxER = Math.max(erTik, erIg);

        setProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          avatarUrl: userData.profilePicture || '',
          coverImageUrl: userData.coverImage || '',
          _id: userData._id,
          clerkId: userData.clerkId,
          ...pd,
          // flattened convenience fields used by many components
          followers: followersTotal,
          avgViews: avgViewsTotal,
          engagementRate: parseFloat(maxER.toFixed(2)),
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
