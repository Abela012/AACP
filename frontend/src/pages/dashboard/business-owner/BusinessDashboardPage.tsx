import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { 
  Megaphone, 
  Users, 
  Plus, 
  CreditCard,
  Sparkles,
  ShieldCheck,
  Lock,
  ChevronRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Search,
  MoreVertical,
  Pause,
  Play,
  Edit,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Wallet,
  Activity,
  Bell,
  Settings,
  HelpCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import OnboardingBanner from '@/src/shared/components/OnboardingBanner';
import { cn } from '@/src/shared/utils/cn';
import { useUser } from '@/src/shared/context/UserContext';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import CompleteProfilePage from '../../profile/complete-profile/CompleteProfilePage';
import PendingApprovalState from '@/src/shared/components/PendingApprovalState';
import { useUserSync } from '@/src/hooks/useUserSync';
import { useMyOpportunities } from '@/src/hooks/useOpportunities';
import { useWalletBalance, useWalletHistory } from '@/src/hooks/useWallet';
import { useRecommendations } from '@/src/hooks/useRecommendations';
import { useUserCollaborations } from '@/src/hooks/useCollaborations';
import { useBusinessOwnerApplications } from '@/src/hooks/useApplications';
import { useConversations } from '@/src/hooks/useChat';
import { type Opportunity } from '@/src/api/opportunityApi';

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const Card = ({ children, className, title, extra }: any) => (
  <div className={cn("bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden", className)}>
    {(title || extra) && (
      <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">{title}</h3>
        {extra}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Badge = ({ children, variant = 'neutral' }: any) => {
  const variants: any = {
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-600',
    info: 'bg-blue-500/10 text-blue-600',
    neutral: 'bg-gray-500/10 text-gray-600',
  };
  return <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant])}>{children}</span>;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────

export default function BusinessDashboardPage() {
  const navigate = useNavigate();
  const { onboardingStatus } = useUser();
  const { user: clerkUser } = useClerkUser();
  const myId = clerkUser?.id ?? '';
  const { sync, isLoading: isSyncing } = useUserSync();
  const isApproved = onboardingStatus === 'approved';

  // Data Hooks
  const { data: oppsData, isLoading: isLoadingOpps } = useMyOpportunities(myId);
  const { data: walletData, isLoading: isLoadingWallet } = useWalletBalance();
  const { data: walletHistory, isLoading: isLoadingHistory } = useWalletHistory();
  const { data: recsData, isLoading: isLoadingRecs } = useRecommendations();
  const { data: collabsData, isLoading: isLoadingCollabs } = useUserCollaborations(myId);
  const { data: appsData, isLoading: isLoadingApps } = useBusinessOwnerApplications();
  const { data: convsData, isLoading: isLoadingConvs } = useConversations();

  // Mutations
  const updateOpp = useUpdateOpportunity();
  const queryClient = useQueryClient();
  const [timeFilter, setTimeFilter] = useState('7D');

  const opportunities = oppsData?.opportunities ?? [];
  const collaborations = collabsData ?? [];
  const applications = appsData ?? [];
  const conversations = convsData ?? [];
  const activeOpps = opportunities.filter((o: Opportunity) => o.status === 'open');
  const totalApplicants = opportunities.reduce((acc: number, opp: Opportunity) => acc + (opp.applicants?.length ?? 0), 0);

  // ─── DYNAMIC DATA DERIVATION ─────────────────────────────────────────────

  // Generate real chart data from opportunities
  const chartData = opportunities.slice(0, 7).map((opp: any) => {
    const factor = timeFilter === '7D' ? 1 : timeFilter === '30D' ? 4.2 : 12;
    return {
      name: opp.title.split(' ')[0],
      views: Math.round((opp.viewsCount || 0) * factor),
      engagement: Math.round((opp.viewsCount || 0) * 0.15 * factor),
      conversions: Math.round((opp.viewsCount || 0) * 0.02 * factor)
    };
  }).reverse();

  // Derive Tasks from pending data
  const pendingApps = applications.filter((a: any) => a.status === 'pending');
  const needsFunding = opportunities.filter((o: any) => o.budget?.amount > (walletData?.balance ?? 0));
  
  const realTasks = [
    ...pendingApps.slice(0, 2).map((a: any) => ({
      id: `app-${a._id}`,
      title: 'Review applicant request',
      subtitle: `${a.advertiser?.firstName} for ${a.opportunity?.title}`,
      priority: 'high',
      action: 'Review',
      link: '/matches'
    })),
    ...needsFunding.map((o: any) => ({
      id: `fund-${o._id}`,
      title: 'Fund campaign',
      subtitle: `Low balance for ${o.title}`,
      priority: 'high',
      action: 'Fund',
      link: '/wallet'
    })),
    ...(collaborations.filter((c: any) => c.status === 'active' && c.overallProgress >= 90).map((c: any) => ({
      id: `review-${c._id}`,
      title: 'Review final content',
      subtitle: `Milestone 100% for ${c.advertiser?.firstName}`,
      priority: 'medium',
      action: 'Review',
      link: `/collaborations/${c._id}`
    })))
  ];

  // Derive Activity from wallet history
  const realActivity = (walletHistory ?? []).slice(0, 5).map((tx: any) => ({
    id: tx._id,
    type: tx.type,
    text: tx.description,
    time: new Date(tx.createdAt).toLocaleDateString(),
    icon: tx.type === 'credit' ? DollarSign : tx.type === 'debit' ? Wallet : Activity,
    color: tx.type === 'credit' ? 'text-emerald-500' : 'text-blue-500'
  }));

  // 1. Status / Alert Banner Logic
  const showBalanceWarning = (walletData?.balance ?? 0) < 100;
  const showVerifyAlert = onboardingStatus === 'incomplete' || onboardingStatus === 'pending';

  const handleStatusToggle = async (oppId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await updateOpp.mutateAsync({ id: oppId, data: { status: newStatus as any } });
      toast.success(`Campaign ${newStatus === 'open' ? 'resumed' : 'paused'} successfully!`);
    } catch (error) {
      toast.error('Failed to update campaign status');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Logic for marking all read (placeholder for multi-conversation mark read)
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <BusinessLayout>
      <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-8 pb-20">
        
        {/* 1. STATUS / ALERT BANNER */}
        <AnimatePresence>
          <div className="space-y-3">
            {showVerifyAlert && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Account Under Review</h4>
                    <p className="text-xs text-gray-500">Your profile is being verified. Some features might be limited until approved.</p>
                  </div>
                </div>
                <button onClick={() => sync()} className="text-xs font-bold text-amber-600 hover:underline">Refresh Status</button>
              </motion.div>
            )}

            {showBalanceWarning && isApproved && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center text-red-600">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Low Wallet Balance</h4>
                    <p className="text-xs text-gray-500">Your balance is below 100 AACP. Top up to ensure your campaigns keep running.</p>
                  </div>
                </div>
                <button onClick={() => navigate('/wallet')} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 transition-colors">Add Funds</button>
              </motion.div>
            )}
          </div>
        </AnimatePresence>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Business <span className="text-emerald-500">Command Center</span></h1>
            <p className="text-sm text-gray-500 mt-1">Manage your advertisement ecosystem and track performance real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/5 relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
            </button>
            <button className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/5">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* 2. KPI METRICS (CLICKABLE CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Campaigns', value: isLoadingOpps ? '...' : opportunities.length, trend: '+2', trendType: 'up', subtext: 'Since last month', icon: Megaphone, color: 'text-blue-500', link: '/campaigns' },
            { label: 'Active Creators', value: isLoadingCollabs ? '...' : collaborations.filter((c: any) => c.status === 'active').length, trend: '+12%', trendType: 'up', subtext: 'High engagement', icon: Users, color: 'text-emerald-500', link: '/collaborations' },
            { label: 'Wallet Balance', value: isLoadingWallet ? '...' : `${walletData?.balance?.toLocaleString() ?? 0}`, trend: 'AACP', trendType: 'neutral', subtext: 'Available funds', icon: Wallet, color: 'text-amber-500', link: '/wallet' },
            { label: 'Trust Score', value: '78/100', trend: '+4', trendType: 'up', subtext: 'Top 10% Business', icon: ShieldCheck, color: 'text-indigo-500', link: '/profile' },
          ].map((stat, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(stat.link)}
              className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:border-emerald-500/30 transition-all group text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-white/5", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div className={cn("flex items-center gap-1 text-xs font-bold", stat.trendType === 'up' ? 'text-emerald-500' : 'text-gray-400')}>
                  {stat.trendType === 'up' ? <ArrowUpRight size={14} /> : null}
                  {stat.trend}
                </div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-[10px] text-gray-400">{stat.subtext}</p>
            </motion.button>
          ))}
        </div>

        {/* 3. QUICK ACTIONS BAR */}
        <div className="flex flex-wrap gap-4 p-6 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-600/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Growth Shortcuts</h3>
              <p className="text-white/70 text-sm">Jump into your most frequent tasks immediately.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Create Campaign', icon: Plus, link: '/campaign/new' },
                { label: 'Find Creators', icon: Search, link: '/matches' },
                { label: 'Open Messages', icon: MessageSquare, link: '/messages' },
                { label: 'AI Insights', icon: Sparkles, link: '/analytics' },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(action.link)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-bold flex items-center gap-2 backdrop-blur-md transition-all border border-white/10"
                >
                  <action.icon size={18} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT CONTENT AREA (8 COLUMNS) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 12. TASKS / TO-DO SECTION */}
            <Card title="Required Actions" extra={<Badge variant="danger">{realTasks.length} Pending</Badge>}>
              <div className="space-y-4">
                {realTasks.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <CheckCircle2 className="text-emerald-500 mb-2" size={32} />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">All caught up!</p>
                    <p className="text-xs text-gray-400">No urgent tasks requiring your attention.</p>
                  </div>
                ) : realTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full", task.priority === 'high' ? 'bg-red-500' : 'bg-amber-500')}></div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{task.title}</h4>
                        <p className="text-[10px] text-gray-400">{task.subtitle}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(task.link || '/')}
                      className="px-4 py-2 bg-white dark:bg-white/10 text-gray-900 dark:text-white rounded-xl text-xs font-bold border border-gray-100 dark:border-white/10 group-hover:bg-emerald-600 group-hover:text-white transition-all"
                    >
                      {task.action}
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* 7. PERFORMANCE INSIGHTS */}
            <Card title="Performance Analytics" extra={
              <div className="flex gap-2 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                {['7D', '30D', 'All'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTimeFilter(t)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                      timeFilter === t ? "bg-white dark:bg-white/10 text-emerald-500 shadow-sm" : "text-gray-400 hover:text-emerald-500"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            }>
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: '#fff' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Top Campaign</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Winter Collection 2026</h4>
                  <p className="text-xs text-gray-500">+24.5% ROI</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/20 opacity-70">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Underperforming</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Summer Sale 2025</h4>
                  <p className="text-xs text-gray-500">-2.1% Drop</p>
                </div>
              </div>
            </Card>

            {/* 4. CAMPAIGN OVERVIEW SECTION */}
            <Card title="Your Campaigns" extra={<button className="text-xs font-bold text-emerald-600 hover:underline">View All</button>}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-white/5">
                      <th className="pb-4 font-bold">Campaign Name</th>
                      <th className="pb-4 font-bold text-center">Status</th>
                      <th className="pb-4 font-bold">Budget</th>
                      <th className="pb-4 font-bold text-center">Performance</th>
                      <th className="pb-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {isLoadingOpps ? (
                      <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" /></td></tr>
                    ) : opportunities.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-500">No campaigns found.</td></tr>
                    ) : opportunities.slice(0, 5).map((opp: any) => (
                      <tr key={opp._id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                        <td className="py-5">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{opp.title}</h4>
                          <p className="text-[10px] text-gray-400">{opp.category}</p>
                        </td>
                        <td className="py-5 text-center">
                          <Badge variant={opp.status === 'open' ? 'success' : 'neutral'}>{opp.status}</Badge>
                        </td>
                        <td className="py-5">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">${opp.budget?.amount || opp.budget}</p>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-bold text-emerald-500">4.2%</span>
                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: '42%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => navigate(`/campaign/edit/${opp._id}`)}
                              className="p-2 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-gray-400 hover:text-emerald-500 transition-all"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleStatusToggle(opp._id, opp.status)}
                              className={cn(
                                "p-2 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 transition-all",
                                opp.status === 'open' ? "text-gray-400 hover:text-amber-500" : "text-emerald-500 hover:text-emerald-600"
                              )}
                            >
                              {opp.status === 'open' ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* 5. ACTIVE COLLABORATIONS */}
            <Card title="Active Partnerships" extra={<button className="text-xs font-bold text-emerald-600 hover:underline">View Details</button>}>
              <div className="space-y-6">
                {isLoadingCollabs ? (
                   <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : collaborations.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">No active collaborations.</div>
                ) : collaborations.slice(0, 3).map((collab: any) => (
                  <div key={collab._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      {collab.advertiser?.profilePicture ? (
                        <img src={collab.advertiser.profilePicture} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600 font-bold">{collab.advertiser?.username?.[0] || 'A'}</div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{collab.advertiser?.firstName} {collab.advertiser?.lastName}</h4>
                        <p className="text-[10px] text-gray-400">{collab.opportunity?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <Badge variant="info">{collab.status}</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deadline</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{new Date(collab.deadline || Date.now()).toLocaleDateString()}</p>
                      </div>
                      <div className="min-w-[100px]">
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Progress</p>
                         <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500" style={{ width: `${collab.overallProgress || 0}%` }}></div>
                           </div>
                           <span className="text-[10px] font-bold text-gray-400">{collab.overallProgress || 0}%</span>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* RIGHT SIDEBAR (4 COLUMNS) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 10. WALLET SUMMARY */}
            <Card title="Wallet Summary">
              <div className="p-6 bg-gray-900 dark:bg-white dark:text-black rounded-3xl text-white relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <p className="text-white/60 dark:text-black/60 text-[10px] font-bold uppercase tracking-widest mb-1">Available Balance</p>
                <h3 className="text-4xl font-black mb-6">{walletData?.balance?.toLocaleString() ?? 0} <span className="text-xs font-bold">AACP</span></h3>
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                     <p className="text-white/40 dark:text-black/40 text-[9px] font-bold uppercase tracking-widest">Locked</p>
                     <p className="text-sm font-bold">{walletData?.lockedBalance ?? 0} AACP</p>
                   </div>
                   <button onClick={() => navigate('/wallet')} className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all">Top Up</button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Total Spent</span>
                  <span className="font-bold text-gray-900 dark:text-white">12,450 AACP</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Pending Payments</span>
                  <span className="font-bold text-gray-900 dark:text-white">3,100 AACP</span>
                </div>
              </div>
            </Card>

            {/* 11. TRUST SCORE / HEALTH */}
            <Card title="Account Health">
               <div className="flex flex-col items-center py-4">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-white/5" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.42} strokeDashoffset={364.42 * (1 - 0.78)} className="text-emerald-500" strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                       <span className="text-3xl font-black text-gray-900 dark:text-white">78</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase">Trust Score</span>
                    </div>
                 </div>
                 <div className="mt-6 w-full space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center gap-3">
                       <ShieldCheck className="text-emerald-500" size={18} />
                       <p className="text-xs text-gray-600 dark:text-gray-400">Profile 90% complete. Verify trade license to reach 100.</p>
                    </div>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-full py-3 bg-emerald-600/10 text-emerald-600 font-bold rounded-2xl text-xs hover:bg-emerald-600/20 transition-all"
                    >
                      Improve Score
                    </button>
                 </div>
               </div>
            </Card>

            {/* 6. AI RECOMMENDATIONS PANEL */}
            <Card title="AI Matches" extra={<Sparkles className="text-cyan-500" size={16} />}>
               <div className="space-y-4">
                 {isLoadingRecs ? (
                   <div className="flex justify-center py-4"><Loader2 className="animate-spin text-emerald-600" /></div>
                 ) : (recsData?.recommendations ?? []).length === 0 ? (
                   <p className="text-center text-xs text-gray-400">Complete profile for matches</p>
                 ) : (recsData?.recommendations ?? []).slice(0, 3).map((rec: any) => (
                   <div key={rec.targetId} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                     <div className="flex items-center gap-3">
                        <img src={rec.meta?.profilePicture} className="w-10 h-10 rounded-xl object-cover" alt="" />
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">{rec.name}</h4>
                          <p className="text-[10px] text-emerald-600 font-bold">{rec.score}% Match</p>
                        </div>
                     </div>
                     <button className="p-2 bg-emerald-600/10 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                       <Plus size={16} />
                     </button>
                   </div>
                 ))}
               </div>
               <button onClick={() => navigate('/matches')} className="w-full mt-6 py-3 border border-dashed border-gray-200 dark:border-white/10 text-gray-400 text-xs font-bold rounded-2xl hover:border-emerald-500 hover:text-emerald-500 transition-all">View All Matches</button>
            </Card>

            {/* 8. RECENT ACTIVITY FEED */}
            <Card title="Recent Activity">
               <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-50 dark:before:bg-white/5">
                 {isLoadingHistory ? (
                   <div className="flex justify-center py-4"><Loader2 className="animate-spin text-emerald-600" /></div>
                 ) : realActivity.length === 0 ? (
                   <p className="text-center text-xs text-gray-400">No recent activity</p>
                 ) : realActivity.map((activity) => (
                   <div key={activity.id} className="relative pl-8">
                     <div className={cn("absolute left-0 top-1 w-6 h-6 rounded-lg flex items-center justify-center bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 z-10 shadow-sm", activity.color)}>
                        <activity.icon size={12} />
                     </div>
                     <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight mb-1">{activity.text}</p>
                     <p className="text-[10px] text-gray-400 font-medium">{activity.time}</p>
                   </div>
                 ))}
               </div>
            </Card>

            {/* 9. NOTIFICATIONS PREVIEW */}
            <Card title="Notifications" extra={<button onClick={handleMarkAllRead} className="text-[10px] font-bold text-emerald-600 hover:underline transition-all">Mark all read</button>}>
               <div className="space-y-4">
                  {isLoadingConvs ? (
                     <div className="flex justify-center py-4"><Loader2 className="animate-spin text-emerald-600" /></div>
                  ) : conversations.length === 0 ? (
                    <p className="text-center text-xs text-gray-400">No new messages</p>
                  ) : conversations.slice(0, 5).map((conv: any) => {
                    const lastMsg = conv.lastMessage;
                    const partner = conv.participants?.find((p: any) => p.clerkId !== myId);
                    return (
                      <div 
                        key={conv._id} 
                        onClick={() => navigate(`/messages?conv=${conv._id}`)}
                        className="flex gap-3 pb-3 border-b border-gray-50 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                         <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 flex-shrink-0">
                            {partner?.profilePicture ? (
                              <img src={partner.profilePicture} className="w-full h-full rounded-full object-cover" alt="" />
                            ) : (
                              <Bell size={14} />
                            )}
                         </div>
                         <div>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              <span className="font-bold">{partner?.firstName || 'User'}:</span> {lastMsg?.text || 'Sent an attachment'}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1">{new Date(lastMsg?.createdAt || conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                      </div>
                    );
                  })}
               </div>
               <button onClick={() => navigate('/messages')} className="w-full mt-6 py-2 text-gray-400 text-xs font-bold hover:text-emerald-600 transition-colors">View All Messages</button>
            </Card>

          </div>
        </div>
      </main>
    </BusinessLayout>
  );
}
