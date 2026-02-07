import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useForgotPassword } from "../../../hooks/useForgotPassword";

export default function ForgotPasswordForm() {
    const {
        emailAddress,
        setEmailAddress,
        password,
        setPassword,
        code,
        setCode,
        successfulCreation,
        setSuccessfulCreation,
        loading,
        error,
        onRequestCode,
        onResetPassword,
    } = useForgotPassword();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col">
            <div className="mb-8 text-left">
                {!successfulCreation ? (
                    <>
                        <h2 className="text-3xl font-serif font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-sm text-gray-400">
                            Enter your email to receive a 6-digit verification code
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-serif font-bold text-white mb-2">Set New Password</h2>
                        <p className="text-sm text-gray-400">
                            We've sent a code to {emailAddress}
                        </p>
                    </>
                )}
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                    {error}
                </div>
            )}

            {!successfulCreation ? (
                <form onSubmit={onRequestCode} className="space-y-5">
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

                    <button
                        type="submit"
                        disabled={loading || !emailAddress}
                        className="w-full rounded-xl bg-[#0FE073] py-3.5 text-sm font-bold text-black shadow-lg shadow-[#0FE073]/20 transition-all hover:bg-[#0BC463] hover:shadow-[#0FE073]/40 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Code"}
                    </button>

                    <Link
                        to="/auth/login"
                        className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0FE073] transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </form>
            ) : (
                <form onSubmit={onResetPassword} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            className="w-full rounded-xl border border-[#1A2620] bg-[#121A16] px-4 py-4 text-center text-xl font-bold tracking-[0.5em] text-white transition-all focus:border-[#0FE073] focus:ring-1 focus:ring-[#0FE073] outline-none"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            New Password
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

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6 || !password}
                        className="w-full rounded-xl bg-[#7C24E0] py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#6B1FC5] hover:shadow-purple-300 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Resetting Password..." : "Reset Password"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setSuccessfulCreation(false)}
                        className="w-full text-sm font-bold text-gray-500 hover:text-[#0FE073] transition-colors"
                    >
                        Resend Code
                    </button>
                </form>
            )}

            <p className="mt-8 text-center text-xs font-medium text-gray-500">
                Wait, I remember my password!{" "}
                <Link
                    to="/auth/login"
                    className="font-bold text-[#0FE073] hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
