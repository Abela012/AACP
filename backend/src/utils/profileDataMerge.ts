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

/** Remove undefined/null keys so Mongoose subdocs (tiktok, instagram) are not set to undefined. */
export const sanitizeProfileDataForStorage = (
    data: Record<string, unknown> | null | undefined
): Record<string, unknown> => {
    if (!data || typeof data !== 'object') return {};

    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;

        if (
            NESTED_KEYS.includes(key as (typeof NESTED_KEYS)[number]) &&
            typeof value === 'object' &&
            !Array.isArray(value)
        ) {
            const nested = sanitizeProfileDataForStorage(value as Record<string, unknown>);
            if (Object.keys(nested).length > 0) {
                out[key] = nested;
            }
            continue;
        }

        out[key] = value;
    }

    return out;
};

/** Deep-merge profileData so nested AI onboarding objects are not wiped on partial updates. */
export const mergeProfileData = (
    existing: Record<string, unknown> | null | undefined,
    incoming: Record<string, unknown>
): Record<string, unknown> => {
    const base = sanitizeProfileDataForStorage(existing);

    for (const [key, value] of Object.entries(incoming)) {
        if (value === undefined || value === null) continue;

        if (
            NESTED_KEYS.includes(key as (typeof NESTED_KEYS)[number]) &&
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

    return sanitizeProfileDataForStorage(base);
};
