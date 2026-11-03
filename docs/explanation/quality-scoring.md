---
title: Quality Scoring
description: How Cinephage calculates quality scores for release selection
sidebar_position: 3
tags: [quality, scoring, algorithms, explanation]
keywords: [quality, scoring, algorithms, release selection]
---

# Quality scoring

This document explains how Cinephage calculates quality scores to select the best releases for your library.

## Overview

Unlike simple "highest resolution wins" systems, Cinephage scores releases against a library of built-in Custom Formats (well over 250 of them, covering resolution, source, codec, audio, HDR, release groups, streaming services, editions, and banned patterns), plus any formats you define yourself. Each **quality profile** decides how many points each format is worth - there is no single global formula shared by every profile. This approach provides better results than a fixed formula by accounting for:

- Resolution (but not resolution alone)
- Source quality (Remux vs BluRay vs WEB-DL vs HDTV)
- Codec efficiency (AV1 vs H.265 vs H.264)
- Audio quality (Atmos vs DTS-HD MA vs AAC)
- HDR formats (Dolby Vision vs HDR10 vs SDR)
- Release group reputation (tiered, not just "known good/bad")
- Editions/enhancements (IMAX, Director's Cut, Remastered, etc.)
- Your personal preferences (custom formats you create)

## Scoring Formula

Cinephage parses each release name into attributes (resolution, source, codec, audio, HDR, release group, streaming service, edition, and flags like remux/repack/proper), then matches those attributes against every active custom format (built-in plus your own enabled ones). The release's total score is the sum of the points the **active quality profile** assigns to every format that matched:

```
Total Score = sum of the profile's score for each matched format
```

There is no fixed "base + bonus" formula shared by every profile - the built-in **Quality**, **Balanced**, **Compact**, and **Streamer** profiles each assign different point values to the same formats, reflecting different priorities. For example, the Quality profile values Remux sources and lossless audio heavily, while Balanced and Streamer weight efficient encodes like x265/AV1 more relative to resolution.

A release that doesn't match a format in some category simply contributes 0 for that category (an unrecognized resolution or source isn't penalized by default - it's just not rewarded). Two mechanisms adjust the sum beyond straight addition:

- **HDR is mutually exclusive** - if a release matches multiple HDR formats (some releases advertise both Dolby Vision and an HDR10+ fallback layer), only the single highest-priority match counts; HDR bonuses don't stack.
- **Bans are absolute** - a small set of formats (deceptive retagging, CAM/telesync/telecine/screener sources, fake HDR, sample/extras files, and similar) carry an extreme negative score. Matching any of them marks the release as banned outright, and it's excluded from selection regardless of how well it scores elsewhere.

Profiles can also reject releases outright before scoring even matters: a minimum/maximum file size (per movie or per TV episode), an allowed/excluded source list, and an allowed protocol list (torrent/usenet/streaming) can all filter out a release independent of its point total.

## Resolution scoring

Resolution is itself a custom format category - every profile assigns it a score, but the number differs per profile. For example, the built-in **Quality** profile scores resolution as:

| Resolution | Quality profile score | Notes |
| --- | --- | --- |
| 2160p (4K) | 300 | Highest |
| 1080p | 200 | Standard HD |
| 720p | 100 | Reduced detail |
| 480p | 50 | Standard definition |
| Unrecognized | 0 | No resolution detected |

**Why Not Resolution Alone?**

Because source, audio, HDR, and other attributes are scored independently and can add up to more than the resolution gap between two releases, a lower-resolution release from a better source can outscore a higher-resolution release from a worse source under some profiles - selection isn't purely resolution-driven.

## Source scoring

The original source affects quality dramatically. Using the built-in **Quality** profile's point values as an example:

| Source | Quality profile score | Description |
| --- | --- | --- |
| Remux | 250 | Untranscoded disc remux, highest fidelity |
| BluRay | 200 | Physical disc rip/encode |
| WEB-DL | 180 | Direct streaming service rip |
| WEBRip | 150 | Captured/re-encoded stream |
| HDTV | 100 | Captured from broadcast |
| DVD | 50 | Standard definition disc |
| CAM / Telesync / Telecine / Screener | Banned | Theater/pre-release recordings |

CAM, telesync, telecine, and screener releases aren't just penalized with a large negative score - they're matched by a dedicated banned custom format, and most profiles also exclude those sources outright via an allowed/excluded source list. Either mechanism removes them from consideration rather than merely scoring them very low.

### Source detection

Cinephage detects sources from release names:

```
Movie.2023.1080p.BluRay.REMUX-FraMeSToR  → Remux
Movie.2023.1080p.BluRay.x264-SPARKS      → BluRay
Movie.2023.1080p.WEB-DL.DDP5.1-NTb       → WEB-DL
Movie.2023.1080p.HDTV.x264-LOL           → HDTV
Movie.2023.HDTS.x264-EVO                 → Telesync (banned)
```

## Codec scoring

Modern codecs provide better quality at smaller sizes. Example scores from the built-in **Quality** profile:

| Codec | Quality profile score | Notes |
| --- | --- | --- |
| AV1 | 50 | Latest codec, best efficiency |
| H.265/HEVC | 30 | Good compression, widely supported |
| H.264/x264 | 10 | Baseline |

Profiles that favor efficient encodes (like Balanced or Streamer) typically weight x265/AV1 more heavily relative to resolution than the Quality profile does. Built-in profiles also penalize wasteful combinations, such as an x264 encode at 2160p, since an older codec at that resolution uses far more space without a quality benefit over an efficient encode.

### Codec detection

```
Movie.2023.1080p.BluRay.AV1-GRP        → AV1
Movie.2023.1080p.BluRay.x265-SPARKS    → H.265
Movie.2023.1080p.BluRay.x264-EVO       → H.264
```

## Audio scoring

Audio quality significantly impacts the viewing experience. Example scores from the built-in **Quality** profile, which values lossless audio highly:

| Audio Format | Quality profile score | Description |
| --- | --- | --- |
| TrueHD / DTS:X | 150 | Lossless / object-based |
| DTS-HD MA / PCM | 140 | Lossless surround |
| FLAC | 130 | Lossless |
| Dolby Atmos | 120 | Object-based (carried on TrueHD or DD+) |
| DD+ (E-AC3) | 100 | Dolby Digital Plus |
| DTS-HD HRA | 100 | High-quality lossy |
| Opus | 80 | Efficient lossy |
| DTS | 70 | Standard DTS |
| Dolby Digital (AC3) | 60 | Standard |
| AAC | 40 | Efficient lossy |
| MP3 | 20 | Basic audio |

### Audio detection

```
Movie.2023.2160p.BluRay.Atmos.TrueHD7.1 → TrueHD (Atmos also detected as a flag)
Movie.2023.1080p.BluRay.DTS-HD.MA.5.1   → DTS-HD MA
Movie.2023.1080p.BluRay.DD5.1-SPARKS    → Dolby Digital
Movie.2023.1080p.WEB-DL.AAC2.0-NTb      → AAC
```

## HDR scoring

High Dynamic Range provides better color and contrast. Example scores from the built-in **Quality** profile:

| HDR Format | Quality profile score | Description |
| --- | --- | --- |
| Dolby Vision | 100 | Best HDR, dynamic metadata |
| HDR10+ | 90 | Dynamic metadata, open standard |
| HDR10 | 80 | Static metadata, widely supported |
| Generic HDR | 60 | HDR flag detected without a specific format |
| HLG | 50 | Broadcast HDR |
| PQ | 40 | PQ transfer function tag |
| SDR | 0 | Standard dynamic range |

**HDR is mutually exclusive:** when a release name matches more than one HDR format (for example, a release tagged with both Dolby Vision and an HDR10+ fallback layer), only the single highest-priority match is scored - the points don't stack.

### HDR detection

```
Movie.2023.2160p.BluRay.DV.HDR10+.x265  → Dolby Vision only (HDR10+ suppressed by mutual exclusivity)
Movie.2023.2160p.BluRay.HDR10.x265      → HDR10
Movie.2023.1080p.BluRay.x264            → SDR
```

## Release group scoring

Release groups are scored as a "release group tier" category with well over a hundred built-in group formats, loosely organized by reputation - premier remux groups, top encode groups, quality 4K/WEB-DL groups, efficient/micro encoders, and known low-quality groups. Each built-in profile assigns its own points per group according to that profile's priorities. The Quality profile, for instance, scores premier remux groups highest and penalizes micro-encoder groups that shrink files at the cost of quality, while a size-conscious profile might score some of those same micro-encoder groups positively instead.

**Why Groups Matter:**

- Consistent quality
- Proper encoding settings
- Reliable sources
- No fake or mislabeled releases

:::note
The built-in group tiers are a starting point, not a fixed ranking - you can add your own release-group custom formats, and any group not covered by a built-in format simply contributes 0.
:::

## Custom Format Scoring

Custom formats let you define your own preferences beyond the built-in ones. Each custom format is a set of conditions - matching on resolution, source, codec, audio codec/channels, an Atmos flag, HDR format, streaming service, release title/group text (regex), a flag (remux/repack/proper/3D), or originating indexer - combined with required (AND) and optional (OR) logic, and an optional negate toggle per condition. Formats are created and managed through **Settings > Library > Quality Settings (Custom Formats tab)** in the UI; they aren't written as YAML (that syntax is specific to indexer definitions, a separate part of the system - see [Search System](search-system)).

Each custom format you enable is scored per-profile just like the built-in ones: you assign it a point value (positive or negative) inside each quality profile where you want it to apply.

**Examples of what a custom format can express:**

- Boost releases whose title matches `x265` or `HEVC`
- Heavily penalize (or ban) releases matching `3D` or `HSBS` in the title
- Score based on source alone, ignoring resolution (a format with only a source condition)
- Score based on resolution alone, ignoring source (a format with only a resolution condition)
- Boost specific trusted release groups by name
- Reject releases below a certain file size for a given resolution

### Required formats

A profile can also require that a release match certain custom formats before it's eligible at all - for example, requiring at least one format from a set (OR) or requiring several specific formats simultaneously (AND) - independent of the point total.

### Pack preference (TV)

For TV, Cinephage can favor season/series packs over individual episodes when searching for multiple missing episodes at once. This is a separate scoring input from custom formats: complete-series packs get the largest bonus, multi-season packs (2+ seasons) get a smaller bonus, and single-season packs get a smaller bonus still - configurable per profile, with a minimum percentage of "wanted" episodes a pack must cover to qualify.

## Complete Scoring Examples

These examples use the built-in **Quality** profile's point values to illustrate how matched formats add up. A different profile would produce different totals for the same release, since each profile assigns its own scores.

### Example 1: high-quality remux

**Release:** `Inception.2010.2160p.UHD.BluRay.REMUX.DV.HDR10+.TrueHD.7.1.Atmos-FraMeSToR`

**Score Breakdown (Quality profile):**

```
Resolution (2160p):     300
Source (Remux):        +250
Codec (n/a, remux):       0
Audio (TrueHD/Atmos):   +150
HDR (Dolby Vision):     +100  (HDR10+ suppressed by mutual exclusivity)
Group (premier remux):  +100
─────────────────────────────
Total:                  ~900
```

**Result:** Excellent quality, will be selected if available.

### Example 2: balanced quality encode

**Release:** `Movie.2023.1080p.BluRay.DTS-HD.MA.5.1.x264-EVO`

**Score Breakdown (Quality profile):**

```
Resolution (1080p):     200
Source (BluRay):       +200
Codec (x264):            +10
Audio (DTS-HD MA):      +140
HDR (none):                0
Group (EVO, low tier):   -50
─────────────────────────────
Total:                  ~500
```

**Result:** Good quality; the exact total and ranking against other candidates depends on the profile and other matched formats (editions, streaming service, etc.) not shown here.

### Example 3: low quality (banned)

**Release:** `Movie.2023.HDTS.x264-Unknown`

**Score Breakdown:**

```
Source (Telesync):  BANNED
```

**Result:** Matches a banned format - excluded from selection entirely regardless of any other points, and not just heavily penalized.

### Example 4: custom format impact

**Release:** `Movie.2023.1080p.WEB-DL.x265.DD5.1-NTb`

**Base Score (Quality profile, built-in formats only):**

```
Resolution (1080p):     200
Source (WEB-DL):        +180
Codec (x265):            +30
Audio (Dolby Digital):   +60
Group (NTb):             +40
─────────────────────────────
Subtotal:                ~510
```

**With a custom format added** (e.g. a "Trusted Uploader" format worth +25 in this profile that also matches `NTb`):

```
Subtotal:                ~510
Custom ("Trusted Uploader"): +25
─────────────────────────────
Total:                    ~535
```

## Scoring in Practice

### Search process

1. **Query Indexers** - Search all enabled indexers
2. **Parse Results** - Extract attributes from release names
3. **Calculate Scores** - Match against active custom formats and sum the active profile's points
4. **Filter Results** - Remove banned, size-rejected, protocol-rejected, or blocklisted releases
5. **Select Best** - Choose the highest-scoring acceptable release
6. **Send to Download** - Add to download queue

### Upgrade decision

When considering upgrades:

1. **Compare Scores** - New vs existing, under the item's assigned profile
2. **Check Cutoff** - Has the profile's upgrade cutoff been reached?
3. **Verify Monitoring** - Is item monitored?
4. **Apply Delays** - Wait for better releases (if a delay profile applies)?
5. **Queue Upgrade** - Download better version

If a profile has "prevent resolution downgrades" enabled, a candidate at a lower resolution than the existing file is never treated as an upgrade, even if it scores higher overall.

## Profile-Specific Scoring

### Quality profiles

Cinephage ships with four built-in profiles - **Quality**, **Balanced**, **Compact**, and **Streamer** - each assigning its own point values to the same underlying formats, plus its own minimum score, upgrade cutoff score, and (optionally) file size and protocol restrictions. You can also create custom profiles with your own format scores. See [Set Up Quality Profiles](/guides/configure/quality/quality-profiles) for how to configure them.

### Score thresholds

Each profile defines a minimum score a release must reach to be accepted at all, and an upgrade-cutoff score at which Cinephage stops looking for further upgrades. Both are configured per profile, not fixed system-wide values.

## Troubleshooting Scoring

### Why was lower quality selected?

**Possible Reasons:**

1. Higher quality failed custom format rules or a required-format check
2. Higher quality is blocklisted
3. Higher quality indexer is down
4. Delay profile waiting for better releases
5. Cutoff already reached
6. Higher quality was rejected on file size or protocol restrictions

**Debugging:**

- Check search results manually
- Review custom format scores
- Verify indexer status
- Check delay profile settings

### Custom format not applied

**Check:**

1. Format is enabled and assigned a score in the profile
2. Condition logic (required/optional, negate) is correct
3. Release name/attributes actually match the conditions
4. Format is enabled globally

### Unexpected scores

**Verify:**

- Quality profile assigned correctly
- Custom format scores are correct for that profile
- No conflicting or overlapping conditions
- Release attributes were parsed as expected (HDR mutual exclusivity, banned formats, etc. can all change the total)

## Best Practices

### Start with defaults

- Use built-in profiles initially
- Understand scoring before customizing
- Test Custom Formats thoroughly

### Document your rules

- Keep notes on why scores are set
- Name formats descriptively
- Review periodically

### Test with real releases

- Use actual release names
- Verify score calculations
- Check upgrade behavior

### Balance quality and size

- Higher score does not always mean better for your needs
- Consider storage constraints
- Set realistic cutoffs

## See Also

- [Set Up Quality Profiles](/guides/configure/quality/quality-profiles) - Configure quality settings
- [Key Concepts](concepts) - Core terminology
- [Architecture Overview](architecture) - System design
