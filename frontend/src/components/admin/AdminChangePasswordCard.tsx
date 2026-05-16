import { Key, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useChangePassword } from '@/src/hooks/useChangePassword';

export default function AdminChangePasswordCard() {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    resetCode,
    setResetCode,
    mode,
    setMode,
    emailStep,
    email,
    loading,
    error,
    success,
    changePassword,
    sendEmailResetCode,
    resetPasswordWithEmailCode,
    canChangePassword,
  } = useChangePassword();

  const inputClass =
    'w-full rounded-2xl border border-[#EFEFEF] dark:border-white/10 bg-[#F8F8FD] dark:bg-black/30 px-4 py-3 text-sm text-[#1A1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14a800]/30 disabled:opacity-50';

  return (
    <section className="bg-white dark:bg-[#111111] rounded-[2rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-[#EFEFEF] dark:border-white/5 bg-linear-to-r from-[#14a800]/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#14a800]/10 flex items-center justify-center text-[#14a800]">
            <Key size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#1A1D1F] dark:text-white">Account security</h2>
            <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">
              Update your admin password. Use email verification if Clerk asks for extra verification.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'password'
                ? 'bg-[#14a800] text-white shadow-md shadow-green-100 dark:shadow-none'
                : 'bg-[#F8F8FD] dark:bg-white/5 text-[#6F767E]'
            }`}
          >
            Current password
          </button>
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'email'
                ? 'bg-[#14a800] text-white shadow-md shadow-green-100 dark:shadow-none'
                : 'bg-[#F8F8FD] dark:bg-white/5 text-[#6F767E]'
            }`}
          >
            <Mail size={14} /> Reset via email
          </button>
        </div>

        {error && (
          <p className="mb-4 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3">
            {success}
          </p>
        )}

        {mode === 'password' ? (
          <form onSubmit={changePassword} className="space-y-4 max-w-md">
            <p className="text-xs text-[#6F767E] dark:text-gray-400 flex items-start gap-2">
              <ShieldCheck size={14} className="shrink-0 mt-0.5 text-[#14a800]" />
              If you see “additional verification required”, switch to <strong>Reset via email</strong> above.
            </p>
            <div>
              <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">
                Current password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={!canChangePassword || loading}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">
                New password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!canChangePassword || loading}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">
                Confirm new password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!canChangePassword || loading}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={!canChangePassword || loading}
              className="px-6 py-3 bg-[#14a800] text-white rounded-2xl text-xs font-bold hover:bg-[#108a00] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Update password
            </button>
          </form>
        ) : (
          <div className="space-y-4 max-w-md">
            <p className="text-xs text-[#6F767E] dark:text-gray-400">
              We will send a code to{' '}
              <span className="font-bold text-[#1A1D1F] dark:text-white">{email || 'your account email'}</span>. This
              works even when Clerk requires reverification.
            </p>
            {emailStep === 'idle' ? (
              <button
                type="button"
                onClick={sendEmailResetCode}
                disabled={loading || !email}
                className="px-6 py-3 bg-[#14a800] text-white rounded-2xl text-xs font-bold hover:bg-[#108a00] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Send verification code
              </button>
            ) : (
              <form onSubmit={resetPasswordWithEmailCode} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">
                    Verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="6-digit code"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">
                    New password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest block mb-2">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#14a800] text-white rounded-2xl text-xs font-bold hover:bg-[#108a00] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    Set new password
                  </button>
                  <button
                    type="button"
                    onClick={sendEmailResetCode}
                    disabled={loading}
                    className="px-6 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold text-[#6F767E] hover:bg-gray-50 transition-all"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

