import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getFriendlyAuthError } from "@/src/shared/utils/authErrors";

export const useSignup = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const navigate = useNavigate();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
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
            await signUp.create({
                emailAddress: emailAddress.trim(),
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });
            // Store role in localStorage so useUserSync can send it to backend
            localStorage.setItem('pendingUserRole', role);
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (err: unknown) {
            setError(getFriendlyAuthError(err, "Unable to create your account. Please try again."));
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

                // Capture before the try block so it remains in scope after.
                const pendingRole = localStorage.getItem('pendingUserRole') || 'advertiser';

                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'https://aacp.onrender.com/api/v1';

                    await fetch(`${API_URL}/users/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ role: pendingRole }),
                    });
                    localStorage.removeItem('pendingUserRole');
                } catch (syncErr) {
                    // Non-fatal: useUserSync on the dashboard will retry
                    console.warn('[useSignup] Initial sync failed, will retry on dashboard:', syncErr);
                }

                // 3. Navigate directly to the role dashboard — role is now in localStorage.
                // This bypasses RoleDashboardRedirectPage for a seamless post-registration UX.
                let destination = '/dashboard';
                if (pendingRole === 'business_owner') destination = '/dashboard/business-owner';
                else if (pendingRole === 'advertiser') destination = '/dashboard/advertiser';
                navigate(destination, { replace: true });
            } else {
                setError("Verification incomplete. Please try again.");
            }
        } catch (err: unknown) {
            setError(getFriendlyAuthError(err, "Verification failed. Please check your code and try again."));
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
        firstName,
        setFirstName,
        lastName,
        setLastName,
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
