import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, Megaphone, ShieldCheck } from 'lucide-react';
import { useSignup } from '../../../hooks/useSignup';

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
        <h2 className="aacp-font-display mb-3 text-4xl text-neutral-dark dark:text-neutral-light">
          {pendingVerification ? 'Verify your email' : 'Create your account'}
        </h2>
        <p className="text-base text-neutral-medium dark:text-neutral-border/55">
          {pendingVerification
            ? `We've sent a 6-digit code to ${emailAddress}`
            : 'Join the verified marketplace for creative intelligence.'}
        </p>
      </div>

      {error && (
        <div className="mb-8 border border-red-200/80 bg-red-50/80 p-3 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!pendingVerification ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="aacp-label">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('business_owner')}
                className={`aacp-role-tile ${role === 'business_owner' ? 'aacp-role-tile--active' : 'text-neutral-medium'}`}
              >
                <Briefcase size={22} strokeWidth={1.25} />
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em]">Business</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('advertiser')}
                className={`aacp-role-tile ${role === 'advertiser' ? 'aacp-role-tile--active' : 'text-neutral-medium'}`}
              >
                <Megaphone size={22} strokeWidth={1.25} />
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em]">Advertiser</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-1/2">
                <label className="aacp-label">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="aacp-input"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="aacp-label">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="aacp-input"
                  required
                />
              </div>
            </div>

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

            <div>
              <label className="aacp-label">Password</label>
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
          </div>

          <div className="group flex cursor-pointer items-start gap-2 pt-2">
            <input type="checkbox" id="terms" className="mt-1 h-4 w-4 accent-primary-blue" required />
            <label
              htmlFor="terms"
              className="text-xs font-medium leading-relaxed text-neutral-medium transition-colors group-hover:text-neutral-dark"
            >
              I agree to the{' '}
              <Link to="/terms-of-service" className="font-semibold text-primary-blue hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="font-semibold text-primary-blue hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div id="clerk-captcha" />

          <button type="submit" disabled={loading} className="aacp-btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCompletion} className="space-y-8">
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
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="aacp-btn-primary w-full"
          >
            {loading ? 'Verifying...' : 'Verify & complete'}
          </button>
          <button
            type="button"
            onClick={() => setPendingVerification(false)}
            className="w-full text-sm font-semibold text-neutral-medium transition-colors hover:text-primary-blue"
          >
            Back to sign up
          </button>
        </form>
      )}

      {!pendingVerification && (
        <p className="mt-10 text-center text-sm font-medium text-neutral-medium">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary-blue hover:underline">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
