import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Flag,
  FileText,
  AlertCircle,
  Star,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  BarChart3,
  Info
} from 'lucide-react';
import { 
  useCollaborationDetails, 
  useCompleteCollaboration,
  useAddTask,
  useUpdateTask,
  useSubmitDeliverable,
  useReviewDeliverable
} from '@/src/hooks/useCollaborations';
import { useCollaborationReviews } from '@/src/hooks/useReviews';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { cn } from '@/src/shared/utils/cn';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

// New Components
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { TaskBoard } from './components/TaskBoard';
import { DeliverablesManager } from './components/DeliverablesManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ActivityFeed } from './components/ActivityFeed';
import { CollaborationChat } from './components/CollaborationChat';

// Hooks
import { useChat } from '@/src/hooks/useChat';

type TabType = 'overview' | 'tasks' | 'deliverables' | 'chat' | 'analytics';

export default function CollaborationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = useUser();
  const { profile } = useProfile();
  
  const { data: collab, isLoading, error, refetch } = useCollaborationDetails(id!);
  const { data: reviews } = useCollaborationReviews(id!);
  
  const addTaskMutation = useAddTask();
  const updateTaskMutation = useUpdateTask();
  const submitDeliverableMutation = useSubmitDeliverable();
  const reviewDeliverableMutation = useReviewDeliverable();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const partner = userRole === 'business_owner' ? collab?.advertiser : collab?.businessOwner;
  const partnerName = partner?.fullName || partner?.firstName ? `${partner.firstName} ${partner.lastName}` : 'Partner';

  // Initialize Chat
  const { messages, sendMessage } = useChat('', partner?._id);

  const Layout = userRole === 'advertiser' ? AdvertiserLayout : BusinessLayout;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !collab) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workspace Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
            The workspace you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'deliverables', label: 'Deliverables', icon: FolderKanban },
    { id: 'chat', label: 'Messenger', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb / Back */}
        <div className="mb-8">
           <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-emerald-500 transition-all"
           >
             <ArrowLeft size={14} /> Back to My Campaigns
           </button>
        </div>

        {/* Global Header Component */}
        <WorkspaceHeader 
          campaign={collab.opportunity} 
          collaboration={collab} 
          status={collab.status} 
        />

        {/* Dashboard Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-10 pb-2 no-scrollbar">
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 border",
                 activeTab === tab.id 
                   ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white shadow-xl shadow-gray-200 dark:shadow-none" 
                   : "bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10"
               )}
             >
               <tab.icon size={18} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Dynamic Tab Content */}
        <div className="min-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Project Intro */}
                    <section className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Info className="text-emerald-500" size={20} />
                          Campaign Brief
                        </h3>
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold">
                               {i}
                             </div>
                           ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-8">
                        {collab.opportunity?.description || 'No detailed brief provided for this campaign yet.'}
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                         <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">30 Days</p>
                         </div>
                         <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Usage</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">6 Months</p>
                         </div>
                         <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Platform</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{collab.opportunity?.platforms?.join(', ') || 'Global'}</p>
                         </div>
                         <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target</p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Gen Z / Urban</p>
                         </div>
                      </div>
                    </section>

                    {/* Partner Card */}
                    <section className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                       <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                          <div className="w-24 h-24 rounded-3xl bg-white/10 p-1 shrink-0 overflow-hidden">
                             <img 
                               src={partner?.profilePicture || `https://ui-avatars.com/api/?name=${partnerName}&background=10b981&color=fff`} 
                               alt="" 
                               className="w-full h-full object-cover rounded-2xl" 
                             />
                          </div>
                          <div className="text-center sm:text-left flex-1">
                             <h4 className="text-xl font-black mb-1">{partnerName}</h4>
                             <p className="text-sm font-medium text-white/50 mb-4">{userRole === 'business_owner' ? 'Professional Content Creator' : 'Brand Marketing Manager'}</p>
                             <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                <button onClick={() => navigate(`/profile/${partner._id}`)} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl transition-all border border-white/5">View Profile</button>
                                <button onClick={() => setActiveTab('chat')} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20">Send Message</button>
                             </div>
                          </div>
                       </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <ActivityFeed activities={collab.activities || []} />
                    
                    <div className="bg-amber-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
                       <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                       <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                         <ShieldCheck size={20} />
                         AACP Escrow
                       </h3>
                       <p className="text-xs font-medium text-white/80 mb-6 leading-relaxed">
                         Funds are safely held in escrow and will be released automatically once milestones are approved.
                       </p>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs font-black">
                             <span className="opacity-70">Secured Amount</span>
                             <span>{collab.agreedBudget?.amount?.toLocaleString()} {collab.agreedBudget?.currency}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-black">
                             <span className="opacity-70">Dispute Window</span>
                             <span>48 Hours</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <TaskBoard 
                  tasks={collab.tasks || []} 
                  userRole={userRole!} 
                  onAddTask={async (task) => {
                    try {
                      await addTaskMutation.mutateAsync({ id: collab._id, task });
                      toast.success('Task created successfully');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to create task');
                    }
                  }}
                  onUpdateStatus={async (taskId, status) => {
                    try {
                      await updateTaskMutation.mutateAsync({ id: collab._id, taskId, status });
                      toast.success('Status updated');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to update status');
                    }
                  }}
                />
              )}

              {activeTab === 'deliverables' && (
                <DeliverablesManager 
                  deliverables={collab.milestones?.flatMap((m: any) => m.submissions) || []} 
                  userRole={userRole!} 
                  onUpload={async (deliverable) => {
                    try {
                      const formData = new FormData();
                      if (deliverable.file) formData.append('file', deliverable.file);
                      if (deliverable.title) formData.append('title', deliverable.title);
                      if (deliverable.description) formData.append('description', deliverable.description);
                      if (deliverable.notes) formData.append('notes', deliverable.notes);
                      if (deliverable.type) formData.append('type', deliverable.type);

                      await submitDeliverableMutation.mutateAsync({ 
                        id: collab._id, 
                        deliverable: formData,
                        onProgress: deliverable.onProgress
                      });
                      toast.success('Deliverable submitted');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to submit');
                    }
                  }}
                  onAction={async (submissionId, action, feedback) => {
                    try {
                      await reviewDeliverableMutation.mutateAsync({ 
                        id: collab._id, 
                        submissionId, 
                        review: { status: action, feedback: feedback || '' } 
                      });
                      toast.success(`Deliverable ${action.replace('_', ' ')}`);
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to update review');
                    }
                  }}
                />
              )}

              {activeTab === 'chat' && (
                <CollaborationChat 
                  messages={messages.map(m => ({
                    id: m._id,
                    senderId: m.sender._id,
                    senderName: `${m.sender.firstName} ${m.sender.lastName}`,
                    text: m.text,
                    timestamp: m.createdAt,
                    isSelf: m.sender._id === profile._id
                  }))}
                  currentUser={profile}
                  onSendMessage={(text: string) => sendMessage(text)}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard 
                  analytics={[]} // TODO: Connect to hook
                  budget={collab.agreedBudget?.amount || 0}
                  onRefresh={() => refetch()}
                  onSubmitUrl={() => {}} // TODO: Implement API call
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </Layout>
  );
}
