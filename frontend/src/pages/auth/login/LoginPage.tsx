import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Briefcase, Megaphone } from "lucide-react";
import { useLogin } from "../../../hooks/useLogin";
import FacebookIcon from "../../../assets/Facebook.png";
import GoogleIcon from "../../../assets/google.webp";
import TiktokIcon from "../../../assets/tiktok.jpeg";

export default function LoginForm() {
    const {
        emailAddress,
        setEmailAddress,
        password,
        setPassword,
        error,
        loading,
        role,
        setRole,
        onSignInPress,
        handleSocialAuth,
    } = useLogin();

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSignInPress();
    };

    return (
        <div className="flex flex-col">
            <div className="mb-10 text-left">
                <h2 className="text-4xl font-bold text-[#1e1b4b] mb-3">Welcome back</h2>
                <p className="text-base text-[#6366f1]">
                    Enter your credentials to access your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                        {error}
                    </div>
                )}
                <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#1e1b4b]">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="you@example.com"
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
                            placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 bg-white text-[#7c3aed] focus:ring-[#7c3aed] accent-[#7c3aed]"
                        />
                        <span className="text-sm font-medium text-[#6366f1] group-hover:text-[#1e1b4b] transition-colors">
                            Keep me signed in
                        </span>
                    </label>
                    <Link
                        to="/auth/forgot-password"
                        className="text-sm font-bold text-[#7c3aed] hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#7c3aed] py-3.5 text-base font-bold text-white shadow-sm shadow-[#7c3aed]/20 transition-all hover:bg-[#6d28d9] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? "Signing In..." : "Log In"}
                </button>
            </form>

            <div className="space-y-4 mt-8">
                <label className="text-xs font-bold text-[#6366f1] uppercase tracking-wider block text-center">
                    Select your role for social login
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setRole('business_owner')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'business_owner'
                            ? 'border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]'
                            : 'border-gray-100 bg-white text-[#6366f1] hover:border-[#7c3aed]/30 hover:text-[#1e1b4b]'
                            }`}
                    >
                        <Briefcase size={20} />
                        <span className="text-xs font-bold">Business Owner</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('advertiser')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${role === 'advertiser'
                            ? 'border-[#7c3aed] bg-[#7c3aed]/5 text-[#7c3aed]'
                            : 'border-gray-100 bg-white text-[#6366f1] hover:border-[#7c3aed]/30 hover:text-[#1e1b4b]'
                            }`}
                    >
                        <Megaphone size={20} />
                        <span className="text-xs font-bold">Advertiser</span>
                    </button>
                </div>
            </div>

            <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-[#6366f1] font-bold tracking-widest">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => handleSocialAuth("oauth_facebook")}
                    disabled={loading}
                    className="flex h-12 items-center justify-center rounded-xl border border-gray-100 bg-white transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 shadow-sm"
                >
                    <img src={FacebookIcon} alt="Facebook" className="h-6 w-6 object-contain" />
                </button>
                <button
                    type="button"
                    onClick={() => handleSocialAuth("oauth_tiktok")}
                    disabled={loading}
                    className="flex h-12 items-center justify-center rounded-xl border border-gray-100 bg-white transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 shadow-sm"
                >
                    <img src={TiktokIcon} alt="TikTok" className="h-6 w-6 object-contain rounded" />
                </button>
                <button
                    type="button"
                    onClick={() => handleSocialAuth("oauth_google")}
                    disabled={loading}
                    className="flex h-12 items-center justify-center rounded-xl border border-gray-100 bg-white transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 shadow-sm"
                >
                    <img src={GoogleIcon} alt="Google" className="h-6 w-6 object-contain" />
                </button>
            </div>

            <p className="mt-10 text-center text-sm font-medium text-[#6366f1]">
                New to AACP?{" "}
                <Link
                    to="/auth/register"
                    className="font-bold text-[#7c3aed] hover:underline"
                >
                    Create account
                </Link>
            </p>
        </div>
    );
}
