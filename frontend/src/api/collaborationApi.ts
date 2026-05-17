import type { AxiosInstance } from 'axios';

export interface Submission {
    _id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    notes?: string;
    status: 'pending' | 'approved' | 'revision_requested' | 'rejected';
    feedbackFromOwner?: string;
    submittedAt: string;
}

export interface Milestone {
    _id: string;
    title: string;
    description?: string;
    status: string;
    submissions: Submission[];
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'submitted' | 'approved';
    dueDate?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Collaboration {
    _id: string;
    opportunity: any;
    application: any;
    businessOwner: any;
    advertiser: any;
    status: 'active' | 'on_hold' | 'completed' | 'cancelled' | 'disputed';
    agreedBudget: {
        amount: number;
        currency: string;
    };
    startDate: string;
    completedDate?: string;
    overallProgress: number;
    tasks: Task[];
    milestones: Milestone[];
    activities: any[];
    createdAt: string;
    updatedAt: string;
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

    /** POST /collaborations/:id/tasks — Add task */
    addTask: (api: AxiosInstance, id: string, task: any) =>
        api.post<{ data: Collaboration }>(`/collaborations/${id}/tasks`, task),

    /** PUT /collaborations/:id/tasks/:taskId — Update task status */
    updateTask: (api: AxiosInstance, id: string, taskId: string, status: string) =>
        api.put<{ data: Collaboration }>(`/collaborations/${id}/tasks/${taskId}`, { status }),

    /** POST /collaborations/:id/deliverables — Submit deliverable */
    submitDeliverable: (api: AxiosInstance, id: string, deliverable: any, onProgress?: (p: number) => void) =>
        api.post<{ data: Collaboration }>(`/collaborations/${id}/deliverables`, deliverable, {
            headers: { 'Content-Type': undefined }, // Let Axios auto-set multipart boundary for FormData
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        }),

    /** PUT /collaborations/:id/deliverables/:submissionId/review — Review deliverable */
    reviewDeliverable: (api: AxiosInstance, id: string, submissionId: string, review: { status: string; feedback: string }) =>
        api.put<{ data: Collaboration }>(`/collaborations/${id}/deliverables/${submissionId}/review`, review),
};
