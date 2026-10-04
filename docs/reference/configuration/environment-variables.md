---
title: Environment Variables
description: Complete reference for all Cinephage environment variables
sidebar_position: 1
tags: [environment-variables, configuration, reference]
keywords: [environment variables, configuration, docker, settings]
---

# Environment variables

This reference documents all environment variables available for configuring Cinephage.

For the authoritative template (including newer or optional keys), see the upstream [`.env.example` on the `dev` branch](https://github.com/MoldyTaint/Cinephage/blob/dev/.env.example).

## Required Variables

These variables must be set for Cinephage to function correctly:

| Variable             | Description                                          | Example                        |
| -------------------- | ---------------------------------------------------- | ------------------------------ |
| `BETTER_AUTH_SECRET` | Secret key for session signing and API key encryption | _generate unique value_        |
| `ORIGIN`             | Trusted origin URL for CSRF protection               | `http://localhost:3000`        |

:::danger[BREAKING CHANGE - Version 0.7.0]
`BETTER_AUTH_SECRET` is now **required**. The auto-generated `.auth-secret` file fallback was removed in v0.7.0 (the requirement was first introduced in v0.5.0).

**Migration for existing deployments:**
1. Locate your existing secret in `data/.auth-secret`
2. Copy the value into the `BETTER_AUTH_SECRET` environment variable
3. **Without this migration, all sessions and encrypted API keys will be lost**

[See Migration Guide](/guides/deploy/migration) for detailed instructions.
:::

### Generating BETTER_AUTH_SECRET

Generate a secure secret using one of these methods:

```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

:::warning[Important Security Notes]
- **Keep this secret secure** - Store it safely like a password
- **Back it up** - You'll need the same value if you restore from backup
- **Changing it has consequences:**
  - All active user sessions are invalidated (users must log in again)
  - Existing API keys become unreadable and must be regenerated
  - API keys encrypted with the old secret cannot be recovered
:::

## Server Configuration

### Core server settings

| Variable                      | Default   | Description                                                                |
| ----------------------------- | --------- | -------------------------------------------------------------------------- |
| `HOST`                        | `0.0.0.0` | IP address to bind the server to                                           |
| `PORT`                        | `3000`    | Port number to listen on                                                   |
| `ORIGIN`                      | -         | Trusted origin URL for CSRF protection. Must match your access URL exactly |
| `BETTER_AUTH_URL`                   | -         | Base URL for authentication callbacks and redirects (optional - falls back to `ORIGIN`) |
| `BETTER_AUTH_TRUSTED_ORIGINS`       | -         | Additional trusted origins for CORS (comma-separated)                      |
| `BETTER_AUTH_DISABLE_SECURE_COOKIES`| `false`   | Disable secure cookies (auto-set when `BETTER_AUTH_URL` starts with `http://`) |
| `PUBLIC_BASE_URL`             | -         | Public-facing URL for generated external links                             |

### Examples

**Local Development:**

```yaml
environment:
  - ORIGIN=http://localhost:3000
  - BETTER_AUTH_URL=http://localhost:3000
```

**Production with Reverse Proxy:**

```yaml
environment:
  - ORIGIN=https://cinephage.yourdomain.com
  - BETTER_AUTH_URL=https://cinephage.yourdomain.com
  - PUBLIC_BASE_URL=https://cinephage.yourdomain.com
```

**Multiple Origins (Advanced):**

```yaml
environment:
  - ORIGIN=https://cinephage.yourdomain.com
  - BETTER_AUTH_URL=https://cinephage.yourdomain.com
  - BETTER_AUTH_TRUSTED_ORIGINS=https://cinephage.yourdomain.com,https://app.yourdomain.com
```

## System Configuration

### User/Group ids

| Variable | Default | Description                                    |
| -------- | ------- | ---------------------------------------------- |
| `PUID`   | `1000`  | User ID for file permissions inside container  |
| `PGID`   | `1000`  | Group ID for file permissions inside container |

These map the container user to your host user for proper file ownership:

```bash
# Get your IDs
id -u  # User ID
id -g  # Group ID
```

```yaml
environment:
  - PUID=1000
  - PGID=1000
```

### Timezone

| Variable | Default | Description                              |
| -------- | ------- | ---------------------------------------- |
| `TZ`     | `UTC`   | Timezone for scheduled tasks and logging |

Valid values are TZ database names:

- `America/New_York`
- `Europe/London`
- `Asia/Tokyo`
- `Australia/Sydney`
- See [full list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

### Advanced permissions

| Variable                          | Default | Description                                                 |
| --------------------------------- | ------- | ----------------------------------------------------------- |
| `CINEPHAGE_FORCE_RECURSIVE_CHOWN` | `0`     | Force full recursive ownership fix on startup (1 to enable) |

Set to `1` if you experience permission issues after changing PUID/PGID.

## Logging Configuration

### Log level

| Variable    | Default | Description                 |
| ----------- | ------- | --------------------------- |
| `LOG_LEVEL` | `info`  | Minimum log level to output |

Valid levels (in order of verbosity):

- `debug` - Detailed debugging information
- `info` - General information (default)
- `warn` - Warnings and errors
- `error` - Errors only

### Log options

| Variable            | Default | Description                                          |
| ------------------- | ------- | ---------------------------------------------------- |
| `LOG_INCLUDE_STACK` | `false` | Include stack traces in error logs                   |
| `LOG_SENSITIVE`     | `false` | Log sensitive data (debug only, never in production) |

**Enable debug logging:**

```yaml
environment:
  - LOG_LEVEL=debug
  - LOG_INCLUDE_STACK=true
```

:::danger
Never enable `LOG_SENSITIVE` in production as it logs passwords, API keys, and other sensitive data.
:::

## Worker Configuration

Workers handle background tasks. These limits control concurrency:

| Variable                     | Default | Description                                 |
| ---------------------------- | ------- | ------------------------------------------- |
| `WORKER_MAX_STREAMS`         | `10`    | Maximum concurrent streaming operations     |
| `WORKER_MAX_IMPORTS`         | `5`     | Maximum concurrent file imports             |
| `WORKER_MAX_SCANS`           | `2`     | Maximum concurrent library scans            |
| `WORKER_MAX_MONITORING`      | `5`     | Maximum concurrent monitoring tasks         |
| `WORKER_MAX_SEARCH`          | `3`     | Maximum concurrent indexer searches         |
| `WORKER_MAX_SUBTITLE_SEARCH` | `3`     | Maximum concurrent subtitle searches        |
| `WORKER_MAX_PORTAL_SCANS`    | `2`     | Maximum concurrent portal scans (Live TV)   |
| `WORKER_MAX_CHANNEL_SYNCS`   | `3`     | Maximum concurrent channel synchronizations |
| `WORKER_CLEANUP_MS`          | `1800000` | How long to keep completed worker logs in memory (ms) |
| `WORKER_MAX_LOGS`            | `1000`  | Maximum log entries kept per worker instance |

### Process lifecycle

| Variable           | Default | Description                                              |
| ------------------ | ------- | -------------------------------------------------------- |
| `SHUTDOWN_TIMEOUT` | `30`    | Seconds to wait for graceful shutdown before force-killing |

### Tuning workers

**Low-resource systems:**

```yaml
environment:
  - WORKER_MAX_STREAMS=5
  - WORKER_MAX_IMPORTS=2
  - WORKER_MAX_SCANS=1
  - WORKER_MAX_SEARCH=2
```

**High-performance systems:**

```yaml
environment:
  - WORKER_MAX_STREAMS=20
  - WORKER_MAX_IMPORTS=10
  - WORKER_MAX_SCANS=4
  - WORKER_MAX_SEARCH=5
```

## Streaming Configuration

### Proxy settings

| Variable                 | Default              | Description                                         |
| ------------------------ | -------------------- | --------------------------------------------------- |
| `PROXY_FETCH_TIMEOUT_MS` | `30000`              | Timeout for fetching stream segments (milliseconds) |
| `PROXY_SEGMENT_MAX_SIZE` | `52428800`           | Maximum segment size in bytes (50MB default)        |
| `PROXY_MAX_RETRIES`      | `2`                  | Maximum retry attempts for failed segments          |
| `DEFAULT_PROXY_REFERER`  | `https://videasy.net`| Default referer header for stream requests          |

### Provider circuit breaker

Circuit breakers prevent repeated failures with streaming providers:

| Variable                        | Default | Description                                        |
| ------------------------------- | ------- | -------------------------------------------------- |
| `PROVIDER_MAX_FAILURES`         | `3`     | Failures before opening circuit                    |
| `PROVIDER_CIRCUIT_HALF_OPEN_MS` | `30000` | Time before trying provider again (milliseconds)   |
| `PROVIDER_CIRCUIT_RESET_MS`     | `60000` | Time before fully resetting circuit (milliseconds) |

## Live TV Configuration

### EPG settings

| Variable               | Default | Description                                        |
| ---------------------- | ------- | -------------------------------------------------- |
| `EPG_STARTUP_GRACE_MS` | `30000` | Grace period for EPG initialization (milliseconds) |

### API rate limiting

| Variable                                 | Default   | Description                                |
| ---------------------------------------- | --------- | ------------------------------------------ |
| `STREAMING_API_KEY_RATE_LIMIT_WINDOW_MS` | `3600000` | Rate limit window (1 hour in milliseconds) |
| `STREAMING_API_KEY_RATE_LIMIT_MAX`       | `10000`   | Maximum requests per window per API key    |

## External Tools

### Ffprobe

| Variable       | Default | Description                           |
| -------------- | ------- | ------------------------------------- |
| `FFPROBE_PATH` | -       | Path to ffprobe binary if not in PATH |

Set if ffprobe is not in your system PATH:

```yaml
environment:
  - FFPROBE_PATH=/usr/local/bin/ffprobe
```

## Complete Docker Compose Example

```yaml
services:
  cinephage:
    image: ghcr.io/moldytaint/cinephage:latest
    container_name: cinephage
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      # Server (REQUIRED)
      - HOST=0.0.0.0
      - PORT=3000
      - ORIGIN=https://cinephage.yourdomain.com
      - BETTER_AUTH_URL=https://cinephage.yourdomain.com
      - BETTER_AUTH_SECRET=your-generated-secret-here

      # System
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York

      # Logging
      - LOG_LEVEL=info

      # Workers (adjust based on your hardware)
      - WORKER_MAX_STREAMS=10
      - WORKER_MAX_IMPORTS=5
      - WORKER_MAX_SCANS=2
      - WORKER_MAX_SEARCH=3
      - WORKER_MAX_SUBTITLE_SEARCH=3

      # Streaming
      - PROXY_FETCH_TIMEOUT_MS=30000
      - PROXY_MAX_RETRIES=2

    volumes:
      - ./config:/config
      # Single shared root so imports can hardlink (see Docker install IMPORTANT note).
      - /mnt/user/data:/data
```

## Variable Reference Table

### Quick reference

| Category            | Variables                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Server**          | `BETTER_AUTH_SECRET`, `ORIGIN`, `BETTER_AUTH_URL`, `BETTER_AUTH_DISABLE_SECURE_COOKIES`, `HOST`, `PORT`, `BETTER_AUTH_TRUSTED_ORIGINS`, `PUBLIC_BASE_URL` |
| **System**          | `PUID`, `PGID`, `TZ`, `CINEPHAGE_FORCE_RECURSIVE_CHOWN`                                                    |
| **Logging**         | `LOG_LEVEL`, `LOG_INCLUDE_STACK`, `LOG_SENSITIVE`                                                          |
| **Workers**         | `WORKER_MAX_*` (8 variables), `WORKER_CLEANUP_MS`, `WORKER_MAX_LOGS`                                       |
| **Process**         | `SHUTDOWN_TIMEOUT`                                                                                          |
| **Streaming**       | `PROXY_FETCH_TIMEOUT_MS`, `PROXY_SEGMENT_MAX_SIZE`, `PROXY_MAX_RETRIES`, `DEFAULT_PROXY_REFERER`           |
| **Circuit Breaker** | `PROVIDER_MAX_FAILURES`, `PROVIDER_CIRCUIT_HALF_OPEN_MS`, `PROVIDER_CIRCUIT_RESET_MS`                      |
| **Live TV**         | `EPG_STARTUP_GRACE_MS`, `STREAMING_API_KEY_RATE_LIMIT_*`                                                   |
| **Tools**           | `FFPROBE_PATH`                                                                                             |

### Total variables

- **Required:** 2 (`BETTER_AUTH_SECRET`, `ORIGIN`)
- **Recommended:** 5 (`BETTER_AUTH_URL`, PUID, PGID, TZ, LOG_LEVEL)
- **Optional:** 25+
- **Total:** 32+ environment variables

For troubleshooting environment variable issues, see [Troubleshooting guide](/guides/deploy/troubleshooting).

## See Also

- [Settings Explained](settings-explained) for UI-configurable settings
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Performance Tuning](/guides/deploy/performance-tuning) - Optimization guide
