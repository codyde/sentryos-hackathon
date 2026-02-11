import { query } from '@anthropic-ai/claude-agent-sdk'
import * as Sentry from "@sentry/nextjs"
import {
  generateRequestId,
  extractSessionContext,
  setRequestContext,
  trackTokenUsage
} from '@/lib/sentry-utils'

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

// Tracking state for the current request
interface RequestState {
  requestId: string
  startTime: number
  toolExecutions: Map<string, { start: number; elapsed?: number }>
  tokenUsage: { input: number; output: number; total: number }
  turnCount: number
  streamedChunks: number
}

export async function POST(request: Request) {
  // Start the main request transaction
  return await Sentry.startSpan(
    {
      name: 'POST /api/chat',
      op: 'http.server',
      attributes: {
        'http.method': 'POST',
        'http.route': '/api/chat',
      }
    },
    async (span) => {
      const requestState: RequestState = {
        requestId: generateRequestId(),
        startTime: Date.now(),
        toolExecutions: new Map(),
        tokenUsage: { input: 0, output: 0, total: 0 },
        turnCount: 0,
        streamedChunks: 0,
      }

      try {
        // Extract and set context
        const sessionContext = extractSessionContext(request)
        setRequestContext(requestState.requestId, sessionContext)

        // Log request start
        Sentry.logger.info('Chat request received', {
          extra: {
            request_id: requestState.requestId,
            ...sessionContext,
          }
        })

        // Emit request count metric
        Sentry.metrics.increment('api.chat.requests', 1, {
          tags: { endpoint: '/api/chat' }
        })

        // Parse request body
        const { messages } = await Sentry.startSpan(
          { name: 'Parse request body', op: 'parse.json' },
          async () => await request.json() as { messages: MessageInput[] }
        )

        if (!messages || !Array.isArray(messages)) {
          Sentry.metrics.increment('api.chat.errors', 1, {
            tags: { error_type: 'validation', reason: 'invalid_messages' }
          })

          return new Response(
            JSON.stringify({ error: 'Messages array is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }

        // Get the last user message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()
        if (!lastUserMessage) {
          Sentry.metrics.increment('api.chat.errors', 1, {
            tags: { error_type: 'validation', reason: 'no_user_message' }
          })

          return new Response(
            JSON.stringify({ error: 'No user message found' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }

        // Build conversation context
        const conversationContext = messages
          .slice(0, -1)
          .map((m: MessageInput) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n\n')

        const fullPrompt = conversationContext
          ? `${SYSTEM_PROMPT}\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${lastUserMessage.content}`
          : `${SYSTEM_PROMPT}\n\nUser: ${lastUserMessage.content}`

        // Track prompt size
        Sentry.metrics.distribution('ai.prompt.length', fullPrompt.length, {
          unit: 'character',
          tags: { has_context: conversationContext ? 'true' : 'false' }
        })

        // Create a streaming response
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            // Track stream lifecycle
            const streamSpan = Sentry.startInactiveSpan({
              name: 'SSE Stream',
              op: 'stream.sse',
            })

            try {
              // Execute agent query within a span
              await Sentry.startSpan(
                {
                  name: 'Claude Agent Query',
                  op: 'ai.agent.query',
                  attributes: {
                    'ai.prompt.length': fullPrompt.length,
                    'ai.max_turns': 10,
                    'ai.permission_mode': 'bypass',
                  }
                },
                async () => {
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
                    // Handle streaming text deltas
                    if (message.type === 'stream_event' && 'event' in message) {
                      const event = message.event
                      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                        requestState.streamedChunks++
                        controller.enqueue(encoder.encode(
                          `data: ${JSON.stringify({ type: 'text_delta', text: event.delta.text })}\n\n`
                        ))
                      }
                    }

                    // Track tool starts
                    if (message.type === 'assistant' && 'message' in message) {
                      const content = message.message?.content
                      if (Array.isArray(content)) {
                        for (const block of content) {
                          if (block.type === 'tool_use') {
                            // Start tracking tool execution
                            requestState.toolExecutions.set(block.name, {
                              start: Date.now()
                            })

                            // Log and emit metric
                            Sentry.logger.debug('Tool execution started', {
                              extra: {
                                request_id: requestState.requestId,
                                tool_name: block.name,
                                tool_id: block.id,
                              }
                            })

                            Sentry.metrics.increment('ai.tool.executions', 1, {
                              tags: { tool_name: block.name }
                            })

                            controller.enqueue(encoder.encode(
                              `data: ${JSON.stringify({ type: 'tool_start', tool: block.name })}\n\n`
                            ))
                          }
                        }
                      }
                    }

                    // Track tool progress and completion
                    if (message.type === 'tool_progress') {
                      const toolState = requestState.toolExecutions.get(message.tool_name)
                      if (toolState) {
                        toolState.elapsed = message.elapsed_time_seconds

                        // Emit tool execution time metric
                        Sentry.metrics.distribution(
                          'ai.tool.duration',
                          message.elapsed_time_seconds,
                          {
                            unit: 'second',
                            tags: { tool_name: message.tool_name }
                          }
                        )
                      }

                      controller.enqueue(encoder.encode(
                        `data: ${JSON.stringify({
                          type: 'tool_progress',
                          tool: message.tool_name,
                          elapsed: message.elapsed_time_seconds
                        })}\n\n`
                      ))
                    }

                    // Handle successful completion
                    if (message.type === 'result' && message.subtype === 'success') {
                      const totalDuration = (Date.now() - requestState.startTime) / 1000

                      Sentry.logger.info('Chat request completed', {
                        extra: {
                          request_id: requestState.requestId,
                          duration_seconds: totalDuration,
                          turn_count: requestState.turnCount,
                          streamed_chunks: requestState.streamedChunks,
                          tools_used: Array.from(requestState.toolExecutions.keys()),
                        }
                      })

                      // Emit completion metrics
                      Sentry.metrics.distribution('api.chat.duration', totalDuration, {
                        unit: 'second',
                        tags: { status: 'success' }
                      })

                      Sentry.metrics.distribution('ai.stream.chunks', requestState.streamedChunks, {
                        unit: 'none'
                      })

                      controller.enqueue(encoder.encode(
                        `data: ${JSON.stringify({ type: 'done' })}\n\n`
                      ))
                    }

                    // Handle errors
                    if (message.type === 'result' && message.subtype !== 'success') {
                      Sentry.logger.error('Query did not complete successfully', {
                        extra: {
                          request_id: requestState.requestId,
                          subtype: message.subtype,
                        }
                      })

                      Sentry.metrics.increment('api.chat.errors', 1, {
                        tags: {
                          error_type: 'query_failed',
                          subtype: message.subtype
                        }
                      })

                      controller.enqueue(encoder.encode(
                        `data: ${JSON.stringify({
                          type: 'error',
                          message: 'Query did not complete successfully'
                        })}\n\n`
                      ))
                    }
                  }
                }
              )

              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              streamSpan?.end()

            } catch (error) {
              streamSpan?.end()

              Sentry.logger.error('Stream error', {
                extra: {
                  request_id: requestState.requestId,
                  error: error instanceof Error ? error.message : String(error),
                }
              })

              // Capture exception to Sentry
              Sentry.captureException(error, {
                tags: {
                  request_id: requestState.requestId,
                  error_location: 'stream',
                },
              })

              Sentry.metrics.increment('api.chat.errors', 1, {
                tags: { error_type: 'stream_error' }
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
            'X-Request-Id': requestState.requestId, // Return request ID for tracing
          },
        })

      } catch (error) {
        Sentry.logger.error('Chat API error', {
          extra: {
            request_id: requestState.requestId,
            error: error instanceof Error ? error.message : String(error),
          }
        })

        // Capture exception
        Sentry.captureException(error, {
          tags: {
            request_id: requestState.requestId,
            error_location: 'outer',
          },
        })

        Sentry.metrics.increment('api.chat.errors', 1, {
          tags: { error_type: 'request_processing' }
        })

        return new Response(
          JSON.stringify({
            error: 'Failed to process chat request. Check server logs for details.',
            request_id: requestState.requestId,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  )
}
