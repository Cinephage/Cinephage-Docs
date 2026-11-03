---
title: Set Up Quality Profiles
description: Configure quality scoring, Custom Formats, and upgrade behavior
sidebar_position: 1
tags: [quality-profiles, custom-formats, scoring, configuration, guide]
keywords: [quality profiles, scoring, Custom Formats, upgrades]
---

# Set up quality profiles

This guide explains Cinephage's quality system and how to configure quality profiles and Custom Formats for intelligent release selection.

## Goal

Configure how Cinephage scores and selects releases, including upgrade behavior and custom format rules.

## Prerequisites

- Cinephage installed and running
- Basic understanding of video formats (resolution, codecs, sources)

## Understanding Quality in Cinephage

Cinephage uses a **scoring-based** quality system rather than simple quality levels. Each release is scored on resolution, source, codec, HDR format, audio, and release group reputation, and the points added together decide whether it's grabbed and whether a later release is worth upgrading to.

### Scoring factors

There is no single fixed point table shared by every profile - each built-in profile (Quality, Balanced, Compact, Streamer) assigns its own values to the same factors, reflecting different priorities (for example, Balanced and Streamer weight efficient codecs like x265/AV1 more heavily relative to resolution than the Quality profile does). See [Quality Scoring Explained](/explanation/quality-scoring) for the full breakdown of factors and how per-profile scores differ.

## Part 1: Understanding Built-in Profiles

Cinephage includes four default quality profiles:

### Quality profile

**Goal:** Maximum quality regardless of size

**Behavior:**

- Remux, lossless audio, and HDR scored heavily; no compromise
- Very high upgrade-until score, so it keeps searching for a better release aggressively
- No resolution or source restrictions beyond always-excluded junk sources (cam, telesync, telecine, screener)

**Best for:** Users with unlimited storage and high-bandwidth displays

### Balanced profile

**Goal:** High quality with efficient encoding

**Behavior:**

- Favors x265/AV1 and well-regarded release groups over raw resolution
- Moderate upgrade-until score - stops chasing upgrades well before the Quality profile would
- No resolution or source restrictions beyond the always-excluded junk sources

**Best for:** Most users with average storage and bandwidth

### Compact profile

**Goal:** Small files with decent quality

**Behavior:**

- Favors micro-encoders and efficient codecs over resolution
- Minimum resolution of 480p; lowest upgrade-until score of the built-in profiles, so it settles quickly
- Can accept a release with a negative score (allows some lower-quality trade-offs the other profiles would reject)

**Best for:** Limited storage or bandwidth

### Streamer profile

**Goal:** Streaming-only via `.strm` files

**Behavior:**

- Creates `.strm` placeholder files instead of downloading - the client streams from the source (e.g. a debrid or Usenet mount) on playback, so nothing is transferred to local storage
- Only considers releases on the `streaming` protocol; the usual junk-source bans (cam, telesync, telecine, screener, etc.) still apply

**Best for:** Users who want library entries without consuming local storage

## Part 2: Configure Default Profiles

### Step 1: set the default profile

Cinephage uses a single default quality profile for both movies and TV - there's no separate movie/TV default.

1. Go to **Settings > Library > Quality Settings** (**Profiles** tab)
2. On the profile you want as default, click **Set as default** (star icon)

Newly added libraries and items use the default profile unless overridden per-library or per-item.

### Step 2: override per library

Each library (under **Settings > Library > Libraries**) can be assigned its own Quality Profile, independent of the global default - useful if, say, your anime library should use a different profile than your main movie library.

1. Go to **Settings > Library > Libraries**
2. Edit the library
3. Change **Quality Profile** to the desired profile
4. Click **Save**

### Step 3: apply to existing items

To apply a profile change to existing library items:

1. Go to **Library > Movies** (or TV)
2. Select items to update (or select all)
3. Click **Edit** button
4. Change **Quality Profile** to desired profile
5. Click **Save**

## Part 3: Understanding Upgrade Behavior

Cinephage doesn't use a quality-tier cutoff (like "stop at 1080p BluRay") - a profile's upgrade behavior is controlled by three score-based fields, all editable in the profile editor's **Thresholds** section:

| Field | Meaning |
|-------|---------|
| **Minimum Score** | The lowest total score a release must reach before Cinephage will grab it at all |
| **Upgrade-Until Score** | Once a grabbed release's score reaches this value, Cinephage stops searching for something better |
| **Minimum Score Increment** | How much higher a new release's score must be than what you already have before it counts as a worthwhile upgrade (prevents churning on marginal score differences) |

**Example with the Balanced profile** (`upgradeUntilScore: 30000`, `minScoreIncrement: 20`):

1. First download: a release scoring 8,000
2. A release scoring 8,015 appears - skipped, since the 15-point gain is below the 20-point minimum increment
3. A release scoring 8,050 appears - grabbed as an upgrade, since the 50-point gain clears the increment
4. Once something scores 30,000 or higher, Cinephage stops searching for further upgrades on that title

To configure these fields:

1. Go to **Settings > Library > Quality Settings** (**Profiles** tab)
2. Click **Edit** on a profile
3. Under **Score Thresholds**, set **Minimum Score** and **Minimum Score Increment**
4. Click **Save**

### Required and size-limited releases

Beyond score thresholds, a profile can also:

- Mark specific Custom Formats as **Required** (AND/OR groups - "all of these must match" or "at least one of these must match"), under the profile's **Format configuration** section
- Set **minimum/maximum file size** separately for movies and episodes, under **Size Limits** - this is a profile-level setting, not a Custom Format condition

### Prevent resolution downgrades

When enabled, **Prevent Resolution Downgrades** stops Cinephage from replacing an existing file with one at a lower resolution, even if the lower-resolution release scores higher overall due to custom format bonuses.

:::tip[Enabled by default]
All built-in profiles and newly created custom profiles have this option enabled by default.
:::

**Example:**

- You have a 1080p file
- A 720p release appears with a high custom format score
- With prevent downgrades **on** - the 720p release is skipped
- With prevent downgrades **off** - the 720p release could replace your 1080p file

To configure:

1. Go to **Settings > Library > Quality Settings** (**Profiles** tab)
2. Click **Edit** on a profile
3. Toggle **Prevent Resolution Downgrades**
4. Click **Save**

## Part 4: Custom Formats

Custom Formats are created and tested separately from quality profiles - see [Custom Formats](custom-formats) for creating conditions, scoring, and testing a format against a release name.

Once created, apply a Custom Format to a profile from the profile editor's **Format configuration** section:

1. Go to **Settings > Library > Quality Settings** (**Profiles** tab)
2. Click **Edit** on a profile, then open the **Formats** tab
3. Assign a score to each format you want this profile to weigh, or add it to **Required Formats** (AND/OR) if it must match
4. Click **Save**

## Troubleshooting

### Upgrades not happening

**Problem:** Better releases available but not upgrading

**Solutions:**

- Check the upgrade-until score hasn't already been reached
- Verify monitoring is enabled
- Check upgrade monitoring task is running
- Ensure better release has higher score

### Wrong quality downloaded

**Problem:** Lower quality downloaded when better available

**Solutions:**

- Check indexer priority
- Verify custom format scores
- Check if better release was filtered out
- Review blocklist for the better release

### Custom format not matching

**Problem:** Format should match but does not

**Solutions:**

- Test format with actual release name
- Check for case sensitivity
- Verify condition logic (AND vs OR)
- Use regex for complex patterns

### Releases being blocked

**Problem:** Releases you want are being rejected

**Solutions:**

- Check Custom Formats with negative scores
- Review quality profile minimums
- Check blocklist for entries
- Verify indexer categories

### Release rejected due to unknown size

**Problem:** A release is rejected with "Release size unknown; cannot verify against configured size limits"

**Cause:** Your quality profile has minimum or maximum file size limits configured, but the indexer did not report a file size for this release. Cinephage rejects it rather than downloading blindly.

**Solutions:**

- If the release is trustworthy, temporarily remove the size limits from your profile, grab it manually, then restore the limits
- Use an indexer that reports file sizes in search results
- Remove size limits from the profile if you no longer need them

### Same item downloaded multiple times

**Problem:** Cinephage keeps re-grabbing the same media after a failed download

**Cause:** A 1-hour cooldown is applied to failed downloads, so re-grab attempts are held off for 60 minutes. If downloads are still looping after an hour, check the Activity log for the specific failure reason - it is usually a download client misconfiguration or a bad release.

## Best Practices

### Start simple

Begin with built-in profiles:

- Use them as-is for initial setup
- Modify gradually as you learn the system

### Document your rules

Keep notes on what each custom format does:

- Name formats descriptively
- Add comments if supported
- Document why scores are set certain ways

### Test before applying

Always test Custom Formats:

- Use real release names
- Check score calculations
- Verify logic works as expected

### Monitor performance

Watch how your profiles perform:

- Check what qualities are being downloaded
- Review upgrade patterns
- Adjust scores based on results

## Next Steps

Now that quality profiles are configured:

- [Configure Subtitles](../languages/subtitles) for multi-language support
- [Search and Download](../../use/search-and-download) using your profiles
- [Monitor and Upgrade](../../use/monitor-and-upgrade) to manage quality improvements

## See Also

- [Quality Scoring Explained](/explanation/quality-scoring) - How quality scoring works
- [Custom Formats](custom-formats) - Creating and testing Custom Format conditions
- [Search and Download](../../use/search-and-download) - Find and download content
- [Environment Variables](/reference/configuration/environment-variables) - Configuration reference
