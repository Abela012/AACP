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
  MessageSquare,
  Briefcase,
  Loader2,
  Star, Zap
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useGlobalSearch } from '@/src/hooks/useGlobalSearch';

interface BusinessLayoutProps {
  children: ReactNode;
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  const { signOut } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { onboardingStatus, logout: localLogout } = useUser();
  const { profile } = useProfile();
  const isApproved = onboardingStatus === 'approved';
  const isProfileIncomplete = onboardingStatus === 'incomplete';

  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Real backend search
  const { results: searchResults, isLoading: isSearching, hasResults } = useGlobalSearch(searchQuery);

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
    { name: 'Discover', icon: Sparkles, path: '/matches' },
    { name: 'Partnerships', icon: Briefcase, path: '/collaborations' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
  ];

  const systemNavigation = [
    { name: 'Wallet', icon: CreditCard, path: '/wallet' },
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
        "fixed inset-y-0 left-0 w-64 border-r border-gray-100 dark:border-white/5 flex flex-col bg-white dark:bg-[#0a0a0a] z-50 transition-all duration-300 transform",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-aacp-olive rounded-full flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-aacp-olive">AACP</span>
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
                      ? "bg-aacp-olive/10 text-aacp-olive" 
                      : "text-gray-500 dark:text-gray-400 hover:text-aacp-olive dark:hover:text-aacp-gold hover:bg-gray-50 dark:hover:bg-white/5"
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
                      ? "bg-aacp-olive/10 text-aacp-olive"
                      : "text-gray-500 dark:text-gray-400 hover:text-aacp-olive dark:hover:text-aacp-gold hover:bg-gray-50 dark:hover:bg-white/5"
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
      <div className={cn("flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-all duration-300", isSidebarOpen ? "lg:pl-64" : "lg:pl-0")}>
        {/* Header */}
        <header className="h-20 border-b border-gray-100 dark:border-white/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-aacp-olive transition-colors" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
                      ? "text-aacp-olive border-b-2 border-aacp-olive" 
                      : "text-gray-500 dark:text-gray-400 hover:text-aacp-olive dark:hover:text-aacp-gold"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative">
            <div className="relative hidden sm:block" ref={searchRef}>
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-aacp-olive w-4 h-4 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              )}
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns, creators..."
                className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-aacp-olive w-48 lg:w-72 transition-all text-gray-900 dark:text-white"
              />
              <AnimatePresence>
                {searchQuery.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-12 left-0 w-80 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
                  >
                    {isSearching ? (
                      <div className="p-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Searching...
                      </div>
                    ) : !hasResults ? (
                      <div className="p-6 text-center">
                        <Search className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={24} />
                        <p className="text-xs font-bold text-gray-400">No results for "{searchQuery}"</p>
                        <p className="text-[10px] text-gray-400 mt-1">Try a different keyword</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {/* Campaigns section */}
                        {searchResults.campaigns.length > 0 && (
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">Campaigns</p>
                            {searchResults.campaigns.map((c) => (
                              <button
                                key={c._id}
                                onClick={() => { navigate('/campaigns'); setSearchQuery(''); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                              >
                                <div className="w-8 h-8 bg-aacp-olive/10 rounded-lg flex items-center justify-center shrink-0">
                                  <Megaphone size={14} className="text-aacp-olive" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.title}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{c.category} • {c.status}</p>
                                </div>
                                <span className={cn(
                                  "ml-auto text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0",
                                  c.status === 'open' ? 'bg-aacp-olive/10 text-aacp-olive' : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                                )}>{c.status}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Divider */}
                        {searchResults.campaigns.length > 0 && searchResults.creators.length > 0 && (
                          <div className="my-1 border-t border-gray-50 dark:border-white/5" />
                        )}

                        {/* Creators section */}
                        {searchResults.creators.length > 0 && (
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">Creators</p>
                            {searchResults.creators.map((u) => (
                              <button
                                key={u._id}
                                onClick={() => { navigate('/matches'); setSearchQuery(''); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                              >
                                <img
                                  src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=10b981&color=fff`}
                                  alt={u.name}
                                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{u.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{u.niche || 'Creator'}{u.location ? ` • ${u.location}` : ''}</p>
                                </div>
                                {u.rating > 0 && (
                                  <span className="ml-auto flex items-center gap-0.5 text-[10px] font-bold text-amber-500 shrink-0">
                                    <Star size={10} fill="currentColor" />
                                    {u.rating.toFixed(1)}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Footer action */}
                        <div className="px-4 py-3 border-t border-gray-50 dark:border-white/5 mt-1">
                          <button
                            onClick={() => { navigate(`/matches`); setSearchQuery(''); }}
                            className="w-full text-center text-xs font-bold text-aacp-olive hover:underline"
                          >
                            View all results in Discover →
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllAsRead();
                }}
                className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-aacp-olive dark:hover:text-aacp-gold transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse blur-[1px]"></span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  </>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-14 right-0 w-80 bg-white dark:bg-[#1a1a1a] rounded-4xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 text-left"
                  >
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-aacp-olive/10 text-aacp-olive text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">{unreadCount} New</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              notif.type === 'application' ? "bg-aacp-olive/10 text-aacp-olive" : "bg-blue-600/10 text-blue-600"
                            )}>
                              {notif.type === 'application' ? <Sparkles size={18} /> : <MessageSquare size={18} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{notif.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{notif.message}</p>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                          <Bell className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={32} />
                          <p className="text-xs font-bold text-gray-400">All caught up!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <ThemeToggle />
            <Link to="/profile/view/business" className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10">
              <img 
                src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=10b981&color=fff`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </Link>
          </div>
        </header>

        <main className="flex-1 relative">
          {showLockOverlay && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md">
              <div className="max-w-md w-full mx-4 bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 text-center">
                <div className="w-20 h-20 bg-aacp-olive/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="text-aacp-olive w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {isProfileIncomplete ? 'Complete Your Profile' : 'Profile Pending Approval'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  {isProfileIncomplete
                    ? 'Please complete your business profile and submit it for admin approval to unlock all features.'
                    : 'Your business profile is currently being reviewed. This page will be unlocked once your account is approved.'}
                </p>
                <div className="flex flex-col gap-3">
                  <Link 
                    to={isProfileIncomplete ? '/profile/complete/business' : '/dashboard/business-owner'}
                    className="w-full py-4 bg-aacp-olive text-white rounded-xl font-bold hover:bg-aacp-olive transition-all shadow-lg shadow-black/10 dark:shadow-none"
                  >
                    {isProfileIncomplete ? 'Complete Profile' : 'Return to Dashboard'}
                  </Link>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-aacp-olive" />
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
