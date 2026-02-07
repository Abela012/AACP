import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { LayoutDashboard, Settings, User, LogOut } from 'lucide-react';
import { useUserSync } from '../../hooks/useUserSync';

export default function DashboardPage() {
    const { user } = useUser();
    const { signOut } = useClerk();
    
    // Automatically syncs the user details to MongoDB via the backend
    useUserSync();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">AACP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden sm:inline-block">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                        <button 
                            onClick={() => signOut({ redirectUrl: '/auth/login' })}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                        <UserButton afterSignOutUrl="/auth/login" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.firstName || 'User'}!
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Here's an overview of your account today.
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">My Campaigns</h3>
                        <p className="text-gray-500 text-sm">View your active campaigns, analytics, and recent activity metrics.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Account Details</h3>
                        <p className="text-gray-500 text-sm">Manage your profile, billing details, and update your personal information.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <Settings className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Preferences</h3>
                        <p className="text-gray-500 text-sm">Configure email notifications, layout preferences and team settings.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
