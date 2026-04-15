type OnboardingStatus = "incomplete" | "pending" | "approved";
type UserRole = "business" | "advertiser";

type OnboardingBannerProps = {
  status: OnboardingStatus;
  role: UserRole;
};

const statusMap: Record<
  OnboardingStatus,
  { title: string; description: string; className: string }
> = {
  incomplete: {
    title: "Complete your profile",
    description: "Finish onboarding to unlock all dashboard features.",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  pending: {
    title: "Profile under review",
    description: "Your profile is being reviewed. Full access unlocks after approval.",
    className: "border-blue-200 bg-blue-50 text-blue-900",
  },
  approved: {
    title: "Profile approved",
    description: "Your account is fully verified and ready to use.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
};

export default function OnboardingBanner({ status, role }: OnboardingBannerProps) {
  const config = statusMap[status];

  return (
    <section className={`mb-6 rounded-2xl border p-4 ${config.className}`}>
      <h2 className="text-sm font-semibold">
        {config.title} ({role === "business" ? "Business Owner" : "Advertiser"})
      </h2>
      <p className="mt-1 text-xs">{config.description}</p>
    </section>
  );
}
