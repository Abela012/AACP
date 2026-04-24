import express from "express";
import { requireAdmin } from "../../middlewares/auth.middleware";
import {
    getDashboardStats,
    getChartData,
    getAllUsers,
    getUserById,
    updateUserRole,
    banUser,
    getReports,
    resolveReport,
    createNews,
    getWalletRequests,
    approveWalletRequest,
    rejectWalletRequest
} from "./adminController";

import {
    getDisputes,
    resolveDispute,
    escalateDispute
} from "./disputeController";

const router = express.Router();

// Apply admin check to all routes
router.use(requireAdmin);

// Analytics
router.get("/stats", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.put("/users/:userId/role", updateUserRole);
router.put("/users/:userId/status", banUser);

// Moderation
router.get("/reports", getReports);
router.put("/reports/:reportId", resolveReport);
router.get("/disputes", getDisputes);
router.put("/disputes/:disputeId/resolve", resolveDispute);
router.put("/disputes/:disputeId/escalate", escalateDispute);

// News
router.post("/news", createNews);

// Wallet
router.get("/wallet/requests", getWalletRequests);
router.post("/wallet/requests/:requestId/approve", approveWalletRequest);
router.post("/wallet/requests/:requestId/reject", rejectWalletRequest);

export default router;
