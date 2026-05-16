const apiBase = () =>
    import.meta.env.VITE_API_URL || 'https://aacp.onrender.com/api/v1';

export type TikTokAuthMode = 'signin' | 'signup';

export const startTikTokOAuth = (
    mode: TikTokAuthMode,
    role: 'business_owner' | 'advertiser'
) => {
    localStorage.setItem('pendingUserRole', role);
    const params = new URLSearchParams({ mode, role });
    window.location.href = `${apiBase()}/auth/tiktok/start?${params.toString()}`;
};
