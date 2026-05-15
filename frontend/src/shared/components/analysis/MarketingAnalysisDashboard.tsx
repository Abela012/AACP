import React from 'react';
import { motion } from 'framer-motion';
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
    Globe,
    BarChart3,
    PieChart as PieChartIcon,
    ShieldCheck,
    Briefcase,
    ChevronRight,
    Search,
    MessageSquare,
    Star,
    Layers,
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
    LineChart,
    Line,
    AreaChart,
    Area,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from 'recharts';
import { cn } from '@/src/shared/utils/cn';
import type { MarketingAnalysisResult, ApplicantAnalysis } from '@/src/api/marketingAnalysisApi';

interface Props {
    data: MarketingAnalysisResult;
    onSelectApplicant?: (id: string) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function MarketingAnalysisDashboard({ data, onSelectApplicant }: Props) {
    const topApplicant = data.bestChoice || data.analysis[0];
    const insights = data.aiInsights;

    // Chart Data Preparation
    const reachVsEngagementData = data.analysis.slice(0, 6).map(a => ({
        name: a.advertiserName.split(' ')[0],
        reach: a.estimatedReach,
        engagement: a.estimatedEngagement,
        score: a.aiMatchScore
    }));

    const roiProfitData = data.analysis.slice(0, 8).map(a => ({
        name: a.advertiserName.split(' ')[0],
        roi: a.profitPercentage,
        profit: a.profit,
    }));

    const audienceData = data.analysis.reduce((acc: any[], curr) => {
        const country = curr.audienceCountry || 'Other';
        const existing = acc.find(item => item.name === country);
        if (existing) existing.value += 1;
        else acc.push({ name: country, value: 1 });
        return acc;
    }, []).sort((a, b) => b.value - a.value).slice(0, 5);

    const platformDistribution = data.analysis.reduce((acc: any[], curr) => {
        curr.platforms.forEach(p => {
            const existing = acc.find(item => item.name === p);
            if (existing) existing.value += 1;
            else acc.push({ name: p, value: 1 });
        });
        return acc;
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* 1. TOP ANALYTICS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={cn(
                        "p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between relative overflow-hidden",
                        topApplicant?.profitable 
                            ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20" 
                            : "bg-amber-50/50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20"
                    )}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            topApplicant?.profitable ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                        )}>
                            <TrendingUp size={24} />
                        </div>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            topApplicant?.profitable ? "bg-emerald-500 text-black" : "bg-amber-500 text-white"
                        )}>
                            {topApplicant?.profitable ? 'Profitable' : 'Risky'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Overall Profitability</p>
                        <h3 className={cn(
                            "text-3xl font-black",
                            topApplicant?.profitable ? "text-emerald-600" : "text-amber-600"
                        )}>
                            {insights?.businessOutcome?.expectedCampaignOutcome || (topApplicant?.profitable ? 'High Potential' : 'Moderate')}
                        </h3>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                            <Zap size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. ROI</p>
                            <p className="text-xl font-black text-blue-600">+{topApplicant?.profitPercentage || 0}%</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Max Projected Return</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                            {(topApplicant?.profit || 0).toLocaleString()} <span className="text-sm font-bold text-gray-400 uppercase tracking-normal">{topApplicant?.currency}</span>
                        </h3>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                            <Target size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Match Score</p>
                            <p className="text-xl font-black text-purple-600">{topApplicant?.aiMatchScore || 0}%</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Audience Fit</p>
                        <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                            <div 
                                className="h-full bg-purple-500 transition-all duration-1000" 
                                style={{ width: `${topApplicant?.aiMatchScore || 0}%` }} 
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                            <ShieldCheck size={24} />
                        </div>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            "bg-amber-100 text-amber-600 dark:bg-amber-500/20"
                        )}>
                            {insights?.overallAnalysis?.competitionLevel || 'Medium'} Competition
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk Assessment</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-2">
                            {insights?.risks?.[0] || 'Market alignment looks strong with low saturation.'}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* 2. PERFORMANCE CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Followers vs Reach Bar Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Reach vs Engagement</h3>
                            <p className="text-xs text-gray-400 font-medium">Comparing top 6 applicants by estimated visibility</p>
                        </div>
                        <BarChart3 className="text-gray-300" />
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reachVsEngagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-white/5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                />
                                <Bar dataKey="reach" name="Est. Reach" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                                <Bar dataKey="engagement" name="Est. Engagement" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* ROI & Profit Line Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Profitability Trend</h3>
                            <p className="text-xs text-gray-400 font-medium">Estimated ROI percentage across candidate pool</p>
                        </div>
                        <TrendingUp className="text-gray-300" />
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={roiProfitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-white/5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="roi" name="ROI %" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRoi)" />
                                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={2} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Audience Demographics */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Audience Geography</h3>
                            <p className="text-xs text-gray-400 font-medium">Primary location distribution of current applicants</p>
                        </div>
                        <Globe className="text-gray-300" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-60 w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={audienceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {audienceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            {audienceData.map((item, index) => (
                                <div key={item.name} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900 dark:text-white">
                                        {Math.round((item.value / data.analysis.length) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* AI Predictive Radar */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Market Fit Strength</h3>
                            <p className="text-xs text-gray-400 font-medium">Multidimensional analysis of top applicant</p>
                        </div>
                        <Sparkles className="text-gray-300" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: 'ROI', A: topApplicant?.profitPercentage > 100 ? 100 : topApplicant?.profitPercentage || 0, fullMark: 100 },
                                { subject: 'Reach', A: (topApplicant?.followers / 500000) * 100, fullMark: 100 },
                                { subject: 'Audience', A: topApplicant?.aiMatchScore || 0, fullMark: 100 },
                                { subject: 'Engagement', A: (topApplicant?.engagementRate / 10) * 100, fullMark: 100 },
                                { subject: 'Pricing', A: 85, fullMark: 100 },
                                { subject: 'Brand Fit', A: topApplicant?.aiMatchScore || 70, fullMark: 100 },
                            ]}>
                                <PolarGrid stroke="#f3f4f6" className="dark:stroke-white/5" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                                <Radar name="Top Choice" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* 3. AI BUSINESS INSIGHT SECTION */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-[3rem] p-1 shadow-2xl overflow-hidden"
            >
                <div className="bg-white dark:bg-[#0a0a0a] rounded-[2.8rem] p-8 md:p-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-2/3 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-500 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Strategic Campaign Analysis</h3>
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">AI Intelligence Report</p>
                                </div>
                            </div>

                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                                    {data.summary}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/10">
                                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Target size={14} /> Market Fit Prediction
                                    </h4>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                                        {insights?.overallAnalysis?.marketFit || 'The audience demographics overlap 85% with your target industry profile.'}
                                    </p>
                                </div>
                                <div className="bg-blue-50/50 dark:bg-blue-500/5 p-6 rounded-3xl border border-blue-100 dark:border-blue-500/10">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Briefcase size={14} /> Strategic Recommendation
                                    </h4>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                                        {insights?.overallAnalysis?.strategicRecommendation || 'Consider moving forward with creators who show high engagement over raw follower count.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/3 flex flex-col gap-6">
                            <div className="bg-gray-50 dark:bg-white/2 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Key Findings</h4>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-xl flex items-center justify-center">
                                            <TrendingUp size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 dark:text-white mb-0.5">Pool Quality</p>
                                            <p className="text-[11px] font-bold text-gray-500">{insights?.overallAnalysis?.poolQuality || 'High quality'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center">
                                            <Layers size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 dark:text-white mb-0.5">Budget Efficiency</p>
                                            <p className="text-[11px] font-bold text-gray-500">{insights?.businessOutcome?.budgetEfficiency || 'Optimal allocation'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center">
                                            <AlertCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 dark:text-white mb-0.5">Potential Risks</p>
                                            <p className="text-[11px] font-bold text-gray-500">{insights?.risks?.[0] || 'Minor overlap issues'}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-10 py-4 bg-emerald-500 text-black font-black rounded-2xl text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
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
                    { title: 'Best Overall Choice', key: 'bestOverallChoice', icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-50' },
                    { title: 'Safest Investment', key: 'safestInvestment', icon: ShieldCheck, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
                    { title: 'Highest Growth Potential', key: 'highestGrowthPotential', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-50' },
                    { title: 'Best ROI Performance', key: 'bestROI', icon: DollarSign, color: 'text-purple-500', bgColor: 'bg-purple-50' },
                ].map((rec) => {
                    const recData = (insights?.topRecommendations as any)?.[rec.key];
                    const advertiser = data.analysis.find(a => a.advertiserId === recData?.advertiserId);
                    
                    return (
                        <motion.div 
                            key={rec.key}
                            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                            className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm group hover:border-emerald-500/30 transition-all cursor-pointer"
                            onClick={() => advertiser && onSelectApplicant?.(advertiser.advertiserId)}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", rec.bgColor, "dark:bg-white/10")}>
                                    <rec.icon size={20} className={rec.color} />
                                </div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rec.title}</h4>
                            </div>
                            
                            {advertiser ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                            <img src={advertiser.profilePicture || `https://ui-avatars.com/api/?name=${advertiser.advertiserName}&background=10b981&color=fff`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{advertiser.advertiserName}</p>
                                            <p className="text-[10px] font-bold text-emerald-600">{advertiser.profitPercentage}% ROI</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-500 line-clamp-2 leading-relaxed">
                                        {recData?.reason || 'Selected based on optimal engagement-to-cost ratio.'}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 group-hover:text-emerald-500 transition-colors pt-2 border-t border-gray-50 dark:border-white/5">
                                        View Analysis <ChevronRight size={12} />
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-xs font-bold text-gray-300">Processing selection...</p>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
