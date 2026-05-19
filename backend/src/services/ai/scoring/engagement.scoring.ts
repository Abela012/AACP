import { clamp } from '../ai.utils';
import { EngagementScoreBreakdown } from '../ai.types';
import { normalizeEngagementRate } from '../../../utils/metrics';

export const calculateEngagementScore = (metrics: {
    followers: number;
    engagementRate: number;
    totalLikes: number;
    avgComments: number;
    avgShares: number;
}): EngagementScoreBreakdown => {
    const { followers, engagementRate, totalLikes, avgComments, avgShares } = metrics;

    if (followers <= 0) {
        return { erComponent: 0, likesComponent: 0, commentsComponent: 0, sharesComponent: 0, total: 0 };
    }

    const normalizedER = normalizeEngagementRate(engagementRate);
    const erComponent = clamp((normalizedER / 15) * 40, 0, 40);

    const likesRatio = (totalLikes / followers) * 100;
    const likesComponent = clamp((likesRatio / 50) * 20, 0, 20);

    const commentsRatio = (avgComments / followers) * 1000;
    const commentsComponent = clamp((commentsRatio / 10) * 25, 0, 25);

    const sharesRatio = (avgShares / followers) * 1000;
    const sharesComponent = clamp((sharesRatio / 5) * 15, 0, 15);

    const total = Math.round(erComponent + likesComponent + commentsComponent + sharesComponent);

    return {
        erComponent: Math.round(erComponent),
        likesComponent: Math.round(likesComponent),
        commentsComponent: Math.round(commentsComponent),
        sharesComponent: Math.round(sharesComponent),
        total: clamp(total, 0, 100),
    };
};
