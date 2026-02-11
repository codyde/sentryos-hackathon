'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  windowId: string
  windowTitle: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class WindowErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { windowId, windowTitle, onError } = this.props

    // Log to Sentry with window context
    Sentry.withScope((scope) => {
      scope.setTag('error_boundary', 'window')
      scope.setContext('window', {
        window_id: windowId,
        window_title: windowTitle
      })
      scope.setContext('error_info', {
        componentStack: errorInfo.componentStack
      })
      Sentry.captureException(error)
    })

    // Add breadcrumb for error timeline
    Sentry.addBreadcrumb({
      category: 'error',
      message: `Window error caught: ${windowTitle}`,
      level: 'error',
      data: {
        window_id: windowId,
        window_title: windowTitle,
        error_message: error.message
      }
    })

    this.setState({
      error,
      errorInfo
    })

    onError?.(error, errorInfo)
  }

  handleReset = () => {
    const { onReset } = this.props

    Sentry.addBreadcrumb({
      category: 'error',
      message: `Error boundary reset: ${this.props.windowTitle}`,
      level: 'info',
      data: { window_id: this.props.windowId }
    })

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })

    onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-[#1e1a2a] text-center">
          <AlertTriangle className="w-12 h-12 text-[#ff4757] mb-4" />
          <h2 className="text-lg font-semibold text-[#e8e4f0] mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-[#9086a3] mb-6 max-w-md">
            This window encountered an error and couldn't be displayed.
            You can close this window or try reloading it.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Window
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left max-w-2xl">
              <summary className="text-xs text-[#9086a3] cursor-pointer hover:text-[#e8e4f0]">
                Error Details (Dev Only)
              </summary>
              <pre className="mt-2 text-xs text-[#ff4757] bg-[#2a2438] p-3 rounded overflow-auto max-h-40">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
