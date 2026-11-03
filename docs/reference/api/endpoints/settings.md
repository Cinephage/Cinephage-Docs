---
title: Settings
description: API endpoints for system settings and configuration
sidebar_position: 5
tags: [api, settings, configuration, system, endpoints, reference]
keywords: [api, settings, configuration, system, endpoints]
---

# Settings

Endpoints for managing system settings and configuration.

:::info
There is no generic `GET /api/settings` (list-all) or `GET/PUT /api/settings/:key` endpoint - settings are entirely per-category, each with its own route and shape (`/api/settings/tmdb`, `/api/settings/filters`, `/api/settings/arr-compat`, etc). The full list of settings categories is in the [API endpoints overview](/reference/api/endpoints-overview#settings).
:::

## Authentication

Nearly all settings endpoints (both GET and PUT) require admin authorization - settings are considered sensitive configuration, not general read access.

| Endpoint | Auth Level |
|----------|------------|
| `/api/settings/*` | Admin (all, with the noted exception below) |
| `POST /api/settings/logs/client-report` | Public (browser error reporting; explicitly exempted from the global auth gate so it can fire pre-login) |
| `GET /api/health` | Public |
| `GET /api/ready` | Public |
| `GET /api/system/status` | Any session/key (viewer or admin) - requires login, just not the admin role |

---

## System health

Returns the health status of the application and its dependencies.

```
GET /api/health
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | Healthy or starting |
| 503 | Unhealthy (a dependency check failed) |

### Response schema

```json
{
  "status": "healthy | starting | unhealthy",
  "version": "string",
  "timestamp": "string",
  "runtime": {
    "uptimeSeconds": "number",
    "servicesStarted": "boolean"
  },
  "checks": {
    "database": {
      "status": "healthy | unhealthy",
      "latencyMs": "number"
    }
  }
}
```

### Example response

```json
{
  "status": "healthy",
  "version": "0.17.0",
  "timestamp": "2026-09-15T10:30:00Z",
  "runtime": { "uptimeSeconds": 3600, "servicesStarted": true },
  "checks": { "database": { "status": "healthy", "latencyMs": 2 } }
}
```

---

## Readiness check

Returns whether the application is ready to accept traffic (database reachable and background services started).

```
GET /api/ready
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | Ready |
| 503 | Not ready |

### Response schema

```json
{
  "status": "ready | starting",
  "version": "string",
  "checks": {
    "database": "ready | starting",
    "servicesStarted": "ready | starting",
    "servicesReady": "ready | starting"
  }
}
```

---

## System status

Returns the status of all background services - useful for monitoring startup progress.

```
GET /api/system/status
```

### Response schema

```json
{
  "success": "boolean",
  "ready": "boolean",
  "version": "string",
  "services": [
    {
      "name": "string",
      "status": "string",
      "error": "string (only present if the service errored)"
    }
  ]
}
```

---

## TMDB settings

Cinephage ships with a bundled TMDB key by default; this endpoint only manages an optional user-supplied override, not a full TMDB configuration surface (there's no language/certification/cache settings here - those live in [filter settings](#filter-settings) or elsewhere).

### Get TMDB settings

```
GET /api/settings/tmdb
```

### Response schema

```json
{
  "success": "boolean",
  "hasApiKey": "boolean"
}
```

### Update TMDB settings

```
PUT /api/settings/tmdb
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| apiKey | string | No | TMDB API key override |

---

## Filter settings

Despite the name, this is TMDB *discover* filtering (what shows up when browsing/discovering new content), not download/RSS filtering.

### Get filter settings

```
GET /api/settings/filters
```

### Response schema

```json
{
  "success": "boolean",
  "filters": {
    "include_adult": "boolean",
    "min_vote_average": "number",
    "min_vote_count": "number",
    "language": "string",
    "region": "string",
    "excluded_genre_ids": ["number"]
  }
}
```

### Update filter settings

```
PUT /api/settings/filters
```

Accepts a partial `filters` object with any of the fields above.

---

## External URL settings

Used to build absolute links (e.g. the Radarr/Sonarr compatibility connection URLs) when Cinephage is behind a reverse proxy or a different address than its local origin.

### Get external URL

```
GET /api/settings/external-url
```

### Response schema

```json
{
  "url": "string | null"
}
```

### Update external URL

```
PUT /api/settings/external-url
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string \| null | Yes | Full external URL, or `null`/empty string to clear it |

---

## Radarr/Sonarr compatibility

```
GET  /api/settings/arr-compat
PUT  /api/settings/arr-compat
```

`GET` returns `{ "enabled": boolean }`; `PUT` accepts the same shape to toggle the compatibility layer. See [Configure Radarr/Sonarr compatibility](/guides/configure/system/arr-compat).

## Sidecar file settings

```
GET  /api/settings/sidecar
PUT  /api/settings/sidecar
```

Both return/accept `{ enabled, overwriteExisting, includeArtwork, tvSeriesLevel, tvSeasonLevel, tvEpisodeLevel }`. See [Configure Sidecar Files](/guides/configure/system/sidecar-files).

---

## API key management

Cinephage is single-admin - there are exactly two fixed keys per account (Main and Media Streaming), not arbitrarily-named keys.

### List API keys

```
GET /api/settings/system/api-keys
```

### Response schema

```json
{
  "success": "boolean",
  "data": [
    {
      "id": "string",
      "name": "string",
      "key": "string",
      "createdAt": "string",
      "metadata": { "type": "main | streaming", "description": "string" }
    }
  ]
}
```

Unlike a typical show-once API key design, Cinephage's keys are recoverable - `key` here is the real, full key value, not a masked/redacted one. `GET` can always retrieve it again; there's no "copy it now or lose it" step.

### Generate API keys

```
POST /api/settings/system/api-keys
```

Takes no request body. Auto-generates (or returns existing) Main and Media Streaming API keys for the current admin user.

### Response schema

```json
{
  "success": "boolean",
  "data": {
    "mainKey": { "id": "string", "key": "string" },
    "streamingKey": { "id": "string", "key": "string" }
  }
}
```

`mainKey`/`streamingKey` is `null` instead of an object if that key already existed (this endpoint only creates keys that are missing).

### Regenerate an API key

```
POST /api/settings/system/api-keys/:id/regenerate
```

Requires an authenticated user (not admin-only, unlike the rest of this section) - invalidates the old key and generates a new one with the same name/type.

### Response schema

```json
{
  "success": "boolean",
  "data": { "id": "string", "key": "string", "name": "string", "metadata": "object" }
}
```

---

## Log settings & history

### Get/update log settings

```
GET /api/settings/logs/settings
PUT /api/settings/logs/settings
```

Retention days and other log-capture settings.

### Query log history

```
GET /api/settings/logs/history
DELETE /api/settings/logs/history
```

`GET` queries persisted historical log entries; `DELETE` clears log history.

### Log streaming

SSE endpoint for real-time log streaming.

```
GET /api/settings/logs/stream
```

### Download logs

```
GET /api/settings/logs/download
```

### Client error reports

```
POST /api/settings/logs/client-report
```

Public endpoint the browser UI itself uses to report client-side JavaScript errors back to the server log - not an admin-facing settings endpoint.

---

## Backup & restore

See the [Backup and restore guide](/guides/deploy/backup-restore) for the full procedure. There is no restore-from-backup API endpoint - restoring is done by copying backup files back into Cinephage's data directory before startup.

```
POST /api/settings/system/backup
PUT  /api/settings/system/backup
GET  /api/settings/system/db-backup
PUT  /api/settings/system/db-backup
POST /api/settings/system/db-backup/run
GET  /api/settings/system/db-backup/list
```

---

## See Also

- [API endpoints overview](/reference/api/endpoints-overview) - full endpoint listing by category
- [Authentication](../authentication) - API authentication
- [Rate Limiting](../rate-limiting) - Rate limit configuration
- [Movies](movies) - Movie library endpoints
- [TV](tv) - TV shows endpoints
