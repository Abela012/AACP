import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Model
 * Shared across auth-protected modules.
 */
const userSchema = new Schema(
    {
        fullName: {
            type: String,
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
            enum: ['user', 'admin', 'super_admin'],
            default: 'user',
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = model('User', userSchema);

export default User;
