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

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-clerkId");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
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
        const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
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
