/**
 * Feature flags for modules that are designed but not built yet (see docs/FEATURE_ARCHITECTURE.md).
 * Everything here is OFF: no route, menu entry or table exists until a module is implemented and its flag is switched on.
 */
export const FEATURES = {
  savingsGoals: false,
  subscriptions: false,
  financialCalendar: false,
  smartInsights: false,
  receiptOcr: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
export const isEnabled = (k: FeatureKey): boolean => FEATURES[k];

/**
 * "Forgot password" needs an email sender (custom SMTP in Supabase). Off until one is set up; turn on with
 * VITE_PASSWORD_RESET=on (Netlify environment variable or .env). The reset screen itself always works for links already sent.
 */
export const passwordResetEnabled = import.meta.env.VITE_PASSWORD_RESET === 'on';
