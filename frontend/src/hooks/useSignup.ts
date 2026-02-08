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
    const [role, setRole] = useState<'business_owner' | 'advertiser' | null>(null);

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        if (!role) {
            setError("Please select a role before continuing.");
            return;
        }
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
            // Store role in localStorage so useUserSync can send it to backend
            localStorage.setItem('pendingUserRole', role);
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (err: unknown) {
            const clerkErr = err as { errors?: { message?: string }[] };
            const msg = clerkErr.errors?.[0]?.message || "An error occurred during sign up.";
            // Filter out heavy breach messages
            if (msg.includes("data breach")) {
                setError("Please use a stronger or different password for your safety.");
            } else {
                setError(msg);
            }
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
                navigate("/dashboard", { replace: true });
            } else {
                setError("Verification incomplete. Please try again.");
            }
        } catch (err: unknown) {
            const clerkErr = err as { errors?: { message?: string }[] };
            setError(clerkErr.errors?.[0]?.message || "An error occurred during verification.");
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
        role,
        setRole,
        onSignUpPress,
        onVerifyPress,
    };
};
