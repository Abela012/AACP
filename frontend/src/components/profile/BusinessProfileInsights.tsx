import { Building2, Users, Wallet, Megaphone, Sparkles } from 'lucide-react';
import { useProfile } from '@/src/shared/context/ProfileContext';
import { formatBirr } from '@/src/features/business-onboarding/constants';

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary-blue/10 text-primary-blue flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function BusinessProfileInsights() {
  const { profile } = useProfile();
  const p = profile as any;
  const bp = (p.businessProfile || {}) as Record<string, unknown>;
  const cap = (p.capacity || {}) as Record<string, unknown>;
  const fd = (p.financialData || {}) as Record<string, unknown>;
  const ta = (p.targetAudience || {}) as Record<string, unknown>;
  const pc = (p.profileCompletion || {}) as Record<string, unknown>;
  const goals = (p.marketingGoals || p.promotionGoals || []) as string[];
  const ca = (p.customerAnalytics || {}) as Record<string, unknown>;

  const avgOrder = fd.averageOrderValue ?? p.avgOrderValueETB;
  const monthlyBudget = p.monthlyBudget as number | undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <Card title="AI readiness" icon={<Sparkles size={18} />}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500">Completion</p>
            <p className="text-2xl font-black text-primary-blue">{Number(pc.percent) || 0}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500">AI readiness</p>
            <p className="text-lg font-bold">{String(pc.aiReadiness || '—')}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500">Data quality</p>
            <p className="text-lg font-bold">{String(pc.dataQuality || '—')}</p>
          </div>
        </div>
      </Card>

      <Card title="Business overview" icon={<Building2 size={18} />}>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Category</dt>
            <dd className="font-bold">{String(bp.businessCategory || p.industry || '—')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Price range</dt>
            <dd className="font-bold">{String(bp.priceRange || '—')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Opening hours</dt>
            <dd className="font-bold text-right">{String(bp.openingHours || '—')}</dd>
          </div>
        </dl>
        {(bp.businessTags as string[] | undefined)?.length ? (
          <div className="flex flex-wrap gap-1.5 pt-3">
            {(bp.businessTags as string[]).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </Card>

      <Card title="Financial snapshot" icon={<Wallet size={18} />}>
        <p className="text-xs text-gray-500 mb-3">Private — used for AI predictions only.</p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Avg. order value</dt>
            <dd className="font-bold">{avgOrder != null ? `${avgOrder} ETB` : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Profit margin</dt>
            <dd className="font-bold">{fd.profitMarginPercentage != null ? `${fd.profitMarginPercentage}%` : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Monthly revenue</dt>
            <dd className="font-bold">
              {fd.averageMonthlyRevenue != null ? `${fd.averageMonthlyRevenue} ETB` : '—'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Marketing budget</dt>
            <dd className="font-bold">{monthlyBudget != null ? formatBirr(monthlyBudget) : '—'}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Audience summary" icon={<Users size={18} />}>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {((ta.gender as string[]) || []).map((g) => (
            <span key={g} className="px-2 py-0.5 rounded-full bg-primary-blue/10 text-xs font-bold">
              {g}
            </span>
          ))}
          {((ta.ageRange as string[]) || (p.targetAudienceAgeRanges as string[]) || []).map((a) => (
            <span key={a} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold">
              {a}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Income: <span className="font-bold">{String(ta.incomeLevel || '—')}</span>
        </p>
      </Card>

      <Card title="Capacity" icon={<Building2 size={18} />}>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Seating</dt>
            <dd className="font-bold">{cap.seatingCapacity != null ? String(cap.seatingCapacity) : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Daily customers</dt>
            <dd className="font-bold">
              {cap.dailyCustomerCapacity != null ? String(cap.dailyCustomerCapacity) : '—'}
            </dd>
          </div>
        </dl>
      </Card>

      <Card title="Marketing & analytics" icon={<Megaphone size={18} />}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {goals.length ? (
            goals.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-primary-blue/10 text-xs font-bold">
                {g}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Repeat customers:{' '}
          <span className="font-bold">{ca.repeatCustomerRate != null ? `${ca.repeatCustomerRate}%` : '—'}</span>
        </p>
      </Card>
    </div>
  );
}
