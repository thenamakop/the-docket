// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// The default Node transport is known to silently drop server-side events
// under Next.js 16 + Turbopack (documented open issue). This fetch-based
// transport is the recommended workaround.
function makeFetchTransport(
  options: Parameters<typeof Sentry.makeNodeTransport>[0]
) {
  return Sentry.createTransport(options, async (request) => {
    const response = await fetch(options.url, {
      method: 'POST',
      body: request.body as BodyInit,
      headers: options.headers as Record<string, string>,
    });
    return {
      statusCode: response.status,
      headers: {
        'x-sentry-rate-limits': response.headers.get('x-sentry-rate-limits'),
        'retry-after': response.headers.get('retry-after'),
      },
    };
  });
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  transport: makeFetchTransport,

  // 100% in dev so every error surfaces immediately; 10% in production.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Admin login email is mildly sensitive — do not send PII to Sentry.
  sendDefaultPii: false,

  enableLogs: true,
});
