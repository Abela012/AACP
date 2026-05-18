import type { IUser } from '../../database/models/User';

const norm = (v: unknown) => (v == null ? '' : String(v).trim());

/** Fields that require admin re-approval when changed on an already-approved business profile. */
export const hasRequiredBusinessFieldChanges = (
    user: IUser,
    body: Record<string, unknown>
): boolean => {
    const current = (user.profileData || {}) as Record<string, unknown>;
    const incoming = (body.profileData || {}) as Record<string, unknown>;

    if (body.firstName !== undefined && norm(body.firstName) !== norm(user.firstName)) return true;
    if (body.lastName !== undefined && norm(body.lastName) !== norm(user.lastName)) return true;
    if (body.tradeLicenseUrl !== undefined && norm(body.tradeLicenseUrl) !== norm(user.tradeLicenseUrl)) {
        return true;
    }

    if (incoming.businessName !== undefined && norm(incoming.businessName) !== norm(current.businessName)) {
        return true;
    }
    if (
        incoming.businessLocation !== undefined &&
        norm(incoming.businessLocation) !== norm(current.businessLocation)
    ) {
        return true;
    }
    if (body.location !== undefined && norm(body.location) !== norm(user.location)) return true;

    if (incoming.phone !== undefined && norm(incoming.phone) !== norm(current.phone)) return true;

    const curBp = (current.businessProfile || {}) as Record<string, unknown>;
    const incBp = (incoming.businessProfile || {}) as Record<string, unknown>;
    if (
        incBp.businessCategory !== undefined &&
        norm(incBp.businessCategory) !== norm(curBp.businessCategory) &&
        norm(incBp.businessCategory) !== norm(current.industry)
    ) {
        return true;
    }
    if (incoming.industry !== undefined && norm(incoming.industry) !== norm(current.industry)) return true;

    return false;
};
