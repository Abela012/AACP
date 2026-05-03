import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
    coverImage?: string;
    location?: string;
    tradeLicenseUrl?: string;
    idVerificationUrl?: string;
    following: mongoose.Types.ObjectId[];
    role: 'business_owner' | 'advertiser' | 'admin' | 'super_admin'
    status: 'incomplete' | 'pending' | 'active' | 'approved' | 'banned' | 'suspended';
    isVerified: boolean;
    profileData?: any;
    pendingProfileData?: any;
    totalPosts: number;
    averageRating: number;
    totalReviews: number;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema = new Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            default: "",
        },
        lastName: {
            type: String,
            default: "",
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        coverImage: {
            type: String,
            default: "",
        },
        tradeLicenseUrl: {
            type: String,
            default: "",
        },
        idVerificationUrl: {
            type: String,
            default: "",
        },

        location: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ['business_owner', 'advertiser', 'admin', 'super_admin'],
            default: 'advertiser',
            index: true,
        },
        status: {
            type: String,
            enum: ['incomplete', 'pending', 'active', 'approved', 'banned', 'suspended'],
            default: 'incomplete',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        profileData: {
            type: Schema.Types.Mixed,
            default: {},
        },
        pendingProfileData: {
            type: Schema.Types.Mixed,
            default: null,
        },
        totalPosts: {
            type: Number,
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        lastLogin: {
            type: Date,
        },

    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
