import { useState, useMemo } from 'react';
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
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  XCircle,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/shared/utils/cn';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import AdvertiserLayout from '@/src/shared/components/layouts/AdvertiserLayout';
import { useUser } from '@/src/shared/context/UserContext';
import { useUserCollaborations, useCompleteCollaboration, useStartCollaboration } from '@/src/hooks/useCollaborations';
import { useBusinessOwnerApplications, useMyApplications, useAcceptApplication, useRejectApplication } from '@/src/hooks/useApplications';
import { useSubmitReview } from '@/src/hooks/useReviews';
import { ReviewModal } from '@/src/shared/components/rating/ReviewModal';
import { type Collaboration } from '@/src/api/collaborationApi';

type TabType = 'active' | 'matches' | 'completed';

export default function CollaborationsPage() {
  const navigate = useNavigate();
  const { user: clerkUser } = useClerkUser();
  const { userRole } = useUser();
  const myId = clerkUser?.id ?? '';
  
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data Fetching
  const { data: collaborations, isLoading: collabLoading } = useUserCollaborations(myId);
  const { data: boApplications, isLoading: boAppsLoading } = useBusinessOwnerApplications();
  const { data: advertiserApplications, isLoading: advAppsLoading } = useMyApplications(myId);
  
  // Mutations
  const completeMutation = useCompleteCollaboration();
  const submitReviewMutation = useSubmitReview();
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();
  const startCollaborationMutation = useStartCollaboration();

  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; collabId: string; targetName: string } | null>(null);

  // Filter Logic
  const filteredData = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    
    if (activeTab === 'matches') {
      const apps = userRole === 'business_owner' ? (boApplications || []) : (advertiserApplications || []);
      
      // Filter first
      const filteredApps = apps.filter((app: any) => {
        const title = app.opportunity?.title || '';
        const name = `${app.advertiser?.firstName || ''} ${app.advertiser?.lastName || ''}`.toLowerCase();
        const businessName = app.opportunity?.businessOwner?.fullName?.toLowerCase() || '';
        return (app.status === 'pending') && 
               (title.toLowerCase().includes(searchLower) || name.includes(searchLower) || businessName.includes(searchLower));
      });

      // Then Rank
      if (userRole === 'business_owner') {
        return filteredApps.sort((a: any, b: any) => {
          const aNiches = a.advertiser?.profileData?.niches || [];
          const bNiches = b.advertiser?.profileData?.niches || [];
          const aCategory = a.opportunity?.category;
          const bCategory = b.opportunity?.category;

          const aMatch = aNiches.some((n: string) => n.toLowerCase() === aCategory?.toLowerCase());
          const bMatch = bNiches.some((n: string) => n.toLowerCase() === bCategory?.toLowerCase());

          const aScore = (aMatch ? 100 : 0) + (a.aiMatchScore || 0);
          const bScore = (bMatch ? 100 : 0) + (b.aiMatchScore || 0);

          return bScore - aScore;
        });
      }
      return filteredApps;
    }

    const collabs = (collaborations || []).filter((c: Collaboration) => {
      if (activeTab === 'active') return c.status === 'active' || c.status === 'on_hold';
      if (activeTab === 'completed') return c.status === 'completed' || c.status === 'cancelled';
      return true;
    });

    return collabs.filter((c: Collaboration) => {
      const title = c.opportunity?.title || '';
      const partner = userRole === 'business_owner' ? c.advertiser : c.businessOwner;
      const partnerName = `${partner?.firstName || ''} ${partner?.lastName || ''}`.toLowerCase();
      return title.toLowerCase().includes(searchLower) || partnerName.includes(searchLower);
    });
  }, [activeTab, collaborations, boApplications, advertiserApplications, userRole, searchQuery]);

  const handleAccept = async (appId: string) => {
    if (!window.confirm('Accept this proposal and start collaboration?')) return;
    try {
      await acceptMutation.mutateAsync(appId);
      await startCollaborationMutation.mutateAsync(appId);
      alert('Application accepted! Collaboration started.');
      setActiveTab('active');
    } catch (err: any) {
      alert(err.message || 'Failed to accept application');
    }
  };

  const handleReject = async (appId: string) => {
    const reason = window.prompt('Reason for rejection (optional):');
    if (reason === null) return;
    try {
      await rejectMutation.mutateAsync(appId);
    } catch (err: any) {
      alert(err.message || 'Failed to reject application');
    }
  };

  const handleComplete = async (collabId: string, targetName: string) => {
    if (!window.confirm('Are you sure you want to mark this project as completed?')) return;
    try {
      await completeMutation.mutateAsync(collabId);
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
      setReviewModal(null);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  // Prevent layout flicker or errors before role is loaded
  if (userRole === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  const Layout = userRole === 'advertiser' ? AdvertiserLayout : BusinessLayout;
  const isLoading = collabLoading || boAppsLoading || advAppsLoading;

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                {activeTab === 'matches' ? <Sparkles className="text-white" size={20} /> : <Briefcase className="text-white" size={20} />}
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                {activeTab === 'matches' ? 'Creator Matches' : 'Collaboration Hub'}
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium ml-1">
              {activeTab === 'matches' && userRole === 'business_owner' ? 'Our AI has identified the best creators for your active campaigns.' : userRole === 'business_owner' ? 'Manage your recruitment and active projects in one place.' : 'Track your applications and active collaborations.'}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            {activeTab === 'matches' && userRole === 'business_owner' && (
              <button className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all border border-emerald-100 dark:border-emerald-500/20">
                <Sparkles size={18} />
                Refine AI
              </button>
            )}
            
            <div className="flex bg-gray-100/50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 backdrop-blur-sm">
            <TabButton active={activeTab === 'active'} onClick={() => setActiveTab('active')} icon={Zap} label="Active" count={(collaborations || []).filter(c => c.status === 'active' || c.status === 'on_hold').length} />
            <TabButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} icon={Sparkles} label={userRole === 'business_owner' ? "Matches" : "My Proposals"} count={userRole === 'business_owner' ? (boApplications || []).filter((a: any) => a.status === 'pending').length : (advertiserApplications || []).filter((a: any) => a.status === 'pending').length} />
            <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')} icon={CheckCircle2} label="History" count={(collaborations || []).filter(c => c.status === 'completed' || c.status === 'cancelled').length} />
          </div>
        </div>
      </div>

        {/* Summary Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard 
            title="Active Projects" 
            value={(collaborations || []).filter(c => c.status === 'active').length} 
            icon={Zap} 
            color="emerald" 
            trend="+2 this week"
          />
          <StatCard 
            title="Total Recruitment" 
            value={userRole === 'business_owner' ? (boApplications || []).filter((a: any) => a.status === 'pending').length : (advertiserApplications || []).filter((a: any) => a.status === 'pending').length} 
            icon={Users} 
            color="blue" 
            trend="Needs review"
          />
          <StatCard 
            title="Managed Budget" 
            value={`${(collaborations || []).reduce((acc, c) => acc + (c.agreedBudget?.amount || 0), 0).toLocaleString()} AACP`} 
            icon={TrendingUp} 
            color="amber" 
          />
          <StatCard 
            title="Avg. Progress" 
            value={`${Math.round((collaborations || []).filter(c => c.status === 'active').reduce((acc, c) => acc + (c.overallProgress || 0), 0) / (collaborations?.filter(c => c.status === 'active').length || 1))}%`} 
            icon={Sparkles} 
            color="purple" 
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by project or partner name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm focus:border-emerald-500 outline-none text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 size={48} className="animate-spin text-emerald-500" />
                <Sparkles className="absolute -top-2 -right-2 text-amber-500 animate-pulse" size={16} />
              </div>
              <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Syncing Workspace...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredData.map((item: any, index: number) => (
                <div key={item._id}>
                  {activeTab === 'matches' ? (
                    <ApplicantCard 
                      app={item} 
                      role={userRole!} 
                      rank={index + 1}
                      onAccept={() => handleAccept(item._id)} 
                      onReject={() => handleReject(item._id)} 
                    />
                  ) : (
                    <CollaborationCard 
                      collab={item} 
                      role={userRole!} 
                      onComplete={() => handleComplete(item._id, userRole === 'business_owner' ? (item.advertiser?.firstName ? `${item.advertiser.firstName} ${item.advertiser.lastName}` : 'Partner') : (item.businessOwner?.firstName ? `${item.businessOwner.firstName} ${item.businessOwner.lastName}` : 'Brand'))}
                      onRate={() => setReviewModal({ isOpen: true, collabId: item._id, targetName: userRole === 'business_owner' ? (item.advertiser?.firstName ? `${item.advertiser.firstName} ${item.advertiser.lastName}` : 'Partner') : (item.businessOwner?.firstName ? `${item.businessOwner.firstName} ${item.businessOwner.lastName}` : 'Brand') })}
                    />
                  )}
                </div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-white/50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 backdrop-blur-sm"
            >
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Briefcase size={32} className="text-gray-300" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">No items found</h4>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2 font-medium">
                Try switching tabs or adjusting your search query.
              </p>
            </motion.div>
          )}
        </div>

        <ReviewModal 
          isOpen={!!reviewModal?.isOpen}
          onClose={() => setReviewModal(null)}
          onSubmit={handleReviewSubmit}
          targetName={reviewModal?.targetName}
        />
      </main>
    </Layout>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2.5",
        active 
          ? "bg-white dark:bg-white/10 text-emerald-600 shadow-sm border border-gray-100 dark:border-white/10" 
          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      )}
    >
      <Icon size={14} className={active ? "text-emerald-500" : ""} />
      {label}
      {count > 0 && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-lg text-[10px]",
          active ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

function CollaborationCard({ collab, role, onComplete, onRate }: { collab: Collaboration; role: string; onComplete: () => void; onRate: () => void }) {
  const navigate = useNavigate();
  const partner = role === 'business_owner' ? collab.advertiser : collab.businessOwner;
  const partnerName = partner?.firstName ? `${partner.firstName} ${partner.lastName}` : 'Project Partner';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all overflow-hidden group"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="p-8 lg:w-2/3 border-r border-gray-50 dark:border-white/5">
          <div className="flex items-center gap-5 mb-8">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg",
              collab.status === 'active' ? "bg-emerald-500 shadow-emerald-500/20" : 
              collab.status === 'completed' ? "bg-blue-500 shadow-blue-500/20" : "bg-gray-400"
            )}>
              {collab.opportunity?.title?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {collab.opportunity?.title || 'Project Collaboration'}
                </h3>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  collab.status === 'active' ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : 
                  collab.status === 'completed' ? "bg-blue-500/5 text-blue-600 border-blue-500/20" :
                  "bg-gray-100 text-gray-500 border-gray-200"
                )}>
                  {collab.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                  <Calendar size={12} className="text-emerald-500" />
                  Started {new Date(collab.startDate).toLocaleDateString()}
                </span>
                <span className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-500" />
                  {collab.milestones?.length || 0} Phases
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collaborator</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden border border-white dark:border-white/10 shadow-sm">
                  <img 
                    src={partner?.profilePicture || `https://ui-avatars.com/api/?name=${partnerName}&background=10b981&color=fff`} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{partnerName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agreed Budget</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-500" />
                <p className="text-sm font-black text-gray-900 dark:text-white">
                  {collab.agreedBudget?.amount?.toLocaleString() || '0'} {collab.agreedBudget?.currency || 'AACP'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</p>
                <span className="text-[10px] font-black text-emerald-500">{collab.overallProgress || 0}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden border border-gray-50 dark:border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${collab.overallProgress || 0}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 lg:w-1/3 bg-gray-50/50 dark:bg-white/[0.01] flex flex-col justify-center gap-3 border-l border-gray-50 dark:border-white/5">
          {collab.status === 'active' && role === 'business_owner' && (
            <button 
              onClick={onComplete}
              className="w-full h-12 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group/btn"
            >
              <CheckCircle2 size={18} className="group-hover/btn:scale-110 transition-transform" /> Complete Project
            </button>
          )}
          
          {collab.status === 'completed' && (
             <button 
              onClick={onRate}
              className="w-full h-12 bg-amber-400 text-black font-black rounded-xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <Star size={18} /> Rate Experience
            </button>
          )}

          <button 
            onClick={() => navigate(`/messages?collab=${collab._id}`)}
            className="w-full h-12 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} /> Send Message
          </button>
          
          <button 
            onClick={() => navigate(`/collaborations/${collab._id}`)}
            className="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            Project Workspace <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ApplicantCard({ app, role, onAccept, onReject, rank }: { app: any; role: string; onAccept: () => void; onReject: () => void; rank?: number }) {
  const navigate = useNavigate();
  const isBO = role === 'business_owner';
  const partner = isBO ? app.advertiser : app.opportunity?.businessOwner;
  const partnerName = isBO ? `${partner?.firstName || ''} ${partner?.lastName || ''}` : (partner?.fullName || 'Brand');
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row relative">
        {rank && role === 'business_owner' && (
          <div className="absolute top-0 left-0 w-12 h-12 bg-emerald-600 text-white flex items-center justify-center font-black text-lg rounded-br-[2rem] z-10 shadow-lg">
            #{rank}
          </div>
        )}
        <div className="p-8 lg:w-2/3 border-r border-gray-50 dark:border-white/5">
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-emerald-50 dark:border-emerald-500/10 shadow-lg">
                <img 
                  src={partner?.profilePicture || `https://ui-avatars.com/api/?name=${partnerName}&background=10b981&color=fff`} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0d0d0d] flex items-center justify-center">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  {isBO ? partnerName : app.opportunity?.title}
                </h3>
                {isBO && app.aiMatchScore >= 80 && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter shadow-sm flex items-center gap-1">
                    <Sparkles size={10} /> AI Recommended
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400">
                 <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {partner?.location || 'Remote'}</span>
                 <span className="flex items-center gap-1.5"><Zap size={14} className="text-emerald-500" /> {isBO ? `Applied for: ${app.opportunity?.title}` : `Proposed: ${app.proposedRate?.amount} ${app.proposedRate?.currency}`}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl relative">
             <Sparkles size={16} className="absolute -top-2 -left-2 text-amber-500 opacity-50" />
             <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic">
               "{app.coverLetter || 'I am excited to collaborate on this campaign and bring my unique content style to your brand vision.'}"
             </p>
          </div>
        </div>

        <div className="p-8 lg:w-1/3 bg-gray-50/50 dark:bg-white/[0.01] flex flex-col justify-center items-center gap-4">
           <div className="text-center mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span className="bg-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm shadow-amber-400/20">
                Awaiting Review
              </span>
           </div>

           {isBO ? (
             <div className="w-full space-y-3">
                <button 
                  onClick={onAccept}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Hire Creator
                </button>
                <button 
                  onClick={onReject}
                  className="w-full h-12 bg-white dark:bg-white/5 border border-red-100 dark:border-red-500/20 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Decline
                </button>
             </div>
           ) : (
             <div className="w-full space-y-3">
                <div className="text-center p-4 bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl">
                  <p className="text-xs text-gray-500 font-bold">Your proposal is currently being reviewed by the brand.</p>
                </div>
                <button 
                  onClick={() => navigate('/advertiser/campaigns')}
                  className="w-full h-12 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  View Opportunity
                </button>
             </div>
           )}
           
           <button 
             onClick={() => navigate(isBO ? `/admin/users/${partner?._id}` : `/campaigns`)}
             className="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-colors flex items-center gap-1"
           >
             Full Details <ExternalLink size={10} />
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20 shadow-purple-500/5",
  };

  return (
    <div className={cn(
      "p-6 rounded-[2rem] border backdrop-blur-sm shadow-xl transition-all hover:-translate-y-1 group",
      colors[color] || "bg-gray-100 dark:bg-white/5 border-gray-100 dark:border-white/10"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/80 dark:bg-black/20 rounded-2xl shadow-sm">
          <Icon size={20} className="group-hover:scale-110 transition-transform" />
        </div>
        {trend && (
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-white/40 dark:bg-black/10 px-2 py-0.5 rounded-lg">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}
