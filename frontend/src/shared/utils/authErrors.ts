type ClerkErrorShape = {
  errors?: { code?: string; message?: string }[];
};

const CODE_MESSAGES: Record<string, string> = {
  form_identifier_not_found: 'No account found with this email. Please sign up first.',
  form_password_incorrect: 'Incorrect password. Please try again.',
  form_password_pwned: 'This password is not secure enough. Please choose a different one.',
  form_code_incorrect: 'That code is incorrect. Please check and try again.',
  form_param_format_invalid: 'Please check your email and password format.',
  session_exists: 'You are already signed in.',
  too_many_requests: 'Too many attempts. Please wait a moment and try again.',
  strategy_for_user_invalid: 'This sign-in method is not available for your account.',
  not_allowed_access: 'Sign-in is not available for this account.',
  oauth_access_denied: 'Sign-in was cancelled. Please try again.',
  external_account_not_found: 'No linked account found. Try email sign-in instead.',
};

export function getFriendlyAuthError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  const clerkErr = err as ClerkErrorShape;
  const code = clerkErr.errors?.[0]?.code;
  const raw = clerkErr.errors?.[0]?.message?.trim() || '';

  if (code && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code];
  }

  if (raw.includes('data breach')) {
    return 'Please choose a stronger password for your safety.';
  }

  if (/couldn'?t find your account/i.test(raw)) {
    return CODE_MESSAGES.form_identifier_not_found;
  }

  if (/clerk|oauth_|session_|strategy_|verif|factor|redirect/i.test(raw)) {
    return fallback;
  }

  if (raw.length > 100) {
    return fallback;
  }

  return raw || fallback;
}
