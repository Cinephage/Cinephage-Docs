---
title: Cinephage Documentation
description: Complete documentation for Cinephage, the unified self-hosted media management platform
sidebar_position: 0
slug: /
tags: [overview, getting-started]
keywords: [cinephage, documentation, media management, self-hosted]
---

# Cinephage Documentation

Welcome to the Cinephage documentation. Cinephage is a self-hosted media management platform that unifies movies, TV shows, live TV, and streaming into a single modern application.

## What Cinephage Does

Instead of running multiple separate services, Cinephage provides one cohesive platform:

- **One database** - All your media and configurations together
- **One interface** - Browse, search, and manage everything
- **One configuration** - Set up indexers and clients once
- **One container** - Deploy with Docker and go

## Documentation Sections

<div className="card-grid">

<div className="card">

### Getting started

Installation, setup, and your first steps.

[Get Started →](/getting-started)

</div>

<div className="card">

### Guides

Task-oriented guides for configuration and use.

[Browse Guides →](/guides)

</div>

<div className="card">

### Reference

API docs, configuration, database schema.

[View Reference →](/reference)

</div>

<div className="card">

### Explanation

Architecture, concepts, and design decisions.

[Learn More →](/explanation)

</div>

<div className="card">

### Support

FAQ, releases, roadmap, and troubleshooting.

[Get Help →](/support)

</div>

</div>

## Quick Start

1. **[Install](/getting-started/installation)** - Get running with Docker
2. **[Configure](/getting-started/initial-setup)** - Set up TMDB API, download clients, and Root Folders
3. **[Add Media](/getting-started/adding-media)** - Add your first movie or TV show

## New in v0.18.0

:::info[Latest Release]
- **Multi-user accounts** - Admin and viewer roles, invites/bans, per-user avatars, and importing accounts from a connected media server
- **Media requests** - A Seerr-style request system: viewers submit, admins approve/decline with quotas
- **Live TV** - A new feature area with the built-in Cinephage Live provider, Stalker/XStream/M3U account support, and EPG sync
- **Radarr/Sonarr compatibility** - A new API layer for third-party tools like autobrr, Pulsarr, Notifiarr, and Overseerr/Jellyseerr
- **Language system v2** - Rebuilt language profiles with library-level defaults, per-item overrides, and canonical ISO 639 tag mapping
- **Subtitles overhaul** - Per-requirement acquisition, atomic downloads, and a reconcile scanner for orphaned subtitle files
- **Security** - All third-party credentials are now encrypted at rest, independently rotatable via `ENCRYPTION_MASTER_KEY`
- **Library** - NFO/poster/fanart sidecar files, a "Change Match" action, and TV library sort/filter by missing episodes

[View release notes →](/support/releases#latest---v0180-2026-11-01)
:::

:::info[Still in alpha]
Cinephage v0.18.0 is still an alpha release - expect breaking changes between versions. See the [Roadmap](/support/roadmap) for what's planned next.
:::

## Getting Help

- [Discord](https://discord.gg/scGCBTSWEt) - Community chat
- [GitHub Issues](https://github.com/cinephage/cinephage/issues) - Bug reports and feature requests
- [Troubleshooting Guide](/guides/deploy/troubleshooting) - Common issues and fixes

---

Ready to dive in? Start with the [Installation guide](/getting-started/installation).
