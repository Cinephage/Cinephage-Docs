---
title: Search
description: API endpoints for searching releases and media
sidebar_position: 3
tags: [api, search, download, releases, endpoints, reference]
keywords: [api, search, download, releases, endpoints]
---

# Search

Endpoints for searching releases across configured indexers.

## Authentication

`GET /api/search` has no auth check directly in its route handler, but it's not actually reachable unauthenticated: a global gate in `hooks.server.ts` requires a valid session or API key on every `/api/*` route, and `/api/search` is not on the viewer read-only allowlist, so it's admin-only in practice. See [API Authentication](/reference/api/authentication) for how that global gate works.

| Endpoint | Auth Level |
|----------|------------|
| GET `/api/search` | 🔐 Admin only |
| POST `/api/download/grab` | 🔐 Admin only |

---

## Search releases

Performs a multi-indexer search for releases matching the query parameters.

```
GET /api/search
```

### Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | No | Free-text search query |
| searchType | string | No | `basic`, `movie`, or `tv` (default: `basic`) |
| searchMode | string | No | `all` or `multiSeasonPack` |
| categories | string | No | Comma-separated Newznab category IDs |
| indexers | string | No | Comma-separated indexer IDs |
| minSeeders | integer | No | Minimum seeders (torrent) |
| limit | integer | No | Maximum results |
| imdbId | string | No | IMDB ID |
| tmdbId | integer | No | TMDB ID |
| tvdbId | integer | No | TVDB ID (TV only) |
| year | integer | No | Release year |
| season | integer | No | Season number (TV only) |
| episode | integer | No | Episode number (TV only) |
| language | string | No | ISO 639-1 language code preference |
| enrich | boolean | No | Enable quality filtering and scoring (`true`/`1`) |
| scoringProfileId | string | No | Scoring profile ID to use when `enrich=true` |
| matchToTmdb | boolean | No | Match releases to TMDB entries (`true`/`1`) |
| filterRejected | boolean | No | Filter out releases that fail quality requirements (`true`/`1`) |
| minScore | integer | No | Minimum score to include, 0-1000 (with `enrich=true`) |

A `basic` search (the default `searchType`) requires `q`.

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid query parameters, or no eligible indexers for this search |

### Response schema

Without `enrich=true`:

```json
{
  "releases": [
    {
      "guid": "string",
      "title": "string",
      "downloadUrl": "string",
      "commentsUrl": "string",
      "publishDate": "string",
      "size": "integer",
      "indexerId": "string",
      "indexerName": "string",
      "protocol": "torrent | usenet | streaming",
      "categories": [{ "id": "integer", "name": "string" }],
      "seeders": "integer",
      "leechers": "integer",
      "imdbId": "string",
      "tmdbId": "integer",
      "tvdbId": "integer",
      "season": "integer",
      "episode": "integer"
    }
  ],
  "meta": {
    "totalResults": "integer",
    "searchTimeMs": "integer",
    "indexerCount": "integer",
    "indexerResults": [
      {
        "indexerId": "string",
        "indexerName": "string",
        "count": "integer",
        "durationMs": "integer",
        "error": "string | undefined",
        "searchMethod": "string"
      }
    ],
    "rejectedIndexers": "array"
  }
}
```

`downloadUrl` values are redacted (API keys stripped) before being returned to the client.

With `enrich=true`, each release additionally includes parsed metadata and scoring fields (`parsed`, `totalScore`, `rejected`, `rejectionReason`, `rejections`, `matchedFormats`, `tmdbMatched`, `upgradeStatus`, etc.), and `meta` additionally includes `afterDedup`, `afterFiltering`, `filterBreakdown`, `afterEnrichment`, `rejectedCount`, `enrichTimeMs`, and `scoringProfileId`. `meta.indexerResults` becomes an object keyed by indexer ID rather than an array in this mode.

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/search?searchType=movie&tmdbId=27205&limit=10"
```

### Example response

```json
{
  "releases": [
    {
      "guid": "Indexer1-12345",
      "title": "Inception.2010.1080p.BluRay.x264-Group",
      "downloadUrl": "https://example.com/download/12345",
      "commentsUrl": "https://example.com/details/12345",
      "publishDate": "2024-01-15T08:00:00.000Z",
      "size": 10485760000,
      "indexerId": "a10e8400-e29b-41d4-a716-446655440010",
      "indexerName": "Indexer1",
      "protocol": "torrent",
      "categories": [{ "id": 2040, "name": "Movies/HD" }],
      "seeders": 150,
      "leechers": 12,
      "tmdbId": 27205
    }
  ],
  "meta": {
    "totalResults": 15,
    "searchTimeMs": 2345,
    "indexerCount": 1,
    "indexerResults": [
      {
        "indexerId": "a10e8400-e29b-41d4-a716-446655440010",
        "indexerName": "Indexer1",
        "count": 15,
        "durationMs": 2100,
        "searchMethod": "torznab"
      }
    ],
    "rejectedIndexers": []
  }
}
```

---

## Grab release

Sends a release to the configured download client and links it to a movie or series.

```
POST /api/download/grab
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Release title |
| mediaType | string | Yes | `movie` or `tv` |
| downloadUrl or magnetUrl | string | One required | Download link for the release |
| movieId or seriesId | string | One required | Movie or series UUID to link the download to |
| guid | string | No | Release GUID from search |
| infoHash | string | No | Torrent info hash |
| indexerId | string | No | Indexer ID |
| indexerName | string | No | Indexer display name |
| protocol | string | No | `torrent`, `usenet`, or `streaming` |
| categories | integer[] | No | Newznab category IDs (validated against `mediaType`) |
| size | number | No | Release size in bytes |
| publishDate | string | No | ISO datetime |
| commentsUrl | string | No | Link to comments/details page |
| episodeIds | string[] | No | Episode UUIDs (TV) |
| seasonNumber | integer | No | Season number (TV) |
| isAutomatic | boolean | No | Whether this grab was triggered automatically |
| isUpgrade | boolean | No | Whether this grab is an upgrade of an existing file |
| force | boolean | No | Bypass blocklist/duplicate checks |
| streamUsenet | boolean | No | Stream NZB content instead of downloading |
| acquisitionProtocol | string | No | `default`, `torrent`, or `debrid` |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Grab succeeded or failed with a handled error (check `success`) |
| 400 | Invalid request body |
| 422 | Category/title mismatch, missing protocol, or release rejected |
| 500 | Unexpected error during grab |

### Response schema

```json
{
  "success": "boolean",
  "data": {
    "queueId": "string",
    "hash": "string",
    "clientId": "string",
    "clientName": "string",
    "category": "string",
    "wasDuplicate": "boolean",
    "isUpgrade": "boolean"
  },
  "error": "string",
  "errorCode": "string",
  "rejectionType": "string",
  "decision": "object"
}
```

### Example request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{
    "title": "Inception.2010.1080p.BluRay.x264-Group",
    "mediaType": "movie",
    "downloadUrl": "https://example.com/download/12345",
    "guid": "Indexer1-12345",
    "indexerId": "a10e8400-e29b-41d4-a716-446655440010",
    "protocol": "torrent",
    "movieId": "550e8400-e29b-41d4-a716-446655440000"
  }' \
  http://localhost:3000/api/download/grab
```

### Example response

```json
{
  "success": true,
  "data": {
    "queueId": "q_550e8400-e29b-41d4-a716-446655440021",
    "hash": "abc123",
    "clientId": "dc_1",
    "clientName": "qBittorrent",
    "category": "movies"
  }
}
```

---

## Search protocols

Indexers and their releases use one of three protocols:

| Protocol | Description |
|----------|-------------|
| `torrent` | Torznab and RSS-based torrent indexers |
| `usenet` | Newznab-compatible usenet indexers |
| `streaming` | Debrid/streaming-backed release sources |

---

## See Also

- [Movies](movies) - Movie library endpoints
- [TV](tv) - TV shows and episode endpoints
- [Download](download) - Queue and download management
