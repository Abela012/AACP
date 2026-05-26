/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser as useClerkUser } from "@clerk/clerk-react";
import {
  Sparkles,
  Zap,
  DollarSign,
  Lock,
  ShieldCheck,
  Star,
  ChevronRight,
  Briefcase,
  Loader2,
  Clock,
  ArrowRight,
  MapPin,
  Heart,
} from "lucide-react";
import OnboardingBanner from "../../../shared/components/OnboardingBanner";
import { cn } from "@/src/shared/utils/cn";
import AdvertiserLayout from "@/src/shared/components/layouts/AdvertiserLayout";
import { useUser } from "@/src/shared/context/UserContext";
import CompleteProfilePage from "../../profile/complete-profile/CompleteProfilePage";
import PendingApprovalState from "@/src/shared/components/PendingApprovalState";
import { useUserSync } from "@/src/hooks/useUserSync";
import { useMyApplications } from "@/src/hooks/useApplications";
import { useWalletBalance } from "@/src/hooks/useWallet";
import { useOpportunities } from "@/src/hooks/useOpportunities";
import {
  useSavedOpportunities,
  useToggleSaveOpportunity,
} from "@/src/hooks/useSavedOpportunities";
import { useMyTrustScore } from "@/src/hooks/useAdminAnalytics";

export default function AdvertiserDashboardPage() {
  const navigate = useNavigate();
  const { onboardingStatus } = useUser();
  const { user: clerkUser } = useClerkUser();
  const myId = clerkUser?.id ?? "";
  const { sync, isLoading: isSyncing } = useUserSync();

  // chartView reserved for future chart toggle
  const [_chartView, _setChartView] = useState<"daily" | "monthly">("monthly");
  const isApproved = onboardingStatus === "approved";

  // Real data hooks
  const { data: appsData, isLoading: isLoadingApps } = useMyApplications(myId);
  const { data: walletData, isLoading: isLoadingWallet } = useWalletBalance();
  const { data: oppsData, isLoading: isLoadingOpps } = useOpportunities();
  const { data: savedJobs = [] } = useSavedOpportunities();
  const toggleSave = useToggleSaveOpportunity();
  const { data: trustScoreData, isLoading: trustScoreLoading } =
    useMyTrustScore();
  const trustScoreValue = trustScoreData?.trustScore ?? null;

  const isJobSaved = (jobId: string) => {
    if (!jobId || !savedJobs) return false;
    return savedJobs.some((j: any) => {
      const id = typeof j === "string" ? j : j._id || j.id;
      return id?.toString() === jobId.toString();
    });
  };

  const handleToggleSave = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate(jobId);
  };

  const applications = appsData?.applications ?? [];
  const activeCount = applications.filter(
    (a: any) => a.status === "accepted",
  ).length;
  const pendingCount = applications.filter(
    (a: any) => a.status === "pending",
  ).length;

  const opportunities = oppsData?.opportunities ?? [];
  const matchCount = opportunities.length;

  const stats = [
    {
      label: "Trust Score",
      value: trustScoreLoading
        ? "…"
        : trustScoreValue !== null
          ? `${trustScoreValue}/100`
          : "—",
      subValue: "",
      trend: trustScoreValue !== null && trustScoreValue >= 70 ? "Strong" : "Building",
      trendType: trustScoreValue !== null && trustScoreValue >= 70 ? "up" : "neutral",
      icon: ShieldCheck,
      color: "text-primary-blue",
      bg: "bg-primary-blue/10",
    },
    {
      label: "Total Balance",
      value: isLoadingWallet
        ? "..."
        : `${walletData?.balance?.toLocaleString() ?? 0} AACP`,
      trend: "Available to withdraw",
      trendType: "neutral",
      icon: DollarSign,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Campaigns",
      value: isLoadingApps ? "..." : activeCount.toString(),
      trend: `${pendingCount} pending`,
      trendType: "neutral",
      icon: Zap,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "AI Matches",
      value: isLoadingOpps ? "..." : matchCount.toString(),
      trend: matchCount > 0 ? "New matches found" : "No matches yet",
      trendType: matchCount > 0 ? "up" : "neutral",
      icon: Sparkles,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ];

  const handleStatClick = (label: string) => {
    if (label.includes("Campaign")) {
      navigate("/advertiser/campaigns");
      return;
    }
    if (label.includes("Match")) {
      navigate("/advertiser/matches");
      return;
    }
    if (label.includes("Balance") || label.includes("Earnings")) {
      navigate("/advertiser/wallet");
      return;
    }
    navigate("/advertiser/analytics");
  };

  return (
    <AdvertiserLayout>
      <main className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {onboardingStatus === "incomplete" ? (
          <div className="mt-8">
            <CompleteProfilePage isInsideDashboard={true} />
          </div>
        ) : onboardingStatus === "pending" ? (
          <PendingApprovalState
            onRefresh={() => sync()}
            isRefreshing={isSyncing}
          />
        ) : (
          <>
            <OnboardingBanner status={onboardingStatus} role="advertiser" />

            {/* ── Section 1: Header Greeting ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Welcome back
                </p>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  {clerkUser?.firstName || "Creator"}{" "}
                  <span className="text-primary-blue">👋</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Here's what's happening with your campaigns today.
                </p>
              </div>
              <button
                onClick={() => navigate("/advertiser/matches")}
                className="px-6 py-3 bg-primary-blue text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-blue/20 hover:opacity-90 transition-all self-start"
              >
                <Sparkles size={16} /> Browse Campaigns
              </button>
            </motion.div>

            {/* ── Section 2: KPI Stat Cards ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {stats.map((stat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStatClick(stat.label)}
                  className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 hover:border-primary-blue/30 shadow-sm hover:shadow-[0_24px_60px_-40px_rgba(0,0,0,0.35)] transition-all text-left group w-full transform-gpu hover:-translate-y-0.5"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">
                      {stat.label}
                    </p>
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        stat.bg,
                        stat.color,
                      )}
                    >
                      <stat.icon size={17} />
                    </div>
                  </div>
                  {/* Big value */}
                  <p className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-2 truncate">
                    {stat.value}
                  </p>
                  {/* Trend */}
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      stat.trendType === "up"
                        ? "text-primary-blue"
                        : "text-gray-400 dark:text-gray-500",
                    )}
                  >
                    {stat.trend}
                  </p>
                </button>
              ))}
            </motion.div>

            {/* ── Section 3: Latest Opportunities ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="relative"
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Latest Opportunities
                </h2>
                <button
                  onClick={() => navigate("/advertiser/matches")}
                  className="text-sm font-bold text-primary-blue hover:underline flex items-center gap-1 transition-all"
                >
                  View all <ChevronRight size={15} />
                </button>
              </div>

              {/* Lock overlay */}
              {!isApproved && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/60 dark:bg-black/50 backdrop-blur-sm">
                  <div className="bg-white dark:bg-[#161616] border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 text-center max-w-xs">
                    <div className="w-14 h-14 bg-primary-blue/10 rounded-2xl flex items-center justify-center">
                      <Lock size={28} className="text-primary-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                        Unlock Opportunities
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        Complete your profile and wait for admin approval to
                        access live campaigns.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Opportunity list */}
              <div
                className={cn(
                  "flex flex-col gap-4",
                  !isApproved && "opacity-40 pointer-events-none select-none",
                )}
              >
                {isLoadingOpps ? (
                  <div className="flex flex-col items-center py-24">
                    <Loader2
                      size={36}
                      className="text-primary-blue animate-spin mb-3"
                    />
                    <p className="text-sm font-bold text-gray-400">
                      Fetching opportunities…
                    </p>
                  </div>
                ) : opportunities.length > 0 ? (
                  opportunities.slice(0, 6).map((opp: any, idx: number) => {
                    const tags = [
                      ...(opp.deliverables || []),
                      ...(opp.platforms || []),
                      opp.category,
                    ].filter(Boolean);

                    const applicantCount = Array.isArray(opp.applicants)
                      ? opp.applicants.length
                      : 0;
                    const proposalText = applicantCount.toString();
                    const budgetAmount =
                      typeof opp.budget === "object"
                        ? opp.budget.amount || 0
                        : opp.budget || 0;
                    const paymentType = opp.paymentType || "Fixed-price";
                    const expLevel = opp.experienceLevel || "Expert";
                    const locationText =
                      opp.location || opp.requirements?.location || "Global";

                    const timeAgo = opp.createdAt
                      ? (() => {
                          const diff = Math.floor(
                            (new Date().getTime() -
                              new Date(opp.createdAt).getTime()) /
                              1000,
                          );
                          if (diff < 60) return "Just now";
                          if (diff < 3600)
                            return `${Math.floor(diff / 60)}m ago`;
                          if (diff < 86400)
                            return `${Math.floor(diff / 3600)}h ago`;
                          return `${Math.floor(diff / 86400)}d ago`;
                        })()
                      : "Just now";

                    const rating = opp.businessOwner?.averageRating || 0;

                    return (
                      <motion.div
                        key={opp._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 hover:border-primary-blue/30 shadow-sm hover:shadow-md transition-all group flex flex-col lg:flex-row gap-6 items-start lg:items-stretch"
                      >
                        {/* ── Left: content ── */}
                        <div className="flex-1 min-w-0 flex flex-col gap-3">
                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[11px] font-bold text-gray-400">
                              <Clock size={11} className="text-primary-blue" />
                              {timeAgo}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-blue/5 dark:bg-primary-blue/10 border border-primary-blue/10 text-[11px] font-bold text-primary-blue">
                              <Briefcase size={11} />
                              {proposalText} applicants
                            </span>
                          </div>

                          {/* Title */}
                          <h3
                            onClick={() =>
                              navigate(`/advertiser/matches/${opp._id}/apply`)
                            }
                            className="text-lg font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 cursor-pointer group-hover:text-primary-blue transition-colors"
                          >
                            {opp.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {opp.description}
                          </p>

                          {/* Tag pills */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {tags
                                .slice(0, 5)
                                .map((tag: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[11px] font-semibold text-gray-500 dark:text-gray-400"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              {tags.length > 5 && (
                                <span className="px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[11px] font-bold text-gray-400">
                                  +{tags.length - 5}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer: rating + location + time */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-auto pt-3 border-t border-gray-100 dark:border-white/5 text-xs font-semibold text-gray-400">
                            {/* Stars */}
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => {
                                const isFilled = i < Math.round(rating);
                                return (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={cn(
                                      isFilled
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10",
                                    )}
                                  />
                                );
                              })}
                            </div>
                            {/* Location */}
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-gray-400" />
                              {locationText}
                            </span>
                            {/* Verified */}
                            <span className="flex items-center gap-1 text-blue-500">
                              <ShieldCheck size={12} />
                              Verified
                            </span>
                          </div>
                        </div>

                        {/* ── Right: budget + actions ── */}
                        <div className="flex sm:flex-row lg:flex-col items-center sm:items-center lg:items-end justify-between lg:justify-center w-full lg:w-48 shrink-0 lg:border-l border-t lg:border-t-0 border-gray-100 dark:border-white/5 pt-4 lg:pt-0 lg:pl-6 gap-4">
                          {/* Budget block */}
                          <div className="text-left lg:text-right">
                            <span className="inline-block text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg mb-1">
                              {paymentType}
                            </span>
                            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                              {budgetAmount.toLocaleString()}
                              <span className="text-sm font-bold text-gray-400 ml-1">
                                ETB
                              </span>
                            </p>
                            <p className="text-xs text-gray-400 font-semibold mt-1 flex items-center gap-1 lg:justify-end">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-blue inline-block" />
                              {expLevel}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 w-full sm:w-auto lg:w-full">
                            <button
                              onClick={() =>
                                navigate(`/advertiser/matches/${opp._id}/apply`)
                              }
                              className="flex-1 px-4 py-2.5 bg-primary-blue text-white text-sm font-bold rounded-2xl shadow-md shadow-primary-blue/10 hover:opacity-90 hover:shadow-lg hover:shadow-primary-blue/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 group/btn"
                            >
                              Apply
                              <ArrowRight
                                size={14}
                                className="transition-transform group-hover/btn:translate-x-0.5"
                              />
                            </button>
                            <button
                              onClick={(e) => handleToggleSave(e, opp._id)}
                              className={cn(
                                "p-2.5 rounded-2xl border transition-all active:scale-95",
                                isJobSaved(opp._id)
                                  ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500"
                                  : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:text-gray-700 dark:hover:text-white",
                              )}
                            >
                              <Heart
                                size={16}
                                className={
                                  isJobSaved(opp._id) ? "fill-current" : ""
                                }
                              />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  /* Empty state */
                  <div className="flex flex-col items-center py-24 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                      <Briefcase
                        size={28}
                        className="text-gray-300 dark:text-white/20"
                      />
                    </div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">
                      No opportunities yet
                    </h3>
                    <p className="text-sm text-gray-400 max-w-xs">
                      Check back soon — new brand campaigns are added daily.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </main>
    </AdvertiserLayout>
  );
}
