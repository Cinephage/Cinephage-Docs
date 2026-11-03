---
title: Architecture Overview
description: High-level overview of Cinephage's system architecture and components
sidebar_position: 1
tags: [architecture, system, components, explanation]
keywords: [architecture, system, components, svelte]
---

# Architecture overview

This document provides a high-level overview of Cinephage's architecture, explaining how the major components work together.

## System Architecture

Cinephage follows a modern web application architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│                    (SvelteKit + Svelte 5)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
│         (SvelteKit Routes + Request Handlers)               │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Services   │ │   Database   │ │  External    │
│   (Business  │ │   (SQLite)   │ │  Services    │
│    Logic)    │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│              Background Services (Workers)                  │
│    (Download Monitoring, Library Scanning, Searching)       │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Web interface

**Technology:** SvelteKit + Svelte 5

The user interface is a modern, reactive web application:

- **Server-Side Rendering (SSR)** - Fast initial page loads
- **Client-Side Hydration** - Interactive after load
- **Real-time Updates** - WebSocket connections for live data
- **Responsive Design** - Works on desktop, tablet, and mobile

**Key UI Modules:**

- Dashboard - Overview and statistics
- Library - Movie and TV management
- Discover - TMDB browsing and search
- Settings - Configuration interface
- Activity - Download queue and history

### 2. API layer

**Technology:** SvelteKit Routes

RESTful API endpoints handle all data operations:

```
/api/library/movies      - Movie CRUD operations
/api/search             - Multi-indexer search
/api/download/*         - Download management
/api/queue/*            - Queue operations
/api/settings/*         - Configuration
```

**Features:**

- Request validation with Zod schemas
- Authentication via Better Auth
- API key support for external access
- Rate limiting for protection

**Radarr/Sonarr-compatible API:**

Alongside its native REST API, Cinephage exposes a compatibility layer under `/api/radarr` and `/api/sonarr` that speaks the Radarr v3 / Sonarr v3 API dialect. This lets tools built for Radarr/Sonarr (request managers like Overseerr/Seerr/Pulsarr, notification tools, etc.) talk to Cinephage without modification. See [Arr Compatibility API](/guides/configure/system/arr-compat) for details.

### 3. Services layer

**Business Logic**

Services contain the core application logic:

| Service             | Responsibility                      |
| ------------------- | ----------------------------------- |
| `LibraryService`    | Media management, file organization |
| `SearchService`     | Multi-indexer search orchestration  |
| `DownloadService`   | Download client integration         |
| `MonitoringService` | Automated content monitoring        |
| `SubtitleService`   | Subtitle search and management      |
| `QualityService`    | Scoring and format evaluation       |

**Design Pattern:**

- Singleton services with lazy initialization
- Clear interfaces for testability
- Error handling with typed errors

### 4. Database

**Technology:** SQLite 3

Single-file embedded database:

**Advantages:**

- No separate database server required
- Easy backups (simple file copy)
- Zero configuration
- Excellent performance for single-user workloads

**Schema Organization:**

- 60+ tables organized by feature
- Foreign key relationships
- Indexes for query performance
- Schema versioning for migrations

**Major Table Groups:**

- Authentication (Better Auth tables)
- Library (movies, series, episodes)
- Downloads (queue, history, clients)
- Indexers (definitions, status)
- Quality (profiles, formats, scoring)
- Subtitles (providers, languages, files)
- Live TV (portals, channels, EPG)

### 5. External integrations

Cinephage integrates with numerous external services:

**Metadata:**

- TMDB - Movie, TV metadata, and external ID lookups (TVDB/IMDB IDs are resolved via TMDB's external IDs API)
- IMDB - External ID linking

**Download Clients:**

- Torrent: qBittorrent, Transmission, Deluge, rTorrent, aria2
- Usenet: SABnzbd, NZBGet

**Indexers:**

- Torrent trackers (via YAML definitions)
- Usenet indexers (Newznab/Torznab)
- Streaming providers

**Subtitles:**

- 12 subtitle providers
- OpenSubtitles, Addic7ed, SubDL, etc.

**Media Servers:**

- Jellyfin notifications
- Emby notifications
- Plex notifications
- Optional Kodi-style `.nfo`/artwork sidecar files written alongside imports, so `.strm`-based libraries have metadata media servers can read without probing the stream (see [Sidecar Files](/guides/configure/system/sidecar-files))

### 6. Background services

**Technology:** Node.js with custom worker system

Long-running background processes:

**Service Manager:**

- Registers all background services
- Manages startup/shutdown
- Handles service health monitoring

**Key Services:**

| Service                | Purpose                                                                                   | Schedule     |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| `MonitoringScheduler`   | Single scheduler driving all scheduled tasks (missing/upgrade/cutoff-unmet search, new episode checks, subtitle search/upgrade, smart list refresh, library reconciliation, history cleanup, DB backup) | Configurable per task |
| `DownloadMonitorService`| Queue monitoring and import                                                                | Real-time    |
| `ExternalIdService`     | TMDB ID caching                                                                            | Periodic     |
| `SubtitleSyncService`   | Native subtitle sync engine                                                                | On-demand    |
| `EpgScheduler`          | EPG data updates                                                                           | Configurable |
| `CaptchaSolver`         | Cloudflare bypass                                                                          | On-demand    |
| `MediaBrowserNotifier`  | Jellyfin/Emby/Plex updates                                                                 | Event-driven |

### 7. Worker system

**Concurrent Task Processing**

Workers handle background operations with concurrency limits:

**Worker Types:**

- `ImportWorker` - File import operations
- `SearchWorker` - Indexer searches
- `SubtitleSearchWorker` - Subtitle downloads
- `StreamWorker` - HLS streaming
- `PortalScanWorker` - Stalker portal scanning
- `ChannelSyncWorker` - Channel synchronization

**Concurrency Control:**

```yaml
environment:
  - WORKER_MAX_STREAMS=10
  - WORKER_MAX_IMPORTS=5
  - WORKER_MAX_SCANS=2
```

## Data Flow

### Adding a movie

```
User clicks "Add to Library"
    ↓
API receives request
    ↓
Validate input with Zod
    ↓
Insert into movies table
    ↓
If monitored: Trigger search
    ↓
SearchWorker queries indexers
    ↓
Score releases
    ↓
Grab best release
    ↓
Send to download client
    ↓
DownloadMonitor waits for completion
    ↓
ImportWorker imports file
    ↓
Organize file according to naming settings
    ↓
Send notifications
```

### Library scanning

```
Scheduler triggers scan
    ↓
Scan directory for video files
    ↓
For each file:
    - Extract metadata (ffprobe)
    - Match to TMDB
    - Insert/update database
    ↓
Mark unmatched files
    ↓
Update library statistics
```

### Search and download

```
Monitoring task or manual search
    ↓
Query all enabled indexers
    ↓
Aggregate results
    ↓
Remove duplicates
    ↓
Score each release:
    - Base score (resolution)
    - Source bonus (BluRay, WEB-DL)
    - Codec bonus (x265, AV1)
    - Custom format scores
    ↓
Select highest scoring
    ↓
Send to download client
    ↓
Add to download queue
```

## Authentication System

**Technology:** Better Auth

Modern authentication with multiple methods:

**Features:**

- Session-based authentication
- API key support
- Role-based access control
- CSRF protection
- Secure password hashing

**Components:**

- User table - Account storage
- Session table - Active sessions
- API key table - External access
- Rate limiting - Abuse prevention

## Configuration Management

**Environment Variables**

Server-level configuration via environment:

- Server binding (HOST, PORT)
- URLs (ORIGIN, BETTER_AUTH_URL)
- System (PUID, PGID, TZ)
- Workers (WORKER*MAX*\*)
- Advanced (timeouts, limits)

**Database Settings**

User-configurable via UI:

- Quality profiles
- Indexer configurations
- Download client settings
- Language profiles
- All stored in database

**YAML Definitions**

Indexer definitions (Cardigann-style YAML, one file per site):

- Loaded from YAML files on disk (bundled definitions plus an optional custom definitions directory)
- Cached in memory and reloadable without restarting Cinephage
- Indexer *instances* (credentials, priority, category mappings) are configured via the UI and stored in the database; the definitions themselves are files, not database rows

## Scalability Considerations

### Single-User design

Cinephage is optimized for personal use:

- SQLite handles single-user workloads excellently
- No need for complex database clustering
- Simple deployment model

### Resource limits

Worker limits prevent resource exhaustion:

- Concurrent operations capped
- Memory usage controlled
- CPU-intensive tasks queued

### Caching strategy

Multiple cache layers:

- In-memory caching for hot data
- Database caching for metadata
- File system caching for streams
- External ID caching to reduce TMDB calls

## Security Architecture

### Defense in depth

Multiple security layers:

1. **Authentication** - Verify user identity
2. **Authorization** - Check permissions
3. **Input Validation** - Zod schemas
4. **CSRF Protection** - Token validation
5. **Rate Limiting** - Prevent abuse
6. **API Keys** - Scoped access

### Secrets management

Sensitive data handling:

- API keys stored encrypted
- Environment variables for server secrets
- Database for user credentials (hashed)
- Never log sensitive data

### Network security

- HTTPS recommended for production
- Origin validation for CSRF
- Trusted origins whitelist
- Secure cookie settings

## Deployment Architecture

### Docker (recommended)

Containerized deployment:

- Single container with all components
- Volume mounts for persistence
- Environment variables for configuration
- Health checks for monitoring

### Process model

Inside the container:

```
Main Process (Node.js)
├── SvelteKit Server (HTTP requests)
├── Service Manager (background services)
└── Worker Pool (concurrent tasks)
```

## Monitoring and Observability

### Logging

Structured logging throughout:

- Request/response logging
- Service activity logging
- Error logging with stack traces
- Configurable log levels

### Health checks

Endpoints for monitoring:

- `/api/health` - Basic health (DB connectivity, services)
- `/api/ready` - Ready for traffic (services started)
- Service status reporting

### Metrics

Key metrics tracked:

- Library size
- Download queue depth
- Search performance
- Error rates

## Future Architecture Considerations

### Potential enhancements

- **Read Replicas** - For very large libraries
- **Distributed Workers** - Separate worker processes
- **Plugin System** - Third-party extensions
- **GraphQL API** - Alternative to REST

### Current limitations

- Single-node design
- SQLite for database
- In-process workers
- File-system based storage

## Technology Stack Summary

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Frontend       | SvelteKit, Svelte 5, TypeScript |
| Backend        | Node.js, SvelteKit              |
| Database       | SQLite 3                        |
| Authentication | Better Auth                     |
| Validation     | Zod                             |
| Testing        | Vitest                          |
| Container      | Docker                          |

## See Also

- [Workers and Tasks](workers-and-tasks)
- [Quality Scoring](quality-scoring)
- [Design Decisions](design-decisions)
- [Database Schema](/reference/database/schema-overview) - Complete database structure
- [Getting Started](/getting-started/) - Installation and setup
