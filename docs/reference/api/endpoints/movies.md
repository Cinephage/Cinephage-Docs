---
title: Movies
description: API endpoints for managing movies in the library
sidebar_position: 1
tags: [api, movies, library, endpoints, reference]
keywords: [api, movies, library, endpoints]
---

# Movies

Endpoints for managing movies in the Cinephage library.

## Authentication

Only the collection-level list/create endpoints call `requireAuth` directly in the route handler. The `:id` sub-resource endpoints (get, update, delete, auto-search, refresh) and the `batch`/`bulk` endpoints have no such check in the handler itself - but none of these are actually reachable unauthenticated: a global gate in `hooks.server.ts` requires a valid session or API key on every `/api/*` route before it reaches any handler, and a GET to `/api/library/movies/*` is allowed for viewer-role sessions while every write (PATCH/PUT/DELETE/POST) falls through to admin-only. See [API Authentication](/reference/api/authentication) for how that global gate works.

| Endpoint | Auth Level |
|----------|------------|
| GET `/api/library/movies` | 🔐 Any session/key (viewer or admin) |
| POST `/api/library/movies` | 🔐 Admin only |
| GET `/api/library/movies/:id` | 🔐 Any session/key (viewer or admin) |
| PATCH / PUT `/api/library/movies/:id` | 🔐 Admin only |
| DELETE `/api/library/movies/:id` | 🔐 Admin only |
| POST `/api/library/movies/:id/auto-search` | 🔐 Admin only |
| POST `/api/library/movies/:id/refresh` | 🔐 Admin only |
| POST `/api/library/movies/bulk` | 🔐 Admin only |
| PATCH / PUT `/api/library/movies/batch` | 🔐 Admin only |
| DELETE `/api/library/movies/batch` | 🔐 Admin only |

---

## List movies

Returns **all** movies in the library. There is no pagination, sorting, or filtering support on this endpoint - it always returns the full list.

```
GET /api/library/movies
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Authentication required |
| 500 | Failed to fetch movies |

### Response schema

```json
{
  "success": true,
  "total": "integer",
  "movies": [
    {
      "id": "string",
      "tmdbId": "integer",
      "imdbId": "string | null",
      "title": "string",
      "originalTitle": "string | null",
      "year": "integer | null",
      "overview": "string | null",
      "posterPath": "string | null",
      "backdropPath": "string | null",
      "runtime": "integer | null",
      "genres": ["string"],
      "path": "string | null",
      "rootFolderId": "string | null",
      "rootFolderPath": "string | null",
      "scoringProfileId": "string | null",
      "desiredQualities": ["2160p | 1080p | 720p | 480p"] ,
      "monitored": "boolean",
      "minimumAvailability": "string",
      "added": "string",
      "hasFile": "boolean",
      "tmdbCollectionId": "integer | null",
      "collectionName": "string | null",
      "releaseDate": "string | null",
      "digitalReleaseDate": "string | null",
      "physicalReleaseDate": "string | null",
      "availabilityDelay": "integer",
      "missingRootFolder": "boolean",
      "files": [
        {
          "id": "string",
          "relativePath": "string",
          "size": "integer",
          "dateAdded": "string",
          "quality": "object",
          "mediaInfo": "object",
          "releaseGroup": "string | null",
          "edition": "string | null"
        }
      ]
    }
  ]
}
```

`posterPath`/`backdropPath` are TMDB-relative paths (e.g. `/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg`), not full URLs. There is no `tmdbRating`, `certification`, `titleSlug`, or `qualityScore` field on movie rows.

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/library/movies"
```

---

## Create movie

Adds a new movie to the library by TMDB ID.

```
POST /api/library/movies
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tmdbId | integer | Yes | TMDB movie ID |
| rootFolderId | string | Yes | Root folder ID (not a path) |
| scoringProfileId | string | No | Scoring/quality profile ID |
| desiredQualities | string[] | No | `2160p`/`1080p`/`720p`/`480p` for multi-quality mode |
| monitored | boolean | No | Whether to monitor for releases (default: true) |
| minimumAvailability | string | No | `announced`, `inCinemas`, or `released` (default: `released`) |
| availabilityDelay | integer | No | Days to delay availability, 0-365 (default: 0) |
| searchOnAdd | boolean | No | Search immediately after adding (default: true) |
| wantsSubtitles | boolean | No | Enable subtitle monitoring (default: true) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Created successfully |
| 400 | Invalid request body |
| 404 | TMDB movie not found |
| 409 | Movie already exists in library, or a stale library configuration conflict |
| 500 | Failed to add movie |

### Response schema

```json
{
  "success": true,
  "movie": {
    "id": "string",
    "tmdbId": "integer",
    "title": "string",
    "year": "integer | null",
    "path": "string",
    "monitored": "boolean",
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
    "tmdbId": 27205,
    "rootFolderId": "rf_abc123",
    "monitored": true,
    "searchOnAdd": true
  }' \
  http://localhost:3000/api/library/movies
```

---

## Get movie

Returns detailed information for a specific movie, including files, subtitles, and subtitle status.

```
GET /api/library/movies/:id
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Movie UUID |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | Movie not found |
| 500 | Failed to fetch movie |

### Response schema

```json
{
  "success": true,
  "movie": {
    "id": "string",
    "tmdbId": "integer",
    "imdbId": "string | null",
    "providerRefs": "object",
    "title": "string",
    "originalTitle": "string | null",
    "year": "integer | null",
    "overview": "string | null",
    "posterPath": "string | null",
    "backdropPath": "string | null",
    "runtime": "integer | null",
    "genres": ["string"],
    "path": "string | null",
    "rootFolderId": "string | null",
    "rootFolderPath": "string | null",
    "scoringProfileId": "string | null",
    "desiredQualities": ["string"],
    "languageProfileId": "string | null",
    "monitored": "boolean",
    "minimumAvailability": "string",
    "added": "string",
    "hasFile": "boolean",
    "wantsSubtitles": "boolean",
    "releaseDate": "string | null",
    "digitalReleaseDate": "string | null",
    "physicalReleaseDate": "string | null",
    "availabilityDelay": "integer",
    "metadataLanguage": "string | null",
    "preferOriginalTitle": "boolean",
    "tmdbStatus": "string | null",
    "files": [{ "id": "string", "relativePath": "string", "size": "integer", "dateAdded": "string", "quality": "object", "mediaInfo": "object", "releaseGroup": "string | null", "edition": "string | null" }],
    "subtitles": [{ "id": "string", "language": "string", "relativePath": "string", "isForced": "boolean", "isHearingImpaired": "boolean", "format": "string", "matchScore": "number", "providerId": "string", "dateAdded": "string", "wasSynced": "boolean", "syncOffset": "number | null" }],
    "subtitleStatus": { "satisfied": "boolean", "missing": ["string"], "existing": ["string"] }
  }
}
```

There is no `credits`, `images`, `tagline`, `website`, `isAvailable`, `certification`, `alternativeTitles`, or `titleSlug` field returned by this endpoint.

---

## Update movie

Updates movie settings such as monitoring, quality/scoring profile, root folder, and subtitle preferences. `PUT` is an alias of `PATCH` (same handler).

```
PATCH /api/library/movies/:id
PUT /api/library/movies/:id
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| monitored | boolean | No | Monitoring status |
| scoringProfileId | string \| null | No | Scoring profile ID |
| desiredQualities | string[] \| null | No | Multi-quality selection |
| minimumAvailability | string | No | Minimum availability |
| availabilityDelay | integer | No | 0-365 days |
| providerRefs | object | No | `{ tmdb?, anilist?, mal? }` |
| rootFolderId | string | No | Reassign root folder (cannot be unset once a movie has files) |
| moveFilesOnRootChange | boolean | No | Move existing files when `rootFolderId` changes |
| removeUnwantedFiles | boolean | No | Remove files for quality tiers no longer in `desiredQualities` |
| wantsSubtitles | boolean | No | Subtitle monitoring |
| languageProfileId | string \| null | No | Subtitle language profile |
| delayProfileId | string \| null | No | Delay profile |
| folderPath | string | No | Relative folder name within the root folder (corrects a drifted DB path) |
| tmdbCollectionId | integer | No | TMDB collection ID |
| collectionName | string | No | Collection name |
| metadataLanguage | string | No | Metadata language override (triggers a background refresh) |
| preferOriginalTitle | boolean | No | Prefer original title for display |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid request body, no valid fields, or root folder change requires `moveFilesOnRootChange` |
| 500 | Failed to reconcile redundant quality files |

### Response schema

```json
{
  "success": true,
  "moveQueued": "boolean",
  "moveTaskId": "string | undefined",
  "moveTaskHistoryId": "string | undefined",
  "removedCount": "integer",
  "failedCount": "integer | undefined",
  "warning": "string | undefined"
}
```

### Example request

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{"monitored": false}' \
  http://localhost:3000/api/library/movies/550e8400-e29b-41d4-a716-446655440000
```

---

## Delete movie

Deletes movie files (marks the movie as missing but keeps its library entry), or removes the movie entirely with `removeFromLibrary=true`.

```
DELETE /api/library/movies/:id
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Movie UUID |

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deleteFiles | boolean | No | Also delete files from disk (default: false) |
| removeFromLibrary | boolean | No | Remove the movie from the library entirely, not just its files (default: false) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Movie has no files to delete (and `removeFromLibrary` is not set), or files are in a read-only root folder |
| 404 | Movie not found |
| 500 | Failed to delete movie files |

### Response schema

```json
{ "success": true }
```

or, with `removeFromLibrary=true`:

```json
{ "success": true, "removed": true }
```

### Example request

```bash
curl -X DELETE \
  -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/library/movies/550e8400-e29b-41d4-a716-446655440000?deleteFiles=true&removeFromLibrary=true"
```

---

## Trigger auto search

Automatically searches for and grabs the best release for a movie. This endpoint returns a **Server-Sent Events stream** (not a plain JSON response) with real-time progress.

```
POST /api/library/movies/:id/auto-search
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Movie UUID |

### Response codes

| Code | Description |
|------|-------------|
| 200 | SSE stream started |
| 404 | Movie not found |
| 409 | A search is already in progress for this movie |
| 500 | Failed to start auto-search |

### SSE event types

| Event | Description |
|-------|-------------|
| `search:started` | Search has begun |
| `search:progress` | Progress update (`phase`, `message`, `progress`) |
| `search:completed` | Search finished (`success`, `found`, `grabbed`, `releaseName`, `queueItemId`, `error`) |
| `search:error` | Unhandled error during search |

### Example request

```bash
curl -N -X POST \
  -H "x-api-key: cinephage_your_key_here" \
  http://localhost:3000/api/library/movies/550e8400-e29b-41d4-a716-446655440000/auto-search
```

---

## Refresh metadata

Synchronously refreshes movie metadata from TMDB (title, overview, artwork, runtime, genres, collection, external IDs, adult flag).

```
POST /api/library/movies/:id/refresh
```

### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Movie UUID |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Refreshed |
| 404 | Movie not found |
| 409 | A refresh is already in progress for this movie |
| 500 | Failed to refresh movie metadata |

### Response schema

```json
{
  "success": true,
  "movie": {
    "id": "string",
    "tmdbId": "integer",
    "imdbId": "string | null",
    "title": "string",
    "year": "integer | null",
    "overview": "string | null",
    "posterPath": "string | null",
    "backdropPath": "string | null",
    "runtime": "integer | null",
    "genres": ["string"]
  }
}
```

### Example request

```bash
curl -X POST \
  -H "x-api-key: cinephage_your_key_here" \
  http://localhost:3000/api/library/movies/550e8400-e29b-41d4-a716-446655440000/refresh
```

---

## Bulk add movies

Adds multiple movies to the library by TMDB ID in a single call. This is the `bulk` endpoint - it adds new movies, it does not edit existing ones.

```
POST /api/library/movies/bulk
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tmdbIds | integer[] | Yes | 1-50 TMDB movie IDs |
| rootFolderId | string | Yes | Root folder ID |
| scoringProfileId | string | No | Scoring profile ID |
| monitored | boolean | No | Default: true |
| minimumAvailability | string | No | Default: `released` |
| availabilityDelay | integer | No | Default: 0 |
| searchOnAdd | boolean | No | Default: true |
| wantsSubtitles | boolean | No | Default: true |

### Response schema

```json
{
  "success": true,
  "added": "integer",
  "skipped": "integer",
  "errors": [{ "tmdbId": "integer", "title": "string | undefined", "error": "string" }],
  "movies": [{ "id": "string", "tmdbId": "integer", "title": "string" }]
}
```

---

## Batch update movies

Updates `monitored` and/or `scoringProfileId` for multiple existing movies at once. `PUT` is an alias of `PATCH`.

```
PATCH /api/library/movies/batch
PUT /api/library/movies/batch
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| movieIds | string[] | Yes | Movie UUIDs to update |
| updates | object | Yes | `{ monitored?: boolean, scoringProfileId?: string \| null }` |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Missing/invalid `movieIds` or `updates` |
| 500 | Failed to batch update movies |

### Response schema

```json
{
  "success": true,
  "updatedCount": "integer"
}
```

### Example request

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{
    "movieIds": ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440001"],
    "updates": { "monitored": true }
  }' \
  http://localhost:3000/api/library/movies/batch
```

---

## Batch delete movies

Deletes files (or removes entirely) for multiple movies at once.

```
DELETE /api/library/movies/batch
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| movieIds | string[] | Yes | Movie UUIDs |
| deleteFiles | boolean | No | Delete files from disk (default: false) |
| removeFromLibrary | boolean | No | Remove movies from the library entirely (default: false) |

### Response schema

```json
{
  "success": "boolean",
  "deletedCount": "integer",
  "removedCount": "integer",
  "skippedCount": "integer",
  "failedCount": "integer",
  "errors": [{ "id": "string", "error": "string" }]
}
```

---

## See Also

- [Authentication](../authentication) - Authentication methods
- [TV](tv) - TV shows and episode endpoints
- [Search](search) - Search and download endpoints
