'use client'

import { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { WindowState } from './types'
import { useSentryMetrics, useSentryBreadcrumbs } from '@/lib/hooks'

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
  const [windowOpenTimes, setWindowOpenTimes] = useState<Record<string, number>>({})

  // Initialize observability hooks
  const metrics = useSentryMetrics()
  const breadcrumbs = useSentryBreadcrumbs()

  const openWindow = useCallback((window: Omit<WindowState, 'zIndex' | 'isFocused'>) => {
    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => {
        const existing = prev.find(w => w.id === window.id)
        if (existing) {
          if (existing.isMinimized) {
            // Window being restored from minimized state
            breadcrumbs.logWindowOpen(window.id, window.title)
            return prev.map(w =>
              w.id === window.id
                ? { ...w, isMinimized: false, isFocused: true, zIndex: newZ }
                : { ...w, isFocused: false }
            )
          }
          return prev.map(w =>
            w.id === window.id
              ? { ...w, isFocused: true, zIndex: newZ }
              : { ...w, isFocused: false }
          )
        }

        // New window being opened
        metrics.trackWindowOpen(window.id)
        breadcrumbs.logWindowOpen(window.id, window.title)
        setWindowOpenTimes(prev => ({ ...prev, [window.id]: Date.now() }))

        return [
          ...prev.map(w => ({ ...w, isFocused: false })),
          { ...window, zIndex: newZ, isFocused: true }
        ]
      })
      return newZ
    })
  }, [metrics, breadcrumbs])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id)
      if (window && windowOpenTimes[id]) {
        const lifetime = Date.now() - windowOpenTimes[id]
        metrics.trackWindowClose(window.id, lifetime)
        breadcrumbs.logWindowClose(window.id, window.title)
        setWindowOpenTimes(times => {
          const { [id]: _, ...rest } = times
          return rest
        })
      }
      return prev.filter(w => w.id !== id)
    })
  }, [windowOpenTimes, metrics, breadcrumbs])

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id)
      if (window) {
        metrics.trackWindowMinimize(window.id)
        breadcrumbs.logWindowMinimize(window.id, window.title)
      }
      return prev.map(w =>
        w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
      )
    })
  }, [metrics, breadcrumbs])

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const window = prev.find(w => w.id === id)
      if (window) {
        const willBeMaximized = !window.isMaximized
        metrics.trackWindowMaximize(window.id, willBeMaximized)
        breadcrumbs.logWindowMaximize(window.id, window.title, willBeMaximized)
      }
      return prev.map(w =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    })
  }, [metrics, breadcrumbs])

  const restoreWindow = useCallback((id: string) => {
    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => prev.map(w =>
        w.id === id
          ? { ...w, isMinimized: false, isFocused: true, zIndex: newZ }
          : { ...w, isFocused: false }
      ))
      return newZ
    })
  }, [])

  const focusWindow = useCallback((id: string) => {
    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => {
        const window = prev.find(w => w.id === id)
        if (window) {
          metrics.trackWindowFocus(window.id)
          breadcrumbs.logWindowFocus(window.id, window.title)
        }
        return prev.map(w =>
          w.id === id
            ? { ...w, isFocused: true, zIndex: newZ }
            : { ...w, isFocused: false }
        )
      })
      return newZ
    })
  }, [metrics, breadcrumbs])

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, x, y } : w
    ))
  }, [])

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, width, height } : w
    ))
  }, [])

  // Track active window count whenever windows change
  useEffect(() => {
    const activeCount = windows.filter(w => !w.isMinimized).length
    metrics.trackActiveWindowCount(activeCount)
  }, [windows, metrics])

  // Expose window state for Sentry Session Replay context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__WINDOW_MANAGER_STATE__ = {
        windows: windows.map(w => ({
          id: w.id,
          title: w.title,
          isMinimized: w.isMinimized,
          isMaximized: w.isMaximized,
          isFocused: w.isFocused,
          position: { x: w.x, y: w.y },
          size: { width: w.width, height: w.height }
        }))
      }
    }

    // Update Sentry scope with window context
    Sentry.setContext('desktop_windows', {
      count: windows.length,
      active: windows.filter(w => !w.isMinimized).length,
      windows: windows.map(w => ({
        id: w.id,
        title: w.title,
        state: w.isMinimized ? 'minimized' : w.isMaximized ? 'maximized' : 'normal'
      }))
    })
  }, [windows])

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
