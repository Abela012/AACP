import BusinessOnboardingWizard from '@/src/features/business-onboarding/BusinessOnboardingWizard';

type Props = {
  isInsideDashboard?: boolean;
};

/** Business-owner complete profile — 8-step AI-ready onboarding wizard. */
export default function BusinessCompleteProfilePage({ isInsideDashboard = false }: Props) {
  return <BusinessOnboardingWizard isInsideDashboard={isInsideDashboard} />;
}
