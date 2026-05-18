type ValidationResult = { valid: boolean; message?: string };

const isNonEmptyString = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

export const validateBusinessProfileSubmit = (body: Record<string, unknown>): ValidationResult => {
    const profileData = (body.profileData || {}) as Record<string, unknown>;

    if (!isNonEmptyString(body.firstName) || !isNonEmptyString(body.lastName)) {
        return { valid: false, message: 'First and last name are required.' };
    }

    if (!isNonEmptyString(profileData.businessName)) {
        return { valid: false, message: 'Business name is required.' };
    }

    if (!isNonEmptyString(profileData.businessLocation) && !isNonEmptyString(body.location)) {
        return { valid: false, message: 'Business location is required.' };
    }

    const bp = (profileData.businessProfile || {}) as Record<string, unknown>;
    if (!isNonEmptyString(bp.businessCategory) && !isNonEmptyString(profileData.industry)) {
        return { valid: false, message: 'Business category is required.' };
    }

    const fd = (profileData.financialData || {}) as Record<string, unknown>;
    const avgOrder = fd.averageOrderValue ?? profileData.avgOrderValueETB;
    if (avgOrder == null || Number(avgOrder) <= 0) {
        return { valid: false, message: 'Average order value (ETB) is required.' };
    }

    const margin = fd.profitMarginPercentage;
    if (margin != null && (Number(margin) < 0 || Number(margin) > 100)) {
        return { valid: false, message: 'Profit margin must be between 0 and 100.' };
    }

    const ta = (profileData.targetAudience || {}) as Record<string, unknown>;
    const ageRanges = ta.ageRange ?? profileData.targetAudienceAgeRanges;
    if (!Array.isArray(ageRanges) || ageRanges.length === 0) {
        return { valid: false, message: 'Select at least one target age range.' };
    }

    const goals = profileData.marketingGoals ?? profileData.promotionGoals;
    if (!Array.isArray(goals) || goals.length === 0) {
        return { valid: false, message: 'Select at least one marketing goal.' };
    }

    const platforms = profileData.selectedPlatforms;
    if (!Array.isArray(platforms) || platforms.length === 0) {
        return { valid: false, message: 'Select at least one marketing platform.' };
    }

    return { valid: true };
};
