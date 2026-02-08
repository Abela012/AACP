import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
    location?: string;
    following: mongoose.Types.ObjectId[];
    role: 'business_owner' | 'advertiser' | 'admin' | 'super_admin'
    status: 'active' | 'banned' | 'suspended';
    isVerified: boolean;
    totalPosts: number;
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
            enum: ['active', 'banned', 'suspended'],
            default: 'active',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        totalPosts: {
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
