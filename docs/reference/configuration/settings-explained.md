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

**Path:** `Settings > General > Security`

Configure user authentication settings:

| Setting | Description | Default |
|---------|-------------|---------|
| **Require Authentication** | Force login for all users | Enabled |
| **Session Duration** | How long users stay logged in | 7 days |
| **Password Requirements** | Minimum password complexity | 8 characters |

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
| `{Quality}` | Quality string | "1080p BluRay" |
| `{Group}` | Release group | "YIFY" |
| `{Edition}` | Edition tag | "Director's Cut" |
| `{Codec}` | Video codec | "x264" |
| `{Audio}` | Audio codec | "DTS" |

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

:::warning[Silent copy fallback]
If hardlink creation fails (different container mounts = different filesystems, cross-disk `EXDEV`, or permission `EPERM`), the import **silently falls back to a full copy** (2x space). See the single-root rule in the [Docker install](/getting-started/installation/docker). Check logs for the transfer mode (`hardlink` vs `copy`) when disk usage looks doubled.
:::

---

## Profiles

### Quality profiles

**Path:** `Settings > Profiles > Quality`

Quality profiles define how Cinephage scores and selects releases. Each profile contains:

| Component | Description |
|-----------|-------------|
| **Qualities** | Allowed resolutions and sources |
| **Upgrades** | Whether to search for better versions |
| **Cutoff** | Quality level to stop upgrading |
| **Custom Formats** | Bonus/malus scoring rules |

#### Built-in Profiles

Cinephage includes four default profiles:

**Quality Profile**
- Prefers 4K with HDR
- Upgrades until 2160p BluRay
- Best for: High-end setups

**Balanced Profile**
- Prefers 1080p WEB-DL
- Good quality/size ratio
- Best for: Most users

**Compact Profile**
- Prefers 720p/1080p
- Smaller file sizes
- Best for: Limited storage

**Streamer Profile**
- Creates `.strm` files
- For NZB streaming
- Best for: Streaming without downloading

#### Custom Profile Properties

| Property | Description | Required |
|----------|-------------|----------|
| **Name** | Unique profile identifier | Yes |
| **Allowed Qualities** | Resolutions and sources permitted | Yes, ordered by priority |
| **Upgrade Cutoff** | Quality level at which upgrades stop | Yes |
| **Custom Format Scores** | Bonus/malus scoring rules | Optional |
| **Upgrades Enabled** | Whether to search for better versions | Yes, default: Enabled |

### Language profiles

**Path:** `Settings > Profiles > Languages`

Configure language preferences for media and subtitles.

| Setting | Description |
|---------|-------------|
| **Preferred Languages** | Audio languages to prefer |
| **Subtitle Languages** | Subtitle languages to download |
| **Upgrade Until** | Stop upgrading when this quality reached |

#### Example Language Profile

```yaml
Name: "English + Spanish Subs"
Preferred Audio: [English]
Required Subtitles: [English, Spanish]
Subtitle Priority: Must have English, prefer Spanish
```

### Custom formats

**Path:** `Settings > Profiles > Custom Formats`

Create custom scoring rules based on release attributes.

#### Format Conditions

Match releases based on:

| Type | Description | Example |
|------|-------------|---------|
| **Release Title** | Text in release name | Contains "REMUX" |
| **Resolution** | Video resolution | Equals "2160p" |
| **Source** | Release source | Is "BluRay" |
| **Codec** | Video codec | Contains "HEVC" |
| **Group** | Release group | Is "YIFY" |
| **HDR** | HDR format | Contains "HDR10" |

#### Scoring

Assign positive or negative scores:

| Score | Effect |
|-------|--------|
| **+100** | Strongly prefer |
| **+50** | Prefer |
| **+10** | Slight preference |
| **-10** | Slight avoidance |
| **-100** | Reject |

:::info[Example: HEVC Preference]
A custom format matching releases containing "HEVC" or "H.265" with a +50 score prefers more efficient codecs without rejecting other options.
:::

---

## Integrations

### Download clients

**Path:** `Settings > Integrations > Download Clients`

Configure connections to download clients for automated downloading.

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

**Path:** `Settings > Integrations > Subtitles`

Configure sources for automatic subtitle downloads.

#### Available Providers

| Provider | Type | Authentication |
|----------|------|----------------|
| **OpenSubtitles** | API | Username/Password |
| **Subf2m** | Web | None |
| **Addic7ed** | Web | Username/Password |

#### Provider Settings

| Setting | Description |
|---------|-------------|
| **Enabled** | Turn provider on/off |
| **Credentials** | API key or login |
| **Rate Limit** | Requests per minute |

### Notifications

**Path:** `Settings > Integrations > Notifications`

Configure media server integrations and notifications.

#### Media Server Connect

| Server | Capability |
|--------|------------|
| **Jellyfin** | Library update, playback status |
| **Emby** | Library update, playback status |
| **Plex** | Library update |

#### Notification Triggers

Configure when to send notifications:

- On Grab (download started)
- On Import (download completed)
- On Upgrade (better quality downloaded)
- On Health Issue

---

## Tasks

**Path:** `Settings > Tasks`

Configure background monitoring tasks that run automatically.

### Task overview

| Task | Purpose | Default Interval |
|------|---------|------------------|
| **Missing Content Search** | Find and download missing episodes/movies | 6 hours |
| **Cutoff Unmet Search** | Search for items below quality cutoff | Daily |
| **Upgrade Search** | Search for better quality versions | Weekly |
| **Smart List Refresh** | Update dynamic lists from TMDB | 6 hours |
| **Missing Subtitles** | Search for missing subtitle languages | 6 hours |
| **Subtitle Upgrade** | Search for better subtitle scores | Daily |
| **RSS Sync** | Check indexers for new releases | 15 minutes |

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

**Path:** `Settings > Status`

The unified status page provides a consolidated view of your Cinephage system health, replacing separate maintenance and server-stats pages.

### Storage section

| Metric | Description |
|--------|-------------|
| **Total Space** | Total storage across all Root Folders |
| **Used Space** | Currently used storage |
| **Free Space** | Available storage |
| **Root Folder Status** | Per-folder usage and health |

### Media servers section

| Metric | Description |
|--------|-------------|
| **Server Status** | Connected media servers (Jellyfin, Emby, Plex) |
| **Last Sync** | When library was last updated |
| **Connection Health** | Test results per server |

### Scan/Sync status

| Metric | Description |
|--------|-------------|
| **Last Library Scan** | When library was last scanned |
| **Scan Progress** | Current scan progress if running |
| **EPG Sync Status** | Live TV EPG synchronization state |

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

## User Preferences (v0.5.0+)

**Path:** `Settings > User > Preferences`

Configure personal preferences for your Cinephage user account.

### Language preferences

Set your preferred interface and content languages:

| Setting | Description | Options |
|---------|-------------|---------|
| **Interface Language** | UI language | English, Spanish, etc. |
| **Content Language** | Default for media metadata | Based on TMDB languages |
| **Subtitle Language** | Preferred subtitle language | Any configured language |

:::tip[i18n Support]
Cinephage uses Paraglide JS v2 for internationalization. Interface translations are community-contributed.
:::

### Playback preferences

| Setting | Description | Default |
|---------|-------------|---------|
| **Auto-Play Next Episode** | Automatically play next TV episode | Enabled |
| **Default Quality** | Preferred streaming quality | Original |
| **Subtitle Display** | Show subtitles by default | Disabled |

---

## Live TV

**Path:** `Settings > Live TV`

Configure Live TV provider accounts and streaming settings.

### Provider accounts

Cinephage supports three provider types:

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

Configure Electronic Program Guide behavior:

| Setting | Description | Default |
|---------|-------------|---------|
| **EPG Refresh Interval** | How often to update EPG | 6 hours |
| **Cache Duration** | How long to cache EPG data | 24 hours |

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

**Path:** `Settings > Integrations > Captcha Solver`

Configure automatic Cloudflare/challenge solving for protected indexers.

### Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Enabled** | Turn solver on/off | Disabled |
| **Headless** | Run browser in background | Yes |
| **Timeout** | Max time to solve (seconds) | 60 |

### Statistics

View solver performance:

- Total challenges solved
- Success rate
- Average solve time
- Failed attempts

:::note[First Run]
The first time you enable the Captcha Solver, Cinephage downloads the Camoufox browser (~80MB). This happens automatically.
:::

---

## NNTP Servers (Usenet)

**Path:** `Settings > Integrations > NNTP Servers`

Configure usenet provider connections for NZB streaming.

### Server configuration

**Required Fields:**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name | "UsenetServer" |
| **Host** | NNTP server address | `news.usenetserver.com` |
| **Port** | Connection port | `563` (SSL) or `119` |
| **Username** | Account username | `user123` |
| **Password** | Account password | `********` |

**Optional Settings:**

| Setting | Description | Default |
|---------|-------------|---------|
| **Connections** | Concurrent connections | 8 |
| **SSL** | Use encrypted connection | Enabled |
| **Priority** | Server priority | 1 |

### Performance tuning

| Setting | Description | Recommended |
|---------|-------------|-------------|
| **Connections** | More = faster | 8-16 |
| **Cache Size** | Max disk cache | 10 GB |
| **Cache TTL** | Cache duration | 24 hours |
| **Prefetch** | Download ahead | Enabled |

---

## See Also

### Configuration guides
- [Configure Download Clients](/guides/configure/download-clients) - Download client setup and connection
- [Set Up Indexers](/guides/configure/indexers) - Indexer configuration and testing
- [Quality Profiles](/guides/configure/quality-profiles) - Creating and customizing quality profiles
- [Custom Formats](/guides/configure/custom-formats) - Building custom scoring rules
- [Delay Profiles](/guides/configure/delay-profiles) - Configuring download delay behavior
- [Blocklist Management](/guides/configure/blocklist) - Managing blocked releases and indexers

### Media and integration guides
- [Root Folders](/guides/configure/root-folders) - Root folders, naming, and organization
- [Media Servers](/guides/configure/media-servers) - Jellyfin, Emby, and Plex integration
- [Live TV Setup](/guides/configure/live-tv) - Live TV provider configuration
- [Subtitles Configuration](/guides/configure/subtitles) - Automatic subtitle downloads
- [NNTP Servers](/guides/configure/nntp-servers) - Usenet provider setup
- [NZB Streaming](/guides/configure/nzb-streaming) - Streaming without downloading
- [Captcha Solver](/guides/configure/captcha-solver) - Cloudflare challenge solving

### System and maintenance
- [Environment Variables](./environment-variables) - Docker and command-line configuration
- [Smart Lists](/guides/configure/smart-lists) - Dynamic content lists from TMDB
- [Settings and Logs](/guides/configure/settings-logs) - System configuration and troubleshooting
- [Backup and Restore](/guides/deploy/backup-restore) - Data protection procedures
