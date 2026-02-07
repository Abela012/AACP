import { useClerk } from "@clerk/clerk-react";

export const useSignOut = () => {
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        if (window.confirm("Logout: Are you sure you want to logout?")) {
            try {
                await signOut();
                window.location.href = "/";
            } catch (err) {
                console.error("Sign out fail:", err);
            }
        }
    };
    return { handleSignOut };
};
