---
title: Handle Failed Downloads
description: Deal with failed downloads, use the blocklist, and retry strategies
sidebar_position: 3
tags: [downloads, failures, troubleshooting, guide, blocklist, retry]
keywords: [failed downloads, blocklist, retry, troubleshooting]
---

# Handle failed downloads

This guide explains how to handle failed downloads and use the blocklist effectively to prevent repeated issues.

## Understanding Download Failures

Downloads can fail for many reasons. Understanding the cause helps determine the right solution.

### Common failure types

| Failure Type | Cause | Solution |
|--------------|-------|----------|
| **Download Client Error** | Connection issue, disk full, permissions | Check download client |
| **Import Failure** | Permissions, file locked, path issues | Check file system |
| **Missing Files** | NZB/torrent incomplete, DMCA takedown | Try alternative release |
| **Quality Rejected** | File doesn't match expected quality | Adjust quality profile |
| **Custom Format Rejected** | Doesn't meet format requirements | Review Custom Formats |
| **Unknown Movie/Episode** | Can't parse release name | Manual import or skip |

## The Activity Page

Your first stop for managing downloads is the **Activity** section.

### Activity overview

Navigate to **Activity** to see:

- **Queue** - Current downloads in progress
- **History** - Completed and failed downloads

The blocklist is a separate settings section, not part of Activity - see [Using the Blocklist](#using-the-blocklist) below.

### Reading the queue

The queue shows active downloads:

```
┌─────────────────────────────────────────────────────────────┐
│ Queue (3 items)                                             │
├─────────────────────────────────────────────────────────────┤
│ The Matrix (1999)                                           │
│   Status: Downloading - 45% @ 2.5 MB/s                      │
│   Client: qBittorrent                                       │
│   Time Left: 12 minutes                                     │
│                                                             │
│ Breaking Bad S01E01                                         │
│   Status: Paused                                            │
│   Client: SABnzbd                                           │
│   Action: Resume                                            │
└─────────────────────────────────────────────────────────────┘
```

**Columns Explained:**

| Column | Description |
|--------|-------------|
| **Title** | Movie or episode name |
| **Status** | Current download state |
| **Progress** | Percentage complete |
| **Client** | Which download client |
| **Actions** | Available actions (pause, remove, etc.) |

### Understanding history

History shows completed downloads and their outcomes:

```
┌─────────────────────────────────────────────────────────────┐
│ History                                                      │
├─────────────────────────────────────────────────────────────┤
│ Inception (2010)                                            │
│   Event: Imported                                           │
│   Quality: 1080p BluRay                                     │
│   Date: 2024-01-15 14:30                                    │
│                                                             │
│ The Dark Knight (2008)                                      │
│   Event: Failed - Download incomplete                       │
│   Reason: Articles missing from server                      │
│   Date: 2024-01-15 13:45                                    │
└─────────────────────────────────────────────────────────────┘
```

**Event Types:**

| Event | Meaning |
|-------|---------|
| **Grabbed** | Download started |
| **Imported** | Successfully added to library |
| **Failed** | Download failed |
| **Upgrade** | Replaced with better quality |
| **Deleted** | File deleted from library |

## Handling Failed Downloads

### Step 1: identify the failure

When a download fails:

1. Go to **Activity > History**
2. Find the failed item (red icon)
3. Click to expand details
4. Note the **failure reason**

**Common Failure Reasons:**

```
 "Download failed: Disk full"
   → Check download client disk space

 "Import failed: Access denied"
   → Check file permissions

 "No files found"
   → NZB/torrent was empty or deleted

 "Manual intervention required"
   → Check download client for issues

 "Release marked as failed"
   → Blocked due to previous failure
```

### Step 2: check the download client

Many failures originate in the download client:

**For qBittorrent:**

1. Open qBittorrent web UI
2. Check torrent status:
   - Stalled: No seeds available
   - Error: Connection/tracker issue
   - Missing files: Deleted or moved
3. Review error messages

**For SABnzbd:**

1. Open SABnzbd web UI
2. Check queue and history
3. Look for:
   - "Missing articles" - Incomplete NZB
   - "Failed repair" - PAR2 couldn't fix
   - "Verification failed" - Password protected
4. Review server status

### Step 3: take appropriate action

Based on the failure type:

#### Disk Space Issues

**Problem:** Download client out of space

**Solution:**
1. Free up disk space on download drive
2. Check Cinephage import settings
3. Verify completed downloads are being removed
4. Consider larger storage

#### Permission Issues

**Problem:** Cinephage can't access files

**Solution:**
```bash
# Check permissions
ls -la /path/to/downloads
ls -la /path/to/media

# Fix permissions (Linux/Docker)
chmod -R 755 /path/to/media
chown -R 1000:1000 /path/to/media  # Adjust IDs as needed
```

**Docker-specific:**
- Ensure PUID/PGID match your user
- Volume mounts use correct paths
- Check container can access both directories

#### Incomplete Downloads

**Problem:** NZB is incomplete or torrent has no seeds

**Solution:**
1. Wait for more sources (torrents may gain seeds)
2. Try alternative release
3. Check if release is still available on indexer
4. Consider blocklisting and searching again

#### Wrong Content

**Problem:** Downloaded file doesn't match expected movie/episode

**Solution:**
1. Verify file contents manually
2. If wrong content:
   - Remove from download client
   - Add to blocklist (prevent re-download)
   - Search for correct release

### Step 4: retry or search alternative

After fixing the issue, you have options:

**Option 1: Automatic Retry**

If task hasn't run yet, wait for:
- Missing Content Search task
- Cutoff Unmet Search task

**Option 2: Manual Search**

Force immediate search:

1. Go to movie/episode page
2. Click **Search** button
3. Cinephage searches indexers
4. Select alternative release

**Option 3: Alternative Release**

From Activity:

1. Find failed item in History
2. Click **Search Again**
3. Review alternative releases
4. Select different quality/source

## Using the Blocklist

### What is the blocklist?

The blocklist prevents problematic releases from being downloaded again:

**When Items Are Blocklisted:**
-  Download failed
-  Wrong content
-  Bad quality
-  Manually added by user

**Blocklist Behavior:**
- Blocked releases are skipped in searches
- They won't appear in search results

### Automatic blocklisting

Cinephage automatically adds releases to blocklist when:

1. **Download fails** - Client reports failure
2. **Import fails** - Can't import after multiple attempts
3. **Wrong content** - Manual marking
4. **Release deleted** - File removed by user

### Manual blocklisting

Add releases to blocklist manually:

**From History:**

1. Go to **Activity > History**
2. Find the release
3. Click **Blocklist** button
4. Confirm addition

**From Search Results:**

1. Search for content
2. Find problematic release
3. Click **Blocklist** icon
4. Release won't appear in future searches

**From Queue:**

1. Go to **Activity > Queue**
2. Find active download
3. Click **Remove & Blocklist**
4. Stops download and prevents retry

### Viewing the blocklist

Access blocklisted releases:

1. Go to **Settings > Blocklist**
2. See all blocked releases
3. Columns include:
   - Release title
   - Blocked date
   - Reason for block
   - Source indexer

### Managing the blocklist

**Remove from Blocklist:**

If you want to allow a release again:

1. Go to **Settings > Blocklist**
2. Find the release
3. Click **Remove** or checkbox + **Remove Selected**
4. Release can be downloaded again

**Clear Entire Blocklist:**

1. Click **Clear All**
2. Confirm deletion
3. All releases unblocked

:::warning[Use Sparingly]
Only clear blocklist if you understand why items were blocked. Clearing may result in re-downloading problematic releases.
:::

### Blocklist best practices

**Do Blocklist:**
-  Releases with wrong content
-  Consistently failing releases
-  Releases from untrusted sources
-  Poor quality encodes

**Don't Blocklist:**
-  Temporary failures (connection issues)
-  Releases that might work later (torrents gaining seeds)
-  Single failures that might be one-off

## Bulk Operations

### Bulk clear failed downloads

Clear multiple failed items at once:

**Step 1: Access Bulk Clear**

1. Go to **Activity > History**
2. Click **Filter** and select **Failed**
3. Select multiple items using checkboxes
4. Click **Clear Failed** button

**Step 2: Confirm Bulk Clear**

A confirmation modal appears:

```
┌─────────────────────────────────────────────────────────────┐
│ Clear Failed Downloads                                        │
├─────────────────────────────────────────────────────────────┤
│ You are about to remove 15 failed items:                    │
│                                                              │
│  - The Matrix (1999) - Missing articles                     │
│  - Inception (2010) - Download incomplete                    │
│  - Avatar (2009) - Disk full                                │
│                                                              │
│ These items will be removed from the queue.                   │
│ (Blocked status depends on your settings)                     │
│                                                              │
│ [ ] Also add to blocklist                                    │
│                                                              │
│                    [Cancel]  [Clear 15 Items]                │
└─────────────────────────────────────────────────────────────┘
```

**Step 3: Choose Blocklist Option**

| Option | Behavior |
|--------|----------|
| **Unchecked** | Items removed from queue only, can be re-searched |
| **Checked** | Items removed AND added to blocklist to prevent re-download |

**Step 4: Complete**

Click **Clear 15 Items** to confirm.

:::warning[Blocklist Warning]
If you check "Also add to blocklist," these releases will be skipped in future searches. Only enable this for releases that genuinely won't work.
:::

### Bulk clear from activity

You can also access bulk clear from **Activity > History**:

1. Filter to show failed items only
2. Click **Select All** or pick specific items
3. Click **Clear Selected**
4. Confirm the bulk operation

### API endpoint for bulk clear

Use the queue API to programmatically clear failed downloads:

```bash
# Clear failed items, optionally only ones older than N days, or preview with dryRun
curl -X POST \
  -H "x-api-key: cinephage_your_key_here" \
  "http://localhost:3000/api/queue/clear-failed?olderThanDays=7&dryRun=false"

# Response
{
  "success": true,
  "dryRun": false,
  "olderThanDays": 7,
  "summary": { "cleared": 15, "total": 15 },
  "cleared": ["..."]
}
```

This endpoint clears failed items from the queue; it does not add them to the blocklist - use the blocklist endpoints/UI separately for that.

### Queue cleanup API

The queue cleanup endpoint removes old completed items:

```bash
# Cleanup queue (removes old completed items)
curl -X POST \
  -H "x-api-key: cinephage_your_key_here" \
  http://localhost:3000/api/queue/cleanup
```

This is useful for:
- Removing old completed downloads from history
- Keeping the queue manageable
- Automating maintenance via cron

## Advanced Failure Management

### Vanished download recovery

If a download disappears from the download client before Cinephage can import it (for example, the client restarted, the torrent was removed, or the item was manually deleted), Cinephage automatically attempts to recover it using client path reconstruction. It locates the files via the expected download path and retries the import without requiring manual intervention.

If recovery fails, the item is marked as failed and appears in **Activity > History** where you can review the error and search for an alternative release.

### Failed download handling

There is no dedicated user-configurable "retry attempts/retry delay" settings page - failed-download recovery is handled internally: a failed grab gets a 1-hour cooldown before Cinephage attempts a re-grab, and permanently-failed items stop being retried automatically rather than looping forever (they still show up in Activity > History for you to search alternatives manually or blocklist).

### Release rejection analysis

Understand why releases are rejected:

**From Search Results:**

Hover over rejected releases to see reason:

```
 Blocklisted
   → Previously marked as failed

 Quality Rejected
   → Below minimum quality in profile

 Custom Format Rejected
   → Doesn't meet format requirements

 Age Rejected
   → Too old for delay profile

 Size Rejected
   → Outside size limits
```

**From Logs:**

Detailed rejection reasons in logs:

```bash
# View rejection logs
docker logs cinephage | grep -i reject

# Or native
journalctl -u cinephage | grep -i reject
```

### Manual import after failure

If automatic import fails, try manual import:

1. Go to **Activity > History**
2. Find failed item
3. Click **Manual Import**
4. Browse to downloaded files
5. Match files to correct movie/episode
6. Click **Import**

**When to Use:**
- File name couldn't be parsed automatically
- Wrong content detected but actually correct
- Import keeps failing but files are valid

## Troubleshooting Specific Scenarios

### Scenario 1: repeated failures for same item

**Problem:** Same movie/episode keeps failing different releases

**Diagnosis:**
1. Check Activity > History for patterns
2. Look for common failure reasons
3. Verify quality profile settings
4. Check indexer availability

**Solutions:**

```
If all releases fail with "Missing articles":
  → Content may be too old for provider retention
  → Try different indexer
  → Consider download age limit

If all releases fail with "Import error":
  → Check file permissions
  → Verify root folder paths
  → Review import method settings

If quality keeps being rejected:
  → Adjust quality profile minimums
  → Check custom format scores
  → Review release size limits
```

### Scenario 2: blocklist growing too large

**Problem:** Blocklist has hundreds or thousands of entries

**Impact:**
- Slower search performance
- Higher memory usage
- Cluttered interface

**Solutions:**

1. **Review Blocklist Regularly:**
   - Remove old entries (>1 year)
   - Keep only problematic releases
   - Clear entries for resolved issues

2. **Prevent Unnecessary Blocks:**
   - Don't block temporary failures
   - Allow retry before blocking
   - Check if issue is systemic

3. **Bulk Cleanup:**
   - Export blocklist for review
   - Clear all and start fresh
   - Import only problematic ones

### Scenario 3: good releases getting blocked

**Problem:** Legitimate releases are being blocked

**Causes:**
- Over-aggressive blocklisting
- Similar names to bad releases
- Automatic block on false failure

**Solutions:**

1. **Check Blocklist Reason:**
   - Was it manual or automatic?
   - What was the failure reason?
   - Is pattern repeating?

2. **Remove from Blocklist:**
   ```
   Settings > Blocklist > Find release > Remove
   ```

3. **Search Again:**
   - Try the release again
   - Monitor for success
   - If fails again, investigate root cause

### Scenario 4: download completes but won't import

**Problem:** File downloads successfully but import fails repeatedly

**Common Causes & Solutions:**

**Permission Denied:**
```bash
# Fix ownership
chown -R $USER:$USER /path/to/media

# Fix permissions
chmod -R u+w /path/to/media
```

**Disk Full:**
```bash
# Check disk space
df -h

# Clean up if needed
rm -rf /path/to/temp/files
```

**File Locked:**
- Wait for download client to release file
- Check if file is being scanned by antivirus
- Verify no other process has file open

**Path Issues:**
- Check root folder path is correct
- Verify Docker volume mounts
- Ensure path exists and is writable

**Video File Issues:**
- Corrupt file (try playing in VLC)
- Wrong format (check file extension)
- DRM protected (can't import)

## Best Practices

### Preventing failures

1. **Proper Configuration:**
   - Set correct root folder paths
   - Configure download client properly
   - Use appropriate quality profiles
   - Set reasonable size limits

2. **Regular Maintenance:**
   - Monitor disk space
   - Review blocklist monthly
   - Check download client health
   - Update indexers regularly

3. **Smart Blocklisting:**
   - Only block truly problematic releases
   - Document why items are blocked
   - Review blocklist periodically
   - Clear resolved issues

### When failures happen

1. **Don't Panic:**
   - Most failures are temporary
   - Alternative releases usually available
   - No data is lost

2. **Systematic Approach:**
   - Identify failure type
   - Check relevant systems
   - Apply appropriate fix
   - Monitor for resolution

3. **Learn from Patterns:**
   - Are failures indexer-specific?
   - Is it always the same error?
   - Time-based patterns?
   - Use patterns to prevent future issues

## See Also

- [Troubleshooting](../deploy/troubleshooting) - General troubleshooting guide
- [Search and Download](search-and-download) - Manual searching techniques
- [Monitor and Upgrade](monitor-and-upgrade) - Automated monitoring setup
- [Configure Download Clients](../configure/download-clients) - Client configuration
