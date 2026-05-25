import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Star, Send, Loader2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { cn } from '@/src/shared/utils/cn';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  title?: string;
  subtitle?: string;
  targetName?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Leave a Review",
  subtitle = "How was your experience working with this user?",
  targetName
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-[#0f0f0f] rounded-[2.5rem] shadow-2xl z-[9999] overflow-hidden border border-gray-100 dark:border-white/5"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    {title} {targetName && <span className="text-primary-blue">for {targetName}</span>}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">{subtitle}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Rating Section */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    Overall Rating
                  </label>
                  <div className="flex flex-col items-center p-6 bg-gray-50 aacp-card aacp-card--glass">
                    <StarRating 
                      rating={rating} 
                      onRatingChange={setRating} 
                      size={40} 
                    />
                    <p className="mt-4 text-xs font-bold text-gray-400">
                      {rating === 0 ? "Select stars" : 
                       rating === 1 ? "Poor" : 
                       rating === 2 ? "Fair" : 
                       rating === 3 ? "Good" : 
                       rating === 4 ? "Very Good" : "Excellent!"}
                    </p>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <MessageSquare size={12} className="text-primary-blue" />
                    Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience working together..."
                    className="w-full h-32 p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 outline-none focus:border-primary-blue transition-all resize-none text-sm font-medium text-gray-900 dark:text-white"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl",
                    rating > 0 
                      ? "bg-primary-blue text-white hover:bg-primary-blue shadow-primary-blue/20" 
                      : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Review
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
