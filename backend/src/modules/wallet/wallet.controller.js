const walletService = require('./wallet.service');
const { success } = require('../../utils/response');

const isAdmin = (user) => ['admin', 'super_admin'].includes(user?.role);

/**
 * Wallet Controller
 * Keep controllers thin: delegate logic to service layer.
 */
exports.createWallet = async (req, res, next) => {
    try {
        const userId = isAdmin(req.user) && req.body.userId ? req.body.userId : req.user?._id;
        const wallet = await walletService.createWallet(userId);

        return success(res, 'Wallet created successfully', wallet, 201);
    } catch (err) {
        return next(err);
    }
};

exports.creditCoins = async (req, res, next) => {
    try {
        const payload = {
            userId: req.body.userId,
            amount: Number(req.body.amount),
            description: req.body.description,
            referenceType: req.body.referenceType,
            referenceId: req.body.referenceId,
            metadata: req.body.metadata,
            performedBy: req.user?._id,
        };

        const result = await walletService.creditCoins(payload);
        return success(res, 'Coins credited successfully', result);
    } catch (err) {
        return next(err);
    }
};

exports.debitCoins = async (req, res, next) => {
    try {
        const payload = {
            userId: isAdmin(req.user) && req.body.userId ? req.body.userId : req.user?._id,
            amount: Number(req.body.amount),
            description: req.body.description,
            referenceType: req.body.referenceType,
            referenceId: req.body.referenceId,
            metadata: req.body.metadata,
            performedBy: req.user?._id,
        };

        const result = await walletService.debitCoins(payload);
        return success(res, 'Coins debited successfully', result);
    } catch (err) {
        return next(err);
    }
};

exports.getBalance = async (req, res, next) => {
    try {
        const userId = isAdmin(req.user) && req.query.userId ? req.query.userId : req.user?._id;
        const result = await walletService.getBalance(userId);
        return success(res, 'Wallet balance retrieved successfully', result);
    } catch (err) {
        return next(err);
    }
};

exports.lockCoins = async (req, res, next) => {
    try {
        const payload = {
            userId: req.body.userId,
            amount: Number(req.body.amount),
            description: req.body.description,
            referenceType: req.body.referenceType || 'collaboration',
            referenceId: req.body.referenceId,
            metadata: req.body.metadata,
            performedBy: req.user?._id,
        };

        const result = await walletService.lockCoins(payload);
        return success(res, 'Coins locked successfully', result);
    } catch (err) {
        return next(err);
    }
};

exports.unlockCoins = async (req, res, next) => {
    try {
        const payload = {
            userId: req.body.userId,
            amount: Number(req.body.amount),
            description: req.body.description,
            referenceType: req.body.referenceType || 'collaboration',
            referenceId: req.body.referenceId,
            metadata: req.body.metadata,
            performedBy: req.user?._id,
        };

        const result = await walletService.unlockCoins(payload);
        return success(res, 'Coins unlocked successfully', result);
    } catch (err) {
        return next(err);
    }
};
