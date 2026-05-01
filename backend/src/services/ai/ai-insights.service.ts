import AdsInsight, { IAdsInsight } from '../../database/models/AdsInsight';
import logger from '../../utils/logger';

/**
 * AI Insights Service
 *
 * Processes Facebook advertising data and generates actionable insights,
 * recommendations, and optimization suggestions.
 *
 * This service acts as the AI data pipeline layer that:
 *   1. Ingests normalized Facebook metrics from the AdsInsight model
 *   2. Applies analysis algorithms (statistical + rule-based)
 *   3. Returns structured recommendations
 *
 * In production, this can be extended to call an external AI/ML service
 * (e.g., Gemini, OpenAI) for more sophisticated analysis.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InsightRecommendation {
    type: 'optimization' | 'warning' | 'opportunity' | 'info';
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    metric?: string;
    currentValue?: number;
    suggestedAction?: string;
}

export interface PerformanceSummary {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    overallCTR: number;
    overallCPC: number;
    overallCPM: number;
    overallROAS: number;
    avgFrequency: number;
    dateRange: { start: string; end: string };
}

export interface AIInsightReport {
    summary: PerformanceSummary;
    recommendations: InsightRecommendation[];
    topPerformers: Array<{ entityName: string; entityId: string; metric: string; value: number }>;
    underperformers: Array<{ entityName: string; entityId: string; metric: string; value: number }>;
    trends: Array<{ metric: string; direction: 'up' | 'down' | 'stable'; changePercent: number }>;
    generatedAt: Date;
}

// ─── Industry Benchmarks ────────────────────────────────────────────────────

const BENCHMARKS = {
    ctr: { poor: 0.5, average: 1.0, good: 2.0, excellent: 3.5 },            // percentage
    cpc: { excellent: 0.5, good: 1.0, average: 1.5, poor: 3.0 },            // USD
    cpm: { excellent: 3.0, good: 7.0, average: 12.0, poor: 20.0 },          // USD
    frequency: { ideal: 2.5, warning: 5.0, critical: 8.0 },                  // times
    roas: { poor: 1.0, breakeven: 1.0, good: 3.0, excellent: 5.0 },         // multiplier
};

// ─── Core Analysis ──────────────────────────────────────────────────────────

/**
 * Generate a complete AI insight report for an ad account.
 */
export async function generateInsightReport(
    clerkId: string,
    adAccountId: string,
    dateRange?: { start: string; end: string }
): Promise<AIInsightReport> {
    // Fetch cached insights from DB
    const query: Record<string, any> = { clerkId, adAccountId };
    if (dateRange) {
        query.dateStart = { $gte: new Date(dateRange.start) };
        query.dateEnd = { $lte: new Date(dateRange.end) };
    }

    const insights = await AdsInsight.find(query).sort({ dateStart: -1 }).lean();

    if (!insights.length) {
        logger.warn(`[AIInsights] No data found for account ${adAccountId}`);
        return {
            summary: createEmptySummary(),
            recommendations: [{
                type: 'info',
                priority: 'high',
                category: 'data',
                title: 'No Data Available',
                description: 'No advertising data found for this account. Please sync your Facebook data first.',
                suggestedAction: 'Connect your Facebook account and sync ad data.',
            }],
            topPerformers: [],
            underperformers: [],
            trends: [],
            generatedAt: new Date(),
        };
    }

    const summary = calculateSummary(insights);
    const recommendations = analyzeAndRecommend(insights, summary);
    const topPerformers = findTopPerformers(insights);
    const underperformers = findUnderperformers(insights);
    const trends = detectTrends(insights);

    logger.info(
        `[AIInsights] Generated report for ${adAccountId}: ${recommendations.length} recommendations`
    );

    return {
        summary,
        recommendations,
        topPerformers,
        underperformers,
        trends,
        generatedAt: new Date(),
    };
}

/**
 * Analyze a single campaign/adset/ad and return targeted recommendations.
 */
export async function analyzeEntity(
    clerkId: string,
    adAccountId: string,
    entityId: string,
    level: 'campaign' | 'adset' | 'ad'
): Promise<InsightRecommendation[]> {
    const insights = await AdsInsight.find({
        clerkId,
        adAccountId,
        level,
        entityId,
    }).sort({ dateStart: -1 }).lean();

    if (!insights.length) {
        return [{
            type: 'info',
            priority: 'medium',
            category: 'data',
            title: 'No Data',
            description: `No insight data found for this ${level}.`,
        }];
    }

    const summary = calculateSummary(insights);
    return analyzeAndRecommend(insights, summary);
}

// ─── Internal Algorithms ────────────────────────────────────────────────────

function calculateSummary(insights: any[]): PerformanceSummary {
    let totalSpend = 0, totalImpressions = 0, totalClicks = 0;
    let totalConversions = 0, totalReach = 0, totalFrequency = 0;
    let totalROAS = 0;

    for (const row of insights) {
        const m = row.metrics;
        totalSpend += m.spend || 0;
        totalImpressions += m.impressions || 0;
        totalClicks += m.clicks || 0;
        totalConversions += m.conversions || 0;
        totalReach += m.reach || 0;
        totalFrequency += m.frequency || 0;
        totalROAS += m.roas || 0;
    }

    const count = insights.length;

    // Find date range
    const dates = insights.map(i => new Date(i.dateStart).getTime());
    const dateEnds = insights.map(i => new Date(i.dateEnd).getTime());

    return {
        totalSpend: round(totalSpend),
        totalImpressions,
        totalClicks,
        totalConversions,
        overallCTR: totalImpressions > 0 ? round((totalClicks / totalImpressions) * 100) : 0,
        overallCPC: totalClicks > 0 ? round(totalSpend / totalClicks) : 0,
        overallCPM: totalImpressions > 0 ? round((totalSpend / totalImpressions) * 1000) : 0,
        overallROAS: count > 0 ? round(totalROAS / count) : 0,
        avgFrequency: count > 0 ? round(totalFrequency / count) : 0,
        dateRange: {
            start: new Date(Math.min(...dates)).toISOString().split('T')[0],
            end: new Date(Math.max(...dateEnds)).toISOString().split('T')[0],
        },
    };
}

function analyzeAndRecommend(
    insights: any[],
    summary: PerformanceSummary
): InsightRecommendation[] {
    const recs: InsightRecommendation[] = [];

    // ── CTR Analysis ──
    if (summary.overallCTR < BENCHMARKS.ctr.poor) {
        recs.push({
            type: 'warning',
            priority: 'critical',
            category: 'engagement',
            title: 'Very Low Click-Through Rate',
            description: `Your CTR of ${summary.overallCTR}% is below the industry average of ${BENCHMARKS.ctr.average}%. This indicates your ads are not resonating with your target audience.`,
            metric: 'ctr',
            currentValue: summary.overallCTR,
            suggestedAction: 'Review your ad creatives. Test different headlines, images, and call-to-action buttons. Consider narrowing your audience targeting.',
        });
    } else if (summary.overallCTR < BENCHMARKS.ctr.average) {
        recs.push({
            type: 'optimization',
            priority: 'high',
            category: 'engagement',
            title: 'Below Average Click-Through Rate',
            description: `Your CTR of ${summary.overallCTR}% is below the industry benchmark of ${BENCHMARKS.ctr.average}%.`,
            metric: 'ctr',
            currentValue: summary.overallCTR,
            suggestedAction: 'A/B test 3-5 different ad creative variations. Focus on benefit-driven headlines and strong visual hooks.',
        });
    } else if (summary.overallCTR >= BENCHMARKS.ctr.excellent) {
        recs.push({
            type: 'info',
            priority: 'low',
            category: 'engagement',
            title: 'Excellent Click-Through Rate',
            description: `Your CTR of ${summary.overallCTR}% significantly exceeds the industry average. Your ad creatives are performing exceptionally well.`,
            metric: 'ctr',
            currentValue: summary.overallCTR,
        });
    }

    // ── CPC Analysis ──
    if (summary.overallCPC > BENCHMARKS.cpc.poor) {
        recs.push({
            type: 'warning',
            priority: 'high',
            category: 'cost',
            title: 'High Cost Per Click',
            description: `Your CPC of $${summary.overallCPC} is significantly above the industry average. You're paying too much per click.`,
            metric: 'cpc',
            currentValue: summary.overallCPC,
            suggestedAction: 'Expand your audience to reduce competition. Review Quality Ranking and Engagement Rate Ranking in Facebook Ads Manager. Consider using automatic placements.',
        });
    }

    // ── Frequency Analysis ──
    if (summary.avgFrequency > BENCHMARKS.frequency.critical) {
        recs.push({
            type: 'warning',
            priority: 'critical',
            category: 'audience',
            title: 'Critical Ad Fatigue Detected',
            description: `Your average frequency of ${summary.avgFrequency} means users are seeing your ads too many times. This causes ad fatigue, negative sentiment, and wasted spend.`,
            metric: 'frequency',
            currentValue: summary.avgFrequency,
            suggestedAction: 'Immediately refresh your ad creatives. Expand your audience or create new lookalike audiences. Consider pausing high-frequency ad sets.',
        });
    } else if (summary.avgFrequency > BENCHMARKS.frequency.warning) {
        recs.push({
            type: 'optimization',
            priority: 'high',
            category: 'audience',
            title: 'Ad Fatigue Warning',
            description: `Your average frequency of ${summary.avgFrequency} is approaching the fatigue threshold. Performance will degrade if this continues.`,
            metric: 'frequency',
            currentValue: summary.avgFrequency,
            suggestedAction: 'Prepare new ad creatives for rotation. Monitor CTR closely for signs of decline.',
        });
    }

    // ── ROAS Analysis ──
    if (summary.overallROAS > 0) {
        if (summary.overallROAS < BENCHMARKS.roas.breakeven) {
            recs.push({
                type: 'warning',
                priority: 'critical',
                category: 'revenue',
                title: 'Negative Return on Ad Spend',
                description: `Your ROAS of ${summary.overallROAS}x means you're losing money on every dollar spent. For every $1 spent, you're generating only $${summary.overallROAS} in revenue.`,
                metric: 'roas',
                currentValue: summary.overallROAS,
                suggestedAction: 'Review your conversion funnel end-to-end. Consider pausing underperforming campaigns. Focus budget on your highest-ROAS campaigns.',
            });
        } else if (summary.overallROAS >= BENCHMARKS.roas.excellent) {
            recs.push({
                type: 'opportunity',
                priority: 'high',
                category: 'revenue',
                title: 'Excellent ROAS — Scale Opportunity',
                description: `Your ROAS of ${summary.overallROAS}x is exceptional. Consider increasing budget to capture more conversions while maintaining efficiency.`,
                metric: 'roas',
                currentValue: summary.overallROAS,
                suggestedAction: 'Gradually increase daily budget by 20% every 3-5 days. Monitor ROAS closely during scaling to ensure efficiency is maintained.',
            });
        }
    }

    // ── Spend Efficiency ──
    if (summary.totalSpend > 0 && summary.totalConversions === 0) {
        recs.push({
            type: 'warning',
            priority: 'critical',
            category: 'conversions',
            title: 'Zero Conversions Despite Active Spend',
            description: `You've spent $${summary.totalSpend} without generating any tracked conversions. Your conversion tracking may be broken or your funnel has issues.`,
            metric: 'conversions',
            currentValue: 0,
            suggestedAction: 'Verify your Facebook Pixel is firing correctly on conversion pages. Check your landing page load speed and mobile experience. Validate your conversion event setup.',
        });
    }

    // ── Budget Allocation ──
    const campaignInsights = insights.filter(i => i.level === 'campaign');
    if (campaignInsights.length > 1) {
        const spendByEntity = new Map<string, { spend: number; roas: number; name: string }>();
        for (const row of campaignInsights) {
            const key = row.entityId || 'unknown';
            const existing = spendByEntity.get(key) || { spend: 0, roas: 0, name: row.entityName || 'Unknown' };
            existing.spend += row.metrics.spend;
            existing.roas = row.metrics.roas; // Latest ROAS
            spendByEntity.set(key, existing);
        }

        const entries = Array.from(spendByEntity.values());
        const highSpendLowROAS = entries.filter(e => e.spend > summary.totalSpend * 0.3 && e.roas < 1);
        
        if (highSpendLowROAS.length > 0) {
            recs.push({
                type: 'optimization',
                priority: 'high',
                category: 'budget',
                title: 'Budget Reallocation Recommended',
                description: `${highSpendLowROAS.length} campaign(s) consuming over 30% of budget with negative ROAS. Reallocating budget to better-performing campaigns could improve overall efficiency.`,
                suggestedAction: `Consider reducing budget for: ${highSpendLowROAS.map(e => e.name).join(', ')}. Redirect spend to campaigns with ROAS > ${BENCHMARKS.roas.good}x.`,
            });
        }
    }

    return recs;
}

function findTopPerformers(insights: any[]): Array<{ entityName: string; entityId: string; metric: string; value: number }> {
    const entityMap = new Map<string, any>();

    for (const row of insights) {
        if (!row.entityId) continue;
        const existing = entityMap.get(row.entityId);
        if (!existing || row.metrics.roas > (existing.metrics?.roas || 0)) {
            entityMap.set(row.entityId, row);
        }
    }

    return Array.from(entityMap.values())
        .filter(r => r.metrics.roas > 0 || r.metrics.ctr > 0)
        .sort((a, b) => (b.metrics.roas || b.metrics.ctr) - (a.metrics.roas || a.metrics.ctr))
        .slice(0, 5)
        .map(r => ({
            entityName: r.entityName || 'Unknown',
            entityId: r.entityId,
            metric: r.metrics.roas > 0 ? 'roas' : 'ctr',
            value: r.metrics.roas > 0 ? r.metrics.roas : r.metrics.ctr,
        }));
}

function findUnderperformers(insights: any[]): Array<{ entityName: string; entityId: string; metric: string; value: number }> {
    const entityMap = new Map<string, any>();

    for (const row of insights) {
        if (!row.entityId) continue;
        const existing = entityMap.get(row.entityId);
        if (!existing || row.metrics.spend > (existing.metrics?.spend || 0)) {
            entityMap.set(row.entityId, row);
        }
    }

    return Array.from(entityMap.values())
        .filter(r => r.metrics.spend > 0 && r.metrics.ctr < BENCHMARKS.ctr.poor)
        .sort((a, b) => a.metrics.ctr - b.metrics.ctr)
        .slice(0, 5)
        .map(r => ({
            entityName: r.entityName || 'Unknown',
            entityId: r.entityId,
            metric: 'ctr',
            value: r.metrics.ctr,
        }));
}

function detectTrends(insights: any[]): Array<{ metric: string; direction: 'up' | 'down' | 'stable'; changePercent: number }> {
    if (insights.length < 2) return [];

    // Sort by date ascending
    const sorted = [...insights].sort(
        (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
    );

    const half = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, half);
    const secondHalf = sorted.slice(half);

    const metrics = ['ctr', 'cpc', 'cpm', 'roas'] as const;
    const trends: Array<{ metric: string; direction: 'up' | 'down' | 'stable'; changePercent: number }> = [];

    for (const metric of metrics) {
        const avg1 = average(firstHalf.map(r => r.metrics[metric] || 0));
        const avg2 = average(secondHalf.map(r => r.metrics[metric] || 0));

        if (avg1 === 0) continue;

        const changePercent = round(((avg2 - avg1) / avg1) * 100);
        const direction = Math.abs(changePercent) < 5 ? 'stable' : changePercent > 0 ? 'up' : 'down';

        trends.push({ metric, direction, changePercent });
    }

    return trends;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function average(values: number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function createEmptySummary(): PerformanceSummary {
    return {
        totalSpend: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0,
        overallCTR: 0, overallCPC: 0, overallCPM: 0, overallROAS: 0, avgFrequency: 0,
        dateRange: { start: '', end: '' },
    };
}
