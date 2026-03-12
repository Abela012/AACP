import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Model
 * Shared across auth-protected modules.
 */
export interface IUser extends Document {
    fullName: string;
    email: string;
    password?: string;
    role: 'business_owner' | 'advertiser' | 'user' | 'admin' | 'super_admin';
    isActive: boolean;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['business_owner', 'advertiser', 'user', 'admin', 'super_admin'],
            default: 'user',
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        profilePicture: String,
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
