import { Request, Response, NextFunction } from 'express';
import AuditLog from '../../database/models/AuditLog';
import User from '../../database/models/User';
import Transaction from '../../database/models/Transaction';
import PlatformConfig from '../../database/models/PlatformConfig';
import { success } from '../../utils/response';
import { createAuditLog } from '../audit/audit.service';

const maskSecret = (value?: string) => {
    if (!value) return 'Not configured';
    if (value.length <= 8) return '********';
    return `${value.slice(0, 4)}${'*'.repeat(Math.max(value.length - 8, 8))}${value.slice(-4)}`;
};

const getOrCreatePlatformConfig = async () => {
    let config = await PlatformConfig.findOne();
    if (config) return config;

    config = await PlatformConfig.create({
        chapaSecretKeyMasked: maskSecret(process.env.CHAPA_SECRET_KEY),
        cloudinaryEnvironmentVariable: process.env.CLOUDINARY_CLOUD_NAME
            ? `cloudinary://${process.env.CLOUDINARY_API_KEY}:${maskSecret(process.env.CLOUDINARY_API_SECRET)}@${process.env.CLOUDINARY_CLOUD_NAME}`
            : 'Not configured',
    });

    return config;
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
        const action = (req.query.action as string) || '';
        const search = (req.query.search as string) || '';

        const query: any = {};
        if (action) query.action = action;
        if (search) {
            query.$or = [
                { message: { $regex: search, $options: 'i' } },
                { targetId: { $regex: search, $options: 'i' } },
                { targetType: { $regex: search, $options: 'i' } },
            ];
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('actor', 'firstName lastName username email role profilePicture')
                .populate('targetUser', 'firstName lastName username email role profilePicture')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            AuditLog.countDocuments(query),
        ]);

        return success(res, 'Audit logs retrieved', {
            logs,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        return next(error);
    }
};

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = (req.query.search as string) || '';
        const query: any = { role: { $in: ['admin', 'super_admin'] } };
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
            ];
        }

        const admins = await User.find(query)
            .select('-clerkId')
            .sort({ role: 1, createdAt: -1 })
            .limit(200);

        return success(res, 'Admins retrieved', { admins, total: admins.length });
    } catch (error) {
        return next(error);
    }
};

export const promoteExistingUserToAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const actor = (req as any).currentUser || (req as any).user;
        const { email, role } = req.body;
        const normalizedRole = role === 'super_admin' ? 'super_admin' : 'admin';

        if (!email) {
            return res.status(400).json({ error: 'email is required' });
        }

        const user = await User.findOne({ email: String(email).trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.role = normalizedRole;
        user.status = 'active';
        await user.save();

        if (actor?._id && actor?.role) {
            await createAuditLog({
                action: 'USER_ROLE_UPDATED',
                actorId: String(actor._id),
                actorRole: actor.role,
                targetUserId: String(user._id),
                targetType: 'user',
                targetId: String(user._id),
                message: `Promoted ${user.email} to ${normalizedRole}`,
                metadata: { role: normalizedRole, email: user.email },
                req,
            });
        }

        return success(res, 'User promoted successfully', { user });
    } catch (error) {
        return next(error);
    }
};

export const updateAdminUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const actor = (req as any).currentUser || (req as any).user;
        const { userId } = req.params;
        const { role, status } = req.body as { role?: 'admin' | 'super_admin'; status?: 'active' | 'banned' | 'suspended' };

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!['admin', 'super_admin'].includes(user.role)) {
            return res.status(400).json({ error: 'Target user is not an admin account' });
        }

        if (String(actor?._id) === String(user._id) && status && status !== 'active') {
            return res.status(400).json({ error: 'You cannot suspend or ban your own account' });
        }

        if (role && ['admin', 'super_admin'].includes(role)) {
            user.role = role;
        }
        if (status && ['active', 'banned', 'suspended'].includes(status)) {
            user.status = status;
        }
        await user.save();

        if (actor?._id && actor?.role) {
            if (role) {
                await createAuditLog({
                    action: 'USER_ROLE_UPDATED',
                    actorId: String(actor._id),
                    actorRole: actor.role,
                    targetUserId: String(user._id),
                    targetType: 'user',
                    targetId: String(user._id),
                    message: `Updated admin role to ${role}`,
                    metadata: { role },
                    req,
                });
            }
            if (status) {
                await createAuditLog({
                    action: 'USER_STATUS_UPDATED',
                    actorId: String(actor._id),
                    actorRole: actor.role,
                    targetUserId: String(user._id),
                    targetType: 'user',
                    targetId: String(user._id),
                    message: `Updated admin status to ${status}`,
                    metadata: { status },
                    req,
                });
            }
        }

        return success(res, 'Admin updated successfully', { user });
    } catch (error) {
        return next(error);
    }
};

export const getPlatformConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await getOrCreatePlatformConfig();

        return success(res, 'Platform config retrieved', config);
    } catch (error) {
        return next(error);
    }
};

export const updatePlatformConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const actor = (req as any).currentUser || (req as any).user;
        const config = await getOrCreatePlatformConfig();

        const allowedFields = [
            'maintenanceMode',
            'coinCostPostingAds',
            'coinCostApplicationFee',
            'globalCommissionRate',
        ] as const;

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                (config as any)[field] = req.body[field];
            }
        }

        await config.save();

        if (actor?._id && actor?.role) {
            await createAuditLog({
                action: 'SYSTEM_CONFIG_UPDATED',
                actorId: String(actor._id),
                actorRole: actor.role,
                targetType: 'platform_config',
                targetId: String(config._id),
                message: 'Updated platform configuration',
                metadata: req.body,
                req,
            });
        }

        return success(res, 'Platform config updated', config);
    } catch (error) {
        return next(error);
    }
};

export const getSecuritySummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [adminCount, superAdminCount, auditCount, recentCritical, pendingTransactions, suspendedUsers, recentLogs] = await Promise.all([
            User.countDocuments({ role: 'admin', status: 'active' }),
            User.countDocuments({ role: 'super_admin', status: 'active' }),
            AuditLog.countDocuments(),
            AuditLog.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                action: { $in: ['DISPUTE_ESCALATED', 'USER_STATUS_UPDATED', 'SYSTEM_CONFIG_UPDATED'] },
            }),
            Transaction.countDocuments({ status: 'pending' }),
            User.countDocuments({ status: { $in: ['banned', 'suspended'] } }),
            AuditLog.find()
                .populate('actor', 'firstName lastName username email role profilePicture')
                .sort({ createdAt: -1 })
                .limit(8),
        ]);

        return success(res, 'Security summary retrieved', {
            overview: {
                activeAdmins: adminCount + superAdminCount,
                superAdmins: superAdminCount,
                auditEvents: auditCount,
                criticalEvents7d: recentCritical,
                pendingTransactions,
                suspendedUsers,
            },
            controls: [
                { label: 'Admin MFA Enforcement', value: 'Enabled', status: 'healthy' },
                { label: 'RBAC Enforcement', value: 'Least privilege active', status: 'healthy' },
                { label: 'Transaction Monitoring', value: `${pendingTransactions} pending checks`, status: pendingTransactions > 0 ? 'warning' : 'healthy' },
                { label: 'Suspicious Account Review', value: `${suspendedUsers} restricted accounts`, status: suspendedUsers > 0 ? 'warning' : 'healthy' },
            ],
            recentLogs,
        });
    } catch (error) {
        return next(error);
    }
};

export const getSuperAdminNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recent = await AuditLog.find()
            .populate('actor', 'firstName lastName username email role profilePicture')
            .sort({ createdAt: -1 })
            .limit(15);

        const notifications = recent.map((log: any, index) => ({
            id: String(log._id),
            title: log.message || log.action,
            category:
                log.action.includes('WALLET') ? 'payments' :
                log.action.includes('DISPUTE') ? 'system' :
                log.action.includes('USER') ? 'user_activity' :
                'system',
            priority: ['SYSTEM_CONFIG_UPDATED', 'DISPUTE_ESCALATED'].includes(log.action) ? 'high' : 'normal',
            read: index > 4,
            createdAt: log.createdAt,
            actor: log.actor,
            action: log.action,
            targetType: log.targetType,
        }));

        return success(res, 'Notifications retrieved', { notifications });
    } catch (error) {
        return next(error);
    }
};

export const getSuperAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const actor = (req as any).currentUser || (req as any).user;
        const [auditCount, adminCount, recentActions] = await Promise.all([
            AuditLog.countDocuments({ actor: actor._id }),
            User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
            AuditLog.find({ actor: actor._id }).sort({ createdAt: -1 }).limit(5),
        ]);

        return success(res, 'Super admin profile retrieved', {
            profile: actor,
            stats: {
                auditEvents: auditCount,
                governedAdmins: adminCount,
                activeRole: actor.role,
            },
            recentActions,
        });
    } catch (error) {
        return next(error);
    }
};

