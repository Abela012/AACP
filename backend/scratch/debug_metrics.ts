/// <reference types="node" />
/**
 * Debug extractMetrics
 */
import { extractMetrics } from '../src/modules/marketing-analysis/marketing-analysis.service';

const testProfiles = [
    { followers: "5M", engagementRate: "9%" },
    { tiktok: { followers: 100000, engagementRate: 6000.15, niche: ["Education"] } },
    { instagram: { followers: "10K", engagementRate: "5.5%" } }
];

testProfiles.forEach((p, i) => {
    console.log(`Test ${i + 1}:`, p);
    const m = (extractMetrics as any)(p);
    console.log(`  Result:`, m);
    console.log('---');
});
