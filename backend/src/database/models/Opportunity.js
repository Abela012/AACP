const mongoose = require('mongoose');

/**
 * Opportunity Model
 * Owner: Backend Developer 2
 * Module: opportunities
 */
const opportunitySchema = new mongoose.Schema(
    {
        businessOwner: {
            type: mongoose.Schema.Types.ObjectId,
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
            comment: 'Coins advertiser must spend to apply',
        },
        maxApplicants: { type: Number, default: 10 },
        selectedAdvertiser: {
            type: mongoose.Schema.Types.ObjectId,
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

const Opportunity = mongoose.model('Opportunity', opportunitySchema);
module.exports = Opportunity;
