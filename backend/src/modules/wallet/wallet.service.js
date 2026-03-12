const Wallet = require('../../database/models/Wallet');
const Transaction = require('../../database/models/Transaction');
const Collaboration = require('../../database/models/Collaboration');
const Application = require('../../database/models/Application');
const Opportunity = require('../../database/models/Opportunity');

const toObjectIdOrNull = (value) => {
    if (!value) return null;
    return value;
};

const assertValidAmount = (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error('Amount must be a number greater than 0');
        err.statusCode = 400;
        throw err;
    }
};

const buildNotFoundError = (message) => {
    const err = new Error(message);
    err.statusCode = 404;
    return err;
};

const buildBadRequestError = (message) => {
    const err = new Error(message);
    err.statusCode = 400;
    return err;
};

const referenceModelMap = {
    collaboration: Collaboration,
    application: Application,
    opportunity: Opportunity,
};

const validateReferenceLinkIfProvided = async (referenceType, referenceId) => {
    if (!referenceType && !referenceId) return;

    if (!!referenceType !== !!referenceId) {
        throw buildBadRequestError('referenceType and referenceId must be provided together');
    }

    const normalizedType = String(referenceType).toLowerCase();
    const Model = referenceModelMap[normalizedType];

    if (!Model) {
        throw buildBadRequestError(
            'Invalid referenceType. Allowed: collaboration, application, opportunity'
        );
    }

    const exists = await Model.exists({ _id: referenceId });
    if (!exists) {
        throw buildBadRequestError(`Referenced ${normalizedType} was not found`);
    }
};

exports.createWallet = async (userId) => {
    if (!userId) {
        throw buildBadRequestError('userId is required to create wallet');
    }

    const existing = await Wallet.findOne({ user: userId });
    if (existing) {
        return existing;
    }

    const wallet = await Wallet.create({
        user: userId,
        totalCoins: 0,
        lockedCoins: 0,
    });

    return wallet;
};

exports.creditCoins = async ({
    userId,
    amount,
    description,
    referenceType,
    referenceId,
    metadata,
    performedBy,
}) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }
    assertValidAmount(amount);
    await validateReferenceLinkIfProvided(referenceType, referenceId);

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        wallet = await exports.createWallet(userId);
    }

    const balanceBefore = wallet.totalCoins;
    wallet.totalCoins += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    const transaction = await Transaction.create({
        wallet: wallet._id,
        user: userId,
        type: 'credit',
        amount,
        balanceBefore,
        balanceAfter: wallet.totalCoins,
        status: 'completed',
        description: description || 'Coin credit',
        referenceType,
        referenceId: toObjectIdOrNull(referenceId),
        metadata: metadata || {},
        performedBy: toObjectIdOrNull(performedBy),
    });

    return {
        wallet,
        transaction,
    };
};

exports.debitCoins = async ({
    userId,
    amount,
    description,
    referenceType,
    referenceId,
    metadata,
    performedBy,
}) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }
    assertValidAmount(amount);
    await validateReferenceLinkIfProvided(referenceType, referenceId);

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        throw buildNotFoundError('Wallet not found');
    }

    const availableCoins = wallet.totalCoins - wallet.lockedCoins;
    if (availableCoins < amount) {
        throw buildBadRequestError('Insufficient available coin balance');
    }

    const balanceBefore = wallet.totalCoins;
    wallet.totalCoins -= amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    const transaction = await Transaction.create({
        wallet: wallet._id,
        user: userId,
        type: 'debit',
        amount,
        balanceBefore,
        balanceAfter: wallet.totalCoins,
        status: 'completed',
        description: description || 'Coin debit',
        referenceType,
        referenceId: toObjectIdOrNull(referenceId),
        metadata: metadata || {},
        performedBy: toObjectIdOrNull(performedBy),
    });

    return {
        wallet,
        transaction,
    };
};

exports.getBalance = async (userId) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        throw buildNotFoundError('Wallet not found');
    }

    return {
        userId,
        totalCoins: wallet.totalCoins,
        lockedCoins: wallet.lockedCoins,
        availableCoins: wallet.availableCoins,
        updatedAt: wallet.updatedAt,
    };
};

exports.lockCoins = async ({
    userId,
    amount,
    description,
    referenceType,
    referenceId,
    metadata,
    performedBy,
}) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }
    assertValidAmount(amount);
    await validateReferenceLinkIfProvided(referenceType, referenceId);

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        throw buildNotFoundError('Wallet not found');
    }

    const availableCoins = wallet.totalCoins - wallet.lockedCoins;
    if (availableCoins < amount) {
        throw buildBadRequestError('Insufficient available coin balance to lock');
    }

    const balanceBefore = wallet.totalCoins;
    wallet.lockedCoins += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    await Transaction.create({
        wallet: wallet._id,
        user: userId,
        type: 'lock',
        amount,
        balanceBefore,
        balanceAfter: wallet.totalCoins,
        status: 'completed',
        description: description || 'Coins locked',
        referenceType,
        referenceId: toObjectIdOrNull(referenceId),
        metadata: metadata || {},
        performedBy: toObjectIdOrNull(performedBy),
    });

    return {
        wallet,
        balance: {
            totalCoins: wallet.totalCoins,
            lockedCoins: wallet.lockedCoins,
            availableCoins: wallet.availableCoins,
        },
    };
};

exports.unlockCoins = async ({
    userId,
    amount,
    description,
    referenceType,
    referenceId,
    metadata,
    performedBy,
}) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }
    assertValidAmount(amount);
    await validateReferenceLinkIfProvided(referenceType, referenceId);

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        throw buildNotFoundError('Wallet not found');
    }

    if (wallet.lockedCoins < amount) {
        throw buildBadRequestError('Unlock amount exceeds locked coins');
    }

    const balanceBefore = wallet.totalCoins;
    wallet.lockedCoins -= amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    await Transaction.create({
        wallet: wallet._id,
        user: userId,
        type: 'unlock',
        amount,
        balanceBefore,
        balanceAfter: wallet.totalCoins,
        status: 'completed',
        description: description || 'Coins unlocked',
        referenceType,
        referenceId: toObjectIdOrNull(referenceId),
        metadata: metadata || {},
        performedBy: toObjectIdOrNull(performedBy),
    });

    return {
        wallet,
        balance: {
            totalCoins: wallet.totalCoins,
            lockedCoins: wallet.lockedCoins,
            availableCoins: wallet.availableCoins,
        },
    };
};
