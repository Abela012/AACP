import chapaConfig from '../../config/chapa';
import Wallet from '../../database/models/Wallet';
import Transaction from '../../database/models/Transaction';
import User from '../../database/models/User';
import walletService = require('../wallet/wallet.service');

type InitializeTopupInput = {
    userId: string;
    amount: number;
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

const COIN_RATE = 1;

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
        const err = new Error(payload?.message || 'Chapa API request failed');
        (err as any).statusCode = 502;
        (err as any).details = payload;
        throw err;
    }

    return payload;
};

const buildTxRef = (userId: string) => {
    return `aacp_${String(userId)}_${Date.now()}`;
};

export const initializeTopup = async ({
    userId,
    amount,
    currency = 'ETB',
    callbackUrl,
    returnUrl,
}: InitializeTopupInput) => {
    assertAmount(amount);

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
        amount: Number(amount.toFixed(2)),
        currency,
        email: user.email,
        first_name: user.firstName || user.username || 'AACP',
        last_name: user.lastName || 'User',
        tx_ref: txRef,
        customization: {
            title: 'AACP Wallet Top-up',
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
        amount,
        balanceBefore,
        balanceAfter: balanceBefore,
        status: 'pending',
        description: 'Wallet top-up initiated via Chapa',
        referenceType: 'wallet_topup',
        metadata: {
            provider: 'chapa',
            tx_ref: txRef,
            chapaCheckoutUrl: chapaResponse?.data?.checkout_url,
            chapaStatus: 'initialized',
            currency,
            coinsToCredit: amount * COIN_RATE,
        },
        performedBy: userId,
    });

    return {
        txRef,
        checkoutUrl: chapaResponse?.data?.checkout_url,
        transaction: pendingTransaction,
    };
};

const creditWalletForTopup = async (paymentTx: any, chapaVerification: any) => {
    const isAlreadyCompleted = paymentTx.status === 'completed' || paymentTx.metadata?.credited === true;
    if (isAlreadyCompleted) {
        return { alreadyProcessed: true };
    }

    const amountPaid = Number(chapaVerification?.amount ?? paymentTx.amount);
    const coins = Number(amountPaid * COIN_RATE);

    const creditResult = await walletService.creditCoins({
        userId: String(paymentTx.user),
        amount: coins,
        description: 'Wallet top-up completed via Chapa',
        referenceType: 'wallet_topup',
        referenceId: paymentTx._id,
        metadata: {
            provider: 'chapa',
            tx_ref: paymentTx.metadata?.tx_ref,
            chapaTransactionId: chapaVerification?.id,
            paidAmount: amountPaid,
            currency: chapaVerification?.currency,
        },
        performedBy: paymentTx.user,
    });

    paymentTx.status = 'completed';
    paymentTx.metadata = {
        ...(paymentTx.metadata || {}),
        chapaStatus: 'success',
        chapaTransactionId: chapaVerification?.id,
        credited: true,
        creditedTransactionId: creditResult.transaction?._id,
        paidAmount: amountPaid,
        currency: chapaVerification?.currency,
    };
    await paymentTx.save();

    return { alreadyProcessed: false, creditedTransaction: creditResult.transaction };
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

    const verification = await callChapa(`/transaction/verify/${txRef}`);
    const chapaData = verification?.data || {};
    const status = String(chapaData?.status || '').toLowerCase();

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

    return {
        txRef,
        status: 'completed',
        verified: true,
        alreadyProcessed: result.alreadyProcessed,
        chapa: chapaData,
    };
};
