import type { ReactNode } from 'react';

type SectionCardProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SectionCard({ icon, title, description, children }: SectionCardProps) {
  return (
    <section className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-3 mb-6">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-blue/10 text-primary-blue flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
