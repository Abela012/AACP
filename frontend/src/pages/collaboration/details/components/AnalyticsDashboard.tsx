import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  RefreshCw,
  ExternalLink,
  Plus,
  Target,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { toast } from 'react-hot-toast';
import type { AnalyticsRecord } from '@/src/api/collaborationApi';

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

// ─── Metric Card ──────────────────────────────────────────────────────────
interface MetricCardProps { label: string; value: string | number; icon: React.ReactNode; colorClass: string; trend?: string; loading?: boolean }
const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, colorClass, trend, loading }) => (
  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn('p-3 rounded-2xl', colorClass)}>{icon}</div>
      {trend && <span className="text-[10px] font-black text-primary-blue bg-primary-blue/10 px-2 py-0.5 rounded-full">{trend}</span>}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    {loading
      ? <div className="h-7 w-24 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
      : <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
    }
  </div>
);

// ─── Post Row ──────────────────────────────────────────────────────────────
interface PostRowProps {
  record: AnalyticsRecord;
  onRefresh: (id: string) => void;
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
            onClick={() => onRefresh(record._id)}
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

// ─── Submit Modal ──────────────────────────────────────────────────────────
interface SubmitModalProps {
  onClose: () => void;
  onSubmit: (data: { platform: string; postUrl: string; notes?: string }) => void;
  isSubmitting: boolean;
}
const SubmitModal: React.FC<SubmitModalProps> = ({ onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({ platform: 'TikTok', postUrl: '', notes: '' });

  const handleSubmit = () => {
    if (!form.postUrl.trim()) { toast.error('Post URL is required'); return; }
    onSubmit({ platform: form.platform, postUrl: form.postUrl.trim(), notes: form.notes || undefined });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/10"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submit Post Link</h3>
        <p className="text-sm text-gray-500 mb-6">Paste the public URL of the published post to start tracking metrics.</p>

        <div className="space-y-5">
          {/* Platform selector */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {(['TikTok', 'Instagram', 'YouTube'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setForm(f => ({ ...f, platform: p }))}
                  className={cn(
                    'py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
                    form.platform === p
                      ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-primary-blue/20'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-500 hover:border-gray-200'
                  )}
                >
                  <span className={form.platform === p ? 'text-white' : platformConfig[p]?.color}>{platformConfig[p]?.icon}</span>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* URL input */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Post URL</label>
            <input
              type="url"
              placeholder="https://www.tiktok.com/@user/video/..."
              value={form.postUrl}
              onChange={e => setForm(f => ({ ...f, postUrl: e.target.value }))}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-blue transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">Notes <span className="normal-case font-normal">(optional)</span></label>
            <textarea
              rows={2}
              placeholder="Any context about this post…"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-blue transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-100 dark:border-white/10 text-gray-500 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.postUrl.trim() || isSubmitting}
              className="flex-1 py-3 bg-primary-blue text-white font-bold rounded-xl hover:bg-primary-blue shadow-lg shadow-primary-blue/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Track Post'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────
interface AnalyticsDashboardProps {
  collaborationId: string;
  analytics: AnalyticsRecord[];
  budget: number;
  isLoading: boolean;
  onSubmitUrl: (data: { platform: string; postUrl: string; notes?: string }) => void;
  onRefresh: (analyticsId: string) => void;
  isSubmitting: boolean;
  refreshingId: string | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  collaborationId,
  analytics,
  budget,
  isLoading,
  onSubmitUrl,
  onRefresh,
  isSubmitting,
  refreshingId,
}) => {
  const [showModal, setShowModal] = useState(false);

  const completed = analytics.filter(r => r.status === 'completed');
  const totalViews    = completed.reduce((a, r) => a + r.metrics.views,    0);
  const totalLikes    = completed.reduce((a, r) => a + r.metrics.likes,    0);
  const totalComments = completed.reduce((a, r) => a + r.metrics.comments, 0);
  const totalShares   = completed.reduce((a, r) => a + r.metrics.shares,   0);
  const totalEngagement = totalViews > 0
    ? ((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(2)
    : '0.00';
  const cpv = budget > 0 && totalViews > 0 ? (budget / totalViews).toFixed(4) : '—';

  const handleSubmit = (data: { platform: string; postUrl: string; notes?: string }) => {
    onSubmitUrl(data);
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
          <p className="text-sm text-gray-500">Live campaign tracking and ROI metrics</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all shadow-lg text-sm shrink-0"
        >
          <Plus size={18} /> Submit Post Link
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0,1,2,3].map(i => <MetricCard key={i} label="Loading" value="" icon={<BarChart3 size={20}/>} colorClass="bg-gray-100 dark:bg-white/5" loading />)}
        </div>
      ) : analytics.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24 bg-gray-50 dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5">
          <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <TrendingUp className="text-gray-200" size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">No Analytics Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 mb-8">
            Submit a published post URL to start tracking views, engagement, and campaign ROI automatically.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-primary-blue text-white rounded-xl font-bold hover:bg-primary-blue transition-all shadow-xl shadow-primary-blue/20"
          >
            Connect First Post
          </button>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Total Views"    value={totalViews.toLocaleString()}    icon={<Eye size={20} className="text-blue-500" />}     colorClass="bg-blue-500/10" />
            <MetricCard label="Total Likes"    value={totalLikes.toLocaleString()}    icon={<ThumbsUp size={20} className="text-primary-blue" />} colorClass="bg-primary-blue/10" />
            <MetricCard label="Engagement"     value={`${totalEngagement}%`}          icon={<TrendingUp size={20} className="text-amber-500" />}  colorClass="bg-amber-500/10" />
            <MetricCard label="Cost Per View"  value={cpv === '—' ? '—' : `${cpv} ETB`} icon={<DollarSign size={20} className="text-primary-blue" />} colorClass="bg-primary-blue-light0/10" />
          </div>

          {/* Posts table + ROI card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Published Content</h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {analytics.length} Post{analytics.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-4">
                {analytics.map(record => (
                  <PostRow key={record._id} record={record} onRefresh={onRefresh} refreshingId={refreshingId} />
                ))}
              </div>
            </div>

            {/* ROI sidebar */}
            <div className="bg-primary-blue rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-blue/20">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <Target size={20} /> ROI Overview
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-2xl">
                  <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Total Reach</p>
                  <p className="text-xl font-black">{totalViews.toLocaleString()} <span className="text-xs font-bold opacity-70">Views</span></p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                  <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Total Interactions</p>
                  <p className="text-xl font-black">{(totalLikes + totalComments + totalShares).toLocaleString()} <span className="text-xs font-bold opacity-70">Actions</span></p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                  <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Engagement Rate</p>
                  <p className="text-xl font-black">{totalEngagement}%</p>
                </div>
                {completed.length === 0 && analytics.some(r => r.status === 'pending') && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-white/70 flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" />
                      Scraping {analytics.filter(r => r.status === 'pending').length} post(s)…
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Submit Modal */}
      <AnimatePresence>
        {showModal && (
          <SubmitModal
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
