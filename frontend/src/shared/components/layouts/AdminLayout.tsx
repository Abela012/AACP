import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  ShieldCheck, 
  Settings, 
  Target,
  Bell,
  Search,
  Menu,
  X,
  Lock,
  MessageSquare,
  LogOut,
  Terminal,
  BarChart3
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout: localLogout } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Console', icon: LayoutDashboard, path: '/dashboard/admin' },
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'System Campaigns', icon: Megaphone, path: '/admin/campaigns' },
    { name: 'AI Verification', icon: ShieldCheck, path: '/admin/verification' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
  ];

  const systemNavigation = [
    { name: 'Global Settings', icon: Settings, path: '/admin/settings' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans flex transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 border-r border-gray-100 dark:border-white/5 flex flex-col bg-white dark:bg-[#0a0a0a] z-50 transition-transform lg:translate-x-0 lg:static lg:h-screen",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Terminal className="text-white dark:text-black w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">Admin Hub</span>
          </Link>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6 space-y-8 flex-1 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-4">Core Control</p>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    location.pathname === item.path 
                      ? "bg-black/10 dark:bg-white/10 text-black dark:text-white" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.name}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-4">Configuration</p>
            <nav className="space-y-1">
              {systemNavigation.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-black/10 dark:bg-white/10 text-black dark:text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
              <button 
                onClick={() => {
                  localLogout();
                  signOut();
                }}
                className="w-full mt-2 lg:mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-20 border-b border-gray-100 dark:border-white/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white hidden sm:block uppercase tracking-widest">Administrative Control Center</h2>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative hidden sm:block" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Universal Search..." 
                className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-black dark:focus:border-white w-48 lg:w-64 transition-all text-gray-900 dark:text-white"
              />
            </div>
            
            <ThemeToggle />
            <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
