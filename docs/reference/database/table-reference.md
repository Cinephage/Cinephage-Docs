---
title: Table Reference
description: Database table reference for Cinephage
sidebar_position: 2
tags: [database, schema, tables, reference]
keywords: [database, tables, schema, sqlite]
---

# Table Reference

Cinephage uses SQLite for data storage. The database schema is managed automatically - you do not need to create tables manually.

## Overview

The database is organized into logical groups:

- **Media tables** - Movies, TV shows, episodes, and metadata
- **Configuration tables** - Settings, profiles, and user preferences
- **Download tables** - Queue, history, and client connections
- **Search tables** - Indexers, queries, and results

## Key Tables

| Table | Purpose | Notes |
|-------|---------|-------|
| `movies` | Movie library entries | Links to TMDB metadata |
| `series` | TV show library entries | Contains season/episode counts |
| `episodes` | Individual episodes | Links to `series` and files |
| `download_queue` | Active downloads | Status tracking and client mapping |
| `indexers` | Configured search sources | Instance config; YAML definitions themselves live on disk, not in this table |
| `settings` | Application configuration | Key-value store |
| `user` | User accounts | Better Auth table (singular name) |
| `apikey` | API key storage | Better Auth table (no underscore); the plaintext-recoverable secret lives in `userApiKeySecrets` |

## Schema Details

For a complete view of the database schema, including column types, indexes, and relationships, see the [Schema Overview](/reference/database/schema-overview).

## See Also

- [Schema Overview](/reference/database/schema-overview) - Complete database structure
- [Environment Variables](/reference/configuration/environment-variables) - Database configuration options
