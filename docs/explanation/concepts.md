---
title: Key Concepts
description: Fundamental concepts and terminology used throughout Cinephage
sidebar_position: 2
tags: [concepts, terminology, glossary, explanation]
keywords: [concepts, terminology, Root Folders, monitoring]
---

# Key concepts

This document explains fundamental concepts and terminology used throughout Cinephage.

## Core Concepts

### Root Folders

**Definition:** Physical directories where your media library is stored.

**Explanation:**
Root folders are the foundation of your library organization. When you add media to Cinephage, you specify which root folder to store it in.

**Examples:**

- `/media/movies` - For movie files
- `/media/tv` - For TV Shows
- `/mnt/nas/movies` - Network-attached storage

**Key Points:**

- Must be accessible by Cinephage (read/write permissions)
- Should be separate from download folder
- Can be on local disk, NAS, or cloud mount
- Multiple Root Folders allowed

**See:** [Configure Download Clients](../guides/configure/download-clients#path-mapping-basics)

### Monitoring

**Definition:** The state of actively watching for and downloading content.

**Explanation:**
When an item is "monitored," Cinephage actively searches for it and will download it when available. When "unmonitored," the item is tracked in your library but Cinephage will not search for or download it.

**Use Cases:**

- **Monitored** - You want Cinephage to find and download this
- **Unmonitored** - You already have it, or do not want it automatically downloaded

**Visual Indicators:**

- Blue bookmark icon = Monitored
- Gray bookmark icon = Unmonitored

**Levels of Monitoring:**

- Movie level - Entire movie
- Series level - All episodes in series
- Season level - Specific season
- Episode level - Individual episode

### Quality Profiles

**Definition:** Rules that determine which releases to download and when to upgrade.

**Explanation:**
Quality profiles define your preferences for video quality. They include:

- Preferred qualities (4K, 1080p, 720p)
- Upgrade behavior
- Cutoff quality (when to stop upgrading)

**Example Profile Flow:**

```
Initial download: 720p HDTV
Better found: 1080p WEB-DL (upgrade)
Better found: 1080p BluRay (upgrade)
Cutoff reached: Stop upgrading
```

**Built-in Profiles:**

- **Quality** - Maximum quality (4K HDR)
- **Balanced** - Good quality/size balance (1080p)
- **Compact** - Smaller files (720p)
- **Streamer** - Streaming-optimized (HEVC)

**See:** [Set Up Quality Profiles](../guides/configure/quality/quality-profiles)

### Custom Formats

**Definition:** User-defined rules that add or subtract score from releases.

**Explanation:**
Custom formats let you define specific preferences beyond basic quality profiles. They match release names against patterns and adjust the score accordingly.

**Examples:**

- Boost x265/HEVC releases (+20 points)
- Block CAM/TS releases (-1000 points)
- Prefer specific release groups (+15 points)

**Scoring Impact:**

- Positive scores increase likelihood of selection
- Negative scores decrease likelihood
- Very negative scores (-1000+) effectively block

**See:** [Custom Formats in Quality Profiles](../guides/configure/quality/quality-profiles#part-4-custom-formats)

### Cutoff

**Definition:** The quality threshold where upgrades stop.

**Explanation:**
The cutoff prevents endless upgrading. Once a release reaches the cutoff quality, Cinephage will not upgrade it further, even if "better" releases appear.

**Why Use Cutoffs:**

- Prevents storage waste from frequent upgrades
- Reduces bandwidth usage
- Avoids re-downloading for minor improvements

**Setting Cutoffs:**

- Quality profile: "Cutoff: 1080p BluRay"
- Once 1080p BluRay downloaded, no more upgrades
- Even if 4K becomes available

### Indexers

**Definition:** Sources that provide information about available media releases.

**Explanation:**
Indexers are how Cinephage discovers what media is available for download. They search across torrent trackers, usenet sites, and streaming providers.

**Types:**

- **Torrent** - BitTorrent trackers
- **Usenet** - NNTP indexers (Newznab)
- **Streaming** - Direct streaming sources

**Configuration:**

- Added via YAML definitions
- Priority levels (search order)
- Category filtering (movies vs TV)
- Authentication (API keys, cookies)

**See:** [Configure Indexers](../guides/configure/indexers)

### Download clients

**Definition:** Applications that actually download the media files.

**Explanation:**
While Cinephage finds and selects releases, download clients handle the actual downloading. Cinephage monitors these clients and imports completed downloads.

**Supported Clients:**

- **Torrent:** qBittorrent, Transmission, Deluge, rTorrent, aria2
- **Usenet:** SABnzbd, NZBGet

**Integration:**

- Cinephage sends releases to download client
- Monitors download progress
- Imports completed files
- Organizes into library structure

**See:** [Configure Download Clients](../guides/configure/download-clients)

## Library Management Concepts

### Library scanning

**Definition:** The process of detecting and importing existing media files.

**Explanation:**
Scanning discovers files already on your disk and adds them to Cinephage's database. It matches files to TMDB entries and extracts metadata.

**Scan Types:**

- **Full Scan** - Entire library
- **Partial Scan** - Specific folder
- **Real-time** - File system watching
- **Scheduled** - Periodic automatic scans

### Matching

**Definition:** Associating a file with the correct movie or TV episode.

**Explanation:**
When scanning or importing, Cinephage must determine what movie/episode a file represents. This is done through multiple methods:

**Matching Methods:**

1. **External IDs** - Most reliable (e.g., `{tmdb-27205}`)
2. **Folder names** - Movie name with year
3. **File names** - Parsed from filename
4. **Manual** - User selects correct match

**File Naming for Best Matching:**

```
Inception (2010)/Inception (2010) 1080p.mkv
Breaking Bad/Season 01/Breaking Bad - S01E01.mkv
```

### Unmatched files

**Definition:** Files that could not be automatically matched to TMDB entries.

**Explanation:**
When scanning cannot determine what a file is, it goes to the Unmatched Files queue for manual intervention.

**Common Causes:**

- Obscure or foreign titles
- Very new releases not in TMDB
- Poor file naming
- Corrupted or mislabeled files

**Resolution:**

- Manually match to correct title
- Delete if unwanted
- Rename file and rescan

## Download Concepts

### Queue

**Definition:** Active downloads currently in progress.

**Explanation:**
The queue shows all downloads currently being handled by your download client. Cinephage monitors this queue and imports completed items.

**Queue States:**

- **Downloading** - In progress
- **Paused** - Manually paused
- **Completed** - Download done, awaiting import
- **Failed** - Download error

### History

**Definition:** Record of all past download operations.

**Explanation:**
History tracks everything that has been downloaded, imported, upgraded, or failed. It provides an audit trail of your library's growth.

**History Types:**

- **Grab** - Release sent to download client
- **Import** - File imported to library
- **Upgrade** - Replaced with better quality
- **Fail** - Download or import failure

### Blocklist

**Definition:** Releases that should not be downloaded again.

**Explanation:**
When a release fails repeatedly, it is added to the blocklist. Cinephage will not attempt to download blocklisted releases again.

**Auto-Blocklist Triggers:**

- Failed download
- Failed import (corrupt file)
- Hash mismatch
- User manually blocked

**Management:**

- View in Activity > Blocklist
- Remove if you want to retry
- Permanent until removed

### Upgrades

**Definition:** Replacing an existing file with a higher-quality version.

**Explanation:**
When a better quality release becomes available, Cinephage can automatically upgrade your existing file.

**Upgrade Criteria:**

- Must be monitored
- New release must score higher
- Must not exceed cutoff
- Must pass custom format checks

**Upgrade Process:**

1. Better release found
2. Download new release
3. Import new file
4. Replace old file
5. Old file deleted (if enabled)

## Search Concepts

### Automatic search

**Definition:** Background process that searches for monitored content.

**Explanation:**
Automatic search runs on a schedule (each monitoring task has its own configurable interval - missing content search defaults to daily) and searches for:

- Missing monitored items
- Upgrade opportunities
- New episodes (TV)

**Trigger Conditions:**

- Item is monitored
- Monitoring task is enabled
- Interval time elapsed
- Indexers available

### Manual search

**Definition:** User-initiated search on specific item.

**Explanation:**
Manual search lets you see all available releases and choose specific ones. It is useful for:

- Immediate needs
- Selecting specific releases
- Bypassing automatic selection
- Testing indexer configuration

### Scoring

**Definition:** Numerical evaluation of release quality.

**Explanation:**
Each release receives a score based on multiple factors. Higher scores indicate better matches for your quality profile.

**Scoring Factors:**

- Resolution (4K, 1080p, 720p)
- Source (BluRay, WEB-DL, HDTV)
- Codec (x265, x264, AV1)
- Audio (Atmos, DTS-HD, AAC)
- HDR format (Dolby Vision, HDR10)
- Custom formats

**Score Example (using the built-in Quality profile's point values):**

```
Resolution (1080p): 200
Source (BluRay): +200
Codec (x265): +30
Audio (DTS-HD MA): +140
Custom (Trusted group): +10
Total: 580
```

Point values are not fixed system-wide - each quality profile assigns its own score to every matched attribute, so the same release can score differently under different profiles.

## Subtitle Concepts

### Language profiles

**Definition:** Preferences for subtitle languages.

**Explanation:**
Language profiles define which languages you want subtitles in and whether they are required or optional.

**Profile Options:**

- **Required** - Must have this language
- **Cutoff** - Stop searching once found
- **Upgrade** - Continue searching for better match

**Example Profile:**

```
1. English (Required, Cutoff)
2. Spanish (Optional, Upgrade)
```

### Subtitle scoring

**Definition:** Quality assessment of subtitle matches.

**Explanation:**
Subtitles are scored based on how well they match your media file:

**Scoring Factors:**

- **Hash match** - Exact file match (best)
- **Filename match** - Same release name
- **Metadata match** - Title/year/episode
- **Uploader reputation**

## Advanced Concepts

### Smart Lists

**Definition:** Dynamic lists that automatically populate based on criteria.

**Explanation:**
Smart Lists use TMDB queries to automatically find content matching your criteria. They can auto-add items to your library.

**Use Cases:**

- "All 2024 movies rated 7.5+"
- "Action movies with Dwayne Johnson"
- "Movies from my IMDb watchlist"

**Features:**

- TMDB discover integration
- Auto-refresh on schedule
- Auto-add to library
- Import from IMDb lists, JSON URLs, or TMDB lists

### Live TV

**Definition:** Live TV streaming.

**Explanation:**
Cinephage can manage Live TV subscriptions, organize channels, and provide EPG (Electronic Program Guide) functionality.

**Components:**

- Channel management
- EPG data
- Portal scanning (Stalker)
- M3U playlist support
- HLS streaming

### NZB Streaming

**Definition:** Direct streaming from usenet without downloading.

**Explanation:**
Unlike traditional downloading, NZB streaming allows you to watch content directly from usenet servers without saving the entire file first.

**Requirements:**

- NNTP server configuration
- NZB files
- Compatible player

**Benefits:**

- No disk space needed
- Instant playback
- Selective downloading

### Indexer backoff

**Definition:** Pattern that prevents repeated calls to a failing indexer.

**Explanation:**
Rather than a classic circuit breaker with open/closed/half-open states, Cinephage tracks each indexer's failure count and applies exponential backoff with jitter: consecutive failures push out the retry time further (starting around a minute, capping around an hour), and Cinephage skips a disabled indexer's requests until that retry time passes. This prevents a single struggling indexer from slowing down or spamming every search.

**Key Points:**

- Backoff is per-indexer, tracked persistently (survives restarts)
- Delay grows with consecutive failures, up to a cap
- A small random jitter is added so many indexers don't retry at the exact same moment
- A successful request resets the failure count

## Glossary

| Term            | Definition                                   |
| --------------- | -------------------------------------------- |
| **API Key**     | Authentication token for accessing services  |
| **Category**    | Content type (movies, TV)                    |
| **Codec**       | Video compression format (H.264, H.265, AV1) |
| **CSRF**        | Cross-Site Request Forgery protection        |
| **EPG**         | Electronic Program Guide (TV listings)       |
| **HDR**         | High Dynamic Range video                     |
| **HLS**         | HTTP Live Streaming protocol                 |
| **Indexer**     | Content source/search provider               |
| **Library**     | Your media collection in Cinephage           |
| **Monitoring**  | Active tracking for downloads                |
| **NZB**         | Usenet binary file format                    |
| **Priority**    | Search order (lower = higher priority)       |
| **Protocol**    | Type of indexer (torrent, usenet, streaming) |
| **Quality**     | Video resolution and characteristics         |
| **Release**     | Specific version of media file               |
| **Root Folder** | Base directory for media storage             |
| **Scan**        | Process of detecting existing files          |
| **Source**      | Original media (BluRay, WEB-DL, HDTV)        |
| **Subtitle**    | Text transcription of dialogue               |
| **TMDB**        | The Movie Database (metadata provider)       |
| **Tracker**     | Torrent peer coordinator                     |
| **Upgrade**     | Replacing with better quality                |

## See Also

- [Architecture Overview](architecture)
- [Quality Scoring](quality-scoring)
- [Getting Started](/getting-started/) - Installation and setup
- [How-To Guides](/guides/) - Configuration and usage guides
