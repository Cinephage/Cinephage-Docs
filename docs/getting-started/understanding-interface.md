---
title: Understanding the Interface
description: Navigate the Cinephage web interface and understand its organization
sidebar_position: 5
tags: [interface, ui, navigation, tutorial]
keywords: [ui, dashboard, navigation, layout]
---

# Understanding the Interface

This tutorial provides a tour of the Cinephage web interface. You will learn the layout, navigation, and where to find key features.

## Dashboard Overview

The dashboard is your home screen when logging in. It provides:

### Quick Stats

At the top:

- **Movies** - Total movies, with counts for files on disk, missing, in theaters, and unreleased
- **TV Shows** - Total series, with counts for episode files on disk, missing, and unaired
- **Downloads** - Active, queued, stalled, and paused downloads
- **Missing Episodes** - Monitored episodes that have aired but have not been downloaded
- **Unmatched** - Files on disk that need attention

### Recent Activity

Shows recent events:

- Files imported
- Downloads completed
- Upgrades applied

### Coming Up

Upcoming releases for monitored content:

- Movies with upcoming release dates
- TV episodes airing soon
- Click any item to go directly to its library detail page

### Quick Actions

Buttons for common tasks (shown once your library has content and clients/indexers are configured):

- Discover
- Import
- View Activity
- Indexers
- Search Missing (shown when monitored episodes are missing) or Tasks

Before any indexers, download clients, or root folders are configured, this area instead shows setup prompts to add them.

## Main Navigation

The left sidebar contains main sections:

### Discover

Browse and search TMDB for new content:

- **Movies** tab - Browse movie database
- **TV** tab - Browse TV shows database
- Filters for genre, year, rating, and more
- Click cast or crew on a title's detail page to view their filmography

### Library

Manage your media collection:

- **Movies** - Grid or table view of all movies
- **TV** - Series list with season details
- **Unmatched** - Files awaiting manual matching
- **Import** - Manual import interface

### Activity

Monitor operations:

- **Queue** - Active downloads
- **History** - Completed operations

### Calendar

Upcoming release dates for monitored movies and TV episodes.

### Live TV

Live TV management:

- **Channels** - Channel lineup and organization
- **EPG** - Electronic program guide
- **Accounts** - Live TV provider accounts

### Smart Lists

Dynamic content lists:

- View existing lists
- Create new lists from TMDB queries
- Auto-add items to library

## Movie Library

Navigate to **Library > Movies**:

### View Modes

Toggle between:

- **Grid** - Poster view with basic info
- **Table** - Detailed list with sortable columns

### Filters and Sorting

Filter by:

- **Status** - All, Monitored, Missing, Downloaded
- **Quality** - Resolution filters (4K, 1080p, etc.)
- **Tags** - Custom tags you have applied

Sort by:

- Title, Year, Rating, Added date, File size

### Movie Details

Click any movie to see the redesigned detail header with poster, backdrop, full metadata, and action buttons. On mobile, a sticky action bar stays visible as you scroll.

**Overview Tab:**

- Poster and backdrop
- Plot summary
- Cast and crew
- Technical details (resolution, codecs)

**Files Tab:**

- Downloaded file information
- Quality and format details
- File path and size

**History Tab:**

- Download history
- Import events
- Upgrade history

**Search Tab:**

- Manual search interface
- Available releases
- Grab specific releases

## TV Library

Navigate to **Library > TV**:

### Series List

Similar to movies but with series-level information:

- Next airing episode
- Overall completion percentage
- Season count

### Series Details

Click a series for details. A contextual back button at the top returns you to the library you navigated from, preserving any active filters or library scope.

Click a series for:

**Overview Tab:**

- Series information
- Season list with progress bars
- Next episode to air

**Episodes Tab:**

- Episode list by season
- Air dates and titles
- File information per episode
- Monitoring toggles

**Files Tab:**

- All episode files
- Quality information

**History Tab:**

- Download and import history

## Settings Organization

The **Settings** sidebar item expands into five sections: Library & Storage, Integrations, System, Blocklist, and Monitoring.

### Library & Storage

- **Libraries** - Manage your movie and TV libraries
- **Root Folders** - Define where media is stored on disk
- **File Management** - Import and file-handling behavior
- **Naming** - Movie and series naming patterns, available tokens, and a rename preview
- **Quality Settings** - Quality **Profiles** (view built-in profiles, create custom ones, configure upgrade behavior and cutoffs) and **Custom Formats** (scoring rules tested against release names) as two tabs on the same page
- **Discovery Filters** - Global TMDB filters (minimum rating, excluded genres, certification limits)

### Integrations

- **Indexers** - Add, test, and prioritize indexers
- **Download Clients** - Configure qBittorrent, SABnzbd, and others; test connections, category labels, and path mappings
- **NNTP Servers** - Usenet server configuration, connection limits, SSL
- **Subtitle Providers** - Enable providers, configure API keys, set priorities
- **Language Profiles** - Subtitle language preferences, cutoff languages, upgrade behavior
- **Media Servers** - Jellyfin/Emby/Plex connections, notification triggers, connection tests
- **Streaming** - Streaming provider settings, circuit breaker options, cache settings

### System

- **General** - Application name/theme, date/time and language preferences, TMDB API key, external URL, and API key management (Main and Streaming keys)
- **Metadata Providers** - TMDB configuration plus optional AniList/MyAnimeList enrichment for anime titles
- **Captcha Solver** - Cloudflare bypass settings, Camoufox configuration, timeout values
- **Backup & Restore** - Create and restore configuration backups
- **Cinephage** - Version info, update checking, and auto-update settings

### Blocklist

- **Releases** - Blocked releases and reasons for the block
- **Blocked Media** - Movies/shows excluded from search
- **Blocked Keywords** - Release names containing these keywords are skipped
- **Blocked Extensions** - File extensions excluded from import

### Monitoring

- **Storage Maintenance** - Library and folder health status
- **Tasks** - Background task configuration (missing/upgrade monitoring, subtitle tasks, smart list tasks, schedule intervals)
- **Logs** - Real-time log viewer, filter by level, search log entries
- **Reports** - Summary reports on library and monitoring activity

## Activity Section

Navigate to **Activity**:

### Queue

Active downloads:

- Current downloads in progress
- Progress bars and status
- Pause/resume controls
- Remove from queue

Click an item to see:

- Release details
- Indexer source
- Quality information
- Download client status

### History

Completed operations:

- Successful imports
- Failed downloads
- Upgrades applied
- Filter by type and status

The Activity page has **Queue** and **History** tabs. To manage blocked releases, see **Settings > Blocklist** above.

## Search Interface

Multiple places to search:

### Discover Search

In Discover section:

- Advanced TMDB search
- Filter by genre, year, rating
- Sort options

### Library Search

In Library sections:

- Search your library only
- Filter by tags, quality, status

### Manual Search

On movie/series details:

- Search indexers directly
- See all available releases
- Compare scores
- Grab specific releases

## Mobile Interface

Cinephage is responsive:

- Sidebar collapses to hamburger menu
- Touch-friendly controls
- Swipe gestures in lists
- Optimized layouts for small screens

## What You Have Accomplished

You now understand:

- Dashboard layout and quick stats
- Navigation structure
- Library organization (movies and TV)
- Settings hierarchy
- Activity monitoring
- Search capabilities

## Next Steps

You have completed the Getting Started tutorials. You are ready to:

- Explore [How-To Guides](../guides/) for specific tasks
- Read [Reference](../reference/) documentation for detailed information
- Learn about [Architecture](../explanation/architecture) for technical understanding

## See Also

### Essential Configuration
- [Configure Download Clients](../guides/configure/download-clients) - Set up qBittorrent, SABnzbd, and others
- [Configure Indexers](../guides/configure/indexers) - Add indexers
- [Set Up Quality Profiles](../guides/configure/quality/quality-profiles) - Configure quality scoring

### Daily Operations
- [Search and Download](../guides/use/search-and-download) - Find and acquire content
- [Monitor and Upgrade](../guides/use/monitor-and-upgrade) - Automatic quality improvements
- [Import Existing Files](../guides/use/import-existing-files) - Add your current media library

### Technical Understanding
- [Architecture Overview](../explanation/architecture) - System architecture and components
- [Workers and Tasks](../explanation/workers-and-tasks) - Background processing system
- [Key Concepts](../explanation/concepts) - Root folders, monitoring, and terminology

### Support
- [Getting Help](./getting-help) - Community support resources
- [Troubleshooting Guide](../guides/deploy/troubleshooting) - Common issues and solutions

## Tips for Efficient Use

### Customize Your View

- Use table view for bulk operations
- Filter by tags to find content quickly
- Sort by "Added" to see newest items

### Monitor What Matters

- Check Activity queue daily
- Review blocklist for patterns
- Use History to track down issues

### Stay Organized

- Apply tags consistently
- Use naming patterns for clean file structure
- Set up quality profiles before adding content

---

**You have completed the Getting Started tutorials!**

Continue to [How-To Guides](../guides/) for task-specific documentation.
