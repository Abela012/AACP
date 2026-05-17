type PlatformNested = Record<string, unknown>;

const genderToDistribution = (gender?: string) => {
  if (gender === 'Mostly Male') return { male: 70, female: 30 };
  if (gender === 'Mostly Female') return { male: 30, female: 70 };
  return { male: 50, female: 50 };
};

const buildSocialProfile = (
  platform: 'TikTok' | 'Instagram',
  nested: PlatformNested,
  er: number
) => {
  const audience = {
    topCountries: nested.audienceTopCountry
      ? [
          {
            country: nested.audienceTopCountry,
            city: nested.audienceTopCity,
            percentage: 100,
          },
        ]
      : [],
    interests: nested.audienceInterests,
    genderDistribution: genderToDistribution(nested.audienceGender as string | undefined),
  };

  const base = {
    platform,
    username: nested.username,
    profileLink: nested.profileLink,
    verified: Boolean(nested.verified),
    engagementRate: er,
    postingFrequency: nested.postingFrequency,
    postingConsistency: nested.postingConsistency,
    niches: nested.niche,
    contentStyles: nested.contentStyle,
    audience,
  };

  if (platform === 'TikTok') {
    return {
      ...base,
      tiktokAnalytics: {
        followers: nested.followers,
        following: 0,
        avgViews: nested.avgViews,
        avgLikes: nested.totalLikes,
        avgComments: nested.avgComments,
        avgShares: nested.avgShares,
        completionRate: 0,
        totalLikes: nested.totalLikes,
        viralVideoPercentage: 0,
        audienceAnalytics: {
          audienceGender: audience.genderDistribution,
          audienceLocations: audience.topCountries,
        },
      },
    };
  }

  return {
    ...base,
    instagramAnalytics: {
      followers: nested.followers,
      avgViews: nested.avgViews,
      totalLikes: nested.totalLikes,
      avgComments: nested.avgComments,
      avgShares: nested.avgShares,
      engagementMetrics: {
        likes: nested.totalLikes,
        comments: nested.avgComments,
        shares: nested.avgShares,
      },
    },
  };
};

/**
 * Dual-write advertiser onboarding into profileData (tiktok/instagram) and socialProfiles for AI + recommendations.
 */
export const mergeAdvertiserProfileOnSubmit = (input: {
  profileData?: Record<string, unknown>;
  socialProfiles?: unknown[];
  bio?: string;
  location?: string;
}): { profileData: Record<string, unknown>; socialProfiles: unknown[] } | null => {
  const pd = { ...(input.profileData || {}) } as Record<string, unknown>;
  const socialProfiles: unknown[] = [];

  const tiktok = pd.tiktok as PlatformNested | undefined;
  const instagram = pd.instagram as PlatformNested | undefined;

  if (tiktok?.username) {
    socialProfiles.push(buildSocialProfile('TikTok', tiktok, Number(tiktok.engagementRate) || 0));
  }
  if (instagram?.username) {
    socialProfiles.push(buildSocialProfile('Instagram', instagram, Number(instagram.engagementRate) || 0));
  }

  if (input.bio) pd.bio = input.bio;
  if (input.location) pd.location = input.location;

  if (!tiktok?.username && !instagram?.username && !Object.keys(pd).length) {
    return input.socialProfiles?.length
      ? { profileData: pd, socialProfiles: input.socialProfiles }
      : null;
  }

  return { profileData: pd, socialProfiles: socialProfiles.length ? socialProfiles : input.socialProfiles || [] };
};
