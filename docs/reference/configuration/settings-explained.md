---
title: Settings Explained
sidebar_position: 2
description: Comprehensive reference for all Cinephage settings configured through the web interface
tags: [settings, configuration, reference]
keywords: [settings, configuration, ui, web interface]
---

# Settings explained

This reference provides detailed explanations of all settings available in Cinephage's web interface. For environment variables (Docker/command-line configuration), see [Environment Variables](./environment-variables).

## Overview

Cinephage settings are organized into categories accessible from the **Settings** menu:

| Category | Purpose |
|----------|---------|
| **General** | Core application settings |
| **Media Management** | Root folders, file naming, import behavior |
| **Profiles** | Quality profiles, language profiles, Custom Formats |
| **Integrations** | Download clients, indexers, subtitle providers, notifications |
| **Tasks** | Monitoring task configuration |
| **Live TV** | Live TV provider configuration |

---

## General Settings

### Basic configuration

#### TMDB API Key

**Path:** `Settings > General > TMDB API Key`

Your API key from [The Movie Database](https://www.themoviedb.org/). Required for fetching movie and TV show metadata.

- **Format:** 32-character alphanumeric string
- **Required:** Yes
- **Default:** None

:::info[API Key Location]
The API key is a 32-character string found in your TMDB account **Settings > API section**. The "Read Access Token" is not used for this setting.
:::

#### External URL

**Path:** `Settings > General > External URL`

The public-facing URL for your Cinephage instance. Used for generating external links and webhook callbacks.

- **Format:** Full URL with protocol
- **Examples:**
  - `http://192.168.1.100:3000`
  - `https://cinephage.yourdomain.com`
- **Required:** No

:::note
If not set, Cinephage uses the `BETTER_AUTH_URL` environment variable or infers from incoming requests.
:::

### Security

#### Authentication

Every `/api/*` route (other than `/api/health`, `/api/ready`, and `/api/auth/*`) requires a valid session or API key - this isn't a toggle, it's always on. Passwords require a minimum of 8 characters, and sessions last 7 days; neither is currently user-configurable.

**Path:** `Settings > System > General`

The General settings page itself covers:

| Setting | Description |
|---------|-------------|
| **API Keys** | A full-access main key, plus a separately-scoped media-streaming key (M3U/EPG/Live TV streams only, no library or settings access) |
| **External URL** | The public URL Cinephage is reached at, used for links sent in notifications and for reverse-proxy/subpath deployments |
| **Radarr/Sonarr Compatibility** | Enable the `/api/radarr` and `/api/sonarr` API layer - see [Configure Radarr/Sonarr compatibility](/guides/configure/system/arr-compat) |

#### User accounts and roles

**Path:** `Settings > Users`

Cinephage supports multiple accounts: an **admin** role with full access, and a confined **viewer** role (read-only library/discover access, own profile/preferences/sessions, can submit media requests). Admins create invites, manage bans, and can import accounts from a connected media server's user directory. See [Configure User Accounts](/guides/configure/system/user-accounts).

#### Credential encryption

Third-party credentials (download clients, indexers, subtitle providers, Live TV, metadata API keys, NNTP) are encrypted at rest with a key independent of the auth secret, set via the `ENCRYPTION_MASTER_KEY` environment variable (rotatable via `ENCRYPTION_PREVIOUS_KEYS` without re-entering every credential) - see [Environment Variables](environment-variables).

---

## Media Management

### Root folders

**Path:** `Settings > Media Management > Root Folders`

Root folders define where Cinephage stores your media library. You need at least one root folder for movies and one for TV shows.

| Property | Description | Example |
|----------|-------------|---------|
| **Name** | Display name for the folder | "Movies", "TV Shows" |
| **Path** | Absolute path inside container | `/media/movies` |

:::warning[Docker Paths]
When using Docker, use the **container path**, not the host path:
- ✅ Correct: `/media/movies` (if mounted as `/media`)
- ❌ Incorrect: `/mnt/media/movies` (host path)
:::

#### Root Folder Properties

| Property | Description | Requirement |
|----------|-------------|-------------|
| **Name** | Display name for the folder | Required, unique identifier |
| **Path** | Absolute path inside container | Required, must exist |
| **Media Type** | Movies or TV Shows | Required, determines content type |
| **Quality Profile** | Default quality profile for imports | Optional, defaults to system default |

:::caution[Path Requirements]
- Cinephage requires read/write permissions to the path
- Root folders must not be nested within each other
- Each root folder should be on a separate mount point
:::

### File naming

**Path:** `Settings > Media Management > Naming`

Configure how files and folders are named when importing or organizing media.

#### Folder Naming Pattern

Template used for creating media folders:

```
{Movie Title} ({Release Year})
```

**Available Tokens:**

| Token | Description | Example |
|-------|-------------|---------|
| `{Movie Title}` | Full movie title | "The Matrix" |
| `{Release Year}` | Release year | "1999" |
| `{IMDb Id}` | IMDb identifier | "tt0133093" |
| `{TMDB Id}` | TMDB identifier | "603" |

#### File Naming Pattern

Template used for renaming media files:

```
{Movie Title} ({Release Year}) - {Quality} - {Group}
```

**Available Tokens:**

| Token | Description | Example |
|-------|-------------|---------|
| `{Quality}` | Quality string (Source-Resolution) | "BluRay-1080p" |
| `{Group}` | Release group | "YIFY" |
| `{Edition}` | Edition tag | "Director's Cut" |
| `{Codec}` | Video codec (alias of `{VideoCodec}`) | "x264" |
| `{AudioCodec}` | Audio codec | "DTS" |

This is a shortened list - see [Organize Your Files](/guides/use/organize-files) for the complete token reference (resolution/source split out, quality-with-flags, audio channels, HDR, original-language title, and the TV-specific tokens).

:::info[Custom Naming Patterns]
Custom naming patterns combine multiple tokens to create specific folder and file naming schemes. Example: `{Movie Title} ({Release Year}) [{Quality}][{Codec}]-{Group}`
:::

### Import behavior

**Path:** `Settings > Media Management > Import`

Configure how Cinephage handles file imports:

| Setting | Description | Options |
|---------|-------------|---------|
| **Import Method** | How files are moved/copied | Copy, Move, Hardlink, Symlink |
| **Delete Empty Folders** | Remove empty source folders after import | Yes/No |
| **Skip Free Space Check** | Import even if low disk space | Yes/No |

#### Import Methods Explained

| Method | Description | Use Case |
|--------|-------------|----------|
| **Copy** | Duplicates the file | Keeps original in download folder |
| **Move** | Relocates the file | Frees space in download folder |
| **Hardlink** | Creates second reference to same data | Efficient, no duplication |
| **Symlink** | Creates pointer to original file | Links to download folder |

:::info[Hardlink Efficiency]
Hardlinks are most efficient when the download folder and library are on the same filesystem, as they reference the same underlying data without duplication while allowing seeding to continue.
:::

---

## Profiles

### Quality profiles

**Path:** `Settings > Library > Quality`

Cinephage uses an additive **scoring** system, not a tiered "allowed qualities" list - every release gets a point score from its resolution, source, codec, HDR format, audio, and release group, and profiles differ by how they weight those factors and where their upgrade threshold sits, not by a fixed list of permitted qualities. See [Quality Scoring Explained](/explanation/quality-scoring) for how scoring works and [Set Up Quality Profiles](/guides/configure/quality/quality-profiles) for configuring profiles.

#### Built-in Profiles

Cinephage ships with four built-in profiles - **Quality**, **Balanced**, **Compact**, and **Streamer** - each with its own format scores, minimum score, and upgrade-until score. See [Set Up Quality Profiles](/guides/configure/quality/quality-profiles) for what each one favors.

#### Custom Profile Properties

| Property | Description | Required |
|----------|-------------|----------|
| **Name** | Unique profile identifier | Yes |
| **Format Scores** | Points assigned per resolution/source/codec/HDR/audio/group | Yes |
| **Minimum Score** | Lowest total score a release must reach to be grabbed | Yes |
| **Upgrade-Until Score** | Score at which Cinephage stops searching for a better release | Yes |
| **Upgrades Allowed** | Whether to search for better versions after the initial grab | Yes, default: Enabled |

### Language profiles

**Path:** `Settings > Library > Media Languages`

A profile sets an audio-language preference, an ordered list of subtitle requirements (language + variant + accessibility), a cutoff rank, a minimum score, and whether upgrades are allowed. Profiles apply at the instance level by default, with per-library and per-item overrides - see [Language Profiles](/guides/configure/languages/language-preferences) and [Configure Subtitles](/guides/configure/languages/subtitles) for the full field reference.

### Custom formats

**Path:** `Settings > Library > Quality Settings` (**Custom Formats** tab)

Create custom scoring rules based on release attributes. A condition can be set to **Must Contain**, **Must Not Contain**, or **Should Contain** (optional, adds score only if matched), combined with AND/OR logic across multiple conditions.

#### Format Conditions

A condition matches on one of several attribute types, including:

| Type | Example |
|------|---------|
| **Release Title** | Contains "REMUX" |
| **Resolution** | Contains "2160p" |
| **Source** | Contains "BluRay" |
| **Codec** | Contains "HEVC" |
| **Release Group** | Contains "YIFY" |
| **HDR** | Contains "HDR10" |

This is a shortened list - see [Custom Formats](/guides/configure/quality/custom-formats) for the full condition-type reference (audio codec/channels/Atmos, streaming service, indexer, language, release flags) and worked examples.

#### Scoring

Assign any positive or negative integer score to a format; a profile then decides how much weight to actually give it (see [Quality profiles](#quality-profiles) above). A large negative score (around -1000 or lower) functions as an effective reject, since it drags a release's total score well below any profile's minimum.

:::info[Example: HEVC Preference]
A custom format matching releases containing "HEVC" or "H.265" with a +50 score prefers more efficient codecs without rejecting other options.
:::

---

## Integrations

### Download clients

**Path:** `Settings > Integrations > Download Clients`

Configure connections to download clients for automated downloading. Beyond qBittorrent, SABnzbd, and NZBGet below, Cinephage also supports **Deluge**, **rTorrent**, and **Transmission** - see the [Download Clients](/guides/configure/download-clients) guide for the full list and per-client setup.

#### qBittorrent

**Required Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name | "qBittorrent" |
| **Host** | IP or hostname | `192.168.1.50` |
| **Port** | Web UI port | `8080` |
| **Username** | Web UI username | `admin` |
| **Password** | Web UI password | `********` |
| **URL Base** | Optional path prefix | `/qbittorrent` |

**Optional Settings:**

| Setting | Description | Default |
|---------|-------------|---------|
| **Category** | qBittorrent category | `cinephage` |
| **Priority** | Download priority | `Normal` |

#### SABnzbd

**Required Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name | "SABnzbd" |
| **Host** | IP or hostname | `192.168.1.50` |
| **Port** | SABnzbd API port | `8080` |
| **API Key** | SABnzbd API key | `abc123...` |

**SABnzbd Client Behavior:**

| Option | Description |
|--------|-------------|
| **Standard SABnzbd** | Default SAB workflow |
| **Altmount / NZBDav (Mount Mode)** | Enables mount-mode behavior for `.strm` imports |

#### NZBGet

**Required Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name | "NZBGet" |
| **Host** | IP or hostname | `192.168.1.50` |
| **Port** | NZBGet port | `6789` |
| **Username** | NZBGet username | `nzbget` |
| **Password** | NZBGet password | `********` |

:::note
Cinephage no longer exposes a separate NZB-Mount client type. Use **SABnzbd** and choose **Altmount / NZBDav (Mount Mode)** when needed.
:::

### Indexers

**Path:** `Settings > Integrations > Indexers`

Configure search sources for finding releases.

#### Indexer Configuration Fields

| Field | Description | Required |
|-------|-------------|----------|
| **Name** | Display name for the indexer | Yes |
| **Type** | Built-in indexer or Custom YAML | Yes |
| **API Key** | Authentication key for the indexer | Varies by indexer |
| **Categories** | Content categories to search | Optional |
| **Priority** | Search priority (lower = higher priority) | Optional, default: 25 |
| **Enabled** | Whether the indexer is active | Yes, default: Enabled |

:::info[Indexer Priority]
Lower priority values indicate higher search priority. Indexers with priority 1 are searched first, while those with 50+ are searched later. Set higher values for slower indexers or those with rate limits.
:::

#### Indexer Priority

Priority determines search order:

| Priority | Behavior |
|----------|----------|
| **1** | Highest priority, searched first |
| **25** | Default priority |
| **50+** | Lower priority, searched later |

#### Custom YAML Indexers

Trackers not in the built-in list require a custom YAML definition containing:

| Component | Description |
|-----------|-------------|
| **YAML Definition** | Indexer configuration in YAML format |
| **Credentials** | API key, username, or other authentication |

:::info[YAML Format]
Custom YAML indexers must follow the Prowlarr/Jackett indexer definition format. The YAML is validated before saving.
:::

### Subtitle providers

**Path:** `Settings > Integrations > Subtitle Providers`

Cinephage ships with 12 supported subtitle providers (OpenSubtitles.com, OpenSubtitles.org, Addic7ed, SubDL, YIFYSubtitles, Gestdown, Subf2m, NapiProjekt, LegendasDivx, BetaSeries, Assrt, and Podnapisi) - each toggled independently and, where required, configured with its own credentials. See [Configure Subtitles](/guides/configure/languages/subtitles) for the full provider table and setup steps.

### Notifications

**Path:** `Settings > Integrations > Notifications`

Configure media server integrations and notifications.

#### Media Server Connect

This feature connects Cinephage to your media server so it can push library-update notifications directly, rather than waiting on the server's own folder scan.

| Server | Library update | Item deletion via API |
|--------|-----------------|------------------------|
| **Jellyfin** | Yes | Yes |
| **Emby** | Yes | Yes |
| **Plex** | Yes | No (Plex has no item-deletion API; Cinephage skips this step for Plex servers) |

#### Notification Triggers

Each connected server can be toggled independently for which events trigger a library-update push:

- **On Import** - a new file was imported into the library
- **On Upgrade** - an existing file was replaced with a better one
- **On Rename** - a file was renamed/moved (e.g. after a naming-pattern change)
- **On Delete** - an item was removed from the library

There is no "On Grab" or "On Health Issue" trigger for this feature - those are separate concepts (Grab is logged to Activity; health issues surface on the Status Page, below).

---

## Tasks

**Path:** `Settings > Tasks`

Configure background monitoring tasks that run automatically.

### Task overview

| Task | Purpose | Default Interval |
|------|---------|------------------|
| **Missing Content Search** | Find and download missing episodes/movies | Daily (24 hours) |
| **Upgrade Search** | Search for better quality versions | Weekly (168 hours) |
| **New Episode Check** | Search for recently aired episodes | Hourly |
| **Cutoff Unmet Search** | Search for items below quality cutoff | Daily |
| **Pending Release Processing** | Process releases waiting in the delay profile queue | 15 minutes |
| **Smart List Refresh** | Update dynamic lists from TMDB | Hourly |
| **Missing Subtitles Search** | Search for missing subtitle languages | 6 hours |
| **Subtitle Upgrade Search** | Search for better subtitle scores | Daily |
| **Library Reconciliation** | Reconcile library/root folder assignments | 6 hours |
| **Request Sweep** | Expire stale pending media requests, re-drive approvals waiting on a writable target, re-check active requests against library availability, prune read notifications | Hourly |
| **Metadata Refresh** | Refresh titles, overviews, posters, air dates, and other TMDB metadata for the whole library | Daily (minimum 24h - a full refresh hits TMDB per-episode) |
| **History Cleanup** | Purge old history entries | Daily |
| **Database Backup** | Back up the SQLite database | Daily |

There is no "RSS Sync" task. Beyond these scheduled tasks, Cinephage also has manual-only maintenance tasks (Library Scan, Update .strm URLs, Reprobe .strm Media Info, Regenerate Sidecar Files, and others) that you trigger on demand rather than on an interval.

### Task configuration

Each task has:

| Setting | Description |
|---------|-------------|
| **Enabled** | Turn task on/off |
| **Interval** | How often to run |
| **Last Run** | When task last executed |
| **Next Run** | When task will execute next |
| **Status** | Current state (idle/running) |

:::caution[Rate Limiting]
Very short task intervals may trigger rate limiting from indexers or TMDB. The minimum recommended interval depends on the number of configured indexers and API usage.
:::

### Task history

View detailed history of task execution:

- Items processed
- Success/failure counts
- Execution duration
- Error messages

---

## Status Page (v0.5.0+)

**Path:** `Settings > Monitoring > Status`

The unified status page provides a consolidated view of your Cinephage library, replacing separate maintenance and server-stats pages. It has four tabs:

### Overview

Storage dashboard (total/used/free space, per-root-folder breakdown, storage insights/forecasting), the manual **Scan Library** / **Sync Media Server Stats** actions, and live scan progress while a scan is running.

### Folders

Per-root-folder detail - usage, validation, and the folder edit/scan actions, pulled out of the Overview tab into their own view.

### Libraries

Per-library detail (one row per configured library, not per root folder) with the same library-edit actions available under **Settings > Library > Libraries**.

### Media

A searchable, filterable explorer across your entire catalog - filter by media type, resolution, video/audio codec, HDR format, container, root folder, and monitored status. This is a catalog browser, not a media-server connection status indicator - media server connect/sync status lives under **Settings > Integrations > Notifications** instead.

---

## Backup & Restore (v0.5.0+)

**Path:** `Settings > System > Backup & Restore`

Create encrypted configuration backups and restore from them.

### Creating backups

1. Navigate to **Settings > System > Backup & Restore**
2. Click **Create Backup**
3. Backup includes:
   - All settings
   - Database configuration
   - Encrypted secrets (API keys, passwords)
   - User accounts and preferences

### Restoring from backup

1. Click **Restore from Backup**
2. Select backup file
3. Confirm restoration
4. Cinephage will restart with restored configuration

:::warning[Backup Compatibility]
Backups are compatible within the same major version. Cross-version restores may require manual adjustments.
:::

### Automated backups

Configure automatic backups via environment variables or scheduled tasks:

| Setting | Description | Default |
|---------|-------------|---------|
| **Backup Interval** | How often to create backups | Disabled |
| **Retention** | Number of backups to keep | 7 |
| **Location** | Where to store backup files | `./config/backups` |

---

## Account Profile

**Path:** `/profile` (via the user avatar menu, not nested under Settings)

Cinephage has no built-in media player, so there are no playback preferences (no auto-play, streaming quality, or subtitle-display toggle) - those concerns belong to whichever media server (Jellyfin/Emby/Plex) actually plays your files. The account profile page covers:

| Section | Contents |
|---------|----------|
| **Account Security** | Avatar, display name, member-since date |
| **Preferences** | Interface Language, "Show username in sidebar" toggle |
| **Change Password** | Current/new/confirm password |
| **Sessions** | Active login sessions by device, with per-session and "revoke all others" controls |
| **Danger Zone** | Delete account (requires current password) |

:::tip[i18n Support]
Cinephage uses Paraglide JS v2 for internationalization. Interface translations are community-contributed.
:::

Account and role management for *other* users (admin vs. viewer, invites, bans) is a separate admin-only area - see [User Accounts](#user-accounts-and-roles) above and [Manage User Accounts](/guides/configure/system/user-accounts).

---

## Live TV

**Path:** `Settings > Live TV`

Configure Live TV provider accounts and streaming settings.

### Provider accounts

Cinephage supports four provider types - **Cinephage Live** (built-in catalog, no account needed), **Stalker Portal**, **XStream Codes**, and **M3U Playlist**. See [Set Up Live TV](/guides/configure/streaming/live-tv) for the full provider comparison and setup steps.

#### Stalker Portal (MAG/Ministra)

**Required Fields:**

| Field | Description | Format |
|-------|-------------|--------|
| **Name** | Display name | Any text |
| **Portal URL** | Stalker portal URL | `http://portal.example.com/c` |
| **MAC Address** | Device MAC | `00:1A:79:XX:XX:XX` |

**Features:**
- Full EPG support
- Archive/Catch-up TV
- Portal scanning

#### XStream Codes

**Required Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name | Any text |
| **Server URL** | XStream server | `http://example.com:8080` |
| **Username** | Account username | `user123` |
| **Password** | Account password | `********` |

#### M3U Playlist

**Required Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name | Any text |
| **URL** | M3U playlist URL | `http://example.com/playlist.m3u` |

**Optional:**

| Field | Description |
|-------|-------------|
| **EPG URL** | XMLTV EPG source |
| **Auto-refresh** | Refresh playlist periodically |

### EPG settings

Configure Electronic Program Guide behavior under **Live TV > Guide**:

| Setting | Description | Range | Default |
|---------|-------------|-------|---------|
| **Sync Interval** | How often to refresh EPG data | 1-168 hours | 6 hours |
| **Retention** | How long to keep EPG data before pruning | 24-720 hours | 48 hours |

Changes apply without a restart. Sync failures surface via `lastEpgSyncError` in the status panel rather than silently serving stale data.

### Portal scanner

The portal scanner tests Stalker portals for working MAC addresses.

| Scan Type | Description | Use Case |
|-----------|-------------|----------|
| **Random** | Generate random MAC addresses | Broad search for working accounts |
| **Sequential** | Test a range of MAC addresses | Testing specific address ranges |
| **Import** | Test a user-provided list | Validating known addresses |

| Configuration | Description |
|---------------|-------------|
| **Portal URL** | Target Stalker portal to scan |
| **MAC Range** | Range or list of MACs to test |
| **Timeout** | Seconds to wait for portal response |

---

## Captcha Solver

**Path:** `Settings > System > Captcha`

Configure automatic Cloudflare/challenge solving for protected indexers, using a headless browser.

### Settings

| Setting | Description | Options | Default |
|---------|-------------|---------|---------|
| **Enabled** | Turn the solver on/off | On/Off | On |
| **Solve Timeout** | Max time to attempt a solve | 30s, 60s, 90s, 2m, 3m | 60s |
| **Cache Duration** | How long a solved challenge's result is cached | 30m, 1h, 2h, 4h, 8h, 24h | 1 hour |
| **Proxy URL / Username / Password** | Route the solver's browser traffic through a proxy | - | Not set |

A status banner at the top of the page shows the solver's live state: **Initializing**, **Ready**, **Busy**, **Disabled**, or **Browser Not Available** (the headless browser failed to start). A **Clear Cache** action and a **Test Solver** tool (enter a URL, attempt a solve, see the result) are also available on this page - there's no running statistics/success-rate tracking.
- Failed attempts

:::note[First Run]
The first time you enable the Captcha Solver, Cinephage downloads the Camoufox browser (~80MB). This happens automatically.
:::

---

## NNTP Servers (Usenet)

**Path:** `Settings > Integrations > NNTP Servers`

Configure usenet provider connections for NZB streaming.

### Server configuration

**Fields:**

| Field | Description | Example | Required? |
|-------|-------------|---------|------------|
| **Name** | Display name | "UsenetServer" | Yes |
| **Host** | NNTP server address | `news.usenetserver.com` | Yes |
| **Port** | Connection port | `563` (SSL, default) or `119` | Yes |
| **Username** | Account username | `user123` | No |
| **Password** | Account password | `********` | No |

**Settings:**

| Setting | Description | Default |
|---------|-------------|---------|
| **Max Connections** | Concurrent connections to this server | 10 |
| **SSL** | Use encrypted connection | Enabled |
| **Priority** | Server priority (used for failover order among multiple servers) | 1 |
| **Enabled** | Turn the server on/off | Enabled |

### Performance tuning

Segment caching and prefetching for NZB streaming are handled adaptively and are not user-configurable settings - there is no Cache Size, Cache TTL, or Prefetch toggle to set. The main per-server lever is **Max Connections**; most providers support at least 10-20 concurrent connections per account, so raising this (within what your plan allows) is the main way to improve streaming throughput.

---

## See Also

### Configuration guides
- [Configure Download Clients](/guides/configure/download-clients) - Download client setup and connection
- [Set Up Indexers](/guides/configure/indexers) - Indexer configuration and testing
- [Quality Profiles](/guides/configure/quality/quality-profiles) - Creating and customizing quality profiles
- [Custom Formats](/guides/configure/quality/custom-formats) - Building custom scoring rules
- [Delay Profiles](/guides/configure/quality/delay-profiles) - Configuring download delay behavior
- [Blocklist Management](/guides/configure/quality/blocklist) - Managing blocked releases and indexers

### Media and integration guides
- [Root Folders](/guides/configure/library/root-folders) - Root folders, naming, and organization
- [Media Servers](/guides/configure/streaming/media-servers) - Jellyfin, Emby, and Plex integration
- [Live TV Setup](/guides/configure/streaming/live-tv) - Live TV provider configuration
- [Subtitles Configuration](/guides/configure/languages/subtitles) - Automatic subtitle downloads
- [NNTP Servers](/guides/configure/streaming/nntp-servers) - Usenet provider setup
- [NZB Streaming](/guides/configure/streaming/nzb-streaming) - Streaming without downloading
- [Captcha Solver](/guides/configure/system/captcha-solver) - Cloudflare challenge solving

### System and maintenance
- [Environment Variables](./environment-variables) - Docker and command-line configuration
- [Smart Lists](/guides/configure/library/smart-lists) - Dynamic content lists from TMDB
- [Settings and Logs](/guides/configure/system/settings-logs) - System configuration and troubleshooting
- [Backup and Restore](/guides/deploy/backup-restore) - Data protection procedures
