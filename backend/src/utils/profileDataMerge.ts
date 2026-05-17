const NESTED_KEYS = [
    'businessProfile',
    'capacity',
    'financialData',
    'targetAudience',
    'marketingGoals',
    'marketingHistory',
    'customerAnalytics',
    'profileCompletion',
    'tiktok',
    'instagram',
] as const;

/** Deep-merge profileData so nested AI onboarding objects are not wiped on partial updates. */
export const mergeProfileData = (
    existing: Record<string, unknown> | null | undefined,
    incoming: Record<string, unknown>
): Record<string, unknown> => {
    const base = { ...(existing || {}) };

    for (const [key, value] of Object.entries(incoming)) {
        if (
            NESTED_KEYS.includes(key as (typeof NESTED_KEYS)[number]) &&
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        ) {
            base[key] = {
                ...((base[key] as Record<string, unknown>) || {}),
                ...(value as Record<string, unknown>),
            };
        } else {
            base[key] = value;
        }
    }

    return base;
};
