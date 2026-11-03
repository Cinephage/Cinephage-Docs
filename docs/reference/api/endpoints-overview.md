---
title: API endpoints
description: Complete reference for all Cinephage API endpoints
sidebar_position: 1
tags: [api, endpoints, reference, rest]
keywords: [api, endpoints, rest, reference]
---

# API endpoints

This reference documents all available Cinephage API endpoints organized by category.

## Authentication

See [Authentication](authentication) for auth requirements and API key usage.

| Symbol | Meaning                |
| ------ | ---------------------- |
| 🔓     | Public (no auth)       |
| 🔐     | Authenticated required |
| 👑     | Admin required         |

:::warning[🔓 is rare in practice, and 🔐 usually means admin-only too]
A global check in `hooks.server.ts` requires a valid session or API key on every `/api/*` route before it reaches the handler - only `/health`, `/api/health`, `/api/ready`, `/api/radarr/ping`, `/api/sonarr/ping`, and `/api/auth/*` are actually exempt. On top of that, a second gate confines any non-admin session to a small read-only allowlist (discover, TMDB, calendar, library movies/series reads, system status, and self-scoped `/api/user/*` and `/api/requests` routes) - **everything else under `/api/`, including most routes marked 🔐 below, actually requires the admin role**, not just "any authenticated user." See [Authentication](authentication#common-endpoint-patterns) for the exact allowlist. The 🔓/🔐/👑 symbols throughout this table have not been re-audited row-by-row against this - treat none of them as reliable for distinguishing "any session" from "admin only."
:::

## System Endpoints

| Method | Endpoint              | Auth | Description                    |
| ------ | --------------------- | ---- | ------------------------------ |
| GET    | `/api/health`         | 🔓   | Health check (DB, services)    |
| GET    | `/api/ready`          | 🔓   | Readiness check for orchestration |
| GET    | `/api/system/status`  | 🔓   | Background services status     |
| GET    | `/api/system/github-release` | 🔓 | Latest GitHub release info (update check) |

:::info[Admin Authorization (v0.5.0+)]
Many endpoints now require admin authorization (👑). Ensure your API key has admin privileges for these endpoints.
:::

## Radarr/Sonarr compatibility layer

:::info[Dev preview only]
Not yet in a stable release - available on the `dev` Docker tag only. See [Release History](/support/releases) for channel details.
:::

Cinephage also exposes a Radarr-compatible API at `/api/radarr` and a Sonarr-compatible API at `/api/sonarr`, mirroring the real Radarr/Sonarr v3 API shape rather than Cinephage's own native API conventions documented below. This is a separate surface for third-party tools (autobrr, Pulsarr, Notifiarr, Overseerr/Jellyseerr) - see [Configure Radarr/Sonarr compatibility](/guides/configure/system/arr-compat) for what's supported and how to enable it.

## Activity

| Method | Endpoint                  | Auth | Description                    |
| ------ | ------------------------- | ---- | ------------------------------ |
| GET    | `/api/activity`           | 🔓   | Activity with filtering        |
| DELETE | `/api/activity`           | 👑   | Bulk delete history            |
| GET    | `/api/activity/settings`  | 🔓   | Activity settings              |
| PUT    | `/api/activity/settings`  | 👑   | Update activity settings       |
| GET    | `/api/activity/stream`    | 🔓   | SSE stream for real-time updates |
| GET    | `/api/activity/stats`     | 🔓   | Activity statistics            |
| POST   | `/api/activity/history/bulk`| 👑 | Bulk history actions           |

## Library

### Movies

| Method | Endpoint                          | Auth | Description                    |
| ------ | --------------------------------- | ---- | ------------------------------ |
| GET    | `/api/library/movies`             | 🔐   | List all movies                |
| POST   | `/api/library/movies`             | 🔐   | Add movie to library           |
| GET    | `/api/library/movies/[id]`        | 🔐   | Get movie details              |
| PUT    | `/api/library/movies/[id]`        | 🔐   | Update movie                   |
| DELETE | `/api/library/movies/[id]`        | 🔐   | Remove movie                   |
| POST   | `/api/library/movies/[id]/refresh`| 🔐   | Refresh movie metadata         |
| POST   | `/api/library/movies/[id]/auto-search` | 🔐 | Trigger auto search        |
| GET    | `/api/library/movies/[id]/stream` | 🔓   | SSE for movie updates          |
| PUT    | `/api/library/movies/bulk`        | 🔐   | Bulk edit movies               |

### Series & episodes

| Method | Endpoint                          | Auth | Description                    |
| ------ | --------------------------------- | ---- | ------------------------------ |
| GET    | `/api/library/series`             | 🔐   | List all series                |
| POST   | `/api/library/series`             | 🔐   | Add series to library          |
| GET    | `/api/library/series/[id]`        | 🔐   | Get series details             |
| PUT    | `/api/library/series/[id]`        | 🔐   | Update series                  |
| DELETE | `/api/library/series/[id]`        | 🔐   | Remove series                  |
| POST   | `/api/library/series/[id]/refresh`| 🔐   | Refresh series metadata        |
| GET    | `/api/library/series/[id]/stream` | 🔓   | SSE for series updates         |
| GET    | `/api/library/episodes/[id]`      | 🔐   | Get episode details            |
| PUT    | `/api/library/episodes/[id]`      | 🔐   | Update episode                 |

### Library operations

| Method | Endpoint                          | Auth | Description                    |
| ------ | --------------------------------- | ---- | ------------------------------ |
| POST   | `/api/library/scan`               | 👑   | Trigger library scan           |
| GET    | `/api/library/scan/status`        | 🔓   | Get scan status                |
| GET    | `/api/library/status`             | 🔓   | Library status summary         |
| GET    | `/api/library/unmatched`          | 🔐   | List unmatched files           |
| POST   | `/api/library/unmatched/match`    | 🔐   | Manual match                   |
| POST   | `/api/library/import/detect`      | 🔐   | Detect import candidates       |
| POST   | `/api/library/import/execute`     | 🔐   | Execute import                 |

## Search & Download

| Method | Endpoint              | Auth | Description                    |
| ------ | --------------------- | ---- | ------------------------------ |
| GET    | `/api/search`         | 🔐   | Search releases                |
| POST   | `/api/download/grab`  | 🔐   | Grab release for download      |

## Queue

| Method | Endpoint              | Auth | Description                    |
| ------ | --------------------- | ---- | ------------------------------ |
| GET    | `/api/queue`          | 🔐   | List download queue            |
| GET    | `/api/queue/[id]`     | 🔐   | Get queue item                 |
| PATCH  | `/api/queue/[id]`     | 🔐   | Update queue item              |
| DELETE | `/api/queue/[id]`     | 🔐   | Remove from queue              |
| POST   | `/api/queue/[id]/retry`| 🔐  | Retry failed item              |
| POST   | `/api/queue/clear-failed` | 🔐 | Clear failed queue items  |
| POST   | `/api/queue/refresh`  | 🔐   | Refresh queue from download clients |
| POST   | `/api/queue/relink-orphans` | 🔐 | Relink orphaned downloads to queue rows |
| GET    | `/api/queue/history`  | 🔐   | Download history               |
| DELETE | `/api/queue/history`  | 🔐   | Clear download history         |

There is no SSE endpoint for queue events specifically - real-time queue updates arrive via `/api/activity/stream`.

## Indexers

| Method | Endpoint                      | Auth | Description                    |
| ------ | ----------------------------- | ---- | ------------------------------ |
| GET    | `/api/indexers`               | 🔓   | List all indexers              |
| POST   | `/api/indexers`               | 👑   | Create indexer                 |
| GET    | `/api/indexers/[id]`          | 🔓   | Get indexer                    |
| PUT    | `/api/indexers/[id]`          | 👑   | Update indexer                 |
| DELETE | `/api/indexers/[id]`          | 👑   | Delete indexer                 |
| GET    | `/api/indexers/definitions`   | 🔓   | List indexer definitions       |
| POST   | `/api/indexers/test`          | 👑   | Test indexer connection        |

## Download Clients

| Method | Endpoint                          | Auth | Description                |
| ------ | --------------------------------- | ---- | -------------------------- |
| GET    | `/api/download-clients`           | 🔓   | List all clients           |
| POST   | `/api/download-clients`           | 👑   | Create client              |
| GET    | `/api/download-clients/[id]`      | 🔓   | Get client                 |
| PUT    | `/api/download-clients/[id]`      | 👑   | Update client              |
| DELETE | `/api/download-clients/[id]`      | 👑   | Delete client              |
| POST   | `/api/download-clients/[id]/test` | 👑   | Test client connection     |

## Live TV

### Accounts

| Method | Endpoint                        | Auth | Description                |
| ------ | ------------------------------- | ---- | -------------------------- |
| GET    | `/api/livetv/accounts`          | 🔓   | List LiveTV accounts       |
| POST   | `/api/livetv/accounts`          | 👑   | Create account             |
| GET    | `/api/livetv/accounts/[id]`     | 🔓   | Get account                |
| PUT    | `/api/livetv/accounts/[id]`     | 👑   | Update account             |
| DELETE | `/api/livetv/accounts/[id]`     | 👑   | Delete account             |
| POST   | `/api/livetv/accounts/[id]/test`| 👑   | Test account connection    |
| GET    | `/api/livetv/accounts/stream`   | 🔓   | SSE for account updates    |

### Channels & EPG

| Method | Endpoint                        | Auth | Description                |
| ------ | ------------------------------- | ---- | -------------------------- |
| GET    | `/api/livetv/channels`          | 🔓   | List channels              |
| POST   | `/api/livetv/channels/sync`     | 👑   | Trigger channel sync       |
| GET    | `/api/livetv/channels/stream`   | 🔓   | SSE for channel updates    |
| GET    | `/api/livetv/epg.xml`           | 🔓   | XMLTV EPG feed             |
| GET    | `/api/livetv/epg/guide`         | 🔓   | Full EPG guide             |
| GET    | `/api/livetv/epg/status`        | 🔓   | EPG sync status            |
| POST   | `/api/livetv/epg/sync`          | 👑   | Trigger EPG sync           |

### Lineup & playlist

| Method | Endpoint                        | Auth | Description                |
| ------ | ------------------------------- | ---- | -------------------------- |
| GET    | `/api/livetv/lineup`            | 🔓   | List lineup items          |
| POST   | `/api/livetv/lineup/reorder`    | 👑   | Reorder lineup             |
| GET    | `/api/livetv/playlist.m3u`      | 🔓   | M3U playlist export        |
| GET    | `/api/livetv/stream/[lineupId]` | 🔓   | Stream channel             |

### Portals (Stalker)

| Method | Endpoint                              | Auth | Description              |
| ------ | ------------------------------------- | ---- | ------------------------ |
| GET    | `/api/livetv/portals`                 | 🔓   | List portals             |
| POST   | `/api/livetv/portals`                 | 👑   | Create portal            |
| POST   | `/api/livetv/portals/[id]/scan`       | 👑   | Trigger portal scan      |
| GET    | `/api/livetv/portals/[id]/scan/results`| 🔓  | Scan results             |
| POST   | `/api/livetv/portals/detect`          | 👑   | Detect portal type       |

## Cinephage Network

Config and status for the built-in "Cinephage Streaming" module, which streams content from your local library and resolves VOD sources via the Cinephage network (registers itself as a special-purpose indexer internally).

| Method | Endpoint                              | Auth | Description              |
| ------ | -------------------------------------- | ---- | ------------------------ |
| GET    | `/api/cinephage`                      | 👑   | Full subsystem state (config, identity, per-module status) |
| PUT    | `/api/cinephage/config`               | 👑   | Update config             |
| POST   | `/api/cinephage/test`                 | 👑   | Test connectivity         |
| PUT    | `/api/cinephage/modules/[moduleId]`   | 👑   | Enable/disable a module   |

## Subtitles

### Providers

| Method | Endpoint                          | Auth | Description                |
| ------ | --------------------------------- | ---- | -------------------------- |
| GET    | `/api/subtitles/providers`        | 🔓   | List subtitle providers    |
| POST   | `/api/subtitles/providers`        | 🔐   | Create provider            |
| GET    | `/api/subtitles/providers/[id]`   | 🔓   | Get provider               |
| PUT    | `/api/subtitles/providers/[id]`   | 👑   | Update provider            |
| DELETE | `/api/subtitles/providers/[id]`   | 👑   | Delete provider            |
| POST   | `/api/subtitles/providers/test`   | 👑   | Test provider              |
| POST   | `/api/subtitles/providers/reorder`| 👑   | Reorder providers          |

### Subtitles

| Method | Endpoint                          | Auth | Description                |
| ------ | --------------------------------- | ---- | -------------------------- |
| GET    | `/api/subtitles/media`            | 🔓   | Get media subtitles        |
| POST   | `/api/subtitles/search`           | 👑   | Search subtitles           |
| POST   | `/api/subtitles/download`         | 👑   | Download subtitle          |
| POST   | `/api/subtitles/sync`             | 👑   | Sync subtitles             |
| POST   | `/api/subtitles/sync/bulk`        | 👑   | Bulk sync subtitles        |
| DELETE | `/api/subtitles/[id]`             | 👑   | Delete subtitle            |

:::warning[API Change (v0.5.0+)]
The `/api/subtitles/providers/analytics` endpoint response shape has changed:
- Analytics object (successRate, responseTimes) removed
- Provider fields are now at top level
- Throttle state now includes `consecutiveFailures`, `lastError`, `lastErrorAt`
:::

### Language profiles

| Method | Endpoint                              | Auth | Description              |
| ------ | ------------------------------------- | ---- | ------------------------ |
| GET    | `/api/subtitles/language-profiles`    | 🔓   | List language profiles   |
| POST   | `/api/subtitles/language-profiles`    | 👑   | Create profile           |
| GET    | `/api/subtitles/language-profiles/[id]`| 🔓  | Get profile              |
| PUT    | `/api/subtitles/language-profiles/[id]`| 👑  | Update profile           |
| DELETE | `/api/subtitles/language-profiles/[id]`| 👑  | Delete profile           |

## Streaming

| Method | Endpoint                              | Auth | Description              |
| ------ | ------------------------------------- | ---- | ------------------------ |
| GET    | `/api/streaming/proxy`                | 🔓   | Proxy stream             |
| GET    | `/api/streaming/resolve/movie/[tmdbId]`| 🔓  | Resolve movie stream     |
| GET    | `/api/streaming/resolve/tv/[tmdbId]/[season]/[episode]`| 🔓 | Resolve TV stream |
| GET    | `/api/streaming/status`               | 🔓   | Streaming status         |
| POST   | `/api/streaming/verify`               | 🔓   | Verify stream URL        |

### NZB Streaming

| Method | Endpoint                          | Auth | Description                |
| ------ | --------------------------------- | ---- | -------------------------- |
| GET    | `/api/streaming/usenet/[mountId]/[fileIndex]`| 🔓 | Stream usenet file |
| POST   | `/api/streaming/usenet/[mountId]/check`| 🔓 | Check usenet mount     |
| GET    | `/api/streaming/usenet/cache`     | 🔓   | Usenet cache status        |

## Smart Lists

| Method | Endpoint                      | Auth | Description                |
| ------ | ----------------------------- | ---- | -------------------------- |
| GET    | `/api/smartlists`             | 🔓   | List smart lists           |
| POST   | `/api/smartlists`             | 🔐   | Create smart list          |
| GET    | `/api/smartlists/[id]`        | 🔓   | Get smart list             |
| PUT    | `/api/smartlists/[id]`        | 🔐   | Update smart list          |
| DELETE | `/api/smartlists/[id]`        | 🔐   | Delete smart list          |
| GET    | `/api/smartlists/[id]/items`  | 🔓   | Get list items             |
| POST   | `/api/smartlists/[id]/refresh`| 🔐   | Refresh list               |
| POST   | `/api/smartlists/refresh-all` | 🔐   | Refresh all lists          |

## Tasks

| Method | Endpoint                      | Auth | Description                |
| ------ | ----------------------------- | ---- | -------------------------- |
| GET    | `/api/tasks`                  | 🔓   | List all tasks             |
| GET    | `/api/tasks/stream`           | 🔓   | SSE for task updates       |
| POST   | `/api/tasks/[taskId]/run`     | 👑   | Run task now               |
| POST   | `/api/tasks/[taskId]/cancel`  | 👑   | Cancel task                |
| PUT    | `/api/tasks/[taskId]/enabled` | 👑   | Toggle task enabled        |
| PUT    | `/api/tasks/[taskId]/interval`| 👑   | Update task interval       |
| GET    | `/api/tasks/[taskId]/history` | 🔓   | Task history               |

## Monitoring

| Method | Endpoint                          | Auth | Description              |
| ------ | --------------------------------- | ---- | ------------------------ |
| GET    | `/api/monitoring/status`          | 🔓   | Monitoring status        |
| GET    | `/api/monitoring/settings`        | 🔓   | Monitoring settings      |
| PUT    | `/api/monitoring/settings`        | 👑   | Update settings          |
| POST   | `/api/monitoring/search/missing`  | 👑   | Search missing           |
| POST   | `/api/monitoring/search/upgrade`  | 👑   | Search upgrades          |

## Calendar

| Method | Endpoint                  | Auth | Description              |
| ------ | -------------------------- | ---- | ------------------------ |
| GET    | `/api/calendar`           | 🔓   | Calendar events for a date range |
| GET    | `/api/calendar/upcoming`  | 🔓   | Upcoming releases        |

## Reports

| Method | Endpoint                                  | Auth | Description              |
| ------ | ------------------------------------------ | ---- | ------------------------ |
| GET    | `/api/reports/[type]`                     | 🔓   | Report rows by type (`unmatched`, `rejected-releases`, `import-failures`, `renaming-failures`) |
| PATCH  | `/api/reports/[type]`                     | 🔓   | Bulk-update report rows  |
| GET    | `/api/reports/summary`                    | 🔓   | Summary counts across all report types |
| GET    | `/api/reports/unmatched-stats`            | 🔓   | Unmatched-files stats    |
| GET    | `/api/reports/rejected-stats`             | 🔓   | Rejected-release stats   |
| GET    | `/api/reports/import-failures-stats`      | 🔓   | Import-failure stats     |
| GET    | `/api/reports/renaming-failures-stats`    | 🔓   | Renaming-failure stats   |
| POST   | `/api/reports/rejected-releases/[id]/override` | 🔓 | Force-grab a rejected release |
| POST   | `/api/reports/import-failures/[id]/retry` | 🔓   | Retry a failed import    |
| POST   | `/api/reports/renaming-failures/[id]/retry` | 🔓 | Retry a failed rename    |

## Storage

| Method | Endpoint                              | Auth | Description              |
| ------ | -------------------------------------- | ---- | ------------------------ |
| GET    | `/api/storage/insights`               | 🔓   | Storage insights (large/duplicate/stale items) |
| GET    | `/api/storage/insights/stream`        | 🔓   | SSE for insight updates  |
| GET    | `/api/storage/insights/[id]/items`    | 🔓   | Items behind one insight |
| POST   | `/api/storage/insights/[id]/dismiss`  | 🔓   | Dismiss an insight       |
| POST   | `/api/storage/insights/[id]/undismiss`| 🔓   | Restore a dismissed insight |
| POST   | `/api/storage/reconcile`              | 👑   | Reconcile on-disk state with the library |

## Settings

| Method | Endpoint                          | Auth | Description              |
| ------ | --------------------------------- | ---- | ------------------------ |
| GET    | `/api/settings/tmdb`              | 👑   | Whether a TMDB API key override is configured |
| PUT    | `/api/settings/tmdb`              | 👑   | Set TMDB API key override |
| GET    | `/api/settings/filters`           | 👑   | Get global TMDB discover filters (adult content, vote thresholds, excluded genres) |
| PUT    | `/api/settings/filters`           | 👑   | Update global TMDB discover filters |
| GET    | `/api/settings/external-url`      | 👑   | Get external URL         |
| PUT    | `/api/settings/external-url`      | 👑   | Update external URL      |
| GET    | `/api/settings/logs/settings`     | 👑   | Get log settings (retention, min level) |
| PUT    | `/api/settings/logs/settings`     | 👑   | Update log settings      |
| GET    | `/api/settings/logs/history`      | 👑   | Query historical log entries |
| DELETE | `/api/settings/logs/history`      | 👑   | Clear log history        |
| GET    | `/api/settings/logs/stream`       | 👑   | SSE for log stream       |
| GET    | `/api/settings/logs/download`     | 👑   | Download logs            |
| POST   | `/api/settings/logs/client-report`| 🔓   | Client-side (browser) error report submission |

The following two settings endpoints are **dev preview only** (not yet in a stable release):

| Method | Endpoint                          | Auth | Description              |
| ------ | --------------------------------- | ---- | ------------------------ |
| GET    | `/api/settings/arr-compat`        | 👑   | Get Radarr/Sonarr compatibility toggle |
| PUT    | `/api/settings/arr-compat`        | 👑   | Enable/disable Radarr/Sonarr compatibility |
| GET    | `/api/settings/sidecar`           | 👑   | Get sidecar (NFO/artwork) settings |
| PUT    | `/api/settings/sidecar`           | 👑   | Update sidecar settings  |

### Backup & restore

| Method | Endpoint                              | Auth | Description              |
| ------ | ------------------------------------- | ---- | ------------------------ |
| POST   | `/api/settings/system/backup`         | 👑   | Create configuration backup |
| PUT    | `/api/settings/system/backup`         | 👑   | Update backup settings   |
| GET    | `/api/settings/system/db-backup`      | 👑   | Get database backup settings |
| PUT    | `/api/settings/system/db-backup`      | 👑   | Update database backup settings |
| POST   | `/api/settings/system/db-backup/run`  | 👑   | Run a database backup now |
| GET    | `/api/settings/system/db-backup/list` | 👑   | List database backups    |

There is no restore-from-backup endpoint - restoring is done by placing a backup file back into Cinephage's data directory before startup, not through the API.

### API keys

| Method | Endpoint                              | Auth | Description            |
| ------ | ------------------------------------- | ---- | ---------------------- |
| GET    | `/api/settings/system/api-keys`       | 👑   | List API keys          |
| POST   | `/api/settings/system/api-keys`       | 👑   | Generate API keys      |
| POST   | `/api/settings/system/api-keys/[id]/regenerate`| 🔐 | Regenerate key (any authenticated user, not admin-only) |

## User

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| POST   | `/api/user/language`      | 🔐   | Set the current user's UI language |
| PUT    | `/api/user/language`      | 🔐   | Same as POST              |

## Root Folders

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| GET    | `/api/root-folders`       | 🔓   | List Root Folders        |
| POST   | `/api/root-folders`       | 👑   | Create root folder       |
| GET    | `/api/root-folders/[id]`  | 🔓   | Get folder               |
| PUT    | `/api/root-folders/[id]`  | 👑   | Update folder            |
| DELETE | `/api/root-folders/[id]`  | 👑   | Delete folder            |
| POST   | `/api/root-folders/validate`| 👑  | Validate folder path     |

## Quality & Scoring

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| GET    | `/api/quality-presets`    | 🔓   | List quality presets     |
| GET    | `/api/scoring-profiles`   | 🔓   | List Quality Profiles    |
| POST   | `/api/scoring-profiles`   | 👑   | Create scoring profile   |

### Custom formats

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| GET    | `/api/custom-formats`     | 🔓   | List Custom Formats      |
| POST   | `/api/custom-formats`     | 👑   | Create custom format     |
| PUT    | `/api/custom-formats`     | 👑   | Update custom format     |
| DELETE | `/api/custom-formats`     | 👑   | Delete custom format     |

## Naming

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| GET    | `/api/naming`             | 🔓   | Get naming config        |
| PUT    | `/api/naming`             | 👑   | Update naming config     |
| GET    | `/api/naming/presets`     | 🔓   | List naming presets      |
| GET    | `/api/naming/tokens`      | 🔓   | List naming tokens       |
| POST   | `/api/naming/preview`     | 🔓   | Preview naming           |

### Rename operations

| Method | Endpoint                      | Auth | Description            |
| ------ | ----------------------------- | ---- | ---------------------- |
| POST   | `/api/rename/preview`         | 🔓   | Preview renames        |
| POST   | `/api/rename/execute`         | 👑   | Execute renames        |

## Notifications (Media Servers)

| Method | Endpoint                              | Auth | Description            |
| ------ | ------------------------------------- | ---- | ---------------------- |
| GET    | `/api/notifications/mediabrowser`     | 🔓   | List media servers     |
| POST   | `/api/notifications/mediabrowser`     | 👑   | Create server          |
| PUT    | `/api/notifications/mediabrowser/[id]`| 👑   | Update server          |
| DELETE | `/api/notifications/mediabrowser/[id]`| 👑   | Delete server          |
| POST   | `/api/notifications/mediabrowser/[id]/test`| 👑 | Test connection    |
| POST   | `/api/notifications/mediabrowser/trigger`| 👑 | Manual refresh     |

### Media server stats

| Method | Endpoint                          | Auth | Description              |
| ------ | ----------------------------------- | ---- | ------------------------ |
| GET    | `/api/media-server-stats`         | 🔓   | Watched/library stats from connected media servers |
| POST   | `/api/media-server-stats/sync`    | 🔓   | Trigger a stats sync     |
| GET    | `/api/media-server-stats/sync/status`| 🔓 | Sync status            |
| GET    | `/api/media-server-stats/items`   | 🔓   | Per-item stats           |

## Usenet (NNTP)

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| GET    | `/api/usenet/servers`     | 🔓   | List NNTP servers        |
| POST   | `/api/usenet/servers`     | 👑   | Create NNTP server       |
| GET    | `/api/usenet/servers/[id]`| 🔓   | Get server               |
| PUT    | `/api/usenet/servers/[id]`| 👑   | Update server            |
| DELETE | `/api/usenet/servers/[id]`| 👑   | Delete server            |
| POST   | `/api/usenet/servers/[id]/test`| 👑 | Test server connection |
| POST   | `/api/usenet/servers/sync`| 👑   | Sync server connections  |

## Workers

| Method | Endpoint              | Auth | Description              |
| ------ | --------------------- | ---- | ------------------------ |
| GET    | `/api/workers`        | 🔓   | List workers             |
| DELETE | `/api/workers`        | 🔓   | Clear completed workers  |
| GET    | `/api/workers/[id]`   | 🔓   | Get worker details       |
| DELETE | `/api/workers/[id]`   | 🔓   | Cancel worker            |
| GET    | `/api/workers/config` | 🔓   | Get worker config        |

## Filesystem

| Method | Endpoint              | Auth | Description              |
| ------ | --------------------- | ---- | ------------------------ |
| GET    | `/api/filesystem/browse`| 🔐 | Browse filesystem paths |

## Discover (TMDB)

| Method | Endpoint          | Auth | Description              |
| ------ | ----------------- | ---- | ------------------------ |
| GET    | `/api/discover`   | 🔓   | Discover movies/TV       |
| GET    | `/api/discover/search`| 🔓 | Search TMDB           |

### TMDB proxy

| Method | Endpoint                              | Auth | Description              |
| ------ | -------------------------------------- | ---- | ------------------------ |
| GET    | `/api/tmdb/[...path]`                 | 🔓   | Generic TMDB API proxy   |
| GET    | `/api/tmdb/collection/search`         | 🔓   | Search TMDB collections  |
| GET    | `/api/tmdb/person/[id]/credits`       | 🔓   | Person credits           |

## Dashboard

| Method | Endpoint              | Auth | Description              |
| ------ | --------------------- | ---- | ------------------------ |
| GET    | `/api/dashboard/stream`| 🔓  | SSE for dashboard updates |

## Captcha Solver

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| GET    | `/api/captcha-solver`     | 👑   | Get solver settings      |
| PUT    | `/api/captcha-solver`     | 👑   | Update solver settings   |
| GET    | `/api/captcha-solver/health`| 👑 | Health status          |
| DELETE | `/api/captcha-solver/health`| 👑 | Reset stats            |
| POST   | `/api/captcha-solver/test`| 👑   | Test captcha solving     |
| POST   | `/api/captcha-bypass`     | 👑   | FlareSolverr-compatible endpoint (accepts `{url, cmd, maxTimeout}`) so external tools expecting a FlareSolverr instance can point at Cinephage's own captcha solver instead |

## Logos

| Method | Endpoint                      | Auth | Description            |
| ------ | ----------------------------- | ---- | ---------------------- |
| GET    | `/api/logos`                  | 🔓   | List logos             |
| POST   | `/api/logos/download`         | 👑   | Trigger logo download  |
| GET    | `/api/logos/status`           | 🔓   | Logo library status    |

## Summary

| Category        | Endpoints |
| --------------- | --------- |
| System          | 4         |
| Radarr/Sonarr compatibility | separate surface - see [Configure Radarr/Sonarr compatibility](/guides/configure/system/arr-compat) |
| Activity        | 5         |
| Library         | 25+       |
| Search/Download | 2         |
| Queue           | 10        |
| Indexers        | 7         |
| Download Clients| 6         |
| Live TV         | 30+       |
| Cinephage Network | 4       |
| Subtitles       | 20+       |
| Streaming       | 10+       |
| Smart Lists     | 9         |
| Tasks           | 7         |
| Monitoring      | 5         |
| Calendar        | 2         |
| Reports         | 10        |
| Storage         | 6         |
| Settings        | 15+       |
| User            | 2         |
| Root Folders    | 6         |
| Quality/Scoring | 6         |
| Naming          | 8         |
| Notifications   | 6         |
| Media Server Stats | 4      |
| Usenet          | 7         |
| Workers         | 5         |
| Discover/TMDB   | 5         |
| Captcha Solver/Bypass | 6   |
| **Total**       | **230+**  |

## Detailed Endpoint Documentation

For comprehensive documentation of specific endpoint categories:

| Category | Documentation |
|----------|---------------|
| Movies | [Movies](endpoints/movies) - Complete movie library API |
| TV Series | [TV](endpoints/tv) - Series, season, and episode endpoints |
| Search | [Search](endpoints/search) - Release search and grabbing |
| Downloads | [Download](endpoints/download) - Queue management |
| Settings | [Settings](endpoints/settings) - System configuration |
| Libraries | [Libraries](endpoints/libraries) - Custom library management |
| Tasks | [Tasks](endpoints/tasks) - Scheduled monitoring tasks |
| Captcha Solver | [Captcha Solver](endpoints/captcha-solver) - Cloudflare bypass |

## See Also

- [Authentication](authentication) - Auth methods and API keys
- [Rate Limiting](rate-limiting) - Rate limit configuration
- [Architecture](/explanation/architecture) - System design
