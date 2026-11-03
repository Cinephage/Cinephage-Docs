---
title: Search and Download
description: Find and acquire media using Cinephage's search and download system
sidebar_position: 1
tags: [search, download, media, workflow, guide]
keywords: [search, download, media, workflow]
---

# Search and download

This guide explains how to search for media and download it using Cinephage's integrated search system.

## Goal

Find and download movies and TV shows from your configured indexers.

## Prerequisites

- Indexers configured and working
- Download client connected
- Quality profile set
- Media added to library with monitoring enabled

## Part 1: Automatic Search

### How it works

1. **Monitoring Tasks** run on schedule
2. Check all monitored items
3. Search indexers for missing/upgradable content
4. Score and select best release
5. Send to download client
6. Monitor until complete
7. Import and organize file

### Enable automatic search

1. Go to **Settings > Monitoring > Tasks**
2. Enable **Missing Content Search** (default interval: daily)
3. Set interval as needed (minimum 15 minutes)
4. Enable **Upgrade Search** (optional) to also look for better-quality replacements
5. Click **Save**

### Monitor automatic searches

Check **Activity > History** to see:

- What was searched
- What was found
- What was grabbed
- Any errors

## Part 2: Manual Search

### Search a movie

1. Go to **Library > Movies**
2. Find the movie you want
3. Click on it to open details
4. Click the **Search** button to open the release search modal

### Review results

Results appear with columns:

| Column      | Description                      |
| ----------- | -------------------------------- |
| **Indexer** | Source of the release            |
| **Title**   | Release name with quality info   |
| **Size**    | File size                        |
| **Peers**   | Seeders/Leechers (torrents only) |
| **Score**   | Quality score based on profile   |
| **Age**     | How old the release is           |
| **Grab**    | Button to download               |

### Understanding scores

The **Score** column shows how well a release matches your quality profile:

- **Green** (700+): Excellent quality match
- **Yellow** (400-699): Good quality
- **Red** (`<400`): Lower quality

Click a result row to expand it and see the detailed score breakdown.

**Learn more:** See [Search System](/explanation/search-system) for a complete explanation of how scoring works.

### Grab a release

1. Find desired release in results
2. Check score is acceptable
3. Click **Grab** button
4. Confirm in dialog
5. Release sent to download client

### Auto-grab best release (episodes)

For TV episodes specifically, there's an **Auto-grab best** action on the episode row that skips
manual review and grabs the highest-scoring release directly. This option is not available for
movies, where you review and grab from the results list manually.

## Part 3: Search TV Episodes

### Search entire series

1. Go to **Library > TV**
2. Click on series
3. Click the **Search** button on the series
4. Choose search type:
   - **Missing Episodes** - Only unwatched/missing
   - **All Episodes** - Everything monitored
   - **Selected Seasons** - Specific seasons
5. Confirm to start the search

### Search specific episode

1. Go to series details
2. Expand season
3. Find episode
4. Click the **Search** button on that episode row

## Part 4: Add and Search from Discover

Discover pages don't show a release list or quality preview before you add an item - indexer
search only runs once the item is in your library. When adding, you choose how it should behave:

1. Go to **Discover**
2. Find the movie or series and open its details
3. Choose an add option:
   - **Monitor & Search** - adds the item and immediately starts searching for releases
   - **Monitor Only** - adds the item and waits for the next scheduled automatic search
   - **Add Unmonitored** - adds the item without any automatic searching or monitoring

Choose **Monitor & Search** if you want Cinephage to search right away.

## Part 5: Advanced Search Options

### Filter results

Search results have a free-text filter box that matches against the release title (so typing
`1080p` or `BluRay` narrows the list to releases whose name contains that text), plus a **Show
Rejected** toggle to reveal releases that were filtered out by your quality profile or Custom
Formats.

### Sort results

Use the sort control above the results list to sort by:

- **Score** - Best quality first
- **Seeders** - Most seeders (torrents)
- **Size** - Smallest or largest
- **Age** - Newest or oldest

Click the sort direction button to toggle ascending/descending.

## Part 6: Handling Search Results

### No results found

If search returns nothing:

1. **Check indexers:**
   - Verify indexers are enabled
   - Test indexer connections
   - Check indexer categories

2. **Try different search:**
   - Search by TMDB ID (in URL: `/discover/movie/27205`)
   - Use alternate titles
   - Wait and try later (new releases)

3. **Check filters:**
   - Remove quality filters temporarily
   - Check Custom Formats are not blocking
   - Verify language settings

### Too many results

If overwhelmed with results:

1. **Apply filters:**
   - Use the text filter box to narrow by title (e.g. type a resolution or source keyword)
   - Turn off **Show Rejected** to hide releases your quality profile already filtered out

2. **Sort appropriately:**
   - Sort by score to see best first
   - Sort by size for storage concerns

3. **Refine quality profile:**
   - Tighten Custom Formats
   - Adjust scoring rules
   - Block unwanted sources

### Low scores

If best score is low:

1. **Check quality profile:**
   - Verify profile assigned to item
   - Check cutoff settings
   - Review custom format scores

2. **Consider waiting:**
   - Better releases may appear later
   - Enable upgrade monitoring
   - Set appropriate cutoff

## Part 7: After Grab

### Monitor download

1. Go to **Activity > Queue**
2. See download progress
3. Click item for details:
   - Download speed
   - ETA
   - File size
   - Release details

### Download complete

When download finishes:

1. Cinephage detects completion
2. File imported automatically
3. Organized according to naming settings
4. Added to library
5. Notifications sent (if configured)

### Failed downloads

If download fails:

1. Check **Activity > History**
2. See failure reason
3. Check **Activity > Blocklist**
4. Release may be auto-blocklisted
5. Next search will try different release

## Part 8: Search Best Practices

For the best search results:

- **Quality over Speed** - Wait for quality releases rather than grabbing first available; use cutoff settings to prevent endless upgrading
- **Diversify Indexers** - Use multiple indexers for better content coverage and redundancy
- **Monitor, Don't Just Search** - Enable monitoring on items and let automatic search work in the background
- **Respect Rate Limits** - Indexers have API limits; use reasonable monitoring intervals (Cinephage's built-in scheduled search tasks default to anywhere from hourly to weekly depending on the task, and can be tuned per-task under **Settings > Monitoring > Tasks**)
- **Review Before Grabbing** - Check release names, file sizes, and release groups when selecting manually

**Learn more:** See [Search System](/explanation/search-system) for detailed conceptual guidance on search best practices.

## Troubleshooting

### Searches take too long

**Problem:** Searching is very slow

**Solutions:**

- Reduce number of enabled indexers
- Disable slow indexers
- Check network connectivity
- Increase indexer timeout settings

### Results not appearing

**Problem:** No results from working indexers

**Solutions:**

- Check indexer categories are correct
- Verify API keys are valid
- Test indexer individually
- Check for indexer site issues

### Wrong quality downloaded

**Problem:** Lower quality than expected

**Solutions:**

- Check quality profile assigned
- Verify cutoff is set correctly
- Review custom format scores
- Check if better release was filtered

### Cannot grab release

**Problem:** Grab button does nothing or errors

**Solutions:**

- Check download client connection
- Verify download client has space
- Check path mappings
- Review download client logs

## Next Steps

After searching and downloading:

- [Monitor and Upgrade](monitor-and-upgrade) for quality improvements
- [Handle Failed Downloads](handle-failed-downloads) for retry strategies
- [Import Existing Files](import-existing-files) for your current library

## See Also

- [Search System](/explanation/search-system) - How the search system works
- [Quality Scoring](/explanation/quality-scoring) - Detailed scoring algorithm
- [Configure Indexers](../configure/indexers) - Indexer setup guide
- [Quality Profiles](../configure/quality/quality-profiles) - Quality configuration
- [Troubleshooting](../deploy/troubleshooting) - Common issues
