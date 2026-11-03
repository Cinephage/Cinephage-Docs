---
title: Tasks
description: API endpoints for managing scheduled tasks
sidebar_position: 11
tags: [api, tasks, monitoring, endpoints, reference]
keywords: [api, tasks, monitoring, endpoints]
---

# Tasks

Endpoints for managing scheduled monitoring/maintenance tasks in Cinephage. Tasks handle automated operations like searching for missing content, upgrades, and subtitle searches.

## Authentication

Only `POST /api/tasks/:taskId/run` calls `requireAdmin` directly in the route handler. The others have no such check in the handler itself - but none of these are actually reachable unauthenticated: a global gate in `hooks.server.ts` requires a valid session or API key on every `/api/*` route before it reaches any handler, and `/api/tasks/*` is not on the viewer read-only allowlist, so these are **admin-only** across the board, including the GET endpoints. See [API Authentication](/reference/api/authentication) for how that global gate works.

| Endpoint | Auth Level |
|----------|------------|
| GET `/api/tasks` | 🔐 Admin only |
| GET `/api/tasks/stream` | 🔐 Admin only |
| POST `/api/tasks/:taskId/run` | 🔐 Admin only |
| POST `/api/tasks/:taskId/cancel` | 🔐 Admin only |
| PUT `/api/tasks/:taskId/enabled` | 🔐 Admin only |
| PUT `/api/tasks/:taskId/interval` | 🔐 Admin only |
| GET `/api/tasks/:taskId/history` | 🔐 Admin only |
| GET `/api/tasks/history/:historyId/activity` | 🔐 Admin only |

---

## List tasks

Returns all registered tasks (both scheduled and maintenance) with their current runtime status.

```
GET /api/tasks
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |

### Response schema

```json
{
  "success": true,
  "tasks": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "scheduled | maintenance",
      "runEndpoint": "string",
      "intervalKey": "string | undefined",
      "defaultIntervalHours": "number | undefined",
      "minIntervalHours": "number | undefined",
      "intervalEditable": "boolean | undefined",
      "lastRunTime": "string | null",
      "nextRunTime": "string | null",
      "intervalHours": "number | null",
      "isRunning": "boolean",
      "enabled": "boolean"
    }
  ]
}
```

`nextRunTime` and `intervalHours` are always `null` for `maintenance` category tasks (they have no automatic schedule). There is no `type`, `interval`/`intervalUnit`, `status`, `supportsCancel`, or `supportsHistory` field.

### Built-in tasks

Task IDs are lower/camelCase strings, not `PascalCase` and not prefixed with `task_`:

| Task ID | Category | Description |
|---------|----------|-------------|
| `missing` | scheduled | Search for missing movies/episodes |
| `upgrade` | scheduled | Search for quality upgrades |
| `newEpisode` | scheduled | Detect and search for new episodes |
| `cutoffUnmet` | scheduled | Search for items below quality cutoff |
| `pendingRelease` | scheduled | Monitor pending releases |
| `smartListRefresh` | scheduled | Refresh smart list contents |
| `missingSubtitles` | scheduled | Search for missing subtitles |
| `subtitleUpgrade` | scheduled | Search for better subtitles |
| `library-reconcile` | scheduled | Reconcile library state |
| `historyCleanup` | scheduled | Clean up old history entries |
| `dbBackup` | scheduled | Back up the database |
| `library-scan` | maintenance | Scan root folders for media |
| `update-strm-urls` | maintenance | Update `.strm` file URLs |
| `reprobe-strm-media-info` | maintenance | Re-probe media info for `.strm` files |
| `metadata-refresh` | maintenance | Refresh metadata from providers |
| `regenerate-sidecars` | maintenance | Regenerate NFO/artwork sidecar files |

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/tasks"
```

---

## Task events stream

Real-time SSE stream for task status updates.

```
GET /api/tasks/stream
```

### Event types

| Event | Payload | Description |
|-------|---------|-------------|
| `task:started` | `{ taskId, startedAt }` | Task execution started (scheduled or manual) |
| `task:completed` | `{ taskId, completedAt, lastRunTime, nextRunTime, result?, historyEntry? }` | Task finished successfully |
| `task:failed` | `{ taskId, completedAt, error, historyEntry? }` | Task failed |
| `task:cancelled` | `{ taskId, cancelledAt }` | A running task was cancelled |
| `task:updated` | `{ taskId, enabled?, intervalHours?, nextRunTime? }` | Task settings changed (enable/disable, interval) |

There is no `task:progress` or `task:error` event - use `task:failed` instead of `task:error`.

### Example event

```
event: task:started
data: {"taskId":"upgrade","startedAt":"2024-06-20T10:00:00.000Z"}
```

---

## Run task

Triggers immediate execution of a task and tracks it in history.

```
POST /api/tasks/:taskId/run
```

### Path parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task identifier (see [Built-in tasks](#built-in-tasks)) |

This endpoint takes no request body fields of its own (a streaming API key is looked up and forwarded automatically for `update-strm-urls`).

### Response codes

| Code | Description |
|------|-------------|
| 200 | Task ran (check `success` in the body for the task's own result) |
| 400 | Media Streaming API Key not found (for `update-strm-urls`) |
| 401 | Authentication required |
| 403 | Admin role required |
| 404 | Task not found |
| 409 | Task is already running |
| 500 | Failed to start or execute the task |

### Response schema

```json
{
  "success": "boolean",
  "historyId": "string",
  "error": "string | undefined"
}
```

The task endpoint's own response fields are spread alongside `success`/`historyId`.

### Example request

```bash
curl -X POST \
  -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/tasks/upgrade/run"
```

---

## Cancel task

Cancels a running task.

```
POST /api/tasks/:taskId/cancel
```

### Path parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task identifier |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Cancellation successful |
| 400 | Task is not running |
| 404 | Task not found |
| 500 | Failed to cancel task |

### Response schema

```json
{ "success": true, "message": "Task 'upgrade' cancelled" }
```

### Example request

```bash
curl -X POST \
  -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/tasks/upgrade/cancel"
```

---

## Toggle task enabled

Enables or disables a task.

```
PUT /api/tasks/:taskId/enabled
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | Yes | Enable or disable the task |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Task updated |
| 400 | Invalid body |
| 404 | Task not found |

### Response schema

```json
{ "success": true, "taskId": "missingSubtitles", "enabled": false }
```

### Example request

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{"enabled": false}' \
  "http://localhost:3000/api/tasks/missingSubtitles/enabled"
```

---

## Update task interval

Changes the execution interval for a scheduled task, in hours (not minutes/hours/days units).

```
PUT /api/tasks/:taskId/interval
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| intervalHours | number | Yes | New interval in hours; must be positive and at least the task's `minIntervalHours` |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Interval updated |
| 400 | Invalid interval, task is not a scheduled task, or its interval is not editable |
| 404 | Task not found |

### Response schema

```json
{ "success": true, "taskId": "missingSubtitles", "intervalHours": 12 }
```

### Example request

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{"intervalHours": 12}' \
  "http://localhost:3000/api/tasks/missingSubtitles/interval"
```

---

## Get task history

Returns paginated execution history for a task.

```
GET /api/tasks/:taskId/history
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Entries to return, max 100 (default: 10) |
| offset | integer | No | Entries to skip (default: 0) |

There is no `page` parameter or `status` filter, and the default `limit` is 10, not 20.

### Response schema

```json
{
  "success": true,
  "taskId": "string",
  "history": ["array of task history entries"],
  "pagination": {
    "limit": "integer",
    "offset": "integer",
    "total": "integer",
    "hasMore": "boolean"
  }
}
```

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/tasks/missingSubtitles/history?limit=10"
```

---

## Get task history activity

Returns detailed per-item activity (from the monitoring history table) for a task execution.

```
GET /api/tasks/history/:historyId/activity
```

### Path parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| historyId | string | Yes | Task history entry ID (from [Get task history](#get-task-history)) |

There is no pagination on this endpoint - it returns all activity entries for the run.

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Missing `historyId` |
| 500 | Failed to fetch activity |

### Response schema

```json
{
  "success": true,
  "total": "integer",
  "activity": [
    {
      "id": "string",
      "taskType": "string",
      "status": "string",
      "releasesFound": "integer",
      "releaseGrabbed": "string | null",
      "isUpgrade": "boolean",
      "oldScore": "number | null",
      "newScore": "number | null",
      "errorMessage": "string | null",
      "executedAt": "string",
      "mediaType": "movie | episode | unknown",
      "mediaTitle": "string",
      "mediaId": "string | null",
      "seasonNumber": "integer | null",
      "episodeNumber": "integer | null",
      "seriesTitle": "string | null"
    }
  ]
}
```

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/tasks/history/<historyId>/activity"
```

## See Also

- [Monitoring](/guides/configure/system/settings-system) - Task configuration in settings
- [Search and Download](/guides/use/search-and-download) - Manual search operations
- [Subtitles](/guides/configure/languages/subtitles) - Subtitle task configuration
