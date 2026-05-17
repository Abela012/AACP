import { Request, Response, NextFunction } from "express";
import User from "../database/models/User";
import { getAuth } from "@clerk/express";
import jwt from "jsonwebtoken";

// Middleware to ensure user is authenticated
export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.log(`[Auth Middleware] Checking request to ${req.originalUrl}`);
    // 1. Check for custom JWT (TikTok Demo Auth)
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
        console.log(`[Auth Middleware] Found Bearer token: ${token.substring(0, 15)}...`);
        if (process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
                console.log(`[Auth Middleware] Token decoded successfully. userId: ${decoded.userId}`);
                if (decoded.userId) {
                    const user = await User.findById(decoded.userId);
                    if (user) {
                        console.log(`[Auth Middleware] User found in DB. Authenticated via TikTok JWT.`);
                        (req as any).user = user;
                        return next();
                    } else {
                        console.log(`[Auth Middleware] User NOT found in DB for userId: ${decoded.userId}`);
                    }
                }
            } catch (error: any) {
                console.log(`[Auth Middleware] JWT verification failed:`, error.message);
            }
        } else {
            console.log(`[Auth Middleware] process.env.JWT_SECRET is MISSING! Cannot verify token.`);
        }
    } else {
        console.log(`[Auth Middleware] No Bearer token found in headers.`);
    }

    console.log(`[Auth Middleware] Falling back to Clerk Auth...`);

    // 2. Fall back to Clerk Auth
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

        if (!['admin', 'super_admin'].includes(user.role)) {
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

// Middleware to ensure user is a super admin
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        console.warn(`[SuperAdminAuth] No userId in auth object. Path: ${req.path}`);
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await User.findOne({ clerkId: auth.userId });
        if (!user) {
            console.warn(`[SuperAdminAuth] User not found for clerkId: ${auth.userId}`);
            return res.status(401).json({ error: "User not synced", message: "Please sync your profile before accessing this resource." });
        }

        if (user.role !== 'super_admin') {
            console.warn(`[SuperAdminAuth] Forbidden access attempt. User: ${user.email}, Role: ${user.role}`);
            return res.status(403).json({ error: "Forbidden: Super Admin access only" });
        }

        (req as any).currentUser = user;
        (req as any).user = user;
        return next();
    } catch (error) {
        console.error("[SuperAdminAuth] check error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const protect = requireAuth;
