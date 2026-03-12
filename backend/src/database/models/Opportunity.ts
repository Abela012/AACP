import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Opportunity Model
 * Owner: Backend Developer 2
 * Module: opportunities
 */
export interface IOpportunity extends Document {
    businessOwner: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: string;
    platforms: string[];
    deliverables: string[];
    budget: {
        amount: number;
        currency: string;
    };
    requirements: {
        minFollowers: number;
        preferredNiches: string[];
        location?: string;
    };
    deadline?: Date;
    applicationDeadline?: Date;
    status: 'draft' | 'open' | 'in_review' | 'closed' | 'completed' | 'cancelled';
    coinsRequired: number;
    maxApplicants: number;
    selectedAdvertiser?: mongoose.Types.ObjectId;
    tags: string[];
    viewsCount: number;
    aiRecommendationScore?: number;
    createdAt: Date;
    updatedAt: Date;
}

const opportunitySchema: Schema<IOpportunity> = new Schema(
    {
        businessOwner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: 5000,
        },
        category: {
            type: String,
            required: true,
        },
        platforms: [{ type: String }],
        deliverables: [{ type: String }],
        budget: {
            amount: { type: Number, required: true },
            currency: { type: String, default: 'ETB' },
        },
        requirements: {
            minFollowers: { type: Number, default: 0 },
            preferredNiches: [{ type: String }],
            location: { type: String },
        },
        deadline: { type: Date },
        applicationDeadline: { type: Date },
        status: {
            type: String,
            enum: ['draft', 'open', 'in_review', 'closed', 'completed', 'cancelled'],
            default: 'draft',
        },
        coinsRequired: {
            type: Number,
            default: 0,
        },
        maxApplicants: { type: Number, default: 10 },
        selectedAdvertiser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        tags: [{ type: String }],
        viewsCount: { type: Number, default: 0 },
        aiRecommendationScore: { type: Number, default: null },
    },
    { timestamps: true }
);

opportunitySchema.index({ status: 1, category: 1 });
opportunitySchema.index({ businessOwner: 1 });
opportunitySchema.index({ createdAt: -1 });

const Opportunity: Model<IOpportunity> = mongoose.model<IOpportunity>('Opportunity', opportunitySchema);
export default Opportunity;
