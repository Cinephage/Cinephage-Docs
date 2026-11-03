---
title: Library Management FAQ
description: Questions about managing your media library, importing files, and organization
sidebar_position: 4
tags: [faq, library, import, organization, media]
keywords: [faq, library, import, organize, root folder, monitored]
---

# Library Management

### Why isn't my media showing up?

**Check:**
1. Root folder path is correct (use container path in Docker)
2. Cinephage has read permissions
3. Files are in supported format (.mkv, .mp4, .avi, etc.)
4. Run Library Scan: Library → Movies/TV → Scan Library

### How do I add my existing library?

1. Go to **Library → Movies** or **Library → TV**
2. Click **Import**
3. Select folder containing your media
4. Review and confirm matches
5. Cinephage will organize and add to library

See [Import Existing Files](/guides/use/import-existing-files) for details.

### Can I have multiple Root Folders?

Yes! You can create multiple Root Folders:
```
/media/movies      (Movies root)
/media/tv          (TV Shows root)
/media/anime       (Anime root)
/media/kids        (Kids content root)
```

Each must be dedicated to one media type (don't mix movies and TV).

### What's the difference between monitored and unmonitored?

- **Monitored:** Cinephage actively searches for this content
- **Unmonitored:** Item is in library but won't be auto-searched

**Use cases:**
- **Monitored:** Content you want to download/upgrade
- **Unmonitored:** Content you already have, don't need more

### How do I organize my files?

Cinephage can organize files automatically:

1. Configure naming patterns in **Settings > Library > Naming**
2. Use tokens like `{Movie Title}`, `{Release Year}`, `{Quality}`
3. Cinephage applies patterns during import
4. Use "Organize" feature to rename existing files

See [Organize Files](/guides/use/organize-files) for patterns and examples.

### Can Cinephage write local metadata files (NFO/artwork) for Jellyfin/Kodi?

Yes. Since Cinephage's library is `.strm`-based, Jellyfin can't probe the actual media file during a scan, which can leave a title with no known resolution or duration in Jellyfin. Enable **Settings > Library > File Management > Sidecar Files** to have Cinephage write Kodi-standard `.nfo` metadata and `poster.jpg`/`fanart.jpg` artwork alongside each imported movie and episode. See [Configure Sidecar Files](/guides/configure/system/sidecar-files) for details, including how to backfill an existing library.

### Why are my movies/shows matched incorrectly?

**Common causes:**
1. **No year in filename** - Add release year
2. **Ambiguous title** - Similar movies with same name
3. **Foreign title** - Different names in different regions

**Solutions:**
1. Rename files with year: `Movie Title (2024).mkv`
2. Use TMDB ID: `Movie Title {tmdb-12345}.mkv`
3. Manually correct match during import

## Quick Command Reference

**Scan library:**
```bash
# Trigger via web UI: Library → Movies/TV → Scan Library
```

**Check file permissions:**
```bash
ls -la /path/to/media
docker compose exec cinephage ls -la /path/to/media
```

**View library stats:**
```bash
# In Cinephage web UI: Library → Movies/TV shows count
```

## See Also

- [Import Existing Files](/guides/use/import-existing-files) - Detailed import guide
- [Organize Files](/guides/use/organize-files) - File naming patterns
- [Downloading FAQ](/support/faq/downloading) - Automated downloads
- [Troubleshooting](/support/faq/troubleshooting) - Import issues
