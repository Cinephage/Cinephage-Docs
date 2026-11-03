---
title: Configure Subtitles
description: Set up subtitle providers, language profiles, and automatic downloads
sidebar_position: 2
tags: [subtitles, languages, providers, configuration, guide]
keywords: [subtitles, languages, providers, sync, configuration]
---

# Configure subtitles

This guide walks you through configuring Cinephage's subtitle management system with 12 supported providers and automatic downloading.

## Goal

Enable automatic subtitle downloads for your media library in multiple languages.

## Prerequisites

- Cinephage installed and running
- Media files in your library
- (Optional) Accounts with subtitle providers

## Understanding Subtitle Management

Cinephage provides comprehensive subtitle support:

- **12 subtitle providers** - Multiple sources for best coverage
- **Language profiles** - Multi-language preferences with embedded subtitle support
- **Auto-download** - Automatic search on import
- **Monitoring tasks** - Automatic searches for missing subtitles and upgrades
- **Subtitle sync** - Built-in synchronization
- **Score-based selection** - Best match by hash and filename
- **Embedded subtitle recognition** - Counts embedded subtitles as satisfying language requirements

### Supported subtitle providers

| Provider          | Type         | Access Type   | Notes                       |
| ----------------- | ------------ | ------------- | --------------------------- |
| OpenSubtitles.com | Free/Premium | API Key       | Largest database, hash matching |
| OpenSubtitles.org | Free         | API Key       | Legacy API                  |
| Addic7ed          | Free         | Free Account  | TV-focused                  |
| SubDL             | Free         | Free          | Fast API, daily quota       |
| YIFYSubtitles     | Free         | Free          | Movie-focused               |
| Gestdown          | Free         | Free          | TV subtitles                |
| Subf2m            | Free         | Free          | Multi-language              |
| NapiProjekt       | Free         | Free          | Polish-focused              |
| LegendasDivx      | Free         | Free Account  | Portuguese-focused          |
| BetaSeries        | Free         | API Key       | French TV shows            |
| Assrt             | Free         | API Key       | Chinese, Asian languages    |
| Podnapisi         | Free         | Free          | Slovenian and general       |

:::note
Subscene is not supported.
:::

## Part 1: Enable Subtitle Providers

### Step 1: access subtitle settings

1. Go to **Settings > Integrations > Subtitle Providers**
2. See list of available providers
3. Toggle providers to enable them

### Step 2: configure opensubtitles

OpenSubtitles is recommended as a primary provider:

**Free Account:**

1. Create free account at [opensubtitles.com](https://www.opensubtitles.com)
2. In Cinephage, click **Configure** on OpenSubtitles
3. Enter your username and password
4. Click **Save**

**VIP/Premium Account (Optional):**

- VIP accounts have higher download limits
- Enter VIP credentials for priority access

### Step 3: enable additional providers

Enable providers based on your language needs:

**For English:**

- OpenSubtitles.com
- SubDL
- YIFYSubtitles

**For European Languages:**

- Addic7ed (TV shows)
- NapiProjekt (Polish)

**For Asian Languages:**

- Assrt (Chinese, Japanese, Korean)

**For TV Shows:**

- Addic7ed
- Gestdown
- BetaSeries

**For Movies:**

- YIFYSubtitles
- OpenSubtitles.com

Enable at least 3-5 providers for good coverage.

### Step 4: set provider priority

Providers are searched in priority order (1 = highest):

1. Click **Edit** on a provider
2. Set **Priority** (1-10 recommended for primary, 11-20 for backup)
3. Click **Save**

**Recommended Priority Order:**

1. OpenSubtitles.com (Priority 1)
2. Addic7ed (Priority 2)
3. SubDL (Priority 3)
4. Subf2m (Priority 4)
5. Gestdown (Priority 5)
6. Others (Priority 6-10)

## Part 2: Configure Subtitle Requirements on a Language Profile

Subtitle wants are part of the same language profile that controls audio language preferences - see [Language Profiles](language-preferences) for creating a profile, assigning it as the instance/library default, and overriding it per item. This section covers the subtitle-specific fields each language gets within a profile.

### Step 1: access language profiles

Go to **Settings > Library > Media Languages** and open a profile for editing.

### Step 2: add a subtitle requirement

For each language you add to a profile's subtitle list, set two fields in addition to the language itself:

- **Variant** - `Regular`, `Forced`, or `Both (regular + forced)`. A forced subtitle only covers foreign-language dialogue/on-screen text in an otherwise-native-language file; regular covers the whole thing.
- **Accessibility** - `Any` (no preference), `Prefer HI` (rank hearing-impaired subtitles higher but accept either), `Require HI`, or `Exclude HI`.

**Example - English, forced-only plus full Spanish:**

```
1. English
   - Variant: Forced
   - Accessibility: Any

2. Spanish
   - Variant: Both (regular + forced)
   - Accessibility: Prefer HI
```

A subtitle only satisfies a requirement if its language, variant, and accessibility all match - the matcher is exact on variant/accessibility and base-or-region-exact on language (a bare `en` requirement accepts `en-US`/`en-GB`, but a `pt-BR` requirement only accepts `pt-BR`, not a bare `pt`).

## Part 2.5: Embedded Subtitle Recognition

Cinephage recognizes embedded subtitles within video containers (MKV, MP4, etc.) and counts them as satisfying your language profile requirements. This prevents unnecessary downloads of external subtitle files when your media already has the needed languages.

### How it works

When media is imported:

1. **Scan Video Container** - Checks for subtitle tracks in MKV, MP4, and other containers
2. **Language Detection** - Identifies language codes of embedded tracks
3. **Profile Matching** - Compares against your language profile requirements
4. **Requirement Satisfaction** - Marks languages as "present" if embedded subtitle found

### Benefits

- **Reduces Downloads** - No external subtitles needed for content with embedded tracks
- **Faster Import** - Skips unnecessary subtitle searches
- **Saves Bandwidth** - Less API calls to subtitle providers
- **Cleaner Library** - Fewer external files to manage

### Supported containers

- **MKV** (Matroska) - Full support for all subtitle tracks
- **MP4** - Supports mov_text and other embedded formats
- **AVI** - Limited support via IDX/SUB

### Configuration

Embedded subtitle recognition is automatic and requires no configuration. It works alongside your existing language profiles - embedded subtitles count as satisfying "Required" languages, just like downloaded external subtitles.

## Part 3: Configure Download Behavior

### Automatic download on import

Subtitle search on import isn't a separate scheduled task - it's controlled by the **wants subtitles** setting on the library (default for new items, under **Settings > Library > Libraries**) and can be overridden per movie/series by editing that item and toggling whether subtitles are wanted.

### Missing subtitles monitoring

The **Missing Subtitles** task automatically searches for subtitles on media missing required languages:

1. In **Settings > Monitoring > Tasks**
2. Find **Missing Subtitles** task
3. Enable it
4. Set interval (default: every 6 hours)
5. Click **Save**

This task respects your language profiles and only searches for missing required languages.

### Subtitle upgrades

The **Subtitle Upgrade** task searches for better-scoring subtitles when your profile allows upgrades:

1. In **Settings > Monitoring > Tasks**
2. Find **Subtitle Upgrade** task
3. Enable it
4. Set interval (default: daily)
5. Click **Save**

This task only runs when the profile's **Allow Upgrades** toggle is on - it's a single profile-wide setting, not per-language.

### Task activity history

All subtitle tasks record detailed activity history:

1. Go to **Settings > Monitoring > Tasks**
2. Click **View History** on any subtitle task
3. See per-item activity including:
   - Items searched
   - Subtitles found and downloaded
   - Skipped items (already have subtitles)
   - Failed searches

History is automatically cleaned up after 30 days.

## Part 4: Apply Language Profile to Media

### Apply to movies

1. Go to **Library > Movies**
2. Select movies (or all)
3. Click **Edit**
4. Under **Language Profile**, select your profile
5. Click **Save**

### Apply to TV shows

1. Go to **Library > TV**
2. Select series (or all)
3. Click **Edit**
4. Under **Language Profile**, select your profile
5. Click **Save**

### Set default for new items

1. Go to **Settings > Integrations > Language Profiles**
2. Under the default settings section
3. Select **Default Language Profile**
4. This applies to all newly added content
5. Click **Save**

## Part 5: Manual Subtitle Operations

### Search for subtitles manually

1. Go to a movie or episode detail page
2. Click **Subtitles** tab
3. Click **Search**
4. Select desired language
5. Cinephage searches all enabled providers
6. Choose from results and click **Download**

### Upload subtitles

If you have subtitle files:

1. Go to media detail page
2. Click **Subtitles** tab
3. Click **Upload**
4. Select subtitle file (.srt, .ass, .vtt)
5. Select language
6. Click **Upload**

### Sync subtitles

If subtitles are out of sync:

1. Go to media detail page
2. Click **Subtitles** tab
3. Find the subtitle file
4. Click **Sync**
5. Cinephage uses native sync engine to synchronize
6. Review and confirm the sync

## Part 7: Subtitle Sync Engine

Cinephage includes a **native subtitle synchronization engine** inspired by the alass (Automatic Language-Agnostic Subtitle Synchronization) algorithm. This replaces external binary dependencies with a fully integrated TypeScript solution.

### How it works

The sync engine uses Voice Activity Detection (VAD) to align subtitles:

1. **Audio Extraction** - Extracts audio from the video file using ffmpeg
2. **Speech Detection** - Identifies speech segments via energy-based VAD
3. **Alignment** - Matches subtitle timing to speech segments
4. **Correction** - Applies timing adjustments to subtitle file

### Sync options

| Option          | Description                                           | Default |
| --------------- | ----------------------------------------------------- | ------- |
| **Split Penalty** | Higher values = fewer timing splits (0-30)          | 7       |
| **Offset Only**  | Use constant offset mode (faster, less precise)     | No      |

**Split Penalty Guide:**
- **Low (1-5)**: More aggressive timing corrections, may over-correct
- **Medium (7)**: Balanced approach, recommended for most content
- **High (15-30)**: Conservative corrections, fewer timing changes

### Bulk sync

For TV shows with multiple episodes:

1. Go to series detail page
2. Click **Subtitles** tab
3. Click **Sync All** or **Sync Unsynced**
4. Select sync options
5. Monitor progress in real-time
6. Review results per episode

### Supported formats

- **Input**: SRT, ASS, VTT, SSA
- **Output**: Same as input format

### Memory optimization

The sync engine streams audio data instead of loading entire files:
- Peak memory: ~5MB (vs ~500MB for a 2-hour movie)
- Safe for low-memory systems

## Part 8: Adaptive Subtitle Search

Adaptive searching reduces API quota waste by scaling back search frequency for media that consistently has no subtitle results.

### How it works

The system tracks failed subtitle searches:

1. **First Search**: Always performed, timestamp recorded
2. **Failed Search**: Counter incremented
3. **Within 21 Days**: Always search (aggressive period)
4. **After 21 Days**: Only search if 7+ days since last attempt (extended period)
5. **Success**: All counters reset

### Timeline

```
Day 0:  First search → No results → Counter = 1
Day 1:  Search → No results → Counter = 2
Day 7:  Search → No results → Counter = 3
Day 14: Search → No results → Counter = 4
Day 21: Search → No results → Counter = 5 (window ends)
Day 28: Search skipped (only 7 days since Day 21)
Day 35: Search → No results → Counter = 6
Day 42: Search skipped
...
```

### Resetting counters

When a subtitle is found:
- `failedSubtitleAttempts` → 0
- `firstSubtitleSearchAt` → null
- `lastSearchTime` → current time

The media returns to aggressive searching immediately.

## Part 9: Provider Throttling

The throttling system prevents excessive API calls when providers return errors.

### Error types and durations

| Error Type            | Throttle Duration | Description                          |
| --------------------- | ----------------- | ------------------------------------ |
| TooManyRequests       | 1 hour            | HTTP 429 rate limiting               |
| DownloadLimitExceeded | 3 hours           | Daily/hourly quota exhausted         |
| ServiceUnavailable    | 20 minutes        | HTTP 503 server error                |
| APIThrottled          | 10 minutes        | Provider-specific throttling         |
| ParseResponseError    | 6 hours           | Malformed API response               |
| IPAddressBlocked      | 24 hours          | IP address blacklisted               |
| AuthenticationError   | 12 hours          | Invalid credentials                  |
| ConfigurationError    | 12 hours          | Missing API key or settings          |
| SearchLimitReached    | 3 hours           | Search quota exhausted               |
| TimeoutError          | 1 hour            | Request timeout                      |
| ConnectionError       | 1 hour            | Network connectivity issues          |

### Sliding window for transient errors

For temporary issues (rate limits, timeouts, server errors):
- Provider is only throttled after **5 errors within 2 minutes**
- This prevents throttling from occasional one-off failures

### Provider-Specific overrides

Some providers have custom throttle durations:

| Provider        | Error                 | Custom Duration |
| --------------- | --------------------- | --------------- |
| OpenSubtitles   | TooManyRequests       | 1 minute        |
| OpenSubtitles   | APIThrottled          | 15 seconds      |
| Addic7ed        | IPAddressBlocked      | 1 hour          |
| SubDL           | DownloadLimitExceeded | Until midnight UTC |

### Viewing throttle status

1. Go to **Settings > Integrations > Subtitle Providers**
2. Check the **Status** column
3. Throttled providers show remaining time
4. Healthy providers show green status

## Part 6: Understanding Subtitle Scoring

Cinephage scores subtitle matches to select the best option:

### Scoring factors

**Hash Match (Highest Priority):**

- Exact file hash match = Best quality
- Guaranteed sync
- Highest score

**Filename Match:**

- Subtitle filename matches media file = Good
- Release group match = Better
- High score

**Metadata Match:**

- Title match
- Year match
- Episode match (for TV)
- Medium score

**Uploader Reputation:**

- Trusted uploaders
- User ratings
- Slight score boost

### Score thresholds

- **90-100**: Perfect or near-perfect match
- **70-89**: Good match, likely in sync
- **50-69**: Acceptable match
- **Below 50**: Poor match, may need manual sync

## Troubleshooting

### No subtitles found

**Problem:** Search returns no results

**Solutions:**

- Enable more subtitle providers
- Check language profile settings
- Verify file name is clear (not obfuscated)
- Try manual search with different language

### Subtitles out of sync

**Problem:** Subtitles do not match timing

**Solutions:**

- Use **Sync** feature in Cinephage
- Try different subtitle file
- Search for subtitles from same release group
- Manually adjust with external tool

### Wrong language downloaded

**Problem:** Subtitle is wrong language

**Solutions:**

- Check language profile is correct
- Verify subtitle metadata
- Report to provider if mislabeled
- Block specific subtitle in blacklist

### Download limits reached

**Problem:** "Download limit exceeded" errors

**Solutions:**

- Wait for limit reset (usually daily)
- Upgrade to VIP on OpenSubtitles
- Enable more providers to distribute load
- Reduce search frequency

### Subtitle file not detected

**Problem:** Downloaded subtitle not showing

**Solutions:**

- Check subtitle format (.srt, .ass, .vtt supported)
- Verify file permissions
- Ensure subtitle is in same folder as media
- Check file encoding (UTF-8 recommended)

### Subtitle path issues (TV shows)

**Problem:** TV episode subtitles not being found or associated correctly

**Cause:** Subtitle paths may have been stored incorrectly due to path resolution issues during import.

**Solution:** Use the TV Subtitle Path Fix script:

```bash
# Navigate to Cinephage directory
cd /path/to/cinephage

# Dry run (preview what would be fixed)
DRY_RUN=true node scripts/fix-tv-subtitle-paths.js

# Actually fix the paths
node scripts/fix-tv-subtitle-paths.js

# For Docker
docker exec cinephage node scripts/fix-tv-subtitle-paths.js
```

**What the script does:**
1. Scans all TV episode subtitles in the database
2. Compares stored paths against correct paths based on episode file locations
3. Moves misplaced subtitle files to their correct locations
4. Updates database paths accordingly

**Environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `DRY_RUN` | `true` | Preview changes without making them |
| `CINEPHAGE_DB_PATH` | auto | Path to SQLite database |
| `DATA_DIR` | auto | Alternative database location |
| `MISSING_SAMPLE_LIMIT` | `5` | Number of missing file samples to log |

## Best Practices

### Use multiple providers

Enable 3-5 providers minimum:

- Better coverage across languages
- Redundancy if one is down
- More options for rare content

### Set clear language priorities

- Define required vs optional languages
- Set cutoff to avoid endless searching
- Use upgrade wisely for better matches

### Regular maintenance

- Review subtitle settings periodically
- Remove unused providers
- Update language profiles as needs change
- Check for subtitle sync issues

### Storage considerations

Subtitles are small files:

- ~50-200KB per subtitle file
- Minimal impact on storage
- Store alongside media files for portability

## Next Steps

Now that subtitles are configured:

- [Search and Download](../../use/search-and-download) media with subtitle support
- [Set Up Live TV](../streaming/live-tv) for Live TV with subtitles
- [Configure NZB Streaming](../streaming/nzb-streaming) for streaming with subtitle support

## See Also

- [Supported Languages](/reference/configuration/supported-languages) - Language configuration reference
- [Troubleshooting](../../deploy/troubleshooting) - Common issues
- [Quality Profiles](../quality/quality-profiles) - Quality settings
