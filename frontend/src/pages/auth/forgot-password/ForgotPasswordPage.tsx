import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
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
            <div className="mb-10 text-left">
                {!successfulCreation ? (
                    <>
                        <h2 className="text-4xl font-bold text-[#001e00] mb-3">Reset password</h2>
                        <p className="text-base text-[#5e6d55]">
                            Enter your email to receive a 6-digit verification code.
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-4xl font-bold text-[#001e00] mb-3">Set new password</h2>
                        <p className="text-base text-[#5e6d55]">
                            We've sent a code to {emailAddress}
                        </p>
                    </>
                )}
            </div>

            {error && (
                <div className="mb-8 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                    {error}
                </div>
            )}

            {!successfulCreation ? (
                <form onSubmit={onRequestCode} className="space-y-8">
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

                    <button
                        type="submit"
                        disabled={loading || !emailAddress}
                        className="w-full rounded-full bg-[#14a800] py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-[#108a00] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Code"}
                    </button>

                    <Link
                        to="/auth/login"
                        className="flex items-center justify-center gap-2 text-sm font-bold text-[#5e6d55] hover:text-[#14a800] transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Log In
                    </Link>
                </form>
            ) : (
                <form onSubmit={onResetPassword} className="space-y-8">
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

                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-[#001e00]">
                            New Password
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

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6 || !password}
                        className="w-full rounded-full bg-[#14a800] py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-[#108a00] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Resetting Password..." : "Reset Password"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setSuccessfulCreation(false)}
                        className="w-full text-sm font-bold text-[#5e6d55] hover:text-[#14a800] transition-colors"
                    >
                        Resend Code
                    </button>
                </form>
            )}

            <p className="mt-10 text-center text-sm font-medium text-[#5e6d55]">
                Wait, I remember my password!{" "}
                <Link
                    to="/auth/login"
                    className="font-bold text-[#14a800] hover:underline"
                >
                    Log in
                </Link>
            </p>
        </div>
    );
}
