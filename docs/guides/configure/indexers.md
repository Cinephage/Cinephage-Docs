---
title: Indexers
description: Add indexers using YAML-based indexer definitions
sidebar_position: 2
tags: [indexers, torrent, usenet, streaming, yaml, configuration, guide]
keywords: [indexers, yaml, torrent, usenet, configuration]
---

# Configure indexers

This guide explains how to add and configure indexers in Cinephage. Indexers are sources that provide information about available media releases.

## Goal

Add indexers (indexers) so Cinephage can search for and find media releases.

## Prerequisites

- Cinephage installed and running
- Accounts with indexers you want to use (if required)
- API keys or credentials for private indexers

## Understanding Indexers

Cinephage uses a **YAML-only** indexer architecture. All indexer configurations are defined in YAML files, providing flexibility and making it easy to add custom indexers. Native TypeScript indexer implementations have been replaced by this unified YAML-based system.

### Capability declaration

Built-in and custom YAML definitions declare their capabilities (supported search modes, category IDs, etc.) statically in a `caps:` section. The exception is a user-added **Torznab** indexer: when you add or test one, Cinephage auto-discovers the correct `/api` endpoint from the base URL you enter and fetches live capabilities from its `?t=caps` endpoint, so the right search parameters are used automatically.

### Supported protocols

Cinephage supports three types of indexers:

| Protocol      | Description              | Examples                                    |
| ------------- | ------------------------ | ------------------------------------------- |
| **torrent**   | BitTorrent trackers      | 1337x, Kinozal, Milkie.cc, RARBG alternatives, private trackers |
| **usenet**    | NNTP newznab indexers    | NZBGeek, DrunkenSlug, DogNZB                |
| **streaming** | Direct streaming sources | Various STRM providers                      |

## Part 1: Add a Newznab Indexer (Usenet)

Newznab is the standard API format for usenet indexers.

### Step 1: get indexer details

You need:

- **Name**: Descriptive name for the indexer
- **URL**: API endpoint URL
- **API Key**: Your personal API key
- **Categories**: Supported categories (Movies, TV)

Example from NZBGeek:

- URL: `https://api.nzbgeek.info/`
- API Key: Found in your profile settings

### Step 2: add to Cinephage

1. Go to **Settings > Integrations > Indexers**
2. Click **Add Indexer**
3. Select **Newznab** from the dropdown
4. Configure:

**Basic Settings:**

- **Name**: `NZBGeek` (or indexer name)
- **URL**: `https://api.nzbgeek.info/`
- **API Key**: Your API key
- **Categories**: Select Movies and/or TV

**Advanced Settings:**

- **Priority**: `25` (lower = higher priority)
- **Timeout**: `30` seconds
- **Retries**: `3`
- **Rate Limit**: Leave default

### Step 3: test connection

Click **Test** to verify the connection works.

If successful, the indexer status shows **Healthy**.

### Step 4: save

Click **Save** to add the indexer.

## Part 2: Add a Torznab/Jackett Indexer (Torrent)

Torznab is a Newznab-compatible API for torrents, typically provided by Jackett or Prowlarr.

### Option a: importing from Jackett or Prowlarr

If you already manage indexers in Jackett or Prowlarr, Cinephage can import them directly rather than adding each tracker by hand:

1. Go to **Settings > Integrations > Indexers**
2. Click **Connect Jackett** (or **Connect Prowlarr**) near the top of the page
3. Enter the connection details:
   - **Base URL** of your Jackett/Prowlarr instance
   - **API Key** from Jackett/Prowlarr
4. Once connected, Cinephage lists the trackers configured in Jackett/Prowlarr - select the ones to import
5. Each imported tracker becomes its own Cinephage indexer entry, using the shared Jackett/Prowlarr connection under the hood

:::tip[Adding an individual Jackett tracker manually]
You can also add a single Jackett-backed tracker without the import flow: select **Jackett** as the indexer type, then enter your Jackett **API Key** and the tracker's **Tracker ID** (the short ID Jackett uses for that indexer, e.g. `1337x`).
:::

### Option b: generic Torznab server

For a Torznab-compatible server that isn't Jackett or Prowlarr (or to add one of theirs manually instead of importing it):

1. Go to **Settings > Integrations > Indexers**
2. Click **Add Indexer** and select the **Torznab** type
3. Enter the server's base URL and API key

:::tip[URL Auto-Discovery]
You don't need to enter the full `/api` feed path. When you click **Test** or **Save**, Cinephage probes common Torznab endpoint paths from the base URL you entered, resolves the correct one, and fetches live capabilities from it (`?t=caps`) to determine supported search parameters and categories.
:::

### Option c: built-in torrent indexer

Cinephage ships with 40+ built-in YAML definitions for public and private torrent sites (including 1337x, RuTracker, BT4G, Kinozal, Milkie, nCore, PassThePopcorn, Nebulance, TorrentLeech, Aither, Blutopia, and others). These appear directly in the indexer picker - there's no need to write YAML by hand for supported sites:

1. Go to **Settings > Integrations > Indexers**
2. Click **Add Indexer**
3. Select the site (e.g. **1337x**) from the indexer picker
4. Fill in any settings the definition requires (most public trackers need none; private trackers typically need an API key or cookie)
5. Click **Test** to verify it works
6. Click **Save**

## Part 3: Add a Streaming Indexer

For STRM file sources not covered by a built-in definition, or any tracker without a shipped YAML definition, you write a custom YAML definition file rather than pasting YAML into the UI - there is no in-app YAML editor. Place the file in Cinephage's custom indexer definitions directory (`data/indexers/definitions/custom/` by default, overridable with the `INDEXER_CUSTOM_DEFINITIONS_PATH` environment variable) and restart Cinephage so it's picked up. It then appears in the indexer picker like any built-in definition.

Example streaming definition:

```yaml
name: My Streaming Source
protocol: streaming
categories:
  - movies
  - tv
enabled: true
priority: 10
settings:
  baseUrl: https://api.example.com
  apiKey: your-api-key
  timeout: 30
```

## Part 4: Configure Indexer Priority

Priority determines search order (lower number = higher priority):

1. Go to **Settings > Integrations > Indexers**
2. See list of configured indexers
3. Click **Edit** on an indexer
4. Change the **Priority** value:
   - `1-10`: High priority (preferred)
   - `11-25`: Normal priority
   - `26-50`: Low priority (fallback)

### Priority strategy

**Recommended setup:**

- Usenet indexers: Priority `10-15` (faster, more reliable)
- Private trackers: Priority `15-20` (good quality)
- Public trackers: Priority `25-30` (fallback)
- Streaming: Priority `5-10` (instant availability)

## Part 5: Enable/Disable Categories

Configure which content types each indexer searches:

1. Edit an indexer
2. Under **Categories**, check/uncheck:
   - **Movies** - Enable for movie searches
   - **TV** - Enable for TV shows searches

**Example:**

- A movies-only indexer: Check Movies, uncheck TV
- A TV-focused indexer: Check TV, uncheck Movies
- General indexer: Check both

## Part 6: Test Search

Verify your indexers work:

1. Go to **Discover**
2. Search for a popular movie
3. Click on it
4. Go to the **Search** tab
5. Click **Search** button
6. Results should appear from your configured indexers

If no results appear:

- Check indexer status in settings
- Verify categories are enabled
- Test individual indexer connections

## YAML Indexer Reference

Custom definitions are plain YAML files dropped into the custom definitions directory described above (not entered through the UI). The structure below is illustrative of the general shape; check an existing built-in definition under `data/indexers/definitions/` for the exact schema before writing your own.

### Required fields

```yaml
name: Display Name # Human-readable name
protocol: torrent # torrent, usenet, or streaming
categories: # Content types
  - movies
  - tv
enabled: true # true or false
priority: 25 # Search priority (1-50)
```

### Protocol-Specific settings

**Torrent:**

```yaml
settings:
  baseUrl: https://site.com
  search:
    path: /search?q={{query}}
    selectors:
      rows: .torrent-row
      title: .title
      magnet: .magnet-link
      torrent: .torrent-link
      size: .size
      seeders: .seeders
      leechers: .leechers
```

**Usenet (Newznab):**

```yaml
settings:
  apiUrl: https://api.indexer.com/
  apiKey: your-api-key
  categories:
    movies: 2000
    tv: 5000
```

**Streaming:**

```yaml
settings:
  baseUrl: https://api.provider.com
  apiKey: your-key
  timeout: 30
```

## Troubleshooting

### Indexer shows "failed"

**Problem:** Status shows failed or error

**Solutions:**

- Check API key is correct
- Verify URL is correct
- Test from Cinephage settings page
- Check indexer site is online
- Verify your account is active

### No search results

**Problem:** Searches return no results

**Solutions:**

- Verify categories are enabled for that indexer
- Check indexer supports the content type
- Try a more popular/searchable title
- Verify indexer is enabled

### Rate limited

**Problem:** "Rate limit exceeded" errors

**Solutions:**

- Reduce search frequency
- Increase rate limit delay in indexer settings
- Check indexer terms of service
- Consider upgrading to premium account

### Authentication failed

**Problem:** 401 or auth errors

**Solutions:**

- Regenerate API key on indexer site
- Check key is copied correctly (no spaces)
- Verify account is in good standing
- Check if IP is whitelisted

## Best Practices

### Diversify indexers

Use multiple indexers for better coverage:

- At least one usenet indexer
- One or two torrent indexers
- Different priority levels

### Regular testing

Test indexers periodically:

- Check status in settings
- Run test searches
- Remove broken indexers
- Add new ones as needed

### Respect rate limits

- Do not exceed indexer API limits
- Use reasonable monitoring intervals
- Consider VIP/premium for heavy usage

### Security

- Never share API keys
- Use read-only keys when available
- Rotate keys periodically
- Monitor account usage

Third-party indexer credentials (API keys, cookies) are encrypted at rest in Cinephage's database.

## Next Steps

Now that indexers are configured:

- [Set Up Quality Profiles](quality/quality-profiles) to filter results
- [Search and Download](../use/search-and-download) to find content
- [Configure Subtitles](languages/subtitles) for multi-language support

## See Also

- [YAML Indexer Format Reference](/reference/yaml/indexer-definitions) - YAML format documentation
- [Search and Download](../use/search-and-download) - Find and download content
- [Troubleshooting](../deploy/troubleshooting) - Common issues
