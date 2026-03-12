import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Collaboration Model
 * Owner: Backend Developer 2
 * Module: collaborations
 */
export interface ISubmission extends Document {
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    notes?: string;
    submittedAt: Date;
    status: 'pending' | 'approved' | 'revision_requested' | 'rejected';
    feedbackFromOwner?: string;
    reviewedAt?: Date;
}

export interface IMilestone extends Document {
    title: string;
    description?: string;
    dueDate?: Date;
    status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
    submissions: ISubmission[];
}

export interface ICollaboration extends Document {
    opportunity: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    businessOwner: mongoose.Types.ObjectId;
    advertiser: mongoose.Types.ObjectId;
    status: 'active' | 'on_hold' | 'completed' | 'cancelled' | 'disputed';
    milestones: IMilestone[];
    agreedBudget: {
        amount: number;
        currency: string;
    };
    startDate: Date;
    completedDate?: Date;
    overallProgress: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const submissionSchema: Schema<ISubmission> = new Schema(
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

const milestoneSchema: Schema<IMilestone> = new Schema(
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

const collaborationSchema: Schema<ICollaboration> = new Schema(
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

const Collaboration: Model<ICollaboration> = mongoose.model<ICollaboration>('Collaboration', collaborationSchema);
export default Collaboration;
