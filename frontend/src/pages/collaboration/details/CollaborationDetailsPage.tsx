import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Flag,
  FileText,
  AlertCircle,
  Star
} from 'lucide-react';
import { useCollaborationDetails, useCompleteCollaboration } from '@/src/hooks/useCollaborations';
import { useSubmitReview, useCollaborationReviews } from '@/src/hooks/useReviews';
import { useUser } from '@/src/shared/context/UserContext';
import { useProfile } from '@/src/shared/context/ProfileContext';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { ReviewModal } from '@/src/shared/components/rating/ReviewModal';
import { cn } from '@/src/shared/utils/cn';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CollaborationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = useUser();
  const { profile } = useProfile();
  const { data: collab, isLoading, error } = useCollaborationDetails(id!);
  const { data: reviews } = useCollaborationReviews(id!);
  const completeMutation = useCompleteCollaboration();
  const submitReviewMutation = useSubmitReview();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Check if the current user (via profile email or ID) has reviewed
  const hasReviewed = reviews?.some(r => 
    r.reviewer === (profile as any)._id || r.reviewerEmail === profile.email
  );

  const handleComplete = async () => {
    if (!window.confirm('Mark this collaboration as completed?')) return;
    try {
      await completeMutation.mutateAsync(id!);
      toast.success('Collaboration marked as completed!');
      // Automatically open review modal after completion
      if (!hasReviewed) {
        setIsReviewModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete collaboration');
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    try {
      await submitReviewMutation.mutateAsync({
        collaborationId: id!,
        rating,
        comment
      });
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
      throw err;
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Collaboration Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
            The collaboration you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button 
            onClick={() => navigate('/collaborations')}
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Back to Collaborations
          </button>
        </div>
      </Layout>
    );
  }

  const partner = userRole === 'business_owner' ? collab.advertiser : collab.businessOwner;
  const partnerName = partner?.fullName || partner?.firstName ? `${partner.firstName} ${partner.lastName}` : 'Partner';

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                  collab.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : 
                  collab.status === 'completed' ? "bg-blue-500/10 text-blue-600" :
                  "bg-gray-100 text-gray-500"
                )}>
                  {collab.status}
                </span>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Clock size={12} />
                  Project ID: #{id?.slice(-6).toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                {collab.opportunity?.title || 'Collaboration Details'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/messages?collab=${id}`)}
              className="px-6 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <MessageSquare size={18} className="text-emerald-500" />
              Messenger
            </button>
            {collab.status === 'active' && userRole === 'business_owner' && (
              <button 
                onClick={handleComplete}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                Finalize Project
              </button>
            )}
            {collab.status === 'completed' && !hasReviewed && (
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="px-8 py-3 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Star size={18} />
                Rate Experience
              </button>
            )}
          </div>
        </div>

        <ReviewModal 
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          targetName={partnerName}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <section className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-emerald-500" size={20} />
                  Overview
                </h3>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Started {new Date(collab.startDate).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100/50 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Partner</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 overflow-hidden">
                      <img 
                        src={partner?.profilePicture || `https://ui-avatars.com/api/?name=${partnerName}&background=10b981&color=fff`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{partnerName}</p>
                      <p className="text-[10px] font-medium text-gray-500">{userRole === 'business_owner' ? 'Influencer' : 'Brand'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100/50 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Budget</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {collab.agreedBudget?.amount?.toLocaleString() || '0'} {collab.agreedBudget?.currency || 'AACP'}
                      </p>
                      <p className="text-[10px] font-medium text-gray-500 italic">Fully Funded</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100/50 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Flag size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{collab.overallProgress || 0}%</p>
                      <div className="w-16 h-1 bg-gray-100 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${collab.overallProgress || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {collab.opportunity?.description || 'No description provided.'}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-4">
                  {collab.opportunity?.platforms?.map((p: string) => (
                    <span key={p} className="text-[10px] font-bold px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-lg">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Milestones / Timeline */}
            <section className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <Flag className="text-emerald-500" size={20} />
                Project Milestones
              </h3>

              <div className="space-y-6">
                {[
                  { label: 'Agreement Signed', date: collab.startDate, status: 'completed' },
                  { label: 'Content Creation', date: 'In Progress', status: 'current' },
                  { label: 'Final Review', date: 'Pending', status: 'upcoming' },
                  { label: 'Project Completion', date: 'Pending', status: 'upcoming' }
                ].map((m, idx) => (
                  <div key={idx} className="flex items-center gap-6 group">
                    <div className="relative flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center z-10 border-2",
                        m.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : 
                        m.status === 'current' ? "bg-white dark:bg-[#0a0a0a] border-emerald-500 text-emerald-500" :
                        "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-white/10 text-gray-300"
                      )}>
                        {m.status === 'completed' ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                      {idx !== 3 && (
                        <div className={cn(
                          "w-0.5 h-12 -mb-6",
                          m.status === 'completed' ? "bg-emerald-500" : "bg-gray-100 dark:bg-white/5"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-center">
                        <p className={cn(
                          "font-bold",
                          m.status === 'upcoming' ? "text-gray-400" : "text-gray-900 dark:text-white"
                        )}>{m.label}</p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {m.status === 'completed' ? new Date(m.date).toLocaleDateString() : m.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Quick Stats Card */}
            <section className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
               <div className="relative z-10">
                 <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                   <ShieldCheck size={20} />
                   Secure Contract
                 </h3>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center py-3 border-b border-white/10">
                     <span className="text-xs font-bold text-white/70">Payment Method</span>
                     <span className="text-xs font-black">Escrow (AACP)</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-white/10">
                     <span className="text-xs font-bold text-white/70">Protection</span>
                     <span className="text-xs font-black">Standard AACP</span>
                   </div>
                   <div className="flex justify-between items-center py-3">
                     <span className="text-xs font-bold text-white/70">Dispute Status</span>
                     <span className="text-xs font-black">None</span>
                   </div>
                 </div>
                 
                 <button className="w-full mt-8 py-3 bg-white text-emerald-600 font-black rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm">
                   View Contract <ExternalLink size={14} />
                 </button>
               </div>
            </section>

            {/* Support / Help */}
            <section className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8">
              <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4">Need Help?</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
                Our support team is available 24/7 to help you with any issues during your collaboration.
              </p>
              <button className="w-full py-3 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 dark:border-white/10 text-sm">
                Open Support Ticket
              </button>
            </section>
          </div>
        </div>
      </main>
    </Layout>
  );
}
