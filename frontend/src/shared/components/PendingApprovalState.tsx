import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Mail, RefreshCw, Loader2 } from 'lucide-react';

interface PendingApprovalStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function PendingApprovalState({ onRefresh, isRefreshing }: PendingApprovalStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white dark:bg-white/5 rounded-[3rem] p-12 border border-gray-100 dark:border-white/5 text-center shadow-2xl shadow-amber-500/5"
      >
        <div className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
          <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-white/5">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
          Review in Progress
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10 text-lg">
          We've received your profile details! Our experts are currently reviewing your information to maintain the highest quality within our community.
          <br /><br />
          This typically takes <span className="text-amber-500 font-bold underline underline-offset-4">24-48 hours</span>. We'll send you an email the moment you're cleared for takeoff.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 flex items-center gap-4 text-left border border-gray-100 dark:border-white/5">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-black flex items-center justify-center shadow-sm">
              <Mail className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">help@aacp.com</p>
            </div>
          </div>

          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl p-6 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {isRefreshing ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
          Priority Review Active
        </div>
      </motion.div>
    </div>
  );
}
