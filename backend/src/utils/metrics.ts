/**
 * Shared utility for extracting and normalizing social media metrics
 * across different backend services.
 */

export const parseNum = (val: any): number => {
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

export const computeER = (platform: any): number => {
    const storedER = parseNum(platform.engagementRate);
    if (storedER > 0 && storedER <= 100) return storedER;

    const f = parseNum(platform.followers);
    const likes = parseNum(platform.totalLikes);
    const comments = parseNum(platform.avgComments);
    const shares = parseNum(platform.avgShares);

    if (f <= 0) return 0;
    
    // Simple sum-based ER
    const rawER = ((likes + comments + shares) / f) * 100;
    return Math.min(rawER, 100); // Cap at 100%
};

export const extractMetrics = (profileData: any) => {
    if (!profileData) {
        return {
            followers: 0,
            engagementRate: 0,
            totalLikes: 0,
            avgViews: 0,
            avgComments: 0,
            avgShares: 0,
            niche: 'General',
            niches: [],
            platforms: [],
            isMultiPlatform: false,
            audienceInfo: {},
            primaryPlatform: 'N/A',
            contentStyle: 'N/A'
        };
    }

    let followers = 0;
    let totalLikes = 0;
    let avgViews = 0;
    let avgComments = 0;
    let avgShares = 0;
    let maxEngagement = 0;
    const platforms: string[] = [];
    const niches = new Set<string>();
    const audienceInfo: any = {};

    const processPlatform = (p: any, name: string) => {
        if (!p) return;
        const f = parseNum(p.followers);
        if (p.username || f > 0) {
            platforms.push(name);
            followers += f;
            totalLikes += parseNum(p.totalLikes);
            avgViews += parseNum(p.avgViews);
            avgComments += parseNum(p.avgComments);
            avgShares += parseNum(p.avgShares);
            
            const er = computeER(p);
            if (er > maxEngagement) maxEngagement = er;

            if (p.niche) {
                if (typeof p.niche === 'string') niches.add(p.niche);
                else if (Array.isArray(p.niche)) p.niche.forEach((n: string) => niches.add(n));
                else if (typeof p.niche === 'object') Object.values(p.niche).forEach(v => v && niches.add(String(v)));
            }
            if (p.audienceTopCountry) audienceInfo.topCountry = p.audienceTopCountry;
            if (p.audienceAgeRange) audienceInfo.ageRange = p.audienceAgeRange;
            if (p.audienceGender) audienceInfo.gender = p.audienceGender;
        }
    };

    processPlatform(profileData.tiktok, 'TikTok');
    processPlatform(profileData.instagram, 'Instagram');

    const primaryPlatform = parseNum(profileData.tiktok?.followers) >= parseNum(profileData.instagram?.followers) ? 'TikTok' : 'Instagram';
    
    // Extract content style from primary platform
    let contentStyle = 'N/A';
    const primary = primaryPlatform === 'TikTok' ? profileData.tiktok : profileData.instagram;
    if (primary?.contentStyle) {
        const style = primary.contentStyle;
        if (typeof style === 'string') contentStyle = style;
        else if (Array.isArray(style)) contentStyle = style.join(', ');
        else if (typeof style === 'object') contentStyle = Object.values(style).filter(Boolean).join(', ') || 'N/A';
    }

    return {
        followers,
        engagementRate: maxEngagement,
        totalLikes,
        avgViews,
        avgComments,
        avgShares,
        niche: Array.from(niches)[0] || 'General',
        niches: Array.from(niches),
        allNiches: Array.from(niches), // for compatibility
        platforms,
        isMultiPlatform: platforms.length > 1,
        audienceInfo,
        primaryPlatform,
        contentStyle
    };
};
