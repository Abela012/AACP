import type { BusinessOnboardingForm } from './types';

export type StepValidationResult = { valid: boolean; errors: Record<string, string> };

const req = (value: string, field: string, errors: Record<string, string>) => {
  if (!value || !value.toString().trim()) {
    errors[field] = 'This field is required';
  }
};

const expectString = (value: string, field: string, errors: Record<string, string>) => {
  if (value && /\d/.test(value)) {
    errors[field] = 'Numeric input is not allowed in this field';
  }
};

const expectNumber = (value: string, field: string, errors: Record<string, string>) => {
  if (value && /[a-zA-Z]/.test(value)) {
    errors[field] = 'Alphabetic characters are not allowed in this field';
  }
};

const expectPhone = (value: string, field: string, errors: Record<string, string>) => {
  const trimmed = value?.toString().trim();
  if (!trimmed) return;
  if (!/^[\d\s+\-().]+$/.test(trimmed)) {
    errors[field] = 'Enter a valid phone number (digits, spaces, +, -, or parentheses only)';
  }
};

export const validateStep = (step: number, form: BusinessOnboardingForm): StepValidationResult => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1:
      req(form.firstName, 'firstName', errors);
      expectString(form.firstName, 'firstName', errors);

      req(form.lastName, 'lastName', errors);
      expectString(form.lastName, 'lastName', errors);

      req(form.phone, 'phone', errors);
      expectPhone(form.phone, 'phone', errors);

      req(form.businessName, 'businessName', errors);
      expectString(form.businessName, 'businessName', errors);

      req(form.businessLocation, 'businessLocation', errors);
      expectString(form.businessLocation, 'businessLocation', errors);

      if (!form.tradeLicenseUrl) errors.tradeLicenseUrl = 'Upload your trade license to continue';
      break;
    case 2:
      req(form.businessCategory, 'businessCategory', errors);
      expectString(form.businessCategory, 'businessCategory', errors);
      expectNumber(form.businessAgeYears, 'businessAgeYears', errors);
      expectString(form.servicesOffered, 'servicesOffered', errors);
      break;
    case 3:
      expectNumber(form.dailyCustomerCapacity, 'dailyCustomerCapacity', errors);
      break;
    case 4:
      if (!form.averageOrderValue.trim()) errors.averageOrderValue = 'Average order value is required';
      expectNumber(form.averageOrderValue, 'averageOrderValue', errors);
      expectNumber(form.averageDailyCustomers, 'averageDailyCustomers', errors);
      expectNumber(form.averageMonthlyRevenue, 'averageMonthlyRevenue', errors);
      expectNumber(form.averageMonthlyProfit, 'averageMonthlyProfit', errors);

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
      expectNumber(String(form.monthlyBudget), 'monthlyBudget', errors);
      if (form.hasRunAdsBefore) {
        expectNumber(form.monthlyAdSpendETB, 'monthlyAdSpendETB', errors);
      }
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
