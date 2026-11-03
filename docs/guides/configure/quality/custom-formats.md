---
title: Custom Formats
description: Create personalized scoring rules that go beyond built-in quality profiles
sidebar_position: 2
tags: [custom-formats, scoring, configuration, guide]
keywords: [Custom Formats, scoring, conditions, rules]
---

# Custom formats

Custom Formats allow you to create personalized scoring rules that go beyond the built-in quality profiles. Define exactly what you want in a release and Cinephage will prioritize it.

---

## What Are Custom Formats?

Think of them as "search filters with scores":

- **Conditions** - Match specific text patterns in release names
- **Score** - Add or subtract points when conditions match
- **Priority** - Higher scores = preferred releases

---

## Creating a Custom Format

Navigate to **Settings > Library > Quality Settings** and select the **Custom Formats** tab:

### 1. Basic information

- **Name** - Descriptive name (e.g., "x265 Preferred", "No HDR")
- **Description** - Optional explanation

### 2. Add conditions

Click **Add Condition** and choose a type:

#### Condition Types

| Type                  | Matches                        | Example                                   |
| --------------------- | ------------------------------- | ----------------------------------------- |
| **Release Title**     | Full release name              | `Movie.Name.2023.1080p.BluRay.x264-Group` |
| **Resolution**        | Video resolution                | 720p, 1080p, 2160p                        |
| **Source**             | Release source                  | BluRay, WEB-DL, HDTV                      |
| **Codec**              | Video codec                     | x264, x265, AV1                           |
| **Audio Codec**        | Audio codec                     | DTS, AAC, TrueHD                          |
| **Audio Channels**     | Audio channel layout            | 5.1, 7.1, 2.0                             |
| **Audio Atmos**        | Whether the release has Atmos   | Yes/No                                    |
| **HDR**                | HDR format                      | HDR10, Dolby Vision                       |
| **Release Group**      | Encoder group                   | SPARKS, RARBG, YIFY                       |
| **Streaming Service**  | Source streaming platform       | Netflix, AMZN, DSNP                       |
| **Indexer**            | Which indexer the release came from | NZBGeek, 1337x                        |
| **Language**           | Audio/subtitle language         | English, Japanese                         |
| **Flag**                | Release flags (e.g. PROPER, REPACK, internal) | PROPER                      |

There's no file-size custom format condition - minimum/maximum file size is a separate setting on the quality profile itself, not a custom format rule.

### 3. Set match logic

- **Must Contain** - All conditions must match
- **Must Not Contain** - Release is rejected if matches
- **Should Contain** - Optional, adds score if matches

### 4. Assign score

- **Positive score** - Prefer these releases
- **Negative score** - Avoid these releases
- **Reject** - Block entirely (score: -10000)

---

## Example Custom Formats

### Prefer x265/hevc

```
Name: x265 Preferred
Conditions:
  - Codec: x265 (score: +100)
  - Codec: HEVC (score: +100)
  - Codec: x264 (score: -50)
```

### Block low-quality groups

```
Name: Block Cam Releases
Conditions:
  - Release Title contains: CAM (reject: true)
  - Release Title contains: TS (reject: true)
  - Release Title contains: HDCAM (reject: true)
```

### Prefer specific group

```
Name: SPARKS Preferred
Conditions:
  - Release Group: SPARKS (score: +200)
```

### Size limits

```
Name: Reasonable Size
Conditions:
  - Size: 500MB - 8GB (score: +50)
  - Size: >15GB (score: -100)
```

---

## Using Custom Formats

### Assign to quality profile

1. Go to **Settings > Library > Quality Settings** (the **Profiles** tab)
2. Edit a profile
3. Under "Custom Formats", enable your formats
4. Set minimum score if needed

### Score calculation

Total Score = Base Profile Score + Sum of Custom Format Scores

Example:

- Base (Balanced profile): +500
- x265 Preferred matches: +100
- SPARKS Preferred matches: +200
- **Total: +800**

### Minimum score

Set a minimum score to reject low-quality releases:

- **0** - Accept anything
- **500** - Only decent quality
- **1000** - High quality only

---

## Condition Matching

### Text matching

- **Contains** - Substring match (case-insensitive)
- **Equals** - Exact match
- **Regex** - Regular expression (advanced)

### Multiple values

Add multiple values to a condition:

```
Codec: x265, HEVC, H.265
→ Matches any of these
```

### Negation

Use "Must Not Contain" for exclusions:

```
Must Not Contain:
  - Release Title: 3D
  - Release Title: HC (hardcoded subs)
```

---

## Best Practices

### Start simple

Don't create 50 Custom Formats at once. Start with 2-3 important ones:

1. Prefer your favorite codec (x265)
2. Block unwanted formats (3D, CAM)
3. Prefer trusted groups

### Test your formats

Use the **Test** button to see if a format matches a release name:

```
Test String: Movie.Name.2024.1080p.BluRay.x265-Group
Format: x265 Preferred
Result: MATCH (+100 points)
```

### Avoid over-scoring

Don't make any single format worth 1000+ points:

- **Good**: x265 (+100), SPARKS (+200), HDR (+50)
- **Bad**: x265 (+5000) - overwhelms everything else

### Use rejection sparingly

Only reject truly unwanted content:

- **Reject**: CAM, TS, hardcoded subs in wrong language
- **Don't reject**: Just because you slightly prefer BluRay over WEB-DL

---

## Advanced: Regex Conditions

For complex matching, use regular expressions:

### Match multiple groups

```
Release Group matches regex: (SPARKS|RARBG|YIFY)
```

### Match season packs

```
Release Title matches regex: S\d{2}\.(?!E\d{2})
→ Matches S01. but not S01E01
```

### Match specific bitrates

```
Release Title matches regex: \d{3,4}kbps
→ Matches 1500kbps, 8000kbps, etc.
```

---

## Troubleshooting

### Format not matching

1. **Check case sensitivity** - Matching is case-insensitive by default
2. **Verify condition type** - "Release Title" vs "Release Group"
3. **Test with exact name** - Copy/paste from indexer results

### Wrong releases being grabbed

1. **Check score calculation** - Higher score wins
2. **Verify minimum score** - May be too low
3. **Review format order** - Earlier formats apply first

### Too many rejections

1. **Reduce reject conditions** - Only block truly unwanted
2. **Check "Must Contain"** - All must match, not any
3. **Use "Should Contain"** - For optional preferences

---

## See Also

- [Quality Profiles](./quality-profiles) - Built-in Quality Profiles
- [Search & Download](../../use/search-and-download) - How releases are selected
- [Delay Profiles](./delay-profiles) - Control when releases are grabbed
