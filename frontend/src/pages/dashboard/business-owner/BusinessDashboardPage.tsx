import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import { 
  Megaphone, 
  Users, 
  Plus, 
  CreditCard,
  Sparkles,
  ShieldCheck,
  Lock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import OnboardingBanner from '@/src/shared/components/OnboardingBanner';
import { cn } from '@/src/shared/utils/cn';
import { useUser } from '@/src/shared/context/UserContext';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import CompleteProfilePage from '../../profile/complete-profile/CompleteProfilePage';
import PendingApprovalState from '@/src/shared/components/PendingApprovalState';
import { useUserSync } from '@/src/hooks/useUserSync';
import { useMyOpportunities } from '@/src/hooks/useOpportunities';
import { useWalletBalance } from '@/src/hooks/useWallet';
import { useRecommendations } from '@/src/hooks/useRecommendations';
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
  const { data: recsData, isLoading: isLoadingRecs } = useRecommendations();
  
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
            <CompleteProfilePage isInsideDashboard={true} />
          </div>
        ) : onboardingStatus === 'pending' ? (
          <PendingApprovalState 
            onRefresh={() => sync()} 
            isRefreshing={isSyncing} 
          />
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

            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600/10 rounded-lg flex items-center justify-center text-emerald-600">
                      <Sparkles size={18} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Featured Content Creators</h3>
                  </div>
                  <Link to="/matches" className="text-sm font-bold text-emerald-600 hover:underline">View all matches</Link>
                </div>

                {isLoadingRecs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-64 bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : (recsData?.recommendations ?? []).length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="text-gray-300 w-10 h-10" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No creators found yet</h4>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm">
                      We're currently matching creators to your profile. Check back shortly!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(recsData?.recommendations ?? []).map((rec, idx) => (
                      <motion.div 
                        key={rec.targetId || idx}
                        whileHover={{ y: -5 }}
                        onClick={() => navigate(`/matches?id=${rec.targetId}`)}
                        className="bg-gray-50 dark:bg-[#0c0c0c] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-emerald-600/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            {rec.meta?.profilePicture ? (
                              <img src={rec.meta.profilePicture} alt={rec.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-md" />
                            ) : (
                              <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-xl border-2 border-white dark:border-gray-800 shadow-md">
                                {rec.name?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0c0c0c] flex items-center justify-center text-white">
                              <ShieldCheck size={12} />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">{rec.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{rec.category || 'Creator'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{rec.score}% Match</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Followers</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                              {Number(rec.meta?.followers || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Engagement</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                              {rec.meta?.engagementRate || 0}%
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {(rec.meta?.platforms || []).slice(0, 3).map((p: string) => (
                            <span key={p} className="text-[9px] font-bold px-2 py-0.5 bg-white dark:bg-white/5 text-gray-500 rounded-lg border border-gray-100 dark:border-white/10 lowercase">
                              #{p}
                            </span>
                          ))}
                        </div>

                        <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:opacity-90 transition-all text-xs">
                          View Profile
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </BusinessLayout>
  );
}
