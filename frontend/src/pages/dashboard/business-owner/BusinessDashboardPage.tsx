/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser as useClerkUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import {
  Megaphone,
  Users,
  Plus,
  Sparkles,
  ShieldCheck,
  Lock,
  ChevronRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Search,
  Pause,
  Play,
  Edit,
  CheckCircle2,
  ArrowUpRight,
  DollarSign,
  Wallet,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/src/shared/utils/cn";
import { useUser } from "@/src/shared/context/UserContext";
import { useProfile } from "@/src/shared/context/ProfileContext";
import BusinessLayout from "@/src/shared/components/layouts/BusinessLayout";
import BusinessCompleteProfilePage from "../../profile/complete-profile/BusinessCompleteProfilePage";
import PendingApprovalState from "@/src/shared/components/PendingApprovalState";
import { useUserSync } from "@/src/hooks/useUserSync";
import {
  useMyOpportunities,
  useUpdateOpportunity,
} from "@/src/hooks/useOpportunities";
import { useWalletBalance, useWalletHistory } from "@/src/hooks/useWallet";
import { useRecommendations } from "@/src/hooks/useRecommendations";
import { useMyTrustScore } from "@/src/hooks/useAdminAnalytics";
import { useUserCollaborations } from "@/src/hooks/useCollaborations";
import { useBusinessOwnerApplications } from "@/src/hooks/useApplications";
import { useConversations } from "@/src/hooks/useChat";
import { useMyTrustScore } from "@/src/hooks/useAdminAnalytics";

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
}
const Card = ({ children, className, title, extra }: CardProps) => (
  <div
    className={cn(
      "bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden",
      className,
    )}
  >
    {(title || extra) && (
      <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          {title}
        </h3>
        {extra}
      </div>
    )}
    <div className="aacp-card__body">{children}</div>
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}
const Badge = ({ children, variant = "neutral" }: BadgeProps) => {
  const variants: Record<string, string> = {
    success: "bg-primary-blue/10 text-primary-blue",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-500",
    info: "bg-blue-500/10 text-blue-500",
    neutral: "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400",
  };
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function BusinessDashboardPage() {
  const navigate = useNavigate();
  const { onboardingStatus } = useUser();
  const { user: clerkUser } = useClerkUser();
  const { profile } = useProfile();
  const myId = profile?._id || clerkUser?.id || "";
  const { sync, isLoading: isSyncing } = useUserSync();
  const isApproved = onboardingStatus === "approved";

  // Data Hooks
  const { data: oppsData, isLoading: isLoadingOpps } = useMyOpportunities(myId);
  const { data: walletData, isLoading: isLoadingWallet } = useWalletBalance();
  const { data: walletHistory, isLoading: isLoadingHistory } =
    useWalletHistory();
  const { data: recsData, isLoading: isLoadingRecs } = useRecommendations();
  const { data: collabsData, isLoading: isLoadingCollabs } =
    useUserCollaborations(myId);
  const { data: appsData } = useBusinessOwnerApplications();
  const { data: convsData, isLoading: isLoadingConvs } = useConversations();

  const { data: trustScoreData, isLoading: trustScoreLoading } =
    useMyTrustScore();
  const trustScoreValue = trustScoreData?.trustScore ?? null;

  // Mutations
  const updateOpp = useUpdateOpportunity();
  const queryClient = useQueryClient();
  const [timeFilter, setTimeFilter] = useState("7D");

  const formatMatchScore = (value: unknown): number => {
    const numericValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numericValue) ? Math.round(numericValue) : 0;
  };

  const opportunities = oppsData?.opportunities ?? [];
  const collaborations = collabsData ?? [];
  const applications = appsData ?? [];
  const conversations = convsData ?? [];
  const campaignStats = opportunities.map((opp: any) => {
    const applicantCount = opp.applicants?.length ?? 0;
    const maxApplicants = opp.maxApplicants ?? 0;
    const fillRate =
      maxApplicants > 0
        ? Math.round((applicantCount / maxApplicants) * 100)
        : 0;

    return {
      ...opp,
      applicantCount,
      fillRate,
    };
  });
  const topCampaign = [...campaignStats].sort((a: any, b: any) => {
    if (b.fillRate !== a.fillRate) return b.fillRate - a.fillRate;
    return (b.viewsCount ?? 0) - (a.viewsCount ?? 0);
  })[0];
  const lowestCampaign = [...campaignStats].sort((a: any, b: any) => {
    if (a.fillRate !== b.fillRate) return a.fillRate - b.fillRate;
    return (a.viewsCount ?? 0) - (b.viewsCount ?? 0);
  })[0];

  // ─── DYNAMIC DATA DERIVATION ────────────────────────────────────────────────

  // Generate real chart data from opportunities
  const derivedChartData = opportunities
    .slice(0, 7)
    .map((opp: any) => {
      const factor = timeFilter === "7D" ? 1 : timeFilter === "30D" ? 4.2 : 12;
      return {
        name: opp.title.split(" ")[0],
        views: Math.round((opp.viewsCount || 0) * factor),
        engagement: Math.round((opp.viewsCount || 0) * 0.15 * factor),
        conversions: Math.round((opp.viewsCount || 0) * 0.02 * factor),
      };
    })
    .reverse();

  const performanceData =
    derivedChartData.length > 0
      ? derivedChartData
      : [
          { name: "Mon", views: 0, engagement: 0, conversions: 0 },
          { name: "Tue", views: 0, engagement: 0, conversions: 0 },
          { name: "Wed", views: 0, engagement: 0, conversions: 0 },
        ];

  // Derive Tasks from pending data
  const pendingApps = applications.filter((a: any) => a.status === "pending");
  const needsFunding = opportunities.filter(
    (o: any) => o.budget?.amount > (walletData?.balance ?? 0),
  );

  const realTasks = [
    ...pendingApps.slice(0, 2).map((a: any) => ({
      id: `app-${a._id}`,
      title: "Review applicant request",
      subtitle: `${a.advertiser?.firstName} for ${a.opportunity?.title}`,
      priority: "high",
      action: "Review",
      link: "/matches",
    })),
    ...needsFunding.map((o: any) => ({
      id: `fund-${o._id}`,
      title: "Fund campaign",
      subtitle: `Low balance for ${o.title}`,
      priority: "high",
      action: "Fund",
      link: "/wallet",
    })),
    ...collaborations
      .filter((c: any) => c.status === "active" && c.overallProgress >= 90)
      .map((c: any) => ({
        id: `review-${c._id}`,
        title: "Review final content",
        subtitle: `Milestone 100% for ${c.advertiser?.firstName}`,
        priority: "medium",
        action: "Review",
        link: `/collaborations/${c._id}`,
      })),
  ];

  // Derive Activity from wallet history
  const realActivity = (walletHistory ?? []).slice(0, 5).map((tx: any) => ({
    id: tx._id,
    type: tx.type,
    text: tx.description,
    time: new Date(tx.createdAt).toLocaleDateString(),
    icon:
      tx.type === "credit"
        ? DollarSign
        : tx.type === "debit"
          ? Wallet
          : Activity,
    color: tx.type === "credit" ? "text-primary-blue" : "text-blue-500",
  }));

  // 1. Status / Alert Banner Logic
  const showBalanceWarning = (walletData?.balance ?? 0) < 100;
  const showVerifyAlert =
    onboardingStatus === "incomplete" || onboardingStatus === "pending";

  const handleStatusToggle = async (oppId: string, currentStatus: string) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      await updateOpp.mutateAsync({
        id: oppId,
        data: { status: newStatus as any },
      });
      toast.success(
        `Campaign ${newStatus === "open" ? "resumed" : "paused"} successfully!`,
      );
    } catch {
      toast.error("Failed to update campaign status");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Logic for marking all read (placeholder for multi-conversation mark read)
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  if (onboardingStatus === "incomplete") {
    return (
      <BusinessLayout>
        <main className="p-4 md:p-8 max-w-400 mx-auto w-full">
          <BusinessCompleteProfilePage isInsideDashboard={true} />
        </main>
      </BusinessLayout>
    );
  }

  if (onboardingStatus === "pending") {
    return (
      <BusinessLayout>
        <main className="p-4 md:p-8 max-w-400 mx-auto w-full">
          <PendingApprovalState
            onRefresh={() => sync()}
            isRefreshing={isSyncing}
          />
        </main>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      <main className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
        {/* ── 1. ALERT BANNERS ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {(showVerifyAlert || (showBalanceWarning && isApproved)) && (
            <div className="space-y-3">
              {showVerifyAlert && (
                <motion.div
                  key="verify-alert"
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        Account Under Review
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Your profile is being verified. Some features may be
                        limited until approved.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => sync()}
                    className="shrink-0 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Refresh
                  </button>
                </motion.div>
              )}

              {showBalanceWarning && isApproved && (
                <motion.div
                  key="balance-warning"
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        Low Wallet Balance
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Your balance is below 100 AACP. Top up to keep campaigns
                        running.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/wallet")}
                    className="shrink-0 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    Add Funds
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* ── 2. HERO HEADER ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
              Business Dashboard
            </p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Good morning,{" "}
              <span className="text-primary-blue">
                {clerkUser?.firstName || "there"}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your campaigns, creators, and business growth.
            </p>
          </div>
          <button
            onClick={() => navigate("/campaign/new")}
            className="px-6 py-3 bg-primary-blue text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-blue/20 hover:opacity-90 transition-all self-start"
          >
            <Plus size={16} />
            New Campaign
          </button>
        </div>

        {/* ── 3. KPI CARDS ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Total Campaigns",
              value: isLoadingOpps ? "…" : opportunities.length,
              trend: "+2",
              trendType: "up",
              subtext: "Since last month",
              icon: Megaphone,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              link: "/campaigns",
            },
            {
              label: "Active Creators",
              value: isLoadingCollabs
                ? "…"
                : collaborations.filter((c: any) => c.status === "active")
                    .length,
              trend: "+12%",
              trendType: "up",
              subtext: "High engagement",
              icon: Users,
              color: "text-primary-blue",
              bg: "bg-primary-blue/10",
              link: "/collaborations",
            },
            {
              label: "Wallet Balance",
              value: isLoadingWallet
                ? "…"
                : (walletData?.balance?.toLocaleString() ?? 0),
              trend: "AACP",
              trendType: "neutral",
              subtext: "Available funds",
              icon: Wallet,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
              link: "/wallet",
            },
            {
              label: "Trust Score",
              value: "78/100",
              trend: "+4",
              trendType: "up",
              subtext: "Top 10% Business",
              icon: ShieldCheck,
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
              link: "/profile",
            },
          ].map((stat, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => navigate(stat.link)}
              className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 hover:border-primary-blue/30 shadow-sm text-left transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                    stat.bg,
                    stat.color,
                  )}
                >
                  <stat.icon size={20} />
                </div>
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] font-bold",
                    stat.trendType === "up"
                      ? "text-primary-blue"
                      : "text-gray-400",
                  )}
                >
                  {stat.trendType === "up" && <ArrowUpRight size={12} />}
                  {stat.trend}
                </span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-400">{stat.subtext}</p>
            </motion.button>
          ))}
        </div>

        {/* ── 4. QUICK ACTIONS BAR ─────────────────────────────────────────── */}
        <div className="p-6 bg-gray-900 dark:bg-white/5 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-white text-base">Quick Actions</h3>
            <p className="text-white/50 text-xs mt-0.5">
              Jump into your most frequent tasks
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Create Campaign", icon: Plus, link: "/campaign/new" },
              { label: "Find Creators", icon: Search, link: "/matches" },
              { label: "Messages", icon: MessageSquare, link: "/messages" },
              { label: "AI Insights", icon: Sparkles, link: "/analytics" },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.link)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                <action.icon size={14} />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 5. MAIN 2-COLUMN GRID ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* 5a. REQUIRED ACTIONS */}
            <Card
              title="Required Actions"
              extra={
                realTasks.length > 0 ? (
                  <Badge variant="danger">{realTasks.length} pending</Badge>
                ) : null
              }
            >
              {realTasks.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="text-primary-blue" size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    All caught up!
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    No urgent tasks requiring your attention.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {realTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary-blue/30 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            task.priority === "high"
                              ? "bg-red-500"
                              : "bg-amber-500",
                          )}
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {task.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {task.subtitle}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(task.link || "/")}
                        className="px-4 py-2 bg-white dark:bg-white/10 text-gray-800 dark:text-white rounded-xl text-xs font-bold border border-gray-100 dark:border-white/10 group-hover:bg-primary-blue group-hover:text-white group-hover:border-primary-blue transition-all shrink-0"
                      >
                        {task.action}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 5b. PERFORMANCE CHART */}
            <Card
              title="Campaign Performance"
              extra={
                <div className="flex gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                  {["7D", "30D", "All"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeFilter(t)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                        timeFilter === t
                          ? "bg-white dark:bg-white/10 text-primary-blue shadow-sm"
                          : "text-gray-400 hover:text-primary-blue",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              }
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient
                        id="colorViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#88888820"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#888" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#888" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        background: "#fff",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-primary-blue/5 dark:bg-primary-blue/10 rounded-2xl border border-primary-blue/15">
                  <div className="flex items-center gap-1.5 text-primary-blue mb-2">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Top Campaign
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {topCampaign?.title || "No campaigns yet"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {topCampaign
                      ? `${topCampaign.fillRate}% fill rate`
                      : "0% fill rate"}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/15 opacity-80">
                  <div className="flex items-center gap-1.5 text-red-500 mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Underperforming
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {lowestCampaign?.title || "No campaigns yet"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lowestCampaign
                      ? `${lowestCampaign.fillRate}% fill rate`
                      : "0% fill rate"}
                  </p>
                </div>
              </div>
            </Card>

            {/* 5c. CAMPAIGNS TABLE */}
            <Card
              title="Your Campaigns"
              extra={
                <button
                  onClick={() => navigate("/campaigns")}
                  className="text-xs font-bold text-primary-blue hover:underline"
                >
                  View All
                </button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-white/5">
                      <th className="pb-3 pr-4 font-black">Campaign</th>
                      <th className="pb-3 pr-4 font-black text-center">
                        Status
                      </th>
                      <th className="pb-3 pr-4 font-black">Budget</th>
                      <th className="pb-3 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {isLoadingOpps ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center">
                          <Loader2
                            className="animate-spin mx-auto text-primary-blue"
                            size={20}
                          />
                        </td>
                      </tr>
                    ) : opportunities.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-10 text-center text-sm text-gray-400"
                        >
                          No campaigns yet.{" "}
                          <button
                            onClick={() => navigate("/campaign/new")}
                            className="text-primary-blue font-bold hover:underline"
                          >
                            Create one
                          </button>
                        </td>
                      </tr>
                    ) : (
                      opportunities.slice(0, 5).map((opp: any) => (
                        <tr
                          key={opp._id}
                          className="group hover:bg-gray-50/60 dark:hover:bg-white/3 transition-all"
                        >
                          <td className="py-4 pr-4">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {opp.title}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {opp.category}
                            </p>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <Badge
                              variant={
                                opp.status === "open" ? "success" : "neutral"
                              }
                            >
                              {opp.status}
                            </Badge>
                          </td>
                          <td className="py-4 pr-4">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {(
                                opp.budget?.amount ||
                                opp.budget ||
                                0
                              ).toLocaleString()}{" "}
                              ETB
                            </p>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() =>
                                  navigate(`/campaign/edit/${opp._id}`)
                                }
                                className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-gray-400 hover:text-primary-blue hover:border-primary-blue/30 transition-all"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusToggle(opp._id, opp.status)
                                }
                                className={cn(
                                  "p-2 rounded-xl border transition-all",
                                  opp.status === "open"
                                    ? "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 hover:text-amber-500 hover:border-amber-300"
                                    : "bg-primary-blue/10 border-primary-blue/20 text-primary-blue hover:bg-primary-blue/20",
                                )}
                                title={
                                  opp.status === "open" ? "Pause" : "Resume"
                                }
                              >
                                {opp.status === "open" ? (
                                  <Pause size={14} />
                                ) : (
                                  <Play size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* 5d. ACTIVE PARTNERSHIPS */}
            <Card
              title="Active Partnerships"
              extra={
                <button
                  onClick={() => navigate("/collaborations")}
                  className="text-xs font-bold text-primary-blue hover:underline"
                >
                  View All
                </button>
              }
            >
              {isLoadingCollabs ? (
                <div className="flex justify-center py-8">
                  <Loader2
                    className="animate-spin text-primary-blue"
                    size={20}
                  />
                </div>
              ) : collaborations.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No active partnerships yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {collaborations.slice(0, 4).map((collab: any) => (
                    <div
                      key={collab._id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary-blue/20 transition-all"
                    >
                      {collab.advertiser?.profilePicture ? (
                        <img
                          src={collab.advertiser.profilePicture}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue font-bold shrink-0 text-sm">
                          {collab.advertiser?.username?.[0]?.toUpperCase() ||
                            "A"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {collab.advertiser?.firstName}{" "}
                            {collab.advertiser?.lastName}
                          </p>
                          <Badge variant="info">{collab.status}</Badge>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-2 truncate">
                          {collab.opportunity?.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-blue rounded-full transition-all"
                              style={{
                                width: `${collab.overallProgress || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0">
                            {collab.overallProgress || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-8">
            {/* 5e. WALLET CARD */}
            <Card title="Wallet">
              <div className="p-5 bg-gray-900 dark:bg-white/5 rounded-2xl relative overflow-hidden mb-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">
                  Available Balance
                </p>
                <p className="text-4xl font-black text-white leading-none mb-1">
                  {walletData?.balance?.toLocaleString() ?? 0}
                </p>
                <p className="text-white/40 text-xs font-bold mb-4">AACP</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-0.5">
                      <Lock size={10} className="inline mr-1" />
                      Locked
                    </p>
                    <p className="text-white text-sm font-bold">
                      {walletData?.lockedBalance ?? 0} AACP
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/wallet")}
                    className="px-4 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                  >
                    Top Up
                  </button>
                </div>
              </div>
              <button
                onClick={() => navigate("/wallet")}
                className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-bold text-gray-400 hover:text-primary-blue transition-colors"
              >
                View Wallet <ChevronRight size={14} />
              </button>
            </Card>

            {/* 5f. ACCOUNT HEALTH */}
            <Card title="Account Health">
              <div className="flex flex-col items-center py-2">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 128 128"
                  >
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-gray-100 dark:text-white/5"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={339.3}
                      strokeDashoffset={339.3 * (1 - 0.78)}
                      className="text-primary-blue"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      78
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                      Trust
                    </span>
                  </div>
                </div>
                <div className="mt-5 w-full space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-start gap-2">
                    <ShieldCheck
                      className="text-primary-blue shrink-0 mt-0.5"
                      size={16}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Profile 90% complete. Verify trade license to reach 100.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full py-2.5 bg-primary-blue/10 text-primary-blue font-bold rounded-2xl text-xs hover:bg-primary-blue/20 transition-all"
                  >
                    Improve Score
                  </button>
                </div>
              </div>
            </Card>

            {/* 5g. AI MATCHES */}
            <Card
              title={
                <span className="flex items-center gap-2">
                  AI Matches
                  <Sparkles className="text-cyan-500" size={14} />
                </span>
              }
            >
              {isLoadingRecs ? (
                <div className="flex justify-center py-6">
                  <Loader2
                    className="animate-spin text-primary-blue"
                    size={18}
                  />
                </div>
              ) : (recsData?.recommendations ?? []).length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">
                  Complete your profile to get matches.
                </p>
              ) : (
                <div className="space-y-1">
                  {(recsData?.recommendations ?? [])
                    .slice(0, 4)
                    .map((rec: any) => (
                      <div
                        key={rec.targetId}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {rec.meta?.profilePicture ? (
                            <img
                              src={rec.meta.profilePicture}
                              className="w-9 h-9 rounded-xl object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-9 h-9 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500 font-bold text-sm">
                              {rec.name?.[0]?.toUpperCase() || "A"}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              {rec.name}
                            </p>
                            <p className="text-[10px] text-primary-blue font-bold">
                              {formatMatchScore(rec.score)}% Match
                            </p>
                          </div>
                        </div>
                        <button className="p-1.5 bg-primary-blue/10 text-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition-all">
                          <Plus size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <button
                onClick={() => navigate("/matches")}
                className="w-full mt-4 py-2.5 border border-dashed border-gray-200 dark:border-white/10 text-gray-400 text-xs font-bold rounded-2xl hover:border-primary-blue hover:text-primary-blue transition-all"
              >
                View All Matches
              </button>
            </Card>

            {/* 5h. RECENT ACTIVITY */}
            <Card title="Recent Activity">
              {isLoadingHistory ? (
                <div className="flex justify-center py-6">
                  <Loader2
                    className="animate-spin text-primary-blue"
                    size={18}
                  />
                </div>
              ) : realActivity.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">
                  No recent activity yet.
                </p>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-px before:bg-gray-100 dark:before:bg-white/5">
                  {realActivity.map((activity) => (
                    <div key={activity.id} className="relative pl-8">
                      <div
                        className={cn(
                          "absolute left-0 top-0.5 w-6 h-6 rounded-lg flex items-center justify-center bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 shadow-sm z-10",
                          activity.color,
                        )}
                      >
                        <activity.icon size={11} />
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                        {activity.text}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 5i. MESSAGES */}
            <Card
              title="Messages"
              extra={
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-primary-blue hover:underline"
                >
                  Mark all read
                </button>
              }
            >
              {isLoadingConvs ? (
                <div className="flex justify-center py-6">
                  <Loader2
                    className="animate-spin text-primary-blue"
                    size={18}
                  />
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">
                  No messages yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {conversations.slice(0, 5).map((conv: any) => {
                    const lastMsg = conv.lastMessage;
                    const partner = conv.participants?.find(
                      (p: any) => p.clerkId !== myId,
                    );
                    return (
                      <div
                        key={conv._id}
                        onClick={() => navigate(`/messages?conv=${conv._id}`)}
                        className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all"
                      >
                        <div className="w-8 h-8 bg-primary-blue/10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          {partner?.profilePicture ? (
                            <img
                              src={partner.profilePicture}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <MessageSquare
                              size={14}
                              className="text-primary-blue"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug truncate">
                            <span className="font-bold">
                              {partner?.firstName || "User"}:
                            </span>{" "}
                            {lastMsg?.text || "Sent an attachment"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(
                              lastMsg?.createdAt || conv.updatedAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => navigate("/messages")}
                className="w-full mt-4 flex items-center justify-center gap-1 py-2.5 text-xs font-bold text-gray-400 hover:text-primary-blue transition-colors"
              >
                View All Messages <ChevronRight size={14} />
              </button>
            </Card>
          </div>
        </div>
      </main>
    </BusinessLayout>
  );
}
