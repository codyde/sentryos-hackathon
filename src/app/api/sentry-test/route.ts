import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  const requestId = crypto.randomUUID()

  Sentry.setContext('test_request', {
    request_id: requestId,
    endpoint: '/api/sentry-test',
    purpose: 'error_testing'
  })

  Sentry.logger.info('Sentry test endpoint called', {
    request_id: requestId
  })

  Sentry.addBreadcrumb({
    category: 'test',
    message: 'Triggering test error',
    level: 'warning',
    data: {
      request_id: requestId
    }
  })

  try {
    // Intentionally throw an error for testing
    throw new Error('Test Server-Side Error from SentryOS API!')
  } catch (error) {
    // Capture the error with enhanced context
    Sentry.captureException(error, {
      tags: {
        test_error: 'true',
        endpoint: '/api/sentry-test',
        request_id: requestId
      },
      level: 'error',
      contexts: {
        test_context: {
          intentional: true,
          error_type: 'server_test_error'
        }
      }
    })

    Sentry.logger.error('Test error captured', {
      request_id: requestId,
      error_message: error instanceof Error ? error.message : String(error)
    })

    Sentry.metrics.increment('sentry_test.errors_triggered', 1, {
      tags: { request_id: requestId }
    })

    // Return error response
    return NextResponse.json(
      {
        error: 'Test error triggered successfully! Check Sentry dashboard.',
        request_id: requestId
      },
      { status: 500 }
    )
  }
}
