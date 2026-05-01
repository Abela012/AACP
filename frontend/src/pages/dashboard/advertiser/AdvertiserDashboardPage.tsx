import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import { 
  Plus, 
  TrendingUp, 
  BarChart3, 
  Sparkles,
  Zap,
  DollarSign,
  Lock,
  ShieldCheck,
  Star,
  Target,
  Globe,
  ChevronRight,
  Briefcase,
  Loader2
} from 'lucide-react';
import OnboardingBanner from '../../../shared/components/OnboardingBanner';
import { cn } from '@/src/shared/utils/cn';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { useUser } from '@/src/shared/context/UserContext';
import CompleteProfilePage from '../../profile/complete-profile/CompleteProfilePage';
import PendingApprovalState from '@/src/shared/components/PendingApprovalState';
import { useUserSync } from '@/src/hooks/useUserSync';
import { useMyApplications } from '@/src/hooks/useApplications';
import { useWalletBalance } from '@/src/hooks/useWallet';

export default function AdvertiserDashboardPage() {
  const navigate = useNavigate();
  const { onboardingStatus, setOnboardingStatus } = useUser();
  const { user: clerkUser } = useClerkUser();
  const myId = clerkUser?.id ?? '';
  const { sync, isLoading: isSyncing } = useUserSync();
  
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('monthly');
  const isApproved = onboardingStatus === 'approved';

  // Real data hooks
  const { data: appsData, isLoading: isLoadingApps } = useMyApplications(myId);
  const { data: walletData, isLoading: isLoadingWallet } = useWalletBalance();

  const applications = appsData?.applications ?? [];
  const activeCount = applications.filter((a: any) => a.status === 'accepted').length;
  const pendingCount = applications.filter((a: any) => a.status === 'pending').length;

  const stats = [
    { label: 'Trust Score', value: 'N/A', subValue: '', trend: 'New Account', trendType: 'neutral', icon: ShieldCheck, color: 'text-emerald-500' },
    { label: 'Total Balance', value: isLoadingWallet ? '...' : `${walletData?.balance?.toLocaleString() ?? 0} AACP`, trend: 'Available to withdraw', trendType: 'neutral', icon: DollarSign, color: 'text-blue-500' },
    { label: 'Active Campaigns', value: isLoadingApps ? '...' : activeCount.toString(), trend: `${pendingCount} pending`, trendType: 'neutral', icon: Zap, color: 'text-indigo-500' },
    { label: 'AI Matches', value: '0', trend: 'N/A', trendType: 'neutral', icon: Sparkles, color: 'text-cyan-500' },
  ];

  const handleStatClick = (label: string) => {
    if (label.includes('Campaign')) {
      navigate('/advertiser/campaigns');
      return;
    }
    if (label.includes('Match')) {
      navigate('/advertiser/matches');
      return;
    }
    if (label.includes('Balance') || label.includes('Earnings')) {
      navigate('/advertiser/balance');
      return;
    }
    navigate('/advertiser/analytics');
  };

  return (
    <AdvertiserLayout>
      <main className="p-4 sm:p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-wrap items-center gap-4 border border-gray-100 dark:border-white/10 hidden">
        </div>

        {onboardingStatus === 'incomplete' ? (
          <div className="mt-8">
            <CompleteProfilePage isInsideDashboard={true} />
          </div>
        ) : onboardingStatus === 'pending' ? (
          <PendingApprovalState 
            onRefresh={() => sync()} 
            isRefreshing={isSyncing} 
          />
        ) : (
          /* Show Regular Dashboard for Approved */
          <>
            <OnboardingBanner status={onboardingStatus} role="advertiser" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Performance <span className="text-emerald-500">Snapshot</span></h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, {clerkUser?.firstName || 'User'}. Your AI agents found {pendingCount} new high-value opportunities.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStatClick(stat.label)}
                  className="w-full text-left bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-emerald-500/30 transition-all group shadow-sm dark:shadow-none"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</h3>
                    <div className={cn("w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center", stat.color)}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                    {stat.subValue && <span className="text-sm text-gray-500 dark:text-gray-400">{stat.subValue}</span>}
                  </div>
                  <div className={cn(
                    "text-xs font-medium",
                    stat.trendType === 'up' ? "text-emerald-500" : "text-gray-500"
                  )}>
                    {stat.trend}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Revenue Growth Chart */}
                <div
                  className={cn("bg-white dark:bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}
                >
                  {!isApproved && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px]">
                      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                        <Lock className="text-emerald-500 w-5 h-5" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                        <BarChart3 size={18} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Growth</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/advertiser/analytics')}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-500 hover:underline"
                      >
                        Open analytics
                      </button>
                      <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                      <button 
                        onClick={() => setChartView('daily')}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold transition-all rounded-lg",
                          chartView === 'daily' 
                            ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" 
                            : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        Daily
                      </button>
                      <button 
                        onClick={() => setChartView('monthly')}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold transition-all rounded-lg",
                          chartView === 'monthly' 
                            ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" 
                            : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        Monthly
                      </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64 flex items-end gap-2 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path 
                        initial={false}
                        animate={{ 
                          d: chartView === 'monthly' 
                            ? "M 0 150 Q 100 160 200 120 T 400 100 T 600 140 T 800 80" 
                            : "M 0 180 Q 66 170 133 185 T 266 160 T 400 175 T 533 140 T 666 165 T 800 130"
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                      />
                      <motion.path 
                        initial={false}
                        animate={{ 
                          d: chartView === 'monthly' 
                            ? "M 0 150 Q 100 160 200 120 T 400 100 T 600 140 T 800 80 L 800 200 L 0 200 Z" 
                            : "M 0 180 Q 66 170 133 185 T 266 160 T 400 175 T 533 140 T 666 165 T 800 130 L 800 200 L 0 200 Z"
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        fill="url(#chartGradient)"
                      />
                      <motion.circle 
                        initial={{ cx: 800, cy: chartView === 'monthly' ? 80 : 130 }}
                        animate={{ 
                          cx: 800, 
                          cy: chartView === 'monthly' ? 80 : 130 
                        }}
                        r="6" 
                        fill="#10b981" 
                      />
                      <motion.circle 
                        initial={{ cx: 800, cy: chartView === 'monthly' ? 80 : 130 }}
                        animate={{ 
                          cx: 800, 
                          cy: chartView === 'monthly' ? 80 : 130 
                        }}
                        r="12" 
                        fill="#10b981" 
                        fillOpacity="0.2" 
                      />
                    </svg>
                    
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-4">
                      {chartView === 'monthly' ? (
                        <><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></>
                      ) : (
                        <><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></>
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Applications */}
                <div className={cn("bg-white dark:bg-white/5 p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}>
                  {!isApproved && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                        <Lock className="text-emerald-500 w-5 h-5" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Applications</h3>
                    <button onClick={() => navigate('/advertiser/campaigns')} className="text-xs font-bold text-emerald-500 hover:underline">View all</button>
                  </div>
                  <div className="space-y-4">
                    {isLoadingApps ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-emerald-500" />
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No applications yet</p>
                      </div>
                    ) : (
                      applications.slice(0, 3).map((app: any, idx: number) => {
                        const oppTitle = typeof app.opportunity === 'object' ? app.opportunity.title : 'Opportunity';
                        const statusColors: Record<string, string> = {
                          pending: 'text-amber-500 bg-amber-500/10',
                          accepted: 'text-emerald-500 bg-emerald-500/10',
                          rejected: 'text-red-500 bg-red-500/10',
                          withdrawn: 'text-gray-500 bg-gray-500/10'
                        };
                        return (
                          <div key={app._id || idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all group gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 dark:border-white/10">
                                <Briefcase size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">{oppTitle}</h4>
                                <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500">
                                  <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                                  <span className="text-emerald-500">AI Matched</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                              <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase", statusColors[app.status] || statusColors.pending)}>{app.status}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Match Analysis */}
                <div className={cn("bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}>
                  {!isApproved && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                        <Lock className="text-emerald-500 w-5 h-5" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500"><Target size={18} /></div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Match Analysis</h3>
                    </div>
                    <button onClick={() => navigate('/advertiser/analytics')} className="text-xs font-bold text-emerald-500 hover:underline">Open analytics</button>
                  </div>
                  <div className="space-y-6 mb-8">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-gray-400 dark:text-gray-500">Audience Alignment</span>
                        <span className="text-emerald-500">98%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[98%]"></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-gray-400 dark:text-gray-500">Competitive Edge</span>
                        <span className="text-cyan-500">72%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[72%]"></div></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="text-cyan-500 w-4 h-4" /><span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Recommendation</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Your profile shows strong resonance with "Tech Enthusiast" demographics. Aim for high-engagement video assets to increase ROI by an estimated 14%.</p>
                  </div>
                </div>

                {/* Market Pulse */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 relative overflow-hidden group shadow-sm dark:shadow-none">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center"><Globe className="text-emerald-500 w-4 h-4" /></div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Market Pulse</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trending Hotspot:</p><p className="text-sm font-bold text-gray-900 dark:text-white">Global</p></div>
                      <ChevronRight className="text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </AdvertiserLayout>
  );
}
