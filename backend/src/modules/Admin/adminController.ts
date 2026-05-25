import { Request, Response, NextFunction } from "express";
import User from "../../database/models/User";
import Transaction from "../../database/models/Transaction";
import * as walletService from "../wallet/wallet.service";
import { success } from "../../utils/response";
import { createAuditLog } from "../audit/audit.service";
import * as adminAnalyticsService from "../../services/admin/adminAnalytics.service";
// import Report from "../../database/models/Report";
// import Comment from "../../database/models/Comment";

// --- Analytics ---
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      byRole,
      recentUsers,
      verifiedUsers,
      suspendedUsers,
      pendingCoinRequests,
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ status: { $in: ["banned", "suspended"] } }),
      Transaction.countDocuments({
        status: "pending",
        type: "credit",
        "metadata.requestType": "manual",
      }),
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

/**
 * Get efficiency pulse metrics (verification rate, response time, actions logged)
 */
export const getEfficiencyPulse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const metrics = await adminAnalyticsService.getEfficiencyPulseMetrics();
    return success(res, "Efficiency pulse metrics retrieved", metrics);
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate trust score for a specific user
 */
export const calculateTrustScore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const trustScoreData =
      await adminAnalyticsService.calculateTrustScore(userId);
    return success(res, "Trust score calculated", trustScoreData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get applicant reach and engagement metrics
 */
export const getApplicantMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const metrics = await adminAnalyticsService.getApplicantMetrics(limit);
    return success(res, "Applicant metrics retrieved", metrics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get profitability metrics for applicants
 */
export const getProfitabilityMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const metrics = await adminAnalyticsService.getProfitabilityMetrics(limit);
    return success(res, "Profitability metrics retrieved", metrics);
  } catch (error) {
    next(error);
  }
};

// --- User Management ---
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-clerkId") // Exclude sensitive info if any
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    return success(res, "Users retrieved", {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

import Wallet from "../../database/models/Wallet";
import AuditLog from "../../database/models/AuditLog";
import Opportunity from "../../database/models/Opportunity";
import Application from "../../database/models/Application";
import BusinessOwner from "../../database/models/businessOwner";
import AdvertiserProfile from "../../database/models/AdvertiserProfile";
import {
  getPlatformSettings,
  updatePlatformSettings,
  isDatabaseConnected,
} from "../platform/platformSettings.service";
import {
  mergeProfileData,
  sanitizeProfileDataForStorage,
} from "../../utils/profileDataMerge";

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-clerkId").lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let profileDoc: any = null;
    if (user.role === "business_owner") {
      profileDoc = await BusinessOwner.findOne({ userId }).lean();
    } else if (user.role === "advertiser") {
      profileDoc = await AdvertiserProfile.findOne({ userId }).lean();
    }

    const wallet = await Wallet.findOne({ user: userId }).lean();
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const logs = await AuditLog.find({ targetUserId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    let activeAds = 0;
    let collaborators = 0;

    if (user.role === "business_owner") {
      activeAds = await Opportunity.countDocuments({
        businessOwner: userId,
        status: "open",
      });
      collaborators = await Application.countDocuments({
        opportunity: {
          $in: await Opportunity.find({ businessOwner: userId }).distinct(
            "_id",
          ),
        },
        status: "approved",
      });
    } else {
      activeAds = await Application.countDocuments({
        applicant: userId,
        status: "approved",
      });
      collaborators = activeAds; // for creators, collaborations equals approved applications
    }

    const totalSpent = transactions
      .filter((t) => t.type === "debit" && t.status === "completed")
      .reduce((acc, val) => acc + val.amount, 0);
    const activeRequests = transactions.filter(
      (t) => t.status === "pending",
    ).length;

    // Merge profile document fields into user response so admin panel can read profileData and pending updates
    const userResponse = {
      ...user,
      ...(profileDoc || {}),
      wallet: wallet || { availableCoins: 0, totalCoins: 0 },
      transactions,
      logs,
      stats: {
        activeAds,
        collaborators,
        totalSpent,
        activeRequests,
      },
    };
    // Avoid overwriting _id or timestamps from the base user object with profileDoc's
    if (profileDoc) {
      userResponse._id = user._id;
      userResponse.createdAt = user.createdAt;
      userResponse.updatedAt = user.updatedAt;
    }

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (
      !["business_owner", "advertiser", "admin", "super_admin"].includes(role)
    ) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const actor = (req as any).currentUser || (req as any).user;

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (actor?._id && actor?.role) {
      await createAuditLog({
        action: "USER_ROLE_UPDATED",
        actorId: String(actor._id),
        actorRole: actor.role,
        targetUserId: userId,
        targetType: "user",
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
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // active, banned, suspended

    const actor = (req as any).currentUser || (req as any).user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isApproval = status === "active" || status === "approved";
    if (isApproval) {
      user.status = "active";
      user.isVerified = true;

      let profileDoc: any = null;
      if (user.role === "business_owner") {
        profileDoc = await BusinessOwner.findOne({ userId: user._id });
        if (!profileDoc) {
          profileDoc = new BusinessOwner({ userId: user._id });
        }
      } else if (user.role === "advertiser") {
        profileDoc = await AdvertiserProfile.findOne({ userId: user._id });
        if (!profileDoc) {
          profileDoc = new AdvertiserProfile({ userId: user._id });
        }
      }

      if (profileDoc) {
        const pendingUpdates = profileDoc.pendingUpdates;
        if (
          pendingUpdates &&
          typeof pendingUpdates === "object" &&
          Object.keys(pendingUpdates).length > 0
        ) {
          for (const key of Object.keys(pendingUpdates)) {
            const val = pendingUpdates[key];
            if (val !== undefined && val !== null) {
              if (
                [
                  "tradeLicenseUrl",
                  "idVerificationUrl",
                  "bio",
                  "location",
                  "businessName",
                ].includes(key)
              ) {
                profileDoc[key] = val;
              } else {
                (user as any)[key] = val;
              }
            }
          }
          if (
            typeof pendingUpdates.tradeLicenseUrl === "string" &&
            pendingUpdates.tradeLicenseUrl
          ) {
            profileDoc.tradeLicenseUrl = pendingUpdates.tradeLicenseUrl;
          }
          profileDoc.pendingUpdates = null;
        }

        if (
          profileDoc.pendingProfileData &&
          typeof profileDoc.pendingProfileData === "object"
        ) {
          const pending = profileDoc.pendingProfileData as Record<
            string,
            unknown
          >;
          const merged = mergeProfileData(
            (profileDoc.profileData || {}) as Record<string, unknown>,
            pending,
          );
          profileDoc.profileData = sanitizeProfileDataForStorage(merged);

          const licenseFromPending =
            (typeof pending.tradeLicenseUrl === "string" &&
              pending.tradeLicenseUrl) ||
            (typeof (profileDoc.profileData as Record<string, unknown>)
              ?.tradeLicenseUrl === "string"
              ? ((profileDoc.profileData as Record<string, unknown>)
                  .tradeLicenseUrl as string)
              : "");
          if (licenseFromPending) {
            profileDoc.tradeLicenseUrl = licenseFromPending;
          }

          profileDoc.pendingProfileData = null;
        } else if (profileDoc.profileData) {
          profileDoc.profileData = sanitizeProfileDataForStorage(
            profileDoc.profileData as Record<string, unknown>,
          );
        }

        profileDoc.markModified("profileData");
        profileDoc.markModified("pendingUpdates");
        profileDoc.markModified("pendingProfileData");
        await profileDoc.save();
      }
    } else {
      user.status = status;
    }
    await user.save();

    // Emit socket event for real-time update
    const io = (req.app as any).io;
    if (io) {
      io.to(`user:${user._id}`).emit("user:status_update", {
        status: user.status,
        isVerified: user.isVerified,
      });

      // Custom messages for better UX
      let title = "Account Update";
      let message = `Your account status has been updated to: ${status}`;

      if (status === "active" || status === "approved") {
        title = "Profile Approved! 🎉";
        message =
          "Your profile update has been reviewed and approved. Your public profile is now updated.";
      } else if (status === "suspended") {
        title = "Account Suspended ⚠️";
        message =
          "Your account has been suspended due to a policy violation. Please contact support.";
      } else if (status === "banned") {
        title = "Account Banned 🚫";
        message = "Your account has been permanently banned.";
      }

      io.to(`user:${user._id}`).emit("notification:new", {
        type: "system",
        title,
        message,
        createdAt: new Date().toISOString(),
      });
    }

    if (actor?._id && actor?.role) {
      await createAuditLog({
        action: "USER_STATUS_UPDATED",
        actorId: String(actor._id),
        actorRole: actor.role,
        targetUserId: userId,
        targetType: "user",
        targetId: userId,
        message: `Updated user status to ${status}`,
        metadata: { status },
        req,
      });
    }
    res.json(user);
  } catch (error: any) {
    console.error("[Admin] banUser failed:", error?.message || error);
    res
      .status(500)
      .json({ error: "Failed to update user status", detail: error?.message });
  }
};

export const getChartData = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
};
export const getReports = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
};
export const resolveReport = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
};
export const createNews = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented" });
};

// --- Wallet Requests ---
export const getWalletRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;
    const channel = String(req.query.channel || "manual").toLowerCase();

    const query: any = {};

    if (channel === "chapa") {
      query.type = "payment";
      query["metadata.provider"] = "chapa";
    } else {
      query.type = "credit";
      query["metadata.requestType"] = "manual";
    }

    if (status && status !== "All") {
      query.status = status.toLowerCase();
    }

    const transactions = await Transaction.find(query)
      .populate("user", "firstName lastName username role profilePicture email")
      .sort({ createdAt: -1 })
      .limit(100);

    const mappedRequests = transactions.map((t) => {
      const user: any = t.user || {};
      const userName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username || user.email || "Unknown User";

      const meta = t.metadata || {};
      const isChapa = channel === "chapa";

      return {
        _id: t._id,
        userId: user._id,
        user: userName,
        role: user.role,
        type: isChapa ? "Chapa top-up" : "Manual purchase",
        amount: t.amount,
        value: isChapa
          ? `${meta.coinsToCredit ?? meta.coinsCredited ?? "—"} coins · ${t.amount} ETB`
          : `${t.amount} coins`,
        coins: isChapa ? (meta.coinsToCredit ?? meta.coinsCredited) : t.amount,
        priceEtb: isChapa ? t.amount : meta.pricePaid,
        paymentMethod: meta.paymentMethod,
        proofUrl: meta.proofUrl,
        txRef: meta.tx_ref,
        date: t.createdAt,
        status: t.status.toUpperCase(),
        avatar: user.profilePicture,
        channel,
      };
    });

    // If search is provided, filter manually since we joined
    let finalRequests = mappedRequests;
    if (search) {
      const s = search.toLowerCase();
      finalRequests = mappedRequests.filter(
        (r) =>
          r.user.toLowerCase().includes(s) ||
          r._id.toString().toLowerCase().includes(s),
      );
    }

    return success(res, "Wallet requests retrieved", {
      requests: finalRequests,
      total: finalRequests.length,
    });
  } catch (error) {
    next(error);
  }
};

export const approveWalletRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestId } = req.params;
    const actor = (req as any).currentUser || (req as any).user;
    const adminId = actor?._id;
    const result = await walletService.approveRequest(requestId, adminId);
    if (actor?._id && actor?.role) {
      await createAuditLog({
        action: "WALLET_REQUEST_APPROVED",
        actorId: String(actor._id),
        actorRole: actor.role,
        targetUserId: String(result?.transaction?.user || ""),
        targetType: "transaction",
        targetId: requestId,
        message: "Approved coin request",
        metadata: { requestId },
        req,
      });
    }
    return success(res, "Request approved and coins credited", result);
  } catch (error) {
    next(error);
  }
};

export const getAdminSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
        detail: mongoOk
          ? "Driver connection is active."
          : "Database is not connected.",
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

export const patchAdminSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = (req as any).currentUser;
    const { maintenanceMode, allowPublicSignup, newUserStartingCoins } =
      req.body as {
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

    if (typeof maintenanceMode === "boolean")
      patch.maintenanceMode = maintenanceMode;
    if (typeof allowPublicSignup === "boolean")
      patch.allowPublicSignup = allowPublicSignup;
    if (typeof newUserStartingCoins === "number") {
      if (
        !Number.isFinite(newUserStartingCoins) ||
        newUserStartingCoins < 0 ||
        newUserStartingCoins > 100000
      ) {
        return res
          .status(400)
          .json({ error: "Starting coins must be between 0 and 100,000" });
      }
      patch.newUserStartingCoins = Math.round(newUserStartingCoins);
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const nextDoc = await updatePlatformSettings(patch);

    if (
      actor?._id &&
      actor?.role &&
      ["admin", "super_admin"].includes(actor.role)
    ) {
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

export const rejectWalletRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const actor = (req as any).currentUser || (req as any).user;
    const adminId = actor?._id;
    const result = await walletService.rejectRequest(
      requestId,
      adminId,
      reason,
    );
    if (actor?._id && actor?.role) {
      await createAuditLog({
        action: "WALLET_REQUEST_REJECTED",
        actorId: String(actor._id),
        actorRole: actor.role,
        targetType: "transaction",
        targetId: requestId,
        message: "Rejected coin request",
        metadata: { requestId, reason },
        req,
      });
    }
    return success(res, "Request rejected", result);
  } catch (error) {
    next(error);
  }
};

export const getAdminNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recent = await AuditLog.find()
      .populate(
        "actor",
        "firstName lastName username email role profilePicture",
      )
      .sort({ createdAt: -1 })
      .limit(30);

    const notifications = recent.map((log: any, index: number) => ({
      id: String(log._id),
      title: log.message || log.action,
      category: log.action?.includes("WALLET")
        ? "payments"
        : log.action?.includes("DISPUTE")
          ? "system"
          : log.action?.includes("USER")
            ? "user_activity"
            : "system",
      priority: ["SYSTEM_CONFIG_UPDATED", "DISPUTE_ESCALATED"].includes(
        log.action,
      )
        ? "high"
        : "normal",
      read: index > 6,
      createdAt: log.createdAt,
      action: log.action,
      targetType: log.targetType,
      actorName: log.actor
        ? `${log.actor.firstName || ""} ${log.actor.lastName || ""}`.trim() ||
          log.actor.username
        : "System",
    }));

    return success(res, "Notifications retrieved", { notifications });
  } catch (error) {
    next(error);
  }
};
