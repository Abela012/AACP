import { flattenBusinessProfileForAdmin } from '@/src/utils/flattenBusinessProfileForAdmin';
import AdminTradeLicensePreview from '@/src/components/admin/AdminTradeLicensePreview';

type Props = {
  profileData: Record<string, unknown> | null | undefined;
  tradeLicenseUrl?: string | null;
  hasPendingChanges?: boolean;
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
    <span className="text-[10px] font-black text-[#9A9FA5] uppercase tracking-widest shrink-0">{label}</span>
    <span className="text-xs font-bold text-right text-[#1A1D1F] dark:text-white max-w-[60%]">{value}</span>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-5 rounded-2xl bg-[#F8F8FD] dark:bg-white/5 border border-[#EFEFEF] dark:border-white/10">
    <p className="text-[10px] font-black uppercase tracking-widest text-primary-blue mb-3">{title}</p>
    <div>{children}</div>
  </div>
);

const display = (v: unknown, fallback = '—') => {
  if (v == null) return fallback;
  if (typeof v === 'string' && !v.trim()) return fallback;
  if (Array.isArray(v)) return v.length ? v.join(', ') : fallback;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
};

const formatBirr = (n: unknown) => {
  const num = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(num)) return '—';
  return `${num.toLocaleString()} ETB`;
};

export default function AdminBusinessProfileReview({
  profileData,
  tradeLicenseUrl,
  hasPendingChanges,
}: Props) {
  const flat = flattenBusinessProfileForAdmin(profileData);
  const license = tradeLicenseUrl || (flat.tradeLicenseUrl as string | undefined);
  const completion = flat.profileCompletion as { percent?: number; aiReadiness?: string } | undefined;

  return (
    <div className="space-y-8">
      {hasPendingChanges && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Includes pending changes awaiting your approval. Approve to publish this data to the user&apos;s live profile.
          </p>
        </div>
      )}

      {completion?.percent != null && (
        <div className="flex flex-wrap gap-4">
          <span className="px-4 py-2 bg-neutral-border/15 dark:bg-primary-blue/10 text-primary-blue rounded-xl text-xs font-bold">
            Profile completion: {completion.percent}%
          </span>
          {completion.aiReadiness && (
            <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl text-xs font-bold">
              AI readiness: {completion.aiReadiness}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Basic info">
          <Row label="Business name" value={display(flat.businessName)} />
          <Row label="Phone" value={display(flat.phone)} />
          <Row label="Location" value={display(flat.businessLocation)} />
          <Row label="Company size" value={display(flat.companySize)} />
        </Section>

        <Section title="Business profile">
          <Row label="Category" value={display(flat.businessCategory)} />
          <Row label="Tags" value={display(flat.businessTags)} />
          <Row label="Price range" value={display(flat.priceRange)} />
          <Row label="Years in business" value={display(flat.businessAgeYears)} />
          <Row label="Opening hours" value={display(flat.openingHours)} />
          <Row label="Description" value={display(flat.bio)} />
          <Row label="Services" value={display(flat.servicesOffered)} />
          <Row label="Website" value={display(flat.website)} />
        </Section>

        <Section title="Capacity">
          <Row label="Daily customer capacity" value={display(flat.dailyCustomerCapacity)} />
        </Section>

        <Section title="Financials">
          <Row label="Avg. order" value={flat.averageOrderValue != null ? formatBirr(flat.averageOrderValue) : '—'} />
          <Row label="Profit margin" value={flat.profitMarginPercentage != null ? `${flat.profitMarginPercentage}%` : '—'} />
          <Row label="Avg. daily customers" value={display(flat.averageDailyCustomers)} />
          <Row label="Monthly revenue" value={flat.averageMonthlyRevenue != null ? formatBirr(flat.averageMonthlyRevenue) : '—'} />
          <Row label="Monthly profit" value={flat.averageMonthlyProfit != null ? formatBirr(flat.averageMonthlyProfit) : '—'} />
        </Section>

        <Section title="Target audience">
          <Row label="Gender" value={display(flat.audienceGender)} />
          <Row label="Age ranges" value={display(flat.audienceAgeRanges)} />
          <Row label="Locations" value={display(flat.audienceLocations)} />
          <Row label="Interests" value={display(flat.audienceInterests)} />
          <Row label="Income level" value={display(flat.incomeLevel)} />
        </Section>

        <Section title="Marketing">
          <Row label="Goals" value={display(flat.marketingGoals)} />
          <Row label="KPIs" value={display(flat.primaryKpis)} />
          <Row label="Platforms" value={display(flat.selectedPlatforms)} />
          <Row label="Monthly budget" value={formatBirr(flat.monthlyBudget)} />
          <Row label="Ran ads before" value={display(flat.hasRunAdsBefore)} />
          <Row label="Past platforms" value={display(flat.pastPlatforms)} />
          <Row label="Ad spend notes" value={display(flat.marketingHistoryNotes)} />
          <Row label="Monthly ad spend" value={flat.monthlyAdSpendETB != null ? formatBirr(flat.monthlyAdSpendETB) : '—'} />
          <Row label="Promotion types" value={display(flat.preferredPromotionTypes)} />
          <Row label="Promoter types" value={display(flat.preferredPromoterTypes)} />
          <Row label="Promoters needed" value={display(flat.promotersNeededCount)} />
        </Section>

        <Section title="Customer analytics">
          <Row label="Repeat rate" value={flat.repeatCustomerRate != null ? `${flat.repeatCustomerRate}%` : '—'} />
          <Row label="Peak hours" value={display(flat.peakHours)} />
          <Row label="Top segments" value={display(flat.topCustomerSegments)} />
          <Row label="Seasonal notes" value={display(flat.seasonalNotes)} />
        </Section>
      </div>

      <div className="p-6 rounded-[2rem] border border-[#EFEFEF] dark:border-white/10 bg-white dark:bg-[#111111]">
        <h4 className="font-extrabold text-lg mb-4">Trade license</h4>
        <AdminTradeLicensePreview url={license} />
      </div>
    </div>
  );
}
