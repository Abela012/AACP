export interface RecommendationPromptCandidate {
    targetId: string;
    name: string;
    type: 'advertiser' | 'opportunity';
    score: number;
    businessSummary: string;
    targetSummary: string;
    compatibility: {
        nicheCompatibility: number;
        audienceCompatibility: number;
        audienceLocationCompatibility: number;
        platformCompatibility: number;
        engagementQuality: number;
        audienceRelevance: number;
        total: number;
    };
}

export const buildRecommendationInsightsPrompt = (
    businessSummary: string,
    candidates: RecommendationPromptCandidate[]
): string => {
    return `You are a senior influencer marketing strategist.

The backend has already calculated all recommendation scores and compatibility values.
Do NOT recalculate scores.
Do NOT estimate ROI, profit, revenue, conversions, or campaign profitability.
Only explain why each match is relevant or not relevant.

BUSINESS CONTEXT
${businessSummary}

CANDIDATES
${candidates
    .map(
        (candidate, index) => `
Candidate ${index + 1}
Target ID: ${candidate.targetId}
Name: ${candidate.name}
Type: ${candidate.type}
Score: ${candidate.score}/100
Target Summary: ${candidate.targetSummary}
Compatibility Scores:
- Niche: ${candidate.compatibility.nicheCompatibility}/30
- Audience: ${candidate.compatibility.audienceCompatibility}/20
- Location: ${candidate.compatibility.audienceLocationCompatibility}/15
- Platform: ${candidate.compatibility.platformCompatibility}/15
- Engagement: ${candidate.compatibility.engagementQuality}/15
- Relevance: ${candidate.compatibility.audienceRelevance}/5
- Total: ${candidate.compatibility.total}/100
`
    )
    .join('\n')}

TASKS
1. Explain the recommendation in 1-2 short sentences.
2. Summarize audience compatibility.
3. Summarize platform compatibility.
4. Summarize niche compatibility.
5. Explain the engagement quality in one short sentence.
6. Give one short strategic insight.

RULES
- Use only the provided data.
- Keep the tone professional and concise.
- Do not mention ROI, profit, revenue, or campaign profitability.
- Do not invent metrics or numbers.
- Keep each field short and practical.

Return ONLY valid JSON with this exact schema:
{
  "insights": [
    {
      "targetId": "string",
      "explanation": "string",
      "recommendationReason": "string",
      "audienceCompatibility": "string",
      "platformCompatibility": "string",
      "nicheCompatibility": "string",
      "engagementQualityInsight": "string",
      "strategicInsight": "string"
    }
  ]
}`;
};
