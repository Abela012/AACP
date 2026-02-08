import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Briefcase, Megaphone, ShieldCheck } from "lucide-react";
import { useSignup } from "../../../hooks/useSignup";
import FacebookIcon from "../../../assets/Facebook.png";
import GoogleIcon from "../../../assets/google.webp";
import TiktokIcon from "../../../assets/tiktok.jpeg";

export default function RegisterForm() {
    const {
        code,
        setCode,
        emailAddress,
        setEmailAddress,
        password,
        setPassword,
        fullName,
        setFullName,
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSignUpPress();
    };

    const handleVerifyCompletion = async (e: FormEvent) => {
        e.preventDefault();
        await onVerifyPress();
    };

    return (
        <div className="flex flex-col">
            <div className="mb-10 text-left">
                <h2 className="text-4xl font-bold text-[#1e1b4b] mb-3">
                    {pendingVerification ? "Verify your email" : "Create your account"}
                </h2>
                <p className="text-base text-[#6366f1]">
                    {pendingVerification
                        ? `We've sent a 6-digit code to ${emailAddress}`
                        : "Join the verified marketplace for creative intelligence."}
                </p>
            </div>

            {error && (
                <div className="mb-8 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                    {error}
                </div>
            )}

            {!pendingVerification ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1e1b4b] block">
                            I want to join as a
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('business_owner')}
                                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                                    role === 'business_owner'
                                        ? 'border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]'
                                        : 'border-gray-100 bg-white text-[#6366f1] hover:border-[#7c3aed]/30 hover:text-[#1e1b4b]'
                                }`}
                            >
                                <Briefcase size={22} />
                                <span className="text-xs font-bold">Business Owner</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('advertiser')}
                                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                                    role === 'advertiser'
                                        ? 'border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]'
                                        : 'border-gray-100 bg-white text-[#6366f1] hover:border-[#7c3aed]/30 hover:text-[#1e1b4b]'
                                }`}
                            >
                                <Megaphone size={22} />
                                <span className="text-xs font-bold">Advertiser</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-[#1e1b4b]">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1e1b4b] placeholder-gray-400 transition-all focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-[#1e1b4b]">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1e1b4b] placeholder-gray-400 transition-all focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-[#1e1b4b]">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1e1b4b] placeholder-gray-400 transition-all focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7c3aed] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 cursor-pointer group pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            className="mt-1 h-4 w-4 rounded border-gray-300 bg-white text-[#7c3aed] focus:ring-[#7c3aed] accent-[#7c3aed]"
                            required
                        />
                        <label htmlFor="terms" className="text-xs font-medium text-[#6366f1] group-hover:text-[#1e1b4b] transition-colors leading-relaxed">
                            I agree to the <Link to="/terms" className="text-[#7c3aed] font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#7c3aed] font-bold hover:underline">Privacy Policy</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-[#7c3aed] py-3.5 text-base font-bold text-white shadow-sm shadow-[#7c3aed]/20 transition-all hover:bg-[#6d28d9] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyCompletion} className="space-y-8">
                    <div className="p-6 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/10 text-center">
                        <ShieldCheck className="w-12 h-12 text-[#7c3aed] mx-auto mb-4" />
                        <label className="mb-4 block text-sm font-bold text-[#1e1b4b]">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-[#1e1b4b] transition-all focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none shadow-sm"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full rounded-full bg-[#7c3aed] py-4 text-base font-bold text-white shadow-sm shadow-[#7c3aed]/20 transition-all hover:bg-[#6d28d9] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify & Complete"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setPendingVerification(false)}
                        className="w-full text-sm font-bold text-[#6366f1] hover:text-[#7c3aed] transition-colors"
                    >
                        Back to Sign Up
                    </button>
                </form>
            )}

            {!pendingVerification && (
                <>
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-6 text-[#6366f1] font-bold tracking-widest leading-none">
                                Or sign up with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button disabled className="opacity-50 cursor-not-allowed flex h-12 items-center justify-center rounded-xl border border-gray-100 bg-white transition-all shadow-sm">
                            <img src={FacebookIcon} alt="Facebook" className="h-6 w-6 object-contain" />
                        </button>
                        <button disabled className="opacity-50 cursor-not-allowed flex h-12 items-center justify-center rounded-xl border border-gray-100 bg-white transition-all shadow-sm">
                            <img src={TiktokIcon} alt="TikTok" className="h-6 w-6 object-contain rounded" />
                        </button>
                        <button disabled className="opacity-50 cursor-not-allowed flex h-12 items-center justify-center rounded-xl border border-gray-100 bg-white transition-all shadow-sm">
                            <img src={GoogleIcon} alt="Google" className="h-6 w-6 object-contain" />
                        </button>
                    </div>

                    <p className="mt-10 text-center text-sm font-medium text-[#6366f1]">
                        Already have an account?{" "}
                        <Link
                            to="/auth/login"
                            className="font-bold text-[#7c3aed] hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </>
            )}
        </div>
    );
}
