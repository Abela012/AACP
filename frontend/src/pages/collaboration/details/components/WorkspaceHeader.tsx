import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Target,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface WorkspaceHeaderProps {
  campaign: any;
  collaboration: any;
  status: string;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ campaign, collaboration, status }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-primary-blue/10 text-primary-blue';
      case 'pending': return 'bg-amber-500/10 text-amber-500';
      case 'review': return 'bg-blue-500/10 text-blue-500';
      case 'completed': return 'bg-gray-100 dark:bg-white/10 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  // Calculate days remaining
  const deadline = campaign?.deadline ? new Date(campaign.deadline) : null;
  const now = new Date();
  const daysRemaining = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 mb-8 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/5 rounded-full blur-3xl -mr-20 -mt-20" />
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10 p-2 overflow-hidden shrink-0">
              {campaign?.brandLogo ? (
                <img src={campaign.brandLogo} alt="" className="w-full h-full object-contain" />
              ) : (
                <Target className="text-primary-blue w-10 h-10" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full", getStatusColor(status))}>
                  {status.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full">
                  <Calendar size={12} />
                  Ends {deadline ? deadline.toLocaleDateString() : 'TBD'}
                </span>
                {daysRemaining > 0 && daysRemaining <= 7 && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle size={12} />
                    {daysRemaining} days left
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {campaign?.title || 'Collaboration Workspace'}
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                {campaign?.category || 'General'} Campaign <ChevronRight size={14} /> Influencer Partnership
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Budget</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {collaboration?.agreedBudget?.amount?.toLocaleString() || '0'} <span className="text-sm font-bold text-primary-blue">{collaboration?.agreedBudget?.currency || 'ETB'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Clock size={12} className="text-blue-500" /> Time Remaining
            </p>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {daysRemaining > 0 ? `${daysRemaining} Days` : 'Ended'}
            </p>
          </div>
          <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Target size={12} className="text-primary-blue" /> Completion
            </p>
            <div className="flex items-center gap-3">
               <p className="text-lg font-black text-gray-900 dark:text-white">{status === 'completed' ? 100 : (collaboration?.overallProgress || 0)}%</p>
               <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${status === 'completed' ? 100 : (collaboration?.overallProgress || 0)}%` }}
                    className="h-full bg-primary-blue"
                 />
               </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <DollarSign size={12} className="text-amber-500" /> Released
            </p>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              0 <span className="text-xs font-bold text-gray-400">{collaboration?.agreedBudget?.currency || 'ETB'}</span>
            </p>
          </div>
          <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <AlertCircle size={12} className="text-primary-blue" /> Open Tasks
            </p>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              {collaboration?.tasks?.filter((t: any) => t.status !== 'approved').length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
