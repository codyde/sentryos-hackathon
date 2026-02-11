'use client'

import { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react'
import { WindowState } from './types'
import * as Sentry from '@sentry/nextjs'
import {
  logWindowEvent,
  addWindowBreadcrumb,
  incrementCounter,
  setGauge,
  METRICS
} from '@/lib/sentry-utils'

interface WindowManagerContextType {
  windows: WindowState[]
  openWindow: (window: Omit<WindowState, 'zIndex' | 'isFocused'>) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void
  topZIndex: number
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null)

export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider')
  }
  return context
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [topZIndex, setTopZIndex] = useState(100)

  // Initialize window count gauge
  useEffect(() => {
    setGauge(METRICS.WINDOW.COUNT, windows.length)
  }, [windows.length])

  const openWindow = useCallback((window: Omit<WindowState, 'zIndex' | 'isFocused'>) => {
    const startTime = performance.now()

    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => {
        const existing = prev.find(w => w.id === window.id)

        if (existing) {
          if (existing.isMinimized) {
            // Log restore from minimized
            logWindowEvent('restore_from_minimized', window.id, window.title, {
              was_minimized: true
            })
            addWindowBreadcrumb('restore', window.id, window.title)
            incrementCounter(METRICS.WINDOW.RESTORE, {
              window_type: window.id.split('-')[0]
            })

            return prev.map(w =>
              w.id === window.id
                ? { ...w, isMinimized: false, isFocused: true, zIndex: newZ }
                : { ...w, isFocused: false }
            )
          }

          // Log refocus
          logWindowEvent('focus', window.id, window.title, {
            already_open: true
          })
          addWindowBreadcrumb('focus', window.id, window.title)
          incrementCounter(METRICS.WINDOW.FOCUS, {
            window_type: window.id.split('-')[0]
          })

          return prev.map(w =>
            w.id === window.id
              ? { ...w, isFocused: true, zIndex: newZ }
              : { ...w, isFocused: false }
          )
        }

        // New window opening
        const openDuration = performance.now() - startTime

        logWindowEvent('open', window.id, window.title, {
          position: { x: window.x, y: window.y },
          size: { width: window.width, height: window.height },
          open_duration_ms: openDuration
        })

        addWindowBreadcrumb('open', window.id, window.title)

        incrementCounter(METRICS.WINDOW.OPEN, {
          window_type: window.id.split('-')[0]
        })

        // Update window count gauge
        const newWindowCount = prev.length + 1
        setGauge(METRICS.WINDOW.COUNT, newWindowCount)

        Sentry.setContext('window_manager', {
          total_windows: newWindowCount,
          active_window: window.id,
          z_index: newZ
        })

        return [
          ...prev.map(w => ({ ...w, isFocused: false })),
          { ...window, zIndex: newZ, isFocused: true }
        ]
      })
      return newZ
    })
  }, [])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const closingWindow = prev.find(w => w.id === id)
      if (!closingWindow) return prev

      logWindowEvent('close', id, closingWindow.title)
      addWindowBreadcrumb('close', id, closingWindow.title)

      incrementCounter(METRICS.WINDOW.CLOSE, {
        window_type: id.split('-')[0]
      })

      const newWindowCount = prev.length - 1
      setGauge(METRICS.WINDOW.COUNT, newWindowCount)

      Sentry.setContext('window_manager', {
        total_windows: newWindowCount,
        last_closed: id
      })

      return prev.filter(w => w.id !== id)
    })
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id)
      if (!window) return prev

      logWindowEvent('minimize', id, window.title)
      addWindowBreadcrumb('minimize', id, window.title)

      incrementCounter(METRICS.WINDOW.MINIMIZE, {
        window_type: id.split('-')[0]
      })

      return prev.map(w =>
        w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
      )
    })
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id)
      if (!window) return prev

      const action = window.isMaximized ? 'restore' : 'maximize'

      logWindowEvent(action, id, window.title, {
        new_state: !window.isMaximized ? 'maximized' : 'normal'
      })
      addWindowBreadcrumb(action, id, window.title)

      incrementCounter(METRICS.WINDOW.MAXIMIZE, {
        window_type: id.split('-')[0],
        action
      })

      return prev.map(w =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    })
  }, [])

  const restoreWindow = useCallback((id: string) => {
    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => {
        const window = prev.find(w => w.id === id)
        if (!window) return prev

        logWindowEvent('restore', id, window.title, {
          from_minimized: window.isMinimized
        })
        addWindowBreadcrumb('restore', id, window.title)

        incrementCounter(METRICS.WINDOW.RESTORE, {
          window_type: id.split('-')[0]
        })

        return prev.map(w =>
          w.id === id
            ? { ...w, isMinimized: false, isFocused: true, zIndex: newZ }
            : { ...w, isFocused: false }
        )
      })
      return newZ
    })
  }, [])

  const focusWindow = useCallback((id: string) => {
    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => {
        const window = prev.find(w => w.id === id)
        if (!window) return prev

        // Only log if window wasn't already focused (to avoid spam)
        if (!window.isFocused) {
          logWindowEvent('focus', id, window.title)
          addWindowBreadcrumb('focus', id, window.title)

          incrementCounter(METRICS.WINDOW.FOCUS, {
            window_type: id.split('-')[0]
          })
        }

        return prev.map(w =>
          w.id === id
            ? { ...w, isFocused: true, zIndex: newZ }
            : { ...w, isFocused: false }
        )
      })
      return newZ
    })
  }, [])

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id)
      if (!window) return prev

      // Use debug level for position updates (can be noisy)
      Sentry.logger.debug('Window position updated', {
        window_id: id,
        window_title: window.title,
        new_position: { x, y }
      })

      return prev.map(w =>
        w.id === id ? { ...w, x, y } : w
      )
    })
  }, [])

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id)
      if (!window) return prev

      // Use debug level for size updates (can be noisy)
      Sentry.logger.debug('Window size updated', {
        window_id: id,
        window_title: window.title,
        new_size: { width, height }
      })

      return prev.map(w =>
        w.id === id ? { ...w, width, height } : w
      )
    })
  }, [])

  return (
    <WindowManagerContext.Provider value={{
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      topZIndex
    }}>
      {children}
    </WindowManagerContext.Provider>
  )
}
