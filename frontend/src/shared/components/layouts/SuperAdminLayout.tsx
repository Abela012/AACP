import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useClerk, useUser as useClerkUser } from '@clerk/clerk-react';
import {
  Shield,
  Users,
  ClipboardList,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Layout,
  Activity,
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';

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
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F6FB] dark:bg-[#050505] text-[#1A1D1F] dark:text-white font-sans flex transition-colors duration-300">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-72 flex flex-col bg-white dark:bg-[#0A0A0A] z-50 transition-all duration-300 transform lg:translate-x-0 border-r border-[#EFEFEF] dark:border-white/5',
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        <div className="p-8 pb-4">
          <Link to="/dashboard/super-admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14a800] rounded-xl flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none">
              <Layout className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight leading-none">AACP Velocity</h1>
              <span className="text-[10px] font-bold text-[#14a800] uppercase tracking-widest leading-none">
                Super Admin Panel
              </span>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 py-8 overflow-y-auto space-y-6">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all relative group',
                    isActive
                      ? 'text-[#14a800] bg-[#F1FFF0] dark:bg-[#14a800]/10'
                      : 'text-[#6F767E] hover:text-[#1A1D1F] dark:hover:text-white'
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? 'text-[#14a800]' : 'text-[#9A9FA5]')} />
                  {item.name}
                  {isActive && (
                    <motion.div layoutId="super-active" className="absolute left-0 w-1 h-6 bg-[#14a800] rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-[#EFEFEF] dark:border-white/5">
            <Link
              to="/super-admin/audit-trail"
              className="w-full h-12 bg-[#14a800] hover:bg-[#108a00] text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Activity size={18} />
              Activity
            </Link>
          </div>
        </div>

        <div className="p-4 mt-auto">
          <nav className="space-y-1">
            <button
              onClick={() => {
                localLogout();
                signOut();
              }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-[#6F767E] hover:text-red-500 transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      <div className="lg:ml-72 flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-lg px-8 flex items-center justify-between sticky top-0 z-40 border-b border-[#EFEFEF] dark:border-white/5">
          <div className="flex items-center gap-6">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
              <input
                type="text"
                placeholder="Search admins..."
                className="bg-[#F4F4F4] dark:bg-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14a800]/20 w-[420px] transition-all border-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/super-admin/notifications" className="relative w-10 h-10 flex items-center justify-center text-[#6F767E] hover:text-[#1A1D1F] transition-all">
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0A0A0A]" />
            </Link>

            <Link to="/super-admin/profile" className="flex items-center gap-3 ml-2 pl-4 border-l border-[#EFEFEF] dark:border-white/5 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none mb-1">{clerkUser?.fullName || 'Super Admin'}</p>
                <p className="text-[10px] font-bold text-[#14a800] uppercase tracking-widest leading-none">Velocity Root</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#14a800] to-green-400 overflow-hidden shadow-lg border-2 border-white dark:border-[#0A0A0A]">
                {clerkUser?.imageUrl ? (
                  <img src={clerkUser.imageUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">SA</div>
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

