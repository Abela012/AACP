import { Request, Response, NextFunction } from "express";
import User from "../../database/models/User";
import Transaction from "../../database/models/Transaction";
import * as walletService from '../wallet/wallet.service';
import { success } from '../../utils/response';
import { createAuditLog } from '../audit/audit.service';
// import Report from "../../database/models/Report";
// import Comment from "../../database/models/Comment";

// --- Analytics ---
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [totalUsers, byRole, recentUsers, verifiedUsers, suspendedUsers, pendingCoinRequests] = await Promise.all([
            User.countDocuments(),
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            User.countDocuments({ isVerified: true }),
            User.countDocuments({ status: { $in: ['banned', 'suspended'] } }),
            Transaction.countDocuments({ status: 'pending' }),
        ]);

        return success(res, "Dashboard stats retrieved", {
            totalUsers,
            byRole,
            recentUsers,
            verifiedUsers,
            suspendedUsers,
            pendingCoinRequests,
        });
    } catch (error) {
        next(error);
    }
};



// --- User Management ---
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const query: any = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { firstName: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(query)
            .select("-clerkId") // Exclude sensitive info if any
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments(query);

        return success(res, "Users retrieved", { users, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        next(error);
    }
};

import Wallet from "../../database/models/Wallet";
import AuditLog from "../../database/models/AuditLog";
import Opportunity from "../../database/models/Opportunity";
import Application from "../../database/models/Application";
import {
    getPlatformSettings,
    updatePlatformSettings,
    isDatabaseConnected,
} from "../platform/platformSettings.service";

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-clerkId").lean();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const wallet = await Wallet.findOne({ user: userId }).lean();
        const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean();
        const logs = await AuditLog.find({ targetUserId: userId }).sort({ createdAt: -1 }).limit(5).lean();
        
        let activeAds = 0;
        let collaborators = 0;
        
        if (user.role === 'business_owner') {
            activeAds = await Opportunity.countDocuments({ businessOwner: userId, status: 'open' });
            collaborators = await Application.countDocuments({ 
                opportunity: { $in: await Opportunity.find({ businessOwner: userId }).distinct('_id') },
                status: 'approved'
            });
        } else {
            activeAds = await Application.countDocuments({ applicant: userId, status: 'approved' });
            collaborators = activeAds; // for creators, collaborations equals approved applications
        }

        const totalSpent = transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((acc, val) => acc + val.amount, 0);
        const activeRequests = transactions.filter(t => t.status === 'pending').length;

        res.json({
            ...user,
            wallet: wallet || { availableCoins: 0, totalCoins: 0 },
            transactions,
            logs,
            stats: {
                activeAds,
                collaborators,
                totalSpent,
                activeRequests
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user details" });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['business_owner', 'advertiser', 'admin', 'super_admin'].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const actor = (req as any).currentUser || (req as any).user;

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (actor?._id && actor?.role) {
            await createAuditLog({
                action: 'USER_ROLE_UPDATED',
                actorId: String(actor._id),
                actorRole: actor.role,
                targetUserId: userId,
                targetType: 'user',
                targetId: userId,
                message: `Updated user role to ${role}`,
                metadata: { role },
                req,
            });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user role" });
    }
}

export const banUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // active, banned, suspended

        const actor = (req as any).currentUser || (req as any).user;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        user.status = status;
        if (status === 'active' || status === 'approved') {
            if (user.pendingProfileData) {
                user.profileData = {
                    ...(user.profileData || {}),
                    ...user.pendingProfileData
                };
                user.pendingProfileData = null;
                // Mark modified for Mixed type
                user.markModified('profileData');
                user.markModified('pendingProfileData');
            }
        }
        await user.save();
        
        // Emit socket event for real-time update
        const io = (req.app as any).io;
        if (io) {
            io.to(`user:${user._id}`).emit('user:status_update', { 
                status: user.status,
                isVerified: user.isVerified 
            });
            
            // Also send a formal notification
            io.to(`user:${user._id}`).emit('notification:new', {
                type: 'system',
                title: 'Account Status Updated',
                message: `Your account status has been updated to: ${status}`,
                createdAt: new Date().toISOString()
            });
        }

        if (actor?._id && actor?.role) {
            await createAuditLog({
                action: 'USER_STATUS_UPDATED',
                actorId: String(actor._id),
                actorRole: actor.role,
                targetUserId: userId,
                targetType: 'user',
                targetId: userId,
                message: `Updated user status to ${status}`,
                metadata: { status },
                req,
            });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user status" });
    }
}

export const getChartData = async (req: Request, res: Response) => { res.status(501).json({ message: "Not implemented" }); }
export const getReports = async (req: Request, res: Response) => { res.status(501).json({ message: "Not implemented" }); }
export const resolveReport = async (req: Request, res: Response) => { res.status(501).json({ message: "Not implemented" }); }
export const createNews = async (req: Request, res: Response) => { res.status(501).json({ message: "Not implemented" }); }

// --- Wallet Requests ---
export const getWalletRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string;
        const search = req.query.search as string;

        const query: any = {};
        if (status && status !== 'All') {
            query.status = status.toLowerCase();
        }

        const transactions = await Transaction.find(query)
            .populate('user', 'firstName lastName username role profilePicture email')
            .sort({ createdAt: -1 })
            .limit(100);

        const mappedRequests = transactions.map(t => {
            const user: any = t.user || {};
            const userName = user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.username || user.email || 'Unknown User';

            return {
                _id: t._id,
                userId: user._id,
                user: userName,
                role: user.role,
                type: t.type === 'credit' ? 'Purchase' : 'Withdrawal',
                amount: t.amount,
                value: `${t.amount} AACP`,
                date: t.createdAt,
                status: t.status.toUpperCase(),
                avatar: user.profilePicture
            };
        });

        // If search is provided, filter manually since we joined
        let finalRequests = mappedRequests;
        if (search) {
            const s = search.toLowerCase();
            finalRequests = mappedRequests.filter(r => 
                r.user.toLowerCase().includes(s) || 
                r._id.toString().toLowerCase().includes(s)
            );
        }

        return success(res, "Wallet requests retrieved", { requests: finalRequests, total: finalRequests.length });
    } catch (error) {
        next(error);
    }
};

export const approveWalletRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const actor = (req as any).currentUser || (req as any).user;
        const adminId = actor?._id;
        const result = await walletService.approveRequest(requestId, adminId);
        if (actor?._id && actor?.role) {
            await createAuditLog({
                action: 'WALLET_REQUEST_APPROVED',
                actorId: String(actor._id),
                actorRole: actor.role,
                targetUserId: String(result?.transaction?.user || ''),
                targetType: 'transaction',
                targetId: requestId,
                message: 'Approved coin request',
                metadata: { requestId },
                req,
            });
        }
        return success(res, "Request approved and coins credited", result);
    } catch (error) {
        next(error);
    }
};

export const getAdminSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await getPlatformSettings();
        const recentAudit = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(30)
            .populate("actor", "firstName lastName email username")
            .lean();

        const mongoOk = isDatabaseConnected();
        const services = [
            {
                id: "api",
                name: "Application API",
                status: "operational" as const,
                detail: "This server is responding to requests.",
            },
            {
                id: "database",
                name: "MongoDB",
                status: mongoOk ? ("operational" as const) : ("degraded" as const),
                detail: mongoOk ? "Driver connection is active." : "Database is not connected.",
            },
        ];

        return success(res, "Admin settings loaded", {
            settings: {
                maintenanceMode: settings.maintenanceMode,
                allowPublicSignup: settings.allowPublicSignup !== false,
                newUserStartingCoins: settings.newUserStartingCoins ?? 1000,
            },
            services,
            recentAudit: recentAudit.map((log: any) => ({
                id: String(log._id),
                action: log.action,
                message: log.message || log.action,
                createdAt: log.createdAt,
                actorName: log.actor
                    ? `${log.actor.firstName || ""} ${log.actor.lastName || ""}`.trim() ||
                      log.actor.username ||
                      log.actor.email ||
                      "Admin"
                    : "Unknown",
            })),
        });
    } catch (error) {
        next(error);
    }
};

export const patchAdminSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const actor = (req as any).currentUser;
        const { maintenanceMode, allowPublicSignup, newUserStartingCoins } = req.body as {
            maintenanceMode?: boolean;
            allowPublicSignup?: boolean;
            newUserStartingCoins?: number;
        };

        const prev = await getPlatformSettings();
        const patch: {
            maintenanceMode?: boolean;
            allowPublicSignup?: boolean;
            newUserStartingCoins?: number;
        } = {};

        if (typeof maintenanceMode === "boolean") patch.maintenanceMode = maintenanceMode;
        if (typeof allowPublicSignup === "boolean") patch.allowPublicSignup = allowPublicSignup;
        if (typeof newUserStartingCoins === "number") {
            if (!Number.isFinite(newUserStartingCoins) || newUserStartingCoins < 0 || newUserStartingCoins > 100000) {
                return res.status(400).json({ error: "Starting coins must be between 0 and 100,000" });
            }
            patch.newUserStartingCoins = Math.round(newUserStartingCoins);
        }

        if (Object.keys(patch).length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });
        }

        const nextDoc = await updatePlatformSettings(patch);

        if (actor?._id && actor?.role && ["admin", "super_admin"].includes(actor.role)) {
            await createAuditLog({
                action: "SYSTEM_CONFIG_UPDATED",
                actorId: String(actor._id),
                actorRole: actor.role as "admin" | "super_admin",
                targetType: "platform_settings",
                targetId: "singleton",
                message: "Updated platform settings",
                metadata: {
                    before: {
                        maintenanceMode: prev.maintenanceMode,
                        allowPublicSignup: prev.allowPublicSignup !== false,
                        newUserStartingCoins: prev.newUserStartingCoins ?? 1000,
                    },
                    after: patch,
                },
                req,
            });
        }

        return success(res, "Settings updated", {
            settings: {
                maintenanceMode: nextDoc!.maintenanceMode,
                allowPublicSignup: nextDoc!.allowPublicSignup !== false,
                newUserStartingCoins: nextDoc!.newUserStartingCoins ?? 1000,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const rejectWalletRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;
        const actor = (req as any).currentUser || (req as any).user;
        const adminId = actor?._id;
        const result = await walletService.rejectRequest(requestId, adminId, reason);
        if (actor?._id && actor?.role) {
            await createAuditLog({
                action: 'WALLET_REQUEST_REJECTED',
                actorId: String(actor._id),
                actorRole: actor.role,
                targetType: 'transaction',
                targetId: requestId,
                message: 'Rejected coin request',
                metadata: { requestId, reason },
                req,
            });
        }
        return success(res, "Request rejected", result);
    } catch (error) {
        next(error);
    }
};

export const getAdminNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recent = await AuditLog.find()
            .populate('actor', 'firstName lastName username email role profilePicture')
            .sort({ createdAt: -1 })
            .limit(30);

        const notifications = recent.map((log: any, index: number) => ({
            id: String(log._id),
            title: log.message || log.action,
            category:
                log.action?.includes('WALLET') ? 'payments' :
                log.action?.includes('DISPUTE') ? 'system' :
                log.action?.includes('USER') ? 'user_activity' :
                'system',
            priority: ['SYSTEM_CONFIG_UPDATED', 'DISPUTE_ESCALATED'].includes(log.action) ? 'high' : 'normal',
            read: index > 6,
            createdAt: log.createdAt,
            action: log.action,
            targetType: log.targetType,
            actorName: log.actor
                ? `${log.actor.firstName || ''} ${log.actor.lastName || ''}`.trim() || log.actor.username
                : 'System',
        }));

        return success(res, 'Notifications retrieved', { notifications });
    } catch (error) {
        next(error);
    }
};
