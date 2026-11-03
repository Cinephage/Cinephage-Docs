---
title: Release History
description: Cinephage version history, release notes, and Docker tags
sidebar_position: 2
tags: [releases, versions, changelog]
keywords: [releases, versions, stable, dev]
---

# Release History

Cinephage follows semantic versioning and maintains two release channels.

## Release channels

| Channel | Docker Tag | Description |
|---------|------------|-------------|
| **Stable** | `latest` or `vX.Y.Z` | Production-ready releases |
| **Preview** | `dev` | Latest development builds |

```bash
# Stable
docker pull ghcr.io/cinephage/cinephage:latest
docker pull ghcr.io/cinephage/cinephage:v0.18.0   # pinned

# Preview
docker pull ghcr.io/cinephage/cinephage:dev
```

| Use Case | Recommended tag |
|----------|----------------|
| Production | `latest` or pinned `vX.Y.Z` |
| Testing new features | `dev` |
| Reproducible deploys | pinned `vX.Y.Z` |

---

## Latest - v0.18.0 (2026-11-01)

**Multi-user accounts** - Cinephage now supports multiple accounts instead of a single admin: confined "viewer" sessions (read-only library/discover access, own profile/preferences/sessions), admin-managed invites and bans, per-user avatars and theme preference, and importing accounts from a connected media server's own user directory. Viewer accounts can link to Jellyfin via Quick Connect.

**Media requests** - A Seerr-style request system: viewers submit movie/TV requests, admins approve/decline with quotas and notifications, and decided requests can be deleted/backfilled.

**Radarr/Sonarr compatibility** - A new API layer at `/api/radarr` and `/api/sonarr` mirrors the real Radarr/Sonarr v3 API shape for third-party tools (autobrr release pushes, Pulsarr/Notifiarr webhooks, Overseerr/Jellyseerr connections, exclusion lists).

**Live TV** - A new feature area: the Cinephage Live provider, Stalker-portal and M3U/Xtream account support, a responsive/observable EPG sync, Unicode-aware channel matching, and DaddyLive HLS stream unwrapping.

**Language system v2** - Rebuilt language profiles with a dedicated Languages & Localization settings hub, library-level defaults with per-item overrides and an effective-profile resolution chain, canonical ISO 639-2/3 tag mapping, and metadata/discover filtering driven by the new language settings.

**Subtitles overhaul** - Per-requirement acquisition (not just a single profile), atomic downloads with a single history write, provider capability/rate-limit/priority settings, a reconcile scanner for orphaned subtitle files, and requirement-aware badges throughout the UI.

**Security** - All third-party credentials (download clients, indexers, subtitle providers, Live TV, metadata API keys, NNTP) are now encrypted at rest with a versioned AEAD envelope, independently rotatable from the auth secret via `ENCRYPTION_MASTER_KEY`/`ENCRYPTION_PREVIOUS_KEYS`.

**Library** - NFO/poster/fanart sidecar files (written on import and manual match, kept in sync through rename/upgrade, with a manual regeneration task), a "Change Match" action to rematch an already-added title, restrictive file-permission repair, and TV library sort/filter by missing episodes.

**Import wizard** - Step 2/3 redesigned into a master-detail layout (sidebar list + detail editor instead of a stacked single list), bulk imports now run through durable, worker-pooled jobs with Activity visibility instead of an in-memory queue, and every wizard-driven import (success or failure) is recorded to Activity history.

**Unmatched downloads** - Linking an in-progress or already-downloaded torrent/NZB with no library match directly from Activity, with TMDB match suggestions and sortable/filterable columns matching the rest of the Activity page.

**Platform** - Migrated to SvelteKit 3 + `adapter-node` 6 (breaking internal change, no user-facing action needed). New indexer definitions added (Blutopia, Nebulance, PassThePopcorn, Aither, TorrentLeech, SuperBits, LST, C411, TR4KER, Usenet-Crawler).

[Full release notes](https://github.com/Cinephage/Cinephage/releases/tag/v0.18.0)

---

## Recent releases

### v0.17.0 (2026-09-09)

**Diagnostics** - New Reports page with Unmatched Imports, Rejected Releases, Import Failures, and Renaming Failures tabs, correlation-ID tracing back to the actual log entries, per-item retry/force-grab.

**Reliability** - Rename and library-scan operations now hold a mutual-exclusion lock so a scan can't run concurrently with a rename and corrupt state mid-operation; crash-window healing recovers renamed/moved items from rename history on the next scan instead of losing track of them. Bulk renames use a two-step confirmation with a media-server warning and are capped at 500 items per batch. Several unbounded full-table scans across the dashboard, library pages, and monitoring that were blocking the event loop under load were eliminated, and the file watcher moved from chokidar to `@parcel/watcher` to fix inotify-handle exhaustion on large libraries.

**Library** - Quality profiles can now be assigned per library instead of one profile globally. A partially-monitored indicator shows on TV series where only some episodes are monitored.

**Backup** - New SQLite database backup feature (scheduled and on-demand), separate from the existing configuration backup.

**Streaming & naming** - Remuxable `.strm` entry points with DASH support and self-healing gateway identity. Specials (season 0) folder naming support. Naming tokens are now whitespace-tolerant with documentation-name aliases.

**Bug fixes** - Idempotent inserts across media-matcher tables (movie files, seasons, episodes, episode files) prevent duplicate-key crashes on re-scan. qBittorrent structured-response parsing fixed. Duplicate torrent tracking prevented.

[Full release notes](https://github.com/cinephage/cinephage/releases/tag/v0.17.0)

---

## Recent releases

### v0.16.0 (2026-08-08)

Unraid Community Applications template (`ca_profile.xml`) added at the repo root for CA submission.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.16.0)

### v0.15.1 (2026-08-08)

License text fix: restored the canonical GPL-3.0 license text so GitHub and Unraid CA license detection recognize it correctly.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.15.1)

### v0.15.0 (2026-08-03)

Added Russian (ru) localization.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.15.0)

### v0.14.0 - v0.14.2 (2026-07-31)

**Multi-quality & acquisition** - Movies can now keep more than one quality tier at once, with a desired-qualities picker in the add flow and opt-in removal of unwanted tiers. Real-Debrid and TorBox acquisition added alongside existing torrent/usenet download clients.

**Storage insights** - New insights panel detects duplicates, orphaned files, broken paths, quality-below-cutoff files, and content missing from your media server, with a reconciliation system and SSE-driven live updates on the Storage Maintenance page.

**File Management** - Symlink and hardlink import modes, custom file-permission/chmod control, a recycle bin for files replaced during import, minimum free-space checks, and bulk multi-select move/copy in the file browser.

**Indexers** - Native definitions added for SeedPool, DigitalCore, TorrentGalaxy Clone, BT4G, Magnetz, and TheRARBG. Jackett and Prowlarr integrations migrated to their native JSON search APIs.

**Subtitles** - Per-file subtitle search, download, and sync for movies with multiple quality files, linked to the specific movie file rather than the movie as a whole.

**Bug fixes** - v0.14.1 and v0.14.2 were dependency/security patch releases (11 vulnerability advisories resolved) with no feature changes. Also in this range: fixed multi-season pack search missing `S01-S07`-style releases, fixed a CPU lockout during folder scans on NAS-backed Docker volumes, and fixed an infinite `/api/discover` request loop in debug mode.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.14.0)

### v0.13.0 (2026-06-29)

**Storage maintenance** - Collapsible library rows with labeled badges (Monitored, Auto-search, Subtitles) and a direct link to each library. Sortable, filterable Top Played and Largest Items tables with type filter (All/Movies/Episodes), item count, and show-more pagination. Disk usage bar legend now labels each segment (Cinephage / Other / Free) on both mobile and desktop. Free space is deduplicated across root folders that share the same physical disk so totals are never counted twice. Dashboard storage card links directly to the Storage Maintenance page.

**Quality profiles** - New Prevent Resolution Downgrades toggle (enabled by default on all profiles) blocks a higher-scoring lower-resolution release from replacing an existing file. Failed downloads now have a 1-hour cooldown before a re-grab attempt. Releases with unknown file sizes are rejected when size limits are configured.

**Naming tokens** - New `{OriginalTitle}` and `{OriginalCleanTitle}` tokens expose the media's original-language title for use in file and folder naming patterns.

**Library detail** - Redesigned movie detail header with improved layout and metadata. Mobile sticky action bar. TV series contextual back button restores library scope on navigation.

**Discover** - Hero enriched with video clips and backdrops. Keyword blocklist now filters dashboard sections and takes effect without a restart.

**Bug fixes** - Vanished download recovery via client path reconstruction with auto-retry. Root folder path validation no longer incorrectly flags self-overlap on edit. Old theatrical-only movies now show as Released after 3 years.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.13.0)

### v0.12.0 (2026-06-23)

**Activity overhaul** - Failed downloads moved from the Active tab to History. Queue cards work across both tabs. Contextual status labels replace the generic active-download count.

**Search and indexers** - Smarter title selection reduces indexer load. Season pack scoping and category mapping fixed. Torznab URL auto-discovery added. Orphaned managed indexers auto-disabled on connection test failure. Profile-driven upgrades now work between streaming and downloaded media.

**Library and importer** - Library-scoped monitor-all works correctly in custom libraries for both movies and TV. Root folders shown in the folder browser. Manual importer hides media type filter when launched from a library item. Season override added to Match Folder modal for unparseable filenames. Absolute episode numbering fixed for unmatched file auto-matching. Anime content defaults to Anime series type on add via Discover.

**Media server integration** - Notifications sent to Plex/Emby/Jellyfin on file rename. Connection testing and version tracking improved.

**Parser** - Fansub and BD-BOX naming conventions handled. Fansub "S1 - NN" notation no longer mis-detected as a multi-season pack.

**Bug fixes** - Date/time handling is now i18n-aware with timezone safety. User-created custom format edit/delete fixed. Blocked keywords persist across server restarts. CSRF replaced with a proper LAN origin guard. Coming Up dashboard items are now clickable links to library detail pages.

[Full release notes](https://github.com/cinephage/cinephage/releases/tag/v0.12.0)

### v0.11.0 (2026-05-29)

Anime metadata with AniList/MAL providers, provider-aware enrichment, provider links on detail views, and metadata provider override support. Blocklist overhaul with manual release blocking from search results, configurable block durations, and metadata-level blocked media with 3-layer guard architecture. Activity type tags and status popovers. Library slide-out sort/filter/display drawer with persistent settings. Stalled download auto-fail with configurable timeout and auto-blocklist when no seeders found.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.11.0)

### v0.10.0 (2026-04-28)

Calendar page with month grid, day detail panel, and Coming Up dashboard widget. Adds `releaseDate`/`firstAirDate` to movies and series with TMDB caching.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.10.0)

### v0.9.0 (2026-04-28)

Movie collection support in schema, naming system, and APIs. Metadata refresh task and improved TMDB caching.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.9.0)

### v0.8.0 (2026-04-27)

Cinephage IPTV integration replacing IPTV-org sync. Adds native IPTV account form, country proxy, and backup URL support.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.8.0)

### v0.7.0 (2026-04-26)

:::warning[Breaking changes]
- **`BETTER_AUTH_SECRET`** must now be set as an environment variable. The auto-generated `.auth-secret` fallback is removed. Copy `data/.auth-secret` into the env var before upgrading or all sessions and API keys will be lost.
- **Subtitles analytics endpoint** (`/api/subtitles/providers/analytics`) response shape changed - analytics object removed, provider fields now at top level.

See the [Migration Guide](/guides/deploy/migration) for step-by-step instructions.
:::

RBAC with admin password reset, full i18n via Paraglide JS v2 (Spanish), native subtitle sync engine, Plex integration, rTorrent and Transmission clients, Torznab protocol, backup/restore with encrypted secrets, rate limiting, and extensive security hardening.

[Release notes](https://github.com/cinephage/cinephage/releases/tag/v0.7.0)

---

## Version history

All versions with key highlights. Click any link for full details.

| Version | Date | Highlights |
|---------|------|------------|
| [v0.17.0](https://github.com/cinephage/cinephage/releases/tag/v0.17.0) | 2026&#8209;09&#8209;09 | Diagnostics/Reports page; rename/scan operation locking; per-library quality profiles; SQLite database backup |
| [v0.16.0](https://github.com/cinephage/cinephage/releases/tag/v0.16.0) | 2026&#8209;08&#8209;08 | Unraid Community Applications template |
| [v0.15.1](https://github.com/cinephage/cinephage/releases/tag/v0.15.1) | 2026&#8209;08&#8209;08 | GPL-3.0 license text fix for GitHub/Unraid CA license detection |
| [v0.15.0](https://github.com/cinephage/cinephage/releases/tag/v0.15.0) | 2026&#8209;08&#8209;03 | Russian (ru) localization |
| [v0.14.0](https://github.com/cinephage/cinephage/releases/tag/v0.14.0) | 2026&#8209;07&#8209;31 | Multi-quality per movie; Real-Debrid/TorBox acquisition; storage insights & reconciliation; File Management import options |
| [v0.13.0](https://github.com/cinephage/cinephage/releases/tag/v0.13.0) | 2026&#8209;06&#8209;29 | Storage maintenance UX; OriginalTitle naming tokens; prevent resolution downgrades; library detail redesign |
| [v0.12.0](https://github.com/cinephage/cinephage/releases/tag/v0.12.0) | 2026&#8209;06&#8209;23 | Activity overhaul; search/indexer fixes; library importer improvements; media server notifications on rename |
| [v0.11.0](https://github.com/cinephage/cinephage/releases/tag/v0.11.0) | 2026&#8209;05&#8209;29 | Anime metadata (AniList/MAL); blocklist overhaul; stalled download auto-fail |
| [v0.10.0](https://github.com/cinephage/cinephage/releases/tag/v0.10.0) | 2026&#8209;04&#8209;28 | Calendar page with Coming Up widget; releaseDate/firstAirDate metadata |
| [v0.6.0](https://github.com/cinephage/cinephage/releases/tag/v0.6.0) | 2026&#8209;04&#8209;25 | Skip stream probing for instant playback; seeding limit fixes for Transmission and Deluge |
| [v0.5.0](https://github.com/cinephage/cinephage/releases/tag/v0.5.0) | 2026&#8209;04&#8209;21 | List view with auto/manual grab; enhanced EPG and IPTV; symlinked file import; bulk library operations. Same breaking changes as v0.7.0. |
| [v0.2.0](https://github.com/cinephage/cinephage/releases/tag/v0.2.0) | 2026&#8209;04&#8209;17 | Unified status page; isPlayed/playedPercentage indicators; redesigned media explorer filter bar |
| [v0.1.0](https://github.com/cinephage/cinephage/releases/tag/v0.1.0) | 2026&#8209;04&#8209;15 | Initial public release - Live TV, captcha solver, NZB/NNTP streaming, smart lists, subtitle support, Docker and NixOS |

Patch releases (v0.1.1-v0.4.0, v0.6.1, v0.7.1-v0.7.4, v0.8.1-v0.8.2, v0.9.1, v0.14.1-v0.14.2) contained bug fixes, dependency/security updates, and CI improvements only. See the [GitHub Releases page](https://github.com/cinephage/cinephage/releases) for complete details on every release.

---

## See Also

- [Migration Guide](/guides/deploy/migration) - Upgrading between versions with breaking changes
- [Backup and Restore](/guides/deploy/backup-restore) - Back up before updating
- [Roadmap](/support/roadmap) - What is coming next
