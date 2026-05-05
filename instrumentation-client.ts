import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c3309793f20fd802c7ba3b48508430f7@o4508130833793024.ingest.us.sentry.io/4510869094793216",
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  _experiments: {
    enableLogs: true,
  },
});