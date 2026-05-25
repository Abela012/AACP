import React from 'react';
import { 
  CheckCircle2, 
  MessageSquare, 
  Upload, 
  RefreshCw, 
  DollarSign, 
  Flag,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface ActivityItem {
  id: string;
  type: 'acceptance' | 'message' | 'task_created' | 'task_approved' | 'deliverable_uploaded' | 'revision_requested' | 'payment_released' | 'completed';
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

export const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'acceptance': return <UserCheck className="text-primary-blue" size={16} />;
      case 'message': return <MessageSquare className="text-blue-500" size={16} />;
      case 'task_created': return <Flag className="text-amber-500" size={16} />;
      case 'task_approved': return <CheckCircle2 className="text-primary-blue" size={16} />;
      case 'deliverable_uploaded': return <Upload className="text-primary-blue" size={16} />;
      case 'revision_requested': return <RefreshCw className="text-amber-500" size={16} />;
      case 'payment_released': return <DollarSign className="text-primary-blue" size={16} />;
      case 'completed': return <CheckCircle2 className="text-blue-600" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm h-full overflow-hidden flex flex-col">
      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <RefreshCw className="text-primary-blue animate-spin-slow" size={20} />
        Live Activity Feed
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {activities?.length === 0 ? (
          <div className="text-center py-10 opacity-50">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No activity recorded yet</p>
          </div>
        ) : (
          activities.map((item, idx) => (
            <div key={item.id} className="relative flex gap-4">
              {idx !== activities.length - 1 && (
                <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-100 dark:bg-white/5" />
              )}
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0 z-10">
                 {getIcon(item.type)}
              </div>
              <div className="pt-1">
                 <p className="text-sm font-bold text-gray-900 dark:text-white">
                   {item.user} <span className="font-medium text-gray-500">{item.action}</span>
                 </p>
                 {item.details && (
                   <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">"{item.details}"</p>
                 )}
                 <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest mt-2">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
