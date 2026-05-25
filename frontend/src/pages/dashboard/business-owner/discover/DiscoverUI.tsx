import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Star,
  ArrowRight,
  Sparkles,
  X,
  ShieldCheck,
  ExternalLink,
  Target,
  Loader2,
  Heart,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

const NICHE_OPTIONS = ['All Niches', 'Technology', 'Fashion', 'Fitness', 'Food', 'Travel'] as const;

export function DiscoverHero({
  avgMatch,
  creatorCount,
  isSyncing,
  onSync,
}: {
  avgMatch: number;
  creatorCount: number;
  isSyncing: boolean;
  onSync: () => void;
}) {
  const matchLabel = avgMatch >= 85 ? 'Excellent' : avgMatch >= 70 ? 'Strong' : avgMatch >= 45 ? 'Good' : 'Building';

  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.06] bg-gradient-to-br from-primary-blue/[0.07] via-white to-violet-500/[0.04] dark:from-primary-blue/[0.12] dark:via-[#0f1117] dark:to-violet-500/[0.06] p-6 sm:p-8 lg:p-10 mb-8 shadow-sm"
      aria-labelledby="discover-page-title"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-blue/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-blue/25 bg-primary-blue/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-blue dark:text-sky-300">
            <Sparkles size={12} className="shrink-0" aria-hidden />
            AI creator matching
          </div>
          <h1
            id="discover-page-title"
            className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Discover{' '}
            <span className="bg-gradient-to-r from-primary-blue to-cyan-500 bg-clip-text text-transparent">
              creators
            </span>{' '}
            for your brand
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl">
            Curated recommendations based on niche fit, audience overlap, platform alignment, and engagement quality.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="min-w-[120px] rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Avg. match
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avgMatch}%</p>
            </div>
            <div className="min-w-[120px] rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Match quality
              </span>
              <p className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">{matchLabel}</p>
            </div>
            <div className="col-span-2 min-w-[120px] rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03] sm:col-span-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                In results
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{creatorCount}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-primary-blue/40 hover:text-primary-blue disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-primary-blue/40"
            aria-label="Refresh recommendations"
          >
            <RefreshCw size={16} className={cn(isSyncing && 'animate-spin')} aria-hidden />
            Refresh
          </button>
        </div>
      </div>
    </motion.section>
  );
}

export function DiscoverToolbar({
  searchQuery,
  onSearchChange,
  selectedNiche,
  onNicheChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedNiche: string;
  onNicheChange: (niche: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, location, or niche..."
            aria-label="Search creators"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={onToggleFilters}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-semibold transition-all',
            showFilters || hasActiveFilters
              ? 'border-primary-blue bg-primary-blue text-white shadow-md shadow-primary-blue/20'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]'
          )}
          aria-expanded={showFilters}
          aria-controls="discover-filters-panel"
        >
          <SlidersHorizontal size={18} aria-hidden />
          Filters
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" aria-hidden />
          )}
        </button>
      </div>

      {showFilters && (
        <motion.div
          id="discover-filters-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/[0.06] dark:bg-white/[0.02]"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Niche focus
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by niche">
            {NICHE_OPTIONS.map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => onNicheChange(niche)}
                className={cn(
                  'rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all',
                  selectedNiche === niche
                    ? 'border-primary-blue/40 bg-primary-blue/10 text-primary-blue dark:text-sky-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary-blue/30 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400'
                )}
              >
                {niche}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-4 dark:border-white/[0.06]">
              <span className="text-xs text-slate-500">Filters applied to your feed.</span>
              <button
                type="button"
                onClick={onClearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400"
              >
                Clear filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Accessible fallback: same niche values as before */}
      <label className="sr-only" htmlFor="discover-niche-select">
        Niche filter
      </label>
      <select
        id="discover-niche-select"
        value={selectedNiche}
        onChange={(e) => onNicheChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      >
        {NICHE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DiscoverTabs({
  tabs,
  activeTab,
  onTabChange,
  bookmarkCount,
}: {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  bookmarkCount: number;
}) {
  return (
    <nav
      className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.06]"
      aria-label="Discover sections"
    >
      <div className="flex gap-1 overflow-x-auto pb-px scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={cn(
              'relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors',
              activeTab === tab
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            {tab === 'Bookmarked Creators' ? `${tab} (${bookmarkCount})` : tab}
            {activeTab === tab && (
              <motion.span
                layoutId="discover-tab-indicator"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary-blue"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

function matchScoreRing(score: number) {
  const safe = Math.min(100, Math.max(0, score));
  const color =
    safe >= 80 ? 'text-emerald-500' : safe >= 60 ? 'text-primary-blue' : 'text-amber-500';
  return { safe, color };
}

export function DiscoverCreatorCard({
  creator,
  index,
  matchScore,
  avatarInitials,
  isBookmarked,
  onOpen,
  onInvite,
  onToggleBookmark,
}: {
  creator: any;
  index: number;
  matchScore: number;
  avatarInitials: string;
  isBookmarked: boolean;
  onOpen: () => void;
  onInvite: (e: React.MouseEvent) => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
}) {
  const { safe, color } = matchScoreRing(matchScore);
  const name = creator.name || `${creator.firstName || ''} ${creator.lastName || ''}`.trim();
  const niches = creator.meta?.niches || creator.profileData?.niches || [creator.category].filter(Boolean);
  const followers = creator.meta?.followers ?? creator.profileData?.followers;
  const engagement = creator.meta?.engagementRate ?? creator.profileData?.engagementRate;
  const rating = creator.meta?.averageRating ?? creator.averageRating;
  const location = creator.location;
  const imageSrc = creator.meta?.profilePicture || creator.profilePicture;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-blue/35 hover:shadow-lg hover:shadow-primary-blue/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue dark:border-white/[0.06] dark:bg-[#141820]/80 dark:hover:border-primary-blue/30"
    >
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark creator'}
          className={cn(
            'rounded-xl border p-2 transition-all',
            isBookmarked
              ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
              : 'border-slate-200/80 bg-white/90 text-slate-500 hover:text-rose-500 dark:border-white/10 dark:bg-slate-900/80 dark:hover:text-rose-400'
          )}
        >
          <Heart size={16} className={cn(isBookmarked && 'fill-current')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-slate-100 dark:ring-white/10 sm:h-20 sm:w-20">
            {imageSrc ? (
              <img src={imageSrc} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-blue to-violet-600 text-lg font-bold text-white">
                {avatarInitials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pr-8">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-blue/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-blue dark:text-sky-300">
                <Sparkles size={10} aria-hidden />
                {matchScore}% match
              </span>
              {rating > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <Star size={10} className="fill-current" aria-hidden />
                  {Number(rating).toFixed(1)}
                </span>
              )}
            </div>
            <h3 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-primary-blue dark:text-white sm:text-xl">
              {name || 'Creator'}
            </h3>
            {location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin size={12} aria-hidden />
                {location}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {niches.slice(0, 4).map((n: string, i: number) => (
            <span
              key={`${n}-${i}`}
              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
            >
              {n}
            </span>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Reach</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {typeof followers === 'number' ? followers.toLocaleString() : '—'}
            </p>
          </div>
          <div className="text-center border-x border-slate-200/80 dark:border-white/[0.06]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Engagement</p>
            <p
              className={cn(
                'text-sm font-bold',
                typeof engagement === 'number' && engagement > 8
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              )}
            >
              {typeof engagement === 'number' ? `${Math.min(engagement, 100).toFixed(1)}%` : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className={cn('text-[10px] font-semibold uppercase tracking-wider', color)}>Fit</p>
            <p className={cn('text-sm font-bold', color)}>{safe}%</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onInvite}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-blue py-3 text-sm font-semibold text-white shadow-md shadow-primary-blue/25 transition-all hover:bg-primary-blue-hover active:scale-[0.98]"
        >
          Invite to campaign
          <ArrowRight size={16} aria-hidden />
        </button>
      </div>
    </motion.article>
  );
}

export function DiscoverLoadingState() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2" role="status" aria-live="polite" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02]"
        >
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-2/3 rounded-lg bg-slate-200 dark:bg-white/10" />
              <div className="h-3 w-1/2 rounded-lg bg-slate-100 dark:bg-white/5" />
              <div className="h-8 w-full rounded-xl bg-slate-100 dark:bg-white/5" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading creator recommendations</span>
    </div>
  );
}

export function DiscoverEmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/[0.04]">
        <Target className="h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">No creators found</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {hasFilters
          ? 'Try broadening your search or clearing filters to see more AI-matched creators.'
          : 'Recommendations will appear here once our engine finds strong matches for your profile.'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary-blue/40 hover:text-primary-blue dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

export function DiscoverCreatorModalShell({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0d0f14]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-30 rounded-full border border-slate-200/80 bg-white/90 p-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/90 dark:text-white"
          aria-label="Close creator details"
        >
          <X size={18} />
        </button>
        {children}
      </motion.div>
    </div>
  );
}

export function DiscoverModalStat({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{children}</div>
    </div>
  );
}

export function DiscoverModalAnalysisHeader({ matchScore }: { matchScore: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-blue/10 text-primary-blue">
          <Sparkles size={20} aria-hidden />
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            AI market analysis
          </h4>
          <p className="text-xs font-medium text-primary-blue dark:text-sky-300">
            Strategy and performance projections
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Match strength</span>
        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{matchScore}%</p>
      </div>
    </div>
  );
}

export function DiscoverModalLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 py-24 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <Loader2 size={36} className="animate-spin text-primary-blue" aria-hidden />
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-white">
          Running analysis
        </p>
        <p className="mt-1 max-w-sm px-4 text-xs text-slate-500">
          Evaluating audience fit, engagement quality, and campaign synergy.
        </p>
      </div>
    </div>
  );
}

export function DiscoverModalUnavailable() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 py-20 text-center dark:border-white/[0.06] dark:bg-white/[0.02]">
      <AlertCircle size={36} className="mx-auto mb-3 text-slate-300" aria-hidden />
      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Analysis unavailable</p>
      <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
        Connect social profiles with verified metrics to unlock full projections.
      </p>
    </div>
  );
}

