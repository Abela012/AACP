import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
            <div className="mb-8 text-left">
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome back to AACP</h2>
                <p className="text-sm text-gray-400">
                    Enter your credentials to access your dashboard
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                        {error}
                    </div>
                )}
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="you@example.com"
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
                            placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#1A2620] bg-[#121A16] text-[#0FE073] focus:ring-[#0FE073] accent-[#0FE073]"
                        />
                        <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
                            Keep me signed in
                        </span>
                    </label>
                    <Link
                        to="/auth/forgot-password"
                        className="text-xs font-bold text-[#0FE073] hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#0FE073] py-3.5 text-sm font-bold text-black shadow-lg shadow-[#0FE073]/20 transition-all hover:bg-[#0BC463] hover:shadow-[#0FE073]/40 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? "Signing In..." : <>SIGN IN <span className="font-sans">→</span></>}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1A2620]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#080C0A] px-4 text-gray-500 font-medium tracking-widest">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => handleSocialAuth("oauth_facebook")}
                    disabled={loading}
                    className="flex h-11 items-center justify-center rounded-xl border border-[#1A2620] bg-[#121A16] transition-all hover:bg-[#1A2620] hover:border-[#23352C] active:scale-95 disabled:opacity-50"
                >
                    <img src={FacebookIcon} alt="Facebook" className="h-6 w-6 object-contain" />
                </button>
                <button
                    type="button"
                    onClick={() => handleSocialAuth("oauth_tiktok")}
                    disabled={loading}
                    className="flex h-11 items-center justify-center rounded-xl border border-[#1A2620] bg-[#121A16] transition-all hover:bg-[#1A2620] hover:border-[#23352C] active:scale-95 disabled:opacity-50"
                >
                    <img src={TiktokIcon} alt="TikTok" className="h-6 w-6 object-contain rounded" />
                </button>
                <button
                    type="button"
                    onClick={() => handleSocialAuth("oauth_google")}
                    disabled={loading}
                    className="flex h-11 items-center justify-center rounded-xl border border-[#1A2620] bg-[#121A16] transition-all hover:bg-[#1A2620] hover:border-[#23352C] active:scale-95 disabled:opacity-50"
                >
                    <img src={GoogleIcon} alt="Google" className="h-6 w-6 object-contain" />
                </button>
            </div>

            <p className="mt-8 text-center text-xs font-medium text-gray-500">
                New to AACP?{" "}
                <Link
                    to="/auth/register"
                    className="font-bold text-[#0FE073] hover:underline"
                >
                    Create account
                </Link>
            </p>
        </div>
    );
}
