'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { MessageCircleOff, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  onError?: (error: Error) => void
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ChatErrorBoundary extends Component<Props, State> {
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
    // Capture with chat-specific context
    Sentry.withScope((scope) => {
      scope.setTag('error_boundary', 'chat')
      scope.setTag('feature', 'ai_assistant')
      scope.setContext('chat_error', {
        component: 'Chat',
        error_type: error.name,
        error_message: error.message
      })
      scope.setContext('error_info', {
        componentStack: errorInfo.componentStack
      })
      Sentry.captureException(error)
    })

    Sentry.addBreadcrumb({
      category: 'error',
      message: 'Chat component error',
      level: 'error',
      data: {
        error_message: error.message,
        error_type: error.name
      }
    })

    this.props.onError?.(error)
  }

  handleReset = () => {
    Sentry.addBreadcrumb({
      category: 'error',
      message: 'Chat error boundary reset',
      level: 'info'
    })

    this.setState({
      hasError: false,
      error: null
    })

    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-[#1e1a2a] text-center">
          <MessageCircleOff className="w-12 h-12 text-[#ff4757] mb-4" />
          <h2 className="text-lg font-semibold text-[#e8e4f0] mb-2">
            Chat Unavailable
          </h2>
          <p className="text-sm text-[#9086a3] mb-6 max-w-md">
            The chat assistant encountered an error. This issue has been reported.
            Try refreshing the chat or check your connection.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Restart Chat
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
