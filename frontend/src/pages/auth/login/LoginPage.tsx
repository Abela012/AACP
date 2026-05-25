import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, Megaphone } from 'lucide-react';
import { useLogin } from '../../../hooks/useLogin';
import FacebookIcon from '../../../assets/Facebook.png';
import GoogleIcon from '../../../assets/google.webp';

export default function LoginForm() {
  const {
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    error,
    infoMessage,
    loading,
    role,
    setRole,
    onSignInPress,
    handleSocialAuth,
    verificationCode,
    setVerificationCode,
    onVerifySecondFactor,
    resetSignInFlow,
    needsVerificationStep,
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (needsVerificationStep) {
      await onVerifySecondFactor();
    } else {
      await onSignInPress();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-10 text-left">
        <h2 className="aacp-font-display mb-3 text-4xl text-neutral-dark dark:text-neutral-light">
          Welcome back
        </h2>
        <p className="text-base text-neutral-medium dark:text-neutral-border/55">
          Sign in with email or SSO (Google, Facebook). TikTok auth is available after registration
          for advertisers linking social profiles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {infoMessage && (
          <div className="border border-primary-blue/30 bg-neutral-border/25 p-3 text-sm font-medium leading-relaxed text-neutral-dark">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="border border-red-200/80 bg-red-50/80 p-3 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {needsVerificationStep ? (
          <div>
            <label className="aacp-label">Verification code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="aacp-input"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <p className="mt-2 text-xs font-medium leading-relaxed text-neutral-medium">
              Use the email code or your authenticator app, then tap Verify.
            </p>
            <button
              type="button"
              onClick={() => resetSignInFlow()}
              className="mt-4 text-xs font-semibold text-primary-blue hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="aacp-label">Email address</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="you@example.com"
                className="aacp-input"
                required
              />
            </div>

            <div>
              <label className="aacp-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary-blue"
                />
                <span className="text-sm font-medium text-neutral-medium transition-colors group-hover:text-neutral-dark">
                  Keep me signed in
                </span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm font-semibold text-primary-blue hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </>
        )}

        <button type="submit" disabled={loading} className="aacp-btn-primary w-full">
          {loading ? 'Processing...' : needsVerificationStep ? 'Verify code' : 'Log in'}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        <p className="text-center font-mono text-[0.6rem] uppercase tracking-[0.22em] text-neutral-medium">
          Role for social login
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('business_owner')}
            className={`aacp-role-tile ${role === 'business_owner' ? 'aacp-role-tile--active' : 'text-neutral-medium'}`}
          >
            <Briefcase size={20} strokeWidth={1.25} />
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em]">Business</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('advertiser')}
            className={`aacp-role-tile ${role === 'advertiser' ? 'aacp-role-tile--active' : 'text-neutral-medium'}`}
          >
            <Megaphone size={20} strokeWidth={1.25} />
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em]">Advertiser</span>
          </button>
        </div>
      </div>

      <div className="aacp-divider text-center">
        <span className="bg-neutral-light dark:bg-[#12100d]">Or continue with</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialAuth('oauth_facebook')}
          disabled={loading}
          className="flex h-12 items-center justify-center border border-primary-blue/30 bg-neutral-light/50 transition-colors hover:bg-neutral-border/35 disabled:opacity-50"
        >
          <img src={FacebookIcon} alt="Facebook" className="h-6 w-6 object-contain" />
        </button>
        <button
          type="button"
          onClick={() => handleSocialAuth('oauth_google')}
          disabled={loading}
          className="flex h-12 items-center justify-center border border-primary-blue/30 bg-neutral-light/50 transition-colors hover:bg-neutral-border/35 disabled:opacity-50"
        >
          <img src={GoogleIcon} alt="Google" className="h-6 w-6 object-contain" />
        </button>
      </div>

      <p className="mt-10 text-center text-sm font-medium text-neutral-medium">
        New to AACP?{' '}
        <Link to="/auth/register" className="font-semibold text-primary-blue hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
