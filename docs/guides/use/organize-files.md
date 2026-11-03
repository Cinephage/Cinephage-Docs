---
title: Organize Files
description: Use custom naming patterns and folder structures to organize your media library
sidebar_position: 5
tags: [naming, organization, files, guide, patterns, tokens]
keywords: [naming, organization, files, patterns, tokens]
---

# Organize files

This guide explains how to use custom naming patterns to organize your media library exactly how you want it.

## Overview

Cinephage automatically organizes files using customizable naming patterns. You control:

- **Folder structure** - How movies and shows are organized
- **File names** - How individual files are named
- **Special handling** - Multi-episode files, specials, etc.

## Understanding Naming Patterns

Naming patterns use **tokens** (variables) that get replaced with actual values:

```
{Movie Title} ({Release Year}) - {Quality} - {Group}
↓
The Matrix (1999) - BluRay-1080p - YIFY
```

### Available tokens

#### Movie Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `{Movie Title}` | Full movie title | "The Matrix" |
| `{Movie Title:EN}` | Title in English | "The Matrix" |
| `{OriginalTitle}` | Title in original language | "七人の侍" |
| `{OriginalCleanTitle}` | Original title, special chars removed | "七人の侍" |
| `{Release Year}` | Release year | "1999" |
| `{IMDb Id}` | IMDb identifier | "tt0133093" |
| `{TMDB Id}` | TMDB identifier | "603" |
| `{Quality}` | Quality string (Source-Resolution) | "BluRay-1080p" |
| `{QualityFull}` | Quality with Proper/Repack markers | "Proper BluRay-1080p" |
| `{Resolution}` | Resolution only, no source | "1080p" |
| `{Source}` | Source only, no resolution | "BluRay" |
| `{Group}` | Release group | "YIFY" |
| `{Edition}` | Edition tag | "Director's Cut" |
| `{Codec}` | Video codec | "x264" |
| `{AudioCodec}` | Audio codec | "DTS" |
| `{Audio}` | Audio channels | "5.1" |
| `{HDR}` | HDR format | "HDR10" |

#### TV Show Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `{Series Title}` | Show title | "Breaking Bad" |
| `{Season:00}` | Season number (2 digits) | "01" |
| `{Episode:00}` | Episode number (2 digits) | "05" |
| `{Episode Title}` | Episode title | "Pilot" |
| `{Absolute:000}` | Absolute episode number | "001" |
| `{Air Date}` | Original air date | "2008-01-20" |
| `{Series Year}` | Series start year | "2008" |

## Configuring Naming Patterns

### Access naming settings

1. Go to **Settings > Library > Naming**
2. Configure patterns for Movies and TV separately

### Movie folder pattern

Controls how movie folders are named:

**Default Pattern:**
```
{Movie Title} ({Release Year})
```

**Examples:**
- "The Matrix (1999)"
- "Inception (2010)"
- "Parasite (2019)"

**Custom Patterns:**

```
# Include IMDb ID for easy matching
{Movie Title} ({Release Year}) [{IMDb Id}]
→ The Matrix (1999) [tt0133093]

# Resolution in folder name
{Movie Title} ({Release Year}) [{Resolution}]
→ The Matrix (1999) [1080p]

# Source + resolution in folder name
{Movie Title} ({Release Year}) [{Quality}]
→ The Matrix (1999) [BluRay-1080p]

# First letter organization (A, B, C...)
{Movie Title:First}/{Movie Title} ({Release Year})
→ T/The Matrix (1999)
```

### Movie file pattern

Controls how movie files are renamed:

**Default Pattern:**
```
{Movie Title} ({Release Year}) - {Quality} - {Group}
```

**Examples:**
- "The Matrix (1999) - BluRay-1080p - YIFY.mkv"
- "Inception (2010) - BluRay-2160p - SPARKS.mkv"

**Custom Patterns:**

```
# Include edition info
{Movie Title} ({Release Year}) - {Edition} - {Quality}
→ The Matrix (1999) - Director's Cut - BluRay-1080p.mkv

# Group and codec
{Movie Title} ({Release Year}) [{Resolution}][{Codec}]-{Group}
→ The Matrix (1999) [1080p][x264]-YIFY.mkv

# Minimal naming
{Movie Title} ({Release Year})
→ The Matrix (1999).mkv

# Maximum info
{Movie Title} ({Release Year}) - {QualityFull} [{Codec} {AudioCodec} {Audio}] [{Group}]
→ The Matrix (1999) - BluRay-1080p [x264 DTS 5.1] [YIFY].mkv
```

### TV show folder pattern

Controls series and season folder naming:

**Series Folder Pattern:**
```
{Series Title} ({Series Year})
```

**Season Folder Pattern:**
```
Season {Season:00}
```

**Combined Structure:**
```
Breaking Bad (2008)/
  Season 01/
    Breaking Bad - S01E01 - Pilot.mkv
    Breaking Bad - S01E02 - Cat's in the Bag.mkv
```

**Custom Patterns:**

```
# Alternative season naming
Season {Season}          → Season 1
S{Season:00}             → S01
{Season:00}x##           → 01x##

# Year-based seasons (series start year, not per-episode air year)
{Series Title}/Season {Season:00} ({Series Year})
→ Breaking Bad/Season 01 (2008)

# Resolution in season folder
{Series Title}/Season {Season:00} [{Resolution}]
→ Breaking Bad/Season 01 [1080p]
```

:::note[No year-only format spec on Air Date]
`{Air Date}` always renders the full `YYYY-MM-DD` value - there's no `{Air Date:YYYY}` format spec to extract just the year. Use `{Series Year}` for the series' start year instead.
:::

### Episode file pattern

Controls how episode files are named:

**Default Pattern:**
```
{Series Title} - S{Season:00}E{Episode:00} - {Episode Title}
```

**Examples:**
- "Breaking Bad - S01E01 - Pilot.mkv"
- "Breaking Bad - S01E02 - Cat's in the Bag.mkv"

**Custom Patterns:**

```
# Dot notation
# Write the pattern normally with spaces, then set "Replace Spaces With" to
# "." under Settings > Library > Naming (Advanced) - it rewrites every space
# in the final rendered name, not just the ones inside token braces.
{Series Title} S{Season:00}E{Episode:00} {Episode Title}
→ (with Replace Spaces With = ".") Breaking.Bad.S01E01.Pilot.mkv

# Include quality
{Series Title} - S{Season:00}E{Episode:00} - {Episode Title} [{Quality}]
→ Breaking Bad - S01E01 - Pilot [WEB-DL-1080p].mkv

# Absolute numbering (for anime)
{Series Title} - {Absolute:000} - {Episode Title}
→ Attack on Titan - 001 - To You, in 2000 Years.mkv

# Minimal
S{Season:00}E{Episode:00}
→ S01E01.mkv

# Date-based
{Series Title} - {Air Date} - {Episode Title}
→ The Daily Show - 2024-01-15 - Guest Name.mkv
```

## Advanced Naming Techniques

### Conditional tokens

Wrap a token together with its literal prefix/suffix text in an extra pair of braces: `{prefix{Token}suffix}`. If the token renders empty, the entire wrapped block - including the literal text - is dropped instead of leaving stray punctuation behind.

```
{Movie Title} ({Release Year}){ - {Edition}}
→ The Matrix (1999) - Director's Cut
→ Inception (2010)  [no edition, so the " - " is dropped too, not just the empty value]
```

This also works for brackets around an optional token, e.g. `{[{HDR}]}` only renders `[HDR10]` when HDR info is present.

### Multi-Episode files

There's no separate "end episode" token. A single `{Episode:00}` already expands to cover every episode in a multi-episode file, formatted according to the **Multi-Episode Style** setting (Settings > Library > Naming > Advanced): Extend (`S01E01E02E03`), Duplicate (`S01E01-E02-E03`), Repeat (`S01E01 - S01E02`), Scene (`S01E01E02`, no padding on the extras), or Range (`S01E01-E03`, the default).

```
{Series Title} - S{Season:00}E{Episode:00} - {Episode Title}
→ (default Range style, 2-episode file) Show - S01E01-E02 - Special Two-Parter.mkv
→ (Extend style, 3-episode file) Show - S01E01E02E03 - Three Episode Arc.mkv
```

### Specials and extras

Season 0 (special) episodes use the same season folder pattern as any other season by default (e.g. "Season 00"). Enable **Use Specials Folder** under Settings > Library > Naming (Advanced) - off by default - to route season 0 into a folder literally named "Specials" instead:

```
{Series Title} - S{Season:00}E{Episode:00} - {Episode Title}
→ (with Use Specials Folder on) Breaking Bad/Specials/Breaking Bad - S00E01 - Minisodes.mkv
→ (with it off, the default) Breaking Bad/Season 00/Breaking Bad - S00E01 - Minisodes.mkv
```

There's no naming-token mechanism for organizing bonus/extras content (behind-the-scenes, deleted scenes, etc.) into its own folder, and no custom-format-score naming token - custom format scores affect quality selection and upgrade behavior, not file/folder names.

## Folder Structure Examples

### Standard movie structure

```
/movies/
  Avatar (2009)/
    Avatar (2009) - 2160p BluRay.mkv
    Avatar (2009) - 2160p BluRay.en.srt
    poster.jpg
    fanart.jpg
  
  The Godfather (1972)/
    The Godfather (1972) - 1080p BluRay.mkv
    The Godfather (1972) - 1080p BluRay.en.srt
    The Godfather (1972) - 1080p BluRay.fr.srt
```

### By quality structure

```
/movies/
  2160p/
    Avatar (2009)/
      Avatar (2009) - 2160p.mkv
  1080p/
    The Godfather (1972)/
      The Godfather (1972) - 1080p.mkv
  720p/
    Old.Movie (1990)/
      Old.Movie (1990) - 720p.mkv
```

### By first letter structure

```
/movies/
  A/
    Avatar (2009)/
    Avengers Endgame (2019)/
  B/
    Back to the Future (1985)/
    Blade Runner (1982)/
  C/
    Casablanca (1942)/
```

### Standard TV structure

```
/tv/
  Breaking Bad (2008)/
    Season 01/
      Breaking Bad - S01E01 - Pilot.mkv
      Breaking Bad - S01E02 - Cat's in the Bag.mkv
      Breaking Bad - S01E03 - ...And the Bag's in the River.mkv
    Season 02/
      Breaking Bad - S02E01 - Seven Thirty-Seven.mkv
    Specials/
      Breaking Bad - S00E01 - Minisodes.mkv
    poster.jpg
    fanart.jpg
```

### Anime structure

```
/anime/
  Attack on Titan (2013)/
    Season 01/
      Attack on Titan - 001 - To You, in 2000 Years.mkv
      Attack on Titan - 002 - That Day.mkv
    Season 02/
      Attack on Titan - 026 - Beast Titan.mkv
```

## Applying Naming Patterns

### To new downloads

Naming applies automatically to new downloads:

1. Configure patterns in Settings
2. Download content via search
3. Cinephage organizes files automatically
4. Names follow your patterns

### To existing files

Rename existing library:

1. Go to **Library** (Movies or TV)
2. Select items to rename
3. Click **Organize** or **Rename**
4. Preview changes
5. Confirm rename

**Bulk Rename:**

1. Select multiple items
2. Click **Organize Selected**
3. Preview all changes
4. Confirm batch rename

:::warning[Rename Carefully]
Renaming affects file paths. If you have:
- Hardlinks from torrent clients (may break seeding)
- Media server libraries (may need rescan)
- Scripts referencing file paths

Preview changes before applying!
:::

## Troubleshooting Organization

### Files not renaming

**Check Pattern Syntax:**

- Ensure all `{` have matching `}`
- Tokens are case-sensitive
- Invalid tokens are ignored

**Check Permissions:**

```bash
# Verify write permissions
ls -la /path/to/media

# Fix permissions
chmod -R u+w /path/to/media
```

**Check Disk Space:**

- Renaming requires temporary space
- Ensure destination has room

### Wrong folder structure

**Review Root Folders:**

Ensure Root Folders are configured:
```
**Settings > Library > Root Folders**
```

**Check Path Separators:**

```
# Correct (uses /)
{Movie Title}/{Movie Title} ({Release Year})

# Incorrect (uses \ on non-Windows)
{Movie Title}\{Movie Title} ({Release Year})
```

### Special characters

Cinephage sanitizes filenames automatically:

| Character | Replacement | Example |
|-----------|-------------|---------|
| `/` `\` `*` `?` `"` `<` `>` `\|` | Removed (no replacement) | "A/B Testing" → "AB Testing" |
| `:` | Configurable (see below) | "Movie: Subtitle" → "Movie - Subtitle" (default) |

Colon handling has its own setting, **Colon Replacement** (Settings &gt; Library &gt; Naming, Advanced), with five modes:

| Mode | Behavior | "Movie: Subtitle" becomes |
|------|----------|---------------------------|
| **Smart** (default) | `": "` → `" - "`, `" :"` → `" -"`, any other standalone `:` is removed | "Movie - Subtitle" |
| **Delete** | Every colon removed | "Movie Subtitle" |
| **Dash** | Every colon → `-` | "Movie- Subtitle" |
| **Space Dash** | Every colon → `" -"` | "Movie - Subtitle" |
| **Space Dash Space** | Every colon → `" - "` | "Movie - Subtitle" |

## Best Practices

### For movies

1. **Include year** - Prevents confusion between remakes
2. **Keep it simple** - Don't over-complicate patterns
3. **Quality optional** - Can be in filename or folder
4. **Group optional** - Useful for some, clutter for others

### For TV shows

1. **S00E00 format** - Most compatible with all players
2. **Include episode titles** - Makes browsing easier
3. **Separate specials** - Use S00 for special episodes
4. **Consistent season folders** - Season 01, not Season 1

### General tips

1. **Test patterns first** - Use preview before applying
2. **Document your pattern** - Keep a note of your settings
3. **Backup before bulk rename** - Protect against mistakes
4. **Consider your players** - Ensure patterns work with your media server
5. **Stay consistent** - Don't change patterns frequently

## Common Naming Patterns

### Movie pattern example

```
{Movie Title} ({Release Year}) - {QualityFull}
```

### TV show pattern example

```
{Series Title} - S{Season:00}E{Episode:00} - {Episode Title} [{QualityFull}]
```

## See Also

- [Naming Tokens Reference](/reference/yaml/naming-tokens) - Complete token list
- [Import Existing Files](import-existing-files) - Import with your new patterns
- [Settings Explained](/reference/configuration/settings-explained) - All configuration options
- [Understanding the Interface](/getting-started/understanding-interface) - Browse your organized library
