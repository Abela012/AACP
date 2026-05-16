import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
    key: string;
    maintenanceMode: boolean;
    supportContactEmail: string;
    allowPublicSignup: boolean;
    newUserStartingCoins: number;
    createdAt: Date;
    updatedAt: Date;
}

const platformSettingsSchema = new Schema(
    {
        key: { type: String, default: 'singleton', unique: true, index: true },
        maintenanceMode: { type: Boolean, default: false },
        supportContactEmail: { type: String, trim: true, default: '' },
        allowPublicSignup: { type: Boolean, default: true },
        newUserStartingCoins: { type: Number, default: 1000, min: 0, max: 100000 },
    },
    { timestamps: true }
);

export default mongoose.model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);
