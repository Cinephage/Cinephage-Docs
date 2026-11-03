---
title: Library Views
description: Browse, filter, and sort your movie and TV show libraries
sidebar_position: 3
tags: [library, views, filters, sorting, guide]
keywords: [library, views, filters, sorting, browse]
---

# Library views

Cinephage provides flexible views for browsing your media library.

## Movies Library

Access via **Library > Movies** (URL: `/library/movies`)

:::info[URL Changes]
Library routes have been standardized:
- Movies: `/library/movies` (previously `/movies`)
- TV Shows: `/library/tv` (previously `/tv`)
- Legacy URLs redirect automatically
:::

### View options

| View | Description | Best For |
|------|-------------|----------|
| **Grid** | Poster view with titles | Browsing large libraries |
| **List** | Detailed list with metadata | Quick scanning |

### Filters

- **Library** - only shown when you have more than one movie library configured
- **Monitored** - All, Monitored only, Not monitored
- **File Status** - All, Has file, Missing file
- **Quality Profile** - filter by assigned quality profile
- **Resolution** - only shown when your library has files with more than one resolution
- **Video Codec** - only shown when your library has files with more than one codec
- **HDR Format** - SDR or a specific HDR format, only shown when relevant

There is no year-range, genre, or rating filter on the library page.

### Sorting

- Title (A-Z, Z-A)
- Date Added (Newest, Oldest)
- Year (Newest, Oldest)
- File Size (Largest, Smallest)
- Collection (A-Z, Z-A)

## TV Shows Library

Access via **Library > TV Shows** (URL: `/library/tv`)

### View options

Same as Movies (Grid, List)

### Additional filters

- **Monitored** - All, Monitored only, Partially monitored, Not monitored (partially monitored means some but not all episodes/seasons are monitored)
- **Series Status** - filter by the series' status (Continuing, Ended, etc.)
- **Progress** - All, Complete, In Progress, Not Started
- **Quality Profile**, **Resolution**, **Video Codec**, **HDR Format** - same as Movies

There is no season-count, episode-count, network, or next-airing filter on the library page.

### Series detail view

Click a series to see:
- Overview and metadata
- Season list with episode counts
- Episode list per season
- File information
- Quality status per episode

## Smart Lists

Dynamic lists that auto-populate based on criteria - built-in presets (Popular, Theaters, Top Rated, Upcoming) plus IMDb/TMDB list imports and fully custom filter criteria.

See [Set Up Smart Lists](smart-lists) for detailed configuration.

## See Also

- [Collections and Tags](collections-and-tags) - Organize your library with collections and tags
- [Adding Content](adding-content) - Add new movies and TV shows
- [Monitor and Upgrade](../../use/monitor-and-upgrade) - Automated monitoring
