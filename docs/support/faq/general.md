---
title: General FAQ
description: General questions about Cinephage, its features, and capabilities
sidebar_position: 1
tags: [faq, general, overview, features]
keywords: [faq, general, what is cinephage, features]
---

# General Questions

### What is Cinephage?

Cinephage is a unified, self-hosted media management platform that handles movies, TV shows, live TV, and streaming in one modern web interface. It combines content discovery, searching, downloading, and subtitle management into a single application with a single database.

### What can Cinephage do?

Cinephage provides comprehensive media management capabilities:

- **Movies** - Library management, monitoring, quality profiles, automatic downloads
- **TV Shows** - Episode tracking, season packs, automatic episode searches
- **Indexer Management** - YAML-based indexer definitions, built-in and custom support
- **Subtitles** - 13 subtitle providers with automatic syncing
- **Requests & Discovery** - Browse trending content, manage watchlists
- **Live TV & Streaming** - Live TV support via Stalker, XStream, M3U playlists
- **Radarr/Sonarr Compatibility** - Optional API layer (`/api/radarr`, `/api/sonarr`) so tools like autobrr, Overseerr/Jellyseerr, Pulsarr, and Notifiarr can connect directly, no separate Radarr/Sonarr instance needed - see [Configure Radarr/Sonarr Compatibility](/guides/configure/system/arr-compat)
- **Sidecar Files** - Optional Kodi-standard `.nfo` metadata and poster/fanart artwork written alongside imports, for accurate Jellyfin/Kodi metadata - see [Configure Sidecar Files](/guides/configure/system/sidecar-files)

### Is Cinephage free?

Yes! Cinephage is 100% free and open source under the GPL-3.0 license. There are no premium features, no subscriptions, and no paywalls.

### What are the advantages of Cinephage?

- Single unified application
- One database for all media types
- Consistent UI/UX across all features
- Lower resource usage (200-500MB typical)
- Straightforward setup and configuration
- Consistent automation rules

**Trade-off:** Unified design covers most common use cases; users needing highly specialized configurations per media type may prefer modular approaches.

### Can I import my existing media library?

Yes, you can import your existing library:
1. Configure Root Folders in Cinephage
2. Use Import feature to scan existing files
3. Cinephage will match to TMDB

Your files stay in place - Cinephage just creates its own database entries.

## Quick Command Reference

**Check Cinephage version:**
```bash
docker compose exec cinephage cat package.json | grep version
```

**View system info:**
```bash
docker compose exec cinephage env
```

## See Also

- [Getting Started](/getting-started/) - Installation and setup guide
- [Installation FAQ](/support/faq/installation) - Installation questions
- [Configuration FAQ](/support/faq/configuration) - Configuration help
- [Library Management](/support/faq/library) - Managing your media library
- [GitHub Repository](https://github.com/cinephage/cinephage) - Source code and releases
