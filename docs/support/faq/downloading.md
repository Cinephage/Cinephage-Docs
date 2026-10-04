---
title: Downloading FAQ
description: Questions about downloads, quality profiles, indexers, and automation
sidebar_position: 5
tags: [faq, downloading, quality, indexers, automation]
keywords: [faq, download, quality profile, indexer, cutoff, custom format]
---

# Downloading

### Why aren't my downloads starting?

**Check:**
1. Download client configured and tested
2. Indexers configured and tested
3. Item is monitored
4. Quality profile allows available releases
5. Items not blocklisted
6. Disk space available

### What's a quality profile?

Quality profiles define:
- Which qualities are acceptable (720p, 1080p, 4K)
- Quality priority order
- Whether to upgrade
- Cutoff quality (stop upgrading here)

**Built-in profiles:**
- **Quality:** Maximum quality (upgrades to 4K)
- **Balanced:** Good quality, reasonable size (1080p preferred)
- **Compact:** Smaller files (720p/1080p)
- **Streamer:** For NZB streaming

See [Set Up Quality Profiles](/guides/configure/quality-profiles) for details.

### What's the cutoff?

Cutoff is the quality level where upgrades stop:

**Example:**
```
Profile: Balanced
Cutoff: 1080p BluRay

Downloads:
1. First: 720p HDTV
2. Upgrade: 1080p WEB-DL
3. Upgrade: 1080p BluRay ← Cutoff met, no more upgrades
```

### What's the difference between missing, cutoff unmet, and upgrade tasks?

- **Missing:** Searches for items with no files
- **Cutoff Unmet:** Searches for items below quality cutoff
- **Upgrade:** Searches for better quality on ALL items (even above cutoff)

### Why are searches slow?

**Common causes:**
1. Too many indexers (limit to 3-5)
2. Slow indexers (set lower priority)
3. Network issues
4. Rate limiting

**Solutions:**
- Disable slow indexers
- Set indexer priorities
- Increase timeout in settings
- Check network connectivity

### Why do I have two copies of the same movie (double disk usage)?

Seeding torrents stay in the download folder while the library holds its own copy. With hardlinks both names share one set of blocks (0 extra space); with a copy fallback each copy costs full size.

Check with:

```bash
stat -c '%d %i %h %s %n' /path/to/download/file.mkv /path/to/library/file.mkv
```

Same device + same inode with `Links: 2` = hardlinked, all good. Same size but different inodes with `Links: 1` = full copy — your mounts are split. Fix with the single shared root (`/data` in every container) in the [Docker install](/getting-started/installation/docker) IMPORTANT note, then remove the leftover download copy via your client once seeding is done (never delete the library side).

### What are Custom Formats?

Custom formats let you score releases based on attributes:

**Example:**
```yaml
Format: "Prefer HEVC"
Condition: Contains "HEVC" or "H.265"
Score: +50 points
```

This adds 50 points to any HEVC release, making it preferred over H.264.

## Quick Command Reference

**Trigger search tasks:**
```bash
# Via web UI: Tasks → Missing / Cutoff Unmet / Upgrade
```

**Check download client:**
```bash
# Test connection in Settings → Download Clients
```

**View indexer status:**
```bash
# Settings → Indexers → Test All
```

## See Also

- [Quality Profiles](/guides/configure/quality-profiles) - Setting up profiles
- [Library Management](/support/faq/library) - Monitored vs unmonitored
- [Streaming FAQ](/support/faq/streaming) - NZB streaming option
