import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

export interface SocialMediaProfile {
  platform: 'tiktok' | 'instagram';
  username: string;
  profileLink: string;
  accountType: 'personal' | 'business' | 'verified' | 'creator';
  postingFrequency: string;
  niche: string;
  contentStyle: string;
  audienceGender: 'mixed' | 'male' | 'female';
  audienceTopCountry: string;
  audienceAgeRange: string;
  followers?: number;
  totalLikes?: number;
  engagementRate: number;
  averageViews: number;
  averageComments: number;
  averageShares: number;
}

export interface AdvertiserProfileData {
  tiktok?: SocialMediaProfile;
  instagram?: SocialMediaProfile;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Hook for managing advertiser social media profiles
 * Handles fetching and updating profile data for TikTok and Instagram
 */
export const useAdvertiserProfile = () => {
  // Fetch advertiser profile data
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['advertiserProfile'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/advertiser/profile/social-media`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: AdvertiserProfileData) => {
      const response = await axios.patch(`${API_BASE_URL}/advertiser/profile/social-media`, data);
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Mutation for updating individual platform profile
  const updatePlatformMutation = useMutation({
    mutationFn: async ({
      platform,
      data,
    }: {
      platform: 'tiktok' | 'instagram';
      data: Partial<SocialMediaProfile>;
    }) => {
      const response = await axios.patch(
        `${API_BASE_URL}/advertiser/profile/social-media/${platform}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  return {
    profileData: profileData as AdvertiserProfileData | undefined,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    updatePlatform: updatePlatformMutation.mutate,
    isSaving: updateProfileMutation.isPending || updatePlatformMutation.isPending,
    saveError: updateProfileMutation.error || updatePlatformMutation.error,
    refetch,
  };
};

/**
 * Hook for validating social media URLs
 */
export const useUrlValidation = () => {
  const validateUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const validateSocialMediaUrl = useCallback(
    (url: string, platform: 'tiktok' | 'instagram'): boolean => {
      if (!validateUrl(url)) return false;

      const urlLower = url.toLowerCase();
      if (platform === 'tiktok') {
        return urlLower.includes('tiktok.com') || urlLower.includes('tiktok.tv');
      } else {
        return urlLower.includes('instagram.com');
      }
    },
    [validateUrl]
  );

  return { validateUrl, validateSocialMediaUrl };
};

/**
 * Hook for formatting analytics numbers
 */
export const useFormatAnalytics = () => {
  const formatNumber = useCallback((num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const formatPercentage = useCallback((num: number | undefined): string => {
    if (!num) return '0%';
    return `${num.toFixed(1)}%`;
  }, []);

  return { formatNumber, formatPercentage };
};
