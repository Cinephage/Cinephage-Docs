---
title: Download Queue
description: API endpoints for managing the download queue
sidebar_position: 4
tags: [api, download, queue, torrent, usenet, endpoints, reference]
keywords: [api, download, queue, torrent, usenet, endpoints]
---

# Download queue

Endpoints for viewing and managing the download queue.

## Authentication

None of the queue endpoints call an authentication check directly in the route handler - but none of these are actually reachable unauthenticated: a global gate in `hooks.server.ts` requires a valid session or API key on every `/api/*` route before it reaches any handler. Unlike the library endpoints, `/api/queue/*` is not on the viewer read-only allowlist, so these are **admin-only** across the board, including the GET endpoints. See [API Authentication](/reference/api/authentication) for how that global gate works.

| Endpoint | Auth Level |
|----------|------------|
| GET `/api/queue` | 🔐 Admin only |
| GET `/api/queue/:id` | 🔐 Admin only |
| PATCH `/api/queue/:id` | 🔐 Admin only |
| DELETE `/api/queue/:id` | 🔐 Admin only |
| POST `/api/queue/:id/retry` | 🔐 Admin only |
| POST `/api/queue/clear-failed` | 🔐 Admin only |
| GET `/api/queue/history` | 🔐 Admin only |
| DELETE `/api/queue/history` | 🔐 Admin only |
| POST `/api/queue/refresh` | 🔐 Admin only |
| POST `/api/queue/relink-orphans` | 🔐 Admin only |

---

## List queue

Returns the current download queue.

```
GET /api/queue
```

### Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by a single [queue status](#queue-status-values), or `all` |
| mediaType | string | No | `movie`, `tv`, or `all` |
| clientId | string | No | Filter by download client ID |
| includeTerminal | boolean | No | Include `imported`/`removed` items (default: false, terminal items excluded) |

### Queue status values

| Status | Description |
|--------|-------------|
| `queued` | Added to queue, waiting to start |
| `downloading` | Actively downloading |
| `stalled` | Download stalled (no seeders/peers available) |
| `awaiting` | Download vanished from client, auto-retrying |
| `paused` | Download paused |
| `completed` | Download finished, waiting for import |
| `postprocessing` | Post-processing in progress (usenet extraction/repair) |
| `importing` | Import in progress |
| `imported` | Successfully imported to library (terminal) |
| `failed` | Failed (download or import) |
| `seeding` | Download complete, still seeding (pre-import) |
| `seeding-imported` | Imported, torrent still seeding |
| `removed` | Removed from queue (terminal) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |

### Response schema

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "downloadClientId": "string",
        "downloadId": "string",
        "title": "string",
        "indexerId": "string | null",
        "indexerName": "string | null",
        "downloadUrl": "string | null",
        "magnetUrl": "string | null",
        "protocol": "string",
        "movieId": "string | null",
        "seriesId": "string | null",
        "episodeIds": ["string"],
        "seasonNumber": "integer | null",
        "status": "string",
        "progress": "number (0.0-1.0)",
        "size": "integer | null",
        "downloadSpeed": "integer",
        "uploadSpeed": "integer",
        "eta": "integer | null",
        "ratio": "number",
        "clientDownloadPath": "string | null",
        "outputPath": "string | null",
        "importedPath": "string | null",
        "quality": "object | null",
        "addedAt": "string",
        "startedAt": "string | null",
        "completedAt": "string | null",
        "importedAt": "string | null",
        "errorMessage": "string | null",
        "importAttempts": "integer",
        "isAutomatic": "boolean",
        "isUpgrade": "boolean",
        "movie": { "id": "string", "tmdbId": "integer", "title": "string", "year": "integer | null", "posterPath": "string | null" },
        "series": { "id": "string", "tmdbId": "integer", "title": "string", "year": "integer | null", "posterPath": "string | null" },
        "downloadClient": { "id": "string", "name": "string", "implementation": "string" }
      }
    ],
    "stats": {
      "totalCount": "integer",
      "queuedCount": "integer",
      "downloadingCount": "integer",
      "stalledCount": "integer",
      "awaitingCount": "integer",
      "seedingCount": "integer",
      "pausedCount": "integer",
      "completedCount": "integer",
      "postprocessingCount": "integer",
      "importingCount": "integer",
      "failedCount": "integer",
      "totalSizeBytes": "integer",
      "totalDownloadSpeed": "integer",
      "totalUploadSpeed": "integer"
    }
  }
}
```

`downloadUrl` values are redacted (API keys stripped) before being returned. By default, `imported` and `removed` items are excluded unless `includeTerminal=true` or a specific `status` is requested.

### Example request

```bash
curl "http://localhost:3000/api/queue?status=downloading"
```

---

## Get queue item

Returns details for a specific queue item, including linked media and download client info.

```
GET /api/queue/:id
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Queue item ID |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | Queue item not found |
| 500 | Failed to fetch queue item |

### Response schema

The raw queue row plus `media` (`{ type: 'movie' | 'series', id, title, year }` or `null`) and `downloadClient` (`{ id, name, implementation }` or `null`). Unlike the list endpoint, this is not wrapped in `success`/`data`.

---

## Update queue item

Pauses or resumes a queue item.

```
PATCH /api/queue/:id
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | string | Yes | `pause` or `resume` |

Pause/resume is not supported for `debrid` protocol downloads.

### Response codes

| Code | Description |
|------|-------------|
| 200 | Action applied |
| 400 | Invalid or unsupported action |
| 404 | Queue item not found |
| 500 | Failed to update queue item |

### Response schema

```json
{
  "success": true,
  "action": "paused | resumed"
}
```

---

## Remove from queue

Removes a download from the queue, and optionally from the download client.

```
DELETE /api/queue/:id
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Queue item ID |

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| removeFromClient | boolean | No | Also remove from download client (default: true; pass `removeFromClient=false` to keep it) |
| deleteFiles | boolean | No | Delete files on the download client too (default: false) |
| blocklist | boolean | No | Add to blocklist (not yet implemented - logged only) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Removed |
| 400 | Queue item is missing a download client (when `removeFromClient=true`) |
| 404 | Queue item not found |
| 500 | Failed to delete queue item |

### Response schema

```json
{
  "success": true,
  "message": "Queue item removed"
}
```

### Example request

```bash
curl -X DELETE \
  "http://localhost:3000/api/queue/q_550e8400-e29b-41d4-a716-446655440021?removeFromClient=true"
```

---

## Retry failed item

Retries a failed download. If the download client still reports the item as completed, an import retry is attempted first; otherwise the download itself is retried (or, for `debrid` downloads, resubmitted via the debrid handler).

```
POST /api/queue/:id/retry
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Queue item ID |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Retry initiated |
| 400 | Item is not in `failed` status, max retry attempts exceeded, or a debrid configuration error |
| 404 | Queue item or download client not found |
| 409 | Debrid retry outcome is ambiguous; automatic retry was refused |
| 500 | Failed to get download client instance, or an unexpected error |

### Response schema

```json
{
  "success": "boolean",
  "message": "string",
  "retryMode": "debrid | undefined",
  "queueItem": "object",
  "error": "string"
}
```

---

## Clear failed items

Clears failed downloads from the queue.

```
POST /api/queue/clear-failed
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| olderThanDays | integer | No | Only clear items that failed more than N days ago |
| dryRun | boolean | No | Preview what would be cleared without clearing (default: false) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Cleared (or previewed, if `dryRun=true`) |
| 500 | Failed to clear items |

### Response schema

```json
{
  "success": true,
  "dryRun": "boolean",
  "olderThanDays": "integer | undefined",
  "summary": {
    "cleared": "integer",
    "total": "integer"
  },
  "cleared": ["array of cleared items"]
}
```

### Example request

```bash
curl -X POST "http://localhost:3000/api/queue/clear-failed?olderThanDays=7"
```

---

## Download history

Returns completed/removed/failed/rejected download history.

```
GET /api/queue/history
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | `imported`, `failed`, `rejected`, `removed`, or `all` |
| mediaType | string | No | `movie`, `tv`, or `all` |
| limit | integer | No | Max results (default: 50) |
| offset | integer | No | Pagination offset (default: 0) |

```
DELETE /api/queue/history
```

Clears history entries (see the route for supported query parameters).

---

## Refresh queue

Forces an immediate refresh of queue state from all download clients.

```
POST /api/queue/refresh
```

## Relink orphaned downloads

Attempts to relink queue items that have lost their association with a download client entry.

```
POST /api/queue/relink-orphans
```

---

## Real-time queue updates

There is no dedicated `/api/queue/events` SSE endpoint. Queue state changes (`queue:added`, `queue:updated`, `queue:completed`, `queue:imported`, `queue:failed`) are broadcast as part of the general activity feed:

```
GET /api/activity/stream
```

This endpoint requires no authentication and streams Server-Sent Events with activity payloads derived from queue events, not raw queue rows.

---

## Download client operations

### Test connection (unsaved config)

Tests connection settings without an existing download client record.

```
POST /api/download-clients/test
```

### Test connection (existing client)

Tests an existing download client using its stored credentials.

```
POST /api/download-clients/:id/test
```

Neither test endpoint requires authentication.

### Response codes

| Code | Description |
|------|-------------|
| 200 | Connection successful |
| 400 | Connection failed |
| 404 | Client not found (`:id` variant) |

---

## See Also

- [Search](search) - Search and grab endpoints
- [Movies](movies) - Movie library endpoints
- [TV](tv) - TV shows and episode endpoints
