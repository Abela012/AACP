import { motion } from 'framer-motion';
import { cn } from '@/src/shared/utils/cn';

export function WizardSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.02] p-5 md:p-6">
      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      <motion.div className="mt-4 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {children}
      </motion.div>
    </div>
  );
}

export function WizardField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <motion.div className="space-y-1.5" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none"
      />
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </motion.div>
  );
}

export function WizardSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function WizardTagGroup({
  label,
  options,
  selected,
  onChange,
  multi = true,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  multi?: boolean;
}) {
  const toggle = (tag: string) => {
    if (multi) {
      onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
    } else {
      onChange([tag]);
    }
  };
  return (
    <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <motion.div className="flex flex-wrap gap-2">
        {options.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
              selected.includes(tag)
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
            )}
          >
            {tag}
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}
