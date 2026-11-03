---
title: Monitor and Upgrade
description: Configure automatic monitoring and quality upgrades for your library
sidebar_position: 2
tags: [monitoring, upgrades, quality, guide, tasks, automation]
keywords: [monitoring, upgrades, quality, automation]
---

# Monitor and upgrade

This guide explains how to monitor your library and manage quality upgrades automatically.

## Overview

Cinephage continuously monitors your library and can automatically:

- **Find missing content** - Search for episodes/movies not yet downloaded
- **Upgrade quality** - Replace existing files with better quality versions
- **Detect new releases** - Automatically add new episodes for monitored series
- **Cutoff unmet** - Search for items below your quality cutoff

## Understanding Monitoring

### What is monitoring?

Monitoring tells Cinephage to actively track content and search for it:

| State | Behavior |
|-------|----------|
| **Monitored** | Cinephage searches for this content automatically |
| **Unmonitored** | Item exists in library but won't be auto-searched |

### Monitoring levels

Cinephage supports monitoring at multiple levels:

**Movie Monitoring:**
- Monitored: Search for this movie
- Unmonitored: Don't search, but keep in library

**Series Monitoring:**
- Series Level: Monitor all seasons/episodes
- Season Level: Monitor specific seasons
- Episode Level: Monitor specific episodes

## Configuring Tasks

### Access task settings

1. Go to **Settings > Monitoring > Tasks**
2. Review and configure monitoring tasks
3. Enable/disable tasks as needed
4. Set appropriate intervals

### Core monitoring tasks

#### Missing Content Search

**Purpose:** Find and download missing episodes and movies

**How It Works:**
1. Scans library for monitored items without files
2. Searches indexers for available releases
3. Selects best quality match
4. Sends to download client

**Configuration:**

| Setting | Default | Description |
|---------|---------|-------------|
| **Enabled** | Yes | Enable/disable this task |
| **Interval** | 24 hours (daily) | How often to run - editable, minimum 15 minutes |
| **Search Type** | Missing | Only searches for items with no files |

**Best For:**
- Filling gaps in your library
- Completing seasons
- Finding newly monitored content

#### Cutoff Unmet Search

**Purpose:** Search for items below quality cutoff

**How It Works:**
1. Finds monitored items below cutoff quality
2. Searches for upgrades meeting cutoff
3. Downloads better quality versions
4. Stops when cutoff is met

**Configuration:**

| Setting | Default | Description |
|---------|---------|-------------|
| **Enabled** | Yes | Enable/disable |
| **Interval** | Daily | How often to run |
| **Scope** | Below Cutoff | Only items not yet at cutoff |

**Example Scenario:**
```
You have: Breaking Bad S01E01 in 720p
Profile cutoff: 1080p BluRay
Result: Task searches for 1080p version
```

#### Upgrade Search

**Purpose:** Search for better quality versions of all monitored items

**How It Works:**
1. Scans all monitored items (even above cutoff)
2. Searches for higher-scoring releases
3. Upgrades if better quality found
4. Ignores custom format score improvements

**Configuration:**

| Setting | Default | Description |
|---------|---------|-------------|
| **Enabled** | Yes | Enable/disable |
| **Interval** | Weekly | How often to run |
| **Scope** | All Items | Searches everything, not just below cutoff |

**Difference from Cutoff Unmet:**
- **Cutoff Unmet:** Only items below minimum quality
- **Upgrade:** All items, even those meeting cutoff

:::tip[Use Sparingly]
Upgrade search is resource-intensive. Weekly is usually sufficient. Use cutoff unmet for regular monitoring.
:::

#### New Episode Check (Series Only)

**Purpose:** Search for recently aired episodes of monitored series

**How It Works:**
1. Checks for episodes of monitored series that have recently aired
2. Triggers a search if the episode is monitored and missing

**Configuration:**

| Setting | Default | Description |
|---------|---------|-------------|
| **Enabled** | Yes | Enable/disable |
| **Interval** | 1 hour | How often to check - editable, minimum 15 minutes |

#### Pending Release Processing

**Purpose:** Process releases waiting in the delay profile queue

**How It Works:**
1. Reviews releases that were found but are being held per a delay profile
2. Grabs a release once its delay timer expires (or a better one arrives first)

**Configuration:**

| Setting | Default | Description |
|---------|---------|-------------|
| **Enabled** | Yes | Enable/disable |
| **Interval** | 15 minutes | How often to check the queue |

This is not an RSS-feed-polling task - indexer searches happen via the tasks above; this one only manages the delay-profile hold queue described in [Delay profiles](#delay-profiles) below.

## Quality Upgrade System

### How upgrades work

When Cinephage finds a better quality release:

1. **Score Comparison** - New release scored against current
2. **Cutoff Check** - If cutoff unmet, auto-upgrade
3. **Download** - New release sent to download client
4. **Import** - New file imported to library
5. **Cleanup** - Old file deleted (per your settings)

### Quality scoring

Cinephage scores releases against ~267 built-in Custom Formats (resolution, source, codec, HDR, audio, release groups, and more), with each quality profile assigning its own point value per format - there's no single fixed formula shared across profiles. See [Quality Scoring](/explanation/quality-scoring) for the full mechanism and real examples from the built-in profiles.

### Upgrade cutoff

The cutoff is the quality level where automatic upgrades stop. Once a monitored item's current file scores at or above the profile's cutoff, the Cutoff Unmet task stops trying to upgrade it - only the (less frequent, opt-in) Upgrade Search task will still look for further improvements above cutoff.

## Setting Up Monitoring

### Monitoring movies

#### When Adding Movies

1. Go to **Discover** or **Movies > Add New**
2. Search for movie
3. Before adding, toggle **Monitor** switch:
   - **Monitored:** Will search for this movie
   - **Unmonitored:** Adds to library without searching
4. Click **Add**

#### Changing Monitor Status

1. Go to **Library > Movies**
2. Find the movie
3. Click the **Monitor** icon (eye):
   -  Open eye = Monitored
   -  Slashed eye = Unmonitored
4. Toggle as needed

#### Bulk Monitoring

1. Go to **Library > Movies**
2. Select multiple movies (checkboxes)
3. Click **Edit** (pencil icon)
4. Set **Monitored** to Yes/No
5. Click **Save**

### Monitoring TV shows

#### Series-Level Monitoring

Monitor entire series (all seasons):

1. Add series via **Discover** or **TV Shows > Add New**
2. Set **Monitor** to one of: All Episodes, Future, Missing, Existing, First Season, Last Season, Recent, Pilot, or None
3. Click **Add**

#### Season-Level Monitoring

Monitor specific seasons:

1. Go to series page
2. Find season in the list
3. Click season **Monitor** dropdown:
   - **Monitored** - Monitor all episodes in season
   - **Unmonitored** - Don't monitor this season
4. Or click individual episode monitor icons

#### Episode-Level Monitoring

Fine-grained control:

1. Go to series page
2. Expand season
3. Click episode **Monitor** icon:
   - Monitored: Will search for this episode
   - Unmonitored: Won't search

### Monitoring best practices

**For Movies:**
- Monitor movies you actively want
- Unmonitor movies you already have in desired quality
- Monitor newly released movies to catch quality upgrades

**For TV Shows:**
- Use "Future Episodes" for ongoing series
- Use "All Episodes" for complete series you want fully
- Unmonitor seasons you've watched and don't need
- Monitor only missing episodes to complete seasons

**General:**
- Don't monitor everything (causes unnecessary searches)
- Review monitoring periodically
- Unmonitor items you no longer care about

## Managing Upgrades

### Automatic upgrades

With proper configuration, upgrades happen automatically:

1. **Task Runs** - Cutoff Unmet or Upgrade task executes
2. **Search Initiated** - Cinephage searches indexers
3. **Better Quality Found** - Higher scoring release identified
4. **Download Started** - New release sent to client
5. **Import** - New file replaces old
6. **Cleanup** - Old file deleted (if configured)

### Manual upgrades

Force an upgrade for specific items:

1. Go to movie/episode page
2. Click **Search** button
3. Cinephage searches immediately
4. If better quality found, it's downloaded

**Bulk Manual Search:**

1. Go to **Library** (Movies or TV)
2. Select items with checkboxes
3. Click **Search Selected**
4. Cinephage searches all selected items

### Blocking upgrades

Prevent specific releases from being used:

1. Go to **Activity > History**
2. Find the release
3. Click **Blocklist**
4. Release won't be downloaded again

**Blocklist Categories:**

- **Failed Download** - Automatically blocklisted
- **Wrong Content** - Manually blocklisted
- **Bad Quality** - Block poor encodes
- **Wrong Language** - Block wrong audio/subtitles

### Upgrade history

View your upgrade activity:

1. Go to **Activity > History**
2. Filter by **Upgrade** type
3. See:
   - Original file quality
   - New file quality
   - Date of upgrade
   - Release used

## Advanced Monitoring

### Delay profiles

Set delays to avoid "bad" releases:

**Purpose:** Wait for better quality releases before downloading

**Configuration:**

1. Go to **Settings > Library > Quality Settings > Delay Profiles**
2. Set delays per quality tier

**How It Works:**
1. Content becomes available (e.g., HDTV)
2. Timer starts based on delay profile
3. If better quality available before timer expires, wait
4. When timer expires, download best available (the [Pending Release Processing](#core-monitoring-tasks) task is what checks and acts on expired timers)

See [Delay Profiles](../configure/quality/delay-profiles) for full configuration details.

### Custom formats

Advanced, condition-based scoring rules - this is Cinephage's equivalent of the "release profiles" (must-contain/must-not-contain/preferred-words) concept some other tools have; there's no separate release-profiles feature here, everything goes through Custom Formats.

1. Go to **Settings > Library > Quality Settings > Custom Formats**
2. Create a format with one or more conditions (release title contains/doesn't contain a term, resolution/source/codec/language matches, release group matches, etc.)
3. Apply the format to a quality profile with your chosen point value (positive to prefer, negative or very large negative to effectively reject)

See [Custom Formats](../configure/quality/custom-formats) and [Quality Scoring](/explanation/quality-scoring) for full details.

## Troubleshooting Monitoring

### Items not being searched

**Check Monitoring Status:**

1. Verify item is monitored (eye icon open)
2. Check parent is monitored (season/series level)
3. Review monitoring settings

**Check Tasks Are Enabled:**

```
**Settings > Monitoring > Tasks > Missing Content Search** = Enabled
**Settings > Monitoring > Tasks > Cutoff Unmet Search** = Enabled
```

**Check Quality Profile:**

1. Verify quality profile allows desired qualities
2. Ensure cutoff is set correctly
3. Check Custom Formats aren't rejecting releases

### No upgrades found

**Check Current Quality:**

Current file may already be at cutoff:
```
Movie: 1080p BluRay
Cutoff: 1080p BluRay
Result: No upgrades needed
```

**Check Upgrade Task:**

```
**Settings > Monitoring > Tasks > Upgrade Search**
```

This task searches above cutoff. If disabled, no above-cutoff upgrades occur.

**Check Indexers:**

1. Verify indexers are configured
2. Check indexer tests pass
3. Ensure categories are correct
4. Check rate limits aren't blocking

### Too many upgrades

**Set Cutoff Properly:**

Lower cutoff to stop sooner:
```
Before: Cutoff = 2160p (too high, many upgrades)
After: Cutoff = 1080p BluRay (stops at good quality)
```

**Disable Upgrade Task:**

Turn off aggressive searching:
```
**Settings > Monitoring > Tasks > Upgrade Search** = Disabled
```

**Use Custom Formats:**

Require specific qualities:
```
Format: "High Quality Only"
Condition: Quality is 1080p or 2160p
Score: -1000 for anything else
```

### Duplicate downloads

**Causes:**
- Multiple indexers finding same release
- RSS sync grabbing before search
- Manual search + automatic search

**Solutions:**
1. Check **Activity > Queue** for duplicates
2. Cancel duplicate downloads
3. Add one release to blocklist
4. Adjust RSS sync interval

## Best Practices

### For new users

1. **Start Conservative** - Monitor only content you really want
2. **Set Realistic Cutoffs** - 1080p BluRay is good for most
3. **Enable Core Tasks** - Missing Content + Cutoff Unmet
4. **Check Results** - Review Activity regularly

### For power users

1. **Custom Formats** - Fine-tune scoring for your preferences
2. **Delay Profiles** - Avoid bad early releases
3. **Multiple Indexers** - More sources = better results
4. **Review Blocklist** - Keep it clean for better performance

### Efficiency tips

1. **Don't Monitor Everything** - Focus on what you watch
2. **Use Future Episodes** - For ongoing series, not all episodes
3. **Set Quality Profiles Per Item** - Different needs for different content
4. **Regular Review** - Unmonitor items you no longer care about

## See Also

- [Set Up Quality Profiles](../configure/quality/quality-profiles) - Detailed quality configuration
- [Quality Scoring](/explanation/quality-scoring) - How scoring works
- [Handle Failed Downloads](handle-failed-downloads) - Deal with download failures
- [Search and Download](search-and-download) - Manual searching
- [Update Cinephage](update-cinephage) - Keep Cinephage up to date
- [Backup & Restore](../deploy/backup-restore) - Data protection
