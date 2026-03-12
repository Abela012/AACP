import { NextFunction } from 'express';
import { Schema, model } from 'mongoose';

/**
 * Wallet Model
 * Owner: Backend Developer 3
 * Module: wallet
 */
const walletSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        totalCoins: {
            type: Number,
            default: 0,
            min: 0,
        },
        lockedCoins: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastTransactionAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

walletSchema.virtual('availableCoins').get(function (this: any) {
    return Math.max(this.totalCoins - this.lockedCoins, 0);
});

walletSchema.pre('save', function (this: any, next: NextFunction) {
    if (this.lockedCoins > this.totalCoins) {
        return next(new Error('Locked coins cannot exceed total coins'));
    }
    return next();
});

const Wallet = model('Wallet', walletSchema);

export default Wallet;
