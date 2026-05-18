import type { BusinessOnboardingForm } from './types';

export type StepValidationResult = { valid: boolean; errors: Record<string, string> };

const req = (value: string, field: string, errors: Record<string, string>) => {
  if (!value.trim()) errors[field] = 'This field is required';
};

export const validateStep = (step: number, form: BusinessOnboardingForm): StepValidationResult => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1:
      req(form.firstName, 'firstName', errors);
      req(form.lastName, 'lastName', errors);
      req(form.phone, 'phone', errors);
      req(form.businessName, 'businessName', errors);
      req(form.businessLocation, 'businessLocation', errors);
      if (!form.tradeLicenseUrl) errors.tradeLicenseUrl = 'Upload your trade license to continue';
      break;
    case 2:
      req(form.businessCategory, 'businessCategory', errors);
      break;
    case 3:
      break;
    case 4:
      if (!form.averageOrderValue.trim()) errors.averageOrderValue = 'Average order value is required';
      if (form.profitMarginPercentage < 0 || form.profitMarginPercentage > 100) {
        errors.profitMarginPercentage = 'Margin must be 0–100%';
      }
      break;
    case 5:
      if (form.audienceAgeRanges.length === 0) errors.audienceAgeRanges = 'Select at least one age range';
      if (form.audienceGender.length === 0) errors.audienceGender = 'Select audience gender';
      break;
    case 6:
      if (form.marketingGoals.length === 0) errors.marketingGoals = 'Select at least one marketing goal';
      if (form.selectedPlatforms.length === 0) errors.selectedPlatforms = 'Select at least one platform';
      break;
    case 7:
      break;
    case 8:
      return validateAll(form);
    default:
      break;
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateAll = (form: BusinessOnboardingForm): StepValidationResult => {
  const merged: Record<string, string> = {};
  for (let s = 1; s <= 7; s++) {
    const r = validateStep(s, form);
    Object.assign(merged, r.errors);
  }
  return { valid: Object.keys(merged).length === 0, errors: merged };
};
