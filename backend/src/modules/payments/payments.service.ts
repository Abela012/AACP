import chapaConfig from '../../config/chapa';
import Wallet from '../../database/models/Wallet';
import Transaction from '../../database/models/Transaction';
import User from '../../database/models/User';
import walletService = require('../wallet/wallet.service');
import { COIN_PACK_CATALOG, resolveCoinPack } from './coinPacks';

type InitializeTopupInput = {
    userId: string;
    amount: number;
    coins: number;
    currency?: string;
    callbackUrl?: string;
    returnUrl?: string;
};

type ChapaApiResponse = {
    status?: string;
    message?: string;
    data?: Record<string, any>;
    [key: string]: any;
};

/** Chapa rejects titles longer than 16 characters. */
const CHAPA_CUSTOMIZATION_TITLE_MAX = 16;

const truncateChapaTitle = (title: string): string => {
    const t = title.trim();
    if (t.length <= CHAPA_CUSTOMIZATION_TITLE_MAX) return t;
    return t.slice(0, CHAPA_CUSTOMIZATION_TITLE_MAX);
};

const toErrorMessage = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
        return value.map((item) => toErrorMessage(item)).join(', ');
    }
    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (typeof record.message === 'string') return record.message;
        if (record.message !== undefined) return toErrorMessage(record.message);
        return JSON.stringify(record);
    }
    return 'Unknown Chapa error';
};

const assertAmount = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error('Amount must be a number greater than 0');
        (err as any).statusCode = 400;
        throw err;
    }
};

const requireChapaSecret = () => {
    if (!chapaConfig.secretKey) {
        const err = new Error('CHAPA_SECRET_KEY is not configured');
        (err as any).statusCode = 500;
        throw err;
    }
};

const callChapa = async (path: string, options: RequestInit = {}): Promise<ChapaApiResponse> => {
    requireChapaSecret();

    const response = await fetch(`${chapaConfig.baseUrl}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${chapaConfig.secretKey}`,
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    const payload = (await response.json()) as ChapaApiResponse;

    if (!response.ok || payload?.status === 'failed') {
        const err = new Error(toErrorMessage(payload?.message) || 'Chapa API request failed');
        (err as any).statusCode = 502;
        (err as any).details = payload;
        throw err;
    }

    return payload;
};

const buildTxRef = (userId: string) => {
    return `aacp_${String(userId)}_${Date.now()}`;
};

const assertCoins = (coins: number) => {
    if (!Number.isFinite(coins) || coins <= 0 || !Number.isInteger(coins)) {
        const err = new Error('Coins must be a positive whole number');
        (err as any).statusCode = 400;
        throw err;
    }
};

export const initializeTopup = async ({
    userId,
    amount,
    coins,
    currency = 'ETB',
    callbackUrl,
    returnUrl,
}: InitializeTopupInput) => {
    assertAmount(amount);
    assertCoins(coins);
    const pack = resolveCoinPack(amount, coins);

    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        (err as any).statusCode = 404;
        throw err;
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        wallet = await walletService.createWallet(userId);
    }
    if (!wallet) {
        const err = new Error('Wallet could not be created');
        (err as any).statusCode = 500;
        throw err;
    }

    const txRef = buildTxRef(userId);
    const chapaPayload: Record<string, any> = {
        amount: Number(pack.priceEtb.toFixed(2)),
        currency,
        email: user.email,
        first_name: user.firstName || user.username || 'AACP',
        last_name: user.lastName || 'User',
        tx_ref: txRef,
        customization: {
            title: truncateChapaTitle('AACP Top-up'),
            description: 'Wallet top-up payment',
        },
    };

    if (callbackUrl) chapaPayload.callback_url = callbackUrl;
    if (returnUrl) chapaPayload.return_url = returnUrl;

    const chapaResponse = await callChapa('/transaction/initialize', {
        method: 'POST',
        body: JSON.stringify(chapaPayload),
    });

    const balanceBefore = wallet.totalCoins;
    const pendingTransaction = await Transaction.create({
        wallet: wallet._id,
        user: userId,
        type: 'payment',
        amount: pack.priceEtb,
        balanceBefore,
        balanceAfter: balanceBefore,
        status: 'pending',
        description: `Wallet top-up: ${pack.coins} coins via Chapa`,
        referenceType: 'wallet_topup',
        metadata: {
            provider: 'chapa',
            tx_ref: txRef,
            chapaCheckoutUrl: chapaResponse?.data?.checkout_url,
            chapaStatus: 'initialized',
            currency,
            coinsToCredit: pack.coins,
            priceEtb: pack.priceEtb,
        },
        performedBy: userId,
    });

    return {
        txRef,
        checkoutUrl: chapaResponse?.data?.checkout_url,
        transaction: pendingTransaction,
    };
};

const markPaymentCredited = async (
    paymentTx: any,
    extras: Record<string, unknown>,
    creditedTransactionId?: unknown
) => {
    paymentTx.status = 'completed';
    paymentTx.metadata = {
        ...(paymentTx.metadata || {}),
        ...extras,
        credited: true,
        ...(creditedTransactionId ? { creditedTransactionId } : {}),
    };
    await paymentTx.save();
};

const creditWalletForTopup = async (paymentTx: any, chapaVerification: any) => {
    const txRef = paymentTx.metadata?.tx_ref;
    if (!txRef) {
        const err = new Error('Payment is missing tx_ref');
        (err as any).statusCode = 500;
        throw err;
    }

    if (paymentTx.metadata?.credited === true) {
        return { alreadyProcessed: true };
    }

    const existingCredit = await Transaction.findOne({
        type: 'credit',
        user: paymentTx.user,
        'metadata.provider': 'chapa',
        'metadata.tx_ref': txRef,
        status: 'completed',
    });

    if (existingCredit) {
        await markPaymentCredited(paymentTx, {
            chapaStatus: 'success',
            chapaTransactionId: chapaVerification?.id,
            creditedTransactionId: existingCredit._id,
        });
        return { alreadyProcessed: true, creditedTransaction: existingCredit };
    }

    const locked = await Transaction.findOneAndUpdate(
        {
            _id: paymentTx._id,
            'metadata.credited': { $ne: true },
            'metadata.creditProcessing': { $ne: true },
        },
        { $set: { 'metadata.creditProcessing': true } },
        { new: true }
    );

    if (!locked) {
        const creditAfterLock = await Transaction.findOne({
            type: 'credit',
            user: paymentTx.user,
            'metadata.provider': 'chapa',
            'metadata.tx_ref': txRef,
            status: 'completed',
        });
        if (creditAfterLock) {
            const freshPayment = await Transaction.findById(paymentTx._id);
            if (freshPayment) {
                await markPaymentCredited(freshPayment, {
                    chapaStatus: 'success',
                    creditedTransactionId: creditAfterLock._id,
                });
            }
        }
        return { alreadyProcessed: true, creditedTransaction: creditAfterLock || undefined };
    }

    const amountPaid = Number(chapaVerification?.amount ?? paymentTx.amount);
    let coinsToCredit = Number(paymentTx.metadata?.coinsToCredit);
    if (!Number.isFinite(coinsToCredit) || coinsToCredit <= 0) {
        const packByPrice = COIN_PACK_CATALOG.find((p) => p.priceEtb === amountPaid);
        if (packByPrice) {
            coinsToCredit = packByPrice.coins;
        }
    }
    if (!Number.isFinite(coinsToCredit) || coinsToCredit <= 0) {
        await Transaction.findByIdAndUpdate(paymentTx._id, {
            $unset: { 'metadata.creditProcessing': '' },
        });
        const err = new Error('Missing coin credit amount for this payment');
        (err as any).statusCode = 500;
        throw err;
    }

    try {
        const creditResult = await walletService.creditCoins({
            userId: String(paymentTx.user),
            amount: coinsToCredit,
            description: `Wallet top-up: ${coinsToCredit} coins via Chapa`,
            metadata: {
                provider: 'chapa',
                paymentTransactionId: String(paymentTx._id),
                tx_ref: txRef,
                chapaTransactionId: chapaVerification?.id,
                paidAmount: amountPaid,
                coinsCredited: coinsToCredit,
                currency: chapaVerification?.currency,
            },
            performedBy: paymentTx.user,
        });

        await markPaymentCredited(locked, {
            chapaStatus: 'success',
            chapaTransactionId: chapaVerification?.id,
            paidAmount: amountPaid,
            coinsCredited: coinsToCredit,
            currency: chapaVerification?.currency,
            creditedTransactionId: creditResult.transaction?._id,
        });

        return { alreadyProcessed: false, creditedTransaction: creditResult.transaction };
    } catch (error) {
        await Transaction.findByIdAndUpdate(paymentTx._id, {
            $unset: { 'metadata.creditProcessing': '' },
        });
        throw error;
    }
};

export const verifyTopup = async (txRef: string, requestingUserId?: string) => {
    if (!txRef) {
        const err = new Error('txRef is required');
        (err as any).statusCode = 400;
        throw err;
    }

    const paymentTx = await Transaction.findOne({
        type: 'payment',
        'metadata.provider': 'chapa',
        'metadata.tx_ref': txRef,
    });

    if (!paymentTx) {
        const err = new Error('Payment transaction not found');
        (err as any).statusCode = 404;
        throw err;
    }

    if (requestingUserId && String(paymentTx.user) !== String(requestingUserId)) {
        const err = new Error('Not authorized to verify this payment');
        (err as any).statusCode = 403;
        throw err;
    }

    const verification = await callChapa(`/transaction/verify/${encodeURIComponent(txRef)}`);
    const chapaData = verification?.data || {};
    const status = String(chapaData?.status || '').toLowerCase();

    if (status === 'pending' || status === 'processing' || status === '') {
        return {
            txRef,
            status: paymentTx.status,
            verified: false,
            message: 'Payment not confirmed by Chapa yet — wait a moment and try again.',
        };
    }

    if (status !== 'success') {
        paymentTx.status = 'failed';
        paymentTx.metadata = {
            ...(paymentTx.metadata || {}),
            chapaStatus: status || 'failed',
            chapaVerification: chapaData,
        };
        await paymentTx.save();

        return {
            txRef,
            status: paymentTx.status,
            verified: false,
            message: 'Payment not successful yet',
        };
    }

    const result = await creditWalletForTopup(paymentTx, chapaData);
    const coinsCredited = Number(paymentTx.metadata?.coinsToCredit) || 0;

    return {
        txRef,
        status: 'completed',
        verified: true,
        alreadyProcessed: result.alreadyProcessed,
        coinsCredited,
        amountEtb: Number(chapaData?.amount ?? paymentTx.amount),
        chapa: chapaData,
    };
};
