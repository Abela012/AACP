import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useRecommendations } from '@/src/hooks/useRecommendations';
import { useQueryClient } from '@tanstack/react-query';
import { usePredictiveAnalysis } from '@/src/hooks/useMarketingAnalysis';
import PredictiveAnalysisDashboard from '@/src/shared/components/analysis/PredictiveAnalysisDashboard';
import { useSavedCreators, useToggleSaveCreator } from '@/src/hooks/useSavedCreators';
import {
  DiscoverHero,
  DiscoverToolbar,
  DiscoverTabs,
  DiscoverCreatorCard,
  DiscoverLoadingState,
  DiscoverEmptyState,
  DiscoverCreatorModalShell,
  DiscoverModalStat,
  DiscoverModalAnalysisHeader,
  DiscoverModalLoading,
  DiscoverModalUnavailable,
} from './discover/DiscoverUI';

const TABS = ['Recommended Creators'];

export default function MatchesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('Recommended Creators');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const { data: recoData, isLoading } = useRecommendations();
  const recommendations = (recoData as any)?.recommendations || [];

  const formatMatchScore = (value: unknown): number => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue) ? Math.round(numericValue) : 0;
  };

  const getAvatarInitials = (name: string | undefined): string => {
    if (!name) return 'A';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'A';
  };

  const { data: bookmarkedCreators = [], isLoading: isLoadingBookmarks } = useSavedCreators();
  const toggleBookmark = useToggleSaveCreator();

  const { data: predictionData, isLoading: isLoadingPrediction } = usePredictiveAnalysis(
    selectedCreator?.targetId || null
  );

  const isCreatorBookmarked = (creatorId: string) => {
    if (!creatorId || !bookmarkedCreators) return false;
    return bookmarkedCreators.some((c: any) => {
      const id = typeof c === 'string' ? c : (c._id || c.targetId || c.id);
      return id?.toString() === creatorId.toString();
    });
  };

  const handleToggleBookmark = (e: React.MouseEvent, creatorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark.mutate(creatorId);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const filteredCreators = recommendations.filter((c: any) => {
    const matchesNiche = selectedNiche === 'All Niches' ||
      (c.category && c.category.toLowerCase().includes(selectedNiche.toLowerCase()));

    const searchLower = searchQuery.trim().toLowerCase();
    const matchesSearch = !searchLower ||
      (c.name && c.name.toLowerCase().includes(searchLower)) ||
      (c.location && c.location.toLowerCase().includes(searchLower));

    return matchesNiche && matchesSearch;
  });

  const displayCreators = (() => {
    if (activeTab === 'Bookmarked Creators') return bookmarkedCreators;
    if (activeTab === 'Recently Joined') {
      return [...filteredCreators].sort((a, b) => new Date(b.meta?.createdAt || 0).getTime() - new Date(a.meta?.createdAt || 0).getTime());
    }
    if (activeTab === 'Creator Feed') {
      return [...filteredCreators].reverse();
    }
    return filteredCreators;
  })();

  const avgMatchScore =
    recommendations.length > 0
      ? Math.round(
          recommendations.reduce((sum: number, item: any) => sum + formatMatchScore(item.score), 0) /
            recommendations.length
        )
      : 0;

  const hasActiveFilters = selectedNiche !== 'All Niches' || searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setSelectedNiche('All Niches');
    setSearchQuery('');
  };

  const listLoading = activeTab === 'Bookmarked Creators' ? isLoadingBookmarks : isLoading;

  return (
    <BusinessLayout>
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <AnimatePresence>
          {selectedCreator && (
            <DiscoverCreatorModalShell onClose={() => setSelectedCreator(null)}>
              <div className="grid max-h-[92vh] grid-cols-1 gap-8 overflow-y-auto p-6 scrollbar-thin md:p-10 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-4">
                  <div className="group relative h-64 w-full overflow-hidden rounded-2xl shadow-md">
                    <img
                      src={
                        selectedCreator.meta?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${selectedCreator.name}&background=0070BB&color=fff`
                      }
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      <ShieldCheck size={14} className="shrink-0" aria-hidden />
                      Verified creator partner
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DiscoverModalStat label="Niche">
                      {selectedCreator.category || 'Lifestyle'}
                    </DiscoverModalStat>
                    <DiscoverModalStat label="Reach">
                      {typeof (selectedCreator.meta?.followers || selectedCreator.profileData?.followers) === 'number'
                        ? (selectedCreator.meta?.followers || selectedCreator.profileData?.followers).toLocaleString()
                        : 'N/A'}
                    </DiscoverModalStat>
                    <DiscoverModalStat label="Rating">
                      {selectedCreator.meta?.averageRating || '0.0'}
                    </DiscoverModalStat>
                    <DiscoverModalStat label="Location">
                      {selectedCreator.location || 'Remote'}
                    </DiscoverModalStat>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      About creator
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {selectedCreator.meta?.bio ||
                        'A passionate content creator focused on delivering high-quality visual stories and engaging community experiences.'}
                    </p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Platforms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCreator.meta?.platforms?.map((p: string) => (
                        <span
                          key={p}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                        >
                          {p}
                        </span>
                      )) || (
                        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                          Instagram
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => navigate('/messages', { state: { creator: selectedCreator } })}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-blue py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-blue/25 transition-all hover:bg-primary-blue-hover"
                    >
                      Invite to campaign
                      <ArrowRight size={16} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/users/${selectedCreator.targetId}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-600 transition-all hover:border-primary-blue/40 hover:text-primary-blue dark:border-white/10 dark:text-slate-400"
                    >
                      <ExternalLink size={14} aria-hidden />
                      View full profile
                    </button>
                  </div>
                </div>

                <div className="space-y-6 lg:col-span-8">
                  <DiscoverModalAnalysisHeader matchScore={formatMatchScore(selectedCreator.score)} />
                  {isLoadingPrediction ? (
                    <DiscoverModalLoading />
                  ) : predictionData ? (
                    <div className="rounded-2xl border border-slate-100 bg-white p-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
                      <PredictiveAnalysisDashboard data={predictionData} />
                    </div>
                  ) : (
                    <DiscoverModalUnavailable />
                  )}
                </div>
              </div>
            </DiscoverCreatorModalShell>
          )}
        </AnimatePresence>

        <DiscoverHero
          avgMatch={avgMatchScore}
          creatorCount={displayCreators.length}
          isSyncing={isSyncing}
          onSync={handleSync}
        />

        <DiscoverTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          bookmarkCount={bookmarkedCreators.length}
        />

        <DiscoverToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedNiche={selectedNiche}
          onNicheChange={setSelectedNiche}
          showFilters={showFiltersPanel}
          onToggleFilters={() => setShowFiltersPanel((v) => !v)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />

        <section aria-label="Creator recommendations">
          {listLoading ? (
            <DiscoverLoadingState />
          ) : displayCreators.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {displayCreators.map((c: any, idx: number) => {
                const creatorId = c.targetId || c._id;
                return (
                  <DiscoverCreatorCard
                    key={creatorId}
                    creator={c}
                    index={idx}
                    matchScore={formatMatchScore(c.score)}
                    avatarInitials={getAvatarInitials(c.name || c.firstName)}
                    isBookmarked={isCreatorBookmarked(creatorId)}
                    onOpen={() => setSelectedCreator(c)}
                    onInvite={(e) => {
                      e.stopPropagation();
                      navigate('/messages', { state: { creator: c } });
                    }}
                    onToggleBookmark={(e) => handleToggleBookmark(e, creatorId)}
                  />
                );
              })}
            </div>
          ) : (
            <DiscoverEmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
          )}
        </section>
      </main>
    </BusinessLayout>
  );
}
