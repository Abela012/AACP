import type { AdvertiserRegistrationForm, PlatformAnalyticsInput } from '@/src/types/advertiserProfile';

export const parseMetric = (val: string): number => {
  if (!val) return 0;
  const cleaned = val.toUpperCase().replace(/[^0-9.KMB]/g, '');
  let mult = 1;
  if (cleaned.endsWith('K')) mult = 1000;
  else if (cleaned.endsWith('M')) mult = 1_000_000;
  else if (cleaned.endsWith('B')) mult = 1_000_000_000;
  const n = parseFloat(cleaned.replace(/[KMB]/g, ''));
  return Number.isNaN(n) ? 0 : n * mult;
};

export const computeEngagementRate = (p: PlatformAnalyticsInput): number => {
  const f = parseMetric(p.followers);
  if (f <= 0) return 0;
  const likes = parseMetric(p.totalLikes);
  const comments = parseMetric(p.avgComments);
  const shares = parseMetric(p.avgShares);
  return Math.min(((likes + comments + shares) / f) * 100, 100);
};

const platformToNested = (p: PlatformAnalyticsInput, er: number) => ({
  username: p.username,
  profileLink: p.profileLink,
  accountType: p.accountType,
  location: p.location,
  followers: parseMetric(p.followers),
  avgViews: parseMetric(p.avgViews),
  totalLikes: parseMetric(p.totalLikes),
  avgComments: parseMetric(p.avgComments),
  avgShares: parseMetric(p.avgShares),
  engagementRate: er,
  postingFrequency: p.postingFrequency,
  postingConsistency: p.postingConsistency,
  contentFrequency: p.contentFrequency,
  audienceTopCountry: p.audienceTopCountry,
  audienceTopCity: p.audienceTopCity,
  audienceGender: p.audienceGender,
  audienceAgeRange: p.audienceAgeRange,
  audienceInterests: p.audienceInterests,
  audienceIncomeLevel: p.audienceIncomeLevel,
  primaryAudienceLanguage: p.primaryAudienceLanguage,
  niche: p.niche,
  contentStyle: p.contentStyle,
});

export const buildAdvertiserSubmitPayload = (form: AdvertiserRegistrationForm) => {
  const socialProfiles: Record<string, unknown>[] = [];
  const profileData: Record<string, unknown> = {
    phone: form.phone,
    availablePlatforms: form.availablePlatforms,
    campaignPrice: parseMetric(form.campaignPrice),
    pricePerPost: parseMetric(form.campaignPrice),
    ratePerPost: parseMetric(form.campaignPrice),
    currency: form.currency,
    preferredCollaborationType: form.preferredCollaborationType,
    previousBrandCollaborations: form.previousBrandCollaborations,
    portfolioUrl: form.portfolioUrl,
  };

  if (form.tiktok.enabled && form.tiktok.username) {
    const er = computeEngagementRate(form.tiktok);
    profileData.tiktok = platformToNested(form.tiktok, er);
    socialProfiles.push({
      platform: 'TikTok',
      username: form.tiktok.username,
      profileLink: form.tiktok.profileLink,
      verified: false,
      engagementRate: er,
      postingFrequency: form.tiktok.postingFrequency,
      postingConsistency: form.tiktok.postingConsistency,
      niches: form.tiktok.niche,
      contentStyles: form.tiktok.contentStyle,
      tiktokAnalytics: {
        followers: parseMetric(form.tiktok.followers),
        avgViews: parseMetric(form.tiktok.avgViews),
        totalLikes: parseMetric(form.tiktok.totalLikes),
        avgComments: parseMetric(form.tiktok.avgComments),
        avgShares: parseMetric(form.tiktok.avgShares),
      },
    });
  }

  if (form.instagram.enabled && form.instagram.username) {
    const er = computeEngagementRate(form.instagram);
    profileData.instagram = platformToNested(form.instagram, er);
    socialProfiles.push({
      platform: 'Instagram',
      username: form.instagram.username,
      profileLink: form.instagram.profileLink,
      verified: false,
      engagementRate: er,
      postingFrequency: form.instagram.postingFrequency,
      postingConsistency: form.instagram.postingConsistency,
      niches: form.instagram.niche,
      contentStyles: form.instagram.contentStyle,
      instagramAnalytics: {
        followers: parseMetric(form.instagram.followers),
        avgViews: parseMetric(form.instagram.avgViews),
        totalLikes: parseMetric(form.instagram.totalLikes),
        avgComments: parseMetric(form.instagram.avgComments),
        avgShares: parseMetric(form.instagram.avgShares),
      },
    });
  }

  const maxEr = Math.max(
    form.tiktok.enabled ? computeEngagementRate(form.tiktok) : 0,
    form.instagram.enabled ? computeEngagementRate(form.instagram) : 0
  );
  profileData.engagementRate = maxEr;

  let totalFollowers = 0;
  if (form.tiktok.enabled) totalFollowers += parseMetric(form.tiktok.followers);
  if (form.instagram.enabled) totalFollowers += parseMetric(form.instagram.followers);
  profileData.followers = totalFollowers;

  return {
    firstName: form.firstName,
    lastName: form.lastName,
    profilePicture: form.profilePicture,
    bio: form.bio,
    location: form.location,
    profileData,
    socialProfiles,
  };
};
