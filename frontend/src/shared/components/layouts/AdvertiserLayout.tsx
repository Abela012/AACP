import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  BarChart3,
  CreditCard,
  Settings,
  Bell,
  Search,
  Menu,
  Lock,
  ShieldCheck,
  LogOut,
  MessageSquare,
  Briefcase,
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useOpportunities } from '@/src/hooks/useOpportunities';
import DashboardSidebar from '@/src/shared/components/navigation/DashboardSidebar';
import { useSidebarState } from '@/src/shared/components/navigation/useSidebarState';

interface AdvertiserLayoutProps {
  children: ReactNode;
}

export default function AdvertiserLayout({ children }: AdvertiserLayoutProps) {
  const { signOut } = useClerk();
  const { sidebarExpanded, mobileOpen, toggleSidebar, closeMobile, mainOffsetClass } =
    useSidebarState();
  const location = useLocation();
  const { onboardingStatus, logout: localLogout } = useUser();
  const { profile } = useProfile();
  const isApproved = onboardingStatus === "approved";

  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { data: oppsData } = useOpportunities();
  const matchCount = oppsData?.opportunities?.length ?? 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchQuery("");
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pages that are ALWAYS accessible
  const isPublicPage =
    location.pathname === "/dashboard/advertiser" ||
    location.pathname === "/profile/complete/advertiser";
  const showLockOverlay = !isApproved && !isPublicPage;

  const navigation = [
    { name: "Overview", icon: LayoutDashboard, path: "/dashboard/advertiser" },
    { name: "Campaigns", icon: Megaphone, path: "/advertiser/campaigns" },
    {
      name: "AI Matches",
      icon: Sparkles,
      path: "/advertiser/matches",
      badge: matchCount > 0 ? matchCount.toString() : undefined,
    },
    {
      name: "Partnerships",
      icon: Briefcase,
      path: "/advertiser/collaborations",
    },
    { name: "Reports", icon: BarChart3, path: "/advertiser/analytics" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
  ];

  const systemNavigation = [
    { name: "Wallet", icon: CreditCard, path: "/advertiser/wallet" },
    { name: "Settings", icon: Settings, path: "/profile/edit/advertiser" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans flex transition-colors duration-300">
      <DashboardSidebar
        brandHref="/"
        brandTitle="AACP"
        expanded={sidebarExpanded}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        sections={[
          { label: 'Main Menu', items: navigation },
          { label: 'System', items: systemNavigation },
        ]}
        footer={
          <button
            type="button"
            title="Log Out"
            onClick={() => {
              localLogout();
              signOut();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
          >
            <LogOut size={18} className="shrink-0" />
            <span>Log Out</span>
          </button>
        }
      />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-all duration-300',
          mainOffsetClass
        )}
      >
        {/* Header */}
        <header className="h-20 border-b border-gray-100 dark:border-white/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-primary-blue transition-colors" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
            {!sidebarExpanded && (
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-blue rounded-full flex items-center justify-center">
                  <Zap className="text-white w-4 h-4 fill-white" />
                </div>
                <span className="text-lg font-bold tracking-tighter text-primary-blue">
                  AACP
                </span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Search */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search insights..."
                className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-blue w-48 lg:w-64 transition-all text-gray-900 dark:text-white"
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
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                        Results for "{searchQuery}"
                      </p>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2">
                        <Search size={14} className="text-primary-blue" />
                        Search campaigns for "{searchQuery}"
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2">
                        <Users size={14} className="text-primary-blue" />
                        Search creators matching "{searchQuery}"
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllAsRead();
                }}
                className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-blue dark:hover:text-neutral-border transition-all relative"
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
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/2">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="bg-primary-blue/10 text-primary-blue text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-4"
                          >
                            <div
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                notif.type === "application"
                                  ? "bg-primary-blue/10 text-primary-blue"
                                  : "bg-blue-600/10 text-blue-600",
                              )}
                            >
                              {notif.type === "application" ? (
                                <Sparkles size={18} />
                              ) : (
                                <MessageSquare size={18} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                                {notif.message}
                              </p>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">
                                {new Date(notif.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                          <Bell
                            className="mx-auto text-gray-300 dark:text-gray-700 mb-3"
                            size={32}
                          />
                          <p className="text-xs font-bold text-gray-400">
                            All caught up!
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ThemeToggle />
            <Link
              to="/profile/view/advertiser"
              className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <img
                src={
                  profile.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=10b981&color=fff`
                }
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>
        </header>

        <main className="flex-1 relative">
          {showLockOverlay && (
            <div className="absolute inset-0 z-60 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md">
              <div className="max-w-md w-full mx-4 bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 text-center">
                <div className="w-20 h-20 bg-primary-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="text-primary-blue w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Profile Pending Approval
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  Your advertiser profile is currently being reviewed. This page
                  will be unlocked once your account is approved.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/dashboard/advertiser"
                    className="w-full py-4 bg-primary-blue text-black rounded-xl font-bold hover:bg-neutral-border transition-all shadow-lg shadow-black/10 dark:shadow-none"
                  >
                    Return to Dashboard
                  </Link>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-primary-blue" />
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
            © 2024 ADVANTAGE AI • Advertiser Portal
          </p>
        </footer>
      </div>
    </div>
  );
}
