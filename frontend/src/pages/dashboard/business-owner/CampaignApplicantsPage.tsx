import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Mail, 
  MapPin, 
  Briefcase,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';
import { useOpportunityApplications, useAcceptApplication, useRejectApplication } from '@/src/hooks/useApplications';
import { useOpportunity } from '@/src/hooks/useOpportunities';
import { useMarketingAnalysis } from '@/src/hooks/useMarketingAnalysis';
import { useStartCollaboration } from '@/src/hooks/useCollaborations';
import { cn } from '@/src/shared/utils/cn';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CampaignApplicantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: applications, isLoading: appsLoading } = useOpportunityApplications(id || '');
  const { data: oppData, isLoading: oppLoading } = useOpportunity(id || '');
  const { data: analysisData, isLoading: analysisLoading } = useMarketingAnalysis(id || '');
  
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();
  const startCollaborationMutation = useStartCollaboration();


  const handleAccept = async (appId: string) => {
    if (!window.confirm('Are you sure you want to accept this creator? This will initiate the collaboration.')) return;
    try {
      await acceptMutation.mutateAsync(appId);
      // Automatically start collaboration
      await startCollaborationMutation.mutateAsync(appId);
      alert('Application accepted! A new collaboration has been created.');
      navigate('/messages');
    } catch (err: any) {
      alert(err.message || 'Failed to accept application');
    }
  };

  const handleReject = async (appId: string) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return;
    try {
      await rejectMutation.mutateAsync(appId);
      alert('Application rejected.');
    } catch (err: any) {
      alert(err.message || 'Failed to reject application');
    }
  };

  if (oppLoading || appsLoading) {
    return (
      <BusinessLayout>
        <div className="h-screen flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="font-bold text-gray-500">Loading applicant data...</p>
        </div>
      </BusinessLayout>
    );
  }

  const opportunity = oppData?.opportunity;

  return (
    <BusinessLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header & Back Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/campaigns')}
            className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100 dark:border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Campaign Details</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Management Hub</p>
          </div>
        </div>

        {/* TOP SECTION: About the Post */}
        <section className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 border-b border-gray-50 dark:border-white/5 bg-emerald-500/5">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                    {opportunity?.status || 'Active'}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">
                    {opportunity?.createdAt ? `Posted on ${new Date(opportunity.createdAt).toLocaleDateString()}` : ''}
                  </span>
                </div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">
                  {opportunity?.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {opportunity?.description || 'No description provided for this campaign.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4 w-full md:w-auto">
                <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Budget</p>
                  <p className="text-xl font-black text-emerald-600">${(typeof opportunity?.budget === 'object' ? opportunity?.budget.amount : (opportunity?.budget || 0)).toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{opportunity?.category}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-8 md:px-12 py-6 bg-gray-50/50 dark:bg-white/[0.02] flex flex-wrap gap-8">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-gray-500">Platform: <span className="text-gray-900 dark:text-white">{opportunity?.platforms?.join(', ') || 'Multi-platform'}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-gray-500">Applicants: <span className="text-gray-900 dark:text-white">{applications?.length || 0} Total</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-gray-500">Type: <span className="text-gray-900 dark:text-white">Professional Collaboration</span></span>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION: Applied Advertisers */}
        <section className="space-y-8">
          
          {/* AI Marketing Analysis Summary & Chart */}
          {!analysisLoading && analysisData?.summary && (
            <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-white/5 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/20 shadow-lg p-8 relative overflow-hidden flex flex-col lg:flex-row gap-8">
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <Sparkles className="w-32 h-32 text-emerald-500" />
              </div>
              
              <div className="relative z-10 lg:w-1/2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">AI Profitability Analysis</h3>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                  {analysisData.summary}
                </div>
              </div>

              {analysisData?.analysis && analysisData.analysis.length > 0 && (
                <div className="relative z-10 lg:w-1/2 h-64 bg-white/50 dark:bg-black/20 rounded-3xl p-4 border border-emerald-100/50 dark:border-emerald-500/10">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">Projected ROI by Applicant</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData.analysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="advertiserName" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value}%`, 'ROI']}
                      />
                      <Bar dataKey="profitPercentage" radius={[4, 4, 4, 4]}>
                        {analysisData.analysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profitPercentage > 0 ? '#10b981' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              Applied Advertisers 
              <span className="text-sm font-bold bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-gray-500">
                {applications?.length || 0}
              </span>
            </h3>
            <div className="flex gap-2">
              <button className="p-2 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-gray-500">
                <TrendingUp size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {applications?.map((app: any) => (
              <motion.div 
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all overflow-hidden group"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Applicant Wrapped Info */}
                  <div className="p-8 md:p-10 lg:w-2/3 border-r border-gray-50 dark:border-white/5">
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white dark:border-[#111] shadow-lg bg-gray-100">
                          <img 
                            src={app.advertiser?.profilePicture || `https://ui-avatars.com/api/?name=${app.advertiser?.firstName}+${app.advertiser?.lastName}&background=10b981&color=fff`} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-[#111] flex items-center justify-center">
                          <ShieldCheck size={14} className="text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                            {app.advertiser?.firstName} {app.advertiser?.lastName}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-500 px-2 py-1 rounded">Creator</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6">
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {app.advertiser?.location || 'Remote'}</span>
                          <span className="flex items-center gap-1.5"><Mail size={14} className="text-emerald-500" /> {app.advertiser?.email}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl relative mb-4">
                           <Sparkles size={16} className="absolute -top-2 -left-2 text-amber-500" />
                           <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                             "{app.coverLetter || 'I am very interested in this opportunity and believe my content style matches your brand vision.'}"
                           </p>
                        </div>
                        
                        {app.applicationData ? (
                          <div className="mb-4 space-y-4">
                            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4 rounded-2xl">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Professional Snapshot</p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">Current Role</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{app.applicationData.currentTitle || 'N/A'} at {app.applicationData.currentCompany || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Experience</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{app.applicationData.experienceYears || 'N/A'} Years</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Education Level</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{app.applicationData.educationLevel || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Work Preference</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{app.applicationData.workPreference || 'Remote'}</p>
                                </div>
                              </div>
                            </div>

                            {app.applicationData.skills && app.applicationData.skills.length > 0 && (
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Submitted Skills ({app.applicationData.proficiency || 'Intermediate'})</p>
                                <div className="flex flex-wrap gap-2">
                                  {app.applicationData.skills.map((skill: string, i: number) => (
                                    <span key={`skill-${i}`} className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-500/20">{skill}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {app.applicationData.resumeUrl && (
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Attached Document</p>
                                <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl cursor-pointer">
                                  <FileText size={16} /> {app.applicationData.resumeUrl}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {(app.advertiser?.profileData?.niches?.length > 0 || app.advertiser?.profileData?.skills?.length > 0) && (
                              <div className="mb-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Professional Skills & Niches</p>
                                <div className="flex flex-wrap gap-2">
                                  {app.advertiser?.profileData?.skills?.map((skill: string, i: number) => (
                                    <span key={`skill-${i}`} className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-500/20">{skill}</span>
                                  ))}
                                  {app.advertiser?.profileData?.niches?.map((niche: string, i: number) => (
                                    <span key={`niche-${i}`} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">{niche}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {app.advertiser?.profileData?.website && (
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Portfolio / Resume</p>
                                 <a href={app.advertiser.profileData.website.startsWith('http') ? app.advertiser.profileData.website : `https://${app.advertiser.profileData.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl">
                                   <FileText size={16} /> View Professional Portfolio <ExternalLink size={14} />
                                 </a>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proposed Rate</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          {app.proposedRate?.amount ? `${app.proposedRate.amount} ${app.proposedRate.currency || 'ETB'}` : 'N/A'}
                        </p>
                      </div>
                      
                      {(() => {
                        const applicantAnalysis = analysisData?.analysis?.find(
                          (a) => a.advertiserId === (app.advertiser?._id || app.advertiser)
                        );
                        
                        if (applicantAnalysis) {
                          return (
                            <>
                              <div className="text-center p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. Revenue</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white">
                                  {applicantAnalysis.estimatedRevenue.toLocaleString()} {applicantAnalysis.currency}
                                </p>
                              </div>
                              <div className="text-center p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. ROI</p>
                                <p className={cn(
                                  "text-sm font-black",
                                  applicantAnalysis.profitable ? "text-emerald-500" : "text-amber-500"
                                )}>
                                  {applicantAnalysis.profitPercentage > 0 ? '+' : ''}{applicantAnalysis.profitPercentage}%
                                </p>
                              </div>
                            </>
                          );
                        }
                        
                        return (
                          <>
                            <div className="text-center p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Match Score</p>
                              <p className="text-sm font-black text-emerald-500">{app.aiMatchScore ? `${Math.round(app.aiMatchScore)}%` : '92%'}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Timeline</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{app.proposedTimeline || 'Not specified'}</p>
                            </div>
                          </>
                        );
                      })()}

                      <div className="text-center p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">Standard</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions Section */}
                  <div className="p-8 lg:w-1/3 bg-gray-50/30 dark:bg-white/[0.01] flex flex-col justify-center items-center gap-6">
                    <div className="text-center mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Application Status</p>
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest",
                        app.status === 'pending' ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600" :
                        app.status === 'accepted' ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" :
                        "bg-red-100 dark:bg-red-500/20 text-red-600"
                      )}>
                        {app.status === 'pending' ? 'Awaiting Review' : app.status}
                      </div>
                    </div>

                    <div className="w-full space-y-3">
                      {app.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleAccept(app._id)}
                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={18} /> Accept Proposal
                          </button>
                          <button 
                            onClick={() => handleReject(app._id)}
                            className="w-full h-14 bg-white dark:bg-white/5 border border-red-100 dark:border-red-500/20 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={18} /> Decline
                          </button>
                        </>
                      ) : (
                        <button className="w-full h-14 bg-gray-100 dark:bg-white/10 text-gray-500 font-bold rounded-2xl cursor-not-allowed">
                          Action Completed
                        </button>
                      )}
                      <button className="w-full h-14 text-xs font-bold text-gray-400 hover:text-gray-900 transition-all flex items-center justify-center gap-2">
                        <ExternalLink size={14} /> View Full Profile
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {applications?.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5">
                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="text-gray-300" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">No applications yet</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                  Once creators start applying to your campaign, their professional "wrapped" documents will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </BusinessLayout>
  );
}
