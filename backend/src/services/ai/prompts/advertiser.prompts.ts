import { AdvertiserScores } from '../ai.types';
import { formatNumberForPrompt, sanitizeForPrompt, truncateForPrompt } from '../ai.utils';

export const buildAdvertiserAnalyticsPrompt = (
    profile: any,
    user: any,
    metrics: any,
    scores: AdvertiserScores
): string => {
    const bio = sanitizeForPrompt(truncateForPrompt(profile.bio, 150));
    const niche = profile.niche || metrics.niche || 'General';
    const experience = profile.experienceLevel || 'Not specified';

    const contentFormats = (profile.contentFormats || []).join(', ') || 'Not specified';
    const platforms = (metrics.platforms || []).join(', ') || 'Not specified';

    return `You are a senior social media growth strategist analyzing a creator profile.

CREATOR DATA (all scores pre-calculated by backend, do NOT modify them):
- Username: ${user?.username || 'N/A'}
- Bio: ${bio}
- Primary Niche: ${niche}
- Experience Level: ${experience}
- Content Formats: ${contentFormats}
- Platforms: ${platforms}
- Primary Platform: ${metrics.primaryPlatform || 'N/A'}
- Content Style: ${metrics.contentStyle || 'N/A'}
- Total Followers: ${formatNumberForPrompt(metrics.followers)}
- Engagement Rate: ${metrics.engagementRate}%
- Total Likes: ${formatNumberForPrompt(metrics.totalLikes)}
- Avg Views: ${formatNumberForPrompt(metrics.avgViews)}
- Avg Comments: ${formatNumberForPrompt(metrics.avgComments)}
- Avg Shares: ${formatNumberForPrompt(metrics.avgShares)}
- Average Rating: ${profile.averageRating || 0}/5 from ${profile.totalReviews || 0} reviews
- Multi-Platform: ${metrics.isMultiPlatform ? 'Yes' : 'No'}

PRE-CALCULATED SCORES (use these exactly, do NOT recalculate):
- Engagement Score: ${scores.engagement}/100
- Profile Completeness: ${scores.profileCompleteness}/100
- Content Diversity: ${scores.contentDiversity}/100
- Platform Reach: ${scores.platformReach}/100
- Reputation: ${scores.reputation}/100
- Overall AI Score: ${scores.overall}/100

AUDIENCE DATA:
- Top Country: ${metrics.audienceInfo?.topCountry || 'Global'}
- Age Range: ${metrics.audienceInfo?.ageRange || 'Mixed'}
- Gender Split: ${metrics.audienceInfo?.gender || 'Mixed'}

TASKS:
1. Provide a growth strategy summary (3-4 sentences max).
2. List the top 3 strengths of this creator based on data.
3. List the top 3 areas where this creator should improve.
4. Suggest a specific content strategy adjustment.
5. Predict growth potential as "low", "medium", or "high" with a 1-sentence reason.

RULES:
- Use ONLY the provided data. Do NOT invent metrics.
- Keep each point concise (under 40 words each).
- Be professional but encouraging in tone.
- Reference actual numbers from the data above.

Return ONLY valid JSON matching this exact schema:
{
  "summary": "3-4 sentence growth strategy summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "contentStrategy": "Specific content strategy recommendation",
  "growthPotential": "low|medium|high",
  "growthReasoning": "1 sentence explaining why"
}`;
};
