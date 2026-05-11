import { Request, Response, NextFunction } from 'express';
import { success } from '../../utils/response';
import * as paymentsService from './payments.service';

export const initializeTopup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?._id;
        const payload = {
            userId,
            amount: Number(req.body.amount),
            currency: req.body.currency,
            callbackUrl: req.body.callbackUrl,
            returnUrl: req.body.returnUrl,
        };

        const result = await paymentsService.initializeTopup(payload);
        return success(res, 'Chapa payment initialized', result, 201);
    } catch (err) {
        return next(err);
    }
};

export const verifyTopup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?._id;
        const txRef = String(req.body.txRef || req.query.txRef || '');
        const result = await paymentsService.verifyTopup(txRef, userId);
        return success(res, 'Payment verification completed', result);
    } catch (err) {
        return next(err);
    }
};

const extractTxRef = (req: Request): string =>
    String(
        req.body?.tx_ref ||
            req.body?.trx_ref ||
            req.body?.TxRef ||
            req.body?.txRef ||
            req.query.tx_ref ||
            req.query.trx_ref ||
            ''
    ).trim();

export const chapaWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const txRef = extractTxRef(req);
        if (!txRef) {
            return res.status(400).json({ success: false, message: 'tx_ref is required' });
        }

        await paymentsService.verifyTopup(txRef);
        return res.status(200).json({ success: true, message: 'Webhook processed' });
    } catch (err) {
        return next(err);
    }
};

export const chapaCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const txRef = extractTxRef(req);
        if (txRef) {
            await paymentsService.verifyTopup(txRef);
        }
        return res.status(200).json({
            success: true,
            message: txRef ? 'Verified' : 'Callback received',
            txRef: txRef || undefined,
        });
    } catch (err) {
        return next(err);
    }
};
