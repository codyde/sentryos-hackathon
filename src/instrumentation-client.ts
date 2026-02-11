// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://608254685e9be6a005544c381bdeacdd@o4510869377187840.ingest.us.sentry.io/4510869378105344",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Privacy settings for chat conversations
      mask: ['.chat-message-content', '[data-sensitive]'],
      block: ['.chat-input-area'],

      // Capture canvas for better window rendering
      recordCanvas: true,

      // Network details for debugging chat API calls
      networkDetailAllowUrls: ['/api/chat'],
      networkCaptureBodies: true,
      networkRequestHeaders: ['Content-Type'],
      networkResponseHeaders: ['Content-Type'],

      // Capture console logs for debugging
      consoleLogAllowUrls: ['/api/chat']
    })
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Add custom context about desktop state before sending
  beforeSend(event) {
    // Add context about active windows
    if (typeof window !== 'undefined') {
      const windowManager = (window as any).__WINDOW_MANAGER_STATE__
      if (windowManager) {
        event.contexts = event.contexts || {}
        event.contexts.desktop = {
          active_windows: windowManager.windows?.length || 0,
          focused_window: windowManager.windows?.find((w: any) => w.isFocused)?.id
        }
      }
    }
    return event
  }
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
