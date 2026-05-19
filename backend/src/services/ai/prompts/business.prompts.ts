import { BusinessScores } from '../ai.types';
import { formatNumberForPrompt, sanitizeForPrompt, truncateForPrompt } from '../ai.utils';

export const buildBusinessAnalyticsPrompt = (
    profile: any,
    user: any,
    scores: BusinessScores,
    campaignMetrics: {
        totalCampaigns: number;
        completedCollabs: number;
        avgApplicantsPerCampaign: number;
        totalSpend: number;
    }
): string => {
    const bio = sanitizeForPrompt(truncateForPrompt(profile.bio, 150));
    const profileData = profile.profileData || {};

    return `You are a business marketing consultant analyzing a company profile on an influencer marketing platform.

BUSINESS DATA (all scores pre-calculated by backend, do NOT modify them):
- Business Name: ${profile.businessName || user?.username || 'N/A'}
- Industry: ${profile.industry || profileData.industry || 'General'}
- Company Size: ${profile.companySize || 'Not specified'}
- Location: ${profile.location || 'N/A'}
- Bio: ${bio}

FINANCIAL DATA:
- Monthly Revenue: ${formatNumberForPrompt(profileData.monthlyRevenue || 0)} ETB
- Monthly Profit: ${formatNumberForPrompt(profileData.monthlyProfit || 0)} ETB
- Marketing Budget: ${formatNumberForPrompt(profileData.monthlyBudget || profileData.adSpend || 0)} ETB
- Average Order Value: ${formatNumberForPrompt(profileData.averageOrderValue || 0)} ETB
- Profit Margin: ${profileData.profitMargin || 'N/A'}%

MARKETING PREFERENCES:
- Target Audience: ${profileData.targetAudience || 'General'}
- Preferred Platforms: ${(profileData.selectedPlatforms || []).join(', ') || 'Any'}
- Preferred Creator Types: ${(profileData.preferredCreatorTypes || []).join(', ') || 'Any'}
- Preferred Niches: ${(profileData.preferredNiches || []).join(', ') || 'Any'}
- Marketing Goals: ${(profileData.marketingGoals || []).join(', ') || 'Brand Awareness'}

CAMPAIGN HISTORY:
- Total Campaigns Created: ${campaignMetrics.totalCampaigns}
- Completed Collaborations: ${campaignMetrics.completedCollabs}
- Avg Applicants Per Campaign: ${campaignMetrics.avgApplicantsPerCampaign.toFixed(1)}
- Total Spend on Creators: ${formatNumberForPrompt(campaignMetrics.totalSpend)} ETB

PRE-CALCULATED SCORES (use these exactly, do NOT recalculate):
- Campaign Performance: ${scores.campaignPerformance}/100
- Budget Efficiency: ${scores.budgetEfficiency}/100
- Market Position: ${scores.marketPosition}/100
- Overall Health: ${scores.overallHealth}/100

TASKS:
1. Provide a marketing optimization summary (3-4 sentences max).
2. List 3 budget allocation recommendations.
3. Describe the ideal creator profile for their next campaign.
4. Identify 2-3 risks in their current marketing approach.
5. Predict next quarter marketing outlook in 1-2 sentences.

RULES:
- Use ONLY the provided data. Do NOT invent metrics.
- Keep each point concise (under 40 words each).
- Be professional and actionable in tone.
- Reference actual numbers from the data above.
- If data is missing or zero, note it as a gap to address.

Return ONLY valid JSON matching this exact schema:
{
  "summary": "3-4 sentence marketing optimization summary",
  "budgetRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "idealCreatorProfile": "Description of ideal creator for next campaign",
  "risks": ["risk 1", "risk 2"],
  "quarterOutlook": "1-2 sentence prediction for next quarter"
}`;
};
