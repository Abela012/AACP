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
  FileText,
  Play
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface Deliverable {
  _id?: string;
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  title?: string;
  description?: string;
  notes: string;
  status: 'pending' | 'approved' | 'revision_requested' | 'rejected';
  feedbackFromOwner?: string;
  submittedAt: string;
}

interface DeliverablesManagerProps {
  deliverables: Deliverable[];
  userRole: string;
  onUpload: (data: any) => void;
  onAction: (id: string, action: string, feedback?: string) => void;
}

/** 
 * VideoPreview — attempts to stream any URL as a video.
 * Falls back to download if video fails to load.
 */
const VideoPreview: React.FC<{ url: string }> = ({ url }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="text-center px-10">
        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10">
          <FileText size={40} className="text-gray-500" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2">Unable to Stream Video</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
          Your browser couldn't load this video directly. Please download it to watch.
        </p>
        <a 
          href={url} 
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all"
        >
          <Download size={18} /> Download Video
        </a>
      </div>
    );
  }

  return (
    <video
      src={url}
      className="w-full h-full object-contain"
      controls
      autoPlay
      playsInline
      onError={() => setError(true)}
    >
      <source src={url} type="video/mp4" />
      <source src={url} type="video/webm" />
      <source src={url} type="video/ogg" />
    </video>
  );
};

export const DeliverablesManager: React.FC<DeliverablesManagerProps> = ({ deliverables, userRole, onUpload, onAction }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isReviewing, setIsReviewing] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<Deliverable | null>(null);
  const [feedback, setFeedback] = useState('');
  const [uploadData, setUploadData] = useState({ 
    title: '',
    description: '',
    notes: '', 
    type: 'image', 
    file: null as File | null 
  });

  const handleSubmit = async () => {
    if (!uploadData.file) return;
    
    // Trigger the upload callback
    onUpload({
      ...uploadData,
      onProgress: (progress: number) => setUploadProgress(progress)
    });
  };


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
          deliverables?.map((item, index) => (
            <motion.div 
              layout
              key={item._id || item.id || `deliverable-${index}`}
              className="group bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                 {item.fileType?.includes('image') ? (
                   <img src={item.fileUrl} alt="" className="w-full h-full object-cover" />
                 ) : item.fileType?.includes('video') ? (
                   <div className="relative w-full h-full group/player">
                     <video 
                       src={item.fileUrl} 
                       className="w-full h-full object-cover" 
                       muted
                       onMouseOver={(e) => e.currentTarget.play()}
                       onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                     />
                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/player:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                           <Play className="text-white fill-white ml-1" size={24} />
                        </div>
                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-3">
                      {getFileIcon(item.fileType || 'file')}
                      <span className="text-[10px] font-black uppercase text-gray-400">{(item.fileType || 'file').split('/')[1] || 'FILE'}</span>
                   </div>
                 )}
                 <div className="absolute top-4 right-4 flex gap-2">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg backdrop-blur-md border shadow-sm", getStatusStyle(item.status))}>
                      {item.status.replace('_', ' ')}
                    </span>
                 </div>
              </div>
              
              <div className="p-6">
                 <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                        {item.title || item.fileName || 'Untitled Deliverable'}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase flex items-center gap-1">
                        <Clock size={10} /> Submitted {new Date(item.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/10 uppercase tracking-tighter">
                      LATEST
                    </span>
                 </div>

                 <p className="text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                    {item.description || 'No description provided.'}
                 </p>

                 <p className="text-[11px] text-gray-400 line-clamp-2 mb-6 min-h-[2.5rem] italic">
                   Notes: {item.notes || 'No notes provided.'}
                 </p>

                 {item.feedbackFromOwner && (
                   <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-100 dark:border-amber-500/10">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <MessageSquare size={10} /> Revision Note
                      </p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium italic">"{item.feedbackFromOwner}"</p>
                   </div>
                 )}

                 <div className="flex gap-2">
                    <button 
                      onClick={() => setIsPreviewing(item)}
                      className="flex-1 py-2.5 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100 dark:border-white/5"
                    >
                      <ExternalLink size={14} /> View
                    </button>
                    {userRole === 'business_owner' && item.status === 'pending' && (
                      <button 
                        onClick={() => setIsReviewing(item._id || item.id)}
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
                <input 
                  type="file" 
                  id="deliverable-upload" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadData({ ...uploadData, file, type: file.type });
                  }}
                />
                <label 
                  htmlFor="deliverable-upload"
                  className="block border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 text-center hover:border-emerald-500 transition-all cursor-pointer group"
                >
                   <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      {uploadData.file ? <Check className="text-emerald-500" size={24} /> : <Upload className="text-emerald-500" size={24} />}
                   </div>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">
                     {uploadData.file ? uploadData.file.name : 'Click or drag file to upload'}
                   </p>
                   <p className="text-xs text-gray-400 mt-1">Videos, Images, PDFs up to 50MB</p>
                </label>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Deliverable Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TikTok Draft v1"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      value={uploadData.title}
                      onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Short Description</label>
                    <textarea 
                      rows={2}
                      placeholder="What is this submission about?"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      value={uploadData.description}
                      onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1">Internal Notes</label>
                    <textarea 
                      rows={2}
                      placeholder="Private notes for the business owner..."
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      value={uploadData.notes}
                      onChange={(e) => setUploadData({...uploadData, notes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setIsUploading(false);
                      setUploadProgress(0);
                    }}
                    className="flex-1 py-3 border border-gray-100 dark:border-white/10 text-gray-500 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      await handleSubmit();
                      setIsUploading(false);
                      setUploadProgress(0);
                      setUploadData({ title: '', description: '', notes: '', type: 'image', file: null });
                    }}
                    disabled={!uploadData.file || uploadProgress > 0}
                    className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 shadow-lg disabled:opacity-50"
                  >
                    {uploadProgress > 0 ? 'Uploading...' : 'Submit Deliverable'}
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

      {/* Media Preview Modal */}
      <AnimatePresence>
        {isPreviewing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsPreviewing(null)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl h-[90vh] bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                     {getFileIcon(isPreviewing.fileType || 'file')}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white leading-tight">{isPreviewing.title || isPreviewing.fileName}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> {new Date(isPreviewing.submittedAt).toLocaleDateString()}
                      </span>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border", getStatusStyle(isPreviewing.status))}>
                        {isPreviewing.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPreviewing(null)}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-all border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Media Player */}
                <div className="flex-1 bg-black flex items-center justify-center relative group">
                  {(() => {
                    const url  = isPreviewing.fileUrl  || '';
                    const name = isPreviewing.fileName || '';
                    const type = (isPreviewing.fileType || '').toLowerCase();

                    // ─── Priority 1: MIME type (most reliable — set by backend from req.file.mimetype) ───
                    if (type.startsWith('video/')) {
                      return (
                        <video
                          key={url}
                          src={url}
                          className="w-full h-full object-contain"
                          controls
                          autoPlay
                          playsInline
                        >
                          <source src={url} type={isPreviewing.fileType} />
                        </video>
                      );
                    }

                    if (type.startsWith('image/')) {
                      return (
                        <img src={url} alt="" className="w-full h-full object-contain" />
                      );
                    }

                    if (type === 'application/pdf') {
                      return (
                        <iframe src={url} className="w-full h-full" title="PDF Preview" />
                      );
                    }

                    // ─── Priority 2: Cloudinary URL path ───
                    if (url.includes('/video/upload/')) {
                      return (
                        <video key={url} src={url} className="w-full h-full object-contain" controls autoPlay playsInline>
                          <source src={url} type="video/mp4" />
                        </video>
                      );
                    }
                    if (url.includes('/image/upload/')) {
                      return <img src={url} alt="" className="w-full h-full object-contain" />;
                    }

                    // ─── Priority 3: File extension ───
                    const videoExts = ['.mp4', '.mov', '.webm', '.ogg', '.m4v'];
                    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                    if (videoExts.some(e => url.includes(e) || name.endsWith(e))) {
                      return (
                        <video key={url} src={url} className="w-full h-full object-contain" controls autoPlay playsInline>
                          <source src={url} type="video/mp4" />
                        </video>
                      );
                    }
                    if (imageExts.some(e => url.includes(e) || name.endsWith(e))) {
                      return <img src={url} alt="" className="w-full h-full object-contain" />;
                    }

                    // ─── Fallback: try video player — if it fails, show download ───
                    if (url) {
                      return <VideoPreview url={url} />;
                    }

                    // ─── No URL at all ───
                    return (
                      <div className="text-center px-10">
                        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10">
                          <FileText size={40} className="text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">No File Attached</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">This deliverable has no file URL saved.</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Sidebar Details & Actions */}
                <div className="w-full lg:w-[380px] bg-[#0f0f0f] border-l border-white/5 p-8 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Description</label>
                      <p className="text-sm text-gray-300 leading-relaxed font-medium">
                        {isPreviewing.description || 'No description provided for this submission.'}
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Internal Notes</label>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-xs text-gray-400 leading-relaxed italic">
                          "{isPreviewing.notes || 'No private notes provided.'}"
                        </p>
                      </div>
                    </div>

                    {isPreviewing.feedbackFromOwner && (
                      <div>
                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3 block">Brand Feedback</label>
                        <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10">
                          <p className="text-xs text-amber-200/70 leading-relaxed">
                            {isPreviewing.feedbackFromOwner}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-8 mt-8 border-t border-white/5">
                    {userRole === 'business_owner' && isPreviewing.status === 'pending' ? (
                      <div className="space-y-3">
                        <button 
                          onClick={() => {
                            setIsReviewing(isPreviewing._id || isPreviewing.id);
                            setIsPreviewing(null);
                          }}
                          className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          Review & Action
                        </button>
                        <button 
                          onClick={() => window.open(isPreviewing.fileUrl, '_blank')}
                          className="w-full py-4 bg-white/5 text-gray-400 font-black rounded-2xl hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> Save Offline
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => window.open(isPreviewing.fileUrl, '_blank')}
                        className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xl"
                      >
                        <Download size={18} /> Download Asset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
