import mongoose, { Document, Schema } from 'mongoose';

export interface IManualPaymentInstructions {
    bankName: string;
    accountName: string;
    accountNumber: string;
    telebirrMerchantName: string;
    telebirrNumber: string;
    processingNote?: string;
}

export interface IPlatformConfig extends Document {
    maintenanceMode: boolean;
    coinCostPostingAds: number;
    coinCostApplicationFee: number;
    globalCommissionRate: number;
    manualPayment: IManualPaymentInstructions;
    chapaSecretKeyMasked: string;
    cloudinaryEnvironmentVariable: string;
    emailTemplates: {
        welcomeEmail: { title: string; description: string; updatedAt?: Date | null };
        adApproved: { title: string; description: string; updatedAt?: Date | null };
        passwordReset: { title: string; description: string; updatedAt?: Date | null };
    };
    createdAt: Date;
    updatedAt: Date;
}

const platformConfigSchema = new Schema(
    {
        maintenanceMode: { type: Boolean, default: false },
        coinCostPostingAds: { type: Number, default: 50, min: 0 },
        coinCostApplicationFee: { type: Number, default: 10, min: 0 },
        globalCommissionRate: { type: Number, default: 12.5, min: 0 },
        manualPayment: {
            bankName: { type: String, default: 'Commercial Bank of Ethiopia' },
            accountName: { type: String, default: 'AACP Platform' },
            accountNumber: { type: String, default: '100013456789' },
            telebirrMerchantName: { type: String, default: 'AACP Payments' },
            telebirrNumber: { type: String, default: '+251 912 345 678' },
            processingNote: {
                type: String,
                default: 'Manual payments are processed within 24-48 hours after admin verification.',
            },
        },
        chapaSecretKeyMasked: { type: String, default: '' },
        cloudinaryEnvironmentVariable: { type: String, default: '' },
        emailTemplates: {
            welcomeEmail: {
                title: { type: String, default: 'Welcome Email' },
                description: { type: String, default: 'Sent to new users after successful registration and email verification.' },
                updatedAt: { type: Date, default: null },
            },
            adApproved: {
                title: { type: String, default: 'Ad Approved' },
                description: { type: String, default: 'Sent to business owners when their advertisement has been vetted and approved.' },
                updatedAt: { type: Date, default: null },
            },
            passwordReset: {
                title: { type: String, default: 'Password Reset' },
                description: { type: String, default: 'Standard security template for password recovery flows.' },
                updatedAt: { type: Date, default: null },
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model<IPlatformConfig>('PlatformConfig', platformConfigSchema);

