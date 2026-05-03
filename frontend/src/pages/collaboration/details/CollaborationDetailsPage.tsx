import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Upload, 
  Send,
  MessageSquare,
  ShieldCheck,
  Briefcase,
  ExternalLink,
  Loader2,
  Plus,
  X,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useUser } from '@/src/shared/context/UserContext';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { 
  useCollaborationDetails, 
  useAddMilestone, 
  useSubmitDeliverable, 
  useReviewSubmission,
  useCompleteCollaboration
} from '@/src/hooks/useCollaborations';
import { cn } from '@/src/shared/utils/cn';

export default function CollaborationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: clerkUser } = useClerkUser();
  const { userRole } = useUser();
  const myId = clerkUser?.id ?? '';

  const { data: collaboration, isLoading } = useCollaborationDetails(id || '');
  const addMilestoneMutation = useAddMilestone();
  const submitDeliverableMutation = useSubmitDeliverable();
  const reviewSubmissionMutation = useReviewSubmission();
  const completeMutation = useCompleteCollaboration();

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', dueDate: '' });

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [submissionForm, setSubmissionForm] = useState({ fileUrl: '', notes: '' });

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="font-bold text-gray-500">Loading collaboration details...</p>
      </div>
    );
  }

  if (!collaboration) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="font-bold text-gray-500">Collaboration not found</p>
        <button onClick={() => navigate(-1)} className="text-emerald-500 font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const partner = userRole === 'business_owner' ? collaboration.advertiser : collaboration.businessOwner;
  const partnerName = partner?.fullName || (partner?.firstName ? `${partner.firstName} ${partner.lastName}` : 'Partner');

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMilestoneMutation.mutateAsync({ id: id!, data: newMilestone });
      setIsMilestoneModalOpen(false);
      setNewMilestone({ title: '', description: '', dueDate: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to add milestone');
    }
  };

  const handleSubmitDeliverable = async (milestoneId: string) => {
    if (!submissionForm.fileUrl) return alert('Please provide a file URL or proof of work');
    try {
      await submitDeliverableMutation.mutateAsync({ 
        id: id!, 
        milestoneId, 
        data: { ...submissionForm, fileName: 'Deliverable' } 
      });
      setSelectedMilestoneId(null);
      setSubmissionForm({ fileUrl: '', notes: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to submit deliverable');
    }
  };

  const handleReview = async (milestoneId: string, submissionId: string, status: 'approved' | 'revision_requested' | 'rejected') => {
    const feedback = window.prompt(`Review feedback for ${status}:`) || '';
    try {
      await reviewSubmissionMutation.mutateAsync({ 
        id: id!, 
        milestoneId, 
        submissionId, 
        data: { status, feedback } 
      });
    } catch (err: any) {
      alert(err.message || 'Failed to review submission');
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Mark this entire collaboration as completed?')) return;
    try {
      await completeMutation.mutateAsync(id!);
      alert('Collaboration completed!');
    } catch (err: any) {
      alert(err.message || 'Failed to complete collaboration');
    }
  };

  const Layout = userRole === 'advertiser' ? AdvertiserLayout : BusinessLayout;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100 dark:border-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Project Workspace</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" /> Secure Collaboration
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/messages?collab=${id}`)}
              className="px-6 h-12 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <MessageSquare size={18} /> Open Chat
            </button>
            {userRole === 'business_owner' && collaboration.status === 'active' && (
              <button 
                onClick={handleComplete}
                className="px-6 h-12 bg-emerald-500 text-black font-black rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:bg-emerald-400 transition-all"
              >
                <CheckCircle2 size={18} /> Complete Project
              </button>
            )}
          </div>
        </div>

        {/* Project Overview Card */}
        <section className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 border-b border-gray-50 dark:border-white/5 bg-emerald-500/5 flex flex-col lg:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
                  collaboration.status === 'active' ? "bg-emerald-500 text-black" : "bg-gray-500 text-white"
                )}>
                  {collaboration.status}
                </span>
                <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  <Clock size={12} /> Started {new Date(collaboration.startDate).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {collaboration.opportunity?.title || 'Collaboration Project'}
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                    <img src={partner?.profilePicture || `https://ui-avatars.com/api/?name=${partnerName}&background=10b981&color=fff`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {userRole === 'business_owner' ? 'Creator: ' : 'Brand: '}
                    <span className="text-gray-900 dark:text-white">{partnerName}</span>
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-emerald-500" />
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    Budget: <span className="text-emerald-600 font-black">{collaboration.agreedBudget?.amount?.toLocaleString()} {collaboration.agreedBudget?.currency}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:w-72 bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Progress</p>
                <p className="text-sm font-black text-emerald-500">{collaboration.overallProgress}%</p>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${collaboration.overallProgress}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Milestones & Timeline */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Milestones List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                Project Milestones
                <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500">{collaboration.milestones?.length || 0}</span>
              </h3>
              {userRole === 'business_owner' && (
                <button 
                  onClick={() => setIsMilestoneModalOpen(true)}
                  className="flex items-center gap-2 text-xs font-black text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest"
                >
                  <Plus size={16} /> Add Milestone
                </button>
              )}
            </div>

            <div className="space-y-4">
              {collaboration.milestones?.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-white/5">
                   <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                   <p className="text-gray-500 font-bold">No milestones set yet.</p>
                   {userRole === 'business_owner' && <p className="text-xs text-gray-400 mt-1">Start by adding a project phase.</p>}
                </div>
              ) : (
                collaboration.milestones.map((m: any, idx: number) => (
                  <motion.div 
                    key={m._id}
                    layoutId={m._id}
                    className={cn(
                      "bg-white dark:bg-[#0d0d0d] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden transition-all",
                      selectedMilestoneId === m._id ? "ring-2 ring-emerald-500 shadow-2xl" : "hover:shadow-lg"
                    )}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black",
                            m.status === 'approved' ? "bg-emerald-500 text-black" : 
                            m.status === 'submitted' ? "bg-amber-500 text-black" : "bg-gray-100 dark:bg-white/10 text-gray-500"
                          )}>
                            {m.status === 'approved' ? <CheckCircle2 size={20} /> : idx + 1}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white">{m.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{m.description || 'No description'}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                m.status === 'approved' ? "bg-emerald-500/10 text-emerald-600" :
                                m.status === 'submitted' ? "bg-amber-500/10 text-amber-600" :
                                "bg-gray-100 text-gray-400"
                              )}>
                                {m.status}
                              </span>
                              {m.dueDate && (
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  Due {new Date(m.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {m.status !== 'approved' && userRole === 'advertiser' && (
                            <button 
                              onClick={() => setSelectedMilestoneId(selectedMilestoneId === m._id ? null : m._id)}
                              className="px-4 py-2 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500/20 transition-all"
                            >
                              {m.status === 'submitted' ? 'Update Submission' : 'Submit Work'}
                            </button>
                          )}
                          {m.submissions?.length > 0 && (
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                               <FileText size={10} /> {m.submissions.length} Submissions
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submission Content */}
                      <AnimatePresence>
                        {selectedMilestoneId === m._id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 pt-6 border-t border-gray-50 dark:border-white/5 space-y-4"
                          >
                             <div>
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Proof of Work (Link or File URL)</label>
                               <div className="relative">
                                 <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                 <input 
                                   type="text" 
                                   placeholder="https://cloud-storage.com/your-file" 
                                   value={submissionForm.fileUrl}
                                   onChange={(e) => setSubmissionForm({...submissionForm, fileUrl: e.target.value})}
                                   className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-sm dark:text-white"
                                 />
                               </div>
                             </div>
                             <div>
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Additional Notes</label>
                               <textarea 
                                 rows={3}
                                 placeholder="Anything the owner should know about this submission?"
                                 value={submissionForm.notes}
                                 onChange={(e) => setSubmissionForm({...submissionForm, notes: e.target.value})}
                                 className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-sm dark:text-white resize-none"
                               />
                             </div>
                             <div className="flex justify-end gap-3">
                               <button onClick={() => setSelectedMilestoneId(null)} className="px-4 py-2 text-xs font-bold text-gray-500">Cancel</button>
                               <button 
                                 onClick={() => handleSubmitDeliverable(m._id)}
                                 className="px-6 py-2 bg-emerald-500 text-black text-xs font-black rounded-xl flex items-center gap-2 hover:bg-emerald-400"
                               >
                                 <Send size={14} /> Submit Now
                               </button>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* View Submissions (For both, but review for owner) */}
                      {m.submissions?.length > 0 && (
                        <div className="mt-6 space-y-3">
                          {m.submissions.map((sub: any) => (
                            <div key={sub._id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-emerald-500">
                                    <FileText size={16} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{sub.fileUrl}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Submitted {new Date(sub.submittedAt).toLocaleString()}</p>
                                  </div>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                  sub.status === 'approved' ? "bg-emerald-500 text-black" :
                                  sub.status === 'rejected' ? "bg-red-500 text-white" : "bg-amber-500 text-black"
                                )}>
                                  {sub.status}
                                </span>
                              </div>
                              {sub.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 bg-white dark:bg-black/20 p-2 rounded-lg">"{sub.notes}"</p>}
                              
                              {sub.status === 'pending' && userRole === 'business_owner' && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleReview(m._id, sub._id, 'approved')}
                                    className="flex-1 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleReview(m._id, sub._id, 'revision_requested')}
                                    className="flex-1 py-1.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-all"
                                  >
                                    Revision
                                  </button>
                                  <button 
                                    onClick={() => handleReview(m._id, sub._id, 'rejected')}
                                    className="flex-1 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {sub.feedbackFromOwner && (
                                <div className="mt-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Owner Feedback</p>
                                   <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{sub.feedbackFromOwner}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right: Sidebar Info */}
          <div className="space-y-8">
             <div className="bg-white dark:bg-[#111] rounded-[2rem] border border-gray-100 dark:border-white/5 p-8">
               <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Partner Info</h3>
               <div className="flex flex-col items-center text-center">
                 <div className="w-20 h-20 rounded-3xl overflow-hidden mb-4 border-4 border-emerald-500/20 shadow-xl">
                   <img src={partner?.profilePicture || `https://ui-avatars.com/api/?name=${partnerName}&background=10b981&color=fff`} alt="" className="w-full h-full object-cover" />
                 </div>
                 <h4 className="font-black text-gray-900 dark:text-white">{partnerName}</h4>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">{userRole === 'business_owner' ? 'Top Creator' : 'Campaign Brand'}</p>
                 
                 <div className="w-full grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate</p>
                      <p className="text-xs font-black text-emerald-500">4.9/5.0</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Projects</p>
                      <p className="text-xs font-black text-gray-900 dark:text-white">12+</p>
                    </div>
                 </div>

                 <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                   <ExternalLink size={14} /> View Full Profile
                 </button>
               </div>
             </div>

             <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
               <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-20 rotate-12" />
               <h3 className="text-lg font-black mb-2 relative z-10">AI Campaign Guard</h3>
               <p className="text-xs font-medium opacity-80 mb-6 relative z-10 leading-relaxed">
                 Our AI is monitoring this collaboration for quality and adherence to campaign guidelines. 
               </p>
               <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-xs">
                   <span className="font-bold opacity-70 uppercase tracking-widest">Risk Level</span>
                   <span className="font-black bg-white/20 px-2 py-0.5 rounded">Minimal</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="font-bold opacity-70 uppercase tracking-widest">Sentiment</span>
                   <span className="font-black bg-white/20 px-2 py-0.5 rounded">Positive</span>
                 </div>
               </div>
             </div>
          </div>
        </section>
      </div>

      {/* Add Milestone Modal */}
      <AnimatePresence>
        {isMilestoneModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMilestoneModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black text-gray-900 dark:text-white">Add Project Phase</h3>
                   <button onClick={() => setIsMilestoneModalOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleAddMilestone} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Milestone Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Content Script & Hook" 
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-sm dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Description (What needs to be done?)</label>
                    <textarea 
                      rows={3}
                      placeholder="Detail the deliverables for this phase..." 
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-sm dark:text-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Due Date</label>
                    <input 
                      type="date" 
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:border-emerald-500 text-sm dark:text-white"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={addMilestoneMutation.isPending}
                    className="w-full h-14 bg-emerald-500 text-black font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {addMilestoneMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Create Milestone</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
