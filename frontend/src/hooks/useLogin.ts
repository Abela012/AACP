import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { startTikTokOAuth } from "./useTikTokAuth";

type SecondFactorStrategy = "email_code" | "phone_code" | "totp";

export const useLogin = () => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const navigate = useNavigate();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'business_owner' | 'advertiser' | null>('business_owner');
    const [verificationCode, setVerificationCode] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [secondFactorStrategy, setSecondFactorStrategy] = useState<SecondFactorStrategy | null>(null);

    /** Second step after password: MFA or Clerk Client Trust email code — must call prepareSecondFactor before attempt (except TOTP). */
    const prepareExtraStep = async (attempt: any): Promise<boolean> => {
        if (!signIn) {
            setError("Sign in is not ready. Please try again.");
            return false;
        }
        const factors = attempt.supportedSecondFactors ?? [];
        const emailCodeFactor = factors.find((f: any) => f.strategy === 'email_code');
        const phoneCodeFactor = factors.find((f: any) => f.strategy === 'phone_code');
        const totpFactor = factors.some((f: any) => f.strategy === 'totp');

        try {
            if (emailCodeFactor?.emailAddressId) {
                await signIn.prepareSecondFactor({
                    strategy: 'email_code',
                    emailAddressId: emailCodeFactor.emailAddressId,
                });
                setSecondFactorStrategy('email_code');
                setInfoMessage(
                    'A verification code was sent to your email. Enter it below (check spam). This step is normal if MFA or Clerk Client Trust is enabled.'
                );
                return true;
            }
            if (phoneCodeFactor?.phoneNumberId) {
                await signIn.prepareSecondFactor({
                    strategy: 'phone_code',
                    phoneNumberId: phoneCodeFactor.phoneNumberId,
                });
                setSecondFactorStrategy('phone_code');
                setInfoMessage('A code was sent to your phone. Enter it below.');
                return true;
            }
            if (totpFactor) {
                setSecondFactorStrategy('totp');
                setInfoMessage('Open your authenticator app and enter the 6-digit code below.');
                return true;
            }
        } catch {
            setError('Could not start verification. Try again or contact support.');
            return false;
        }

        setError(
            `Extra sign-in step required (${factors.map((f: any) => f.strategy).filter(Boolean).join(', ') || 'unknown'}). Configure supported factors in Clerk or try the prebuilt <SignIn /> component.`
        );
        return false;
    };

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);
        setInfoMessage(null);
        setSecondFactorStrategy(null);
        setVerificationCode("");
        const normalizedEmail = emailAddress.trim().toLowerCase();
        try {
            const signInAttempt = await signIn.create({
                identifier: normalizedEmail,
                password,
            });

            if (signInAttempt.status === "complete") {
                await setActive({ session: signInAttempt.createdSessionId });
                navigate("/dashboard", { replace: true });
            } else {
                setStatus(signInAttempt.status);
                if (signInAttempt.status === "needs_first_factor") {
                    setError("Account verification required. Please check your email for a verification code or link.");
                } else if (
                    (signInAttempt.status as string) === "needs_second_factor" ||
                    (signInAttempt.status as string) === "needs_client_trust"
                ) {
                    const ok = await prepareExtraStep(signInAttempt);
                    if (!ok) setStatus(null);
                } else {
                    const statusStr = signInAttempt.status || 'incomplete';
                    setError(`Sign in ${statusStr.replace('_', ' ')}. Please complete all required steps in your Clerk dashboard.`);
                }
            }
        } catch (err: unknown) {
            const clerkErr = err as { errors?: { code?: string; message?: string }[] };
            const code = clerkErr.errors?.[0]?.code;
            const msg = clerkErr.errors?.[0]?.message || "An error occurred during sign in.";
            if (msg.includes("data breach")) {
                setError("Please use a stronger or different password for security.");
            } else if (code === "form_identifier_not_found" || /couldn'?t find your account/i.test(msg)) {
                setError(
                    "No user with this email exists in your Clerk project. Open Clerk Dashboard → Users and search the address, or create the admin again from Super Admin. If your app has both test and live keys, confirm frontend and backend use keys from the same environment (see project script: node scripts/check-clerk-env.mjs)."
                );
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const onVerifySecondFactor = async () => {
        if (!isLoaded) return;
        if (!secondFactorStrategy) {
            setError("Verification is still starting. Wait a moment and try again.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await signIn.attemptSecondFactor({
                strategy: secondFactorStrategy,
                code: verificationCode.trim(),
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                navigate("/dashboard", { replace: true });
            } else {
                setError(`Verification failed: ${result.status}`);
            }
        } catch (err: unknown) {
            const clerkErr = err as { errors?: { message?: string }[] };
            setError(clerkErr.errors?.[0]?.message || "Invalid verification code.");
        } finally {
            setLoading(false);
        }
    };

    const resetSignInFlow = () => {
        setStatus(null);
        setVerificationCode("");
        setSecondFactorStrategy(null);
        setInfoMessage(null);
        setError(null);
        if (signIn && typeof (signIn as any).reset === 'function') {
            (signIn as any).reset();
        }
    };

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_facebook") => {
        if (!isLoaded) return;
        setError(null);

        if (!role) {
            setError("Please select a role (Business or Advertiser) before continuing with social login.");
            return;
        }

        try {
            localStorage.setItem('pendingUserRole', role);
            await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard"
            });
        } catch (err: unknown) {
            const clerkErr = err as { errors?: { message?: string }[] };
            setError(clerkErr.errors?.[0]?.message || "An error occurred during social auth.");
        }
    };

    const handleTikTokAuth = () => {
        setError(null);
        if (!role) {
            setError("Please select a role (Business or Advertiser) before continuing with TikTok.");
            return;
        }
        startTikTokOAuth('signin', role);
    };

    return {
        emailAddress,
        setEmailAddress,
        password,
        setPassword,
        error,
        setError,
        infoMessage,
        loading,
        role,
        setRole,
        onSignInPress,
        handleSocialAuth,
        handleTikTokAuth,
        status,
        verificationCode,
        setVerificationCode,
        onVerifySecondFactor,
        resetSignInFlow,
        secondFactorStrategy,
        needsVerificationStep:
            status === "needs_second_factor" || status === "needs_client_trust",
    };
};
