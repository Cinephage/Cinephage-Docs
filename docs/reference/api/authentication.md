---
title: API authentication
description: API authentication methods, API keys, and security
sidebar_position: 2
tags: [api, authentication, security, api-keys, reference]
keywords: [api, authentication, security, api keys]
---

# API authentication

Cinephage uses **Better Auth** for authentication with session-based login and API key support.

## Authentication Methods

| Method        | Use Case                        | Auth Type      |
| ------------- | ------------------------------- | -------------- |
| **Session**   | Web UI access                   | Cookie-based   |
| **Main API Key** | Full API access, automation  | Header/Query   |
| **Streaming API Key** | Media server integration | Header/Query   |

## Session Authentication

### Login flow

1. POST to `/api/auth/sign-in/credential` with username and password
2. Server creates session and sets cookie
3. Subsequent requests include session cookie automatically

### Session properties

| Property      | Value            |
| ------------- | ---------------- |
| Duration      | 7 days           |
| Refresh       | Every 24 hours   |
| Cookie Name   | `cinephage.session_token` (prefix changes to `__Secure` when served over HTTPS) |
| HttpOnly      | Yes              |
| SameSite      | Lax              |

### Multi-user accounts

Cinephage supports multiple accounts as of v0.18.0, with two roles:

- **Admin** (`role: admin`) - the first registered user; full access to every endpoint
- **User/viewer** (`role: user`) - confined to a read-only allowlist (discover, TMDB, calendar, library reads, system status) plus self-scoped endpoints for their own profile, sessions, preferences, avatar, and media requests; everything else under `/api/` returns 403

A banned account is blocked regardless of role. Additional accounts are created via admin-issued invites, or by importing accounts from a connected media server's user directory.

## API Key Authentication

### API key types

| Key Type             | Permissions                    | Use Case                    |
| -------------------- | ------------------------------ | --------------------------- |
| **Main API Key**     | Full access to all endpoints   | Automation, scripts, tools  |
| **Streaming API Key**| Live TV, EPG, streaming only   | Media server integration    |

### Streaming API key permissions

A streaming-scoped key is only ever checked against a fixed allowlist of playback routes - it never resolves a login session on any other endpoint, so every other route treats it as unauthenticated (401). It isn't a permissions grant layered on top of a session.

| Allowed (streaming-scoped routes) |
| ---------------------------------- |
| `/api/livetv/playlist.m3u`         |
| `/api/livetv/epg.xml`              |
| `/api/livetv/stream/*`             |
| `/api/streaming/session/*`         |
| `/api/streaming/usenet/*`          |
| `/api/streaming/library/*`         |

A **Main API Key** also works on all of the above (it's tried as a streaming-permission key first, falling back to a full-access check), in addition to the rest of the API.

### Using API keys

**Via Header (Recommended):**

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  http://localhost:3000/api/library/movies
```

**Via Query Parameter:**

```bash
curl "http://localhost:3000/api/livetv/playlist.m3u?api_key=cinephage_your_key_here"
```

:::tip[When to Use Query Parameter]
Some media servers (Plex, Jellyfin) can't send custom headers. Use the query parameter for M3U playlist URLs.
:::

### Managing API keys

Navigate to **Settings > System**:

| Action           | Description                              |
| ---------------- | ---------------------------------------- |
| **View**         | Show full key value                      |
| **Copy**         | Copy to clipboard                        |
| **Regenerate**   | Create new key (old key invalidates)     |

:::warning[Regenerating Keys]
Regenerating a key immediately invalidates the old key. Update any services using the key before regenerating.
:::

### API key storage

API keys are encrypted at rest:

- Algorithm: AES-256-GCM
- Encryption key derived from `BETTER_AUTH_SECRET`
- Stored in `userApiKeySecrets` database table

## Rate Limiting

Session cookies and the Main API Key are not subject to a built-in request-count limit. Only the Streaming API Key and unauthenticated requests are throttled - see [Rate Limiting](rate-limiting) for the full policy, including the separate per-IP limiter applied to unauthenticated requests.

### API key rate limits

| Key Type         | Window     | Max Requests |
| ---------------- | ---------- | ------------ |
| Streaming API    | 1 hour (default) | 10,000 (default) |

Configure via environment variables:

| Variable                                 | Default   | Description          |
| ---------------------------------------- | --------- | -------------------- |
| `STREAMING_API_KEY_RATE_LIMIT_WINDOW_MS` | 3600000   | Window in ms (1 hr)  |
| `STREAMING_API_KEY_RATE_LIMIT_MAX`       | 10000     | Max requests/window  |

### Login rate limiting

| Limit         | Value                      |
| ------------- | -------------------------- |
| Max Attempts  | 5                          |
| Window        | 15 minutes                 |

## Endpoint Authorization

### Authorization levels

| Level          | Function            | Description                    |
| -------------- | ------------------- | ------------------------------ |
| **None**       | -                   | Public endpoint                |
| **requireAuth**| `requireAuth()`     | Any authenticated user         |
| **requireAdmin**| `requireAdmin()`   | Admin role required            |

### Response codes

| Code | Meaning                           |
| ---- | --------------------------------- |
| 200  | Success                           |
| 401  | Not authenticated                 |
| 403  | Authenticated but not authorized  |

### Common endpoint patterns

A global check in `hooks.server.ts` requires a valid session or API key (`event.locals.user`) on every `/api/*` route before it even reaches the route handler, then a second central gate restricts any non-admin ("viewer") session to a fixed allowlist of read-only paths - everything else under `/api/` is admin-only regardless of whether the route handler itself calls `requireAdmin`. Banned users are blocked everywhere.

**Public (no auth):**
- `/health`, `/api/health`, `/api/ready`
- `/api/radarr/ping`, `/api/sonarr/ping` (real Radarr/Sonarr's own health check is unauthenticated)
- `/api/auth/*` (sign-in, sign-up, session endpoints)
- `/api/settings/logs/client-report` (POST) - crash reports can fire before login

**Viewer-allowed (non-admin sessions, GET/HEAD only unless noted):**
- `/api/discover/*`, `/api/tmdb/*`, `/api/calendar/*`
- `/api/library/movies/*`, `/api/library/series/*` (reads)
- `/api/system/status`
- `/api/requests` and `/api/requests/*` (own requests: create, read, cancel)
- Self-scoped `/api/user/*` routes - language, sessions, media-server link, preferences, avatar, notifications

**Admin only (everything else under `/api/`):**
- `/api/settings/*`
- `/api/indexers/*`, `/api/download-clients/*` (including reads - not just writes)
- `/api/radarr/*`, `/api/sonarr/*` (except the `/ping` routes above)
- Any other `/api/*` route not in the viewer allowlist

### Authentication methods accepted per route

- Most `/api/*` routes: session cookie, or a full-access API key via the `x-api-key` header.
- `/api/radarr/*` and `/api/sonarr/*` additionally accept the full-access key as an `apikey` or `api_key` query parameter, since arr-compatible clients (e.g. Jellyseerr/Overseerr) send it that way for Radarr/Sonarr connections. Query-string credentials are not accepted anywhere else.
- The streaming-scoped routes listed above never resolve a session at all - only a streaming-scoped or full-access API key (header or query param) is checked.

## Environment Variables

### Required

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `BETTER_AUTH_SECRET` | Secret for session signing and encryption |

### Optional

| Variable                      | Default               | Description                    |
| ----------------------------- | --------------------- | ------------------------------ |
| `BETTER_AUTH_URL`             | From settings         | Base URL for auth callbacks    |
| `BETTER_AUTH_TRUSTED_ORIGINS` | None                  | Additional trusted origins     |

### Generating BETTER_AUTH_SECRET

```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

:::danger[Changing BETTER_AUTH_SECRET]
Changing this secret will:
- Invalidate all active sessions (users must re-login)
- Make encrypted API keys unreadable (must regenerate)
- Cannot be undone
:::

## Trusted Origins

Cinephage automatically trusts:

1. **Local development:** `localhost:3000`, `localhost:5173`, `127.0.0.1`
2. **Private networks:** RFC1918 addresses (10.x, 172.16-31.x, 192.168.x)
3. **Environment configured:** `BETTER_AUTH_URL`, `ORIGIN`
4. **Settings configured:** External URL from **Settings > System**

## Security Best Practices

### API key security

- **Don't commit keys** to version control
- **Use environment variables** in scripts
- **Use Streaming API Key** for media servers (least privilege)
- **Regenerate compromised keys** immediately

### BETTER_AUTH_SECRET

- **Generate a unique value** for each installation
- **Back it up securely** - needed for database restoration
- **Don't change it** unless absolutely necessary
- **Treat it like a password** - keep it secret

### Network security

- **Use HTTPS** in production
- **Restrict admin endpoints** with reverse proxy rules
- **Use VPN** for remote access when possible

## Troubleshooting

### "401 unauthorized"

**Session auth:**
- Session may have expired - log in again
- Cookie may be blocked - check browser settings

**API key auth:**
- Key may be invalid - verify in **Settings > System**
- Key may be wrong type - use Main API Key for library access

### "403 forbidden"

- Authenticated but not admin
- Check if endpoint requires admin role
- Streaming API Key used for non-streaming endpoint

### API key not working

1. **Check key is correct** - Copy from **Settings > System**
2. **Check header name** - Must be `x-api-key`
3. **Check permissions** - Streaming key has limited access
4. **Check rate limits** - May be temporarily blocked

### Sessions invalid after restart

If all sessions are invalidated after restart:
- `BETTER_AUTH_SECRET` may have changed
- Database may have been reset
- This is expected behavior with new secret

## See Also

- [Endpoints Overview](endpoints-overview) - Available API endpoints
- [Environment Variables](../configuration/environment-variables) - Configuration reference
- [Settings Explained](../configuration/settings-explained) - UI configuration
