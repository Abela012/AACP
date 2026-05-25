import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  ChevronDown,
  Target,
  Zap,
  Eye,
  ThumbsUp,
  MessageCircle,
  Clock,
  Loader2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useApiClient } from '@/src/api/apiClient';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { cn } from '@/src/shared/utils/cn';
import type { AnalyticsRecord } from '@/src/api/collaborationApi';
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
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

// ─── Platform Icons ──────────────────────────────────────────────────────────
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const platformConfig = {
  TikTok: { icon: <TikTokIcon />, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-100 dark:bg-white/10' },
  Instagram: { icon: <InstagramIcon />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  YouTube: { icon: <YouTubeIcon />, color: 'text-red-500', bg: 'bg-red-500/10' },
} as const;

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: AnalyticsRecord['status'] }> = ({ status }) => {
  const map = {
    pending: { label: 'Scraping…', icon: <Loader2 size={11} className="animate-spin" />, cls: 'bg-amber-500/10 text-amber-600' },
    completed: { label: 'Live', icon: <CheckCircle2 size={11} />, cls: 'bg-primary-blue/10 text-primary-blue' },
    failed: { label: 'Failed', icon: <XCircle size={11} />, cls: 'bg-red-500/10 text-red-500' },
  };
  const { label, icon, cls } = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full', cls)}>
      {icon}{label}
    </span>
  );
};

// ─── Post Row ──────────────────────────────────────────────────────────────
interface PostRowProps {
  record: AnalyticsRecord;
  onRefresh: (collaborationId: string, id: string) => void;
  refreshingId: string | null;
}
const PostRow: React.FC<PostRowProps> = ({ record, onRefresh, refreshingId }) => {
  const cfg = platformConfig[record.platform] ?? platformConfig.YouTube;
  const isRefreshing = refreshingId === record._id;

  return (
    <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: platform icon + URL */}
        <div className="flex items-center gap-4">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/10', cfg.bg, cfg.color)}>
            {cfg.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{record.platform} Post</p>
              <StatusBadge status={record.status} />
            </div>
            <a
              href={record.postUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary-blue hover:underline flex items-center gap-1"
            >
              {record.postUrl.length > 48 ? record.postUrl.slice(0, 48) + '…' : record.postUrl}
              <ExternalLink size={10} />
            </a>
            {record.notes && <p className="text-[11px] text-gray-400 mt-0.5 italic">"{record.notes}"</p>}
            {record.status === 'failed' && (
              <p className="text-[11px] text-red-400 mt-0.5 flex items-center gap-1">
                <AlertTriangle size={10} /> {record.errorMessage ?? 'Scraping failed'}
              </p>
            )}
          </div>
        </div>

        {/* Right: metrics + controls */}
        <div className="flex items-center gap-5 shrink-0">
          {record.status === 'completed' ? (
            <>
              <Stat label="Views"    value={record.metrics.views} />
              <Stat label="Likes"    value={record.metrics.likes} />
              <Stat label="Comments" value={record.metrics.comments} />
              <Stat label="Shares"   value={record.metrics.shares} />
            </>
          ) : record.status === 'pending' ? (
            <span className="text-xs text-gray-400 italic flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Fetching metrics…
            </span>
          ) : null}

          {/* Refresh button */}
          <button
            onClick={() => onRefresh(record.collaborationId, record._id)}
            disabled={isRefreshing || record.status === 'pending'}
            title="Refresh metrics"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-primary-blue transition-all disabled:opacity-40"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Last refreshed */}
      {record.status === 'completed' && (
        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
          <Clock size={10} />
          Updated {new Date(record.refreshedAt).toLocaleString()}
          {record.metrics.engagementRate !== undefined && (
            <> · <span className="text-primary-blue font-bold">{record.metrics.engagementRate}% eng.</span></>
          )}
          {record.metrics.duration && (
            <> · {Math.floor(record.metrics.duration / 60)}m {record.metrics.duration % 60}s</>
          )}
        </p>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">{label}</p>
    <p className="text-sm font-black text-gray-900 dark:text-white">{value?.toLocaleString() ?? '—'}</p>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const navigate = useNavigate();
  const api = useApiClient();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  // 1. Fetch all collaborations and aggregate their post analytics
  const { data: allAnalytics = [], isLoading: isLoadingAnalytics } = useQuery<AnalyticsRecord[]>({
    queryKey: ['allCollaborationsAnalytics', profile?._id],
    queryFn: async () => {
      if (!profile?._id) return [];
      const collabsRes = await api.get(`/collaborations/user/${profile._id}`);
      const collabs = collabsRes.data?.data || [];
      if (!collabs.length) return [];

      const promises = collabs.map((collab: any) =>
        api.get(`/collaborations/${collab._id}/analytics`)
          .then(res => res.data?.data || [])
          .catch(() => [])
      );

      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: !!profile?._id,
    refetchInterval: (query: any) => {
      const data = query?.state?.data;
      const hasPending = Array.isArray(data) && data.some((r: any) => r.status === 'pending');
      return hasPending ? 5000 : false;
    },
  });

  // 2. Fetch all collaborations to compute actual ad spend
  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations', 'user', profile?._id],
    queryFn: async () => {
      if (!profile?._id) return [];
      const res = await api.get(`/collaborations/user/${profile._id}`);
      return res.data?.data || [];
    },
    enabled: !!profile?._id,
  });

  // 3. Mutation for refreshing single post metrics
  const refreshMutation = useMutation({
    mutationFn: ({ collaborationId, analyticsId }: { collaborationId: string; analyticsId: string }) =>
      api.post(`/collaborations/${collaborationId}/analytics/${analyticsId}/refresh`).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCollaborationsAnalytics', profile?._id] });
      toast.success('Metrics refresh queued!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || 'Refresh failed');
    }
  });

  const handleRefresh = async (collaborationId: string, analyticsId: string) => {
    setRefreshingId(analyticsId);
    try {
      await refreshMutation.mutateAsync({ collaborationId, analyticsId });
    } finally {
      setRefreshingId(null);
    }
  };

  // ─── Analytics Processing ──────────────────────────────────────────────────
  const completed = allAnalytics.filter(r => r.status === 'completed');
  const totalViews    = completed.reduce((sum, r) => sum + r.metrics.views, 0);
  const totalLikes    = completed.reduce((sum, r) => sum + r.metrics.likes, 0);
  const totalComments = completed.reduce((sum, r) => sum + r.metrics.comments, 0);
  const totalShares   = completed.reduce((sum, r) => sum + r.metrics.shares, 0);
  const totalInteractions = totalLikes + totalComments + totalShares;

  const totalEngagement = totalViews > 0
    ? ((totalInteractions) / totalViews * 100)
    : 0;

  // Actual budget spent
  const totalBudgetSpent = collaborations.reduce((sum: number, c: any) => sum + (c.agreedBudget?.amount || 0), 0);
  const costPerView = totalViews > 0 ? (totalBudgetSpent / totalViews) : 0;

  // Platform views distribution
  const platformCounts = completed.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] || 0) + r.metrics.views;
    return acc;
  }, {} as Record<string, number>);

  const platformTotalViews = Object.values(platformCounts).reduce((a, b) => a + b, 0) || 1;

  const platformData = [
    { name: 'TikTok', value: Math.round(((platformCounts['TikTok'] || 0) / platformTotalViews) * 100), color: '#0070BB' },
    { name: 'Instagram', value: Math.round(((platformCounts['Instagram'] || 0) / platformTotalViews) * 100), color: '#ec4899' },
    { name: 'YouTube', value: Math.round(((platformCounts['YouTube'] || 0) / platformTotalViews) * 100), color: '#ef4444' },
  ];

  // Map reach vs engagement chart data dynamically
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sorted = [...completed].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    if (sorted.length === 0) {
      return days.map(name => ({ name, reach: 0, engagement: 0 }));
    }

    const displayData = sorted.slice(-7).map((r, idx) => {
      const dayName = days[idx % 7];
      return {
        name: dayName,
        reach: r.metrics.views,
        engagement: r.metrics.engagementRate || 0
      };
    });

    while (displayData.length < 7) {
      displayData.push({
        name: days[displayData.length],
        reach: 0,
        engagement: 0
      });
    }

    return displayData;
  }, [completed]);

  const stats = [
    { 
      label: 'Total Reach', 
      value: totalViews.toLocaleString(), 
      trend: `${completed.length} Live Post${completed.length !== 1 ? 's' : ''}`, 
      trendType: 'up', 
      icon: Users, 
      color: 'text-primary-blue', 
      bgColor: 'bg-[#E6F3FB]' 
    },
    { 
      label: 'Avg. Engagement', 
      value: `${totalEngagement.toFixed(2)}%`, 
      trend: totalEngagement > 3.0 ? 'Optimal' : 'Active', 
      trendType: 'up', 
      icon: Zap, 
      iconColor: 'text-amber-500', 
      bgColor: 'bg-amber-50' 
    },
    { 
      label: 'Total Spent', 
      value: totalBudgetSpent > 0 ? `${totalBudgetSpent.toLocaleString()} ETB` : '0 ETB', 
      trend: 'Escrow Secured', 
      trendType: 'up', 
      icon: DollarSign, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50' 
    },
    { 
      label: 'ROI', 
      value: costPerView > 0 ? `${costPerView.toFixed(3)} cpv` : '—', 
      trend: 'Cost Per View', 
      trendType: 'neutral', 
      icon: Target, 
      color: 'text-primary-blue', 
      bgColor: 'bg-[#E6F3FB]' 
    },
  ];

  return (
    <BusinessLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Campaign Performance Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time aggregate performance tracking across all active influencer integrations.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 px-6 py-3 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
              <Calendar size={18} />
              Last 30 Days
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Loading / Empty States */}
        {isLoadingAnalytics ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary-blue mb-4" />
            <p className="text-sm font-semibold text-gray-400">Assembling campaign data…</p>
          </div>
        ) : allAnalytics.length === 0 ? (
          /* Elegant Empty state */
          <div className="text-center py-24 bg-gray-50 dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5">
            <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BarChart3 className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">No Tracked Content Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 mb-8">
              Once creators submit their live TikTok, Instagram, or YouTube links inside workspaces, their live metrics will pool here automatically.
            </p>
            <button
              onClick={() => navigate('/collaborations')}
              className="px-8 py-3 bg-primary-blue text-white rounded-xl font-bold hover:bg-primary-blue transition-all shadow-xl shadow-primary-blue/20"
            >
              Go to Workspace
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                      <stat.icon className={cn("w-5 h-5", stat.color || stat.iconColor)} />
                    </div>
                    <span className="text-[10px] font-black text-primary-blue bg-primary-blue/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reach vs Engagement Line Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Reach vs Engagement</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary-blue rounded-full" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#a7f3d0] rounded-full" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Engagement</span>
                    </div>
                  </div>
                </div>
                <div className="h-[300px] w-full relative">
                  {completed.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <p className="text-sm font-bold text-gray-400 dark:text-gray-600">No data available for this period</p>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height={300} minWidth={0} debounce={50}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0070BB" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0070BB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-white/5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="reach" stroke="#0070BB" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                      <Area type="monotone" dataKey="engagement" stroke="#a7f3d0" strokeWidth={3} fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Platform Distribution Bar Chart */}
              <div className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8">Platform Distribution</h3>
                <div className="h-[200px] w-full mb-8">
                  {completed.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-gray-400 font-bold">No active reach logs</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200} minWidth={0} debounce={50}>
                      <BarChart data={platformData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#9ca3af'}} width={70} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="space-y-4">
                  {platformData.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{isNaN(p.value) ? 0 : p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Published Content & ROI Summary section matching requested screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
              {/* Published Content List Card */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Published Content</h3>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                    {allAnalytics.length} Total Post{allAnalytics.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-4">
                  {allAnalytics.map(record => (
                    <PostRow 
                      key={record._id} 
                      record={record} 
                      onRefresh={handleRefresh} 
                      refreshingId={refreshingId} 
                    />
                  ))}
                </div>
              </div>

              {/* ROI Overview Sidebar Card */}
              <div className="bg-primary-blue rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-blue/20 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Target size={20} /> ROI Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Total Reach</p>
                      <p className="text-2xl font-black">{totalViews.toLocaleString()} <span className="text-xs font-bold opacity-70">Views</span></p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Total Interactions</p>
                      <p className="text-2xl font-black">{totalInteractions.toLocaleString()} <span className="text-xs font-bold opacity-70">Actions</span></p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Engagement Rate</p>
                      <p className="text-2xl font-black">{totalEngagement.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>

                {allAnalytics.some(r => r.status === 'pending') && (
                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-2 text-xs text-white/80">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Live scraping in progress for active submissions…</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </BusinessLayout>
  );
}
