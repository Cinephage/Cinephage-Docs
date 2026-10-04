---
title: How to Configure Transmission
description: Step-by-step guide to configure Transmission with Cinephage
sidebar_position: 3
tags: [download-clients, transmission, torrent, configuration, guide]
keywords: [transmission, torrent client, rpc, setup]
---

# How to configure Transmission

This guide shows you how to configure Transmission as your download client in Cinephage.

## Prerequisites

- Transmission installed and running
- RPC interface enabled in Transmission
- Cinephage installed and running
- Network connectivity between Cinephage and Transmission

## Step 1: Enable Transmission RPC

Transmission uses RPC (Remote Procedure Call) for remote control. You must enable this for Cinephage to connect.

### Edit settings.json

1. Locate your Transmission settings file:
   - Linux: `~/.config/transmission-daemon/settings.json`
   - macOS: `~/Library/Application Support/Transmission/settings.json`
   - Windows: `%LOCALAPPDATA%\Transmission\settings.json`

2. Stop Transmission if it is running
3. Edit `settings.json` and set the following values:

```json
{
  "rpc-enabled": true,
  "rpc-port": 9091,
  "rpc-username": "your-username",
  "rpc-password": "your-password",
  "rpc-authentication-required": true,
  "rpc-whitelist-enabled": false
}
```

4. Save the file and restart Transmission

### Alternative: using Transmission web UI

If you have the Transmission Web UI available:

1. Open Transmission (desktop or web interface)
2. Go to **Edit > Preferences** (or **Transmission > Preferences** on macOS)
3. Select **Remote** tab
4. Check **Allow remote access**
5. Set **Port** to `9091`
6. Check **Use authentication** and set username/password
7. Click **Save** or **Apply**

## Step 2: Add Transmission to Cinephage

1. In Cinephage, go to **Settings > Integrations > Download Clients**
2. Click **Add Download Client**
3. Select **Transmission** from the dropdown
4. Configure the connection settings:

### Connection settings

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive name for this client | `Transmission` |
| **Host** | Transmission IP or hostname | `localhost`, `192.168.1.100`, or `transmission` (Docker) |
| **Port** | RPC port | `9091` |
| **Username** | RPC username | `admin` |
| **Password** | RPC password | your password |
| **Use SSL** | Enable for HTTPS | Unchecked (unless configured) |
| **URL Base** | For reverse proxy setups | `/transmission` (optional) |

**Host configuration guide:**

- Same machine: `localhost` or `127.0.0.1`
- Docker on same host: Use host IP (e.g., `192.168.1.100`)
- Separate machine: Use that machine's IP address
- Docker container name: `transmission` (if on same network)

## Step 3: Test and save

1. Click **Test** to verify Cinephage can connect
2. If successful, click **Save** to add the download client

If the test fails:

- Verify RPC is enabled in Transmission (Step 1)
- Check that the host and port are correct
- Confirm username and password match your settings
- Ensure Transmission is running
- Check firewall rules allow connections on port 9091
- If using Docker, verify containers can communicate

## Testing your configuration

1. Add a movie or series to your Cinephage library with monitoring enabled
2. Go to the item and click **Search**
3. Cinephage should find releases and send one to Transmission
4. Check **Activity > Queue** to see the download
5. Verify the download appears in the Transmission Web UI or desktop app

## Common issues

### RPC not enabled

**Problem:** Connection refused or RPC not accessible.

**Solutions:**

- Ensure `rpc-enabled` is set to `true` in settings.json
- Restart Transmission after editing settings.json
- Verify the port is not blocked by a firewall
- Check that Transmission has permission to bind to the port

### Authentication failed

**Problem:** 401 Unauthorized or authentication errors.

**Solutions:**

- Verify username and password in Cinephage match settings.json
- Ensure `rpc-authentication-required` is set to `true`
- Check that the password was not hashed incorrectly in settings.json
- Try re-entering credentials in both Transmission and Cinephage

### Connection timeout

**Problem:** Connection test times out.

**Solutions:**

- Verify Transmission is running
- Check network connectivity between Cinephage and Transmission
- Ensure the correct IP address or hostname is used
- Check if a firewall is blocking the connection
- If using Docker, verify the container is running and accessible

### Downloads not importing

**Problem:** Downloads complete in Transmission but do not appear in Cinephage library.

**Solutions:**

- Check path mappings if Cinephage and Transmission use different paths
- Verify Cinephage can access the download folder
- Check Cinephage logs in **Settings > Logs**
- Ensure the download directory has correct permissions

## Additional Transmission settings

### Seed ratio and time (v0.5.0+)

Cinephage now properly sets and respects seeding limits in Transmission. Configure seeding behavior in your Transmission settings:

```json
{
  "ratio-limit": 2.0,
  "ratio-limit-enabled": true,
  "seed-time-limit": 1440,
  "seed-time-limit-enabled": true,
  "idle-seeding-limit": 30,
  "idle-seeding-limit-enabled": true
}
```

| Setting | Description | Example |
|---------|-------------|---------|
| **ratio-limit** | Stop seeding after this ratio | 2.0 |
| **seed-time-limit** | Stop seeding after this many minutes | 1440 (24 hours) |
| **idle-seeding-limit** | Stop seeding after idle minutes | 30 |

:::tip[Hit-and-Run Protection]
Cinephage respects these limits and will not remove torrents that are still seeding. Once seeding limits are met, Cinephage can safely remove completed downloads from the queue.
:::

### Download directory

Both the default and incomplete folders must sit under the same single shared root from the [Docker install](/getting-started/installation/docker) (e.g. `/data/...` in **both** Transmission and Cinephage), or hardlinks silently fall back to full copies. Restart Transmission after changing these — existing torrents keep their old stored location until you relocate each (stop → set location → verify → resume).

```json
{
  "download-dir": "/data/downloads/torrents/complete",
  "incomplete-dir": "/data/downloads/torrents/incomplete",
  "incomplete-dir-enabled": true
}
```

## See also

- [Download clients overview](/guides/configure/download-clients) - Overview of supported clients
- [How to configure qBittorrent](./qbittorrent) - Alternative torrent client
- [How to configure Deluge](./deluge) - Another torrent client option
- [Troubleshooting downloads](/guides/deploy/troubleshooting) - Common issues and solutions
