import { motion } from 'framer-motion';
import { 
  Rocket, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  ChevronDown,
  ArrowRight,
  Target,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  
  const data = [
    { name: 'Mon', reach: 4000, engagement: 2400 },
    { name: 'Tue', reach: 3000, engagement: 1398 },
    { name: 'Wed', reach: 2000, engagement: 9800 },
    { name: 'Thu', reach: 2780, engagement: 3908 },
    { name: 'Fri', reach: 1890, engagement: 4800 },
    { name: 'Sat', reach: 2390, engagement: 3800 },
    { name: 'Sun', reach: 3490, engagement: 4300 },
  ];

  const platformData = [
    { name: 'TikTok', value: 45, color: '#6366f1' },
    { name: 'Instagram', value: 30, color: '#ec4899' },
    { name: 'YouTube', value: 25, color: '#ef4444' },
  ];

  const stats = [
    { label: 'Total Reach', value: '1.2M', trend: '+12.5%', trendType: 'up', icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { label: 'Avg. Engagement', value: '4.8%', trend: '+2.1%', trendType: 'up', icon: Zap, iconColor: 'text-amber-500', bgColor: 'bg-amber-50' },
    { label: 'Total Spent', value: '$12,450', trend: '-5.2%', trendType: 'down', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'ROI', value: '3.4x', trend: '+0.8x', trendType: 'up', icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  return (
    <BusinessLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Analytics & Insights</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Track your campaign performance and ROI in real-time.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 px-6 py-3 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
              <Calendar size={18} />
              Last 30 Days
              <ChevronDown size={16} />
            </button>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${stat.bgColor} dark:bg-white/5 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={cn("w-5 h-5", stat.color || stat.iconColor)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg",
                  stat.trendType === 'up' ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
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
                  <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Reach</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-200 dark:bg-indigo-900/50 rounded-full" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Engagement</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-white/5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                  <Area type="monotone" dataKey="engagement" stroke="#c7d2fe" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">Platform Distribution</h3>
            <div className="h-[250px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#9ca3af'}} width={80} />
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
    </BusinessLayout>
  );
}
