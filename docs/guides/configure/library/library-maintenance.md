---
title: Library Maintenance
description: Keep your media library organized and healthy with regular maintenance
sidebar_position: 4
tags: [library, maintenance, scanning, metadata, guide]
keywords: [library, maintenance, scanning, metadata, disk space]
---

# Library maintenance

Regular maintenance keeps your library organized and running smoothly.

## Regular Tasks

### Weekly

- [ ] Review Activity for failures
- [ ] Check for missing episodes
- [ ] Verify new releases added correctly

### Monthly

- [ ] Clean up blocklist
- [ ] Review quality profiles
- [ ] Check disk space
- [ ] Backup database

### Quarterly

- [ ] Review indexer health
- [ ] Update download client settings
- [ ] Archive old logs
- [ ] Optimize database

## Library Scanning

### Manual scan

1. Go to **Library > Movies** or **Library > TV**
2. Click **Scan Library**
3. Cinephage checks for:
   - New files
   - Deleted files
   - Changed files
   - Metadata updates

### Automatic scanning

Scanning is configured per-library rather than globally. Edit a library under **Settings > Library > Libraries** and set its **Scan Mode**:

- **Manual** - Only scans when you trigger it
- **Scheduled** - Scans on an interval you set (in minutes)
- **Scheduled Daily** - Scans once per day at a time you set
- **Watch** - Watches the filesystem for changes and scans automatically (with a debounce delay)

### Scan results

- Files added
- Files removed
- Metadata updated
- Errors encountered

## Metadata Refresh

Update TMDB metadata for items:

1. Select item(s)
2. Click **Refresh & Scan**
3. Cinephage fetches latest:
   - Posters and artwork
   - Plot summaries
   - Cast and crew
   - Ratings
   - Release dates

:::tip[Scheduled Refresh]
TMDB data changes over time. Refresh monthly for active series.
:::

## Disk Space Management

### Monitor usage

Navigate to **Settings > Monitoring > Storage Maintenance** to get a full picture of your storage:

- **Storage summary** - total used across all libraries broken down by movies, TV, and subtitles with a visual usage bar
- **Libraries and Root Folders** - per-library and per-root-folder breakdown with disk usage bars showing Cinephage vs other vs free space; click a library row to collapse or expand its root folders
- **Top Played Items** - sortable table of most-played content; filter by All, Movies, or Episodes
- **Largest Items** - sortable table of biggest files to help identify candidates for cleanup

:::tip[Dashboard shortcut]
The storage card on the dashboard links directly to the Storage Maintenance page.
:::

:::note[Free space accuracy]
When multiple root folders share the same physical disk or network share, Cinephage deduplicates free space by filesystem device ID so the total is never counted more than once.
:::

### Cleanup strategies

1. **Unmonitor Unwanted Items:**
   - Stop searching for old series
   - Keep files but disable monitoring

2. **Delete Unwatched:**
   - Review play history
   - Delete items never watched
   - Use "Delete Files & Remove" action

3. **Quality Cleanup:**
   - Keep only best quality
   - Delete lower quality duplicates
   - Use "Organize" to consolidate

## Best Practices

### Organization

1. **Use Meaningful Root Folder Names:**
   - "Movies" not "Media"
   - "TV Shows" not "Series"

2. **Keep Paths Simple:**
   - `/media/movies` not `/home/user/media/collection/movies/final`

3. **Separate by Type:**
   - Don't mix movies and TV
   - Consider anime separately
   - Kids content in dedicated folder

### Maintenance

1. **Regular Scans:**
   - Enable automatic scanning
   - Or scan weekly manually

2. **Monitor Disk Space:**
   - Set up alerts
   - Plan storage expansion

3. **Keep Backups:**
   - Database backup weekly
   - Configuration backup monthly

4. **Clean Regularly:**
   - Review blocklist monthly
   - Clean up failed downloads
   - Archive old logs

### Performance

1. **SSD for Config:**
   - Database on fast storage
   - Media can be on slower storage

2. **Optimize Database:**
   - VACUUM monthly
   - ANALYZE weekly

3. **Limit Library Size:**
   - Realistic collection size
   - Quality over quantity

## See Also

- [Import Existing Files](../../use/import-existing-files) - Import your existing media
- [Organize Files](../../use/organize-files) - File naming and organization
- [Monitor and Upgrade](../../use/monitor-and-upgrade) - Automated monitoring
- [Troubleshooting](../../deploy/troubleshooting) - Solve common issues
