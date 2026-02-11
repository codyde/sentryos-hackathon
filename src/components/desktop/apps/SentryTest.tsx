'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import * as Sentry from '@sentry/nextjs'

export function SentryTest() {
  const handleClientError = () => {
    const errorId = crypto.randomUUID()

    Sentry.logger.warning('About to trigger client error', {
      error_id: errorId
    })

    Sentry.addBreadcrumb({
      category: 'test',
      message: 'User triggered client error test',
      level: 'warning',
      data: {
        error_id: errorId,
        button: 'client_error'
      }
    })

    Sentry.metrics.increment('sentry_test.client_errors', 1, {
      tags: { error_id: errorId }
    })

    try {
      throw new Error('Test Client-Side Error from SentryOS!')
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test_error: 'true',
          error_type: 'client',
          error_id: errorId
        },
        contexts: {
          test_context: {
            intentional: true,
            triggered_from: 'sentry_test_app',
            error_id: errorId
          }
        }
      })

      Sentry.logger.error('Client error captured', {
        error_id: errorId,
        error_message: error instanceof Error ? error.message : String(error)
      })

      throw error
    }
  }

  const handleServerError = async () => {
    const requestId = crypto.randomUUID()

    Sentry.logger.info('Triggering server error test', {
      request_id: requestId
    })

    Sentry.addBreadcrumb({
      category: 'test',
      message: 'User triggered server error test',
      level: 'info',
      data: {
        request_id: requestId,
        button: 'server_error'
      }
    })

    Sentry.metrics.increment('sentry_test.server_error_requests', 1, {
      tags: { request_id: requestId }
    })

    try {
      const response = await fetch('/api/sentry-test')
      const data = await response.json()

      Sentry.logger.info('Server error test completed', {
        request_id: requestId,
        response_data: data
      })

      console.log(data)
    } catch (error) {
      Sentry.logger.error('Server error test failed', {
        request_id: requestId,
        error: String(error)
      })

      console.error('Server error test failed:', error)
    }
  }

  const handleCustomEvent = () => {
    const eventId = crypto.randomUUID()

    Sentry.logger.info('Sending custom event', {
      event_id: eventId
    })

    Sentry.addBreadcrumb({
      category: 'test',
      message: 'User sent custom event',
      level: 'info',
      data: {
        event_id: eventId,
        button: 'custom_event'
      }
    })

    Sentry.captureMessage('Custom event from SentryOS!', {
      level: 'info',
      tags: {
        custom_event: 'true',
        event_id: eventId
      },
      contexts: {
        custom_context: {
          event_type: 'user_triggered',
          source: 'sentry_test_app',
          event_id: eventId
        }
      }
    })

    Sentry.metrics.increment('sentry_test.custom_events', 1, {
      tags: { event_id: eventId }
    })

    alert('Custom event sent to Sentry! Check your Sentry dashboard.')
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0c14] text-white p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4 text-[#7553ff]">Sentry Integration Test</h1>

      <Card className="bg-[#1a1525] border-[#2d2640] p-6 mb-4">
        <h2 className="text-lg font-semibold mb-3 text-[#7553ff]">Test Error Tracking</h2>
        <p className="text-sm text-gray-400 mb-4">
          Click the buttons below to test different Sentry features. Check your Sentry dashboard to see the events.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleClientError}
            variant="destructive"
            className="w-full"
          >
            🔴 Trigger Client Error
          </Button>

          <Button
            onClick={handleServerError}
            variant="destructive"
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            🟠 Trigger Server Error
          </Button>

          <Button
            onClick={handleCustomEvent}
            variant="default"
            className="w-full bg-[#7553ff] hover:bg-[#6043e0]"
          >
            📊 Send Custom Event
          </Button>
        </div>
      </Card>

      <Card className="bg-[#1a1525] border-[#2d2640] p-6">
        <h2 className="text-lg font-semibold mb-3 text-[#7553ff]">Status</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Sentry SDK Initialized</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>DSN Configured</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Session Replay Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Structured Logging Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Custom Metrics Enabled</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
