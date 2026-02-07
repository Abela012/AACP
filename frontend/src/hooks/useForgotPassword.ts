import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useForgotPassword = () => {
    const { isLoaded, signIn, setActive } = useSignIn();
    const navigate = useNavigate();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [successfulCreation, setSuccessfulCreation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onRequestCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: emailAddress,
            });
            setSuccessfulCreation(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!isLoaded) return;
        setLoading(true);
        setError(null);

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                navigate("/dashboard");
            } else {
                console.error(result);
                setError("Password reset incomplete. Please try again.");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "An error occurred. Please check the code and try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
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
        setError,
        onRequestCode,
        onResetPassword,
    };
};
