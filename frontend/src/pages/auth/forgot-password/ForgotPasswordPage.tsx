import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useForgotPassword } from '../../../hooks/useForgotPassword';

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
            <h2 className="aacp-font-display mb-3 text-4xl text-neutral-dark dark:text-neutral-light">
              Reset password
            </h2>
            <p className="text-base text-neutral-medium dark:text-neutral-border/55">
              Enter your email to receive a 6-digit verification code.
            </p>
          </>
        ) : (
          <>
            <h2 className="aacp-font-display mb-3 text-4xl text-neutral-dark dark:text-neutral-light">
              Set new password
            </h2>
            <p className="text-base text-neutral-medium dark:text-neutral-border/55">
              We&apos;ve sent a code to {emailAddress}
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mb-8 border border-red-200/80 bg-red-50/80 p-3 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!successfulCreation ? (
        <form onSubmit={onRequestCode} className="space-y-8">
          <div>
            <label className="aacp-label">Email address</label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="name@company.com"
              className="aacp-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !emailAddress}
            className="aacp-btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send reset code'}
          </button>

          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-neutral-medium transition-colors hover:text-primary-blue"
          >
            <ArrowLeft size={16} /> Back to log in
          </Link>
        </form>
      ) : (
        <form onSubmit={onResetPassword} className="space-y-8">
          <div className="border border-primary-blue/25 bg-neutral-border/20 p-6 text-center">
            <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-primary-blue" strokeWidth={1.25} />
            <label className="aacp-label mb-4 block">Verification code</label>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              className="aacp-input text-center text-3xl font-semibold tracking-[0.5em]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="aacp-label">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="aacp-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-medium transition-colors hover:text-primary-blue"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6 || !password}
            className="aacp-btn-primary w-full"
          >
            {loading ? 'Resetting password...' : 'Reset password'}
          </button>

          <button
            type="button"
            onClick={() => setSuccessfulCreation(false)}
            className="w-full text-sm font-semibold text-neutral-medium transition-colors hover:text-primary-blue"
          >
            Resend code
          </button>
        </form>
      )}

      <p className="mt-10 text-center text-sm font-medium text-neutral-medium">
        Wait, I remember my password!{' '}
        <Link to="/auth/login" className="font-semibold text-primary-blue hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
