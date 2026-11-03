---
title: Indexer Definitions
description: YAML format reference for defining custom indexers in Cinephage
sidebar_position: 1
tags: [yaml, indexers, torrent, usenet, streaming, reference]
keywords: [yaml, indexers, torrent, usenet, streaming]
---

# YAML indexer definitions

This reference documents the YAML format for defining custom indexers in Cinephage.

## Overview

Cinephage uses a **unified YAML-only indexer architecture**. All indexers are defined entirely through YAML files - no code changes needed to add new indexers. The format is derived from the Cardigann format used by Jackett/Prowlarr community indexer definitions, extended with Cinephage-specific fields for usenet and internal streaming protocols.

### Architecture features

- **YAML-only definitions** - All indexer logic in declarative YAML files
- **Cardigann-compatible core** - `caps`, `login`, `search`, `download` blocks follow the Jackett/Prowlarr definition format
- **Protocol handlers** - `torrent`, `usenet`, and `streaming` protocols, each with an optional `protocolConfig` block
- **CSS-selector based scraping** for HTML indexers, or JSON/XML response parsing for API-based ones (Newznab, Torznab)

### Protocol support

| Protocol | `protocol:` value | Notes |
|----------|---------------------|-------|
| **Torrent** | `torrent` | HTML scraping (CSS selectors) or Torznab (XML) |
| **Usenet** | `usenet` | Newznab XML API |
| **Streaming** | `streaming` | Internal library database queries, or external HTTP APIs |

## YAML Structure

### Root fields

These map directly to the Zod schema in `yamlDefinition.ts` that validates every definition:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (filename without `.yaml`, also used as indexer type) |
| `name` | string | Yes | Display name shown in UI |
| `description` | string | No | Optional description |
| `type` | string | No | `public`, `semi-private`, or `private` (default: `public`) |
| `language` | string | No | Content language, e.g. `en-US` (default: `en-US`) |
| `encoding` | string | No | Response encoding (default: `UTF-8`) |
| `protocol` | string | No | `torrent`, `usenet`, or `streaming` (default: `torrent`) |
| `links` | string[] | Yes | Base URLs for the indexer (first is primary) |
| `legacylinks` | string[] | No | Deprecated/fallback URLs |
| `replaces` | string[] | No | Indexer IDs this definition replaces (migration) |
| `requestdelay` | number | No | Minimum delay between requests (seconds) |
| `requesttimeout` | number | No | Per-request HTTP timeout in ms (overrides the default 30s) |
| `followredirect` | boolean | No | Follow HTTP redirects |
| `testlinktorrent` | boolean | No | Validate `.torrent` download links during testing |
| `certificates` | string[] | No | Accepted TLS certificate fingerprints |
| `internal` | boolean | No | Hides the definition from the indexer picker; seeded/owned by a Cinephage subsystem (default: `false`) |
| `protocolConfig` | object | No | Protocol-specific config - see [Protocol configuration](#protocol-configuration) |
| `settings` | array | No | User-configurable fields - see [Settings fields](#settings-fields) |
| `caps` | object | Yes | Search capabilities - see [Capabilities block](#capabilities-block) |
| `login` | object | No | Authentication configuration - see [Authentication](#authentication) |
| `ratio` | object | No | Ratio-tracking selector (torrent sites) |
| `search` | object | Yes | Search request/parsing configuration - see [Search block](#search-block) |
| `download` | object | No | Download-link resolution - see [Download block](#download-block) |

There is no `enabled`, `priority`, or `categories: [movies, tv]` field at the YAML level - `enabled` and search priority are set per-instance in the UI/database when an indexer is added from a definition, not in the YAML file itself.

### Settings fields

`settings` is an **array** of field definitions (not a plain object), rendered as UI inputs when adding an indexer:

```yaml
settings:
  - name: apikey
    type: password
    label: API Key
    required: false
  - name: downloadlink
    type: select
    label: Download link
    default: 'magnet:'
    options:
      'magnet:': Magnet
      'http://itorrents.org/': iTorrents.org
```

| Field | Type | Description |
|-------|------|--------------|
| `name` | string | Setting key, referenced in templates as `{{ .Config.<name> }}` |
| `type` | string | `text`, `password`, `checkbox`, `select`, `info`, `info_cookie`, `info_cloudflare`, `info_flaresolverr`, `info_useragent`, `info_category_8000`, or `cardigannCaptcha` |
| `label` | string | Optional (info types often omit it) |
| `default` | string \| boolean \| number | Default value |
| `required` | boolean | Whether the field must be filled in |
| `options` | object | For `select` type: `{ value: label }` |

## Protocol configuration

### Torrent (`protocolConfig.torrent`)

```yaml
protocolConfig:
  torrent:
    supportsMagnet: true      # default: true
    supportsInfoHash: true    # default: true
    freeleechPatterns: ["FREELEECH"]
    internalPatterns: ["INTERNAL"]
```

### Usenet (`protocolConfig.usenet`)

```yaml
protocolConfig:
  usenet:
    apiType: newznab           # newznab | spotweb | custom (default: newznab)
    supportsCategories: true   # default: true
    defaultApiPath: /api       # default: /api
    extendedAttributes:
      - name: size
        attribute: size
```

### Streaming (`protocolConfig.streaming`)

```yaml
protocolConfig:
  streaming:
    type: internal          # internal (local DB) | external (HTTP), default: external
    dataSource: database    # database | http, default: http
    qualityTiers: ['4k', '1080p', '720p', '480p']
```

## Capabilities block

`caps` is **required** and describes what the indexer can search for:

```yaml
caps:
  categories:
    '2000': Movies
    '5000': TV
  categorymappings:
    - id: 42
      cat: Movies/HD
      desc: 'Movies/HD'
      default: true
  modes:
    search: [q]
    movie-search: [q, imdbid, tmdbid]
    tv-search: [q, imdbid, tvdbid, season, ep]
  searchFormats:
    episode: [standard, absolute]
    movie: [standard]
```

| Field | Description |
|-------|-------------|
| `categories` | Map of Newznab category ID (as a string key) to display name |
| `categorymappings` | Array mapping the indexer's own category IDs to a Newznab `cat` name, with an optional `default: true` |
| `modes` | Supported search modes and the query parameters each accepts |
| `allowrawsearch` | Whether raw/unstructured search queries are permitted |
| `searchFormats.episode` | Preferred episode formats, in order: `standard` (S01E05), `european` (1x05), `compact` (105), `daily` (2024.01.15), `absolute` (125, for anime) |
| `searchFormats.movie` | Preferred movie formats: `standard`, `yearOnly`, `noYear` |

## Authentication

The `login` block supports several `method` values: `post`, `form`, `cookie`, `get`, `oneurl`, `apikey`, `basic`, `passkey`, `none`.

### Cookie authentication

```yaml
login:
  method: cookie
  cookies:
    - uid={{ .Config.uid }}
    - pass={{ .Config.pass }}
```

### Form login

```yaml
login:
  method: form
  path: /login.php
  form: '#loginform'
  inputs:
    username: '{{ .Config.username }}'
    password: '{{ .Config.password }}'
  error:
    - selector: '.error'
  test:
    path: /
    selector: '.logout'
```

### API key authentication

```yaml
login:
  method: apikey
  apikey:
    location: query      # header | query | both (default: query)
    queryParam: apikey    # default: apikey
    headerName: X-Api-Key # default: X-Api-Key
    source: '{{ .Config.apikey }}'
```

### Passkey authentication (URL-embedded)

```yaml
login:
  method: passkey
  passkey:
    urlTemplate: '/torrents/rss/{{ .Config.passkey }}'
```

### Basic HTTP authentication

```yaml
login:
  method: basic
  basic:
    username: '{{ .Config.username }}'
    password: '{{ .Config.password }}'
```

There is no generic `auth: { type: cookie | form }` block at the top level of `settings` - authentication is configured entirely under the root-level `login` block.

## Search block

`search` is **required**. It has an HTTP mode (the default, `type: http`) and a database mode (`type: database`, used by internal streaming indexers).

### HTTP search (torrent/usenet, and external streaming)

```yaml
search:
  paths:
    - path: 'search/{{ .Keywords }}/1/'
      method: get
  keywordsfilters:
    - name: re_replace
      args: ['\bS(20\d{2})\b', '$1']
  rows:
    selector: 'tr:has(a[href^="/torrent/"])'
  fields:
    title:
      selector: td[class^="coll-1"] a[href^="/torrent/"]
    download:
      selector: td[class^="coll-1"] a[href^="/torrent/"]
      attribute: href
    category:
      selector: td[class^="coll-1"] a[href^="/sub/"]
      attribute: href
      optional: true
      default: '42'
    seeders:
      selector: td[class^="coll-2"]
    leechers:
      selector: td[class^="coll-3"]
    size:
      selector: td[class^="coll-4"]
    date:
      selector: td[class^="coll-date"]
      optional: true
      filters:
        - name: fuzzytime
```

The result container/fields are under `rows`/`fields`, **not** a `selectors:` block. `fields` is a map of field name to either a `SelectorBlock` object (`selector`, `attribute`, `text`, `default`, `optional`, `filters`, `case`, `remove`) or, for internal use, a plain string. There is no dedicated `magnet`/`torrent` shorthand field - the download URL is extracted via the `download` field (and/or the separate `download` block below) using `selector`/`attribute`.

For JSON/XML APIs (e.g. Newznab), set `response.type`:

```yaml
search:
  paths:
    - path: /api
      method: get
      inputs:
        t: search
        q: '{{ .Keywords }}'
        apikey: '{{ .Config.apikey }}'
  response:
    type: xml     # json | html | xml
  rows:
    selector: rss channel item
  fields:
    title:
      selector: title
    download:
      selector: link
    date:
      selector: pubDate
      filters:
        - name: dateparse
          args: 'ddd, DD MMM YYYY HH:mm:ss ZZ'
```

### Template variables

Values inside `path`, `inputs`, and selector `filters` use Go-template-style variables:

| Variable | Description |
|----------|--------------|
| `{{ .Keywords }}` | The search query string |
| `{{ .Query.Season }}`, `{{ .Query.Ep }}` | Season/episode numbers |
| `{{ .Query.IMDBIDShort }}`, `{{ .Query.TMDBID }}`, `{{ .Query.TVDBID }}` | External IDs |
| `{{ .Categories }}` | Resolved category list for the request (often used with the `join` template function) |
| `{{ .Config.<name> }}` | A value from a `settings` field |

### Database search (internal streaming indexers)

```yaml
search:
  type: database
  movieQuery:
    table: movies
    conditions:
      - field: tmdb_id
        value: '{{ .Query.TMDBID }}'
    outputMapping:
      guid: 'stream://movie/{{ .Row.id }}'
      title: '{{ .Row.title }}'
      downloadUrl: 'stream://movie/{{ .Row.tmdb_id }}'
    contentType: movie
```

`movieQuery`/`tvQuery`/`episodeQuery` each take a `table`, optional `join`, optional `conditions` (WHERE clauses with `field`/`operator`/`value`), and a required `outputMapping` (`guid`, `title`, `downloadUrl` required; `size`, `publishDate`, `commentsUrl`, `quality`, `provider` optional).

## Download block

For sites where the download link must be resolved from a details page (rather than being present directly in the search results):

```yaml
download:
  selectors:
    - selector: 'ul li a[href^="{{ .Config.downloadlink }}"]'
      attribute: href
    - selector: 'ul li a[href^="{{ .Config.downloadlink2 }}"]'
      attribute: href
  before:
    path: '{{ .Result.Details }}'
  infohash:
    hash:
      selector: '.infohash'
```

## Common Newznab categories

| ID | Category |
|------|-------------|
| 2000 | Movies |
| 2010 | Movies/Foreign |
| 2040 | Movies/HD |
| 2045 | Movies/UHD |
| 2050 | Movies/BluRay |
| 2060 | Movies/3D |
| 5000 | TV |
| 5040 | TV/HD |
| 5045 | TV/UHD |
| 5070 | TV/Anime |
| 5080 | TV/Documentary |

The full category table (including Console, Audio, PC, XXX, and Books groups) is defined in `NEWZNAB_CATEGORIES` in Cinephage's source and used to resolve category names like `Movies/Foreign` to their numeric ID.

## Complete Examples

### Example 1: public HTML torrent tracker

Adapted from Cinephage's built-in `1337x.yaml` definition:

```yaml
id: 1337x
name: 1337x
description: A public torrent site that offers verified torrent downloads
language: en-US
type: public
protocol: torrent
encoding: UTF-8
requestdelay: 2

links:
  - https://1337x.to/

settings:
  - name: info_flaresolverr
    type: info_flaresolverr

caps:
  categorymappings:
    - { id: 42, cat: Movies/HD, desc: 'Movies/HD' }
    - { id: 41, cat: TV/HD, desc: 'TV/HD' }
  modes:
    search: [q]
    tv-search: [q, season, ep]
    movie-search: [q]

search:
  paths:
    - path: 'search/{{ .Keywords }}/1/'
  rows:
    selector: 'tr:has(a[href^="/torrent/"])'
  fields:
    title:
      selector: td[class^="coll-1"] a[href^="/torrent/"]
    download:
      selector: td[class^="coll-1"] a[href^="/torrent/"]
      attribute: href
    seeders:
      selector: td[class^="coll-2"]
    leechers:
      selector: td[class^="coll-3"]
    size:
      selector: td[class^="coll-4"]
    date:
      selector: td[class^="coll-date"]
      optional: true
      filters:
        - name: fuzzytime

download:
  selectors:
    - selector: 'ul li a[href^="magnet:"]'
      attribute: href
```

### Example 2: Newznab usenet indexer

Adapted from Cinephage's built-in `newznab.yaml` definition:

```yaml
id: newznab
name: Newznab
description: Connect to any Newznab-compatible usenet indexer API
type: private
language: en-US
encoding: UTF-8
protocol: usenet
requestdelay: 0.2

links:
  - http://localhost/api

settings:
  - name: apikey
    type: password
    label: API Key
    required: false

caps:
  modes:
    search: [q]
    movie-search: [q, imdbid, tmdbid]
    tv-search: [q, imdbid, tvdbid, season, ep]
  categories:
    '2000': Movies
    '5000': TV
  categorymappings:
    - id: '2000'
      cat: Movies
    - id: '5000'
      cat: TV
      default: true

search:
  paths:
    - path: /api
      method: get
      inputs:
        t: search
        cat: '{{ join .Categories "," }}'
        q: '{{ .Keywords }}'
        apikey: '{{ .Config.apikey }}'
        limit: '100'
  response:
    type: xml
  rows:
    selector: rss channel item
  fields:
    title:
      selector: title
    download:
      selector: link
    date:
      selector: pubDate
      filters:
        - name: dateparse
          args: 'ddd, DD MMM YYYY HH:mm:ss ZZ'
    size:
      selector: enclosure
      attribute: length
      optional: true
```

### Example 3: internal streaming indexer (library)

Adapted from Cinephage's built-in `cinephage-stream.yaml` definition, which queries the local database instead of a remote site:

```yaml
id: cinephage-stream
name: Cinephage Library
description: Stream content from your local media library
type: private
protocol: streaming
language: en-US
encoding: UTF-8
internal: true

links:
  - https://api.cinephage.net

protocolConfig:
  streaming:
    type: internal
    dataSource: database

caps:
  modes:
    search: [q]
    movie-search: [q, tmdbid, imdbid]
    tv-search: [q, tmdbid, tvdbid, imdbid, season, ep]
  categories:
    '2000': Movies
    '5000': TV

search:
  response:
    type: json
  type: database
```

## Testing Indexers

1. Go to **Settings > Integrations > Indexers**
2. Click **Add Indexer**
3. Select **YAML Definition**
4. Paste your YAML
5. Click **Validate**
6. Click **Test**
7. Click **Save**

## Troubleshooting

### YAML parse / schema validation errors

**Problem:** "Invalid YAML" or a Zod validation error naming a specific field.

**Solutions:**

- Check indentation (spaces, not tabs)
- Confirm `id`, `name`, `links`, `caps`, and `search` are all present - these are required
- Remember `settings` is a list of `{ name, type, ... }` objects, not a plain object
- Use quotes around strings with colons

### Selector not found

**Problem:** No results from a working site.

**Solutions:**

- Test selectors in browser DevTools
- Check if the site uses JavaScript rendering (Cinephage's built-in captcha solver/Camoufox browser may be needed for Cloudflare-protected sites)
- Verify the selector matches the actual HTML under `rows`/`fields`

### Authentication fails

**Problem:** 401 or login errors.

**Solutions:**

- Verify credentials/cookies referenced via `{{ .Config.* }}`
- Check the `login.method` matches what the site actually requires
- Check if the site requires 2FA or IP whitelisting

## Best Practices

### Naming conventions

- Use descriptive `id` values: `nyaa` not `indexer1`
- Keep `name` concise but clear

### Categories

Only map categories the indexer actually supports, and give each a sensible `default: true` mapping in `categorymappings` so uncategorized results still resolve to something usable.

### Security

- Never commit API keys to version control
- Use `settings` fields (referenced via `{{ .Config.* }}`) for credentials instead of hardcoding them in the YAML

## See Also

- [How to Configure Indexers](/guides/configure/indexers) - Step-by-step guide for adding and configuring indexers
- [Naming Tokens Reference](naming-tokens) - Token reference for file naming patterns
- [Search and Download](/guides/use/search-and-download) - Guide to using indexers for searches
- [YAML Specification](https://yaml.org/spec/) - Official YAML specification
- [CSS Selector Reference](https://developer.mozilla.org/en-US/Web/CSS/CSS_Selectors) - MDN CSS selector documentation
