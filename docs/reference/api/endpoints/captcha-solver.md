---
title: Captcha Solver
description: API endpoints for managing the built-in Captcha Solver
sidebar_position: 12
tags: [api, captcha, solver, endpoints, reference]
keywords: [api, captcha, solver, endpoints]
---

# Captcha Solver

Endpoints for configuring and testing the built-in Captcha Solver. The Captcha Solver uses Camoufox (anti-detect Firefox) to automatically solve Cloudflare challenges and other anti-bot protections.

## Authentication

All captcha-solver endpoints require admin authentication.

| Endpoint | Auth Level |
|----------|------------|
| GET `/api/captcha-solver` | 👑 requireAdmin |
| PUT `/api/captcha-solver` | 👑 requireAdmin |
| DELETE `/api/captcha-solver` | 👑 requireAdmin |
| GET `/api/captcha-solver/health` | 👑 requireAdmin |
| DELETE `/api/captcha-solver/health` | 👑 requireAdmin |
| POST `/api/captcha-solver/test` | 👑 requireAdmin |

---

## Get solver settings

Returns current Captcha Solver configuration.

```
GET /api/captcha-solver
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Authentication required |
| 500 | Failed to get settings |

### Response schema

```json
{
  "success": "boolean",
  "settings": {
    "enabled": "boolean",
    "timeoutSeconds": "integer",
    "cacheTtlSeconds": "integer",
    "headless": "boolean",
    "proxyUrl": "string",
    "proxyUsername": "string",
    "proxyPassword": "string"
  }
}
```

`proxyPassword` is masked as `********` when a password is set, and omitted (empty string) otherwise.

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/captcha-solver"
```

### Example response

```json
{
  "success": true,
  "settings": {
    "enabled": true,
    "timeoutSeconds": 60,
    "cacheTtlSeconds": 3600,
    "headless": true,
    "proxyUrl": "",
    "proxyUsername": "",
    "proxyPassword": ""
  }
}
```

---

## Update solver settings

Updates Captcha Solver configuration.

```
PUT /api/captcha-solver
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | No | Enable/disable solver |
| timeoutSeconds | number | No | Max time to wait for solve, 10-300 seconds |
| cacheTtlSeconds | number | No | Cookie cache TTL, 60-86400 seconds |
| headless | boolean | No | Run browser without GUI |
| proxyUrl | string | No | Proxy URL for the browser |
| proxyUsername | string | No | Proxy username |
| proxyPassword | string | No | Proxy password |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Settings updated |
| 400 | Invalid request body |
| 401 | Authentication required |
| 500 | Failed to update settings |

### Example request

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{
    "enabled": true,
    "timeoutSeconds": 90,
    "cacheTtlSeconds": 7200,
    "headless": true
  }' \
  "http://localhost:3000/api/captcha-solver"
```

### Example response

```json
{
  "success": true,
  "message": "Captcha solver settings updated",
  "settings": {
    "enabled": true,
    "timeoutSeconds": 90,
    "cacheTtlSeconds": 7200,
    "headless": true,
    "proxyUrl": "",
    "proxyUsername": "",
    "proxyPassword": ""
  }
}
```

---

## Reset solver

Resets Captcha Solver settings to defaults.

```
DELETE /api/captcha-solver
```

### Response codes

| Code | Description |
|------|-------------|
| 200 | Solver reset |
| 401 | Authentication required |
| 500 | Failed to reset settings |

### Example request

```bash
curl -X DELETE \
  -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/captcha-solver"
```

---

## Get solver health

Returns health status and solver statistics.

```
GET /api/captcha-solver/health
```

### Response schema

```json
{
  "success": "boolean",
  "health": {
    "available": "boolean",
    "status": "ready | busy | disabled | error | initializing",
    "browserAvailable": "boolean",
    "error": "string | undefined",
    "stats": {
      "totalAttempts": "integer",
      "successCount": "integer",
      "failureCount": "integer",
      "cacheHits": "integer",
      "avgSolveTimeMs": "number",
      "cacheSize": "integer",
      "fetchAttempts": "integer",
      "fetchSuccessCount": "integer",
      "fetchFailureCount": "integer",
      "avgFetchTimeMs": "number",
      "lastSolveAt": "string | undefined",
      "lastFetchAt": "string | undefined",
      "lastError": "string | undefined"
    }
  }
}
```

### Example request

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/captcha-solver/health"
```

### Example response

```json
{
  "success": true,
  "health": {
    "available": true,
    "status": "ready",
    "browserAvailable": true,
    "stats": {
      "totalAttempts": 150,
      "successCount": 142,
      "failureCount": 8,
      "cacheHits": 40,
      "avgSolveTimeMs": 12500,
      "cacheSize": 12,
      "fetchAttempts": 200,
      "fetchSuccessCount": 195,
      "fetchFailureCount": 5,
      "avgFetchTimeMs": 900
    }
  }
}
```

---

## Clear solver stats

Resets solver statistics and clears the cache.

```
DELETE /api/captcha-solver/health
```

This endpoint takes no parameters; it always resets statistics and clears the cache.

### Response codes

| Code | Description |
|------|-------------|
| 200 | Stats cleared |
| 401 | Authentication required |
| 500 | Failed to reset stats |

### Example request

```bash
curl -X DELETE \
  -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/captcha-solver/health"
```

### Example response

```json
{
  "success": true,
  "message": "Cache cleared and statistics reset"
}
```

---

## Test solver

Tests challenge detection and solving on a specific URL.

```
POST /api/captcha-solver/test
```

### Request body schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | URL to test challenge solving |

### Response codes

| Code | Description |
|------|-------------|
| 200 | Test completed |
| 400 | Invalid request body |
| 401 | Authentication required |
| 500 | Test failed |

### Response schema

When no challenge is detected:

```json
{
  "success": true,
  "hasChallenge": false,
  "message": "No challenge detected for this URL"
}
```

When a challenge is detected, the solver attempts to solve it:

```json
{
  "success": "boolean",
  "hasChallenge": true,
  "challengeType": "string",
  "confidence": "number",
  "solveTimeMs": "number",
  "cookiesObtained": "integer",
  "userAgent": "string",
  "error": "string | undefined"
}
```

### Example request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: cinephage_your_key_here" \
  -d '{
    "url": "https://tracker.example.com/api"
  }' \
  "http://localhost:3000/api/captcha-solver/test"
```

### Example response

```json
{
  "success": true,
  "hasChallenge": true,
  "challengeType": "cloudflare_managed",
  "confidence": 0.95,
  "solveTimeMs": 8500,
  "cookiesObtained": 3,
  "userAgent": "Mozilla/5.0 ...",
  "error": null
}
```

### Challenge types

| Type | Description |
|------|-------------|
| `cloudflare` | Cloudflare "checking your browser" interstitial |
| `cloudflare_turnstile` | Cloudflare Turnstile widget |
| `cloudflare_managed` | Cloudflare managed challenge (JS challenge) |
| `ddos_guard` | DDoS-Guard protection |
| `unknown` | Unknown challenge type |

## See Also

- [Captcha Solver Configuration](/guides/configure/system/captcha-solver) - UI-based configuration guide
- [Indexers](/guides/configure/indexers) - Indexers that may require captcha solving
- [Troubleshooting](/guides/deploy/troubleshooting) - Captcha solver issues
