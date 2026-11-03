---
title: Set Up Live TV
description: Configure Live TV providers, manage channels, and stream Live TV
sidebar_position: 2
tags: [live-tv, streaming, configuration, guide, stalker, xstream, m3u]
keywords: [live tv, stalker, xstream, channels]
---

# Set up live TV

Cinephage includes comprehensive Live TV support with multi-provider integration, supporting its own built-in Cinephage Live channel catalog, Stalker Portals, XStream Codes, and M3U playlists. This guide covers setting up and managing live TV.

## Overview

Cinephage supports live TV through four provider types, each with different features and configuration requirements:

| Provider | Type | Authentication | Best For |
|----------|------|----------------|----------|
| **Cinephage Live** | Built-in catalog | None | Zero-setup free channels and sports/PPV, no account needed |
| **Stalker Portal** | MAG/Ministra | MAC Address | Providers using Stalker/Ministra middleware |
| **XStream Codes** | Live TV API | Username/Password | Providers using XStream Codes panel |
| **M3U Playlist** | Playlist File | None | Generic Live TV playlists |

### Features overview

Regardless of provider type, Cinephage provides:

-  Channel sync from all provider types
- Electronic Program Guide (EPG) support for all three provider types
- Channel lineup organization
- M3U playlist generation for external players
- Category management
- Portal scanning for Stalker account discovery
- Multi-provider mixing (channels from all providers in one lineup)

## Provider Types Explained

### Cinephage Live

Cinephage's own built-in live channel catalog - a 24/7 channel lineup plus sports/PPV events - served from the Cinephage network with no account or credentials to configure.

**How It Works:**
- Adding this provider needs no setup beyond enabling it - there's no account, URL, or credential to enter
- Authenticates using Cinephage's own build identity, not a per-user login
- Playback URLs are short-lived, channel-bound, and signed - they expire and are re-issued automatically

**Key Features:**
- No account/credentials required
- EPG included
- Category support
- No archive/catch-up support (live only)

:::note
Stream playback for this provider depends on Cinephage's hosted live-TV service being reachable; if that service is down, only this provider is affected, not your other configured accounts.
:::

### Stalker portal (mag/ministra)

Stalker (also known as Ministra) is a Live TV middleware system used by many Live TV providers. It's commonly used with MAG set-top boxes.

**How It Works:**
- Provider gives you a portal URL and MAC address
- Cinephage authenticates using the MAC address
- Retrieves channel list, EPG, and account info from portal

**Key Features:**
-  Full EPG support
-  Archive/Catch-up TV
-  Portal scanning for discovery
-  Account expiration tracking
-  Built-in authentication

**Required Information:**
- Portal URL (e.g., `http://portal.example.com/c`)
- MAC Address (format: `00:1A:79:XX:XX:XX`)

### XStream codes

XStream Codes is a popular Live TV panel system used by many providers. Accounts use username/password authentication.

**How It Works:**
- Provider gives you server URL, username, and password
- Cinephage authenticates via XStream API
- Retrieves channel list and account information

**Key Features:**
-  Username/password authentication
-  Account expiration tracking
- EPG support via XMLTV URL
- Archive support

**Required Information:**
- Server URL (e.g., `http://example.com:8080`)
- Username
- Password

### M3U playlist

M3U playlists are standard Live TV playlist files containing channel URLs. Many providers offer M3U URLs for use with generic Live TV players.

**How It Works:**
- Provider gives you an M3U playlist URL or file
- Cinephage parses the playlist for channel information
- No authentication required (URLs often contain tokens)

**Key Features:**
-  Works with any M3U-compatible provider
-  URL or file upload support
-  Optional external EPG via XMLTV URL
-  Auto-refresh support
-  No built-in authentication
-  No archive/catch-up support

**Required Information:**
- M3U URL or file
- Optional: XMLTV EPG URL

## Adding a Live TV Account

### Step 1: navigate to live TV accounts

1. Go to **Live TV > Accounts** in the main navigation
2. Click **Add Account**
3. Select your provider type from the dropdown

### Step 2: configure Stalker portal

If you selected **Stalker Portal**:

1. **Name** - Enter a display name (e.g., "My Live TV Provider")
2. **Portal URL** - Enter the portal URL provided by your Live TV service
   - Format: `http://portal.example.com/c` or `http://portal.example.com:80/c`
   - Must include the `/c` path suffix
3. **MAC Address** - Enter your MAC address
   - Format: `00:1A:79:XX:XX:XX` (colons required)
   - Must be a valid MAG MAC address format
4. **Test Connection** - Click **Test** to verify credentials
5. **Save** - Click **Save** to add the account

:::tip[Testing]
Always test the connection before saving. The test verifies:
- Portal is accessible
- MAC address is valid
- Account is active
:::

### Step 3: configure XStream codes

If you selected **XStream Codes**:

1. **Name** - Enter a display name
2. **Server URL** - Enter the XStream server URL
   - Format: `http://example.com:8080` (include port if not 80)
   - Do not include paths like `/player_api.php`
3. **Username** - Enter your XStream username
4. **Password** - Enter your XStream password
5. **Test Connection** - Click **Test** to verify
6. **Save** - Click **Save** to add the account

### Step 4: configure M3U playlist

If you selected **M3U Playlist**:

1. **Name** - Enter a display name
2. **Source Type** - Choose **URL** or **File Upload**

**For URL:**
- Paste the M3U playlist URL
- Optionally check **Auto-refresh** to update periodically
- Set refresh interval (default: 24 hours)

**For File Upload:**
- Click **Choose File** and select your M3U file
- Files are stored locally and won't auto-update

3. **EPG URL** (Optional) - Add an XMLTV EPG URL for program guide
4. **Test** - Cinephage parses the playlist and counts channels
5. **Save** - Click **Save** to add the playlist

:::caution[M3U Security]
M3U URLs often contain authentication tokens. Treat them as sensitive information and don't share them publicly.
:::

## Discovering Stalker Accounts

If you have a Stalker portal but don't have valid credentials, Cinephage can scan for working MAC addresses.

### How portal scanning works

The scanner tests MAC addresses against a Stalker portal to find valid accounts:

1. Generates or imports MAC addresses
2. Attempts authentication with each
3. Records successful connections
4. Displays discovered accounts with expiration dates
5. Allows you to approve accounts for use

### Starting a scan

1. Ensure you have at least one Stalker account configured (or add portal URL)
2. Go to **Live TV > Accounts**
3. Click **Scan for Accounts**
4. Select scan type:

#### Scan Type: Random

Generates random MAC addresses using known STB manufacturer prefixes:

- **MAC Prefix** - Choose manufacturer prefix (e.g., `00:1A:79`)
- **Number to Test** - How many addresses to generate (10-1000)
- **Parallel Workers** - Concurrent scans (1-10)

#### Scan Type: Sequential

Tests a specific range of MAC addresses:

- **Start MAC** - Starting MAC address
- **End MAC** - Ending MAC address
- **Step Size** - Increment between addresses

#### Scan Type: Import

Tests a list of MAC addresses you provide:

- Paste MAC addresses (one per line)
- Or upload a text file

### During the scan

The scanner shows real-time progress:

- **Tested** - Number of MACs checked
- **Found** - Valid accounts discovered
- **Failed** - Invalid or expired accounts
- **Progress Bar** - Visual progress indicator

:::tip[Scanning Ethics]
Only scan portals you have permission to access. Unauthorized scanning may violate terms of service.
:::

### Reviewing discovered accounts

After scanning completes:

1. Review the list of discovered accounts
2. Check account details:
   - Expiration date
   - Package/subscription info
   - Number of connections allowed
3. Select accounts to approve
4. Click **Approve Selected**

Approved accounts are added to your Live TV accounts and can be used immediately.

## Syncing Channels

After adding an account, you need to sync channels from the provider.

### Manual channel sync

1. Go to **Live TV > Accounts**
2. Find your account in the list
3. Click **Sync Channels** button
4. Wait for sync to complete

**What Gets Synced:**

- Channel names and numbers
- Categories/groups
- Stream URLs
- Channel logos (if available)
- EPG channel IDs
- Archive/catch-up availability (Stalker)

### What happens during sync

1. Cinephage connects to provider
2. Requests channel list
3. Parses and normalizes channel data
4. Downloads channel logos
5. Updates database with channel information
6. Shows sync results (channels added/updated/removed)

:::note[Sync Duration]
Sync time depends on number of channels:
- Small lists (100 channels): ~10-30 seconds
- Medium lists (500 channels): ~1-2 minutes
- Large lists (2000+ channels): ~3-5 minutes
:::

### Auto-Sync

Some providers support automatic channel synchronization:

- **Stalker:** Channels sync when you access Live TV
- **XStream:** Manual sync required
- **M3U:** Auto-refresh if enabled (URL only)

## Managing Channels

### Channel overview

After syncing, view all channels at **Live TV > Channels**:

- Grid view with channel logos
- Category filtering
- Search functionality
- Status indicators (active/inactive)
- Country filter (Cinephage Live only) - channels carry a country code in their metadata, and the browser shows a per-country channel count so you can narrow a large catalog to your region

### Enabling/Disabling channels

Not all channels from your provider may be relevant:

1. Go to **Live TV > Channels**
2. Find the channel to disable
3. Toggle the **Active** switch off
4. Channel is hidden from lineup

**To Re-enable:**

1. Show disabled channels using the filter
2. Toggle **Active** switch on

### Channel categories

Cinephage automatically imports categories from your provider. You can also create custom categories:

#### Viewing Categories

1. Go to **Live TV > Categories**
2. See all imported categories
3. Shows channel count per category

#### Creating Custom Categories

1. Click **Add Category**
2. Enter category name
3. Select color/icon (optional)
4. Assign channels from any provider
5. Click **Save**

**Use Cases for Custom Categories:**
- **Favorites** - Your most-watched channels
- **Sports** - Combine sports channels from all providers
- **News** - International news channels
- **Kids** - Family-friendly channels

## Channel Lineups

Lineups determine which channels appear in your M3U playlist and Live TV interface.

### Understanding lineups

A lineup is a curated list of active channels:

- Can include channels from multiple providers
- Defines channel order
- Controls which channels appear in exported playlists
- Multiple lineups for different purposes

### Creating a lineup

1. Go to **Live TV > Lineups**
2. Click **Create Lineup**
3. Enter lineup name (e.g., "Main", "Sports", "Family")
4. Select channels:
   - Click to add individual channels
   - Use filters to bulk-select by category
   - Search to find specific channels
5. Arrange order:
   - Drag and drop to reorder
   - Use auto-sort by category or name
6. Click **Save**

### Default lineup

Set a default lineup that appears first:

1. Go to **Live TV > Lineups**
2. Click the star icon next to your preferred lineup
3. This lineup loads by default in the Live TV player

### Multiple lineups strategy

Create different lineups for different use cases:

| Lineup | Purpose | Channels |
|--------|---------|----------|
| **All Channels** | Complete provider list | Everything |
| **Sports Only** | Sports viewing | Sports categories |
| **News** | News monitoring | News channels |
| **Family** | Kid-friendly viewing | Family-safe channels |
| **International** | Specific languages | Language-specific |

## Electronic Program Guide (EPG)

EPG provides TV schedule information for your channels.

### EPG sources by provider

| Provider | EPG Support | Source |
|----------|-------------|--------|
| **Cinephage Live** | Full | Included, synced automatically |
| **Stalker** | Full | Retrieved from portal automatically |
| **XStream** | Supported | Via XMLTV URL |
| **M3U** | Optional | Requires external XMLTV URL |

### Configuring EPG

#### For Cinephage Live and Stalker Portals

EPG is automatic - no setup required:

1. The account's EPG data syncs on its own schedule
2. Sync channels to fetch EPG mappings
3. EPG updates automatically on the sync schedule below

#### EPG sync settings

Go to **Live TV > Guide** to see sync status per account (last sync time, next sync time, and any sync error) and adjust the schedule:

- **Sync Interval** - How often to refresh EPG data, 1-168 hours (default: 6 hours)
- **Retention** - How long to keep past/future program data before pruning, 24-720 hours (default: 48 hours)

Changes apply immediately, without a restart. If a provider's EPG fetch fails (e.g. every scheduled day fails to load for Cinephage Live, or the Stalker/M3U source errors), the account records the error and shows as failed in the status panel instead of silently serving a stale or empty guide.

#### For M3U Playlists

Add external EPG:

1. When creating/editing M3U account, add EPG URL
2. EPG should be in XMLTV format (.xml or .xmltv)
3. Cinephage fetches and parses EPG data
4. Maps channels using tvg-id attributes

:::tip[Finding EPG URLs]
Many Live TV providers offer XMLTV EPG URLs. Common sources:
- Provider-specific EPG (check your account panel)
- iptv-org/epg GitHub repository
- Third-party EPG services
:::

### Viewing EPG

1. Go to **Live TV > Guide** or **Live TV > Channels**
2. Channels show current and upcoming programs
3. Click a channel for detailed schedule
4. Navigate by time (now, next 24 hours, etc.)

### EPG features

- **Current Program** - What's playing now
- **Up Next** - Next 3-4 programs
- **Full Schedule** - Complete day view
- **Program Details** - Description, ratings, categories

## M3U Playlist Export

Cinephage generates M3U playlists for use with external players.

### Accessing your playlist

The M3U playlist is available at:

```
http://your-cinephage-url/api/livetv/playlist.m3u
```

**Examples:**

```
http://localhost:3000/api/livetv/playlist.m3u
```

### Playlist contents

The generated M3U includes:

- All active channels from your selected lineup
- Stream URLs (resolved from any provider type)
- Channel names and numbers
- EPG mapping (if configured)
- Category tags (group-title)
- Channel logos

### Using with external apps

Point any M3U-compatible player to the playlist URL:

#### VLC

1. Media > Open Network Stream
2. Paste playlist URL
3. Click Play

#### Live TV Apps (iOS/Android)

1. Add playlist by URL
2. Enter Cinephage playlist URL
3. Add EPG URL if desired

#### Smart TVs

1. Install Live TV app (Smart IPTV, IPTV Smarters, etc.)
2. Configure with playlist URL
3. Enter EPG source

#### Kodi

1. Install PVR IPTV Simple Client
2. Set M3U playlist URL
3. Set XMLTV URL for EPG
4. Enable client

#### Jellyfin/Emby/Plex

1. Add M3U tuner
2. Enter Cinephage playlist URL
3. Configure guide data

### Playlist updates

The playlist updates automatically when:

- Channels are synced
- Lineup is modified
- Channels enabled/disabled

External players should refresh playlists periodically.

## Stream Playback

### Direct playback in Cinephage

1. Go to **Live TV > Channels**
2. Click any channel
3. Stream plays in the built-in player

**Player Features:**

- Full-screen mode
- Channel up/down
- Volume control
- Quality selection (if multiple streams)

### Playback via media server

Import the M3U playlist into your media server:

1. Get playlist URL from Cinephage
2. Add as Live TV source in Jellyfin/Emby/Plex
3. Configure EPG for program guide
4. Watch through your media server's interface

### Failover support

If you have multiple providers with the same channels:

1. Cinephage detects duplicate channels
2. Creates failover chains automatically
3. If primary stream fails, tries backup sources
4. Seamless failover in M3U playlist

## Troubleshooting

### Account test fails

**Stalker Portal:**

1. **Check Portal URL** - Must include `/c` suffix
2. **Verify MAC Format** - Must be `00:1A:79:XX:XX:XX` with colons
3. **Test Portal Access** - Try opening portal URL in browser
4. **Check Account Status** - Ensure account is active with provider
5. **Firewall/Network** - Verify Cinephage can reach portal

**XStream Codes:**

1. **Verify URL Format** - Should be `http://server:port` without paths
2. **Check Credentials** - Username/password are case-sensitive
3. **Account Status** - Verify account is active
4. **Port Access** - Ensure port is not blocked by firewall

**M3U Playlist:**

1. **URL Accessibility** - Try opening M3U URL in browser
2. **File Format** - Verify file is valid M3U/M3U8 format
3. **Authentication** - Some M3U URLs expire; get fresh URL from provider
4. **File Upload** - If uploading, ensure file isn't corrupted

### Channels not loading

**After Sync:**

1. **Check Sync Results** - Review how many channels were found
2. **Verify Account Active** - Ensure subscription hasn't expired
3. **Re-sync Channels** - Try syncing again
4. **Check Logs** - Look for specific errors in Cinephage logs

**Specific Channels:**

1. **Channel Status** - Verify channel is enabled in lineup
2. **Stream URL Valid** - Some channels may have dead streams
3. **Geographic Restrictions** - Some streams may be geo-blocked

### EPG not showing

**Stalker Portals:**

1. **Re-sync Channels** - EPG comes from portal during sync
2. **Check EPG Settings** - Verify refresh interval is configured
3. **Portal EPG** - Some portals have limited or no EPG data
4. **Wait for Update** - EPG may take time to populate

**M3U with External EPG:**

1. **Verify EPG URL** - Ensure URL is accessible and returns XMLTV
2. **Check tvg-id** - Channel IDs in M3U must match EPG
3. **Format Compatibility** - Ensure XMLTV format is valid
4. **Manual Refresh** - Trigger EPG refresh in settings

### Streams not playing

**Buffering/Stuttering:**

1. **Check Bandwidth** - Live TV streams need stable connection
2. **Try Different Channel** - May be provider-side issue
3. **Check Stream Format** - Some players don't support all formats
4. **Use External Player** - Try VLC or dedicated Live TV app

**"Stream Unavailable":**

1. **Provider Issue** - Channel may be offline temporarily
2. **Account Limit** - May have exceeded concurrent connections
3. **Expired Account** - Check subscription status
4. **Try Failover** - If available, try backup stream

### Portal scanner not finding accounts

1. **Verify Portal URL** - Must be valid Stalker portal
2. **Check MAC Range** - Try different MAC prefixes
3. **Rate Limiting** - Portal may block rapid requests
4. **Portal Security** - Some portals have anti-scanning measures
5. **Increase Timeout** - Some portals respond slowly

## Migration Notes

### From stalker-only mode

If you previously used Stalker-only mode:

-  All existing Stalker accounts are preserved
-  Channel lineups remain intact
-  You can now add XStream and M3U accounts
-  Channel lineups can mix channels from all provider types
-  EPG settings migrate automatically

### Updating from older versions

When updating Cinephage:

1. Restart Cinephage after update
2. Re-sync Live TV accounts to get latest features
3. Review lineup configuration for new options
4. Check EPG settings for new configuration options

## Best Practices

### Account management

- **Test Before Adding** - Always test account credentials
- **Use Descriptive Names** - Name accounts by provider/purpose
- **Monitor Expiration** - Keep track of subscription dates
- **Regular Syncs** - Sync channels weekly to catch changes

### Lineup organization

- **Create Purpose-Specific Lineups** - Different lineups for different uses
- **Disable Unused Channels** - Improves performance and clarity
- **Use Categories** - Organize channels logically
- **Set Default Lineup** - Choose most-used lineup as default

### Performance

- **Limit Active Channels** - Too many active channels slows EPG loading
- **Schedule Syncs** - Sync during low-usage hours
- **Cache EPG** - Don't refresh EPG too frequently
- **Use Appropriate Quality** - Some providers offer multiple quality streams

## Limitations

### By provider type

**Stalker:**

- Portal API versions may vary
- Stream URL formats vary by portal
- Some portals limit concurrent connections

**XStream:**

- EPG not yet implemented
- Archive/catch-up not fully tested
- API variations between XStream versions

**M3U:**

- No built-in EPG (requires external source)
- No authentication management
- No automatic failover
- URLs may expire

### General limitations

- DVR/recording not yet supported
- Some streams require specific codecs
- EPG mapping accuracy depends on provider data
- Channel logos may not be available for all channels

## See Also

- [Understanding the Interface](/getting-started/understanding-interface) - Navigate the Live TV interface
- [Troubleshooting](../../deploy/troubleshooting) - General troubleshooting steps
- [Configure Subtitles](../languages/subtitles) - Set up subtitles for live TV
