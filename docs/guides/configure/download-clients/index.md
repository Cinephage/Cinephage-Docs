---
title: Download Clients
description: Configure download clients for automated media acquisition
sidebar_position: 1
tags: [download-clients, configuration, qbittorrent, sabnzbd, overview]
keywords: [download clients, torrent, usenet, setup]
---

# Download clients

Download clients handle the actual downloading of media files. Cinephage connects to your download client to send releases and monitor download progress.

## What download clients do

- **Receive download requests** from Cinephage when new releases are found
- **Download content** from torrent trackers or usenet servers
- **Track progress** and report status back to Cinephage
- **Enable post-processing** after downloads complete

## Supported clients

### Torrent clients

| Client | Recommended | Features |
|--------|-------------|----------|
| [qBittorrent](qbittorrent) | Yes | Web UI, categories, stable |
| [Transmission](transmission) | | Lightweight, RPC API, seeding limits |
| [Deluge](deluge) | | Plugin system, thin client |
| [rTorrent](rtorrent) | | XML-RPC, CLI-based, low resource |
| aria2 | | Multi-protocol, lightweight |

### Usenet clients

| Client | Recommended | Features |
|--------|-------------|----------|
| [SABnzbd](sabnzbd) | Yes | Web UI, categories, scripting, mount mode |
| [NZBGet](nzbget) | | Lightweight, RSS support |

## Prerequisites

Before configuring any download client:

- **Download client installed and running** - Install your preferred client and ensure it is operational
- **Web UI enabled** - Most clients require enabling the web interface for remote access
- **Network connectivity** - Cinephage must be able to reach the download client over the network
- **Cinephage running** - Ensure Cinephage is installed and accessible

### For Docker users

If running Cinephage in Docker:

- Both containers must be on the same Docker network (or use host networking)
- Volume mounts should be consistent between containers when possible
- Use container names as hostnames instead of IP addresses

## Path mapping basics

When Cinephage and your download client see different paths to the same files, you need path mapping.

**Example scenario:**

- Download client saves to: `/downloads/movies/`
- Cinephage sees this as: `/media/downloads/movies/`

Both paths point to the same folder, but each application sees it differently. Path mapping translates between these views.

### When you need path mapping

Path mapping is required when:

- Cinephage runs in Docker but the download client does not
- Cinephage and the download client use different volume mounts
- The download client is on a different machine with different path structure

### Common Docker setups

**Both in Docker (recommended — single shared root):**

```yaml
# Cinephage AND download client (identical bind in both)
data:/data # host /mnt/user/data
```

Result: No path mapping needed. Use `/data/downloads/...` and `/data/media/...` everywhere.

:::warning[Important]
Mount the **same** root name to the **same** host path in every container (see [Docker install](/getting-started/installation/docker)). Two binds (`/media` + `/downloads`, or two Unraid shares) are different filesystems inside the containers: hardlinks fail (`EXDEV`) and imports silently copy (2x space). When Client Path and Local Path are identical (`/data/... → /data/...`), mapping is a no-op — that is the goal.
:::

**Cinephage in Docker, client on host:**

```yaml
# Cinephage container
/host/downloads:/downloads

# Host download client
/host/downloads
```

Result: Map `/host/downloads` → `/downloads`

For detailed path mapping instructions, see [Troubleshooting downloads](/guides/deploy/troubleshooting).

## Quick start

1. Choose your download client from the list above
2. Follow the specific configuration guide
3. Test the connection
4. Add a movie or series and search for releases
5. Verify downloads appear in your client

## Best practices

### Use categories

Set categories in your download client:

- Separates Cinephage downloads from others
- Enables different post-processing per category
- Makes it easier to manage completed downloads

### Keep paths consistent

When possible, use the same path structure in all containers:

- Mount downloads to the same path in Cinephage and download client
- Avoids the need for path mappings
- Simplifies troubleshooting

### Monitor disk space

Download clients need space for:

- Active downloads
- Completed downloads (before import)
- Torrent seeding (if enabled)

Ensure adequate space on your download volume.

## Troubleshooting

If you encounter issues:

- **Connection failures** - Verify network connectivity and credentials
- **Downloads not importing** - Check path mappings and file permissions
- **Authentication errors** - Verify API keys and passwords

For detailed troubleshooting, see [Troubleshooting downloads](/guides/deploy/troubleshooting).

## Next steps

After configuring your download client:

- [Configure indexers](/guides/configure/indexers) to add indexers
- [Set up quality profiles](/guides/configure/quality-profiles) to control download quality
- [Search and download](/guides/use/search-and-download) to start acquiring content

## See also

- [Environment variables](/reference/configuration/environment-variables) for advanced configuration
- [Performance tuning](/guides/deploy/performance-tuning) for optimization tips
