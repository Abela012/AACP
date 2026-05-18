import BusinessOnboardingWizard from '@/src/features/business-onboarding/BusinessOnboardingWizard';
import BusinessLayout from '@/src/shared/components/layouts/BusinessLayout';

type Props = {
  isInsideDashboard?: boolean;
  mode?: 'onboarding' | 'edit';
};

/** Business-owner complete profile — 8-step AI-ready onboarding wizard. */
export default function BusinessCompleteProfilePage({ isInsideDashboard = false, mode = 'onboarding' }: Props) {
  const wizard = (
    <BusinessOnboardingWizard isInsideDashboard={isInsideDashboard || mode === 'edit'} mode={mode} />
  );

  if (mode === 'edit' && !isInsideDashboard) {
    return <BusinessLayout>{wizard}</BusinessLayout>;
  }

  return wizard;
}
