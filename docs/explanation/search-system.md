---
title: Search System
description: How Cinephage's search system finds and selects media releases
sidebar_position: 4
tags: [search, explanation, indexers, workflow]
keywords: [search, indexers, workflow, scoring, releases]
---

# Search system

This document explains how Cinephage's search system works to find and select media releases from your configured indexers.

## Overview

Cinephage provides a unified search interface that queries multiple indexers simultaneously, aggregates results, scores them based on your quality preferences, and automatically selects the best option for download.

## Understanding the search process

Cinephage searches follow this workflow:

```
User Initiates Search → Query Indexers → Score Releases → Select Best → Send to Download Client → Monitor Progress → Import File
```

### Automatic vs manual search

The system operates in two distinct modes:

**Automatic Search:**

- Triggered by monitoring tasks
- Runs on schedule (each monitoring task has its own configurable interval; see [Workers and Tasks](workers-and-tasks))
- Finds best release automatically
- No user intervention needed

**Manual Search:**

- User initiates on specific item
- See all available releases
- Choose specific release
- Immediate action

### Automatic search

Automatic search is the hands-off approach to maintaining your library. Once you add media with monitoring enabled, the system periodically checks indexers for new or upgradable content.

**How it works:**

1. Monitoring tasks run on schedule (interval configurable per task; missing-content search defaults to daily)
2. System checks all monitored items
3. Searches indexers for missing or upgradable content
4. Scores and selects best release automatically
5. Sends to download client
6. Monitors progress until complete
7. Imports and organizes the file

Automatic search eliminates the need to manually check for new releases. Once configured, it runs continuously in the background.

**Key characteristics:**

- Proactive: Finds content without user action
- Scheduled: Runs at configured intervals
- Automatic: No manual selection required
- Selective: Only grabs releases meeting your criteria

### Manual search

Manual search gives you direct control over what to download and when. Use this when you want a specific release, need content immediately, or want to review available options before deciding.

**How it works:**

1. Navigate to a specific movie or episode
2. Click the Search button
3. System queries all enabled indexers
4. Displays all matching releases
5. You review scores and details
6. Select specific release or use "Grab Best"
7. Release sent to download client immediately

Manual search is ideal for immediate needs or when you want to override automatic selection.

**Key characteristics:**

- On-demand: User-initiated searches
- Comprehensive: Shows all available releases
- Controlled: User selects specific release
- Immediate: Action taken right away

## Search workflow

The complete search workflow involves multiple stages:

### 1. Initiation

A search begins either:
- Through the monitoring scheduler (automatic)
- Via user clicking Search (manual)
- When adding monitored media to library

### 2. Querying indexers

The search system:
- Identifies all enabled indexers
- Constructs search queries based on media metadata
- Sends parallel requests to each indexer
- Aggregates results as they return
- Removes duplicate releases across indexers

### 3. Parsing and scoring

For each release found:
- Extracts metadata from release name
- Identifies resolution, source, codec, audio
- Calculates quality score based on profile
- Applies custom format bonuses/penalties
- Assigns final score

### 4. Selection

The system:
- Sorts releases by score (highest first)
- Filters out blocklisted releases
- Applies delay profiles (if configured)
- Selects highest-scoring acceptable release

### 5. Download

Once selected:
- Release sent to configured download client
- Added to download queue
- Monitoring begins
- Progress tracked in Activity > Queue

### 6. Import

When download completes:
- File detected in download location
- Metadata verified (ffprobe)
- File moved/renamed per naming settings
- Library updated
- Notifications sent (if configured)

## Quality scoring explained

The **Score** column in search results shows how well a release matches your quality profile.

### Score colors

- **Green** (100+): Excellent quality match
- **Yellow** (50-99): Good quality
- **Red** (`<50`): Lower quality

### Score breakdown

Hover over any score to see the detailed breakdown by category, for example:

```
Resolution: 200 (1080p)
Source: +180 (WEB-DL)
Codec: +30 (x265)
Audio: +60 (Dolby Digital)
Custom: +10 (Preferred group)
Total: 480
```

(Numbers shown reflect the active quality profile's own point values - they differ between the built-in Quality/Balanced/Compact/Streamer profiles and any custom profile you create.)

### How scores are calculated

Every release is parsed into attributes (resolution, source, codec, audio, HDR, release group, streaming service, flags) and matched against Cinephage's library of custom formats - built-in ones covering resolution, source, codec, audio, HDR, release group tiers, streaming services, and editions, plus any you define yourself. The active quality profile assigns the points for each matched format, and the total score is their sum. There is no single fixed point table shared by every profile; each profile weights formats according to its own priorities (for example, the Quality profile rewards Remux sources and lossless audio heavily, while Balanced/Streamer weight efficient codecs like x265/AV1 more).

Two special rules apply on top of the sum:
- Only the single best-matching HDR format counts (HDR bonuses don't stack).
- A small set of formats (deceptive retags, CAM/telesync/telecine/screener sources, etc.) are hard-banned - matching one excludes the release outright, not just a large point deduction.

**Custom Formats:**
- Your defined rules add or subtract points, per profile
- Can boost preferred groups, block unwanted content
- Scored alongside the built-in formats, not as a separate final step

For the full mechanics and worked examples, see [Quality Scoring](quality-scoring).

### Why scores matter

Scores enable automatic selection of the best available release. Higher scores indicate better quality matches to your preferences. The system uses scores to:

- Rank available releases
- Filter out low-quality options
- Make automatic selection decisions
- Determine when upgrades are worthwhile

For a complete explanation of the scoring algorithm, see [Quality Scoring](quality-scoring).

## Handling multiple indexers

Cinephage searches across all your configured indexers simultaneously.

### How multi-indexer search works

**Tiered Queries:**
- When an item has searchable external IDs (TMDB/IMDB/TVDB), Cinephage tries ID-based search first against indexers that support it, then falls back to text search (title/year) for indexers that don't or when the ID search comes up empty
- All eligible indexers for the current tier are queried in parallel
- Per-host rate limiting and concurrency limits keep any one tracker from being hammered, and results are cached briefly to avoid re-querying on rapid repeat searches
- No single indexer is a bottleneck

**Result Deduplication:**
- Identical releases from different indexers are merged
- Shows best indexer for each unique release
- Prevents duplicate downloads

**Failure Handling:**
- If one indexer fails, others continue
- Failed indexers don't block the search
- Results show which indexer provided each release

### Indexer diversity

Different indexers provide different benefits:

**Content Coverage:**
- Some indexers specialize in older content
- Others focus on new releases
- Niche indexers may have rare content

**Quality Variations:**
- Same release may have different seeds/peers
- Some indexers have better quality control
- Release availability varies by indexer

**Geographic Considerations:**
- Indexers may focus on specific regions
- Language availability differs
- Release timing varies

### Best practices for indexers

**Multiple Indexers:**
- Use several indexers for better coverage
- Different indexers have different content
- Redundancy if one indexer goes down

**Indexer Selection:**
- Enable indexers that match your content preferences
- Consider both general and specialized indexers
- Balance between coverage and search speed

**Rate Limits:**
- Each indexer has API limits
- Too many indexers can cause rate limiting
- Configure reasonable search intervals

## Search best practices

Understanding how to use the search system effectively helps you build a better library with less effort.

### Quality over speed

**Patience Pays Off:**
- Do not grab the first available release
- Better quality releases often appear later
- Use cutoff settings to prevent endless upgrading

**Understanding the Trade-off:**
- Early releases (HDTV) are often lower quality
- WEB-DL releases appear days after broadcast
- BluRay releases may take months but offer best quality

### Diversify indexers

**Why Multiple Indexers Matter:**
- Different indexers have different content libraries
- Some specialize in specific types of content
- Redundancy ensures coverage if one indexer fails

**Finding the Right Mix:**
- Include both general and specialized indexers
- Consider indexers for different content types
- Test which indexers work best for your needs

### Monitor, do not just search

**The Power of Automatic Search:**
- Add items with monitoring enabled
- Let automatic search work in the background
- Manual search for immediate needs only

**Benefits:**
- Set-and-forget workflow
- Catches new releases automatically
- Handles upgrades without intervention

### Respect rate limits

**Indexer Limits:**
- Indexers have API rate limits
- Too frequent searches can get you banned
- Use reasonable monitoring intervals

**Best Practices:**
- Default hourly monitoring is usually sufficient
- Avoid excessive manual searches
- Monitor indexer health in **Settings > Integrations > Indexers**

### Review before grabbing

**Check Release Details:**
- Review release names for quality indicators
- Verify file sizes are reasonable
- Consider release groups if you have preferences

**When to Override:**
- Sometimes manual selection is worth the effort
- Check for specific audio/subtitle tracks
- Verify HDR format if that's important to you

## Delay profiles

Delay profiles add a waiting period before grabbing releases, allowing better quality versions to become available.

**How Delays Work:**
- Configurable waiting period (hours/days)
- System waits before grabbing release
- If better quality appears during wait, it takes priority
- Prevents grabbing low-quality early releases

**Use Cases:**
- Wait for WEB-DL instead of HDTV
- Allow time for proper releases over CAM/TS
- Avoid initial rush of poor-quality uploads

**Configuration:**
- Set in **Settings > Library > Quality Settings > Delay Profiles**
- Can be per-quality or global
- Usenet often has shorter delays than torrents

## Troubleshooting searches

### Common issues

**No Results:**
- Verify indexers are enabled and working
- Check media has correct metadata
- Try alternate titles or TMDB ID
- Review quality profile filters

**Wrong Quality Selected:**
- Check quality profile assignment
- Review custom format scores
- Verify cutoff settings
- Check delay profile configuration

**Slow Searches:**
- Reduce number of enabled indexers
- Check indexer response times
- Verify network connectivity
- Consider indexer timeout settings

## See Also

- [Search and Download](/guides/use/search-and-download) - Practical guide to searching
- [Quality Scoring](quality-scoring) - Deep dive into scoring algorithm
- [Configure Indexers](/guides/configure/indexers) - Setting up indexers
- [Quality Profiles](/guides/configure/quality/quality-profiles) - Configuring quality preferences
- [Delay Profiles](/guides/configure/quality/delay-profiles) - Managing release timing
- [Workers and Tasks](workers-and-tasks) - Background processing
- [Architecture](architecture) - System architecture overview
