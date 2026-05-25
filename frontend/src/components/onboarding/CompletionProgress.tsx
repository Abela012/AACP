import { cn } from '@/src/shared/utils/cn';
import type { CompletionReport } from '@/src/features/business-onboarding/completion';
import { ONBOARDING_STEPS } from '@/src/features/business-onboarding/constants';

type CompletionProgressProps = {
  step: number;
  completion: CompletionReport;
  onStepClick?: (step: number) => void;
};

const stepSectionKey: Record<number, string> = {
  1: 'basic',
  2: 'businessProfile',
  3: 'capacity',
  4: 'financial',
  5: 'audience',
  6: 'marketing',
  7: 'analytics',
};

export default function CompletionProgress({ step, completion, onStepClick }: CompletionProgressProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Profile completion</p>
          <p className="text-2xl font-black text-primary-blue">{completion.percent}%</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold text-gray-700 dark:text-gray-300">
            AI readiness: <span className="text-primary-blue">{completion.aiReadiness}</span>
          </p>
          <p className="font-bold text-gray-700 dark:text-gray-300 mt-0.5">
            Data quality: <span className="text-primary-blue">{completion.dataQuality}</span>
          </p>
        </div>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-blue rounded-full transition-all duration-500"
          style={{ width: `${completion.percent}%` }}
        />
      </div>
      <div className="hidden md:grid grid-cols-4 gap-2">
        {ONBOARDING_STEPS.map((s) => {
          const sectionKey = stepSectionKey[s.id];
          const done = sectionKey ? completion.sections[sectionKey] : completion.percent >= 85;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStepClick?.(s.id)}
              className={cn(
                'text-left p-2 rounded-xl border text-[10px] font-bold transition-all',
                step === s.id
                  ? 'border-primary-blue bg-neutral-border/15 dark:bg-primary-blue/10 text-primary-blue'
                  : done
                    ? 'border-gray-200 dark:border-white/10 text-gray-600'
                    : 'border-gray-100 dark:border-white/5 text-gray-400'
              )}
            >
              {s.id}. {s.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
