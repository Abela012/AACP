import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Coins,
  BarChart3,
  Settings,
  AlertCircle,
  Bell,
  Search,
  Menu,
  LogOut,
  HelpCircle,
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import NewReportModal, { type ReportTypeOption } from '@/src/shared/components/reports/NewReportModal';
import { useClerk, useUser as useClerkUser } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { useNotifications } from '@/src/hooks/useNotifications';
import DashboardSidebar from '@/src/shared/components/navigation/DashboardSidebar';
import { useSidebarState } from '@/src/shared/components/navigation/useSidebarState';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/admin' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Messages', icon: MessageSquare, path: '/admin/messages' },
  { name: 'Coin Requests', icon: Coins, path: '/admin/payments' },
  { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { name: 'System', icon: Settings, path: '/admin/settings' },
  { name: 'Disputes', icon: AlertCircle, path: '/admin/disputes' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useClerk();
  const { user: clerkUser } = useClerkUser();
  const { profile } = useProfile();
  const { sidebarExpanded, mobileOpen, toggleSidebar, closeMobile, mainOffsetClass } =
    useSidebarState();
  const location = useLocation();
  const { logout: localLogout } = useUser();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const adminReportTypes: ReportTypeOption[] = [
    { id: 'insights', label: 'Platform Insights', icon: LayoutDashboard },
    { id: 'revenue', label: 'Revenue Ledger', icon: Coins },
    { id: 'users', label: 'User Demographics', icon: Users },
    { id: 'audit', label: 'Audit Summary', icon: CheckCircle2 },
  ];

  const handleGenerateReport = () => {
    if (!selectedReportType) {
      showToast('Please select a report category first.', 'error');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setShowReportModal(false);
      const label =
        adminReportTypes.find((t) => t.id === selectedReportType)?.label ?? selectedReportType;
      setSelectedReportType(null);
      showToast(`${label} report generated and downloaded successfully!`, 'success');
    }, 2500);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#F6F6FB] dark:bg-[#050505] text-[#1A1D1F] dark:text-white font-sans flex transition-colors duration-300">
      <DashboardSidebar
        variant="admin"
        brandHref="/dashboard/admin"
        brandTitle="Admin Panel"
        brandSubtitle="Enterprise Tier"
        expanded={sidebarExpanded}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        sections={[{ items: navigation }]}
        midSlot={
          <div className="pt-6 border-t border-[#EFEFEF] dark:border-white/5">
            <button
              type="button"
              title="New Report"
              onClick={() => setShowReportModal(true)}
              className="w-full h-12 bg-primary-blue hover:bg-primary-blue text-white rounded-2xl text-sm font-bold shadow-lg shadow-neutral-border/25 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} className="shrink-0" />
              <span>New Report</span>
            </button>
          </div>
        }
        footer={
          <nav className="space-y-1">
            <Link
              to="/admin/help"
              title="Help Center"
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-[#6F767E] hover:text-[#1A1D1F] transition-all"
            >
              <HelpCircle size={20} className="shrink-0" />
              <span>Help Center</span>
            </Link>
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
          </nav>
        }
      />

      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300', mainOffsetClass)}>
        <header className="h-20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-lg px-8 flex items-center justify-between sticky top-0 z-40 border-b border-[#EFEFEF] dark:border-white/5">
          <div className="flex items-center gap-6">
            <button className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-primary-blue transition-colors" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex flex-col">
              <h2 className="text-lg font-bold text-[#1A1D1F] dark:text-white leading-none mb-1">AACP Admin</h2>
              <p className="text-xs text-[#6F767E] dark:text-gray-400 font-medium">System Control & Management</p>
            </div>
            <div className="relative hidden lg:block ml-8" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles, transactions, or logs..."
                className="bg-[#F4F4F4] dark:bg-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 w-[400px] transition-all border-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-10 w-1px bg-[#EFEFEF] dark:bg-white/5 mx-2 hidden sm:block" />
            
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllAsRead();
                }}
                className="w-10 h-10 flex items-center justify-center text-[#6F767E] hover:text-[#1A1D1F] transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse blur-[1px]"></span>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0A0A0A]"></span>
                  </>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-14 right-0 w-80 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-[#EFEFEF] dark:border-white/10 overflow-hidden z-50 text-left"
                  >
                    <div className="p-6 border-b border-[#EFEFEF] dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                      <h3 className="font-bold text-[#1A1D1F] dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-primary-blue/10 text-primary-blue text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">{unreadCount} New</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#EFEFEF] dark:divide-white/5">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              notif.type === 'application' ? "bg-primary-blue/10 text-primary-blue" : "bg-blue-600/10 text-blue-600"
                            )}>
                              {notif.type === 'application' ? <Sparkles size={18} /> : <MessageSquare size={18} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#1A1D1F] dark:text-white mb-1">{notif.title}</p>
                              <p className="text-xs text-[#6F767E] dark:text-gray-400 leading-relaxed mb-2">{notif.message}</p>
                              <span className="text-[10px] font-bold text-[#9A9FA5] uppercase">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                          <Bell className="mx-auto text-[#9A9FA5] dark:text-gray-700 mb-3" size={32} />
                          <p className="text-xs font-bold text-[#6F767E]">All caught up!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/admin/settings" className="w-10 h-10 flex items-center justify-center text-[#6F767E] hover:text-[#1A1D1F] transition-all">
              <Settings size={20} />
            </Link>

            <Link to="/admin/profile" className="flex items-center gap-3 ml-4 pl-4 border-l border-[#EFEFEF] dark:border-white/5 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#1A1D1F] dark:text-white leading-none mb-1">{profile.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : clerkUser?.fullName || 'Administrator'}</p>
                <p className="text-[10px] font-bold text-primary-blue uppercase tracking-widest leading-none">Profile</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary-blue to-primary-blue overflow-hidden shadow-lg border-2 border-white dark:border-[#0A0A0A]">
                {(profile.avatarUrl || clerkUser?.imageUrl) ? (
                  <img src={profile.avatarUrl || clerkUser?.imageUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                    AD
                  </div>
                )}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <NewReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportTypes={adminReportTypes}
        selectedReportType={selectedReportType}
        onSelectReportType={setSelectedReportType}
        onGenerate={handleGenerateReport}
        isGenerating={isGenerating}
      />

      {/* Global Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "fixed bottom-8 right-8 z-100 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border",
              toast.type === 'success'
                ? 'bg-primary-blue text-white border-neutral-border'
                : 'bg-red-500 text-white border-red-400'
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
