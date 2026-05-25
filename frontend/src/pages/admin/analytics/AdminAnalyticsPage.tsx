import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  UserPlus,
  UserCheck,
  Calendar,
  AlertCircle,
  Loader2,
  ShieldCheck,
  BarChart2,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import AdminLayout from "@/src/shared/components/layouts/AdminLayout";
import { useAdminStats, parseRoleBreakdown } from "@/src/hooks/useAdminStats";
import {
  useApplicantMetrics,
  useProfitabilityMetrics,
} from "@/src/hooks/useAdminAnalytics";

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading, isError } = useAdminStats();
  const { data: applicantMetrics, isLoading: metricsLoading } =
    useApplicantMetrics(6);
  const { data: profitabilityMetrics, isLoading: profitLoading } =
    useProfitabilityMetrics(8);

  // Derive display values from real API data
  const totalUsers = stats?.totalUsers ?? 0;
  const recentUsers = stats?.recentUsers ?? 0;
  const verifiedUsers = stats?.verifiedUsers ?? 0;
  const suspendedUsers = stats?.suspendedUsers ?? 0;
  const roleBreakdown = stats?.byRole
    ? parseRoleBreakdown(stats.byRole, totalUsers)
    : [];

  // Overview stat cards
  const overviewStats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      change: recentUsers > 0 ? `+${recentUsers} this month` : "No new users",
      up: recentUsers > 0,
      icon: Users,
      bg: "bg-neutral-border/15 dark:bg-primary-blue/10",
      iconColor: "text-primary-blue",
      border: "border-neutral-border/25 dark:border-primary-blue/20",
    },
    {
      label: "Verified Users",
      value: verifiedUsers.toLocaleString(),
      change:
        totalUsers > 0
          ? `${Math.round((verifiedUsers / totalUsers) * 100)}% of total`
          : "0%",
      up: true,
      icon: ShieldCheck,
      bg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600",
      border: "border-blue-100 dark:border-blue-500/20",
    },
    {
      label: "New This Month",
      value: recentUsers.toLocaleString(),
      change: recentUsers > 0 ? "Recent growth" : "No new signups",
      up: recentUsers > 0,
      icon: TrendingUp,
      bg: "bg-neutral-border/15 dark:bg-primary-blue/10",
      iconColor: "text-primary-blue",
      border: "border-neutral-border/25 dark:border-primary-blue/20",
    },
    {
      label: "Suspended",
      value: suspendedUsers.toLocaleString(),
      change:
        suspendedUsers === 0 ? "All accounts healthy" : "Requires attention",
      up: suspendedUsers === 0,
      icon: Activity,
      bg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600",
      border: "border-amber-100 dark:border-amber-500/20",
    },
  ];

  // Registration breakdown
  const registrationStats = [
    { period: "Total Users", count: totalUsers, icon: UserPlus },
    { period: "Verified", count: verifiedUsers, icon: UserCheck },
    { period: "New (30d)", count: recentUsers, icon: Calendar },
  ];

  // Prepare chart data from real API
  const reachEngagementData = (applicantMetrics ?? []).map((m: any) => ({
    name: m.advertiserName?.split(" ")[0] || "Unknown",
    reach: m.reach ?? 0,
    engagement: m.engagement ?? 0,
  }));

  const profitabilityData = (profitabilityMetrics ?? []).map((m: any) => ({
    name: m.advertiserName?.split(" ")[0] || "Unknown",
    roi: m.estimatedROI ?? 0,
    completed: m.completedCollaborations ?? 0,
  }));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2
              size={48}
              className="text-primary-blue animate-spin mx-auto mb-4"
            />
            <p className="text-sm font-bold text-[#6F767E]">
              Loading analytics...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white mb-2">
              Platform Analytics
            </h1>
            <p className="text-sm font-medium text-[#6F767E] dark:text-gray-400">
              {isError
                ? "Could not load live data — showing partial view."
                : "Live overview of platform performance and user metrics."}
            </p>
          </div>
        </div>

        {isError && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Could not fetch live data from the API. Ensure the backend is
              running at{" "}
              {import.meta.env.VITE_API_URL ||
                "https://aacp.onrender.com/api/v1"}
              .
            </p>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {overviewStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white dark:bg-[#111111] p-6 rounded-4xl border border-[#EFEFEF] dark:border-white/5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.iconColor} border ${stat.border}`}
                >
                  <stat.icon size={20} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-bold ${stat.up ? "text-primary-blue" : "text-amber-500"}`}
                >
                  {stat.up ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  <span className="max-w-[80px] text-right leading-tight">
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <span className="text-2xl font-black">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Reach vs Engagement Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-extrabold text-lg">Reach vs Engagement</h3>
                <p className="text-xs text-[#9A9FA5] font-medium mt-1">
                  Top 6 advertisers by actual performance metrics
                </p>
              </div>
              <BarChart2 size={20} className="text-[#9A9FA5]" />
            </div>
            {metricsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="text-primary-blue animate-spin" />
              </div>
            ) : reachEngagementData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <BarChart3
                  size={40}
                  className="text-[#EFEFEF] dark:text-white/10 mb-4"
                />
                <p className="text-sm font-bold text-[#9A9FA5]">
                  No analytics data available
                </p>
                <p className="text-xs text-[#9A9FA5] mt-1">
                  Data will appear once advertisers have social profiles
                </p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reachEngagementData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F4F4F4"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9A9FA5", fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9A9FA5", fontWeight: 700 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        backgroundColor: "#1a1a1a",
                        color: "#fff",
                      }}
                      cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    />
                    <Bar
                      dataKey="reach"
                      name="Reach"
                      fill="#0070BB"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="engagement"
                      name="Engagement"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {reachEngagementData.length > 0 && (
              <div className="flex items-center gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-blue rounded-full" />
                  <span className="text-xs font-bold text-[#6F767E]">
                    Reach
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-bold text-[#6F767E]">
                    Engagement
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Profitability Trend Chart */}
          <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-extrabold text-lg">Profitability Trend</h3>
                <p className="text-xs text-[#9A9FA5] font-medium mt-1">
                  Estimated ROI based on collaboration completion rate
                </p>
              </div>
              <TrendingUp size={20} className="text-[#9A9FA5]" />
            </div>
            {profitLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="text-primary-blue animate-spin" />
              </div>
            ) : profitabilityData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <TrendingUp
                  size={40}
                  className="text-[#EFEFEF] dark:text-white/10 mb-4"
                />
                <p className="text-sm font-bold text-[#9A9FA5]">
                  No profitability data available
                </p>
                <p className="text-xs text-[#9A9FA5] mt-1">
                  Data will appear once collaborations are completed
                </p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={profitabilityData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="roiGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0070BB"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0070BB"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F4F4F4"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9A9FA5", fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#9A9FA5", fontWeight: 700 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        backgroundColor: "#1a1a1a",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="roi"
                      name="Est. ROI %"
                      stroke="#0070BB"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#roiGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      name="Completed Collabs"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {profitabilityData.length > 0 && (
              <div className="flex items-center gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-blue rounded-full" />
                  <span className="text-xs font-bold text-[#6F767E]">
                    Est. ROI %
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-bold text-[#6F767E]">
                    Completed Collabs
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Row: Role Distribution + Registrations + Platform Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Role Distribution */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
            <h3 className="font-extrabold text-lg mb-8">Role Distribution</h3>
            <div className="relative w-40 h-40 mx-auto mb-10">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {
                  roleBreakdown.reduce(
                    (acc, role, idx) => {
                      const offset = acc.offset;
                      acc.elements.push(
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={role.color}
                          strokeWidth="4"
                          strokeDasharray={`${role.percentage * 0.88} ${88 - role.percentage * 0.88}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-500"
                        />,
                      );
                      acc.offset += role.percentage * 0.88;
                      return acc;
                    },
                    { elements: [] as React.ReactNode[], offset: 0 },
                  ).elements
                }
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-black block">
                    {totalUsers.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-[#9A9FA5] uppercase">
                    Total
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {roleBreakdown.length > 0 ? (
                roleBreakdown.map((role, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="text-xs font-bold">{role.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[#9A9FA5]">
                        {role.count.toLocaleString()}
                      </span>
                      <span className="text-xs font-black">
                        {role.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#9A9FA5] text-center">
                  No role data available
                </p>
              )}
            </div>
          </div>

          {/* Registration Stats */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <h3 className="font-extrabold text-lg mb-8">Registrations</h3>
              <div className="space-y-6">
                {registrationStats.map((signup, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-[#F8F8FD] dark:bg-white/5 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-border/25 dark:bg-primary-blue/20 rounded-xl flex items-center justify-center text-primary-blue">
                        <signup.icon size={18} />
                      </div>
                      <span className="text-xs font-bold">{signup.period}</span>
                    </div>
                    <span className="text-lg font-black">
                      {signup.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="lg:col-span-4 bg-primary-blue p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold mb-2">Platform Health</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-8">
                Live Status
              </p>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest opacity-80">
                    <span>Verification Rate</span>
                    <span>
                      {totalUsers > 0
                        ? Math.round((verifiedUsers / totalUsers) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0}%`,
                      }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-white"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest opacity-80">
                    <span>Account Health</span>
                    <span>
                      {totalUsers > 0
                        ? Math.round(
                            ((totalUsers - suspendedUsers) / totalUsers) * 100,
                          )
                        : 100}
                      %
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${totalUsers > 0 ? ((totalUsers - suspendedUsers) / totalUsers) * 100 : 100}%`,
                      }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <span className="text-4xl font-black">
                  {(totalUsers - suspendedUsers).toLocaleString()}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
                  Active Accounts
                </p>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
