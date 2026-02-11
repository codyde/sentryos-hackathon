'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class WindowManagerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // This is critical - capture with high priority
    Sentry.withScope((scope) => {
      scope.setTag('error_boundary', 'window_manager')
      scope.setLevel('fatal')
      scope.setContext('window_manager', {
        error_type: error.name,
        error_message: error.message,
        component: 'WindowManager'
      })
      scope.setContext('error_info', {
        componentStack: errorInfo.componentStack
      })
      Sentry.captureException(error)
    })

    Sentry.addBreadcrumb({
      category: 'error',
      message: 'Critical: WindowManager error',
      level: 'fatal',
      data: {
        error_message: error.message
      }
    })
  }

  handleReload = () => {
    Sentry.addBreadcrumb({
      category: 'error',
      message: 'User reloaded after WindowManager error',
      level: 'info'
    })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 desktop-wallpaper flex items-center justify-center p-6">
          <div className="max-w-md bg-[#1e1a2a] border border-[#362552] rounded-lg p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-[#ff4757] mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-[#e8e4f0] mb-2">
              Desktop System Error
            </h1>
            <p className="text-sm text-[#9086a3] mb-6">
              The desktop window manager encountered a critical error.
              This issue has been automatically reported. Please reload the page to continue.
            </p>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-6 py-3 bg-[#7553ff] hover:bg-[#8c6fff] text-white rounded transition-colors mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Desktop
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
