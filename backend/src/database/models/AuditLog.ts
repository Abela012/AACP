import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
    | 'USER_ROLE_UPDATED'
    | 'USER_STATUS_UPDATED'
    | 'WALLET_REQUEST_APPROVED'
    | 'WALLET_REQUEST_REJECTED'
    | 'DISPUTE_ESCALATED'
    | 'DISPUTE_RESOLVED'
    | 'SYSTEM_CONFIG_UPDATED';

export interface IAuditLog extends Document {
    action: AuditAction;
    actor: mongoose.Types.ObjectId;
    actorRole: 'admin' | 'super_admin';
    targetUser?: mongoose.Types.ObjectId;
    targetType?: string;
    targetId?: string;
    message?: string;
    ip?: string;
    userAgent?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const auditLogSchema = new Schema(
    {
        action: { type: String, required: true, index: true },
        actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        actorRole: { type: String, enum: ['admin', 'super_admin'], required: true, index: true },
        targetUser: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
        targetType: { type: String, trim: true, default: null, index: true },
        targetId: { type: String, trim: true, default: null, index: true },
        message: { type: String, trim: true, maxlength: 500, default: '' },
        ip: { type: String, trim: true, default: '' },
        userAgent: { type: String, trim: true, default: '' },
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

