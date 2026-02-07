export interface User {
    _id: string;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    role: 'business' | 'advertiser' | 'admin';
    onboardingStatus: boolean;
    profilePicture?: string;
    coinsTotal: number;
    coinsAvailable: number;
    createdAt: string;
    updatedAt: string;
}

export interface Opportunity {
    _id: string;
    businessOwner: string | User;
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
    deadline?: string;
    applicationDeadline?: string;
    status: 'draft' | 'open' | 'in_review' | 'closed' | 'completed' | 'cancelled';
    coinsRequired: number;
    maxApplicants: number;
    selectedAdvertiser?: string | User;
    tags: string[];
    viewsCount: number;
    aiRecommendationScore?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Application {
    _id: string;
    opportunityId: string | Opportunity;
    advertiserId: string | User;
    proposal: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    createdAt: string;
    updatedAt: string;
}
