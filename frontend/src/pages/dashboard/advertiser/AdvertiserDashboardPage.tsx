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
  X
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
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Dashboard <span className="text-emerald-500">Overview</span></h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, {clerkUser?.firstName || 'User'}. Explore the latest opportunities tailored for you.</p>
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

              <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", !isApproved && "opacity-50 pointer-events-none")}>
                {isLoadingOpps ? (
                  <div className="col-span-full py-20 text-center">
                    <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Fetching opportunities...</p>
                  </div>
                ) : opportunities.length > 0 ? (
                  opportunities.slice(0, 6).map((o: any) => (
                    <motion.div 
                      key={o._id}
                      whileHover={{ y: -5 }}
                      onClick={() => navigate(`/advertiser/matches`)}
                      className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden group cursor-pointer"
                    >
                      <div className="h-48 relative">
                        {o.businessOwner?.profilePicture ? (
                          <img 
                            src={o.businessOwner.profilePicture} 
                            alt={o.businessOwner.fullName} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-400">
                            <Building2 size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                          {o.category || 'Campaign'}
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{o.businessOwner?.fullName || 'Brand'}</h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest line-clamp-1">{o.title}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                              <DollarSign size={16} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Budget</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                ${(typeof o.budget === 'object' ? (o.budget.amount || 0) : (o.budget || 0)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Clock size={16} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Deadline</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {o.deadline ? new Date(o.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Flexible'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button 
                          className="w-full py-4 rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                        >
                          View Details <ArrowRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
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
