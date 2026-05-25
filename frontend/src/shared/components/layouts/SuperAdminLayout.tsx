import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useClerk, useUser as useClerkUser } from '@clerk/clerk-react';
import {
  Shield,
  Users,
  ClipboardList,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  Activity,
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';
import DashboardSidebar from '@/src/shared/components/navigation/DashboardSidebar';
import { useSidebarState } from '@/src/shared/components/navigation/useSidebarState';

interface Props {
  children: ReactNode;
}

const navigation = [
  { name: 'Admin Management', icon: Users, path: '/super-admin/admin-management' },
  { name: 'System Logs', icon: ClipboardList, path: '/super-admin/audit-trail' },
  { name: 'Platform Configuration', icon: Settings, path: '/super-admin/platform' },
  { name: 'Security Audit', icon: Shield, path: '/super-admin/security' },
];

export default function SuperAdminLayout({ children }: Props) {
  const { signOut } = useClerk();
  const { user: clerkUser } = useClerkUser();
  const { logout: localLogout } = useUser();
  const { sidebarExpanded, mobileOpen, toggleSidebar, closeMobile, mainOffsetClass } =
    useSidebarState({ wide: true });

  return (
    <div className="min-h-screen bg-[#F6F6FB] dark:bg-[#050505] text-[#1A1D1F] dark:text-white font-sans flex transition-colors duration-300">
      <DashboardSidebar
        variant="admin"
        wide
        brandHref="/dashboard/super-admin"
        brandTitle="AACP Velocity"
        brandSubtitle="Super Admin Panel"
        expanded={sidebarExpanded}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        sections={[{ items: navigation }]}
        midSlot={
          <div className="pt-6 border-t border-[#EFEFEF] dark:border-white/5">
            <Link
              to="/super-admin/audit-trail"
              title="Activity"
              className="w-full h-12 bg-primary-blue hover:bg-primary-blue text-white rounded-2xl text-sm font-bold shadow-lg shadow-neutral-border/25 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Activity size={18} className="shrink-0" />
              <span>Activity</span>
            </Link>
          </div>
        }
        footer={
          <button
            type="button"
            title="Logout"
            onClick={() => {
              localLogout();
              signOut();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-[#6F767E] hover:text-red-500 transition-all"
          >
            <LogOut size={20} className="shrink-0" />
            <span>Logout</span>
          </button>
        }
      />

      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300', mainOffsetClass)}>
        <header className="h-20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-lg px-8 flex items-center justify-between sticky top-0 z-40 border-b border-[#EFEFEF] dark:border-white/5">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-primary-blue transition-colors"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
              <input
                type="text"
                placeholder="Search admins..."
                className="bg-[#F4F4F4] dark:bg-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 w-[420px] transition-all border-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/super-admin/notifications"
              className="relative w-10 h-10 flex items-center justify-center text-[#6F767E] hover:text-[#1A1D1F] transition-all"
            >
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0A0A0A]" />
            </Link>

            <Link
              to="/super-admin/profile"
              className="flex items-center gap-3 ml-2 pl-4 border-l border-[#EFEFEF] dark:border-white/5 hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none mb-1">{clerkUser?.fullName || 'Super Admin'}</p>
                <p className="text-[10px] font-bold text-primary-blue uppercase tracking-widest leading-none">Velocity Root</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary-blue to-neutral-border overflow-hidden shadow-lg border-2 border-white dark:border-[#0A0A0A]">
                {clerkUser?.imageUrl ? (
                  <img src={clerkUser.imageUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                    SA
                  </div>
                )}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
