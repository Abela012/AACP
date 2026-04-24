import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Lock, 
  TrendingUp, 
  Star, 
  AlertTriangle,
  History,
  Zap,
  Mail,
  Ban,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/src/shared/components/layouts/AdminLayout';

export default function AdminSuspendedUserPage() {
  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-[#1A1D1F] dark:text-white leading-none mb-4">Manage Suspended User</h1>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">Marcus Thorne</span>
              <span className="text-gray-300 dark:text-white/10">•</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#14a800]">Agency Partner</span>
              <span className="text-gray-300 dark:text-white/10">•</span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 rounded">Suspended</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
              View Logs
            </button>
            <button className="px-6 py-3 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2 text-[#6F767E]">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* User Metrics Column */}
          <div className="lg:col-span-3 bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm text-center">
            <div className="relative w-40 h-40 mx-auto mb-10">
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-[#1A1A1A] shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" 
                  alt="Marcus Thorne" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-2xl border-4 border-white dark:border-[#111111] flex items-center justify-center shadow-lg">
                <Lock size={18} className="text-white fill-current" />
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1">Followers</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black">1.2M</span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <TrendingUp size={10} /> +4.2%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-1">Total Earned</p>
                <span className="text-2xl font-black">$45,000</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest mb-2">Trust Score</p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg font-black mr-2">4.2 <span className="text-xs text-[#9A9FA5] font-bold">/ 5</span></span>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < 4 ? "text-green-500 fill-current" : "text-gray-200 dark:text-gray-800"} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Suspension Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white dark:bg-[#111111] p-8 rounded-[3rem] border border-[#EFEFEF] dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center text-red-600">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="font-extrabold text-lg">Suspension Reason</h3>
              </div>

              <div className="bg-red-50/50 dark:bg-red-500/5 p-6 rounded-[2rem] border border-red-100 dark:border-red-500/10 mb-10">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Policy Violation: Repeated Spam</p>
                <p className="text-sm font-medium text-[#1A1D1F] dark:text-white/80 leading-relaxed">
                  Account flagged by automated safety filters 14 times within a 48-hour window. Content matches known phishing patterns and unsolicited commercial outreach in collaboration threads.
                </p>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest">Evidence & Logs</p>
                
                <div className="flex justify-between items-center p-4 bg-[#F4F4F4]/50 dark:bg-white/5 rounded-2xl border border-[#EFEFEF] dark:border-white/5">
                  <span className="text-xs font-bold text-[#6F767E] dark:text-gray-400">Flagged Message Content</span>
                  <button className="text-[10px] font-black text-[#14a800] uppercase hover:underline flex items-center gap-1">
                    View Transcript <ExternalLink size={10} />
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#F4F4F4]/50 dark:bg-white/5 rounded-2xl border border-[#EFEFEF] dark:border-white/5">
                  <span className="text-xs font-bold text-[#6F767E] dark:text-gray-400">Detection Source</span>
                  <span className="text-xs font-black">AI Sentinel-V4</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-[#F4F4F4]/50 dark:bg-white/5 rounded-2xl border border-[#EFEFEF] dark:border-white/5">
                  <span className="text-xs font-bold text-[#6F767E] dark:text-gray-400">Suspension Date</span>
                  <span className="text-xs font-black text-[#1A1D1F] dark:text-white">Oct 24, 2023 - 14:22 UTC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Administrative Actions Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#F1FFF0] dark:bg-white/5 p-8 rounded-[3rem] border border-white dark:border-white/5 shadow-inner">
              <h3 className="font-black text-xl mb-10">Administrative Actions</h3>
              
              <div className="space-y-4 mb-10">
                <button className="w-full p-6 bg-gradient-to-tr from-[#14a800] to-emerald-600 text-white rounded-[1.5rem] flex items-start gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-100 dark:shadow-none text-left">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Zap size={20} className="fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-black mb-1">Reactivate Account</p>
                    <p className="text-[10px] font-bold opacity-60 leading-tight">Restore full partner access immediately</p>
                  </div>
                </button>

                <button className="w-full p-6 bg-white dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 text-[#1A1D1F] dark:text-white rounded-[1.5rem] flex items-start gap-4 transition-all hover:bg-gray-50 active:scale-[0.98] text-left">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-[#6F767E]" />
                  </div>
                  <div>
                    <p className="text-sm font-black mb-1">Send Official Warning</p>
                    <p className="text-[10px] font-bold text-[#6F767E] dark:text-gray-400 leading-tight">Notify user of policy breach</p>
                  </div>
                </button>

                <button className="w-full p-6 bg-[#FFF0F0] dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-[1.5rem] flex items-start gap-4 transition-all hover:bg-[#FFE5E5] active:scale-[0.98] text-left group">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Ban size={20} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-red-600 mb-1">Permanent Ban</p>
                    <p className="text-[10px] font-bold text-red-400 leading-tight">Remove access and block identity</p>
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest pl-2">Internal Notes</p>
                <div className="relative">
                  <textarea 
                    className="w-full h-32 bg-white/50 dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#14a800]/20 transition-all resize-none italic"
                    placeholder="Document the decision process for audit logs..."
                  />
                </div>
                <button className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-xs font-bold transition-all hover:opacity-90">
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Activity Row */}
        <div className="mt-12 bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-[#EFEFEF] dark:border-white/5">
          <div className="flex flex-wrap items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-[#6F767E] dark:text-gray-400">
            <span className="text-[#1A1D1F] dark:text-white">Recent Activity</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Suspended by System at 14:22
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Marcus Thorne attempted login at 14:45
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Warning Email Sent at 15:10
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
