import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useSignup = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const navigate = useNavigate();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);
        try {
            const nameParts = fullName.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

            await signUp.create({
                emailAddress: emailAddress.trim(),
                password,
                firstName,
                lastName,
            });
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "An error occurred during sign up.");
        } finally {
            setLoading(false);
        }
    };

    const onVerifyPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError(null);
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
            if (signUpAttempt.status === "complete") {
                await setActive({ session: signUpAttempt.createdSessionId });
                navigate("/");
            } else {
                setError("Verification incomplete. Please try again.");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "An error occurred during verification.");
        } finally {
            setLoading(false);
        }
    };

    return {
        code,
        setCode,
        emailAddress,
        setEmailAddress,
        password,
        setPassword,
        fullName,
        setFullName,
        pendingVerification,
        setPendingVerification,
        loading,
        error,
        setError,
        onSignUpPress,
        onVerifyPress,
    };
};
