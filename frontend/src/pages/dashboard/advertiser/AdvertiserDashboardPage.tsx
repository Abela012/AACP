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
  Loader2,
  Building2,
  Clock,
  ArrowRight,
  MapPin,
  X,
  Heart
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
import { useOpportunities } from '@/src/hooks/useOpportunities';
import { useSavedOpportunities, useToggleSaveOpportunity } from '@/src/hooks/useSavedOpportunities';

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
  const { data: oppsData, isLoading: isLoadingOpps } = useOpportunities();
  const { data: savedJobs = [] } = useSavedOpportunities();
  const toggleSave = useToggleSaveOpportunity();

  const isJobSaved = (jobId: string) => {
    if (!jobId || !savedJobs) return false;
    return savedJobs.some((j: any) => {
      const id = typeof j === 'string' ? j : (j._id || j.id);
      return id?.toString() === jobId.toString();
    });
  };

  const handleToggleSave = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate(jobId);
  };

  const applications = appsData?.applications ?? [];
  const activeCount = applications.filter((a: any) => a.status === 'accepted').length;
  const pendingCount = applications.filter((a: any) => a.status === 'pending').length;

  const opportunities = oppsData?.opportunities ?? [];
  const matchCount = opportunities.length;

  const stats = [
    { label: 'Trust Score', value: 'N/A', subValue: '', trend: 'New Account', trendType: 'neutral', icon: ShieldCheck, color: 'text-emerald-500' },
    { label: 'Total Balance', value: isLoadingWallet ? '...' : `${walletData?.balance?.toLocaleString() ?? 0} AACP`, trend: 'Available to withdraw', trendType: 'neutral', icon: DollarSign, color: 'text-blue-500' },
    { label: 'Active Campaigns', value: isLoadingApps ? '...' : activeCount.toString(), trend: `${pendingCount} pending`, trendType: 'neutral', icon: Zap, color: 'text-indigo-500' },
    { label: 'AI Matches', value: isLoadingOpps ? '...' : matchCount.toString(), trend: matchCount > 0 ? 'New matches found' : 'No matches yet', trendType: matchCount > 0 ? 'up' : 'neutral', icon: Sparkles, color: 'text-cyan-500' },
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
      navigate('/advertiser/wallet');
      return;
    }
    navigate('/advertiser/analytics');
  };

  return (
    <AdvertiserLayout>
      <main className="p-4 sm:p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl  flex-wrap items-center gap-4 border border-gray-100 dark:border-white/10 hidden">
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
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Dashboard <span className="text-emerald-500">Overview</span></h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, {clerkUser?.firstName || 'User'}. Explore the latest opportunities tailored for you.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStatClick(stat.label)}
                  className="w-full text-left bg-white dark:bg-white/5 p-6 rounded-4xl border border-gray-100 dark:border-white/5 hover:border-emerald-500/30 transition-all group shadow-sm dark:shadow-none"
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

            <div className="relative">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Opportunities</h2>
                <button
                  onClick={() => navigate('/advertiser/matches')}
                  className="text-sm font-bold text-emerald-500 hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight size={16} />
                </button>
              </div>

              {!isApproved && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                      <Lock size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Unlock Opportunities</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[240px]">Complete your profile and wait for admin approval to access campaigns.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={cn("flex flex-col", !isApproved && "opacity-50 pointer-events-none")}>
                {isLoadingOpps ? (
                  <div className="flex flex-col items-center py-20">
                    <Loader2 size={40} className="text-emerald-500 animate-spin mb-4" />
                    <p className="text-sm font-bold text-gray-500">Fetching opportunities...</p>
                  </div>
                ) : opportunities.length > 0 ? (
                  opportunities.slice(0, 6).map((opp: any, idx: number) => {
                    const tags = [
                      ...(opp.deliverables || []),
                      ...(opp.platforms || []),
                      opp.category
                    ].filter(Boolean);

                    const applicantCount = Array.isArray(opp.applicants) ? opp.applicants.length : 0;
                    const proposalText = applicantCount < 5 ? "Less than 5" : applicantCount.toString();
                    const budgetAmount = typeof opp.budget === 'object' ? (opp.budget.amount || 0) : (opp.budget || 0);
                    const paymentType = opp.paymentType || 'Fixed-price';
                    const expLevel = opp.experienceLevel || 'Expert';
                    const locationText = opp.location || opp.requirements?.location || "Global";
                    
                    const timeAgo = opp.createdAt ? (() => {
                      const diff = Math.floor((new Date().getTime() - new Date(opp.createdAt).getTime()) / 1000);
                      if (diff < 60) return 'Just now';
                      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
                      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
                      return `${Math.floor(diff / 86400)} days ago`;
                    })() : 'Just now';

                    return (
                      <motion.div
                        key={opp._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="py-8 border-b border-gray-200 dark:border-gray-700/50 group"
                      >
                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                          <span className="font-bold">
                            Posted {timeAgo}
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="font-bold">
                            Proposals: {proposalText}
                          </span>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                          <div 
                            onClick={() => navigate(`/advertiser/matches/${opp._id}/apply`)}
                            className="cursor-pointer flex-1"
                          >
                            <h3 className="text-xl font-semibold text-[#1A1D1F] dark:text-white hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors line-clamp-2">
                              {opp.title}
                            </h3>
                          </div>
                          <button 
                            onClick={(e) => handleToggleSave(e, opp._id)}
                            className={cn(
                              "p-2 rounded-full transition-colors shrink-0",
                              isJobSaved(opp._id)
                                ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                                : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
                            )}
                          >
                            <Heart size={20} className={isJobSaved(opp._id) ? "fill-current" : ""} />
                          </button>
                        </div>

                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                          {paymentType} - {expLevel} - Est. Budget: ${budgetAmount.toLocaleString()}
                        </div>

                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-6 relative leading-relaxed">
                          <span className="line-clamp-3 md:line-clamp-4">
                            {opp.description}
                          </span>
                          <button onClick={() => navigate(`/advertiser/matches/${opp._id}/apply`)} className="text-emerald-500 hover:underline font-medium inline-block mt-1">
                            more
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {tags.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck size={16} className="text-blue-500 fill-blue-500/20" />
                            <span className="text-gray-900 dark:text-white">Payment verified</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <div className="flex text-yellow-500 gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className="fill-yellow-500" />
                              ))}
                            </div>
                          </div>

                          <div>$40K+ spent</div>

                          <div className="flex items-center gap-1.5">
                            <MapPin size={16} />
                            <span>{locationText}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Briefcase size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No opportunities yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Check back later for new brand campaigns.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </AdvertiserLayout>
  );
}
