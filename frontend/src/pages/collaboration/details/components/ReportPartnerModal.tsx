import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Flag,
  AlertTriangle,
  CreditCard,
  Clock,
  Users,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

type ReportCategory = "payment" | "campaign" | "collaboration" | "other";
type ReportPriority = "LOW" | "MEDIUM" | "HIGH";

interface ReportOption {
  value: ReportCategory;
  label: string;
  icon: LucideIcon;
  description: string;
  defaultTitle: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    value: "payment",
    label: "Payment Issue",
    icon: CreditCard,
    description: "Business owner is not paying or delaying payment",
    defaultTitle: "Partner not fulfilling payment obligations",
  },
  {
    value: "campaign",
    label: "Late / Missing Deliverable",
    icon: Clock,
    description: "Advertiser is not delivering content on time or at all",
    defaultTitle: "Advertiser not delivering content on schedule",
  },
  {
    value: "collaboration",
    label: "Collaboration Misconduct",
    icon: Users,
    description: "Partner is violating agreed collaboration terms",
    defaultTitle: "Partner violating collaboration agreement",
  },
  {
    value: "other",
    label: "Other Issue",
    icon: HelpCircle,
    description: "A different issue not covered by the categories above",
    defaultTitle: "Issue with collaboration partner",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    category: ReportCategory;
    title: string;
    description: string;
    priority: ReportPriority;
  }) => Promise<void>;
  partnerName: string;
  isSubmitting: boolean;
}

export default function ReportPartnerModal({
  isOpen,
  onClose,
  onSubmit,
  partnerName,
  isSubmitting,
}: Props) {
  const [step, setStep] = useState<"category" | "details">("category");
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ReportPriority>("MEDIUM");

  const selectedOption = REPORT_OPTIONS.find(
    (o) => o.value === selectedCategory,
  );

  const handleCategorySelect = (opt: ReportOption) => {
    setSelectedCategory(opt.value);
    setTitle(opt.defaultTitle);
    setStep("details");
  };

  const handleClose = () => {
    setStep("category");
    setSelectedCategory(null);
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !title.trim() || !description.trim()) return;
    await onSubmit({
      category: selectedCategory,
      title: title.trim(),
      description: description.trim(),
      priority,
    });
    handleClose();
  };

  const priorityConfig: Record<
    ReportPriority,
    { label: string; color: string; bg: string }
  > = {
    LOW: {
      label: "Low",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20",
    },
    MEDIUM: {
      label: "Medium",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    },
    HIGH: {
      label: "High",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-4xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <Flag className="text-red-500" size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white">
                    Report Partner
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Reporting {partnerName}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === "category" ? (
                <motion.div
                  key="category"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                    What is the issue with your partner?
                  </p>
                  <div className="space-y-3">
                    {REPORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleCategorySelect(opt)}
                        className="w-full flex items-start gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/3 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50/50 dark:hover:bg-red-500/5 text-left transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-red-200 dark:group-hover:border-red-500/30 transition-all">
                          <opt.icon
                            size={16}
                            className="text-gray-500 dark:text-gray-400 group-hover:text-red-500 transition-colors"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Notice */}
                  <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                    <AlertTriangle
                      size={14}
                      className="text-amber-500 mt-0.5 shrink-0"
                    />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      Reports are reviewed by AACP admins. Submitting false
                      reports may result in account suspension.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6 space-y-5"
                >
                  {/* Selected category chip */}
                  {selectedOption && (
                    <button
                      onClick={() => setStep("category")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                    >
                      <selectedOption.icon
                        size={12}
                        className="text-gray-500"
                      />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                        {selectedOption.label}
                      </span>
                      <ChevronDown
                        size={10}
                        className="text-gray-400 rotate-90"
                      />
                    </button>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief summary of the issue"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300 dark:focus:border-red-500/50 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      Detailed Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={`Describe the issue in detail. Include dates, amounts, or any relevant context that will help the admin investigate.`}
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300 dark:focus:border-red-500/50 transition-all resize-none"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      Priority Level
                    </label>
                    <div className="flex gap-2">
                      {(["LOW", "MEDIUM", "HIGH"] as ReportPriority[]).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => setPriority(p)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl text-xs font-black border transition-all",
                              priority === p
                                ? priorityConfig[p].bg +
                                    " " +
                                    priorityConfig[p].color
                                : "bg-gray-50 dark:bg-white/3 border-gray-200 dark:border-white/10 text-gray-400",
                            )}
                          >
                            {priorityConfig[p].label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setStep("category")}
                      className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={
                        !title.trim() || !description.trim() || isSubmitting
                      }
                      className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-black text-white transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Flag size={14} />
                          Submit Report
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
