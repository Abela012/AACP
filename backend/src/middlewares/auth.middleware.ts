import { Request, Response, NextFunction } from "express";
import User from "../database/models/User";
import { getAuth } from "@clerk/express";

// Middleware to ensure user is authenticated
export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        console.warn(`[Auth] No userId in auth object. Headers:`, JSON.stringify(req.headers));
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await User.findOne({ clerkId: auth.userId });
        if (!user) {
            console.warn(`[Auth] User not found for clerkId: ${auth.userId}`);
            return res.status(401).json({ error: "User not synced", message: "Please sync your profile before accessing this resource." });
        }
        // Attach user to request
        (req as any).user = user;
        return next();
    } catch (err) {
        console.error("[Auth] check error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Middleware to ensure user is an admin
export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        console.warn(`[AdminAuth] No userId in auth object. Path: ${req.path}`);
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await User.findOne({ clerkId: auth.userId });

        if (!user) {
            console.warn(`[AdminAuth] User not found for clerkId: ${auth.userId}`);
            return res.status(401).json({ error: "User not synced", message: "Please sync your profile before accessing this resource." });
        }

        if (user.role !== "admin") {
            console.warn(`[AdminAuth] Forbidden access attempt. User: ${user.email}, Role: ${user.role}`);
            return res.status(403).json({ error: "Forbidden: Admin access only" });
        }

        // Attach user to request for convenience in controllers
        (req as any).currentUser = user;

        next();
    } catch (error) {
        console.error("[AdminAuth] check error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const protect = requireAuth;
