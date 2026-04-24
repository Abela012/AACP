import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Rocket,
  Bell,
  Search,
  Menu,
  X,
  Lock,
  ShieldCheck,
  Sparkles,
  LogOut,
  MessageSquare
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';

interface BusinessLayoutProps {
  children: ReactNode;
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  const { signOut } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { onboardingStatus, logout: localLogout } = useUser();
  const { profile } = useProfile();
  const isApproved = onboardingStatus === 'approved';

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

  // Pages that are ALWAYS accessible
  const isPublicPage = location.pathname === '/dashboard/business-owner' || location.pathname === '/profile/complete/business';
  const showLockOverlay = !isApproved && !isPublicPage;

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/business-owner' },
    { name: 'Campaigns', icon: Megaphone, path: '/campaigns' },
    { name: 'Matches', icon: Users, path: '/matches' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
  ];

  const systemNavigation = [
    { name: 'Balance', icon: CreditCard, path: '/balance' },
    { name: 'Settings', icon: Settings, path: '/profile/edit/business' },
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
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">AACP</span>
          </Link>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6 space-y-8 flex-1 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-4">Main Menu</p>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    location.pathname === item.path 
                      ? "bg-emerald-600/10 text-emerald-600" 
                      : "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-4">System</p>
            <nav className="space-y-1">
              {systemNavigation.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-emerald-600/10 text-emerald-600"
                      : "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-white/5"
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
        {/* Header */}
        <header className="h-20 border-b border-gray-100 dark:border-white/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors pb-1",
                    location.pathname === item.path 
                      ? "text-emerald-600 border-b-2 border-emerald-600" 
                      : "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative">
            <div className="relative hidden sm:block" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-600 w-48 lg:w-64 transition-all text-gray-900 dark:text-white"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 left-0 right-0 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 text-left"
                  >
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Results for "{searchQuery}"</p>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2">
                        <Search size={14} className="text-emerald-600" />
                        Search campaigns for "{searchQuery}"
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2">
                        <Users size={14} className="text-emerald-600" />
                        Search creators matching "{searchQuery}"
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all relative"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse blur-[1px]"></span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-14 right-0 w-80 bg-white dark:bg-[#1a1a1a] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 text-left"
                  >
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      <span className="bg-emerald-600/10 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">3 New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                      <div className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center shrink-0">
                          <Sparkles size={18} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">New AI Match Found!</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">A high-conversion tech creator matches your campaign criteria.</p>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">2 mins ago</span>
                        </div>
                      </div>
                      <div className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Megaphone size={18} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Campaign Approved</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">Your "Summer Launch" campaign is now live.</p>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">1 hour ago</span>
                        </div>
                      </div>
                      <div className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                          <CreditCard size={18} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Coins Credited</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">500 coins have been added to your wallet successfully.</p>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <ThemeToggle />
            <Link to="/profile/view/business" className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
              <img src={profile.avatarUrl || null} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </Link>
          </div>
        </header>

        <main className="flex-1 relative">
          {showLockOverlay && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md">
              <div className="max-w-md w-full mx-4 bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 text-center">
                <div className="w-20 h-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="text-emerald-600 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Profile Pending Approval</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  Your business profile is currently being reviewed. This page will be unlocked once your account is approved.
                </p>
                <div className="flex flex-col gap-3">
                  <Link 
                    to="/dashboard/business-owner"
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
                  >
                    Return to Dashboard
                  </Link>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Secure Verification in Progress
                  </div>
                </div>
              </div>
            </div>
          )}
          {children}
        </main>

        <footer className="border-t border-gray-100 dark:border-white/5 py-6 px-8 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            © 2024 AACP • Business Portal
          </p>
        </footer>
      </div>
    </div>
  );
}
