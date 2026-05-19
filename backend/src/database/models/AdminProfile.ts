// models/adminProfile.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IAdminProfile extends Document {
    userId: mongoose.Types.ObjectId;

    role: "admin" | "super_admin";

    permissions?: string[];

    notes?: string[];

    systemAccess?: boolean;
}

const adminProfileSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        role: {
            type: String,
            enum: ["admin", "super_admin"],
            required: true,
        },

        permissions: [
            {
                type: String,
            },
        ],

        notes: [
            {
                type: String,
            },
        ],

        systemAccess: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IAdminProfile>("AdminProfile", adminProfileSchema);