import { useUser, useReverification, useSignIn } from '@clerk/clerk-react';
import { useState } from 'react';

type PasswordParams = {
  currentPassword: string;
  newPassword: string;
};

const needsExtraVerification = (message: string) => {
  const lower = message.toLowerCase();
  return (
    lower.includes('additional verification') ||
    lower.includes('reverification') ||
    lower.includes('verification required') ||
    lower.includes('session verification')
  );
};

export const useChangePassword = () => {
  const { user, isLoaded } = useUser();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [mode, setMode] = useState<'password' | 'email'>('password');
  const [emailStep, setEmailStep] = useState<'idle' | 'code_sent'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  const updatePasswordWithReverification = useReverification((params: PasswordParams) => {
    if (!user) {
      return Promise.reject(new Error('You must be signed in to update your password.'));
    }
    return user.updatePassword({
      currentPassword: params.currentPassword.trim(),
      newPassword: params.newPassword.trim(),
    });
  });

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setResetCode('');
    setEmailStep('idle');
  };

  const parseClerkError = (err: unknown): string => {
    const clerkErr = err as { errors?: { message?: string; longMessage?: string }[] };
    return (
      clerkErr.errors?.[0]?.longMessage ||
      clerkErr.errors?.[0]?.message ||
      'Could not update password. Please try again.'
    );
  };

  const validateNewPassword = () => {
    if (!newPassword.trim()) {
      setError('Enter a new password.');
      return false;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return false;
    }
    return true;
  };

  const changePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isLoaded || !user) {
      setError('Your session is still loading. Please try again.');
      return;
    }

    if (!currentPassword.trim()) {
      setError('Enter your current password.');
      return;
    }

    if (!validateNewPassword()) return;

    setLoading(true);
    try {
      await updatePasswordWithReverification({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      resetForm();
      setSuccess('Password updated successfully.');
    } catch (err: unknown) {
      const msg = parseClerkError(err);
      if (msg.toLowerCase().includes('data breach')) {
        setError('Choose a stronger password that has not appeared in a known breach.');
      } else if (needsExtraVerification(msg)) {
        setError(
          'Clerk requires extra verification for this action. Switch to “Reset via email” and complete the code flow, or use the Verify button when prompted.'
        );
        setMode('email');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendEmailResetCode = async () => {
    setError(null);
    setSuccess(null);

    if (!signInLoaded || !signIn) {
      setError('Sign-in is not ready yet. Please try again.');
      return;
    }
    if (!email) {
      setError('No email found on your account.');
      return;
    }

    setLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setEmailStep('code_sent');
      setSuccess(`A verification code was sent to ${email}.`);
    } catch (err: unknown) {
      setError(parseClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordWithEmailCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);

    if (!signInLoaded || !signIn) {
      setError('Sign-in is not ready yet. Please try again.');
      return;
    }
    if (!resetCode.trim()) {
      setError('Enter the verification code from your email.');
      return;
    }
    if (!validateNewPassword()) return;

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode.trim(),
        password: newPassword.trim(),
      });

      if (result.status === 'complete') {
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        resetForm();
        setSuccess('Password updated successfully. You can continue using the admin panel.');
        setMode('password');
      } else {
        setError('Password reset incomplete. Check the code and try again.');
      }
    } catch (err: unknown) {
      const msg = parseClerkError(err);
      if (msg.toLowerCase().includes('data breach')) {
        setError('Choose a stronger password that has not appeared in a known breach.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
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
    setError,
    setSuccess,
    changePassword,
    sendEmailResetCode,
    resetPasswordWithEmailCode,
    canChangePassword: isLoaded && !!user,
  };
};
