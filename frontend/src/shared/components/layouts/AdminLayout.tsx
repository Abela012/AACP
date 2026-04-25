import { useState, useRef, type ReactNode } from 'react';
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
  X,
  LogOut,
  HelpCircle,
  PlusCircle,
  Layout,
  MessageSquare,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useClerk, useUser as useClerkUser } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout: localLogout } = useUser();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleGenerateReport = () => {
    if (!selectedReportType) {
      showToast('Please select a report category first.', 'error');
      return;
    }

    setIsGenerating(true);
    
    // Mock generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowReportModal(false);
      setSelectedReportType(null);
      showToast(`${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} report generated and downloaded successfully!`, 'success');
    }, 2500);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#F6F6FB] dark:bg-[#050505] text-[#1A1D1F] dark:text-white font-sans flex transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
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

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 flex flex-col bg-white dark:bg-[#0A0A0A] z-50 transition-all duration-300 transform lg:translate-x-0 border-r border-[#EFEFEF] dark:border-white/5",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="p-8 pb-4">
          <Link to="/dashboard/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14a800] rounded-xl flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none">
              <Layout className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight text-[#1A1D1F] dark:text-white leading-none">Admin Panel</h1>
              <span className="text-[10px] font-bold text-[#14a800] uppercase tracking-widest leading-none">Enterprise Tier</span>
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
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all relative group",
                    isActive 
                      ? "text-[#14a800] bg-[#F1FFF0] dark:bg-[#14a800]/10" 
                      : "text-[#6F767E] hover:text-[#1A1D1F] dark:hover:text-white"
                  )}
                >
                  <item.icon size={20} className={cn("transition-colors", isActive ? "text-[#14a800]" : "text-[#9A9FA5]")} />
                  {item.name}
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-6 bg-[#14a800] rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-[#EFEFEF] dark:border-white/5">
            <button 
              onClick={() => setShowReportModal(true)}
              className="w-full h-12 bg-[#14a800] hover:bg-[#108a00] text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} />
              New Report
            </button>
          </div>
        </div>

        <div className="p-4 mt-auto">
          <nav className="space-y-1">
            <Link to="/admin/help" className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-[#6F767E] hover:text-[#1A1D1F] transition-all">
              <HelpCircle size={20} />
              Help Center
            </Link>
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

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-lg px-8 flex items-center justify-between sticky top-0 z-40 border-b border-[#EFEFEF] dark:border-white/5">
          <div className="flex items-center gap-6">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setIsSidebarOpen(true)}>
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
                className="bg-[#F4F4F4] dark:bg-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14a800]/20 w-[400px] transition-all border-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-10 w-[1px] bg-[#EFEFEF] dark:bg-white/5 mx-2 hidden sm:block" />
            <Link to="/admin/notifications" className="relative w-10 h-10 flex items-center justify-center text-[#6F767E] hover:text-[#1A1D1F] transition-all">
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0A0A0A]" />
            </Link>
            <Link to="/admin/settings" className="w-10 h-10 flex items-center justify-center text-[#6F767E] hover:text-[#1A1D1F] transition-all">
              <Settings size={20} />
            </Link>
            
            <Link to="/admin/profile" className="flex items-center gap-3 ml-4 pl-4 border-l border-[#EFEFEF] dark:border-white/5 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#1A1D1F] dark:text-white leading-none mb-1">{clerkUser?.fullName || 'Administrator'}</p>
                <p className="text-[10px] font-bold text-[#14a800] uppercase tracking-widest leading-none">Profile</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#14a800] to-green-500 overflow-hidden shadow-lg border-2 border-white dark:border-[#0A0A0A]">
                {clerkUser?.imageUrl ? (
                  <img src={clerkUser.imageUrl} alt="User" className="w-full h-full object-cover" />
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

      {/* New Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white dark:bg-[#0F0F0F] rounded-[3rem] shadow-2xl border border-[#EFEFEF] dark:border-white/5 z-[70] overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-[#14a800]">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">Generate Intelligence</h2>
                      <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Custom Platform Reporting</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <X size={24} className="text-[#9A9FA5]" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Report Type */}
                  <div>
                    <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-4 block">Report Category</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'insights', label: 'Platform Insights', icon: LayoutDashboard },
                        { id: 'revenue', label: 'Revenue Ledger', icon: Coins },
                        { id: 'users', label: 'User Demographics', icon: Users },
                        { id: 'audit', label: 'Audit Summary', icon: CheckCircle2 },
                      ].map((type) => (
                        <button 
                          key={type.id}
                          onClick={() => setSelectedReportType(type.id)}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all group relative",
                            selectedReportType === type.id 
                              ? "bg-white dark:bg-white/10 border-[#14a800] shadow-xl shadow-green-100 dark:shadow-none" 
                              : "bg-gray-50 dark:bg-white/5 border-transparent hover:border-[#14a800]/30 hover:bg-white dark:hover:bg-white/10"
                          )}
                        >
                          <type.icon size={20} className={cn("transition-colors", selectedReportType === type.id ? "text-[#14a800]" : "text-[#9A9FA5] group-hover:text-[#14a800]")} />
                          <span className={cn("text-xs font-bold transition-colors", selectedReportType === type.id ? "text-[#1A1D1F] dark:text-white" : "text-[#6F767E]")}>{type.label}</span>
                          {selectedReportType === type.id && (
                            <motion.div layoutId="selected-check" className="absolute top-4 right-4 text-[#14a800]">
                              <CheckCircle2 size={16} />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format & Period */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-4 block">Output Format</label>
                      <select className="w-full bg-gray-50 dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-[#14a800]/20 appearance-none outline-none">
                        <option>Portable Document (PDF)</option>
                        <option>CSV Spreadsheet</option>
                        <option>Excel Workbook</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-4 block">Date Range</label>
                      <select className="w-full bg-gray-50 dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-[#14a800]/20 appearance-none outline-none">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Current Quarter</option>
                        <option>Fiscal Year</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className={cn(
                      "w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all mt-4 flex items-center justify-center gap-3",
                      isGenerating 
                        ? "bg-gray-100 dark:bg-white/5 text-[#9A9FA5] cursor-not-allowed" 
                        : "bg-[#14a800] hover:bg-[#108a00] text-white shadow-xl shadow-green-100 dark:shadow-none"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RotateCcw size={18} />
                        </motion.div>
                        Generating...
                      </>
                    ) : (
                      'Generate Report'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "fixed bottom-8 right-8 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border",
              toast.type === 'success' 
                ? 'bg-[#14a800] text-white border-green-400' 
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
