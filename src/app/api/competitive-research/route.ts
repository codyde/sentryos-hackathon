import { query } from '@anthropic-ai/claude-agent-sdk'
import * as Sentry from '@sentry/nextjs'

const SYSTEM_PROMPT = `You are a competitive intelligence analyst specializing in the error monitoring, application performance monitoring (APM), and observability space. Your job is to research and compare Sentry against its competitors.

Core competitors you should be familiar with:
- Error Monitoring: Bugsnag, Rollbar, Raygun, Honeybadger, Airbrake
- APM/Observability: Datadog, New Relic, Dynatrace, Splunk/SignalFx, Elastic APM, Grafana
- Emerging: Highlight.io, PostHog, OpenTelemetry ecosystem

Your role is to:
- Compare Sentry against specific competitors when asked
- Research the latest features, pricing, and positioning of competing products
- Provide balanced, factual analysis - acknowledge competitor strengths honestly
- Use tables for feature comparisons to make data easy to digest
- Always search the web for current information - product landscapes change rapidly
- Focus on the developer experience perspective since Sentry's audience is developers

Guidelines:
- Structure responses with: Executive Summary, Detailed Comparison, Sentry Advantages, Competitor Advantages, and Sources
- Be specific and factual - cite pricing pages, documentation, and recent announcements
- Note when information may be outdated or unverifiable
- Consider the full stack: features, SDKs, docs, community, pricing, and integrations
- Use markdown tables for side-by-side comparisons
- Include links to sources when available`

interface MessageInput {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json() as { messages: MessageInput[] }

    if (!messages || !Array.isArray(messages)) {
      Sentry.logger.warn('Competitive research request received with invalid messages payload')
      Sentry.metrics.increment('competitive_research.requests', 1, { tags: { status: 'invalid' } })
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (!lastUserMessage) {
      Sentry.logger.warn('Competitive research request received with no user message')
      Sentry.metrics.increment('competitive_research.requests', 1, { tags: { status: 'invalid' } })
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    Sentry.logger.info('Competitive research request received with %d messages', [messages.length])
    Sentry.metrics.increment('competitive_research.requests', 1, { tags: { status: 'started' } })
    Sentry.metrics.distribution('competitive_research.messages_per_request', messages.length)

    const conversationContext = messages
      .slice(0, -1)
      .map((m: MessageInput) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n')

    const fullPrompt = conversationContext
      ? `${SYSTEM_PROMPT}\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${lastUserMessage.content}`
      : `${SYSTEM_PROMPT}\n\nUser: ${lastUserMessage.content}`

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const message of query({
            prompt: fullPrompt,
            options: {
              maxTurns: 10,
              tools: { type: 'preset', preset: 'claude_code' },
              permissionMode: 'bypassPermissions',
              allowDangerouslySkipPermissions: true,
              includePartialMessages: true,
              cwd: process.cwd(),
            }
          })) {
            if (message.type === 'stream_event' && 'event' in message) {
              const event = message.event
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: 'text_delta', text: event.delta.text })}\n\n`
                ))
              }
            }

            if (message.type === 'assistant' && 'message' in message) {
              const content = message.message?.content
              if (Array.isArray(content)) {
                for (const block of content) {
                  if (block.type === 'tool_use') {
                    Sentry.logger.info('Competitive research tool invoked: %s', [block.name])
                    Sentry.metrics.increment('competitive_research.tool_invocations', 1, { tags: { tool: block.name } })
                    controller.enqueue(encoder.encode(
                      `data: ${JSON.stringify({ type: 'tool_start', tool: block.name })}\n\n`
                    ))
                  }
                }
              }
            }

            if (message.type === 'tool_progress') {
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'tool_progress', tool: message.tool_name, elapsed: message.elapsed_time_seconds })}\n\n`
              ))
            }

            if (message.type === 'result' && message.subtype === 'success') {
              Sentry.logger.info('Competitive research stream completed successfully')
              Sentry.metrics.increment('competitive_research.requests', 1, { tags: { status: 'success' } })
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'done' })}\n\n`
              ))
            }

            if (message.type === 'result' && message.subtype !== 'success') {
              Sentry.logger.error('Competitive research query did not complete successfully, subtype: %s', [message.subtype])
              Sentry.metrics.increment('competitive_research.requests', 1, { tags: { status: 'query_failure' } })
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'error', message: 'Query did not complete successfully' })}\n\n`
              ))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          Sentry.logger.error('Competitive research stream error: %s', [error instanceof Error ? error.message : String(error)])
          Sentry.metrics.increment('competitive_research.errors', 1, { tags: { phase: 'stream' } })
          Sentry.captureException(error)
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: 'Stream error occurred' })}\n\n`
          ))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    Sentry.logger.error('Competitive research API error: %s', [error instanceof Error ? error.message : String(error)])
    Sentry.metrics.increment('competitive_research.errors', 1, { tags: { phase: 'request' } })
    Sentry.captureException(error)

    return new Response(
      JSON.stringify({ error: 'Failed to process competitive research request. Check server logs for details.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
