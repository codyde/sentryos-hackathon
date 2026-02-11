'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect, useRef } from 'react'

export interface MetricsOptions {
  tags?: Record<string, string>
  unit?: string
}

export function useSentryMetrics() {
  // Track session start time for duration calculations
  const sessionStartRef = useRef<Date>(new Date())

  // Initialize session metrics on mount
  useEffect(() => {
    Sentry.metrics.increment('desktop.session.start', 1, {
      tags: { timestamp: new Date().toISOString() }
    })

    return () => {
      // Track session duration on unmount
      const durationMs = Date.now() - sessionStartRef.current.getTime()
      Sentry.metrics.distribution('desktop.session.duration', durationMs, {
        unit: 'millisecond',
        tags: { session_end: new Date().toISOString() }
      })
    }
  }, [])

  return {
    // Track window operations
    trackWindowOpen: (appType: string) => {
      Sentry.metrics.increment('desktop.window.open', 1, {
        tags: { app_type: appType }
      })
    },

    trackWindowClose: (appType: string, durationMs: number) => {
      Sentry.metrics.increment('desktop.window.close', 1, {
        tags: { app_type: appType }
      })
      Sentry.metrics.distribution('desktop.window.lifetime', durationMs, {
        unit: 'millisecond',
        tags: { app_type: appType }
      })
    },

    trackWindowMinimize: (appType: string) => {
      Sentry.metrics.increment('desktop.window.minimize', 1, {
        tags: { app_type: appType }
      })
    },

    trackWindowMaximize: (appType: string, isMaximized: boolean) => {
      Sentry.metrics.increment('desktop.window.maximize', 1, {
        tags: { app_type: appType, action: isMaximized ? 'maximize' : 'restore' }
      })
    },

    // Track active window count
    trackActiveWindowCount: (count: number) => {
      Sentry.metrics.gauge('desktop.windows.active', count)
    },

    // Track chat interactions
    trackChatMessageSent: () => {
      Sentry.metrics.increment('chat.message.sent', 1)
    },

    trackChatMessageReceived: (tokenCount?: number) => {
      Sentry.metrics.increment('chat.message.received', 1)
      if (tokenCount) {
        Sentry.metrics.distribution('chat.message.tokens', tokenCount, {
          unit: 'none'
        })
      }
    },

    // Track tool executions
    trackToolExecution: (toolName: string, durationMs: number, success: boolean) => {
      Sentry.metrics.increment('chat.tool.execution', 1, {
        tags: { tool_name: toolName, success: success.toString() }
      })
      Sentry.metrics.distribution('chat.tool.duration', durationMs, {
        unit: 'millisecond',
        tags: { tool_name: toolName }
      })
    },

    // Track icon interactions
    trackIconClick: (iconId: string) => {
      Sentry.metrics.increment('desktop.icon.click', 1, {
        tags: { icon_id: iconId }
      })
    },

    trackIconDoubleClick: (iconId: string) => {
      Sentry.metrics.increment('desktop.icon.doubleclick', 1, {
        tags: { icon_id: iconId }
      })
    },

    // Track window interactions
    trackWindowDrag: (appType: string) => {
      Sentry.metrics.increment('desktop.window.drag', 1, {
        tags: { app_type: appType }
      })
    },

    trackWindowResize: (appType: string) => {
      Sentry.metrics.increment('desktop.window.resize', 1, {
        tags: { app_type: appType }
      })
    },

    trackWindowFocus: (appType: string) => {
      Sentry.metrics.increment('desktop.window.focus', 1, {
        tags: { app_type: appType }
      })
    }
  }
}
