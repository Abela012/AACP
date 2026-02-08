import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Briefcase, Megaphone } from "lucide-react";
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
            <div className="mb-8 text-left">
                <h2 className="text-3xl font-serif font-bold text-white mb-2">
                    {pendingVerification ? "Verify your email" : "Join AACP today"}
                </h2>
                <p className="text-sm text-gray-400">
                    {pendingVerification
                        ? `We've sent a 6-digit code to ${emailAddress}`
                        : "Start your journey with creative intelligence"}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                    {error}
                </div>
            )}

            {!pendingVerification ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Selection */}
                    <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            I am a
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('business_owner')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    role === 'business_owner'
                                        ? 'border-[#0FE073] bg-[#0FE073]/10 text-[#0FE073]'
                                        : 'border-[#1A2620] bg-[#121A16] text-gray-400 hover:border-[#23352C] hover:text-gray-300'
                                }`}
                            >
                                <Briefcase size={24} />
                                <span className="text-xs font-bold">Business Owner</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('advertiser')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    role === 'advertiser'
                                        ? 'border-[#0FE073] bg-[#0FE073]/10 text-[#0FE073]'
                                        : 'border-[#1A2620] bg-[#121A16] text-gray-400 hover:border-[#23352C] hover:text-gray-300'
                                }`}
                            >
                                <Megaphone size={24} />
                                <span className="text-xs font-bold">Advertiser</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full rounded-xl border border-[#1A2620] bg-[#121A16] px-4 py-3 text-sm text-white placeholder-gray-600 transition-all focus:border-[#0FE073] focus:ring-1 focus:ring-[#0FE073] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full rounded-xl border border-[#1A2620] bg-[#121A16] px-4 py-3 text-sm text-white placeholder-gray-600 transition-all focus:border-[#0FE073] focus:ring-1 focus:ring-[#0FE073] outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-[#1A2620] bg-[#121A16] px-4 py-3 text-sm text-white placeholder-gray-600 transition-all focus:border-[#0FE073] focus:ring-1 focus:ring-[#0FE073] outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            id="terms"
                            className="mt-0.5 h-4 w-4 rounded border-[#1A2620] bg-[#121A16] accent-[#0FE073] focus:ring-[#0FE073]"
                            required
                        />
                        <label htmlFor="terms" className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                            I agree to the <Link to="/terms" className="text-[#0FE073] font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#0FE073] font-bold hover:underline">Privacy Policy</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#0FE073] py-3.5 text-sm font-bold text-black shadow-lg shadow-[#0FE073]/20 transition-all hover:bg-[#0BC463] hover:shadow-[#0FE073]/40 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyCompletion} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            className="w-full rounded-xl border border-[#1A2620] bg-[#121A16] px-4 py-4 text-center text-2xl font-bold tracking-[1em] text-white transition-all focus:border-[#0FE073] focus:ring-1 focus:ring-[#0FE073] outline-none"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full rounded-xl bg-[#7C24E0] py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#6B1FC5] hover:shadow-purple-300 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify & Complete"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setPendingVerification(false)}
                        className="w-full text-sm font-bold text-gray-500 hover:text-[#0FE073] transition-colors"
                    >
                        Back to Sign Up
                    </button>
                </form>
            )}

            {!pendingVerification && (
                <>
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#1A2620]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#080C0A] px-4 text-gray-500 font-medium tracking-widest">
                                Or sign up with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button disabled className="opacity-50 cursor-not-allowed flex h-11 items-center justify-center rounded-xl border border-[#1A2620] bg-[#121A16] transition-all hover:bg-[#1A2620] hover:border-[#23352C]">
                            <img src={FacebookIcon} alt="Facebook" className="h-6 w-6 object-contain" />
                        </button>
                        <button disabled className="opacity-50 cursor-not-allowed flex h-11 items-center justify-center rounded-xl border border-[#1A2620] bg-[#121A16] transition-all hover:bg-[#1A2620] hover:border-[#23352C]">
                            <img src={TiktokIcon} alt="TikTok" className="h-6 w-6 object-contain rounded" />
                        </button>
                        <button disabled className="opacity-50 cursor-not-allowed flex h-11 items-center justify-center rounded-xl border border-[#1A2620] bg-[#121A16] transition-all hover:bg-[#1A2620] hover:border-[#23352C]">
                            <img src={GoogleIcon} alt="Google" className="h-6 w-6 object-contain" />
                        </button>
                    </div>

                    <p className="mt-8 text-center text-xs font-medium text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/auth/login"
                            className="font-bold text-[#0FE073] hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </>
            )}
        </div>
    );
}
