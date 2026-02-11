import { query } from '@anthropic-ai/claude-agent-sdk'
import * as Sentry from '@sentry/nextjs'
import { Timer } from '@/lib/sentry-utils'

const SYSTEM_PROMPT = `You are a helpful personal assistant designed to help with general research, questions, and tasks.

Your role is to:
- Answer questions on any topic accurately and thoroughly
- Help with research by searching the web for current information
- Assist with writing, editing, and brainstorming
- Provide explanations and summaries of complex topics
- Help solve problems and think through decisions

Guidelines:
- Be friendly, clear, and conversational
- Use web search when you need current information, facts you're unsure about, or real-time data
- Keep responses concise but complete - expand when the topic warrants depth
- Use markdown formatting when it helps readability (bullet points, code blocks, etc.)
- Be honest when you don't know something and offer to search for answers`

interface MessageInput {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  const requestTimer = new Timer()
  const requestId = crypto.randomUUID()

  // Set request context
  Sentry.setContext('api_request', {
    request_id: requestId,
    endpoint: '/api/chat',
    method: 'POST',
    timestamp: new Date().toISOString()
  })

  Sentry.logger.info('Chat API request received', {
    request_id: requestId
  })

  try {
    const { messages } = await request.json() as { messages: MessageInput[] }

    if (!messages || !Array.isArray(messages)) {
      Sentry.logger.warning('Invalid request: missing messages array', {
        request_id: requestId
      })

      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (!lastUserMessage) {
      Sentry.logger.warning('Invalid request: no user message', {
        request_id: requestId,
        message_count: messages.length
      })

      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    Sentry.logger.info('Processing chat query', {
      request_id: requestId,
      message_count: messages.length,
      message_preview: lastUserMessage.content.substring(0, 50)
    })

    Sentry.addBreadcrumb({
      category: 'api',
      message: 'Starting Claude query',
      level: 'info',
      data: {
        request_id: requestId,
        message_count: messages.length
      }
    })

    // Build conversation context
    const conversationContext = messages
      .slice(0, -1) // Exclude the last message since we pass it as the prompt
      .map((m: MessageInput) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n')

    const fullPrompt = conversationContext
      ? `${SYSTEM_PROMPT}\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${lastUserMessage.content}`
      : `${SYSTEM_PROMPT}\n\nUser: ${lastUserMessage.content}`

    let streamedEvents = 0
    let toolsExecuted = 0
    let textChunks = 0

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const streamTimer = new Timer()

        try {
          Sentry.logger.debug('Stream started', {
            request_id: requestId
          })

          // Use the claude-agent-sdk query function with all default tools enabled
          for await (const message of query({
            prompt: fullPrompt,
            options: {
              maxTurns: 10,
              // Use the preset to enable all Claude Code tools including WebSearch
              tools: { type: 'preset', preset: 'claude_code' },
              // Bypass all permission checks for automated tool execution
              permissionMode: 'bypassPermissions',
              allowDangerouslySkipPermissions: true,
              // Enable partial messages for real-time text streaming
              includePartialMessages: true,
              // Set working directory to the app's directory for sandboxing
              cwd: process.cwd(),
            }
          })) {
            streamedEvents++

            // Handle streaming text deltas (partial messages)
            if (message.type === 'stream_event' && 'event' in message) {
              const event = message.event
              // Handle content block delta events for text streaming
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                textChunks++
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: 'text_delta', text: event.delta.text })}\n\n`
                ))

                // Log every 50 chunks to avoid spam
                if (textChunks % 50 === 0) {
                  Sentry.logger.debug('Streaming progress', {
                    request_id: requestId,
                    text_chunks: textChunks,
                    elapsed_ms: streamTimer.elapsed()
                  })
                }
              }
            }

            // Send tool start events from assistant messages
            if (message.type === 'assistant' && 'message' in message) {
              const content = message.message?.content
              if (Array.isArray(content)) {
                for (const block of content) {
                  if (block.type === 'tool_use') {
                    toolsExecuted++

                    Sentry.logger.info('Tool execution started', {
                      request_id: requestId,
                      tool_name: block.name,
                      tool_count: toolsExecuted
                    })

                    Sentry.addBreadcrumb({
                      category: 'tool',
                      message: `Tool execution: ${block.name}`,
                      level: 'info',
                      data: {
                        request_id: requestId,
                        tool_name: block.name
                      }
                    })

                    controller.enqueue(encoder.encode(
                      `data: ${JSON.stringify({ type: 'tool_start', tool: block.name })}\n\n`
                    ))
                  }
                }
              }
            }

            // Send tool progress updates
            if (message.type === 'tool_progress') {
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'tool_progress', tool: message.tool_name, elapsed: message.elapsed_time_seconds })}\n\n`
              ))
            }

            // Signal completion
            if (message.type === 'result' && message.subtype === 'success') {
              const streamDuration = streamTimer.stop()
              const totalDuration = requestTimer.stop()

              Sentry.logger.info('Stream completed successfully', {
                request_id: requestId,
                stream_duration_ms: streamDuration,
                total_duration_ms: totalDuration,
                events_streamed: streamedEvents,
                tools_executed: toolsExecuted,
                text_chunks: textChunks
              })

              Sentry.metrics.distribution('chat.api.stream_duration', streamDuration, {
                unit: 'millisecond',
                tags: { status: 'success', request_id: requestId }
              })

              Sentry.metrics.distribution('chat.api.total_duration', totalDuration, {
                unit: 'millisecond',
                tags: { status: 'success', request_id: requestId }
              })

              Sentry.metrics.distribution('chat.api.tools_per_request', toolsExecuted, {
                tags: { request_id: requestId }
              })

              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'done' })}\n\n`
              ))
            }

            // Handle errors
            if (message.type === 'result' && message.subtype !== 'success') {
              const streamDuration = streamTimer.stop()
              const totalDuration = requestTimer.stop()

              Sentry.logger.error('Stream failed', {
                request_id: requestId,
                subtype: message.subtype,
                stream_duration_ms: streamDuration,
                total_duration_ms: totalDuration,
                events_streamed: streamedEvents
              })

              Sentry.metrics.distribution('chat.api.stream_duration', streamDuration, {
                unit: 'millisecond',
                tags: { status: 'error', request_id: requestId }
              })

              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'error', message: 'Query did not complete successfully' })}\n\n`
              ))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          const streamDuration = streamTimer.stop()
          const totalDuration = requestTimer.stop()

          Sentry.logger.error('Stream error occurred', {
            request_id: requestId,
            error: String(error),
            stream_duration_ms: streamDuration,
            total_duration_ms: totalDuration,
            events_before_error: streamedEvents
          })

          Sentry.captureException(error, {
            tags: {
              endpoint: '/api/chat',
              request_id: requestId,
              error_location: 'stream'
            },
            contexts: {
              stream_context: {
                events_streamed: streamedEvents,
                tools_executed: toolsExecuted,
                text_chunks: textChunks,
                duration_ms: streamDuration
              }
            }
          })

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
    const totalDuration = requestTimer.stop()

    Sentry.logger.error('Chat API error', {
      request_id: requestId,
      error: String(error),
      total_duration_ms: totalDuration
    })

    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/chat',
        request_id: requestId,
        error_location: 'request_parsing'
      },
      contexts: {
        request_context: {
          duration_ms: totalDuration
        }
      }
    })

    return new Response(
      JSON.stringify({ error: 'Failed to process chat request. Check server logs for details.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
