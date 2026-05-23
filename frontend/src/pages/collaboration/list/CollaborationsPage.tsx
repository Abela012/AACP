import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Search, 
  Filter, 
  Star,
  Loader2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useUserCollaborations, useCompleteCollaboration } from '@/src/hooks/useCollaborations';
import { useSubmitReview } from '@/src/hooks/useReviews';
import { ReviewModal } from '@/src/shared/components/rating/ReviewModal';
import { type Collaboration } from '@/src/api/collaborationApi';

export default function CollaborationsPage() {
  const navigate = useNavigate();
  const { user: clerkUser } = useClerkUser();
  const { userRole } = useUser();
  const myId = clerkUser?.id ?? '';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  
  const { data: collaborations, isLoading } = useUserCollaborations(myId);
  const completeMutation = useCompleteCollaboration();
  const submitReviewMutation = useSubmitReview();

  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; collabId: string; targetName: string } | null>(null);

  const filteredCollaborations = (collaborations ?? []).filter((c: Collaboration) => {
    const statusMap: Record<string, string> = {
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'on_hold': 'On Hold'
    };
    const currentStatus = statusMap[c.status] || c.status;
    
    const matchesStatus = selectedStatus === 'All Status' || currentStatus === selectedStatus;
    const searchLower = searchQuery.trim().toLowerCase();
    const title = c.opportunity?.title || '';
    const matchesSearch = !searchLower || title.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  const handleComplete = async (collabId: string, targetName: string) => {
    if (!window.confirm('Are you sure you want to mark this project as completed?')) return;
    try {
      await completeMutation.mutateAsync(collabId);
      // After completion, show review modal
      setReviewModal({ isOpen: true, collabId, targetName });
    } catch (err: any) {
      alert(err.message || 'Failed to complete collaboration');
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewModal) return;
    try {
      await submitReviewMutation.mutateAsync({
        collaborationId: reviewModal.collabId,
        rating,
        comment
      });
      alert('Thank you for your feedback!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  const Layout = userRole === 'advertiser' ? AdvertiserLayout : BusinessLayout;

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">My Collaborations</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage your active projects and track your performance.</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-white/5 p-4 rounded-4xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none mb-8 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search collaborations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 focus:border-aacp-olive dark:focus:border-aacp-olive outline-none text-sm dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 outline-none bg-white dark:bg-white/5"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Completed</option>
              <option>On Hold</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Collaborations Grid */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 size={40} className="animate-spin text-aacp-olive" />
              <p className="text-gray-500 font-bold">Loading your collaborations...</p>
            </div>
          ) : filteredCollaborations.length > 0 ? (
            filteredCollaborations.map((c: Collaboration) => {
              const partner = userRole === 'business_owner' ? c.advertiser : c.businessOwner;
              const partnerName = partner?.fullName || partner?.firstName ? `${partner.firstName} ${partner.lastName}` : 'Partner';
              
              return (
                <motion.div 
                  key={c._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(`/collaborations/${c._id}`)}
                  className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="p-8 lg:w-2/3 border-r border-gray-50 dark:border-white/5">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black",
                          c.status === 'active' ? "bg-aacp-olive" : "bg-gray-400"
                        )}>
                          {c.opportunity?.title?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-aacp-olive transition-colors">
                            {c.opportunity?.title || 'Project Collaboration'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                              c.status === 'active' ? "bg-aacp-olive/10 text-aacp-olive" : 
                              c.status === 'completed' ? "bg-blue-500/10 text-blue-600" :
                              "bg-gray-100 text-gray-500"
                            )}>
                              {c.status}
                            </span>
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                              <Clock size={12} />
                              Started {new Date(c.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collaborator</p>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                              <img 
                                src={partner?.profilePicture || `https://ui-avatars.com/api/?name=${partnerName}&background=10b981&color=fff`} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{partnerName}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Budget</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">
                            {c.agreedBudget?.amount?.toLocaleString() || '0'} {c.agreedBudget?.currency || 'AACP'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-aacp-olive rounded-full transition-all duration-500" 
                                style={{ width: `${c.overallProgress || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">{c.overallProgress || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 lg:w-1/3 bg-gray-50/30 dark:bg-white/[0.01] flex flex-col justify-center gap-3">
                      {c.status === 'active' && userRole === 'business_owner' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleComplete(c._id, partnerName); }}
                          className="w-full h-12 bg-aacp-olive text-white font-black rounded-xl hover:bg-aacp-olive transition-all shadow-lg shadow-aacp-olive/20 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={18} /> Complete Project
                        </button>
                      )}
                      
                      {c.status === 'completed' && (
                         <button 
                          onClick={(e) => { e.stopPropagation(); setReviewModal({ isOpen: true, collabId: c._id, targetName: partnerName }); }}
                          className="w-full h-12 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                        >
                          <Star size={18} /> Rate Experience
                        </button>
                      )}

                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/messages?collab=${c._id}`); }}
                        className="w-full h-12 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={18} /> Send Message
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/collaborations/${c._id}`); }}
                        className="w-full h-12 mt-2 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        View Project Details <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase size={32} className="text-gray-300" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">No collaborations yet</h4>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2 font-medium">
                Once you start a collaboration with a creator or brand, it will appear here for you to manage.
              </p>
            </div>
          )}
        </div>
      </main>

      <ReviewModal 
        isOpen={!!reviewModal?.isOpen}
        onClose={() => setReviewModal(null)}
        onSubmit={handleReviewSubmit}
        targetName={reviewModal?.targetName}
      />
    </Layout>
  );
}
