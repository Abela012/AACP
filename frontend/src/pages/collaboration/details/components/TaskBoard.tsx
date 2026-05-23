import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  MoreVertical,
  Calendar,
  Layout,
  Briefcase
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'submitted' | 'approved';
}

interface TaskBoardProps {
  tasks: Task[];
  userRole: string;
  onAddTask: (task: any) => void;
  onUpdateStatus: (taskId: string, status: string) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, userRole, onAddTask, onUpdateStatus }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-amber-600 bg-amber-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'approved': return <CheckCircle2 className="text-aacp-olive" size={18} />;
      case 'submitted': return <Clock className="text-blue-500" size={18} />;
      case 'in_progress': return <Clock className="text-amber-500" size={18} />;
      default: return <Clock className="text-gray-300" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Tasks</h2>
          <p className="text-sm text-gray-500">Manage deliverables and project requirements</p>
        </div>
        {userRole === 'business_owner' && (
          <button 
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-aacp-olive text-white rounded-xl font-bold hover:bg-aacp-olive transition-all shadow-lg shadow-aacp-olive/20"
          >
            <Plus size={18} />
            Create Task
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        {tasks?.length === 0 && !isAddingTask ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5">
             <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Briefcase className="text-gray-300" size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">No tasks created yet</h3>
             <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
               {userRole === 'business_owner' 
                 ? 'Start by creating the first task for your campaign influencer.' 
                 : 'Waiting for the brand to assign tasks for this collaboration.'}
             </p>
          </div>
        ) : (
          tasks?.map((task, index) => (
            <motion.div 
              layout
              key={task._id || task.id || `task-${index}`}
              className={cn(
                "group bg-white dark:bg-[#0a0a0a] border rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none",
                task.status === 'approved' ? "border-aacp-gold/25 dark:border-aacp-olive/10" : "border-gray-100 dark:border-white/5"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    task.status === 'approved' ? "bg-aacp-gold/15 dark:bg-aacp-olive/10" : "bg-gray-50 dark:bg-white/5"
                  )}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-bold transition-all",
                      task.status === 'approved' ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"
                    )}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded", getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full capitalize",
                        task.status === 'approved' ? "bg-aacp-olive/10 text-aacp-olive" :
                        task.status === 'submitted' ? "bg-blue-500/10 text-blue-600" :
                        task.status === 'in_progress' ? "bg-amber-500/10 text-amber-600" :
                        "bg-gray-100 text-gray-500"
                      )}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {userRole === 'advertiser' && task.status === 'pending' && (
                    <button 
                      onClick={() => onUpdateStatus((task._id || task.id)!, 'in_progress')}
                      className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black rounded-lg uppercase"
                    >
                      Start Task
                    </button>
                  )}
                  {userRole === 'advertiser' && (task.status === 'in_progress' || task.status === 'pending') && (
                    <button 
                      onClick={() => onUpdateStatus((task._id || task.id)!, 'submitted')}
                      className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase"
                    >
                      Submit
                    </button>
                  )}
                  {userRole === 'business_owner' && task.status === 'submitted' && (
                    <button 
                      onClick={() => onUpdateStatus((task._id || task.id)!, 'approved')}
                      className="px-3 py-1.5 bg-aacp-olive text-white text-[10px] font-black rounded-lg uppercase"
                    >
                      Approve
                    </button>
                  )}
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Task Modal / Form */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/10"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Task</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Task Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Upload TikTok Draft"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-aacp-olive"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Explain what needs to be done..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-aacp-olive"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Priority</label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-aacp-olive"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Due Date</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-aacp-olive"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsAddingTask(false)}
                    className="flex-1 py-3 border border-gray-100 dark:border-white/10 text-gray-500 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onAddTask(newTask);
                      setIsAddingTask(false);
                      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
                    }}
                    disabled={!newTask.title}
                    className="flex-1 py-3 bg-aacp-olive text-white font-bold rounded-xl hover:bg-aacp-olive shadow-lg shadow-aacp-olive/20 disabled:opacity-50"
                  >
                    Save Task
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
