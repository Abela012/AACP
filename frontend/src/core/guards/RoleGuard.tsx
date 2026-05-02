import { Navigate } from "react-router-dom";
import { useUser } from "../../shared/context/UserContext";
import type { ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: Array<'business' | 'business_owner' | 'advertiser' | 'admin' | 'super_admin'>;
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { userRole } = useUser();
    const { isLoaded } = useAuth();

    if (!isLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
                <div className="w-12 h-12 border-4 border-[#14a800] border-t-transparent rounded-full animate-spin mb-4"></div>
            </div>
        );
    }

    // Wait until userRole is resolved to a string value
    if (userRole === undefined) {
        return null;
    }

    // If user has no role but is trying to access a restricted page, redirect to dashboard root (which handles role redirection)
    if (userRole === null) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check if the user's role is included in the allowed roles
    const hasAccess = allowedRoles.includes(userRole);

    if (!hasAccess) {
        // Redirect unauthorized users to their correct dashboard root
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
