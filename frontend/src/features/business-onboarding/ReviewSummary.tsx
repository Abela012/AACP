import type { BusinessOnboardingForm } from './types';
import { formatBirr } from './constants';

type Props = {
  form: BusinessOnboardingForm;
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
    <span className="text-xs text-gray-500 shrink-0">{label}</span>
    <span className="text-xs font-bold text-right text-gray-900 dark:text-white">{value}</span>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
    <p className="text-[10px] font-black uppercase tracking-widest text-primary-blue mb-3">{title}</p>
    <div className="space-y-0">{children}</div>
  </div>
);

const display = (v: string | number | undefined | null, fallback = '—') => {
  if (v == null || (typeof v === 'string' && !v.trim())) return fallback;
  return String(v);
};

const list = (arr: string[]) => (arr.length ? arr.join(', ') : '—');

export default function ReviewSummary({ form }: Props) {
  return (
    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
      <Section title="Basic info">
        <Row label="Name" value={`${form.firstName} ${form.lastName}`.trim() || '—'} />
        <Row label="Phone" value={display(form.phone)} />
        <Row label="Business" value={display(form.businessName)} />
        <Row label="Location" value={display(form.businessLocation)} />
        <Row label="Trade license" value={form.tradeLicenseUrl ? 'Uploaded' : '—'} />
      </Section>

      <Section title="Business profile">
        <Row label="Category" value={display(form.businessCategory)} />
        <Row label="Tags" value={list(form.businessTags)} />
        <Row label="Price range" value={display(form.priceRange)} />
        <Row label="Years in business" value={display(form.businessAgeYears)} />
        <Row label="Opening hours" value={display(form.openingHours)} />
        <Row label="Description" value={display(form.brandDescription)} />
        <Row label="Services" value={display(form.servicesOffered)} />
        <Row label="Website" value={display(form.websiteUrl)} />
      </Section>

      <Section title="Capacity">
        <Row label="Daily customers" value={display(form.dailyCustomerCapacity)} />
        <Row label="Company size" value={display(form.companySize)} />
      </Section>

      <Section title="Financials (private)">
        <Row label="Avg. order" value={form.averageOrderValue ? `${form.averageOrderValue} ETB` : '—'} />
        <Row label="Profit margin" value={`${form.profitMarginPercentage}%`} />
        <Row label="Daily customers" value={display(form.averageDailyCustomers)} />
        <Row label="Monthly revenue" value={form.averageMonthlyRevenue ? `${form.averageMonthlyRevenue} ETB` : '—'} />
        <Row label="Monthly profit" value={form.averageMonthlyProfit ? `${form.averageMonthlyProfit} ETB` : '—'} />
      </Section>

      <Section title="Target audience">
        <Row label="Gender" value={list(form.audienceGender)} />
        <Row label="Age ranges" value={list(form.audienceAgeRanges)} />
        <Row label="Locations" value={list(form.audienceLocations)} />
        <Row label="Interests" value={list(form.audienceInterests)} />
        <Row label="Income" value={display(form.incomeLevel)} />
      </Section>

      <Section title="Marketing">
        <Row label="Goals" value={list(form.marketingGoals)} />
        <Row label="KPIs" value={list(form.primaryKpis)} />
        <Row label="Platforms" value={list(form.selectedPlatforms)} />
        <Row label="Monthly budget" value={formatBirr(form.monthlyBudget)} />
        <Row label="Ran ads before" value={form.hasRunAdsBefore ? 'Yes' : 'No'} />
      </Section>

      <Section title="Customer analytics">
        <Row label="Repeat rate" value={`${form.repeatCustomerRate}%`} />
        <Row label="Peak hours" value={list(form.peakHours)} />
        <Row label="Segments" value={list(form.topCustomerSegments)} />
        <Row label="Seasonal notes" value={display(form.seasonalNotes)} />
      </Section>
    </div>
  );
}
