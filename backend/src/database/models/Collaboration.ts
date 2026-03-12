import { Schema, model } from 'mongoose';

/**
 * Collaboration Model
 * Owner: Backend Developer 2
 * Module: collaborations
 */
const submissionSchema = new Schema(
    {
        fileUrl: String,
        fileName: String,
        fileType: String,
        notes: String,
        submittedAt: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['pending', 'approved', 'revision_requested', 'rejected'],
            default: 'pending',
        },
        feedbackFromOwner: String,
        reviewedAt: Date,
    },
    { _id: true }
);

const milestoneSchema = new Schema(
    {
        title: { type: String, required: true },
        description: String,
        dueDate: Date,
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'submitted', 'approved', 'rejected'],
            default: 'pending',
        },
        submissions: [submissionSchema],
    },
    { _id: true }
);

const collaborationSchema = new Schema(
    {
        opportunity: {
            type: Schema.Types.ObjectId,
            ref: 'Opportunity',
            required: true,
        },
        application: {
            type: Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
            unique: true,
        },
        businessOwner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        advertiser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: [
                'active',
                'on_hold',
                'completed',
                'cancelled',
                'disputed',
            ],
            default: 'active',
        },
        milestones: [milestoneSchema],
        agreedBudget: {
            amount: Number,
            currency: { type: String, default: 'ETB' },
        },
        startDate: { type: Date, default: Date.now },
        completedDate: Date,
        overallProgress: { type: Number, default: 0, min: 0, max: 100 },
        notes: String,
    },
    { timestamps: true }
);

collaborationSchema.index({ businessOwner: 1, status: 1 });
collaborationSchema.index({ advertiser: 1, status: 1 });

const Collaboration = model('Collaboration', collaborationSchema);

export default Collaboration;
