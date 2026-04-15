import { useClerk, useUser } from "@clerk/clerk-react";

type RoleDashboardPageProps = {
  roleLabel: string;
};

export default function RoleDashboardPage({ roleLabel }: RoleDashboardPageProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{roleLabel} Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, {user?.firstName || user?.username || "User"}.
            </p>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/auth/login" })}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
          You are signed in as <strong>{roleLabel}</strong>. This route is selected automatically from your account role.
        </div>
      </div>
    </div>
  );
}
