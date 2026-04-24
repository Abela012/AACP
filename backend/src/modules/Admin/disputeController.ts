import { Request, Response, NextFunction } from 'express';
import Dispute from '../../database/models/Dispute';
import { success } from '../../utils/response';

export const getDisputes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, priority, category, search } = req.query;
        
        const query: any = {};
        if (status && status !== 'all') query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        
        if (search) {
            query.$or = [
                { id: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const disputes = await Dispute.find(query)
            .populate('reporter', 'firstName lastName username email profilePicture')
            .populate('against', 'firstName lastName username email profilePicture')
            .sort({ createdAt: -1 });

        // Map for frontend
        const mapped = disputes.map(d => {
            const reporter: any = d.reporter || {};
            return {
                id: d.id,
                title: d.title,
                description: d.description,
                reporter: reporter.firstName && reporter.lastName 
                    ? `${reporter.firstName} ${reporter.lastName}` 
                    : reporter.username || 'Unknown',
                reporterAvatar: reporter.profilePicture,
                reporterRole: (reporter as any).role || 'user',
                category: d.category,
                amount: d.metadata?.amount || 'N/A', // If relevant
                status: d.status,
                priority: d.priority,
                date: d.createdAt.toLocaleDateString(),
                messages: d.messages.length
            };
        });

        return success(res, "Disputes retrieved", mapped);
    } catch (error) {
        next(error);
    }
};

export const resolveDispute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { disputeId } = req.params;
        const { reason } = req.body;
        const adminId = (req as any).user?._id;

        const dispute = await Dispute.findOneAndUpdate(
            { id: disputeId },
            { 
                status: 'RESOLVED',
                resolution: {
                    resolvedBy: adminId,
                    reason,
                    resolvedAt: new Date()
                }
            },
            { new: true }
        );

        if (!dispute) return res.status(404).json({ error: "Dispute not found" });

        return success(res, "Dispute resolved", dispute);
    } catch (error) {
        next(error);
    }
};

export const escalateDispute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { disputeId } = req.params;
        
        const dispute = await Dispute.findOneAndUpdate(
            { id: disputeId },
            { status: 'ESCALATED', priority: 'HIGH' },
            { new: true }
        );

        if (!dispute) return res.status(404).json({ error: "Dispute not found" });

        return success(res, "Dispute escalated", dispute);
    } catch (error) {
        next(error);
    }
};
