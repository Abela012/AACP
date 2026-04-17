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
                <h2 className="text-4xl font-bold text-[#001e00] mb-3">
                    {pendingVerification ? "Verify your email" : "Create your account"}
                </h2>
                <p className="text-base text-[#5e6d55]">
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
                        <label className="text-sm font-bold text-[#001e00] block">
                            I want to join as a
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('business_owner')}
                                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                                    role === 'business_owner'
                                        ? 'border-[#14a800] bg-[#14a800]/5 text-[#14a800]'
                                        : 'border-gray-100 bg-white text-[#5e6d55] hover:border-[#14a800]/30 hover:text-[#001e00]'
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
                                        ? 'border-[#14a800] bg-[#14a800]/5 text-[#14a800]'
                                        : 'border-gray-100 bg-white text-[#5e6d55] hover:border-[#14a800]/30 hover:text-[#001e00]'
                                }`}
                            >
                                <Megaphone size={22} />
                                <span className="text-xs font-bold">Advertiser</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="mb-1.5 block text-sm font-bold text-[#001e00]">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#001e00] placeholder-gray-400 transition-all focus:border-[#14a800] focus:ring-1 focus:ring-[#14a800] outline-none"
                                required
                            />
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
                    </div>

                    <div className="flex items-start gap-2 cursor-pointer group pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            className="mt-1 h-4 w-4 rounded border-gray-300 bg-white text-[#14a800] focus:ring-[#14a800] accent-[#14a800]"
                            required
                        />
                        <label htmlFor="terms" className="text-xs font-medium text-[#5e6d55] group-hover:text-[#001e00] transition-colors leading-relaxed">
                            I agree to the <Link to="/terms" className="text-[#14a800] font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#14a800] font-bold hover:underline">Privacy Policy</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-[#14a800] py-3.5 text-base font-bold text-white shadow-sm shadow-[#14a800]/20 transition-all hover:bg-[#108a00] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyCompletion} className="space-y-8">
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

            {!pendingVerification && (
                <>
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-6 text-[#5e6d55] font-bold tracking-widest leading-none">
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

                    <p className="mt-10 text-center text-sm font-medium text-[#5e6d55]">
                        Already have an account?{" "}
                        <Link
                            to="/auth/login"
                            className="font-bold text-[#14a800] hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </>
            )}
        </div>
    );
}
