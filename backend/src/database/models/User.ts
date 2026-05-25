// models/user.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    clerkId?: string;
    password?: string;

    email: string;

    username: string;

    firstName?: string;

    lastName?: string;

    profilePicture?: string;

    coverImage?: string;

    role: "advertiser" | "business_owner" | "admin" | "super_admin";

    status: "incomplete" | "pending" | "active" | "approved" | "banned" | "suspended";

    isVerified: boolean;

    emailVerified?: boolean;

    about?: string;

    savedCreators: mongoose.Types.ObjectId[];

    lastLogin?: Date;

    createdAt: Date;

    updatedAt: Date;

    socialProfiles?: any[];

    connectedAccounts?: any;

    averageRating?: number;

    totalReviews?: number;
}

const userSchema = new Schema(
    {
        clerkId: {
            type: String,
            sparse: true,
            unique: true,
        },

        password: {
            type: String,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        username: {
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

        profilePicture: {
            type: String,
            default: "",
        },

        coverImage: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["advertiser", "business_owner", "admin", "super_admin"],
            default: "advertiser",
        },

        status: {
            type: String,
            enum: ["incomplete", "pending", "active", "approved", "banned", "suspended"],
            default: "incomplete",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        about: {
            type: String,
            default: "",
        },

        savedCreators: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                default: [],
            },
        ],

        lastLogin: {
            type: Date,
        },

        socialProfiles: {
            type: [Schema.Types.Mixed],
            default: [],
        },

        connectedAccounts: {
            type: Schema.Types.Mixed,
            default: {},
        },

        averageRating: {
            type: Number,
            default: 0,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", function (next) {
    if (this.role === "admin" || this.role === "super_admin") {
        if (this.isNew) {
            this.isVerified = true;
            this.status = "active";
            this.emailVerified = true;
        } else if (this.isModified("role")) {
            this.isVerified = true;
            this.status = "active";
            this.emailVerified = true;
        }
    }
    next();
});

export default mongoose.model<IUser>("User", userSchema);