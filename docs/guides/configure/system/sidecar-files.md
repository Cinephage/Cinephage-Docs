---
title: Configure Sidecar Files
description: Write Kodi-compatible .nfo and poster/fanart artwork files alongside your imported media
sidebar_position: 3
tags: [sidecar, nfo, artwork, poster, fanart, jellyfin, kodi, library, configuration, guide]
keywords: [nfo, sidecar files, poster, fanart, kodi metadata, jellyfin resolution]
---

# Configure sidecar files

Cinephage can write Kodi-standard `.nfo` metadata files and `poster.jpg`/`fanart.jpg` artwork alongside your imported movies and TV episodes, in addition to the metadata Cinephage already serves through its own API.

## Why use this

Cinephage's library is `.strm`-based (a small pointer file, not a full media file, in the folder your media server scans). Jellyfin never probes a `.strm` file's actual stream during a library scan, so without a sidecar file a movie or episode can sit indefinitely with no known resolution or duration in Jellyfin's own metadata. Writing an `.nfo` file alongside the `.strm` gives Jellyfin (and Kodi, and any other media server that reads local NFO/artwork files) real metadata to display without needing to probe anything.

This does **not** change how a title shows up as "available" in request tools like Overseerr/Jellyseerr - that's a structural limitation of how those tools and Jellyfin detect availability for `.strm`-based libraries generally, not something a sidecar file (or any other Cinephage-side change) can fix.

## Enabling it

Navigate to **Settings > Library > File Management** and find the **Sidecar Files** section.

1. Toggle sidecar files **on**.
2. **Overwrite existing files** - off by default; when off, Cinephage skips writing a sidecar if one already exists at that path (so it won't clobber a file you or another tool manages there). Turn this on if you want Cinephage's own regeneration to always win.
3. **Include artwork** - when on, `poster.jpg`/`fanart.jpg` are downloaded from TMDB alongside the `.nfo`; when off, only the `.nfo` metadata file is written.
4. **TV levels** - for TV/anime, each of Show, Season, and Episode sidecar output is toggled independently, so you can, for example, write episode-level `.nfo` files without series/season-level ones, or vice versa. Turning one level off only skips files at that level - the others are unaffected.

## What gets written

| Content | File | Location |
| --- | --- | --- |
| Movie | `<filename>.nfo` | Same folder as the movie's `.strm` file |
| Movie artwork | `poster.jpg`, `fanart.jpg` | Movie's own folder |
| TV show | `tvshow.nfo` | Series root folder (written once) |
| TV show artwork | `poster.jpg`, `fanart.jpg` | Series root folder |
| Season | `season.nfo` | Inside that season's own subfolder |
| Season artwork | `seasonNN-poster.jpg` (zero-padded) | Series root folder, alongside the show's own `poster.jpg` |
| Episode | `<filename>.nfo` | Same folder as the episode's `.strm` file |

This matches Kodi's standard NFO/artwork naming convention, so it's compatible with any media server or tool that reads local Kodi-style metadata, not just Jellyfin.

## When files are written

Sidecar files are written automatically on import - both a normal detected import and a manual match/import - immediately after a movie or episode file is successfully imported into your library. If a write fails, it never fails the import itself; the import still completes and the failure is only logged.

Renaming a file (manually or via Cinephage's naming engine) moves its `.nfo` sidecar alongside it on a best-effort basis, so the sidecar stays in sync with the media file's new name/path instead of being left behind under the old one.

## Backfilling existing imports

Sidecar files are only written going forward once the feature is enabled - existing library items imported before you turned it on won't retroactively get `.nfo`/artwork files. To backfill your whole library, run the **Regenerate Sidecar Files** task from the Tasks page: it regenerates `.nfo` and poster/fanart sidecar files for the entire library, overwriting existing ones - useful specifically for backfilling older imports or after changing your sidecar settings.
