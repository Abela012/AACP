import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Zap,
    Target,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Globe,
    BarChart3,
    PieChart as PieChartIcon,
    ShieldCheck,
    DollarSign,
    Users,
    ArrowUpRight
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area,
} from 'recharts';
import { cn } from '@/src/shared/utils/cn';
import type { PredictiveAnalysisResult } from '@/src/api/marketingAnalysisApi';

interface Props {
    data: PredictiveAnalysisResult;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function PredictiveAnalysisDashboard({ data }: Props) {
    const { metrics, projections, audienceInfo, primaryPlatform, contentStyle, summary, profitable, roi, profit } = data;

    const funnelData = [
        { name: 'Reach', value: metrics.reach, color: '#10b981' },
        { name: 'Engagement', value: Math.round(metrics.reach * (metrics.engagementRate / 100)), color: '#3b82f6' },
        { name: 'Conversions', value: metrics.estimatedConversions, color: '#f59e0b' },
    ];

    const performanceData = [
        { name: 'Views', value: metrics.avgViews, full: metrics.followers },
        { name: 'Likes', value: metrics.totalLikes, full: metrics.followers },
        { name: 'Shares', value: metrics.avgShares, full: metrics.followers },
        { name: 'Comments', value: metrics.avgComments, full: metrics.followers },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. TOP ANALYTICS SECTION */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={cn(
                    "p-4 rounded-2xl border shadow-xs flex flex-col justify-between",
                    profitable ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20" : "bg-amber-50/50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20"
                )}>
                    <div className="flex justify-between items-start mb-2">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", profitable ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                            <TrendingUp size={16} />
                        </div>
                        <span className={cn("text-[8px] font-black uppercase tracking-tighter", profitable ? "text-emerald-600" : "text-amber-600")}>
                            {profitable ? 'Profitable' : 'Risky'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">ROI Score</p>
                        <h3 className={cn("text-lg font-black", profitable ? "text-emerald-600" : "text-amber-600")}>
                            {(roi || 0) > 0 ? '+' : ''}{(roi || 0)}%
                        </h3>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600">
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Est. Profit</p>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">{(profit || 0).toLocaleString()} <span className="text-[10px]">ETB</span></h3>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600">
                            <Target size={16} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Est. Reach</p>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">{(metrics?.reach || 0).toLocaleString()}</h3>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600">
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Confidence</p>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">High</h3>
                    </div>
                </div>
            </div>

            {/* 2. PERFORMANCE CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 6-Month Projection Chart */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xs">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp size={12} /> 6-Month ROI Projection
                    </h4>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height={192} minWidth={0}>
                            <AreaChart data={projections} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-white/5" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 700 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xs">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <PieChartIcon size={12} /> Campaign Funnel
                    </h4>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height={192} minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={funnelData}
                                    cx="50%" cy="50%"
                                    innerRadius={40} outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        {funnelData.map((item) => (
                            <div key={item.name} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[8px] font-bold text-gray-500">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. PROFILE SNAPSHOT */}
            <div className="bg-gray-50 dark:bg-white/2 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Primary Platform</p>
                        <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1">
                            <Globe size={12} className="text-blue-500" /> {primaryPlatform || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Content Style</p>
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">{contentStyle || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Audience</p>
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                            {audienceInfo?.topCountry || 'N/A'} ({audienceInfo?.gender || 'N/A'})
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Engagement</p>
                        <p className="text-xs font-black text-emerald-600">{(metrics?.engagementRate || 0)}%</p>
                    </div>
                </div>
            </div>

            {/* 4. AI INSIGHT SECTION */}
            <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-emerald-500" size={16} />
                    <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">AI Strategic Verdict</h4>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                    "{summary}"
                </p>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
                    <CheckCircle2 size={12} /> Suitable for Brand Awareness
                </div>
            </div>
        </div>
    );
}
