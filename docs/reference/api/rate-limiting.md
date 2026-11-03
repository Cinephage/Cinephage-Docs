---
title: Rate Limiting
description: API rate limiting policies for Cinephage
sidebar_position: 3
tags: [api, rate-limiting, authentication, reference]
keywords: [api, rate limits, throttling, requests]
---

# Rate Limiting

Cinephage implements rate limiting to ensure fair usage and system stability. There are two independent layers: an IP-based limiter for unauthenticated requests, and a per-key limiter for the Streaming API Key.

## IP-based limiting (unauthenticated requests)

Requests with no active session and no valid API key are rate limited per client IP (and user agent). Once a request is authenticated (session cookie or API key), it is **not** subject to these IP-based limits.

| Route prefix | Window | Max Requests |
|---------------|--------|---------------|
| `/api/auth/*` | 15 minutes | 5 |
| `/api/activity/stream*` | 15 minutes | 300 |
| `/api/activity*` | 15 minutes | 300 |
| `/api/streaming/*`, `/api/livetv/stream/*` | 1 minute | 30 |
| All other `/api/*` routes | 15 minutes | 100 |

## Per-key limiting (Streaming API Key)

Streaming API Key requests to `/api/streaming/*` and `/api/livetv/stream/*` are governed separately by Better Auth's per-key rate limiter instead of the IP-based limiter above:

| Key Type | Window | Max Requests |
|----------|--------|---------------|
| Streaming API Key | 1 hour (default) | 10,000 (default) |

Configure via environment variables:

| Variable | Default | Description |
|----------|---------|--------------|
| `STREAMING_API_KEY_RATE_LIMIT_WINDOW_MS` | 3600000 | Window in ms (1 hour) |
| `STREAMING_API_KEY_RATE_LIMIT_MAX` | 10000 | Max requests per window |

The Main API Key is not subject to a built-in request-count rate limit.

## Rate Limit Headers

Rate-limited responses (and responses on routes the IP-based limiter tracks) include:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed |
| `X-RateLimit-Remaining` | Requests remaining in window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

## Exceeding the Limit

When you exceed the rate limit, the API returns:

- **Status:** `429 Too Many Requests`
- **Body:** `{ "success": false, "error": "Rate limit exceeded. Please try again later.", "code": "RATE_LIMITED" }`
- **Header:** `Retry-After` with seconds to wait

## Best Practices

- **Authenticate your requests** - Session cookies and API keys bypass the stricter unauthenticated IP limits
- **Use streaming keys** - For media server integrations, use the limited-scope Streaming API Key
- **Handle 429s gracefully** - Back off and retry with exponential delay
- **Monitor usage** - Check the `X-RateLimit-Remaining` header

## See Also

- [Authentication](/reference/api/authentication) - API key management
- [API Endpoints Overview](/reference/api/endpoints-overview) - Available endpoints
