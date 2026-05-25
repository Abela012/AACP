import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  RotateCcw,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

export type ReportTypeOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type NewReportModalProps = {
  open: boolean;
  onClose: () => void;
  reportTypes: ReportTypeOption[];
  selectedReportType: string | null;
  onSelectReportType: (id: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  title?: string;
  subtitle?: string;
};

export default function NewReportModal({
  open,
  onClose,
  reportTypes,
  selectedReportType,
  onSelectReportType,
  onGenerate,
  isGenerating,
  title = 'Generate Intelligence',
  subtitle = 'Custom Platform Reporting',
}: NewReportModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-report-title"
            className="fixed left-1/2 top-1/2 z-[70] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] border border-[#EFEFEF] bg-white shadow-2xl dark:border-white/5 dark:bg-[#0F0F0F] sm:rounded-[3rem]"
          >
            <div className="p-8 sm:p-10">
              <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-blue/10 text-primary-blue">
                    <BarChart3 size={24} aria-hidden />
                  </div>
                  <div>
                    <h2 id="new-report-title" className="text-xl font-black text-[#1A1D1F] dark:text-white">
                      {title}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9A9FA5]">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl p-3 transition-all hover:bg-gray-100 dark:hover:bg-white/5"
                  aria-label="Close report dialog"
                >
                  <X size={24} className="text-[#9A9FA5]" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-widest text-[#9A9FA5]">
                    Report category
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {reportTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => onSelectReportType(type.id)}
                        className={cn(
                          'group relative flex flex-col items-center gap-3 rounded-4xl border p-6 transition-all',
                          selectedReportType === type.id
                            ? 'border-primary-blue bg-white shadow-xl shadow-primary-blue/15 dark:bg-white/10 dark:shadow-none'
                            : 'border-transparent bg-gray-50 hover:border-primary-blue/30 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10'
                        )}
                      >
                        <type.icon
                          size={20}
                          className={cn(
                            'transition-colors',
                            selectedReportType === type.id
                              ? 'text-primary-blue'
                              : 'text-[#9A9FA5] group-hover:text-primary-blue'
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            'text-xs font-bold transition-colors',
                            selectedReportType === type.id
                              ? 'text-[#1A1D1F] dark:text-white'
                              : 'text-[#6F767E]'
                          )}
                        >
                          {type.label}
                        </span>
                        {selectedReportType === type.id && (
                          <motion.div
                            layoutId="report-selected-check"
                            className="absolute right-4 top-4 text-primary-blue"
                          >
                            <CheckCircle2 size={16} aria-hidden />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="mb-4 block text-[10px] font-black uppercase tracking-widest text-[#9A9FA5]">
                      Output format
                    </label>
                    <select
                      className="w-full appearance-none rounded-2xl border border-[#EFEFEF] bg-gray-50 px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-blue/20 dark:border-white/10 dark:bg-white/5"
                      defaultValue="pdf"
                    >
                      <option value="pdf">Portable Document (PDF)</option>
                      <option value="csv">CSV Spreadsheet</option>
                      <option value="xlsx">Excel Workbook</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-4 block text-[10px] font-black uppercase tracking-widest text-[#9A9FA5]">
                      Date range
                    </label>
                    <select
                      className="w-full appearance-none rounded-2xl border border-[#EFEFEF] bg-gray-50 px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-blue/20 dark:border-white/10 dark:bg-white/5"
                      defaultValue="30"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="quarter">Current quarter</option>
                      <option value="year">Fiscal year</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className={cn(
                    'mt-4 flex w-full items-center justify-center gap-3 rounded-4xl py-5 text-xs font-black uppercase tracking-[0.2em] transition-all',
                    isGenerating
                      ? 'cursor-not-allowed bg-gray-100 text-[#9A9FA5] dark:bg-white/5'
                      : 'bg-primary-blue text-white shadow-xl shadow-primary-blue/20 hover:bg-primary-blue-hover'
                  )}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <RotateCcw size={18} aria-hidden />
                      </motion.div>
                      Generating...
                    </>
                  ) : (
                    'Generate report'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
