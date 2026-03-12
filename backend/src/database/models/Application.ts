import { Schema, model } from 'mongoose';

/**
 * Application Model
 * Owner: Backend Developer 2
 * Module: applications
 */
const applicationSchema = new Schema(
    {
        opportunity: {
            type: Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: true,
        },
        advertiser: {
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        aiMatchScore: { type: Number, default: null },
    },
    { timestamps: true }
);

applicationSchema.index({ opportunity: 1, advertiser: 1 }, { unique: true });
applicationSchema.index({ advertiser: 1, status: 1 });

const Application = model('Application', applicationSchema);

export default Application;
