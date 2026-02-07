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
                navigate("/dashboard");
            } else {
                setError("Sign in incomplete. Please check your information.");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "An error occurred during sign in.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_facebook" | "oauth_tiktok") => {
        if (!isLoaded) return;
        setError(null);
        try {
            await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: "/auth/login",
                redirectUrlComplete: "/dashboard"
            });
        } catch (error: any) {
            setError(error.errors?.[0]?.message || "An error occurred during social auth.");
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
        onSignInPress,
        handleSocialAuth,
    };
};
