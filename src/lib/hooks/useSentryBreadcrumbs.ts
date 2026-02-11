'use client'

import * as Sentry from '@sentry/nextjs'

export interface BreadcrumbData {
  [key: string]: unknown
}

export function useSentryBreadcrumbs() {
  return {
    // Window lifecycle breadcrumbs
    logWindowOpen: (windowId: string, title: string) => {
      Sentry.addBreadcrumb({
        category: 'window.lifecycle',
        message: `Window opened: ${title}`,
        level: 'info',
        data: { window_id: windowId, title, action: 'open' }
      })
    },

    logWindowClose: (windowId: string, title: string) => {
      Sentry.addBreadcrumb({
        category: 'window.lifecycle',
        message: `Window closed: ${title}`,
        level: 'info',
        data: { window_id: windowId, title, action: 'close' }
      })
    },

    logWindowMinimize: (windowId: string, title: string) => {
      Sentry.addBreadcrumb({
        category: 'window.lifecycle',
        message: `Window minimized: ${title}`,
        level: 'info',
        data: { window_id: windowId, title, action: 'minimize' }
      })
    },

    logWindowMaximize: (windowId: string, title: string, isMaximized: boolean) => {
      Sentry.addBreadcrumb({
        category: 'window.lifecycle',
        message: `Window ${isMaximized ? 'maximized' : 'restored'}: ${title}`,
        level: 'info',
        data: { window_id: windowId, title, action: isMaximized ? 'maximize' : 'restore' }
      })
    },

    logWindowFocus: (windowId: string, title: string) => {
      Sentry.addBreadcrumb({
        category: 'window.interaction',
        message: `Window focused: ${title}`,
        level: 'debug',
        data: { window_id: windowId, title, action: 'focus' }
      })
    },

    logWindowDrag: (windowId: string, title: string, x: number, y: number) => {
      Sentry.addBreadcrumb({
        category: 'window.interaction',
        message: `Window dragged: ${title}`,
        level: 'debug',
        data: { window_id: windowId, title, action: 'drag', position: { x, y } }
      })
    },

    logWindowResize: (windowId: string, title: string, width: number, height: number) => {
      Sentry.addBreadcrumb({
        category: 'window.interaction',
        message: `Window resized: ${title}`,
        level: 'debug',
        data: { window_id: windowId, title, action: 'resize', size: { width, height } }
      })
    },

    // Icon interaction breadcrumbs
    logIconSelect: (iconId: string, label: string) => {
      Sentry.addBreadcrumb({
        category: 'icon.interaction',
        message: `Icon selected: ${label}`,
        level: 'debug',
        data: { icon_id: iconId, label, action: 'select' }
      })
    },

    logIconDoubleClick: (iconId: string, label: string) => {
      Sentry.addBreadcrumb({
        category: 'icon.interaction',
        message: `Icon double-clicked: ${label}`,
        level: 'info',
        data: { icon_id: iconId, label, action: 'doubleclick' }
      })
    },

    // Chat interaction breadcrumbs
    logChatMessageSent: (messageContent: string) => {
      // Truncate long messages for privacy
      const truncated = messageContent.length > 100
        ? messageContent.substring(0, 100) + '...'
        : messageContent

      Sentry.addBreadcrumb({
        category: 'chat.interaction',
        message: 'Chat message sent',
        level: 'info',
        data: {
          message_preview: truncated,
          message_length: messageContent.length,
          action: 'send'
        }
      })
    },

    logChatMessageReceived: (tokenCount: number) => {
      Sentry.addBreadcrumb({
        category: 'chat.interaction',
        message: 'Chat message received',
        level: 'info',
        data: { token_count: tokenCount, action: 'receive' }
      })
    },

    logChatError: (error: string) => {
      Sentry.addBreadcrumb({
        category: 'chat.interaction',
        message: 'Chat error occurred',
        level: 'error',
        data: { error, action: 'error' }
      })
    },

    // Tool execution breadcrumbs
    logToolStart: (toolName: string, toolInput?: unknown) => {
      Sentry.addBreadcrumb({
        category: 'chat.tool',
        message: `Tool started: ${toolName}`,
        level: 'info',
        data: {
          tool_name: toolName,
          tool_input: toolInput,
          action: 'start',
          timestamp: Date.now()
        }
      })
    },

    logToolComplete: (toolName: string, durationMs: number) => {
      Sentry.addBreadcrumb({
        category: 'chat.tool',
        message: `Tool completed: ${toolName}`,
        level: 'info',
        data: {
          tool_name: toolName,
          duration_ms: durationMs,
          action: 'complete'
        }
      })
    },

    logToolError: (toolName: string, error: string) => {
      Sentry.addBreadcrumb({
        category: 'chat.tool',
        message: `Tool error: ${toolName}`,
        level: 'error',
        data: {
          tool_name: toolName,
          error,
          action: 'error'
        }
      })
    },

    // Desktop navigation breadcrumbs
    logDesktopClick: () => {
      Sentry.addBreadcrumb({
        category: 'desktop.interaction',
        message: 'Desktop background clicked',
        level: 'debug',
        data: { action: 'deselect_icons' }
      })
    },

    logTaskbarClick: (windowId: string, title: string, wasMinimized: boolean) => {
      Sentry.addBreadcrumb({
        category: 'taskbar.interaction',
        message: `Taskbar window ${wasMinimized ? 'restored' : 'focused'}: ${title}`,
        level: 'info',
        data: {
          window_id: windowId,
          title,
          action: wasMinimized ? 'restore' : 'focus'
        }
      })
    }
  }
}
