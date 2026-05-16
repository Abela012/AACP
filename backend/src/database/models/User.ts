import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    tiktokOpenId?: string;
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
        tiktokOpenId: {
            type: String,
            sparse: true,
            unique: true,
            index: true,
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

        bio: {
            type: String,
            default: ""
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
            tiktok: {
                username: String,
                profileLink: String,
                accountType: String,
                postingFrequency: String,
                followers: Number,
                engagementRate: Number,
                totalLikes: Number,
                avgViews: Number,
                avgComments: Number,
                avgShares: Number,
                niche: {},
                contentStyle: {},
                audienceGender: String,
                audienceTopCountry: String,
                audienceAgeRange: String,
            },

            instagram: {
                username: String,
                profileLink: String,
                accountType: String,
                postingFrequency: String,
                followers: Number,
                totalLikes: Number,
                avgViews: Number,
                engagementRate: Number,
                avgComments: Number,
                avgShares: Number,
                niche: {},
                contentStyle: {},
                audienceGender: String,
                audienceTopCountry: String,
                audienceAgeRange: String,
            },
            businessProfile: { type: Schema.Types.Mixed, default: undefined },
            capacity: { type: Schema.Types.Mixed, default: undefined },
            financialData: { type: Schema.Types.Mixed, default: undefined },
            targetAudience: { type: Schema.Types.Mixed, default: undefined },
            marketingGoals: { type: Schema.Types.Mixed, default: undefined },
            marketingHistory: { type: Schema.Types.Mixed, default: undefined },
            customerAnalytics: { type: Schema.Types.Mixed, default: undefined },
            profileCompletion: { type: Schema.Types.Mixed, default: undefined },
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

userSchema.pre('save', function (next) {
    const user = this as any;
    if (user.role === 'admin' || user.role === 'super_admin') {
        user.status = 'active';
    }

    // Compute Engagement Rate dynamically for TikTok and Instagram
    const parseNum = (val: any) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const cleaned = val.toUpperCase().replace(/[^0-9.KMB]/g, '');
            let multiplier = 1;
            if (cleaned.endsWith('K')) multiplier = 1000;
            else if (cleaned.endsWith('M')) multiplier = 1000000;
            else if (cleaned.endsWith('B')) multiplier = 1000000000;
            const num = parseFloat(cleaned.replace(/[KMB]/g, ''));
            return isNaN(num) ? 0 : num * multiplier;
        }
        return 0;
    };

    if (user.profileData?.tiktok) {
        const t = user.profileData.tiktok;
        const followers = parseNum(t.followers);
        const likes = parseNum(t.totalLikes);
        const comments = parseNum(t.avgComments);
        const shares = parseNum(t.avgShares);

        if (followers > 0) {
            t.engagementRate = parseFloat((((likes + comments + shares) / followers) * 100).toFixed(2));
        } else {
            t.engagementRate = 0;
        }
    }

    if (user.profileData?.instagram) {
        const i = user.profileData.instagram;
        const followers = parseNum(i.followers);
        const likes = parseNum(i.totalLikes);
        const comments = parseNum(i.avgComments);
        const shares = parseNum(i.avgShares);

        if (followers > 0) {
            i.engagementRate = parseFloat((((likes + comments + shares) / followers) * 100).toFixed(2));
        } else {
            i.engagementRate = 0;
        }
    }

    next();
});

export default mongoose.model<IUser>("User", userSchema);
