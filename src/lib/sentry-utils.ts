import * as Sentry from "@sentry/nextjs";

/**
 * Generate unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Extract session info from request headers
 */
export function extractSessionContext(request: Request) {
  const headers = request.headers;
  return {
    user_agent: headers.get('user-agent') || 'unknown',
    referer: headers.get('referer') || 'none',
    // Add custom headers if frontend sends session info
    session_id: headers.get('x-session-id') || undefined,
    user_id: headers.get('x-user-id') || undefined,
  };
}

/**
 * Set common tags for all spans in this request
 */
export function setRequestContext(requestId: string, context: Record<string, string>) {
  Sentry.setTag('request_id', requestId);
  Object.entries(context).forEach(([key, value]) => {
    if (value) Sentry.setTag(key, value);
  });
}

/**
 * Track token usage and cost
 */
export function trackTokenUsage(tokens: {
  input?: number;
  output?: number;
  total?: number;
}, model: string = 'claude-sonnet-4-5') {
  // Emit custom metrics for token consumption
  if (tokens.input) {
    Sentry.metrics.distribution('ai.tokens.input', tokens.input, {
      unit: 'none',
      tags: { model }
    });
  }

  if (tokens.output) {
    Sentry.metrics.distribution('ai.tokens.output', tokens.output, {
      unit: 'none',
      tags: { model }
    });
  }

  if (tokens.total) {
    Sentry.metrics.distribution('ai.tokens.total', tokens.total, {
      unit: 'none',
      tags: { model }
    });
  }

  // Approximate cost calculation
  // Update these based on actual Anthropic pricing
  const inputCostPer1M = 3.00; // $3 per 1M input tokens
  const outputCostPer1M = 15.00; // $15 per 1M output tokens

  const estimatedCost =
    ((tokens.input || 0) / 1000000 * inputCostPer1M) +
    ((tokens.output || 0) / 1000000 * outputCostPer1M);

  Sentry.metrics.distribution('ai.cost.usd', estimatedCost, {
    unit: 'none',
    tags: { model }
  });
}
