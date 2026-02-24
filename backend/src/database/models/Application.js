const mongoose = require('mongoose');

/**
 * Application Model
 * Owner: Backend Developer 2
 * Module: applications
 */
const applicationSchema = new mongoose.Schema(
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

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
