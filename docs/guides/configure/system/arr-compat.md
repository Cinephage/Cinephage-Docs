---
title: Configure Radarr/Sonarr Compatibility
description: Connect autobrr, Pulsarr, Notifiarr, Overseerr, and other Radarr/Sonarr-integrated tools to Cinephage
sidebar_position: 2
tags: [arr-compat, radarr, sonarr, autobrr, pulsarr, overseerr, notifiarr, integration, api, configuration, guide]
keywords: [radarr compatible, sonarr compatible, autobrr, pulsarr, overseerr, notifiarr, arr api]
---

# Configure Radarr/Sonarr compatibility

:::warning Work in progress
Cinephage's Settings UI marks this feature **WIP**. The endpoints below exist and work for the documented clients, but coverage of the full Radarr/Sonarr API surface is still growing - expect gaps with arr-ecosystem tools not explicitly listed here.
:::

Cinephage can expose a Radarr- and Sonarr-compatible API so tools built to talk to Radarr/Sonarr can talk to Cinephage instead - no separate Radarr or Sonarr instance required. This lets you point request tools (Overseerr, Jellyseerr), release automation (autobrr), notification bridges (Pulsarr, Notifiarr), and anything else that speaks the Radarr/Sonarr v3 API at your Cinephage instance directly.

## How It Works

Cinephage exposes two base URLs that mimic the real Radarr and Sonarr APIs:

- `/api/radarr` - behaves like a Radarr v3 API for movies
- `/api/sonarr` - behaves like a Sonarr v3 API for TV/anime series

A client configured to talk to "Radarr" or "Sonarr" at these URLs, using your Cinephage API key, can list/add/update your library, search and grab releases, read quality profiles and root folders, register webhook notifications, and push externally-discovered releases (e.g. from autobrr) for Cinephage to match against your library and grab.

When the compatibility layer is turned off, both base URLs return a plain 404 - as if they don't exist - rather than a "disabled" error, so a probing client gets no hint the feature exists at all until you turn it on.

## Enabling it

Navigate to **Settings > System > General** and find the **Radarr/Sonarr Compatibility** section.

1. Toggle the compatibility layer **on**.
2. Copy the **Radarr connection URL** and **Sonarr connection URL** shown - these are built from your configured External URL (or your current browser origin if that isn't set), so they'll already point at a reachable address for the client you're configuring.
3. Use your Cinephage **Main API Key** (same section, above the compatibility toggle) as the "API Key" field in the third-party tool - it's the same key already used for Cinephage's own API and Cinephage's key-based authentication accepts it via either the `X-Api-Key` header or an `apikey`/`api_key` query parameter, matching how real Radarr/Sonarr accept theirs (whichever the client sends).

If you don't have a Main API Key yet, generate one from the same **Settings > System > General** page before configuring any client.

## What's supported

- **Library**: list/add/update/delete movies and series, quality profiles, root folders, tags, languages/language profiles
- **Search & grab**: interactive release search and grab for a known movie/series (the same flow Radarr/Sonarr's own "Manual Search" and "Interactive Search" use)
- **`release/push`**: accepts a raw, externally-discovered release (title + download/magnet URL, no prior identity) - used by autobrr and similar RSS/announce-based tools. Cinephage parses the release title, matches it against your monitored library by title (and season/episode for TV), scores it against the matched item's quality profile, and grabs it automatically on approval.
- **Notifications**: register a webhook connection the same way you would in real Radarr/Sonarr's Connect settings - used by tools like Pulsarr and Notifiarr to receive grab/download/add/delete events
- **Queue, history, wanted (missing/cutoff), calendar, system status**
- **Exclusions** (Radarr's "Movie won't be added automatically" list / Sonarr's import list exclusions): backed by Cinephage's own Blocked Media list (**Settings > Blocklist > Blocked Media**) - a movie or series you've blocked there is what shows up as "excluded" to arr-compat clients

## Notes

- Only one Cinephage user account exists per instance (single-admin system), so there's no per-client API key scoping - any valid Cinephage API key works for every arr-compat request.
- Blocked Media is a separate feature from the release-level [Blocklist](/guides/configure/quality/blocklist) - Blocked Media hides an entire movie or series from discover/search/library, while the Blocklist rejects specific bad releases for content you're still monitoring.
