import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ChevronDown,
  Zap,
  Eye,
  Video
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
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

export default function AdvertiserAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);

  const data30Days = [
    { name: 'Mon', reach: 0, engagement: 0 },
    { name: 'Tue', reach: 0, engagement: 0 },
    { name: 'Wed', reach: 0, engagement: 0 },
    { name: 'Thu', reach: 0, engagement: 0 },
    { name: 'Fri', reach: 0, engagement: 0 },
    { name: 'Sat', reach: 0, engagement: 0 },
    { name: 'Sun', reach: 0, engagement: 0 },
  ];

  const data7Days = [
    { name: 'Mon', reach: 0, engagement: 0 },
    { name: 'Tue', reach: 0, engagement: 0 },
    { name: 'Wed', reach: 0, engagement: 0 },
    { name: 'Thu', reach: 0, engagement: 0 },
    { name: 'Fri', reach: 0, engagement: 0 },
    { name: 'Sat', reach: 0, engagement: 0 },
    { name: 'Sun', reach: 0, engagement: 0 },
  ];

  const currentData = timeRange === 'Last 7 Days' ? data7Days : data30Days;



  const platformData = [
    { name: 'TikTok', value: 0, color: '#10b981' },
    { name: 'Instagram', value: 0, color: '#ec4899' },
    { name: 'YouTube', value: 0, color: '#ef4444' },
  ];

  const stats = [
    { label: 'Total Reach', value: '0', trend: '0%', trendType: 'neutral', icon: Eye, color: 'text-primary-blue', bgColor: 'bg-neutral-border/15' },
    { label: 'Avg. Engagement', value: '0%', trend: '0%', trendType: 'neutral', icon: Zap, iconColor: 'text-amber-500', bgColor: 'bg-amber-50' },
    { label: 'Total Earnings', value: '$0', trend: '0%', trendType: 'neutral', icon: DollarSign, color: 'text-primary-blue', bgColor: 'bg-neutral-border/15' },
    { label: 'Active Campaigns', value: '0', trend: '0', trendType: 'neutral', icon: Video, color: 'text-primary-blue', bgColor: 'bg-primary-blue-light' },
  ];

  return (
    <AdvertiserLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Creator Insights</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Track your content performance and earnings across all platforms.</p>
          </div>
          <div className="flex gap-3 relative">
            <button 
              onClick={() => setShowRangeDropdown(!showRangeDropdown)}
              className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 px-6 py-3 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-all border-b-2 border-b-transparent active:border-b-primary-blue"
            >
              <Calendar size={18} />
              {timeRange}
              <ChevronDown size={16} className={cn("transition-transform", showRangeDropdown && "rotate-180")} />
            </button>
            
            {showRangeDropdown && (
              <div className="absolute top-14 left-0 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-20">
                {['Last 7 Days', 'Last 30 Days', 'Last 3 Months'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setShowRangeDropdown(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${stat.bgColor} dark:bg-opacity-10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={cn("w-5 h-5", stat.color || stat.iconColor)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg",
                  stat.trendType === 'up' ? "bg-neutral-border/15 dark:bg-primary-blue/10 text-primary-blue dark:text-primary-blue" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                )}>
                  {stat.trendType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reach vs Engagement</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-blue rounded-full" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Reach</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neutral-border/30 dark:bg-primary-blue/30 rounded-full" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Engagement</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full relative">
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <p className="text-sm font-bold text-gray-400 dark:text-gray-600">No data available for this period</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentData}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-white/5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-text, #000)' }}
                    itemStyle={{ color: 'inherit' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                  <Area type="monotone" dataKey="engagement" stroke="#a7f3d0" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Audience Source</h3>
            <div className="h-[250px] w-full mb-8">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={platformData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: 'currentColor'}} width={80} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {platformData.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AdvertiserLayout>
  );
}
