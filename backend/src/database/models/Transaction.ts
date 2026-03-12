import mongoose, { Schema, model } from 'mongoose';

/**
 * Transaction Model
 * Owner: Backend Developer 3
 * Module: wallet/payments
 */
const transactionSchema = new Schema(
    {
        wallet: {
            type: Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['credit', 'debit', 'lock', 'unlock', 'refund', 'penalty', 'payment'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        balanceBefore: {
            type: Number,
            required: true,
            min: 0,
        },
        balanceAfter: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'reversed'],
            default: 'completed',
        },
        description: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        referenceType: {
            type: String,
            trim: true,
            maxlength: 80,
        },
        referenceId: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        metadata: {
            type: Object,
            default: {},
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ wallet: 1, createdAt: -1 });
transactionSchema.index({ referenceType: 1, referenceId: 1 });

const Transaction = model('Transaction', transactionSchema);

export default Transaction;
