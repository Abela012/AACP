import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Copy, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useInitiateTikTokVerification, useVerifyTikTokCode, useResendTikTokCode } from '../../../hooks/useTikTokDemoAuth';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../shared/context/UserContext';

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z"/>
    </svg>
);

type ModalState = 'input' | 'verifying' | 'checking' | 'success';

interface TikTokAuthModalProps {
    onClose: () => void;
}

export const TikTokAuthModal: React.FC<TikTokAuthModalProps> = ({ onClose }) => {
    const [state, setState] = useState<ModalState>('input');
    const [username, setUsername] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    const initiateMutation = useInitiateTikTokVerification();
    const verifyMutation = useVerifyTikTokCode();
    const resendMutation = useResendTikTokCode();

    const navigate = useNavigate();
    const { setUserRole, setOnboardingStatus } = useUser();

    // Timer logic
    useEffect(() => {
        if (!expiresAt || state !== 'verifying') return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(expiresAt).getTime() - now;
            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft('Expired');
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, state]);

    const handleInitiate = async () => {
        setErrorMsg('');
        if (!username.trim()) {
            setErrorMsg('Please enter a username');
            return;
        }
        try {
            const data = await initiateMutation.mutateAsync({ tiktokUsername: username });
            setVerificationCode(data.verificationCode);
            setExpiresAt(new Date(data.expiresAt));
            setState('verifying');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to initiate verification');
        }
    };

    const handleVerify = async () => {
        setState('checking');
        setErrorMsg('');
        try {
            const data = await verifyMutation.mutateAsync({ tiktokUsername: username, verificationCode });
            
            if (data.success && data.token) {
                setState('success');
                localStorage.setItem('tiktok_jwt', data.token);
                if (data.user) {
                    setUserRole(data.user.role);
                    setOnboardingStatus(data.user.status === 'active' || data.user.status === 'approved' ? 'approved' : 'incomplete');
                }
                setTimeout(() => {
                    onClose();
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (err: any) {
            setState('verifying');
            setErrorMsg(err.response?.data?.message || 'Verification failed. Make sure you posted the code.');
        }
    };

    const handleResend = async () => {
        setErrorMsg('');
        try {
            const data = await resendMutation.mutateAsync(username);
            setVerificationCode(data.verificationCode);
            setExpiresAt(new Date(data.expiresAt));
            setTimeLeft('');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to resend code');
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(verificationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
            >
                {/* Close Button */}
                {state !== 'checking' && state !== 'success' && (
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        ✕
                    </button>
                )}

                <div className="flex justify-center mb-6 text-black dark:text-white">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center">
                        <TikTokIcon />
                    </div>
                </div>

                {state === 'input' && (
                    <>
                        <h3 className="text-xl font-bold text-center mb-2 dark:text-white">Sign in with TikTok</h3>
                        <p className="text-sm text-center text-gray-500 mb-8">Enter your TikTok username to verify ownership. No password required.</p>
                        
                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                            <input 
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-10 pr-4 outline-none focus:border-black dark:focus:border-white dark:text-white transition-all"
                            />
                        </div>

                        {errorMsg && <p className="text-red-500 text-xs mb-4 text-center">{errorMsg}</p>}

                        <button
                            onClick={handleInitiate}
                            disabled={initiateMutation.isPending || !username}
                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                        >
                            {initiateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Continue'}
                        </button>
                    </>
                )}

                {state === 'verifying' && (
                    <>
                        <h3 className="text-xl font-bold text-center mb-2 dark:text-white">Verify Ownership</h3>
                        <p className="text-sm text-center text-gray-500 mb-6">
                            Paste this code into your <b>TikTok bio</b>.
                        </p>

                        <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center mb-6">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Verification Code</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-3xl font-black tracking-wider dark:text-white">{verificationCode}</span>
                                <button onClick={copyCode} className="text-gray-400 hover:text-black dark:hover:text-white">
                                    {copied ? <CheckCircle2 size={20} className="text-primary-blue" /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="flex items-start gap-2 bg-red-500/10 text-red-500 p-4 rounded-xl text-xs mb-6">
                                <AlertTriangle size={16} className="shrink-0" />
                                <p>{errorMsg}</p>
                            </div>
                        )}

                        <button
                            onClick={handleVerify}
                            className="w-full py-4 bg-[#00f2fe] text-black rounded-2xl font-bold hover:brightness-105 transition-all mb-4"
                        >
                            I've pasted it in my bio
                        </button>

                        <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-2">
                            <span>Expires in: <span className={timeLeft === 'Expired' ? 'text-red-500' : 'text-primary-blue'}>{timeLeft}</span></span>
                            <button 
                                onClick={handleResend}
                                disabled={resendMutation.isPending}
                                className="hover:text-black dark:hover:text-white flex items-center gap-1 disabled:opacity-50"
                            >
                                <RefreshCw size={12} className={resendMutation.isPending ? 'animate-spin' : ''} /> Resend Code
                            </button>
                        </div>
                    </>
                )}

                {state === 'checking' && (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                        <Loader2 size={48} className="animate-spin text-black dark:text-white mb-6" />
                        <h3 className="text-xl font-bold mb-2 dark:text-white">Scraping TikTok...</h3>
                        <p className="text-sm text-gray-500">Looking for your code. This takes about 10-15 seconds.</p>
                    </div>
                )}

                {state === 'success' && (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-primary-blue/10 text-primary-blue rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black mb-2 dark:text-white">Verified!</h3>
                        <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
