import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
    opportunity: mongoose.Types.ObjectId;
    advertiser: mongoose.Types.ObjectId;
    coverLetter?: string;
    proposedRate: {
        amount: number;
        currency: string;
    };
    proposedTimeline?: string;
    attachments: Array<{
        fileName: string;
        fileUrl: string;
        fileType: string;
    }>;
    status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
    coinsSpent: number;
    rejectionReason?: string;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    aiMatchScore?: number;
    createdAt: Date;
    updatedAt: Date;
}

const applicationSchema: Schema<IApplication> = new Schema(
    {
        opportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: true,
        },
        advertiser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        coverLetter: {
            type: String,
            maxlength: 3000,
        },
        proposedRate: {
            amount: Number,
            currency: { type: String, default: 'ETB' },
        },
        proposedTimeline: { type: String },
        attachments: [
            {
                fileName: String,
                fileUrl: String,
                fileType: String,
            },
        ],
        status: {
            type: String,
            enum: [
                'pending',
                'shortlisted',
                'accepted',
                'rejected',
                'withdrawn',
                'completed',
            ],
            default: 'pending',
        },
        coinsSpent: { type: Number, default: 0 },
        rejectionReason: { type: String },
        reviewedAt: { type: Date },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        aiMatchScore: { type: Number, default: null },
    },
    { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ opportunity: 1, advertiser: 1 }, { unique: true });
applicationSchema.index({ advertiser: 1, status: 1 });

const Application: Model<IApplication> = mongoose.model<IApplication>('Application', applicationSchema);
export default Application;
