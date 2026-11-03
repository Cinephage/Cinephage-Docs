---
title: Libraries
description: API endpoints for managing custom libraries
sidebar_position: 10
tags: [api, libraries, library, endpoints, reference]
keywords: [api, libraries, library, endpoints]
---

# Libraries

Endpoints for managing library entities in Cinephage. Libraries are first-class collections (system libraries plus user-created custom libraries) that group root folders and default settings for movies or TV.

## Authentication

The route handler itself only requires `requireAdmin` on the write endpoints below, but `/api/libraries` is not on the global viewer read-only allowlist (unlike `/api/library/movies` and `/api/library/series`) - so in practice, a non-admin ("viewer") session gets 403'd on the GET endpoints too, even though the handler's own check would have allowed it. See [API Authentication](/reference/api/authentication) for how that global gate works.

| Endpoint | Auth Level |
|----------|------------|
| GET `/api/libraries` | 🔐 Admin only in practice (handler itself only requires `requireAuth`) |
| POST `/api/libraries` | 👑 requireAdmin |
| GET `/api/libraries/:id` | 🔐 Admin only in practice (handler itself only requires `requireAuth`) |
| PUT `/api/libraries/:id` | 👑 requireAdmin |
| DELETE `/api/libraries/:id` | 👑 requireAdmin |

---

## List libraries

Returns all configured libraries.

```
GET /api/libraries
```

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mediaType | string | No | Filter by `movie` or `tv` |
| includeSystem | boolean | No | Include system libraries (default: true) |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid query parameters |
| 401 | Authentication required |

### Response schema

```json
{
  "success": true,
  "libraries": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "mediaType": "movie | tv",
      "mediaSubType": "standard | anime | custom",
      "isSystem": "boolean",
      "systemKey": "string | null",
      "isDefault": "boolean",
      "rootFolders": [
        {
          "id": "string",
          "name": "string",
          "path": "string",
          "mediaType": "movie | tv",
          "mediaSubType": "standard | anime | custom"
        }
      ],
      "defaultRootFolderId": "string | null",
      "defaultRootFolderPath": "string | null",
      "defaultSearchOnAdd": "boolean",
      "defaultWantsSubtitles": "boolean",
      "qualityProfileId": "string | null",
      "sortOrder": "integer",
      "scanMode": "manual | scheduled | scheduled_daily | watch",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/libraries"
```

---

## Get library

Returns a specific library by ID.

```
GET /api/libraries/:id
```

### Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Library ID |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Authentication required |
| 404 | Library not found |

### Response schema

Same library object shape as in [List libraries](#list-libraries), wrapped as:

```json
{
  "success": true,
  "library": { }
}
```

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/libraries/lib_1a2b3c4d"
```

---

## Create library

Creates a new library. Requires admin.

```
POST /api/libraries
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Library display name (max 100 chars) |
| mediaType | string | Yes | `movie` or `tv` |
| mediaSubType | string | No | `standard` or `anime` (default: `standard`) |
| rootFolderIds | string[] | No | Root folder IDs to attach (default: []) |
| defaultRootFolderId | string | No | Default root folder ID |
| isDefault | boolean | No | Make this the default library for its media type (default: false) |
| defaultSearchOnAdd | boolean | No | Automatically search when items are added (default: true) |
| defaultWantsSubtitles | boolean | No | Automatically want subtitles (default: true) |
| qualityProfileId | string | No | Default quality/scoring profile ID |
| sortOrder | integer | No | Display sort order (default: 100) |
| scanMode | string | No | `manual`, `scheduled`, `scheduled_daily`, or `watch` (default: `scheduled`) |
| scanConfig | object | No | `{ intervalMinutes?, scheduledTime?, debounceSeconds? }` |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Library created |
| 400 | Invalid request body |
| 401 | Authentication required |
| 403 | Not an admin |

### Example request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{
    "name": "Anime",
    "mediaType": "tv",
    "mediaSubType": "anime",
    "rootFolderIds": ["rf_abc123"]
  }' \
  "http://localhost:3000/api/libraries"
```

### Example response

```json
{
  "success": true,
  "library": {
    "id": "lib_new12345",
    "name": "Anime",
    "mediaType": "tv",
    "mediaSubType": "anime",
    "isSystem": false,
    "isDefault": false,
    "rootFolders": [{ "id": "rf_abc123", "name": "Anime", "path": "/data/anime", "mediaType": "tv", "mediaSubType": "anime" }],
    "createdAt": "2024-06-20T14:45:00Z"
  }
}
```

---

## Update library

Updates an existing library. Requires admin. Accepts the same fields as [Create library](#create-library), all optional.

```
PUT /api/libraries/:id
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | Library updated |
| 400 | Invalid request body |
| 401 | Authentication required |
| 403 | Not an admin |
| 404 | Library not found |

### Example request

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{
    "qualityProfileId": "qp_new456"
  }' \
  "http://localhost:3000/api/libraries/lib_1a2b3c4d"
```

---

## Delete library

Deletes a library. Requires admin.

```
DELETE /api/libraries/:id
```

### Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Library ID |

### Request body schema (optional)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| targetLibraryId | string | No | Library to reassign this library's media items to before deletion |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Library deleted |
| 401 | Authentication required |
| 403 | Not an admin |
| 404 | Library not found |

### Example request

```bash
curl -X DELETE \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{ "targetLibraryId": "lib_default" }' \
  "http://localhost:3000/api/libraries/lib_1a2b3c4d"
```

### Example response

```json
{
  "success": true
}
```

## See Also

- [Movies](movies) - Movie library endpoints
- [TV](tv) - TV shows library endpoints
