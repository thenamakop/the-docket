// This file configures the initialization of Sentry for edge features
// (middleware/proxy, edge routes, and so on).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 100% in dev so every error surfaces immediately; 10% in production.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Admin login email is mildly sensitive — do not send PII to Sentry.
  sendDefaultPii: false,

  enableLogs: true,
});
