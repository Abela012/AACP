import mongoose, { Document, Schema } from "mongoose";

export interface IVerificationCode extends Document {
    advertiserId?: mongoose.Types.ObjectId;
    platform?: string;
    username?: string;
    tiktokUsername?: string; // Legacy support
    code: string;
    password?: string; // Temporarily store hashed password for user signup
    status: 'pending' | 'verified' | 'expired' | 'failed';
    attempts: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const verificationCodeSchema: Schema = new Schema(
    {
        advertiserId: { type: Schema.Types.ObjectId, ref: 'User' },
        platform: { type: String, enum: ['tiktok', 'instagram', 'youtube', 'facebook'], default: 'tiktok' },
        username: { type: String },
        tiktokUsername: { type: String },
        code: { type: String, required: true, unique: true },
        password: { type: String }, // Temporarily store hashed password for user signup
        status: { type: String, enum: ['pending', 'verified', 'expired', 'failed'], default: 'pending' },
        attempts: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IVerificationCode>("VerificationCode", verificationCodeSchema);
