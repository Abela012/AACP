import { describe, expect, it } from 'vitest';
import { recommendationScoring } from '../../src/modules/recommendations/recommendation.service';

const { calculateMatchScore, listOverlapRatio, scoreEngagement, scoreFollowers } =
  recommendationScoring;

describe('recommendation scoring', () => {
  it('computes Jaccard overlap for niche lists', () => {
    expect(listOverlapRatio(['fashion', 'beauty'], ['fashion', 'travel'])).toBeCloseTo(1 / 3, 5);
    expect(listOverlapRatio([], ['fashion'])).toBe(0);
  });

  it('scores higher engagement when above user minimum', () => {
    const low = scoreEngagement(2, 5);
    const high = scoreEngagement(8, 5);
    expect(high).toBeGreaterThan(low);
  });

  it('scores followers on log scale', () => {
    expect(scoreFollowers(1000)).toBeGreaterThan(0);
    expect(scoreFollowers(1_000_000)).toBeGreaterThan(scoreFollowers(1000));
  });

  it('ranks better niche/platform match higher', () => {
    const userProfile = {
      preferredNiches: ['fashion'],
      preferredPlatform: ['instagram'],
      minEngagement: 3,
      budget: 10000,
    };

    const strongMatch = calculateMatchScore(
      userProfile,
      'Addis Ababa',
      {
        niches: ['fashion'],
        platforms: ['instagram'],
        engagementRate: 6,
        followers: 80000,
        pricePerPost: 2000,
      },
      'Addis Ababa'
    );

    const weakMatch = calculateMatchScore(
      userProfile,
      'Addis Ababa',
      {
        niches: ['gaming'],
        platforms: ['youtube'],
        engagementRate: 1,
        followers: 500,
        pricePerPost: 20000,
      },
      'Nairobi'
    );

    expect(strongMatch).toBeGreaterThan(weakMatch);
  });

  it('clamps raw score to 100', () => {
    const score = calculateMatchScore(
      { preferredNiches: ['fashion', 'beauty', 'travel'], preferredPlatform: ['instagram', 'tiktok'] },
      'Addis Ababa',
      {
        niches: ['fashion', 'beauty'],
        platforms: ['instagram'],
        engagementRate: 12,
        followers: 2_000_000,
        averageRating: 5,
      },
      'Addis Ababa'
    );
    expect(score).toBeLessThanOrEqual(100);
  });
});
