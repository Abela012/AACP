import { createContext, useContext, useState, type ReactNode } from 'react';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  businessName: string;
  website: string;
  industry: string;
  avatarUrl: string;
  phone: string;
  // NEW FIELDS
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
}

const DEFAULT_BUSINESS_PROFILE: ProfileData = {
  firstName: 'Sarah',
  lastName: 'Reynolds',
  email: 'partners@techvision.dev',
  bio: 'Leading innovator in edge computing solutions for enterprise networks. We specialize in optimizing data flow and creating secure infrastructure for the cloud-first world.',
  businessName: 'TechVision Solutions',
  website: 'techvision.dev',
  industry: 'B2B Software',
  avatarUrl: 'https://i.pravatar.cc/150?u=techvision',
  phone: '+1 (555) 123-4567',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function loadFromStorage(): ProfileData {
  try {
    const stored = localStorage.getItem('profileData');
    if (stored) return { ...DEFAULT_BUSINESS_PROFILE, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_BUSINESS_PROFILE;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(loadFromStorage);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...data };
      localStorage.setItem('profileData', JSON.stringify(next));
      return next;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
