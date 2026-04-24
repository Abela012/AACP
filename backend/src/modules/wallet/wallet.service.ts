import Wallet from '../../database/models/Wallet';
import Transaction from '../../database/models/Transaction';
import Collaboration from '../../database/models/Collaboration';
import Application from '../../database/models/Application';
import Opportunity from '../../database/models/Opportunity';
import User from '../../database/models/User';
import mongoose from 'mongoose';

/**
 * Utility to find internal MongoDB User ID from Clerk ID or return as-is if already ObjectId
 */
const resolveMongoUserId = async (id: string | mongoose.Types.ObjectId) => {
    if (!id) return null;
    if (mongoose.Types.ObjectId.isValid(id.toString())) return id;
    
    const user = await User.findOne({ clerkId: id });
    return user ? user._id : null;
};

const toObjectIdOrNull = (value: any) => {
    if (!value) return null;
    return value;
};

const assertValidAmount = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
        const err: any = new Error('Amount must be a number greater than 0');
        err.statusCode = 400;
        throw err;
    }
};

const buildNotFoundError = (message: string) => {
    const err: any = new Error(message);
    err.statusCode = 404;
    return err;
};

const buildBadRequestError = (message: string) => {
    const err: any = new Error(message);
    err.statusCode = 400;
    return err;
};

const referenceModelMap: Record<string, any> = {
    collaboration: Collaboration,
    application: Application,
    opportunity: Opportunity,
};

const validateReferenceLinkIfProvided = async (referenceType?: string, referenceId?: string) => {
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

export const createWallet = async (userId: string | mongoose.Types.ObjectId) => {
    const mongoUserId = await resolveMongoUserId(userId);
    if (!mongoUserId) {
        throw buildNotFoundError('User not found in system');
    }

    const existing = await Wallet.findOne({ user: mongoUserId });
    if (existing) {
        return existing;
    }

    const wallet = await Wallet.create({
        user: mongoUserId,
        totalCoins: 0,
        lockedCoins: 0,
    });

    return wallet;
};

interface WalletOperationPayload {
    userId: string;
    amount: number;
    description?: string;
    referenceType?: string;
    referenceId?: string;
    metadata?: any;
    performedBy?: string;
}

export const creditCoins = async ({
    userId,
    amount,
    description,
    referenceType,
    referenceId,
    metadata,
    performedBy,
}: WalletOperationPayload) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }
    assertValidAmount(amount);
    await validateReferenceLinkIfProvided(referenceType, referenceId);

    const mongoUserId = await resolveMongoUserId(userId);
    if (!mongoUserId) throw buildNotFoundError('User not found');

    let wallet = await Wallet.findOne({ user: mongoUserId });
    if (!wallet) {
        wallet = await createWallet(mongoUserId);
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

export const debitCoins = async ({
    userId,
    amount,
    description,
    referenceType,
    referenceId,
    metadata,
    performedBy,
}: WalletOperationPayload) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }
    assertValidAmount(amount);
    await validateReferenceLinkIfProvided(referenceType, referenceId);

    const mongoUserId = await resolveMongoUserId(userId);
    if (!mongoUserId) throw buildNotFoundError('User not found');

    const wallet = await Wallet.findOne({ user: mongoUserId });
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

export const getBalance = async (userId: string) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }

    const mongoUserId = await resolveMongoUserId(userId);
    if (!mongoUserId) throw buildNotFoundError('User not found');

    let wallet = await Wallet.findOne({ user: mongoUserId });
    if (!wallet) {
        // Automatically create wallet if it doesn't exist to prevent 404s on dashboard load
        wallet = await createWallet(mongoUserId);
    }

    return {
        userId,
        balance: wallet.totalCoins,
        lockedBalance: wallet.lockedCoins,
        availableBalance: wallet.totalCoins - wallet.lockedCoins,
        currency: 'AACP',
        updatedAt: wallet.updatedAt,
    };
};

export const lockCoins = async ({
    userId,
    amount,
    description,
    referenceType,
    referenceId,
    metadata,
    performedBy,
}: WalletOperationPayload) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }
    assertValidAmount(amount);
    await validateReferenceLinkIfProvided(referenceType, referenceId);

    const mongoUserId = await resolveMongoUserId(userId);
    if (!mongoUserId) throw buildNotFoundError('User not found');

    const wallet = await Wallet.findOne({ user: mongoUserId });
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
            availableCoins: wallet.totalCoins - wallet.lockedCoins,
        },
    };
};

export const unlockCoins = async ({
    userId,
    amount,
    description,
    referenceType,
    referenceId,
    metadata,
    performedBy,
}: WalletOperationPayload) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }
    assertValidAmount(amount);
    await validateReferenceLinkIfProvided(referenceType, referenceId);

    const mongoUserId = await resolveMongoUserId(userId);
    if (!mongoUserId) throw buildNotFoundError('User not found');

    const wallet = await Wallet.findOne({ user: mongoUserId });
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
            availableCoins: wallet.totalCoins - wallet.lockedCoins,
        },
    };
};

export const getTransactions = async (userId: string) => {
    if (!userId) {
        throw buildBadRequestError('userId is required');
    }

    const mongoUserId = await resolveMongoUserId(userId);
    if (!mongoUserId) throw buildNotFoundError('User not found');

    const wallet = await Wallet.findOne({ user: mongoUserId });
    if (!wallet) return [];

    return await Transaction.find({ wallet: wallet._id }).sort({ createdAt: -1 });
};

/**
 * Create a PENDING coin purchase request.
 * Does NOT credit the wallet immediately — an admin must approve it.
 */
export const requestCoins = async (userId: string, coins: number, paymentMethod: string, pricePaid: number) => {
    if (!userId) throw buildBadRequestError('userId is required');
    assertValidAmount(coins);

    const mongoUserId = await resolveMongoUserId(userId);
    if (!mongoUserId) throw buildNotFoundError('User not found');

    let wallet = await Wallet.findOne({ user: mongoUserId });
    if (!wallet) {
        wallet = await createWallet(mongoUserId);
    }

    const transaction = await Transaction.create({
        wallet: wallet._id,
        user: mongoUserId,
        type: 'credit',
        amount: coins,
        balanceBefore: wallet.totalCoins,
        balanceAfter: wallet.totalCoins, // unchanged until approved
        status: 'pending',
        description: `Coin purchase request: ${coins} coins via ${paymentMethod} ($${pricePaid})`,
        metadata: { paymentMethod, pricePaid, requestedAt: new Date() },
    });

    return { transaction, message: 'Coin purchase request submitted. Awaiting admin approval.' };
};

/**
 * Approve a pending coin purchase request.
 * Credits the wallet and updates transaction status to 'completed'.
 */
export const approveRequest = async (transactionId: string, performedBy: string) => {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw buildNotFoundError('Transaction not found');
    if (transaction.status !== 'pending') throw buildBadRequestError('Transaction is already processed');

    const wallet = await Wallet.findById(transaction.wallet);
    if (!wallet) throw buildNotFoundError('Wallet not found');

    const balanceBefore = wallet.totalCoins;
    wallet.totalCoins += transaction.amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    transaction.status = 'completed';
    transaction.balanceBefore = balanceBefore;
    transaction.balanceAfter = wallet.totalCoins;
    transaction.metadata = { 
        ...transaction.metadata, 
        approvedAt: new Date(), 
        approvedBy: performedBy 
    };
    await transaction.save();

    return { wallet, transaction };
};

/**
 * Reject a pending coin purchase request.
 * Marks transaction as 'failed'.
 */
export const rejectRequest = async (transactionId: string, performedBy: string, reason?: string) => {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw buildNotFoundError('Transaction not found');
    if (transaction.status !== 'pending') throw buildBadRequestError('Transaction is already processed');

    transaction.status = 'failed';
    transaction.metadata = { 
        ...transaction.metadata, 
        rejectedAt: new Date(), 
        rejectedBy: performedBy,
        rejectionReason: reason || 'Rejected by admin'
    };
    await transaction.save();

    return { transaction };
};

