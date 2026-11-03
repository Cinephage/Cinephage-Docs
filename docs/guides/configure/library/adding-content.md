---
title: Adding Content
description: Add movies and TV shows to your library manually or in bulk
sidebar_position: 2
tags: [library, adding, movies, tv, bulk, guide]
keywords: [library, adding content, movies, tv, bulk import]
---

# Adding content

Add movies and TV shows to your library through various methods.

## Discover

The Discover page surfaces trending, popular, and upcoming content from TMDB. The hero section at the top displays video clips and backdrop images for featured content, giving you a preview before adding.

## Manual Addition

Adding movies and TV shows happens through **Discover** - there isn't a separate "Add New" menu item under Library.

### Adding movies

1. Go to **Discover**
2. Search for the movie title
3. Click the movie in results
4. In the Add to Library modal, configure:
   - Root folder
   - Quality profile
   - Monitor status (Monitored / Unmonitored)
5. Click **Add**

### Adding TV shows

1. Go to **Discover**
2. Search for the series title
3. Click the series in results
4. In the Add to Library modal, configure:
   - Root folder
   - Quality profile
   - Monitor: All Episodes, Future Episodes, Missing Episodes, Existing Episodes, First Season, Last Season, Recent, Pilot, or None
5. Click **Add**

## Bulk Addition

### Import existing files

Cinephage's import wizard matches files already on disk against TMDB - it isn't a CSV importer:

1. Go to **Library > Import**
2. Select a folder to scan (path selector)
3. Review the detected movies/series groups and confirm or correct matches
4. Import the matched items into your library

### Add TMDB collections (bulk)

Add entire TMDB collections to your library at once:

1. Go to **Discover** and search for a movie that belongs to a collection (e.g., "The Avengers")
2. Click it to open the Add to Library modal
3. If the collection has other entries missing from your library, the modal offers an option to add the whole collection
4. Configure root folder, quality profile, and monitor status
5. Click **Add**

**What happens:**

- All missing movies in the collection are added to your library along with the one you searched for
- Each movie is monitored according to your settings
- Existing movies in your library are not duplicated

## Managing Library Items

### Movie management

**Individual Actions:**

| Action | Description | How To |
|--------|-------------|--------|
| **Edit** | Change metadata, profiles | Click movie > Edit |
| **Search** | Find releases manually | Click movie > Search |
| **Rename** | Apply naming pattern | Click movie > Organize |
| **Delete** | Remove from library | Click movie > Delete |
| **History** | View download history | Click movie > History |

**Deletion Behavior:**

When you delete a movie or episode:

- **Immediate status updates** - UI reflects deletion instantly without page refresh
- **File removal confirmation** - Files are deleted immediately, library item updated
- **Auto-redirect** - After deletion, you're automatically redirected to the library list
- **No manual refresh needed** - Status indicators update in real-time

**Bulk Actions:**

1. Select multiple movies (checkboxes)
2. Click action button:
   - Edit (change profiles)
   - Search
   - Monitor/Unmonitor
   - Delete

### TV show management

**Series-Level Actions:**

- Edit series details
- Change monitoring (All/Future/Missing/None)
- Search for missing episodes
- Refresh metadata
- Delete series

**Season-Level Actions:**

- Monitor/unmonitor season
- Search for season episodes
- View season details
- Delete season files

**Episode-Level Actions:**

- Monitor/unmonitor episode
- Search for specific episode
- View episode details
- Delete episode file

### Monitoring status

Understanding monitoring levels:

**Movies:**
- **Monitored** - Will search for movie
- **Unmonitored** - In library, won't search

**TV Shows:**
- **All Episodes** - Monitor every episode
- **Future Episodes** - Monitor upcoming episodes only
- **Missing Episodes** - Monitor episodes without files
- **Existing Episodes** - Monitor episodes with files (for upgrades)
- **None** - Don't monitor

## See Also

- [Search and Download](../../use/search-and-download) - Find and download content
- [Import Existing Files](../../use/import-existing-files) - Import your existing media
- [Collections and Tags](collections-and-tags) - Organize your content
