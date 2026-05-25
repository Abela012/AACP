import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'success' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'info'
}) => {
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#0f0f0f] rounded-[2.5rem] shadow-2xl z-[9999] overflow-hidden border border-gray-100 dark:border-white/5"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  type === 'danger' ? "bg-red-500/10 text-red-500" :
                  type === 'success' ? "bg-primary-blue/10 text-primary-blue" :
                  type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                  "bg-blue-500/10 text-blue-500"
                )}>
                  {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                  {title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black text-sm transition-all shadow-xl",
                    type === 'danger' ? "bg-red-500 text-white hover:bg-red-400 shadow-red-500/20" :
                    type === 'success' ? "bg-primary-blue text-black hover:bg-neutral-border shadow-primary-blue/20" :
                    type === 'warning' ? "bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20" :
                    "bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-gray-900/20"
                  )}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full h-14 rounded-2xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
