---
title: Roadmap
sidebar_position: 3
description: Planned features and upcoming development for Cinephage
tags: [roadmap, planning, features]
keywords: [roadmap, features, planning, future]
---

# Roadmap

Planned features, work in progress, and known limitations. For what has already shipped, see [Release History](/support/releases).

---

## Recently shipped

Items completed in recent releases.

| Feature | Version | Notes |
|---------|---------|-------|
| Multi-user accounts | v0.18.0 | Confined viewer sessions alongside admin, invites, bans, media-server account import/linking |
| Media requests | v0.18.0 | Seerr-style request system with quotas and notifications |
| Live TV | v0.18.0 | Cinephage Live provider, Stalker portals, M3U/Xtream accounts, EPG sync |
| Language profiles v2 | v0.18.0 | Rebuilt language system with library defaults, per-item overrides, and an effective-profile resolution chain |
| Subtitles overhaul | v0.18.0 | Per-requirement acquisition, atomic downloads, provider capability/rate-limit settings |
| Credential encryption at rest | v0.18.0 | All third-party credentials encrypted with an independently-rotatable key |
| Radarr/Sonarr API compatibility | v0.18.0 | Connect autobrr, Pulsarr, Notifiarr, Overseerr/Jellyseerr - see [Configure Radarr/Sonarr compatibility](/guides/configure/system/arr-compat) |
| NFO/artwork sidecar files | v0.18.0 | Kodi-standard `.nfo` + poster/fanart output alongside imports - see [Configure Sidecar Files](/guides/configure/system/sidecar-files) |
| Diagnostic Reports page | v0.17.0 | Rejected Releases, Import Failures, Renaming Failures tabs with retry/override actions and correlation tracing |
| SQLite database backup | v0.17.0 | Scheduled and on-demand database backups, separate from the existing configuration backup |
| Rename/scan operation locking | v0.17.0 | Mutual exclusion between renames and library scans to prevent crash-window data loss |
| Per-library quality profiles | v0.17.0 | Assign a different quality profile per library instead of one global profile |
| Multi-quality per movie | v0.14.0 | Keep more than one quality tier of the same movie, with a picker in the add flow |
| Real-Debrid / TorBox acquisition | v0.14.0 | Debrid-based acquisition alongside torrent/usenet clients |
| Storage insights & reconciliation | v0.14.0 | Duplicate/orphaned/broken-path/quality-below-cutoff detection with an actionable insights panel |
| File Management import options | v0.14.0 | Symlink/hardlink import modes, custom file permissions, recycle bin for replaced files |
| Calendar view | v0.10.0 | Month grid, day detail panel, Coming Up dashboard widget |
| qBittorrent v5 compatibility | v0.11.0 | Authentication fix for v5.2.0 API changes |
| Streaming provider settings | v0.8.0 | Cinephage IPTV wired into accounts, provider factory, and settings UI |
| Anime metadata | v0.11.0 | AniList/MAL providers with provider-aware enrichment and library support |
| Blocklist overhaul | v0.11.0 | Manual release blocking, metadata-level blocked media, bulk actions |
| RBAC and admin password reset | v0.7.0 | Role column, admin-only enforcement, password reset script |

---

## Current focus

### Notifications system

In Progress | Medium | **Area**: Infrastructure

Notify users of important events without constantly checking the UI.

**Planned channels**: Discord webhooks, email (SMTP), generic webhooks, Pushover, Telegram.

**Planned triggers**: download started/completed, import success/failure, health check failures, new content available.

**Related, already shipped**: media server refresh notifications (Jellyfin/Emby/Plex) and Radarr/Sonarr-compatible webhook notifications (for tools like Pulsarr/Notifiarr, via the [Radarr/Sonarr compatibility layer](/guides/configure/system/arr-compat)) already exist - this planned system is a separate, native notification channel (Discord/email/Pushover/Telegram) for notifying *you*, not other apps.

---

## Up next

### Tag-based monitoring profiles

Planned | Medium | **Area**: Monitoring

Apply different delay and upgrade rules based on content tags - for example, longer delays for anime or immediate grabs for documentaries. Currently delay profiles apply globally.

---

### Additional indexers

Planned | Medium | **Area**: Indexers

Expanding built-in YAML definitions for public trackers and usenet indexers. Priority targets include anime sources (SubsPlease, Anidex, AnimeTosho) and general trackers (ShowRSS, Tokyo Toshokan).

---

### External watchlist sync (Trakt, Letterboxd, Plex)

Planned | Medium | **Area**: Library

Sync "want to watch" lists from Trakt, Letterboxd, and Plex watchlists into Cinephage monitoring.

**Current state**: IMDb lists, TMDB lists, and JSON URL import are already available via Smart Lists. Trakt, Letterboxd, and Plex watchlists are not yet implemented.

---

## Future plans

### Enhanced streaming provider support

Under Consideration | Medium | **Area**: Streaming

Real-time availability checking across streaming services beyond the current TMDB watch provider data.

---

### Music, books, and audiobook support

Not Yet Started | Low | **Area**: Library

Extend the unified media library beyond video content. Each requires dedicated metadata sources (MusicBrainz, OpenLibrary) and format-specific indexers.

---

## Known limitations

| Limitation | Workaround |
|------------|------------|
| Cloudflare-protected indexers may fail | Built-in captcha solver covers many cases; some sites remain unreliable |
| Trakt/Letterboxd watchlist import not available | Use IMDb list or JSON URL import via Smart Lists |

---

## Contributing

Feature requests and bug reports are tracked on [GitHub Issues](https://github.com/cinephage/cinephage/issues). Community input on prioritization is welcome via [GitHub Discussions](https://github.com/cinephage/cinephage/discussions).
