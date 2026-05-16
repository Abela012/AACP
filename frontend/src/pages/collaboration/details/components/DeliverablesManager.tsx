import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Video, 
  Check, 
  X, 
  RotateCcw,
  MessageSquare,
  ExternalLink,
  Download,
  Clock,
  FileText
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface Deliverable {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  notes: string;
  status: 'pending' | 'approved' | 'revision_requested' | 'rejected';
  feedback?: string;
  revisionCount: number;
  submittedAt: string;
}

interface DeliverablesManagerProps {
  deliverables: Deliverable[];
  userRole: string;
  onUpload: (data: any) => void;
  onAction: (id: string, action: string, feedback?: string) => void;
}

export const DeliverablesManager: React.FC<DeliverablesManagerProps> = ({ deliverables, userRole, onUpload, onAction }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isReviewing, setIsReviewing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [uploadData, setUploadData] = useState({ notes: '', type: 'image', file: null as File | null });

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'revision_requested': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-200';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon size={24} className="text-blue-500" />;
    if (type.includes('video')) return <Video size={24} className="text-purple-500" />;
    return <FileText size={24} className="text-gray-500" />;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deliverables</h2>
          <p className="text-sm text-gray-500">Submit and review campaign content</p>
        </div>
        {userRole === 'advertiser' && (
          <button 
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
          >
            <Upload size={18} />
            Upload Content
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliverables?.length === 0 && !isUploading ? (
          <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5">
             <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <File className="text-gray-300" size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">No deliverables yet</h3>
             <p className="text-sm text-gray-500 mt-1">
               Content drafts and final assets will appear here.
             </p>
          </div>
        ) : (
          deliverables?.map((item) => (
            <motion.div 
              layout
              key={item.id}
              className="group bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                 {item.fileType.includes('image') ? (
                   <img src={item.fileUrl} alt="" className="w-full h-full object-cover" />
                 ) : (
                   <div className="flex flex-col items-center gap-3">
                      {getFileIcon(item.fileType)}
                      <span className="text-[10px] font-black uppercase text-gray-400">{item.fileType.split('/')[1] || 'FILE'}</span>
                   </div>
                 )}
                 <div className="absolute top-4 right-4 flex gap-2">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg backdrop-blur-md border shadow-sm", getStatusStyle(item.status))}>
                      {item.status.replace('_', ' ')}
                    </span>
                 </div>
              </div>
              
              <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{item.fileName}</h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase flex items-center gap-1">
                        <Clock size={10} /> Submitted {new Date(item.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {item.revisionCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                        v{item.revisionCount + 1}
                      </span>
                    )}
                 </div>

                 <p className="text-xs text-gray-500 line-clamp-2 mb-6 min-h-[2.5rem]">
                   {item.notes || 'No notes provided.'}
                 </p>

                 {item.feedback && (
                   <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-100 dark:border-amber-500/10">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <MessageSquare size={10} /> Revision Note
                      </p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium italic">"{item.feedback}"</p>
                   </div>
                 )}

                 <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100 dark:border-white/5">
                      <ExternalLink size={14} /> View
                    </button>
                    {userRole === 'business_owner' && item.status === 'pending' && (
                      <button 
                        onClick={() => setIsReviewing(item.id)}
                        className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Review
                      </button>
                    )}
                    {userRole === 'advertiser' && item.status === 'revision_requested' && (
                      <button 
                        onClick={() => setIsUploading(true)}
                        className="flex-1 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={14} /> Resubmit
                      </button>
                    )}
                 </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/10"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upload Deliverable</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 text-center hover:border-emerald-500 transition-all cursor-pointer group">
                   <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-emerald-500" size={24} />
                   </div>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">Click or drag file to upload</p>
                   <p className="text-xs text-gray-400 mt-1">Videos, Images, PDFs up to 50MB</p>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Notes for Business Owner</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide details about this submission..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    value={uploadData.notes}
                    onChange={(e) => setUploadData({...uploadData, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsUploading(false)}
                    className="flex-1 py-3 border border-gray-100 dark:border-white/10 text-gray-500 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onUpload(uploadData);
                      setIsUploading(false);
                      setUploadData({ notes: '', type: 'image', file: null });
                    }}
                    className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 shadow-lg"
                  >
                    Submit Work
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/10"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Review Deliverable</h3>
              <p className="text-sm text-gray-500 mb-6">Provide feedback and take action on this submission.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Feedback / Revision Notes</label>
                  <textarea 
                    rows={4}
                    placeholder="e.g. Please change the music to something more upbeat..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={() => {
                      onAction(isReviewing, 'approved');
                      setIsReviewing(null);
                      setFeedback('');
                    }}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Approve Deliverable
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        onAction(isReviewing, 'revision_requested', feedback);
                        setIsReviewing(null);
                        setFeedback('');
                      }}
                      disabled={!feedback}
                      className="py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-400 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RotateCcw size={18} /> Request Revision
                    </button>
                    <button 
                      onClick={() => {
                        onAction(isReviewing, 'rejected', feedback);
                        setIsReviewing(null);
                        setFeedback('');
                      }}
                      className="py-3 border border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <X size={18} /> Reject
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsReviewing(null)}
                    className="w-full py-3 mt-2 text-gray-400 font-bold text-xs hover:text-gray-600"
                  >
                    Cancel Review
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
