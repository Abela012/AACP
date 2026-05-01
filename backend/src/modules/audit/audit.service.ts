import { Request } from 'express';
import AuditLog, { AuditAction } from '../../database/models/AuditLog';

type CreateAuditLogInput = {
    action: AuditAction;
    actorId: string;
    actorRole: 'admin' | 'super_admin';
    targetUserId?: string | null;
    targetType?: string | null;
    targetId?: string | null;
    message?: string;
    metadata?: any;
    req?: Request;
};

export const createAuditLog = async ({
    action,
    actorId,
    actorRole,
    targetUserId,
    targetType,
    targetId,
    message,
    metadata,
    req,
}: CreateAuditLogInput) => {
    try {
        await AuditLog.create({
            action,
            actor: actorId,
            actorRole,
            targetUser: targetUserId || null,
            targetType: targetType || null,
            targetId: targetId || null,
            message: message || '',
            ip: (req as any)?.ip || (req as any)?.headers?.['x-forwarded-for'] || '',
            userAgent: (req as any)?.headers?.['user-agent'] || '',
            metadata: metadata || {},
        });
    } catch {
        // Never block core flows due to audit logging failure.
    }
};

