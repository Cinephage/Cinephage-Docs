---
title: Delay Profiles
description: Configure download delays to prefer higher quality releases over time
sidebar_position: 3
tags: [delay, profiles, configuration, guide, quality]
keywords: [delay profiles, quality, usenet, torrent]
---

# Delay profiles

Delay Profiles prevent Cinephage from grabbing low-quality releases immediately after they appear. Instead, releases wait in a queue and are only grabbed if nothing better appears within the delay period.

---

## Why Use Delays?

### The problem

A new episode airs:

- **T+0 minutes**: HDTV capture appears (low quality)
- **T+30 minutes**: WEB-DL appears (better quality)
- **T+2 hours**: BluRay appears (best quality)

Without delays, Cinephage grabs the HDTV immediately. With delays, it waits to see if something better appears.

### The solution

Delay profiles let you:

- **Wait for better quality** - WEB-DL instead of HDTV
- **Prefer usenet** - Wait for usenet releases instead of torrents
- **Avoid fakes** - Let the community verify releases first
- **Get proper releases** - PROPER/REPACK fixes often appear within hours

---

## How Delay Profiles Work

### The pending queue

When a monitored item is found:

1. **Release appears** - Quality meets cutoff
2. **Added to pending** - Not grabbed yet
3. **Timer starts** - Delay period begins
4. **Better release?** - If yes, replace in queue
5. **Timer expires** - Grab best release in queue

### Quality upgrades during delay

If a better quality release appears during the delay:

- **Replaces** the pending release
- **Timer resets** (optional)
- **Only if score is higher** - Not just different

---

## Creating a Delay Profile

Navigate to **Settings > Library > Quality Settings** and select the **Delay Profiles** tab:

### Fields

| Setting | Description | Example |
| ------- | ------------ | ------- |
| **Name** | Profile name | "Wait for WEB-DL" |
| **Enabled** | Whether this profile is active | On |
| **Torrent delay (minutes)** | How long to wait before grabbing a torrent release | 720 (12 hours) |
| **Usenet delay (minutes)** | How long to wait before grabbing a usenet release | 0 |
| **Preferred protocol (grabs immediately)** | None, Torrent, or Usenet - a release on the preferred protocol skips its delay and grabs right away | Usenet |
| **Bypass delay for 4K (2160p) releases** | Skip the delay entirely when a 2160p release is found | Off |
| **Bypass delay if score exceeds** | Skip the delay once a release's custom-format score passes this threshold (leave empty to disable) | 2000 |

Setting Torrent delay to 12 hours and Usenet delay to 0, with Usenet as the preferred protocol, waits for scene torrent releases but grabs usenet immediately.

---

## Bypass Conditions

Delay profiles support two built-in bypass conditions, either of which lets a release skip the wait entirely:

- **4K bypass** - Toggle "Bypass delay for 4K (2160p) releases" so a 2160p release grabs immediately instead of waiting
- **Score bypass** - Set "Bypass delay if score exceeds" to a threshold; once a release's calculated score passes it, the delay is skipped

There is no separate tag-based bypass mechanism - bypass behavior is controlled per delay profile via these two settings, plus the "Preferred protocol" field which always grabs immediately for the chosen protocol.

---

## Example Profiles

### Conservative (recommended)

```
Name: Conservative
Torrent Delay: 24 hours
Usenet Delay: 0 hours
Bypass: Highest quality only

Result: Waits for scene releases, grabs usenet immediately
```

### Aggressive

```
Name: Aggressive
Torrent Delay: 2 hours
Usenet Delay: 0 hours
Bypass: Score >= 1500

Result: Quick grabs, but only if high quality
```

### Usenet only

```
Name: Usenet Preferred
Torrent Delay: 72 hours
Usenet Delay: 0 hours
Bypass: Never

Result: Only grabs torrents if usenet fails for 3 days
```

---

## Assigning Delay Profiles

### Global default

Set a default profile in **Settings > Library > Quality Settings** (**Delay Profiles** tab):

- Applies to all new monitored items
- Can be overridden per-item

### Per-Movie/Series

Override the default for specific content:

1. Go to movie/series details
2. Click **Edit**
3. Select delay profile
4. Save

### Use cases for overrides

- **Daytime TV** - Use aggressive (low quality expected)
- **Premium Shows** - Use conservative (wait for best)
- **Old Movies** - No delay (quality won't improve)

---

## The Pending Releases Queue

Releases waiting out a delay are tracked internally and processed automatically by the scheduled "pending release" task once the delay period elapses - there is currently no dedicated settings page for manually listing, grabbing, or removing individual pending releases.

---

## How Delays Interact with Other Features

### Quality profiles

Delay + Quality work together:

1. Quality profile determines "acceptable" releases
2. Delay profile determines "when to grab"
3. Only releases meeting quality cutoff enter pending queue

### Custom formats

Custom format scores affect delay bypass:

- High score releases may bypass delay
- Score is calculated before delay is applied

### Monitoring

Monitoring tasks respect delays:

- Missing content search → Adds to pending
- Upgrade monitoring → Replaces pending if better
- Cutoff unmet → Ignores delay (grabs immediately)

---

## Troubleshooting

### Releases not being grabbed

1. **Check pending queue** - May be waiting in delay
2. **Verify delay profile assigned** - Default vs per-item
3. **Check bypass conditions** - May not be met

### Delay too long

1. **Reduce delay hours** - Start with 6-12 hours
2. **Add bypass conditions** - Score threshold, highest quality, or preferred protocol

### Delay being ignored

1. **Check cutoff unmet** - Ignores delays
2. **Check manual search** - Manual grabs bypass delay
3. **Check bypass conditions** - 4K bypass, score bypass, or preferred protocol may have triggered

### Conflicting profiles

If multiple profiles apply:

- **Per-item overrides global** - a movie/series-level delay profile assignment wins over the global default

---

## Best Practices

### Start conservative

Begin with longer delays, then reduce:

- **Week 1**: 24 hour delay
- **Week 2**: 12 hour delay
- **Week 3**: 6 hour delay

Find the sweet spot for your indexers.

### Match delay to content

| Content Type    | Suggested Delay |
| --------------- | --------------- |
| New TV episodes | 6-12 hours      |
| Movies (new)    | 12-24 hours     |
| Movies (old)    | 0-2 hours       |
| Anime           | 2-6 hours       |

### Monitor your indexers

Different indexers have different release patterns:

- **Scene trackers** - Releases appear at predictable times
- **Public indexers** - More variable, shorter delays okay
- **Usenet** - Usually faster, can use 0 delay

---

## See Also

- [Quality Profiles](./quality-profiles) - How quality scoring works
- [Custom Formats](./custom-formats) - Advanced scoring rules
- [Blocklist](./blocklist) - Managing failed releases
