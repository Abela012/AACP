// models/businessProfile.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IBusinessProfile extends Document {
    userId: mongoose.Types.ObjectId;

    businessName?: string;

    businessEmail?: string;

    phoneNumber?: string;

    website?: string;

    industry?: string;

    companySize?: string;

    location?: string;

    bio?: string;

    tradeLicenseUrl?: string;

    idVerificationUrl?: string;

    verifiedAt?: Date;

    lastVerifiedAt?: Date;

    nextVerificationRequiredAt?: Date;

    pendingUpdates?: any;
    pendingProfileData?: any;
    profileData?: any;
}

const businessProfileSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        businessName: {
            type: String,
        },

        businessEmail: {
            type: String,
        },

        phoneNumber: {
            type: String,
        },

        website: {
            type: String,
        },

        industry: {
            type: String,
        },

        companySize: {
            type: String,
        },

        location: {
            type: String,
        },

        bio: {
            type: String,
        },

        tradeLicenseUrl: {
            type: String,
        },

        idVerificationUrl: {
            type: String,
        },

        verifiedAt: {
            type: Date,
        },

        lastVerifiedAt: {
            type: Date,
        },

        nextVerificationRequiredAt: {
            type: Date,
        },

        pendingUpdates: {
            type: Schema.Types.Mixed,
        },

        pendingProfileData: {
            type: Schema.Types.Mixed,
        },

        profileData: {
            type: Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IBusinessProfile>(
    "BusinessOwner",
    businessProfileSchema
);