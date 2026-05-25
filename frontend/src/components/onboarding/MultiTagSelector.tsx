import { cn } from '@/src/shared/utils/cn';

type MultiTagSelectorProps = {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  error?: string;
};

export default function MultiTagSelector({ label, options, selected, onChange, error }: MultiTagSelectorProps) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
              selected.includes(opt)
                ? 'bg-primary-blue text-black border-primary-blue'
                : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-emerald-300'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
