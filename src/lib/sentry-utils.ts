import * as Sentry from '@sentry/nextjs'

// Metric name constants (following kebab-case convention)
export const METRICS = {
  WINDOW: {
    OPEN: 'window.open',
    CLOSE: 'window.close',
    MINIMIZE: 'window.minimize',
    MAXIMIZE: 'window.maximize',
    RESTORE: 'window.restore',
    FOCUS: 'window.focus',
    COUNT: 'window.count',
    LIFECYCLE_DURATION: 'window.lifecycle.duration'
  },
  CHAT: {
    MESSAGE_SENT: 'chat.message.sent',
    RESPONSE_RECEIVED: 'chat.response.received',
    TOOL_EXECUTION: 'chat.tool.execution',
    API_DURATION: 'chat.api.duration',
    STREAM_DURATION: 'chat.stream.duration',
    ACTIVE_SESSIONS: 'chat.active_sessions'
  },
  DESKTOP: {
    ICON_CLICK: 'desktop.icon.click',
    APP_LAUNCH: 'desktop.app.launch'
  }
} as const

// Log level helpers
export const logWindowEvent = (
  action: string,
  windowId: string,
  windowTitle: string,
  additionalData?: Record<string, unknown>
) => {
  Sentry.logger.info('Window lifecycle event', {
    action,
    window_id: windowId,
    window_title: windowTitle,
    ...additionalData
  })
}

export const logChatEvent = (
  action: string,
  messageId: string,
  additionalData?: Record<string, unknown>
) => {
  Sentry.logger.info('Chat interaction', {
    action,
    message_id: messageId,
    ...additionalData
  })
}

export const logToolExecution = (
  toolName: string,
  status: 'start' | 'complete' | 'error',
  elapsedTime?: number,
  error?: unknown
) => {
  const level = status === 'error' ? 'error' : 'debug'
  Sentry.logger[level]('Tool execution', {
    tool_name: toolName,
    status,
    elapsed_time: elapsedTime,
    ...(error && { error: String(error) })
  })
}

export const logAPIEvent = (
  endpoint: string,
  event: string,
  additionalData?: Record<string, unknown>
) => {
  Sentry.logger.debug('API event', {
    endpoint,
    event,
    ...additionalData
  })
}

// Breadcrumb helpers
export const addWindowBreadcrumb = (
  action: string,
  windowId: string,
  windowTitle: string
) => {
  Sentry.addBreadcrumb({
    category: 'window',
    message: `${action} window: ${windowTitle}`,
    level: 'info',
    data: {
      window_id: windowId,
      window_title: windowTitle,
      action
    }
  })
}

export const addChatBreadcrumb = (
  action: string,
  messageContent?: string
) => {
  Sentry.addBreadcrumb({
    category: 'chat',
    message: `Chat ${action}`,
    level: 'info',
    data: {
      action,
      message_preview: messageContent?.substring(0, 50)
    }
  })
}

export const addDesktopBreadcrumb = (
  action: string,
  iconId: string
) => {
  Sentry.addBreadcrumb({
    category: 'desktop',
    message: `Desktop ${action}: ${iconId}`,
    level: 'info',
    data: {
      action,
      icon_id: iconId
    }
  })
}

// Metric helpers
export const incrementCounter = (
  metric: string,
  tags?: Record<string, string>
) => {
  Sentry.metrics.increment(metric, 1, { tags })
}

export const recordDistribution = (
  metric: string,
  value: number,
  unit: 'millisecond' | 'second' = 'millisecond',
  tags?: Record<string, string>
) => {
  Sentry.metrics.distribution(metric, value, { unit, tags })
}

export const setGauge = (
  metric: string,
  value: number,
  tags?: Record<string, string>
) => {
  Sentry.metrics.gauge(metric, value, { tags })
}

// Timing helper
export class Timer {
  private startTime: number

  constructor() {
    this.startTime = performance.now()
  }

  elapsed(): number {
    return performance.now() - this.startTime
  }

  stop(): number {
    return this.elapsed()
  }
}
