/**
 * Parsed, typed environment config. Keep all VITE_* reads in one place so
 * the rest of the app never touches import.meta.env.
 */
export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, ''),
  publicSiteUrl: (import.meta.env.VITE_PUBLIC_SITE_URL ?? '').replace(/\/$/, ''),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
