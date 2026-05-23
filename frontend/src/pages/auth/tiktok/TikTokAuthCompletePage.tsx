import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';

const apiBase = () =>
    import.meta.env.VITE_API_URL || 'https://aacp.onrender.com/api/v1';

export default function TikTokAuthCompletePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isLoaded, signIn, setActive } = useSignIn();

    const errorParam = searchParams.get('error');
    const token = searchParams.get('token');
    const roleFromCallback = searchParams.get('role');

    const urlMessage =
        errorParam ??
        (!token ? 'Missing sign-in token. Please try TikTok login again.' : null);

    const [asyncMessage, setAsyncMessage] = useState<string | null>(null);

    const message = urlMessage ?? asyncMessage ?? 'Completing TikTok sign-in…';
    const canAttemptSignIn = isLoaded && !errorParam && Boolean(token);

    useEffect(() => {
        if (!canAttemptSignIn || !signIn) return;

        const pendingRole =
            roleFromCallback ||
            localStorage.getItem('pendingUserRole') ||
            'advertiser';

        let cancelled = false;

        (async () => {
            try {
                const attempt = await signIn.create({
                    strategy: 'ticket',
                    ticket: token!,
                });

                if (attempt.status !== 'complete' || !attempt.createdSessionId) {
                    if (!cancelled) {
                        setAsyncMessage('Could not finish sign-in. Please try again.');
                    }
                    return;
                }

                await setActive({ session: attempt.createdSessionId });

                try {
                    await fetch(`${apiBase()}/users/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ role: pendingRole }),
                    });
                } catch {
                    /* useUserSync may retry on dashboard */
                }

                localStorage.removeItem('pendingUserRole');
                if (!cancelled) {
                    navigate('/dashboard', { replace: true });
                }
            } catch (err: unknown) {
                const clerkErr = err as { errors?: { message?: string }[] };
                if (!cancelled) {
                    setAsyncMessage(
                        clerkErr.errors?.[0]?.message ||
                            'TikTok sign-in failed. Please try again.'
                    );
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [canAttemptSignIn, navigate, roleFromCallback, setActive, signIn, token]);

    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 text-center">
            <p className="text-lg font-semibold text-aacp-ink">{message}</p>
            {errorParam ? (
                <button
                    type="button"
                    onClick={() => navigate('/auth/login', { replace: true })}
                    className="mt-6 text-sm font-bold text-aacp-olive hover:underline"
                >
                    Back to login
                </button>
            ) : null}
        </div>
    );
}
