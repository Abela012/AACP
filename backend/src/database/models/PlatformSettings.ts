import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
    key: string;
    maintenanceMode: boolean;
    supportContactEmail: string;
    createdAt: Date;
    updatedAt: Date;
}

const platformSettingsSchema = new Schema(
    {
        key: { type: String, default: 'singleton', unique: true, index: true },
        maintenanceMode: { type: Boolean, default: false },
        supportContactEmail: { type: String, trim: true, default: '' },
    },
    { timestamps: true }
);

export default mongoose.model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);
