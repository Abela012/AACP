import type { AxiosInstance } from 'axios';

export interface Submission {
    _id: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    notes?: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'revision_requested' | 'rejected';
    feedbackFromOwner?: string;
}

export interface Milestone {
    _id: string;
    title: string;
    description?: string;
    dueDate?: string;
    status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
    submissions: Submission[];
}

export interface Collaboration {
    _id: string;
    opportunity: any;
    application: any;
    businessOwner: any;
    advertiser: any;
    status: 'active' | 'on_hold' | 'completed' | 'cancelled' | 'disputed';
    milestones: Milestone[];
    agreedBudget: {
        amount: number;
        currency: string;
    };
    startDate: string;
    completedDate?: string;
    overallProgress: number;
    createdAt: string;
}

export const collaborationApi = {
    /** GET /collaborations/user/:userId — Get all collaborations for a user */
    getForUser: (api: AxiosInstance, userId: string) =>
        api.get<{ data: Collaboration[] }>(`/collaborations/user/${userId}`),

    /** GET /collaborations/:id — Get collaboration details */
    getById: (api: AxiosInstance, id: string) =>
        api.get<{ data: Collaboration }>(`/collaborations/${id}`),

    /** POST /collaborations/start — Start a collaboration */
    start: (api: AxiosInstance, applicationId: string) =>
        api.post<{ data: Collaboration }>('/collaborations/start', { applicationId }),

    /** PUT /collaborations/:id/complete — Mark as completed */
    complete: (api: AxiosInstance, id: string) =>
        api.put<{ data: Collaboration }>(`/collaborations/${id}/complete`),

    /** POST /collaborations/:id/milestones — Add milestone */
    addMilestone: (api: AxiosInstance, id: string, data: { title: string; description?: string; dueDate?: string }) =>
        api.post<{ data: Collaboration }>(`/collaborations/${id}/milestones`, data),

    /** POST /collaborations/:id/milestones/:milestoneId/submit — Submit deliverable */
    submitDeliverable: (api: AxiosInstance, id: string, milestoneId: string, data: { fileUrl: string; fileName?: string; notes?: string }) =>
        api.post<{ data: Collaboration }>(`/collaborations/${id}/milestones/${milestoneId}/submit`, data),

    /** PUT /collaborations/:id/milestones/:milestoneId/submissions/:submissionId/review — Review submission */
    reviewSubmission: (api: AxiosInstance, id: string, milestoneId: string, submissionId: string, data: { status: 'approved' | 'revision_requested' | 'rejected'; feedback?: string }) =>
        api.put<{ data: Collaboration }>(`/collaborations/${id}/milestones/${milestoneId}/submissions/${submissionId}/review`, data),
};
