---
title: Naming Tokens
description: Complete list of tokens for file naming patterns
sidebar_position: 2
tags: [naming, tokens, reference]
keywords: [naming, tokens, variables, patterns]
---

# Naming tokens

This reference lists all available tokens for customizing file naming patterns in Cinephage.

## Overview

Naming tokens allow dynamic construction of filenames and paths based on media metadata. Tokens are enclosed in curly braces `{}` and are replaced with actual values during organization.

Canonical token names have no spaces (e.g. `{CleanTitle}`), but many tokens also accept one or more older, space-containing alias names for convenience and backward compatibility (e.g. `{Movie CleanTitle}`, `{Series CleanTitle}`) - both forms work identically. This page lists the canonical name first, with aliases noted underneath.

## Movie tokens

| Token | Aliases | Description |
|-------|---------|-------------|
| `{Title}` | `{Movie Title}` | Title as-is. `{Title:ES}` for a localized title, `{Title:First}` for first-letter folder organization (A/, B/, ...) |
| `{CleanTitle}` | `{MovieCleanTitle}`, `{Movie CleanTitle}` | Title with special characters removed. Supports the same `:ES`/`:First` format specs |
| `{OriginalTitle}` | `{MovieOriginalTitle}`, `{Movie OriginalTitle}` | Original-language title as-is |
| `{OriginalCleanTitle}` | `{MovieOriginalCleanTitle}` | Original-language title with special characters removed |
| `{Year}` | `{Release Year}` | Release year |
| `{TmdbId}` | `{TMDB Id}`, `{TMDb Id}` | TMDB ID number |
| `{ImdbId}` | `{IMDb Id}` | IMDb ID (e.g. `tt1234567`) |
| `{MediaId}` | `{MovieId}` | Media-server-formatted ID - `{tmdb-12345}` for Plex/Emby or `[tmdbid-12345]` for Jellyfin, based on the Media Server ID Format setting |
| `{Edition}` | `{Edition Tags}` | Edition (Director's Cut, Extended, etc.) |

## Collection tokens

| Token | Aliases | Description |
|-------|---------|-------------|
| `{Collection}` | `{Movie Collection}` | TMDB collection name |
| `{CleanCollectionTitle}` | - | Collection name with special characters removed |

## Series tokens

| Token | Description |
|-------|-------------|
| `{SeriesTitle}` | Series title as-is |
| `{SeriesCleanTitle}` | Series title with special characters removed |
| `{Year}` | First air year |
| `{SeriesOriginalTitle}` | Original series title as-is |
| `{SeriesOriginalCleanTitle}` | Original series title with special characters removed |
| `{TvdbId}` (alias `{TVDb Id}`, `{TVMDb Id}`) | TVDB ID number |
| `{TmdbId}` (alias `{TMDB Id}`, `{TMDb Id}`) | TMDB ID number |
| `{SeriesId}` | Media-server-formatted ID, TVDB-preferred (falls back to TMDB) |

## Episode tokens

| Token | Aliases | Description |
|-------|---------|-------------|
| `{Season}` | - | Season number. `{Season:00}` for zero-padding |
| `{Episode}` | - | Episode number(s). `{Episode:00}` for zero-padding. Multi-episode files are formatted per the Multi-Episode Style setting: `range` (`E01-E03`, default), `extend` (`E01E02E03`), `duplicate` (`E01-E02-E03`), `repeat`, or `scene` |
| `{EpisodeTitle}` | `{Episode Title}` | Episode title as-is |
| `{EpisodeCleanTitle}` | - | Episode title with special characters removed |
| `{Absolute}` | `{Absolute Episode}` | Absolute episode number (anime). `{Absolute:000}` for padding |
| `{AirDate}` | `{Air Date}` | Air date (YYYY-MM-DD, for daily shows) |

## Quality tokens

| Token | Aliases | Description |
|-------|---------|-------------|
| `{Quality}` | - | `Source-Resolution` string, e.g. `Bluray-1080p`. Not aliased to any docs-style name to avoid confusion with `{Resolution}` |
| `{QualityFull}` | `{Quality Full}`, `{Quality Source}` | Quality with PROPER/REPACK markers, e.g. `Proper Bluray-1080p` |
| `{Resolution}` | `{Quality Title}` | Resolution only, e.g. `1080p` |
| `{Source}` | `{Quality Type}` | Source only, e.g. `Bluray`, `WEB-DL` |
| `{Proper}` | - | Literal `PROPER` if applicable, else empty |
| `{Repack}` | - | Literal `REPACK` if applicable, else empty |

## Video tokens

| Token | Aliases | Description |
|-------|---------|-------------|
| `{VideoCodec}` | `{Codec}`, `{MediaInfo VideoCodec}` | Video codec (x264, x265, AV1) |
| `{HDR}` | `{MediaInfo VideoDynamicRangeType}` | HDR format (DV, HDR10, HDR10+) |
| `{BitDepth}` | `{MediaInfo VideoBitDepth}` | Bit depth (8, 10, 12) |
| `{3D}` | - | Literal `3D` if applicable, else empty |

## Audio tokens

| Token | Aliases | Description |
|-------|---------|-------------|
| `{AudioCodec}` | `{MediaInfo AudioCodec}` | Audio codec (TrueHD, DTS-HD MA, etc.) |
| `{AudioChannels}` | `{MediaInfo AudioChannels}`, `{MediaInfo AudioChannelsFriendly}`, `{Audio}`, `{Audio Channels}` | Audio channels (5.1, 7.1, etc.) |
| `{AudioLanguages}` | - | Audio languages present in the file |

## Release tokens

| Token | Aliases | Description |
|-------|---------|-------------|
| `{ReleaseGroup}` | `{Group}`, `{Release Group}` | Release group name |

## Conditional tokens

| Pattern | Description |
|---------|-------------|
| `{[{Token}]}` | Include the bracketed content only if `Token` has a value - e.g. `{[{HDR}]}` renders `[HDR10]` when HDR data exists, or nothing at all when it doesn't |
| `{prefix{Token}suffix}` | Include a prefix/suffix around `Token` only if it has a value |
| `{edition-{Edition}}` | Example of the above: renders `edition-Directors Cut` only when an edition exists |

## Token modifiers

Format specs are appended after a colon inside the token, e.g. `{Season:00}`.

| Modifier | Applies to | Description |
|----------|------------|-------------|
| `:00` | `{Season}`, `{Episode}`, `{Absolute}` | Zero-pad to the given number of digits (`:0` = no padding, `:00` = 2 digits, `:000` = 3 digits) |
| `:ES` (any 2-3 letter language code) | `{Title}`, `{CleanTitle}` | Render the localized title for that language if available, falling back to the main title |
| `:First` | `{Title}`, `{CleanTitle}`, `{OriginalTitle}` | Render just the first alphanumeric character, uppercased - for A/B/C-style folder organization |

## Reserved characters

Colons in rendered values are replaced according to the **Colon Replacement** naming setting (`delete`, `dash`, `spaceDash`, `spaceDashSpace`, or `smart` - `smart` is the default and picks a style based on context, e.g. treating `Show: Subtitle` differently from a time-of-day colon). Other filesystem-invalid characters (`/ \ ? * " < > |`) are stripped from generated titles.

## Usage examples

### Movie naming examples

**Standard movie file:**
```
{Title} ({Year}) - {QualityFull}
# Result: Inception (2010) - Bluray-1080p
```

**With release group:**
```
{Title} ({Year}) - {QualityFull} - {ReleaseGroup}
# Result: Inception (2010) - Bluray-1080p - SPARKS
```

**Path with collection:**
```
{Collection}/{Title} ({Year})/{Title} ({Year}) - {QualityFull}
# Result: The Dark Knight Collection/The Dark Knight (2008)/The Dark Knight (2008) - Bluray-1080p
```

Folder levels are separated with `/` only - the pattern is split on forward slash before each segment is rendered. A literal `\` is not a path separator; it's stripped as a filesystem-invalid character (see Reserved characters below).

**Conditional edition tag:**
```
{Title} ({Year}) {[- {Edition}]}
# Result (with edition): Blade Runner (1982) - Director's Cut
# Result (without edition): Blade Runner (1982)
```

### TV naming examples

**Standard episode:**
```
{SeriesTitle} - S{Season:00}E{Episode:00} - {EpisodeTitle}
# Result: Breaking Bad - S01E01 - Pilot
```

**Season folder:**
```
{SeriesTitle}/Season {Season:00}/{SeriesTitle} - S{Season:00}E{Episode:00}
# Result: Breaking Bad/Season 01/Breaking Bad - S01E01
```

**Anime with absolute numbering:**
```
{SeriesTitle} - {Absolute:000} - {EpisodeTitle}
# Result: One Piece - 100 - The Legend Begins
```

**Multi-episode file (default range style):**
```
{SeriesTitle} - S{Season:00}E{Episode:00}
# Result for a 3-episode file: Breaking Bad - S01E01-E03
```

## See Also

- [Indexer Definitions](indexer-definitions) - YAML format for defining custom indexers
- [How to Configure Indexers](/guides/configure/indexers) - Step-by-step guide for configuring indexers
- [How to Organize Files](/guides/use/organize-files) - Guide to file organization and naming patterns
- [Root Folders](/guides/configure/library/root-folders) - Configure Root Folders and naming settings
