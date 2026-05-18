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
  coverImage?: string;
  phone: string;
  businessLocation?: string;
  companySize?: string;
  targetAudienceTags?: string[];
  monthlyBudget?: number;
  selectedPlatforms?: string[];
  youtubeHandle?: string;
  tiktokHandle?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  xHandle?: string;

  followers?: string | number;
  avgViews?: number | string;
  engagementRate?: number | string;
  geoTags?: string[];
  niches?: string[];
  ageRanges?: string[];
  primaryLanguage?: string;
  baseRate?: string;
  niche?: string;
  contentTypes?: string[];
  experienceLevel?: string;
  targetAudience?: {
    ageRange?: string;
    gender?: string;
    interests?: string[];
  };
  selectedStyles?: string[];
  _id?: string;
  clerkId?: string;
  role?: string;
  status?: string;
  tiktok?: any;
  instagram?: any;
  facebook?: any;
  facebookConnected?: boolean;
  socialProfiles?: any[];
  connectedAccounts?: any;
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
  const { isLoaded, isSignedIn } = useClerkUser();
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
        const ppd = userData.pendingProfileData || {};
        const pud = userData.pendingUpdates || {};

        // ── PRIMARY: Read from new connectedAccounts schema (advertiser verification) ──
        const ca = userData.connectedAccounts || {};
        const caT = ca.tiktok?.metrics || {};
        const caI = ca.instagram?.metrics || {};
        const caF = ca.facebook?.metrics || {};

        // ── FALLBACK: Old socialProfiles (creator TikTok connection model) ──
        const socialProfiles = userData.socialProfiles || [];
        const tiktokProfile = socialProfiles.find((p: any) => p.platform?.toLowerCase() === 'tiktok');
        const instagramProfile = socialProfiles.find((p: any) => p.platform?.toLowerCase() === 'youtube' || p.platform?.toLowerCase() === 'instagram');

        const fallbackTiktok = tiktokProfile ? {
          username: tiktokProfile.username || '',
          followers: tiktokProfile.followers || tiktokProfile.tiktokAnalytics?.followers || 0,
          totalLikes: tiktokProfile.tiktokAnalytics?.totalLikes || tiktokProfile.tiktokAnalytics?.avgLikes || 0,
          avgViews: tiktokProfile.tiktokAnalytics?.avgViews || 0,
          avgComments: tiktokProfile.tiktokAnalytics?.avgComments || 0,
          avgShares: tiktokProfile.tiktokAnalytics?.avgShares || 0,
          accountType: tiktokProfile.tiktokAnalytics?.accountType || 'Creator',
          profileLink: tiktokProfile.profileLink || `https://www.tiktok.com/@${tiktokProfile.username}`,
          postingFrequency: tiktokProfile.postingFrequency || '3-5 per week',
          niche: tiktokProfile.niches || [],
          audienceGender: tiktokProfile.audience?.genderDistribution?.male > tiktokProfile.audience?.genderDistribution?.female ? 'Mostly Male' : 'Mixed',
          audienceTopCountry: tiktokProfile.audience?.topCountries?.[0]?.country || '',
          audienceAgeRange: '18-24',
          contentStyle: tiktokProfile.contentStyles || []
        } : {};

        const fallbackInstagram = instagramProfile ? {
          username: instagramProfile.username || '',
          followers: instagramProfile.followers || instagramProfile.youtubeAnalytics?.subscribers || 0,
          totalLikes: instagramProfile.youtubeAnalytics?.engagementMetrics?.likes || 0,
          avgViews: instagramProfile.youtubeAnalytics?.impressions || 0,
          avgComments: instagramProfile.youtubeAnalytics?.engagementMetrics?.comments || 0,
          avgShares: instagramProfile.youtubeAnalytics?.engagementMetrics?.shares || 0,
          accountType: 'Creator',
          profileLink: instagramProfile.profileLink || `https://instagram.com/${instagramProfile.username}`,
          postingFrequency: instagramProfile.postingFrequency || '3-5 per week',
          niche: instagramProfile.niches || [],
          audienceGender: instagramProfile.audience?.genderDistribution?.male > instagramProfile.audience?.genderDistribution?.female ? 'Mostly Male' : 'Mixed',
          audienceTopCountry: instagramProfile.audience?.topCountries?.[0]?.country || '',
          audienceAgeRange: '18-24',
          contentStyle: instagramProfile.contentStyles || []
        } : {};

        const mergeAnalytics = (fallback: any, pdObj: any, ppdObj: any) => {
          const merged = { ...fallback };
          const sources = [pdObj || {}, ppdObj || {}];
          for (const src of sources) {
            for (const key of Object.keys(src)) {
              const val = src[key];
              if (val !== undefined && val !== null && val !== '' && val !== 0) {
                merged[key] = val;
              }
            }
          }
          return merged;
        };

        const t = mergeAnalytics(fallbackTiktok, pd.tiktok, ppd.tiktok);
        const i = mergeAnalytics(fallbackInstagram, pd.instagram, ppd.instagram);

        const computeER = (p: any) => {
          const stored = computeNum(p.engagementRate);
          if (stored > 0 && stored <= 100) return stored;
          const f = computeNum(p.followers);
          if (f <= 0) return 0;
          const likes = computeNum(p.totalLikes) || computeNum(p.avgLikes);
          const comments = computeNum(p.avgComments);
          const shares = computeNum(p.avgShares);
          const raw = ((likes + comments + shares) / f) * 100;
          return Math.min(raw, 100);
        };

        // Prefer connectedAccounts metrics over old socialProfiles metrics
        const tFollowers = computeNum(caT.followers) || computeNum(t.followers);
        const iFollowers = computeNum(caI.followers) || computeNum(i.followers);
        const fFollowers = computeNum(caF.followers);
        const tAvgViews = computeNum(caT.avgViews) || computeNum(t.avgViews);
        const iAvgViews = computeNum(caI.avgViews) || computeNum(i.avgViews);

        const erTik = computeNum(caT.engagementRate) || computeER(t);
        const erIg = computeNum(caI.engagementRate) || computeER(i);
        const erFb = computeNum(caF.engagementRate);
        const maxER = Math.max(erTik, erIg, erFb);

        const followersTotal = tFollowers + iFollowers + fFollowers;
        const avgViewsTotal = tAvgViews + iAvgViews;

        const formatNumber = (num: number) => {
          if (!num) return '';
          if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
          if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
          if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
          return String(num);
        };

        // Resolve social handles — connectedAccounts username takes priority
        const tiktokHandle = ca.tiktok?.username || pd.tiktokHandle || ppd.tiktokHandle || (t.username ? `@${t.username.replace('@', '')}` : '');
        const instagramHandle = ca.instagram?.username || pd.instagramHandle || ppd.instagramHandle || (instagramProfile?.platform?.toLowerCase() === 'instagram' && i.username ? `@${i.username.replace('@', '')}` : '');
        const facebookHandle = ca.facebook?.username || pd.facebookHandle || ppd.facebookHandle || '';

        // Extract advertiser profileInfo & root level fields
        const pi = userData.profileInfo || {};
        const nicheVal = userData.niche || pi.niche || pd.niche || '';
        const contentTypesVal = userData.contentTypes || pi.contentFormats || pi.contentTypes || pd.contentTypes || [];
        const experienceLevelVal = userData.experienceLevel || pi.experienceLevel || pd.experienceLevel || '';
        
        const ta = userData.targetAudience || pi.targetAudience || pd.targetAudience || {};
        const targetAudienceVal = {
          ageRange: ta.ageRange || '',
          gender: ta.gender || '',
          interests: ta.interests || []
        };
        
        const websiteVal = pd.website || userData.website || (pi.portfolioLinks && pi.portfolioLinks.length > 0 ? pi.portfolioLinks[0] : '');
        const baseRateVal = pd.baseRate || userData.baseRate || (pi.rateExpectations?.minRate || pi.rateExpectations?.preferredRate || '');

        const mappedProfile = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          bio: userData.bio || '',
          businessLocation: userData.location || '',
          avatarUrl: userData.profilePicture || '',
          coverImageUrl: userData.coverImage || '',
          coverImage: userData.coverImage || '', // Add alias for consistency
          _id: userData._id,
          clerkId: userData.clerkId,
          role: userData.role,
          ...pd,
          ...ppd, // Merge pending data so user sees their latest edits
          ...pud, // Merge pending root updates

          // Advertiser settings
          phone: userData.phoneNumber || pd.phone || '',
          niche: nicheVal,
          contentTypes: contentTypesVal,
          experienceLevel: experienceLevelVal,
          targetAudience: targetAudienceVal,
          website: websiteVal,
          baseRate: baseRateVal,
          
          // Social handles — connectedAccounts username takes priority
          tiktokHandle,
          instagramHandle,
          facebookHandle,
          youtubeHandle: pd.youtubeHandle || ppd.youtubeHandle || (instagramProfile?.platform?.toLowerCase() === 'youtube' && i.username ? `@${i.username.replace('@', '')}` : ''),
          xHandle: pd.xHandle || ppd.xHandle || '',

          // Metrics — connectedAccounts takes priority over old socialProfiles
          followers: followersTotal ? formatNumber(followersTotal) : (pd.followers || ppd.followers || ''),
          avgViews: avgViewsTotal ? formatNumber(avgViewsTotal) : (pd.avgViews || ppd.avgViews || ''),
          engagementRate: maxER ? parseFloat(maxER.toFixed(2)) : (pd.engagementRate || ppd.engagementRate || 0),
          // Pass connectedAccounts through so downstream components (EditProfilePage) can read raw metrics
          connectedAccounts: userData.connectedAccounts || {},
        };

        // Sync special mappings
        if (pud.location) mappedProfile.businessLocation = pud.location;
        if (pud.profilePicture) mappedProfile.avatarUrl = pud.profilePicture;
        if (pud.coverImage) {
          mappedProfile.coverImageUrl = pud.coverImage;
          mappedProfile.coverImage = pud.coverImage;
        }

        // Ensure coverImageUrl is always synced with coverImage if present in pd/ppd
        if ((mappedProfile as any).coverImage && !(mappedProfile as any).coverImageUrl) {
          (mappedProfile as any).coverImageUrl = (mappedProfile as any).coverImage;
        } else if (!(mappedProfile as any).coverImage && (mappedProfile as any).coverImageUrl) {
          (mappedProfile as any).coverImage = (mappedProfile as any).coverImageUrl;
        }
        setProfile(mappedProfile);
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
