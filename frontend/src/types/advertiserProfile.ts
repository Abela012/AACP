export type PlatformKey = 'tiktok' | 'instagram';

export interface PlatformAnalyticsInput {
  enabled: boolean;
  username: string;
  profileLink: string;
  accountType: string;
  location: string;
  followers: string;
  avgViews: string;
  totalLikes: string;
  avgComments: string;
  avgShares: string;
  postingFrequency: string;
  postingConsistency: string;
  contentFrequency: string;
  audienceTopCountry: string;
  audienceTopCity: string;
  audienceGender: string;
  audienceAgeRange: string;
  audienceInterests: string[];
  audienceIncomeLevel: string;
  primaryAudienceLanguage: string;
  niche: string[];
  contentStyle: string[];
}

export interface AdvertiserRegistrationForm {
  firstName: string;
  lastName: string;
  profilePicture: string;
  bio: string;
  location: string;
  phone: string;
  portfolioUrl: string;
  availablePlatforms: string[];
  campaignPrice: string;
  currency: string;
  preferredCollaborationType: string[];
  previousBrandCollaborations: string;
  tiktok: PlatformAnalyticsInput;
  instagram: PlatformAnalyticsInput;
}

export const emptyPlatform = (): PlatformAnalyticsInput => ({
  enabled: false,
  username: '',
  profileLink: '',
  accountType: 'Creator',
  location: '',
  followers: '',
  avgViews: '',
  totalLikes: '',
  avgComments: '',
  avgShares: '',
  postingFrequency: '3-5 per week',
  postingConsistency: 'Consistent',
  contentFrequency: 'Weekly',
  audienceTopCountry: '',
  audienceTopCity: '',
  audienceGender: 'Mixed',
  audienceAgeRange: '18-24',
  audienceInterests: [],
  audienceIncomeLevel: 'Middle',
  primaryAudienceLanguage: 'English',
  niche: [],
  contentStyle: [],
});

export const createInitialAdvertiserForm = (): AdvertiserRegistrationForm => ({
  firstName: '',
  lastName: '',
  profilePicture: '',
  bio: '',
  location: '',
  phone: '',
  portfolioUrl: '',
  availablePlatforms: [],
  campaignPrice: '',
  currency: 'ETB',
  preferredCollaborationType: [],
  previousBrandCollaborations: '',
  tiktok: emptyPlatform(),
  instagram: emptyPlatform(),
});
