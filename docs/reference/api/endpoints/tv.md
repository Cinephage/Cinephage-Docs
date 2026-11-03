---
title: TV shows and episodes
description: API endpoints for managing TV shows, seasons, and episodes
sidebar_position: 2
tags: [api, tv, series, episodes, library, endpoints, reference]
keywords: [api, tv, series, episodes, library, endpoints]
---

# TV shows and episodes

Endpoints for managing TV shows, seasons, and episodes in the Cinephage library.

## Authentication

Only the collection-level list/create endpoints (`GET`/`POST /api/library/series`) call `requireAuth` directly in the route handler. All series `:id` sub-resource endpoints, season endpoints, episode endpoints, and the `batch` endpoints have no such check in the handler itself - but none of these are actually reachable unauthenticated: a global gate in `hooks.server.ts` requires a valid session or API key on every `/api/*` route before it reaches any handler, and a GET to `/api/library/series/*` is allowed for viewer-role sessions while every write (PATCH/PUT/DELETE/POST) falls through to admin-only. See [API Authentication](/reference/api/authentication) for how that global gate works.

| Endpoint | Auth Level |
|----------|------------|
| GET `/api/library/series` | 🔐 Any session/key (viewer or admin) |
| POST `/api/library/series` | 🔐 Admin only |
| GET `/api/library/series/:id` | 🔐 Any session/key (viewer or admin) |
| PATCH / PUT `/api/library/series/:id` | 🔐 Admin only |
| DELETE `/api/library/series/:id` | 🔐 Admin only |
| POST `/api/library/series/:id/auto-search` | 🔐 Admin only |
| POST `/api/library/series/:id/refresh` | 🔐 Admin only |
| PATCH / PUT `/api/library/series/batch` | 🔐 Admin only |
| DELETE `/api/library/series/batch` | 🔐 Admin only |
| PATCH / PUT `/api/library/seasons/:id` | 🔐 Admin only |
| DELETE `/api/library/seasons/:id` | 🔐 Admin only |
| PATCH / PUT `/api/library/episodes/:id` | 🔐 Admin only |
| DELETE `/api/library/episodes/:id` | 🔐 Admin only |
| PATCH / PUT `/api/library/episodes/batch` | 🔐 Admin only |

There are no standalone `GET` endpoints for a single season or episode - season and episode data (including files and subtitles) is embedded in the [Get series](#get-series) response.

---

## Series endpoints

### List series

Returns **all** series in the library. There is no pagination, sorting, or filtering support.

```
GET /api/library/series
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Authentication required |
| 500 | Failed to fetch series |

### Response schema

```json
{
  "success": true,
  "total": "integer",
  "series": [
    {
      "id": "string",
      "tmdbId": "integer",
      "tvdbId": "integer | null",
      "imdbId": "string | null",
      "title": "string",
      "originalTitle": "string | null",
      "year": "integer | null",
      "overview": "string | null",
      "posterPath": "string | null",
      "backdropPath": "string | null",
      "status": "string",
      "network": "string | null",
      "genres": ["string"],
      "path": "string | null",
      "rootFolderId": "string | null",
      "rootFolderPath": "string | null",
      "scoringProfileId": "string | null",
      "monitored": "boolean",
      "seasonFolder": "boolean",
      "added": "string",
      "episodeCount": "integer",
      "episodeFileCount": "integer",
      "missingRootFolder": "boolean",
      "percentComplete": "integer"
    }
  ]
}
```

`posterPath`/`backdropPath` are TMDB-relative paths, not full URLs. There is no `tmdbRating`, `certification`, `nextAiring`, `previousAiring`, `totalEpisodeCount`, `seasonCount`, or `searchOnAdd` field on this list.

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/library/series"
```

---

### Create series

Adds a new TV show to the library by TMDB ID.

```
POST /api/library/series
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tmdbId | integer | Yes | TMDB series ID |
| rootFolderId | string | Yes | Root folder ID (not a path) |
| scoringProfileId | string | No | Scoring profile ID |
| monitored | boolean | No | Default: true |
| seasonFolder | boolean | No | Organize by season folders (default: true) |
| seriesType | string | No | `standard`, `anime`, or `daily` (default: `standard`) |
| monitorType | string | No | `all`, `future`, `missing`, `existing`, `firstSeason`, `lastSeason`, `recent`, `pilot`, or `none` (default: `all`) |
| monitorNewItems | string | No | `all` or `none` (default: `all`) |
| monitorSpecials | boolean | No | Monitor season 0 (default: false) |
| monitoredSeasons | integer[] | No | Explicit list of season numbers to monitor (overrides `monitorType`) |
| searchOnAdd | boolean | No | Search immediately after adding (default: true) |
| wantsSubtitles | boolean | No | Enable subtitle monitoring (default: true) |

There is no `seasonOptions` field - use `monitoredSeasons` (a flat array of season numbers) instead.

### Response codes

| Code | Description |
|------|-------------|
| 200 | Created successfully |
| 400 | Invalid request body |
| 404 | TMDB series not found |
| 409 | Series already exists in library, or a stale library configuration conflict |
| 500 | Failed to add series |

### Response schema

```json
{
  "success": true,
  "series": {
    "id": "string",
    "tmdbId": "integer",
    "title": "string",
    "year": "integer | null",
    "path": "string",
    "monitored": "boolean",
    "episodeCount": "integer",
    "searchTriggered": "boolean",
    "searchWarning": "string | undefined"
  }
}
```

### Example request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{
    "tmdbId": 1399,
    "rootFolderId": "rf_tv123",
    "monitored": true,
    "seasonFolder": true,
    "monitorType": "all"
  }' \
  http://localhost:3000/api/library/series
```

---

### Get series

Returns detailed information for a specific series, including all seasons, their episodes, files, and subtitles.

```
GET /api/library/series/:id
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Series UUID |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | Series not found |
| 500 | Failed to fetch series |

### Response schema

```json
{
  "success": true,
  "series": {
    "id": "string",
    "tmdbId": "integer",
    "tvdbId": "integer | null",
    "imdbId": "string | null",
    "providerRefs": "object",
    "title": "string",
    "originalTitle": "string | null",
    "year": "integer | null",
    "overview": "string | null",
    "posterPath": "string | null",
    "backdropPath": "string | null",
    "status": "string",
    "network": "string | null",
    "genres": ["string"],
    "path": "string | null",
    "rootFolderId": "string | null",
    "rootFolderPath": "string | null",
    "scoringProfileId": "string | null",
    "languageProfileId": "string | null",
    "monitored": "boolean",
    "seasonFolder": "boolean",
    "seriesType": "string",
    "added": "string",
    "episodeCount": "integer",
    "episodeFileCount": "integer",
    "wantsSubtitles": "boolean",
    "episodeGroupId": "string | null",
    "metadataLanguage": "string | null",
    "preferOriginalTitle": "boolean",
    "percentComplete": "integer",
    "seasons": [
      {
        "id": "string",
        "seriesId": "string",
        "seasonNumber": "integer",
        "monitored": "boolean",
        "name": "string | null",
        "overview": "string | null",
        "posterPath": "string | null",
        "airDate": "string | null",
        "episodeCount": "integer",
        "episodeFileCount": "integer",
        "episodes": [
          {
            "id": "string",
            "seriesId": "string",
            "seasonNumber": "integer",
            "episodeNumber": "integer",
            "title": "string | null",
            "overview": "string | null",
            "airDate": "string | null",
            "runtime": "integer | null",
            "monitored": "boolean",
            "hasFile": "boolean",
            "file": "object | null",
            "subtitles": ["object"],
            "subtitleCount": "integer",
            "subtitleLanguages": ["string"]
          }
        ]
      }
    ],
    "subtitleStatus": {
      "episodesMissingSubtitles": "integer",
      "totalSubtitles": "integer",
      "languages": ["string"]
    }
  }
}
```

There is no `alternativeTitles`, `actors`, `tmdbRating`, `certification`, `type` (top-level), or per-season `statistics`/`images` object.

---

### Update series

Updates series settings. `PUT` is an alias of `PATCH`.

```
PATCH /api/library/series/:id
PUT /api/library/series/:id
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| monitored | boolean | No | Monitoring status |
| scoringProfileId | string \| null | No | Scoring profile ID |
| seasonFolder | boolean | No | Season folder organization |
| seriesType | string | No | `standard`, `anime`, or `daily` |
| providerRefs | object | No | `{ tmdb?, anilist?, mal? }` |
| rootFolderId | string | No | Reassign root folder |
| wantsSubtitles | boolean | No | Subtitle monitoring |
| languageProfileId | string \| null | No | Subtitle language profile |
| delayProfileId | string \| null | No | Delay profile |
| folderPath | string | No | Relative folder name within the root folder |
| episodeGroupId | string \| null | No | TMDB episode group for alternate season ordering |
| metadataLanguage | string \| null | No | Metadata language override |
| preferOriginalTitle | boolean | No | Prefer original title for display |

There is no `path` or `qualityProfileId` field - use `folderPath` and `scoringProfileId` respectively.

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 500 | Failed to update series |

### Response schema

```json
{
  "success": true,
  "moveQueued": "boolean",
  "moveTaskId": "string | undefined",
  "moveTaskHistoryId": "string | undefined"
}
```

### Example request

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{"monitored": false}' \
  http://localhost:3000/api/library/series/770e8400-e29b-41d4-a716-446655440002
```

---

### Delete series

Deletes episode files (marks episodes as missing but keeps the series entry), or removes the series entirely with `removeFromLibrary=true`.

```
DELETE /api/library/series/:id
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deleteFiles | boolean | No | Also delete episode files from disk (default: false) |
| removeFromLibrary | boolean | No | Remove the series from the library entirely (default: false) |

There is no `deleteAddImportListExclusion` parameter.

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Series has no files to delete (and `removeFromLibrary` is not set), or read-only root folder |
| 404 | Series not found |
| 500 | Failed to delete series files |

### Example request

```bash
curl -X DELETE \
  -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/library/series/770e8400-e29b-41d4-a716-446655440002?deleteFiles=true"
```

---

### Trigger auto search

Automatically searches for and grabs releases for episodes/seasons. Returns a **Server-Sent Events stream**, not a plain JSON response.

```
POST /api/library/series/:id/auto-search
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | `episode`, `season`, `missing`, or `bulk` |
| episodeId | string | For `episode` | Single episode UUID |
| seasonNumber | integer | For `season` | Season number |
| episodeIds | string[] | For `bulk` | Episode UUIDs |

### Response codes

| Code | Description |
|------|-------------|
| 200 | SSE stream started |
| 404 | Series not found |
| 409 | A search is already in progress for this series |

### Example request

```bash
curl -N -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{"type": "season", "seasonNumber": 1}' \
  http://localhost:3000/api/library/series/770e8400-e29b-41d4-a716-446655440002/auto-search
```

---

### Refresh series metadata

Refreshes series metadata from TMDB/TVDB. Returns a **Server-Sent Events stream**.

```
POST /api/library/series/:id/refresh
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | SSE stream started |
| 404 | Series not found |
| 409 | A refresh is already in progress for this series |

### SSE event types

| Event type | Description |
|------------|-------------|
| `progress` | `{ seasonNumber, totalSeasons, message }` |
| `complete` | `{ success: true, episodeCount, episodeFileCount }` |
| `error` | `{ message }` |

### Example request

```bash
curl -N -X POST \
  -H "x-api-key: cinephage_your_key_here" \
  http://localhost:3000/api/library/series/770e8400-e29b-41d4-a716-446655440002/refresh
```

---

### Batch update series

```
PATCH /api/library/series/batch
PUT /api/library/series/batch
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| seriesIds | string[] | Yes | Series UUIDs |
| updates | object | Yes | `{ monitored?: boolean, scoringProfileId?: string \| null }` |

### Response schema

```json
{ "success": true, "updatedCount": "integer" }
```

### Batch delete series

```
DELETE /api/library/series/batch
```

Body: `{ seriesIds: string[], deleteFiles?: boolean, removeFromLibrary?: boolean }` (mirrors [Batch delete movies](movies#batch-delete-movies)).

---

## Season endpoints

### Update season monitoring

Seasons are addressed by their own UUID (from the [Get series](#get-series) response), not by `seriesId`/`seasonNumber`.

```
PATCH /api/library/seasons/:id
PUT /api/library/seasons/:id
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Season UUID |

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| monitored | boolean | No | Monitoring status |
| updateEpisodes | boolean | No | Also apply `monitored` to every episode in the season |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | No valid fields to update |
| 404 | Season not found |
| 500 | Failed to update season |

### Example request

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{"monitored": false, "updateEpisodes": true}' \
  http://localhost:3000/api/library/seasons/<season-uuid>
```

---

### Delete season files

Deletes files for a season (keeps metadata; episodes show as missing).

```
DELETE /api/library/seasons/:id
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deleteFiles | boolean | No | Also delete files from disk (default: false) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Season has no files to delete, or read-only root folder |
| 404 | Season not found |
| 500 | Failed to delete season files |

---

## Episode endpoints

### Update episode

```
PATCH /api/library/episodes/:id
PUT /api/library/episodes/:id
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Episode UUID |

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| monitored | boolean | No | Monitoring status |
| wantsSubtitlesOverride | boolean \| null | No | Override series subtitle preference (`null` inherits from series) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | No valid fields to update |
| 404 | Episode not found |
| 500 | Failed to update episode |

### Example request

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{"monitored": false}' \
  http://localhost:3000/api/library/episodes/880e8400-e29b-41d4-a716-446655440003
```

---

### Delete episode files

Deletes files for an episode (keeps metadata; episode shows as missing).

```
DELETE /api/library/episodes/:id
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deleteFiles | boolean | No | Also delete files from disk (default: false) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Episode has no files to delete, or read-only root folder |
| 404 | Episode not found |
| 500 | Failed to delete episode files |

---

### Batch update episodes

```
PATCH /api/library/episodes/batch
PUT /api/library/episodes/batch
```

### Request body schema

Either target explicit episode IDs, or a series (optionally scoped to one season):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| monitored | boolean | Yes | New monitoring state |
| episodeIds | string[] | One of `episodeIds` or `seriesId` required | Explicit episode UUIDs |
| seriesId | string | (see above) | Update all episodes in this series |
| seasonNumber | integer | No | Restrict `seriesId` update to one season |

### Response schema

```json
{ "success": true, "updatedCount": "integer" }
```

---

## Series status values

Series `status` comes directly from TMDB (e.g. `Returning Series`, `Ended`, `Canceled`, `In Production`) - it is not normalized to a fixed enum by Cinephage.

## Series types

| Type | Description |
|------|-------------|
| `standard` | Standard weekly series |
| `daily` | Daily series |
| `anime` | Anime series with absolute numbering |

## See Also

- [Movies](movies) - Movie endpoints
- [Search](search) - Search and download endpoints
