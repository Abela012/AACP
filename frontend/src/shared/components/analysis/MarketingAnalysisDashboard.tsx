import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Search,
  MessageSquare,
  Star,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/src/shared/utils/cn";
import type {
  MarketingAnalysisResult,
  ApplicantAnalysis,
} from "@/src/api/marketingAnalysisApi";

interface Props {
  data: MarketingAnalysisResult;
  onSelectApplicant?: (id: string) => void;
}

export default function MarketingAnalysisDashboard({
  data,
  onSelectApplicant,
}: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | "All">(
    "All",
  );

  // Collect unique platforms across the candidate pool
  const allPlatforms = Array.from(
    new Set(data.analysis.flatMap((a) => a.platforms || [])),
  );

  // Filter analysis by selected platform (or show all)
  const filteredAnalysis =
    selectedPlatform === "All"
      ? data.analysis
      : data.analysis.filter((a) =>
          (a.platforms || []).includes(selectedPlatform),
        );

  const topApplicant =
    data.bestChoice || filteredAnalysis[0] || data.analysis[0];
  const insights = data.aiInsights;

  // Chart Data Preparation
  const reachVsEngagementData = filteredAnalysis.slice(0, 6).map((a) => ({
    name: a.advertiserName.split(" ")[0],
    reach: a.estimatedReach,
    engagement: a.estimatedEngagement,
    score: a.aiMatchScore,
  }));

  const roiProfitData = filteredAnalysis.slice(0, 8).map((a) => ({
    name: a.advertiserName.split(" ")[0],
    roi: a.profitPercentage,
    profit: a.profit,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. TOP ANALYTICS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "p-6 rounded-4xl border shadow-sm flex flex-col justify-between relative overflow-hidden",
            topApplicant?.profitable
              ? "bg-neutral-border/15/50 border-neutral-border/25 dark:bg-primary-blue/5 dark:border-primary-blue/20"
              : "bg-amber-50/50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20",
          )}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                topApplicant?.profitable
                  ? "bg-neutral-border/25 text-primary-blue"
                  : "bg-amber-100 text-amber-600",
              )}
            >
              <TrendingUp size={24} />
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                topApplicant?.profitable
                  ? "bg-primary-blue text-black"
                  : "bg-amber-500 text-white",
              )}
            >
              {topApplicant?.profitable ? "Profitable" : "Risky"}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Overall Profitability
            </p>
            <h3
              className={cn(
                "text-3xl font-black",
                topApplicant?.profitable
                  ? "text-primary-blue"
                  : "text-amber-600",
              )}
            >
              {insights?.businessOutcome?.expectedCampaignOutcome ||
                (topApplicant?.profitable ? "High Potential" : "Moderate")}
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-4xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
              <Zap size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Est. ROI
              </p>
              <p className="text-xl font-black text-blue-600">
                +{topApplicant?.profitPercentage || 0}%
              </p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Max Projected Return
            </p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {(topApplicant?.profit || 0).toLocaleString()}{" "}
              <span className="text-sm font-bold text-gray-400 uppercase tracking-normal">
                {topApplicant?.currency}
              </span>
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-4xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary-blue-light dark:bg-primary-blue-light0/10 rounded-2xl flex items-center justify-center text-primary-blue">
              <Target size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Match Score
              </p>
              <p className="text-xl font-black text-primary-blue">
                {topApplicant?.aiMatchScore || 0}%
              </p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              AI Audience Fit
            </p>
            <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary-blue-light0 transition-all duration-1000"
                style={{ width: `${topApplicant?.aiMatchScore || 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-4xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
              <ShieldCheck size={24} />
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                "bg-amber-100 text-amber-600 dark:bg-amber-500/20",
              )}
            >
              {insights?.overallAnalysis?.competitionLevel || "Medium"}{" "}
              Competition
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Risk Assessment
            </p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-2">
              {insights?.risks?.[0] ||
                "Market alignment looks strong with low saturation."}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Platform selector (when multiple platforms exist) */}
      {allPlatforms.length > 1 && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelectedPlatform("All")}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-bold",
              selectedPlatform === "All"
                ? "bg-primary-blue text-black"
                : "bg-gray-100 dark:bg-white/5 text-gray-600",
            )}
          >
            All Platforms
          </button>
          {allPlatforms.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-bold",
                selectedPlatform === p
                  ? "bg-primary-blue text-black"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* 2. PERFORMANCE CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Followers vs Reach Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Reach vs Engagement
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Comparing top 6 applicants by estimated visibility
              </p>
            </div>
            <BarChart3 className="text-gray-300" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={288} minWidth={0}>
              <BarChart
                data={reachVsEngagementData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                  className="dark:stroke-white/5"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                />
                <Bar
                  dataKey="reach"
                  name="Est. Reach"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="engagement"
                  name="Est. Engagement"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ROI & Profit Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Profitability Trend
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                Estimated ROI percentage across candidate pool
              </p>
            </div>
            <TrendingUp className="text-gray-300" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={288} minWidth={0}>
              <AreaChart
                data={roiProfitData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                  className="dark:stroke-white/5"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#1a1a1a",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="roi"
                  name="ROI %"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRoi)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 3. AI BUSINESS INSIGHT SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-linear-to-br from-primary-blue to-primary-blue rounded-[3rem] p-1 shadow-2xl overflow-hidden"
      >
        <div className="bg-white dark:bg-[#0a0a0a] rounded-[2.8rem] p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-blue text-black rounded-2xl flex items-center justify-center shadow-lg shadow-primary-blue/20">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    Strategic Campaign Analysis
                  </h3>
                  <p className="text-xs text-primary-blue font-bold uppercase tracking-widest">
                    AI Intelligence Report
                  </p>
                </div>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                  {data.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-neutral-border/15/50 dark:bg-primary-blue/5 p-6 rounded-3xl border border-neutral-border/25 dark:border-primary-blue/10">
                  <h4 className="text-[10px] font-black text-primary-blue uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target size={14} /> Market Fit Prediction
                  </h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                    {insights?.overallAnalysis?.marketFit ||
                      "The audience demographics overlap 85% with your target industry profile."}
                  </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-500/5 p-6 rounded-3xl border border-blue-100 dark:border-blue-500/10">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase size={14} /> Strategic Recommendation
                  </h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                    {insights?.overallAnalysis?.strategicRecommendation ||
                      "Consider moving forward with creators who show high engagement over raw follower count."}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3 flex flex-col gap-6">
              <div className="bg-gray-50 dark:bg-white/2 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">
                  Key Findings
                </h4>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 bg-neutral-border/25 dark:bg-primary-blue/20 text-primary-blue rounded-xl flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 dark:text-white mb-0.5">
                        Pool Quality
                      </p>
                      <p className="text-[11px] font-bold text-gray-500">
                        {insights?.overallAnalysis?.poolQuality ||
                          "High quality"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center">
                      <Layers size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 dark:text-white mb-0.5">
                        Budget Efficiency
                      </p>
                      <p className="text-[11px] font-bold text-gray-500">
                        {insights?.businessOutcome?.budgetEfficiency ||
                          "Optimal allocation"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 dark:text-white mb-0.5">
                        Potential Risks
                      </p>
                      <p className="text-[11px] font-bold text-gray-500">
                        {insights?.risks?.[0] || "Minor overlap issues"}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-10 py-4 bg-primary-blue text-black font-black rounded-2xl text-sm shadow-xl shadow-primary-blue/20 hover:bg-neutral-border transition-all flex items-center justify-center gap-2">
                  Generate Full PDF Report <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. DECISION SUPPORT PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Best Overall Choice",
            key: "bestOverallChoice",
            icon: Star,
            color: "text-amber-500",
            bgColor: "bg-amber-50",
          },
          {
            title: "Safest Investment",
            key: "safestInvestment",
            icon: ShieldCheck,
            color: "text-primary-blue",
            bgColor: "bg-neutral-border/15",
          },
          {
            title: "Highest Growth Potential",
            key: "highestGrowthPotential",
            icon: Zap,
            color: "text-blue-500",
            bgColor: "bg-blue-50",
          },
          {
            title: "Best ROI Performance",
            key: "bestROI",
            icon: DollarSign,
            color: "text-primary-blue",
            bgColor: "bg-primary-blue-light",
          },
        ].map((rec) => {
          const recData = (insights?.topRecommendations as any)?.[rec.key];
          const advertiser = data.analysis.find(
            (a) => a.advertiserId === recData?.advertiserId,
          );

          return (
            <motion.div
              key={rec.key}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-white/5 p-6 rounded-4xl border border-gray-100 dark:border-white/5 shadow-sm group hover:border-primary-blue/30 transition-all cursor-pointer"
              onClick={() =>
                advertiser && onSelectApplicant?.(advertiser.advertiserId)
              }
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    rec.bgColor,
                    "dark:bg-white/10",
                  )}
                >
                  <rec.icon size={20} className={rec.color} />
                </div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {rec.title}
                </h4>
              </div>

              {advertiser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                      <img
                        src={
                          advertiser.profilePicture ||
                          `https://ui-avatars.com/api/?name=${advertiser.advertiserName}&background=10b981&color=fff`
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                        {advertiser.advertiserName}
                      </p>
                      <p className="text-[10px] font-bold text-primary-blue">
                        {advertiser.profitPercentage}% ROI
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-gray-500 line-clamp-2 leading-relaxed">
                    {recData?.reason ||
                      "Selected based on optimal engagement-to-cost ratio."}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 group-hover:text-primary-blue transition-colors pt-2 border-t border-gray-50 dark:border-white/5">
                    View Analysis <ChevronRight size={12} />
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs font-bold text-gray-300">
                    Processing selection...
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
