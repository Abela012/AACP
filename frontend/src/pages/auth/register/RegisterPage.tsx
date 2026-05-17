import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Briefcase, Megaphone, ShieldCheck, Loader2, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import { useSignup } from "../../../hooks/useSignup";
import FacebookIcon from "../../../assets/Facebook.png";
import GoogleIcon from "../../../assets/google.webp";
import { useInitiateTikTokVerification, useVerifyTikTokCode, useResendTikTokCode } from '../../../hooks/useTikTokDemoAuth';
import { useUser } from '../../../shared/context/UserContext';

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z"/>
    </svg>
);

export default function RegisterForm() {
    const {
        code,
        setCode,
        emailAddress,
        setEmailAddress,
        password,
        setPassword,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        pendingVerification,
        setPendingVerification,
        loading,
        error,
        role,
        setRole,
        onSignUpPress,
        onVerifyPress,
    } = useSignup();

    const [showPassword, setShowPassword] = useState(false);

    // TikTok-First State
    const [state, setState] = useState<'input' | 'verifying' | 'checking' | 'success'>('input');
    const [tiktokUsername, setTiktokUsername] = useState('');
    const [tiktokPassword, setTiktokPassword] = useState('');
    const [showTiktokPassword, setShowTiktokPassword] = useState(false);
    const [tiktokCode, setTiktokCode] = useState('');
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [tiktokError, setTiktokError] = useState('');
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

    const handleClerkSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSignUpPress();
    };

    const handleClerkVerify = async (e: FormEvent) => {
        e.preventDefault();
        await onVerifyPress();
    };

    const handleTikTokInitiate = async (e: FormEvent) => {
        e.preventDefault();
        setTiktokError('');
        if (!tiktokUsername.trim()) {
            setTiktokError('Please enter a username');
            return;
        }
        if (!tiktokPassword.trim()) {
            setTiktokError('Please enter a password');
            return;
        }
        if (tiktokPassword.length < 6) {
            setTiktokError('Password must be at least 6 characters long');
            return;
        }
        try {
            const data = await initiateMutation.mutateAsync({ 
                tiktokUsername, 
                password: tiktokPassword, 
                mode: 'signup' 
            });
            setTiktokCode(data.verificationCode);
            setExpiresAt(new Date(data.expiresAt));
            setState('verifying');
        } catch (err: any) {
            setTiktokError(err.response?.data?.message || 'Failed to initiate verification');
        }
    };

    const handleTikTokVerify = async () => {
        setState('checking');
        setTiktokError('');
        try {
            const data = await verifyMutation.mutateAsync({ tiktokUsername, verificationCode: tiktokCode });
            
            if (data.success && data.token) {
                setState('success');
                localStorage.setItem('tiktok_jwt', data.token);
                if (data.user) {
                    setUserRole(data.user.role);
                    setOnboardingStatus(data.user.status === 'active' || data.user.status === 'approved' ? 'approved' : 'incomplete');
                }
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (err: any) {
            setState('verifying');
            setTiktokError(err.response?.data?.message || 'Verification failed. Make sure you posted the code.');
        }
    };

    const handleTikTokResend = async () => {
        setTiktokError('');
        try {
            const data = await resendMutation.mutateAsync(tiktokUsername);
            setTiktokCode(data.verificationCode);
            setExpiresAt(new Date(data.expiresAt));
            setTimeLeft('');
        } catch (err: any) {
            setTiktokError(err.response?.data?.message || 'Failed to resend code');
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(tiktokCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col relative w-full max-w-md mx-auto">
            {/* Title / Header */}
            <div className="mb-8 text-left">
                <h2 className="text-4xl font-bold text-[#001e00] mb-3">
                    {role === 'advertiser' 
                        ? 'Sign up with TikTok' 
                        : pendingVerification 
                            ? "Verify your email" 
                            : "Create your account"
                    }
                </h2>
                <p className="text-base text-[#5e6d55]">
                    {role === 'advertiser' 
                        ? 'TikTok is the primary and only way to register and log in. No password required.' 
                        : pendingVerification
                            ? `We've sent a 6-digit code to ${emailAddress}`
                            : "Join the verified marketplace for creative intelligence."
                    }
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                    {error}
                </div>
            )}

            {/* Role Selection (Only if not pending verification and advertiser is input state) */}
            {!pendingVerification && state === 'input' && (
                <div className="space-y-3 mb-8">
                    <label className="text-sm font-bold text-[#001e00] block">
                        Join as a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => { setRole('business_owner'); setState('input'); }}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'business_owner'
                                ? 'border-[#14a800] bg-[#14a800]/5 text-[#14a800]'
                                : 'border-gray-100 bg-white text-[#5e6d55] hover:border-[#14a800]/30 hover:text-[#001e00]'
                                }`}
                        >
                            <Briefcase size={20} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Business</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('advertiser')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'advertiser'
                                ? 'border-[#14a800] bg-[#14a800]/5 text-[#14a800]'
                                : 'border-gray-100 bg-white text-[#5e6d55] hover:border-[#14a800]/30 hover:text-[#001e00]'
                                }`}
                        >
                            <Megaphone size={20} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Advertiser</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Business Owner Form (Standard Clerk) ─── */}
            {role === 'business_owner' && (
                <>
                    {!pendingVerification ? (
                        <form onSubmit={handleClerkSubmit} className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="mb-1.5 block text-sm font-bold text-[#001e00]">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#001e00] placeholder-gray-400 transition-all focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] outline-none"
                                        required
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="mb-1.5 block text-sm font-bold text-[#001e00]">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#001e00] placeholder-gray-400 transition-all focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-[#001e00]">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#001e00] placeholder-gray-400 transition-all focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-[#001e00]">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#001e00] placeholder-gray-400 transition-all focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#14a800] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 cursor-pointer group pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 h-4 w-4 rounded border-gray-300 bg-white text-[#14a800] focus:ring-[#14a800] accent-[#14a800]"
                                    required
                                />
                                <label htmlFor="terms" className="text-xs font-medium text-[#5e6d55] group-hover:text-[#001e00] transition-colors leading-relaxed">
                                    I agree to the <Link to="/terms-of-service" className="text-[#14a800] font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-[#14a800] font-bold hover:underline">Privacy Policy</Link>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-full bg-[#14a800] py-3.5 text-base font-bold text-white shadow-sm shadow-[#14a800]/20 transition-all hover:bg-[#108a00] active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-4 text-[#5e6d55] font-bold tracking-widest">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="flex h-12 items-center justify-center rounded-xl border border-gray-100 bg-white transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                                >
                                    <img src={FacebookIcon} alt="Facebook" className="h-6 w-6 object-contain" />
                                </button>
                                <button
                                    type="button"
                                    className="flex h-12 items-center justify-center rounded-xl border border-gray-100 bg-white transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                                >
                                    <img src={GoogleIcon} alt="Google" className="h-6 w-6 object-contain" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleClerkVerify} className="space-y-8">
                            <div className="p-6 rounded-2xl bg-[#14a800]/5 border border-[#14a800]/10 text-center">
                                <ShieldCheck className="w-12 h-12 text-[#14a800] mx-auto mb-4" />
                                <label className="mb-4 block text-sm font-bold text-[#001e00]">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    maxLength={6}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-[#001e00] transition-all focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] outline-none shadow-sm"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full rounded-full bg-[#14a800] py-4 text-base font-bold text-white shadow-sm shadow-[#14a800]/20 transition-all hover:bg-[#108a00] active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Verify & Complete"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setPendingVerification(false)}
                                className="w-full text-sm font-bold text-[#5e6d55] hover:text-[#14a800] transition-colors"
                            >
                                Back to Sign Up
                            </button>
                        </form>
                    )}
                </>
            )}

            {/* ─── Advertiser Form (TikTok-First Bio Scrape Flow) ─── */}
            {role === 'advertiser' && (
                <div className="space-y-6">
                    {tiktokError && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                            {tiktokError}
                        </div>
                    )}

                    {state === 'input' && (
                        <form onSubmit={handleTikTokInitiate} className="space-y-6">
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-[#001e00]">
                                    Enter your TikTok username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                    <input 
                                        type="text"
                                        placeholder="username"
                                        value={tiktokUsername}
                                        onChange={(e) => setTiktokUsername(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] text-sm text-[#001e00] transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-[#001e00]">
                                    Create password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showTiktokPassword ? "text" : "password"}
                                        value={tiktokPassword}
                                        onChange={(e) => setTiktokPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-[#001e00] placeholder-gray-400 outline-none focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowTiktokPassword(!showTiktokPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#14a800] transition-colors"
                                    >
                                        {showTiktokPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={initiateMutation.isPending}
                                className="w-full rounded-full bg-black py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-black/80 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {initiateMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                                        <span>Generating Code...</span>
                                    </>
                                ) : (
                                    <>
                                        <TikTokIcon />
                                        <span>Generate Verification Code</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {state === 'verifying' && (
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Step 1: Copy this code</p>
                                <div className="flex items-center justify-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm max-w-[280px] mx-auto mb-4">
                                    <code className="text-xl font-extrabold tracking-wider text-black">{tiktokCode}</code>
                                    <button 
                                        onClick={copyCode}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                                    >
                                        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>

                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Step 2: Add it to your TikTok bio</p>
                                <p className="text-xs text-gray-500 mb-4">Add this exact verification code to your profile bio on TikTok.</p>

                                <div className="text-xs text-[#14a800] bg-[#14a800]/5 p-2 rounded-xl inline-block font-bold">
                                    ⏱️ Code Expires In: {timeLeft}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleTikTokVerify}
                                    className="w-full rounded-full bg-[#14a800] py-4 text-base font-bold text-white shadow-sm shadow-[#14a800]/20 hover:bg-[#108a00] active:scale-[0.98] transition-all"
                                >
                                    I've added the code
                                </button>
                                
                                <button
                                    onClick={handleTikTokResend}
                                    disabled={resendMutation.isPending}
                                    className="text-sm font-bold text-gray-500 hover:text-black flex items-center justify-center gap-1.5 py-2"
                                >
                                    <RefreshCw className={`w-4 h-4 ${resendMutation.isPending ? 'animate-spin' : ''}`} />
                                    <span>Resend Code</span>
                                </button>
                                
                                <button
                                    onClick={() => setState('input')}
                                    className="text-xs font-medium text-gray-400 hover:underline"
                                >
                                    Change Username
                                </button>
                            </div>
                        </div>
                    )}

                    {state === 'checking' && (
                        <div className="py-12 text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-[#14a800] animate-spin mx-auto" />
                            <h3 className="text-xl font-bold text-black">Verifying your bio...</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">Apify is scanning your TikTok profile bio for the verification code. This may take up to 10 seconds.</p>
                        </div>
                    )}

                    {state === 'success' && (
                        <div className="py-12 text-center space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-[#14a800] mx-auto animate-bounce" />
                            <h3 className="text-2xl font-bold text-black">Owner Verified!</h3>
                            <p className="text-sm text-gray-500">TikTok profile metrics successfully scraped. Logging you in...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Redirect Link */}
            {!pendingVerification && (
                <p className="mt-8 text-center text-sm font-medium text-[#5e6d55]">
                    Already have an account?{" "}
                    <Link
                        to="/auth/login"
                        className="font-bold text-[#14a800] hover:underline"
                    >
                        Log in
                    </Link>
                </p>
            )}
        </div>
    );
}
