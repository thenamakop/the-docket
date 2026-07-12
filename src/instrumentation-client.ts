// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text content and all input values in session replays.
      // This is the default; stated explicitly here so the intent is clear.
      maskAllText: true,
      blockAllMedia: false,

      // Specifically ensures password inputs are never captured in replays.
      // input[type="password"] is masked by default, but this documents it.
      mask: ['input[type="password"]'],
    }),
  ],

  // 100% in dev so every error surfaces immediately; 10% in production.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Low session replay rate — this is a low-traffic personal site.
  replaysSessionSampleRate: 0.1,

  // Capture a replay on every error.
  replaysOnErrorSampleRate: 1.0,

  // Admin login email is mildly sensitive — do not send PII to Sentry.
  sendDefaultPii: false,

  enableLogs: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
