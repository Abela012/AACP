import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import { 
  Megaphone, 
  Users, 
  BarChart3, 
  Plus, 
  CreditCard,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Lock,
  ChevronRight,
  Briefcase,
  Target,
  Loader2
} from 'lucide-react';
import OnboardingBanner from '@/src/shared/components/OnboardingBanner';
import { cn } from '@/src/shared/utils/cn';
import { useUser } from '@/src/shared/context/UserContext';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import CompleteProfilePage from '../../profile/complete-profile/CompleteProfilePage';
import { useUserSync } from '@/src/hooks/useUserSync';
import { useMyOpportunities } from '@/src/hooks/useOpportunities';
import { useWalletBalance } from '@/src/hooks/useWallet';
import { type Opportunity } from '@/src/api/opportunityApi';

export default function BusinessDashboardPage() {
  const navigate = useNavigate();
  const { onboardingStatus, setOnboardingStatus } = useUser();
  const { user: clerkUser } = useClerkUser();
  const myId = clerkUser?.id ?? '';
  const { sync, isLoading: isSyncing } = useUserSync();
  
  const isApproved = onboardingStatus === 'approved';

  // Real data hooks
  const { data: oppsData, isLoading: isLoadingOpps } = useMyOpportunities(myId);
  const { data: walletData, isLoading: isLoadingWallet } = useWalletBalance();

  const opportunities = oppsData?.opportunities ?? [];
  const activeCount = opportunities.filter((o: Opportunity) => o.status === 'open').length;

  const totalApplicants = opportunities.reduce((acc: number, opp: Opportunity) => acc + (opp.applicants?.length ?? 0), 0);

  const stats = [
    { label: 'Total Campaigns', value: isLoadingOpps ? '...' : opportunities.length.toString(), trend: `${activeCount} active`, trendType: 'up', icon: Megaphone, color: 'text-emerald-500' },
    { label: 'Active Matches', value: isLoadingOpps ? '...' : totalApplicants.toString(), trend: 'Pending review', trendType: 'neutral', icon: Users, color: 'text-blue-500' },
    { label: 'Total Balance', value: isLoadingWallet ? '...' : `${walletData?.balance?.toLocaleString() ?? 0} AACP`, trend: 'Available to spend', trendType: 'neutral', icon: CreditCard, color: 'text-red-500' },
    { label: 'Trust Score', value: 'N/A', subValue: '', trend: 'New Account', trendType: 'neutral', icon: ShieldCheck, color: 'text-cyan-500' },
  ];

  const handleStatClick = (label: string) => {
    if (label.includes('Campaign')) {
      navigate('/campaigns');
      return;
    }
    if (label.includes('Match')) {
      navigate('/matches');
      return;
    }
    if (label.includes('Spent')) {
      navigate('/balance');
      return;
    }
    navigate('/analytics');
  };

  return (
    <BusinessLayout>
      <main className="p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-white/10 hidden">
        </div>

        {onboardingStatus === 'incomplete' ? (
          <div className="mt-8">
            <CompleteProfilePage />
          </div>
        ) : onboardingStatus === 'pending' ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={48} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 text-center">Account Pending Approval</h1>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed mb-8">
              Your business profile has been submitted and is currently being reviewed by our administrative team. You will gain full access to the AACP platform features once approved.
            </p>
            <button 
              onClick={() => sync()}
              disabled={isSyncing}
              className="px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSyncing && <Loader2 size={16} className="animate-spin" />}
              Check Status Again
            </button>
          </div>
        ) : (
          <>
            <OnboardingBanner status={onboardingStatus} role="business" />
            
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Performance <span className="text-emerald-500">Snapshot</span></h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, {clerkUser?.firstName || 'User'}. Your AI agents found {totalApplicants} new high-value matches.</p>
              </div>
              <Link 
                to={isApproved ? "/campaign/new" : "#"}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg",
                  isApproved 
                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-100 dark:shadow-none" 
                    : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                )}
              >
                {isApproved ? <Plus size={18} /> : <Lock size={18} />}
                New Campaign
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStatClick(stat.label)}
                  className="w-full text-left bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-emerald-600/30 transition-all group shadow-sm dark:shadow-none"
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
                    stat.trendType === 'up' ? "text-emerald-500" : stat.trendType === 'down' ? "text-red-500" : "text-gray-500"
                  )}>{stat.trend}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className={cn("bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}>
                  {!isApproved && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px]">
                      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                        <Lock className="text-emerald-600 w-5 h-5" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-600/10 rounded-lg flex items-center justify-center text-emerald-600"><BarChart3 size={18} /></div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Campaign Performance</h3>
                    </div>
                    <button onClick={() => navigate('/analytics')} className="text-xs font-bold text-emerald-600 hover:underline">Open analytics</button>
                  </div>
                  <div className="h-64 flex items-end gap-2 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                      <defs><linearGradient id="busChartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.3" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
                      <path d="M 0 120 Q 150 80 300 140 T 500 60 T 800 100" fill="none" stroke="#10b981" strokeWidth="4" />
                      <path d="M 0 120 Q 150 80 300 140 T 500 60 T 800 100 L 800 200 L 0 200 Z" fill="url(#busChartGrad)" />
                    </svg>
                  </div>
                </div>
                <div className={cn("bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}>
                  {!isApproved && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                        <Lock className="text-emerald-600 w-5 h-5" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                      </div>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Active Collaborations</h3>
                  <div className="space-y-4">
                    {isLoadingOpps ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-emerald-600" />
                      </div>
                    ) : opportunities.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No campaigns yet</p>
                      </div>
                    ) : (
                      opportunities.slice(0, 3).map((collab: Opportunity, idx: number) => {
                        const statusColors: Record<string, string> = {
                          open: 'text-emerald-500 bg-emerald-500/10',
                          in_progress: 'text-amber-500 bg-amber-500/10',
                          closed: 'text-gray-400 bg-gray-400/10'
                        };
                        const progress = collab.status === 'closed' ? 100 : collab.status === 'in_progress' ? 50 : 10;
                        return (
                          <div key={collab._id || idx} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-emerald-600 font-bold border border-gray-100 dark:border-white/10">{collab.title[0]}</div>
                                <div><h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{collab.title}</h4><p className="text-[10px] text-gray-500 line-clamp-1">{collab.description}</p></div>
                              </div>
                              <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase", statusColors[collab.status] || statusColors.open)}>{collab.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-4"><div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-600" style={{ width: `${progress}%` }}></div></div><span className="text-[10px] font-bold text-gray-400">{progress}%</span></div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className={cn("bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}>
                  {!isApproved && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                        <Lock className="text-emerald-600 w-5 h-5" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-8"><Sparkles className="text-cyan-500" /><h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Recommendations</h3></div>
                  <p className="text-xs text-gray-500 leading-relaxed">Upgrade to see personalized brand matches and campaign insights.</p>
                </div>
                <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 relative overflow-hidden group shadow-sm dark:shadow-none">
                  <div className="relative z-10"><div className="flex items-center gap-2 mb-4"><Globe className="text-emerald-500 w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Market Pulse</span></div><div className="flex items-center justify-between"><div><p className="text-xs text-gray-500 mb-1">Trending Hotspot:</p><p className="text-sm font-bold text-gray-900 dark:text-white">Global</p></div><ChevronRight className="text-gray-400 group-hover:text-emerald-600 transition-colors" /></div></div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </BusinessLayout>
  );
}
