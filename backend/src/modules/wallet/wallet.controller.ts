import { Request, Response, NextFunction } from 'express';
import * as walletService from './wallet.service';
import { success } from '../../utils/response';
import { uploadBufferToCloudinary } from '../../utils/cloudinaryUpload';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const isAdmin = (user: any) => ['admin', 'super_admin'].includes(user?.role);

/**
 * Wallet Controller
 * Keep controllers thin: delegate logic to service layer.
 */
export const createWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = isAdmin((req as any).user) && req.body.userId ? req.body.userId : (req as any).user?._id;
        const wallet = await walletService.createWallet(userId);

        return success(res, 'Wallet created successfully', wallet, 201);
    } catch (err) {
        return next(err);
    }
};

export const creditCoins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = {
            userId: req.body.userId,
            amount: Number(req.body.amount),
            description: req.body.description,
            referenceType: req.body.referenceType,
            referenceId: req.body.referenceId,
            metadata: req.body.metadata,
            performedBy: (req as any).user?._id,
        };

        const result = await walletService.creditCoins(payload);
        return success(res, 'Coins credited successfully', result);
    } catch (err) {
        return next(err);
    }
};

export const debitCoins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = {
            userId: isAdmin((req as any).user) && req.body.userId ? req.body.userId : (req as any).user?._id,
            amount: Number(req.body.amount),
            description: req.body.description,
            referenceType: req.body.referenceType,
            referenceId: req.body.referenceId,
            metadata: req.body.metadata,
            performedBy: (req as any).user?._id,
        };

        const result = await walletService.debitCoins(payload);
        return success(res, 'Coins debited successfully', result);
    } catch (err) {
        return next(err);
    }
};

export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = isAdmin((req as any).user) && req.query.userId ? req.query.userId as string : (req as any).user?.clerkId || (req as any).user?._id;
        const result = await walletService.getBalance(userId);
        return success(res, 'Wallet balance retrieved successfully', result);
    } catch (err) {
        return next(err);
    }
};

export const lockCoins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = {
            userId: req.body.userId,
            amount: Number(req.body.amount),
            description: req.body.description,
            referenceType: req.body.referenceType || 'collaboration',
            referenceId: req.body.referenceId,
            metadata: req.body.metadata,
            performedBy: (req as any).user?._id,
        };

        const result = await walletService.lockCoins(payload);
        return success(res, 'Coins locked successfully', result);
    } catch (err) {
        return next(err);
    }
};

export const unlockCoins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = {
            userId: req.body.userId,
            amount: Number(req.body.amount),
            description: req.body.description,
            referenceType: req.body.referenceType || 'collaboration',
            referenceId: req.body.referenceId,
            metadata: req.body.metadata,
            performedBy: (req as any).user?._id,
        };

        const result = await walletService.unlockCoins(payload);
        return success(res, 'Coins unlocked successfully', result);
    } catch (err) {
        return next(err);
    }
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = isAdmin((req as any).user) && req.query.userId ? req.query.userId as string : (req as any).user?.clerkId || (req as any).user?._id;
        const result = await walletService.getTransactions(userId);
        return success(res, 'Wallet transactions retrieved successfully', result);
    } catch (err) {
        return next(err);
    }
};

export const getManualPaymentInstructions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const instructions = await walletService.getManualPaymentInstructions();
        return success(res, 'Manual payment instructions retrieved', instructions);
    } catch (err) {
        return next(err);
    }
};

export const requestCoins = async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.clerkId || (req as any).user?._id;
        const coins = Number(req.body.coins);
        const paymentMethod = String(req.body.paymentMethod || 'manual-bank-transfer');
        const pricePaid = Number(req.body.pricePaid) || 0;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Payment proof file is required' });
        }

        const uploaded = await uploadBufferToCloudinary(req.file.buffer);
        const result = await walletService.requestCoins(
            userId,
            coins,
            paymentMethod,
            pricePaid,
            uploaded.secure_url
        );
        
        // Notify admins
        const io = (req.app as any).io;
        if (io) {
            io.to('admins').emit('notification:new', {
                type: 'payment',
                title: 'New Coin Request',
                message: `A user requested ${coins} coins via ${paymentMethod}.`,
                createdAt: new Date().toISOString()
            });
        }

        return success(res, result.message, result.transaction, 201);
    } catch (err) {
        return next(err);
    }
};
