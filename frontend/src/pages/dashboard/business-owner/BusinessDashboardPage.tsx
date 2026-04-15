import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  BarChart3, 
  Search, 
  Bell, 
  Settings, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Clock,
  CheckCircle2,
  CreditCard,
  Edit3,
  Sparkles,
  Zap,
  X,
  ShieldCheck,
  Star,
  Target,
  Globe,
  Lock,
  MoreHorizontal,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import OnboardingBanner from '@/src/shared/components/OnboardingBanner';
import { cn } from '@/src/shared/utils/cn';
import ThemeToggle from '@/src/shared/components/ThemeToggle';
import { useUser } from '@/src/shared/context/UserContext';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

export default function BusinessDashboardPage() {
  const navigate = useNavigate();
  const { onboardingStatus, setOnboardingStatus } = useUser();
  const isApproved = onboardingStatus === 'approved';

  const stats = [
    { label: 'Total Campaigns', value: '12', trend: '+20% vs last month', trendType: 'up', icon: Megaphone, color: 'text-emerald-500' },
    { label: 'Active Matches', value: '8', trend: '+12% conversion rate', trendType: 'up', icon: Users, color: 'text-blue-500' },
    { label: 'Total Spent', value: '$4,200', trend: '-5% cost per lead', trendType: 'down', icon: CreditCard, color: 'text-red-500' },
    { label: 'Trust Score', value: '4.9', subValue: '/5.0', trend: 'Top 5% in industry', trendType: 'up', icon: ShieldCheck, color: 'text-cyan-500' },
  ];

  const collaborations = [
    { name: 'Logistics Hub', desc: 'Supply Chain Optimization', progress: 75, timeLeft: '2 days left', status: 'ACTIVE', statusColor: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'NexGen Retail', desc: 'Retail Expansion Project', progress: 40, timeLeft: '14 days left', status: 'PENDING', statusColor: 'text-amber-500 bg-amber-500/10' },
    { name: 'Creative Studio', desc: 'Brand Storytelling', progress: 100, timeLeft: 'Completed', status: 'COMPLETED', statusColor: 'text-gray-400 bg-gray-400/10' },
  ];

  const recommendations = [
    { title: 'Global Tech Corp', match: '98% Match', desc: 'High synergy in AI development and cloud infrastructure.', reach: '2.5M+', engagement: '4.8%' },
    { title: 'Creative Studio', match: '92% Match', desc: 'Perfect for design collaboration and brand storytelling.', reach: '800K+', engagement: '12.5%' },
  ];

  const handleStatClick = (label: string) => {
    if (label.includes('Campaign')) {
      navigate('/campaigns');
      return;
    }
    if (label.includes('Match')) {
      navigate('/matches');
      return;
    }
    if (label.includes('Spent')) {
      navigate('/balance');
      return;
    }
    navigate('/analytics');
  };

  return (
    <BusinessLayout>
      <main className="p-8 max-w-[1400px] mx-auto w-full">
        {/* Onboarding & Admin Toggle */}
        <OnboardingBanner status={onboardingStatus} role="business" />
        
        <div className="mb-8 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-white/10">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Admin Simulation:</span>
          <div className="flex gap-2">
            {(['incomplete', 'pending', 'approved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setOnboardingStatus(status)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                  onboardingStatus === status 
                    ? "bg-indigo-600 text-white" 
                    : "bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/10"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Performance <span className="text-indigo-600">Snapshot</span></h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, Marcus. Your AI agents found 8 new high-value matches.</p>
          </div>
          <Link 
            to={isApproved ? "/campaign/new" : "#"}
            className={cn(
              "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg",
              isApproved 
                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-100 dark:shadow-none" 
                : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
            )}
          >
            {isApproved ? <Plus size={18} /> : <Lock size={18} />}
            New Campaign
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <button
              key={idx}
              onClick={() => handleStatClick(stat.label)}
              className="w-full text-left bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-indigo-600/30 transition-all group shadow-sm dark:shadow-none"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</h3>
                <div className={cn("w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center", stat.color)}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                {stat.subValue && <span className="text-sm text-gray-500 dark:text-gray-400">{stat.subValue}</span>}
              </div>
              <div className={cn(
                "text-xs font-medium",
                stat.trendType === 'up' ? "text-emerald-500" : stat.trendType === 'down' ? "text-red-500" : "text-gray-500"
              )}>
                {stat.trend}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Performance Chart */}
            <div className={cn("bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}>
              {!isApproved && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px]">
                  <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                    <Lock className="text-indigo-600 w-5 h-5" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-600">
                    <BarChart3 size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Campaign Performance</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/analytics')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Open analytics
                  </button>
                  <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                  <button className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Daily</button>
                  <button className="px-4 py-1.5 text-xs font-bold bg-white dark:bg-white/10 text-gray-900 dark:text-white rounded-lg shadow-sm">Monthly</button>
                  </div>
                </div>
              </div>
              
              <div className="h-64 flex items-end gap-2 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 0 120 Q 150 80 300 140 T 500 60 T 800 100" 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 0 120 Q 150 80 300 140 T 500 60 T 800 100 L 800 200 L 0 200 Z" 
                    fill="url(#chartGradient)"
                  />
                  <circle cx="800" cy="100" r="6" fill="#4f46e5" />
                  <circle cx="800" cy="100" r="12" fill="#4f46e5" fillOpacity="0.2" />
                </svg>
                
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-4">
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                </div>
              </div>
            </div>

            {/* Active Collaborations */}
            <div className={cn("bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}>
              {!isApproved && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                  <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                    <Lock className="text-indigo-600 w-5 h-5" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Collaborations</h3>
                <button
                  onClick={() => navigate('/matches')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {collaborations.map((collab, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg border border-gray-100 dark:border-white/10">
                          {collab.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">{collab.name}</h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{collab.desc}</p>
                        </div>
                      </div>
                      <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider", collab.statusColor)}>
                        {collab.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${collab.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{collab.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* AI Recommendations */}
            <div className={cn("bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative shadow-sm dark:shadow-none", !isApproved && "opacity-50 pointer-events-none")}>
              {!isApproved && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                  <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 flex items-center gap-3">
                    <Lock className="text-indigo-600 w-5 h-5" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Unlock after approval</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Recommendations</h3>
                </div>
                <button
                  onClick={() => navigate('/matches')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Open matches
                </button>
              </div>
              
              <div className="space-y-6">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 group cursor-pointer hover:border-indigo-600/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{rec.title}</h4>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{rec.match}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{rec.desc}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Reach: {rec.reach}</span>
                      <span>Eng: {rec.engagement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-lg shadow-indigo-100 dark:shadow-none">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Upgrade to Pro</h3>
                <p className="text-indigo-100 text-xs leading-relaxed mb-8">
                  Get 10x more leads with our advanced AI audience targeting and dedicated support.
                </p>
                <Link 
                  to="/pro-upgrade"
                  className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center"
                >
                  Go Pro Now
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-12 -mb-12 blur-2xl"></div>
            </div>

            {/* Market Pulse */}
            <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 relative overflow-hidden group shadow-sm dark:shadow-none">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Globe className="text-emerald-500 w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Market Pulse</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trending Hotspot:</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">North America</p>
                  </div>
                  <ChevronRight className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>
          </div>
        </div>
      </main>
    </BusinessLayout>
  );
}
