import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useLogin = () => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const navigate = useNavigate();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'business_owner' | 'advertiser' | 'admin' | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === "complete") {
                await setActive({ session: signInAttempt.createdSessionId });
                navigate("/dashboard", { replace: true });
            } else {
                setStatus(signInAttempt.status);
                if (signInAttempt.status === "needs_first_factor") {
                    setError("Account verification required. Please check your email for a verification code or link.");
                } else if (signInAttempt.status === "needs_second_factor") {
                    setError("Two-factor authentication required. Please enter the code sent to your email or authenticator app.");
                } else {
                    const statusStr = signInAttempt.status || 'incomplete';
                    setError(`Sign in ${statusStr.replace('_', ' ')}. Please complete all required steps in your Clerk dashboard.`);
                }
            }
        } catch (err: unknown) {
            const clerkErr = err as { errors?: { message?: string }[] };
            const msg = clerkErr.errors?.[0]?.message || "An error occurred during sign in.";
            if (msg.includes("data breach")) {
                setError("Please use a stronger or different password for security.");
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const onVerifySecondFactor = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);
        try {
            const result = await signIn.attemptSecondFactor({
                strategy: "email_code",
                code: verificationCode,
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

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_facebook" | "oauth_tiktok") => {
        if (!isLoaded) return;
        setError(null);
        try {
            // Store role in localStorage if selected, so useUserSync can send it to backend
            if (role) {
                localStorage.setItem('pendingUserRole', role);
            }
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

    return {
        emailAddress,
        setEmailAddress,
        password,
        setPassword,
        error,
        setError,
        loading,
        role,
        setRole,
        onSignInPress,
        handleSocialAuth,
        status,
        verificationCode,
        setVerificationCode,
        onVerifySecondFactor,
    };
};
