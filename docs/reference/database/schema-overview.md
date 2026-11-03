---
title: Database Schema Overview
description: Overview of Cinephage's SQLite database structure and tables
sidebar_position: 1
tags: [database, schema, sqlite, reference]
keywords: [database, schema, sqlite, tables]
---

# Database schema overview

This reference provides an overview of Cinephage's database structure, including major tables and their relationships.

## Database Information

- **Engine:** SQLite 3
- **Location:** `/config/data/cinephage.db` (Docker) or `data/cinephage.db` (local)
- **Format:** Single-file database
- **Backup:** Simple file copy when Cinephage is stopped

## Schema Version

Cinephage uses schema versioning for migrations:

- Current schema version is stored in database metadata
- Automatic migrations run on startup when needed
- Backward compatibility maintained within major versions

## Major Table Categories

### Authentication (better auth)

User authentication and session management:

| Table             | Purpose                        |
| ----------------- | ------------------------------ |
| `user`            | User accounts and profile data |
| `session`         | Active authentication sessions |
| `account`         | OAuth/SSO account links        |
| `verification`    | Email verification tokens      |
| `apikey`          | API key storage                |
| `rateLimit`       | Rate limiting data             |

### Library

Core media library data:

| Table                  | Purpose                              |
| ---------------------- | ------------------------------------ |
| `movies`               | Movie metadata and monitoring status |
| `movie_files`          | Physical movie files                 |
| `series`               | TV shows metadata                   |
| `seasons`              | Season information                   |
| `episodes`             | Episode metadata                     |
| `episode_files`        | Physical episode files               |
| `root_folders`         | Configured Root Folders              |
| `libraries`            | First-class library entities (system + custom) |
| `library_root_folders` | Root folders assigned to each library |
| `unmatched_files`      | Files awaiting manual matching       |
| `library_scan_history` | Scan operation history               |

### Downloads

Download client integration:

| Table               | Purpose                        |
| ------------------- | ------------------------------ |
| `download_queue`    | Active downloads               |
| `download_history`  | Completed downloads            |
| `download_clients`  | Download client configurations |
| `blocklist`         | Failed/problematic releases    |
| `pending_releases`  | Releases awaiting download     |

### Indexers

Content source management:

| Table                 | Purpose                        |
| --------------------- | ------------------------------ |
| `indexers`            | Configured indexer instances   |
| `indexer_status`      | Health status tracking         |

Indexer YAML definitions themselves are not stored in a database table - they are loaded from `.yaml` files on disk (see [Environment Variables](../configuration/environment-variables) for `INDEXER_DEFINITIONS_PATH`/`INDEXER_CUSTOM_DEFINITIONS_PATH`).

### Quality

Scoring and quality management:

| Table                | Purpose                      |
| -------------------- | ---------------------------- |
| `scoring_profiles`   | Quality profile definitions  |
| `profile_size_limits`| Size constraints per profile |
| `custom_formats`     | Custom format rules          |
| `delay_profiles`     | Download delay settings      |

### Monitoring

Automated task management:

| Table                 | Purpose                  |
| --------------------- | ------------------------ |
| `monitoring_settings` | Task configuration       |
| `monitoring_history`  | Task execution history   |
| `task_settings`       | Background task settings |
| `task_history`        | Task run history         |

### Subtitles

Subtitle management:

| Table                | Purpose                      |
| -------------------- | ---------------------------- |
| `language_profiles`  | Language preference profiles |
| `subtitle_providers` | Provider configurations      |
| `subtitles`          | Downloaded subtitle records  |
| `subtitle_history`   | Download history             |
| `subtitle_blacklist` | Rejected subtitle entries    |
| `subtitle_settings`  | Global subtitle settings     |

### Smart Lists

Dynamic content lists:

| Table                      | Purpose             |
| -------------------------- | ------------------- |
| `smart_lists`              | List definitions    |
| `smart_list_items`         | Items in each list  |
| `smart_list_refresh_history`| List update history |

### Streaming

Streaming and NZB streaming:

| Table                    | Purpose                       |
| ------------------------ | ----------------------------- |
| `stream_extraction_cache`| Stream processing cache       |
| `nntp_servers`           | Usenet server configurations  |
| `nzb_stream_mounts`      | NZB streaming mounts          |
| `nzb_segment_cache`      | Segment caching for streaming |

### Live TV

Live TV:

| Table                    | Purpose                           |
| ------------------------ | --------------------------------- |
| `stalker_portals`        | Stalker portal configurations     |
| `portal_scan_results`    | MAC address scan results          |
| `portal_scan_history`    | Scan operation history            |
| `livetv_accounts`        | Live TV account configs (unified) |
| `livetv_channels`        | Channel information               |
| `livetv_categories`      | Channel categories                |
| `channel_categories`     | User category assignments         |
| `channel_lineup_items`   | User channel lineups              |
| `channel_lineup_backups` | Backup source configurations      |
| `epg_programs`           | Electronic program guide data     |

### System

Application settings and metadata:

| Table                    | Purpose                   |
| ------------------------ | ------------------------- |
| `settings`               | Application settings      |
| `library_settings`       | Library-specific settings |
| `naming_settings`        | File naming configuration |
| `naming_presets`         | Built-in naming presets   |
| `captcha_solver_settings`| Captcha solver config     |
| `media_browser_servers`  | Jellyfin/Emby connections |
| `external_id_cache`      | TMDB external ID cache    |
| `alternate_titles`       | Title aliases             |
| `userApiKeySecrets`      | API key secrets           |

## Key Relationships

### Movie relationships

```
movies
├── movie_files (one-to-many)
├── subtitles (one-to-many)
└── root_folders (many-to-one)
```

### TV shows relationships

```
series
├── seasons (one-to-many)
│   └── episodes (one-to-many)
│       ├── episode_files (one-to-many)
│       └── subtitles (one-to-many)
└── root_folders (many-to-one)
```

### Download flow

```
movies/episodes
└── download_queue (one-to-one while downloading)
    ├── download_clients (many-to-one)
    └── download_history (becomes history entry)
```

## Common Queries

Cinephage's schema is defined with Drizzle ORM, which maps camelCase JS property names to snake_case SQLite column names (e.g. the `tmdbId` field is stored in a `tmdb_id` column). The examples below use the actual on-disk snake_case column names, as required for raw `sqlite3` queries.

### List all movies

```sql
SELECT id, title, year, monitored, tmdb_id
FROM movies
ORDER BY title;
```

### Count monitored items

```sql
SELECT
  (SELECT COUNT(*) FROM movies WHERE monitored = 1) as monitored_movies,
  (SELECT COUNT(*) FROM series WHERE monitored = 1) as monitored_series;
```

### Recent downloads

```sql
SELECT
  dh.id,
  dh.title,
  dh.quality,
  dh.created_at
FROM download_history dh
ORDER BY dh.created_at DESC
LIMIT 10;
```

### Files missing quality info

```sql
SELECT
  m.title,
  m.year
FROM movies m
LEFT JOIN movie_files mf ON m.id = mf.movie_id
WHERE m.monitored = 1
  AND (mf.id IS NULL OR mf.quality IS NULL);
```

## Database Size Estimates

Typical database sizes:

| Library Size   | Database Size | Notes          |
| -------------- | ------------- | -------------- |
| 100 movies     | 1-2 MB        | Minimal        |
| 1,000 movies   | 5-10 MB       | Small library  |
| 10,000 movies  | 20-50 MB      | Medium library |
| 50,000+ movies | 100-200 MB    | Large library  |

Size factors:

- Number of movies/series/episodes
- Download history retention
- Subtitle records
- Cache tables

## Backup and Maintenance

### Creating backups

```bash
# While Cinephage is stopped
cp /path/to/config/data/cinephage.db /path/to/backups/cinephage-$(date +%Y%m%d).db

# Or use SQLite online backup (while running)
sqlite3 /path/to/config/data/cinephage.db ".backup /path/to/backups/cinephage-$(date +%Y%m%d).db"
```

### Database optimization

```bash
# Vacuum (reclaim space, optimize)
sqlite3 /path/to/config/data/cinephage.db "VACUUM;"

# Analyze (update statistics)
sqlite3 /path/to/config/data/cinephage.db "ANALYZE;"
```

Run optimization monthly or after large imports.

### Integrity check

```bash
# Check for corruption
sqlite3 /path/to/config/data/cinephage.db "PRAGMA integrity_check;"

# Should return "ok"
```

## Accessing the Database

### Docker access

```bash
# Enter container shell
docker exec -it cinephage sh

# Access database
sqlite3 /config/data/cinephage.db

# Or run query directly
docker exec cinephage sqlite3 /config/data/cinephage.db "SELECT COUNT(*) FROM movies;"
```

### Local access (if not using Docker)

```bash
# Direct access
sqlite3 /path/to/config/data/cinephage.db
```

## Schema Migrations

Cinephage handles schema migrations automatically:

1. Current version stored in database
2. On startup, check if migrations needed
3. Apply pending migrations in order
4. Update version number

:::warning
- Back up before major version upgrades
- Do not manually modify schema
- Report migration errors as bugs
:::

## See Also

- [Backup and Restore](/guides/deploy/backup-restore) - Data protection
- [Troubleshooting](/guides/deploy/troubleshooting) - Common issues
- [Performance Tuning](/guides/deploy/performance-tuning) - Optimization guide
- [SQLite Documentation](https://www.sqlite.org/docs.html)
