import { Request, Response } from "express";
import User from "../../database/models/User.js";
// import Report from "../../database/models/Report.js";
// import Comment from "../../database/models/Comment.js";

// --- Analytics ---
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();

        res.json({
            totalUsers,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};



// --- User Management ---
export const getAllUsers = async (req: Request, res: Response) => {
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

        res.json({ users, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'writer', 'editor', 'user'].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user role" });
    }
}

export const banUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // active, banned, suspended

        const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user status" });
    }
}

export const getChartData = async (req: Request, res: Response) => { res.status(501).json({ message: "Not implemented" }); }
export const getReports = async (req: Request, res: Response) => { res.status(501).json({ message: "Not implemented" }); }
export const resolveReport = async (req: Request, res: Response) => { res.status(501).json({ message: "Not implemented" }); }
export const createNews = async (req: Request, res: Response) => { res.status(501).json({ message: "Not implemented" }); }
