import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ChevronDown,
  Target,
  Zap,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Loader2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Briefcase
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
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';

// ─── Platform Icons ────────────────────────────────────────────────────────────
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const platformConfig = {
  TikTok: {
    icon: <TikTokIcon />,
    color: 'text-gray-900 dark:text-white',
    bg: 'bg-gray-100 dark:bg-white/10',
    accent: '#0070BB',
    gradientFrom: '#0070BB22',
  },
  Instagram: {
    icon: <InstagramIcon />,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    accent: '#ec4899',
    gradientFrom: '#ec489922',
  },
  YouTube: {
    icon: <YouTubeIcon />,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    accent: '#ef4444',
    gradientFrom: '#ef444422',
  },
} as const;

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: AnalyticsRecord['status'] }> = ({ status }) => {
  const map = {
    pending: { label: 'Processing…', icon: <Loader2 size={10} className="animate-spin" />, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    completed: { label: 'Live Data', icon: <CheckCircle2 size={10} />, cls: 'bg-primary-blue/10 text-primary-blue' },
    failed: { label: 'Failed', icon: <XCircle size={10} />, cls: 'bg-red-500/10 text-red-500' },
  };
  const { label, icon, cls } = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full', cls)}>
      {icon}{label}
    </span>
  );
};

// ─── Metric Chip ───────────────────────────────────────────────────────────────
const MetricChip: React.FC<{ icon: React.ReactNode; label: string; value: number; color?: string }> = ({ icon, label, value, color }) => (
  <div className="flex flex-col items-center text-center min-w-[52px]">
    <span className={cn("mb-0.5", color || "text-gray-400 dark:text-gray-500")}>{icon}</span>
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-black text-gray-900 dark:text-white">{value?.toLocaleString() ?? '—'}</p>
  </div>
);

// ─── Post Card ─────────────────────────────────────────────────────────────────
interface PostCardProps {
  record: AnalyticsRecord;
  onRefresh: (collaborationId: string, id: string) => void;
  refreshingId: string | null;
}

const PostCard: React.FC<PostCardProps> = ({ record, onRefresh, refreshingId }) => {
  const cfg = platformConfig[record.platform] ?? platformConfig.YouTube;
  const isRefreshing = refreshingId === record._id;
  const engRate = record.metrics.engagementRate ?? (
    record.metrics.views > 0
      ? ((record.metrics.likes + record.metrics.comments + record.metrics.shares) / record.metrics.views) * 100
      : 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0d0d0d] rounded-[1.5rem] border border-gray-100 dark:border-white/5 overflow-hidden hover:border-primary-blue/20 dark:hover:border-primary-blue/10 transition-all group"
    >
      {/* Top bar accent */}
      <div className="h-1 w-full" style={{ backgroundColor: cfg.accent }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/10', cfg.bg, cfg.color)}>
              {cfg.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-black text-gray-900 dark:text-white">{record.platform} Post</p>
                <StatusBadge status={record.status} />
              </div>
              <a
                href={record.postUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary-blue hover:underline flex items-center gap-1 truncate max-w-[260px]"
              >
                {record.postUrl.length > 52 ? record.postUrl.slice(0, 52) + '…' : record.postUrl}
                <ExternalLink size={9} />
              </a>
              {record.notes && (
                <p className="text-[10px] text-gray-400 mt-0.5 italic truncate max-w-[240px]">"{record.notes}"</p>
              )}
              {record.status === 'failed' && (
                <p className="text-[10px] text-red-400 mt-0.5 flex items-center gap-1">
                  <AlertTriangle size={9} /> {record.errorMessage ?? 'Scraping failed'}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onRefresh(record.collaborationId, record._id)}
            disabled={isRefreshing || record.status === 'pending'}
            title="Refresh metrics"
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-primary-blue transition-all disabled:opacity-40 shrink-0"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Metrics row */}
        {record.status === 'completed' ? (
          <>
            <div className="grid grid-cols-4 gap-2 bg-gray-50/70 dark:bg-white/[0.03] rounded-2xl p-4 border border-gray-100 dark:border-white/5">
              <MetricChip icon={<Eye size={12} />} label="Views" value={record.metrics.views} color="text-primary-blue" />
              <MetricChip icon={<Heart size={12} />} label="Likes" value={record.metrics.likes} color="text-pink-500" />
              <MetricChip icon={<MessageCircle size={12} />} label="Comments" value={record.metrics.comments} color="text-amber-500" />
              <MetricChip icon={<Share2 size={12} />} label="Shares" value={record.metrics.shares} color="text-cyan-500" />
            </div>

            {/* Engagement bar */}
            <div className="mt-3 flex items-center gap-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 whitespace-nowrap">
                Engagement
              </p>
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(engRate * 10, 100)}%`, backgroundColor: cfg.accent }}
                />
              </div>
              <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {engRate.toFixed(1)}%
              </span>
            </div>

            <p className="text-[9px] text-gray-400 mt-2.5 flex items-center gap-1">
              <Clock size={9} />
              Refreshed {new Date(record.refreshedAt).toLocaleString()}
              {record.metrics.duration && (
                <> · {Math.floor(record.metrics.duration / 60)}m {record.metrics.duration % 60}s</>
              )}
            </p>
          </>
        ) : record.status === 'pending' ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 italic py-3 pl-1">
            <Loader2 size={12} className="animate-spin" />
            Fetching live metrics from {record.platform}…
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdvertiserAnalyticsPage() {
  const navigate = useNavigate();
  const api = useApiClient();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<'All' | 'TikTok' | 'Instagram' | 'YouTube'>('All');

  // 1. Fetch all collaborations, then pull analytics per collaboration
  const { data: allAnalytics = [], isLoading: isLoadingAnalytics } = useQuery<AnalyticsRecord[]>({
    queryKey: ['advertiserAnalytics', profile?._id],
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

  // 2. Fetch collaborations for earnings
  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations', 'advertiser', profile?._id],
    queryFn: async () => {
      if (!profile?._id) return [];
      const res = await api.get(`/collaborations/user/${profile._id}`);
      return res.data?.data || [];
    },
    enabled: !!profile?._id,
  });

  // 3. Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: ({ collaborationId, analyticsId }: { collaborationId: string; analyticsId: string }) =>
      api.post(`/collaborations/${collaborationId}/analytics/${analyticsId}/refresh`).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiserAnalytics', profile?._id] });
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

  // ─── Analytics Aggregation ─────────────────────────────────────────────────
  const completed = allAnalytics.filter(r => r.status === 'completed');

  const totalViews    = completed.reduce((s, r) => s + r.metrics.views, 0);
  const totalLikes    = completed.reduce((s, r) => s + r.metrics.likes, 0);
  const totalComments = completed.reduce((s, r) => s + r.metrics.comments, 0);
  const totalShares   = completed.reduce((s, r) => s + r.metrics.shares, 0);
  const totalInteractions = totalLikes + totalComments + totalShares;
  const avgEngagement = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;

  const totalEarnings = collaborations.reduce((s: number, c: any) => s + (c.agreedBudget?.amount || 0), 0);

  const platformCounts = completed.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] || 0) + r.metrics.views;
    return acc;
  }, {} as Record<string, number>);

  const platformTotal = Object.values(platformCounts).reduce((a, b) => a + b, 0) || 1;
  const platformData = [
    { name: 'TikTok', value: Math.round(((platformCounts['TikTok'] || 0) / platformTotal) * 100), color: '#0070BB' },
    { name: 'Instagram', value: Math.round(((platformCounts['Instagram'] || 0) / platformTotal) * 100), color: '#ec4899' },
    { name: 'YouTube', value: Math.round(((platformCounts['YouTube'] || 0) / platformTotal) * 100), color: '#ef4444' },
  ];

  // Chart data – last 7 completed posts mapped by day
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sorted = [...completed].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (!sorted.length) return days.map(name => ({ name, views: 0, engagement: 0 }));

    const slice = sorted.slice(-7).map((r, i) => ({
      name: days[i % 7],
      views: r.metrics.views,
      engagement: parseFloat((r.metrics.engagementRate ?? 0).toFixed(2))
    }));

    while (slice.length < 7) slice.push({ name: days[slice.length], views: 0, engagement: 0 });
    return slice;
  }, [completed]);

  // Filter posts by platform
  const filteredPosts = platformFilter === 'All' ? allAnalytics : allAnalytics.filter(r => r.platform === platformFilter);

  const statCards = [
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      badge: `${completed.length} Live Post${completed.length !== 1 ? 's' : ''}`,
      icon: Eye,
      color: 'text-primary-blue',
      bg: 'bg-[#E6F3FB] dark:bg-primary-blue/10',
      trend: 'up' as const,
    },
    {
      label: 'Avg. Engagement',
      value: `${avgEngagement.toFixed(2)}%`,
      badge: avgEngagement > 3 ? '🔥 Excellent' : 'Active',
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      trend: 'up' as const,
    },
    {
      label: 'Total Earnings',
      value: totalEarnings > 0 ? `${totalEarnings.toLocaleString()} ETB` : '0 ETB',
      badge: 'Escrow Secured',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      trend: 'up' as const,
    },
    {
      label: 'Total Interactions',
      value: totalInteractions.toLocaleString(),
      badge: `${totalLikes.toLocaleString()} Likes`,
      icon: Heart,
      color: 'text-pink-500',
      bg: 'bg-pink-50 dark:bg-pink-500/10',
      trend: totalInteractions > 0 ? ('up' as const) : ('neutral' as const),
    },
  ];

  return (
    <AdvertiserLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Creator Insights</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Real-time performance tracking for every post you've submitted across active campaigns.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <Calendar size={14} className="text-primary-blue" />
              All Time
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingAnalytics ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 animate-spin text-primary-blue mb-4" />
            <p className="text-sm font-semibold text-gray-400">Assembling your creator data…</p>
          </div>
        ) : allAnalytics.length === 0 ? (
          /* ─── Empty State ────────────────────────────────────────────────────── */
          <div className="text-center py-24 bg-gray-50 dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5">
            <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <PlayCircle className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">No Posts Tracked Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 mb-8">
              Submit your live TikTok, Instagram, or YouTube post links inside a collaboration workspace. Your real-time metrics will appear here automatically.
            </p>
            <button
              onClick={() => navigate('/collaborations')}
              className="px-8 py-3 bg-primary-blue text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-primary-blue/20"
            >
              Go to Workspaces
            </button>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ─── Stat Cards ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                      <s.icon className={cn('w-5 h-5', s.color)} />
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full",
                      s.trend === 'up'
                        ? 'bg-primary-blue/10 text-primary-blue'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                    )}>
                      {s.trend === 'up' ? <TrendingUp size={9} className="inline mr-0.5" /> : <TrendingDown size={9} className="inline mr-0.5" />}
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{s.value}</h3>
                </motion.div>
              ))}
            </div>

            {/* ─── Charts Row ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Views vs Engagement Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Views vs Engagement</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary-blue rounded-full" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-400 rounded-full" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Engagement %</span>
                    </div>
                  </div>
                </div>
                <div className="h-[280px] w-full relative">
                  {completed.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <p className="text-sm font-bold text-gray-400 dark:text-gray-600">Awaiting completed posts…</p>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height={280} minWidth={0} debounce={50}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="advertiserViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0070BB" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#0070BB" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="advertiserEng" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.10} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-white/5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)', backgroundColor: '#111', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="views" stroke="#0070BB" strokeWidth={3} fillOpacity={1} fill="url(#advertiserViews)" />
                      <Area type="monotone" dataKey="engagement" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#advertiserEng)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Platform Distribution */}
              <div className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8">Platform Reach</h3>
                <div className="h-[180px] w-full mb-6">
                  {completed.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-gray-400 font-bold">No active posts yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180} minWidth={0} debounce={50}>
                      <BarChart data={platformData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }} width={70} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#111', color: '#fff' }} />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={18}>
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="space-y-3">
                  {platformData.map((p, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-400">{isNaN(p.value) ? 0 : p.value}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${isNaN(p.value) ? 0 : p.value}%`, backgroundColor: p.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Per-Post Analytics Table ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Posts List */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">My Published Content</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Performance analytics per social media post</p>
                  </div>
                  {/* Platform Filter Pills */}
                  <div className="flex gap-2 flex-wrap">
                    {(['All', 'TikTok', 'Instagram', 'YouTube'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setPlatformFilter(p)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                          platformFilter === p
                            ? "bg-primary-blue text-white shadow-md shadow-primary-blue/20"
                            : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
                    <PlayCircle className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">No {platformFilter !== 'All' ? platformFilter : ''} posts tracked yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map(record => (
                      <PostCard
                        key={record._id}
                        record={record}
                        onRefresh={handleRefresh}
                        refreshingId={refreshingId}
                      />
                    ))}
                  </div>
                )}

                {allAnalytics.some(r => r.status === 'pending') && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <Loader2 size={12} className="animate-spin text-primary-blue" />
                    Live metrics are being fetched for pending posts…
                  </div>
                )}
              </div>

              {/* ROI Sidebar */}
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-primary-blue rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-blue/25">
                  <h3 className="text-base font-black flex items-center gap-2 mb-6">
                    <Target size={18} /> Performance Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-white/60 uppercase mb-1">Total Views</p>
                      <p className="text-2xl font-black">{totalViews.toLocaleString()} <span className="text-xs font-bold opacity-60">views</span></p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-white/60 uppercase mb-1">Interactions</p>
                      <p className="text-2xl font-black">{totalInteractions.toLocaleString()} <span className="text-xs font-bold opacity-60">actions</span></p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-white/60 uppercase mb-1">Avg. Engagement</p>
                      <p className="text-2xl font-black">{avgEngagement.toFixed(2)}<span className="text-xs font-bold opacity-60">%</span></p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-white/60 uppercase mb-1">Total Earned</p>
                      <p className="text-2xl font-black">{totalEarnings.toLocaleString()} <span className="text-xs font-bold opacity-60">ETB</span></p>
                    </div>
                  </div>
                </div>

                {/* Breakdown by platform */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Briefcase size={13} className="text-primary-blue" /> Posts Breakdown
                  </h4>
                  {(['TikTok', 'Instagram', 'YouTube'] as const).map(p => {
                    const posts = allAnalytics.filter(r => r.platform === p);
                    const views = posts.filter(r => r.status === 'completed').reduce((s, r) => s + r.metrics.views, 0);
                    const cfg = platformConfig[p];
                    return (
                      <div key={p} className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', cfg.bg, cfg.color)}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{p}</span>
                            <span className="text-[10px] font-black text-gray-400">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min((views / Math.max(totalViews, 1)) * 100, 100)}%`,
                                  backgroundColor: cfg.accent
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {views.toLocaleString()} v
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </AdvertiserLayout>
  );
}
