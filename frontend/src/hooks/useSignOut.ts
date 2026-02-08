import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export const useSignOut = () => {
    const { signOut } = useClerk();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        if (window.confirm("Logout: Are you sure you want to logout?")) {
            try {
                await signOut();
                navigate("/", { replace: true });
            } catch (err) {
                console.error("Sign out fail:", err);
            }
        }
    };
    return { handleSignOut };
};
