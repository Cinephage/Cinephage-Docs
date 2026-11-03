---
title: How to Configure Deluge
description: Step-by-step guide to configure Deluge with Cinephage
sidebar_position: 5
tags: [download-clients, deluge, torrent, configuration, guide]
keywords: [deluge, torrent client, web ui, setup]
---

# How to configure Deluge

This guide shows you how to configure Deluge as your download client in Cinephage.

## Prerequisites

- Deluge installed and running
- Web UI plugin enabled in Deluge
- Cinephage installed and running
- Network connectivity between Cinephage and Deluge

## Step 1: Enable Deluge Web UI

Deluge requires the Web UI plugin to be enabled for remote control.

### Enable the plugin

1. Open the Deluge desktop application
2. Go to **Preferences** > **Plugins**
3. Check **WebUi** from the list
4. Click **Install** if not already installed
5. Click **Apply** or **OK**

### Configure web UI settings

1. Go to **Preferences** > **Web Ui**
2. Check **Enable Web Interface**
3. Set **Port** to `8112` (or your preferred port)
4. Set **Password** for the Web UI
5. Check **Enable SSL** only if you have configured certificates
6. Click **Apply** or **OK**

### Alternative: daemon mode

If running Deluge in daemon mode (deluged):

1. Enable the Web UI plugin in the daemon configuration
2. Or use the console to enable it:

```bash
deluge-console
config -s allow_remote True
config allow_remote
quit
```

3. Restart the Deluge daemon

## Step 2: Test Web UI access

Open a browser and navigate to:

```
http://localhost:8112
```

Or if accessing from another machine:

```
http://<deluge-ip>:8112
```

You should see the Deluge Web UI login page. Enter the password you configured.

## Step 3: Add Deluge to Cinephage

1. In Cinephage, go to **Settings > Integrations > Download Clients**
2. Click **Add Download Client**
3. Select **Deluge** from the dropdown
4. Configure the connection settings:

### Connection settings

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive name for this client | `Deluge` |
| **Host** | Deluge IP or hostname | `localhost`, `192.168.1.100`, or `deluge` (Docker) |
| **Port** | Web UI port | `8112` |
| **Password** | Web UI password | your password |
| **Use SSL** | Enable for HTTPS | Unchecked (unless configured) |
| **URL Base** | For reverse proxy setups | `/deluge` (optional) |

**Note:** Deluge's Web UI itself uses password-only authentication - the username field only matters if the Web UI is placed behind something requiring HTTP basic auth (e.g. a reverse proxy).

**Host configuration guide:**

- Same machine: `localhost` or `127.0.0.1`
- Docker on same host: Use host IP (e.g., `192.168.1.100`)
- Separate machine: Use that machine's IP address
- Docker container name: `deluge` (if on same network)

### Options

| Field | Description | Default |
|-------|-------------|---------|
| **Movies category** | Deluge label applied to movie downloads | `movies` |
| **TV Shows category** | Deluge label applied to TV downloads | `tv` |
| **Recent priority / Older priority** | Download priority (Default, High, Force) for recently-aired vs. older content | Default |
| **Start as** | Initial state for added torrents (Start, Pause, Force) | Start |

## Step 4: Test and save

1. Click **Test** to verify Cinephage can connect
2. If successful, click **Save** to add the download client

If the test fails:

- Verify the Web UI is enabled in Deluge (Step 1)
- Check that the host and port are correct
- Confirm the password is correct
- Ensure Deluge is running
- Check firewall rules allow connections on port 8112
- If using Docker, verify containers can communicate
- If using the thin client, ensure the daemon allows remote connections

## Testing your configuration

1. Add a movie or series to your Cinephage library with monitoring enabled
2. Go to the item and click **Search**
3. Cinephage should find releases and send one to Deluge
4. Check **Activity > Queue** to see the download
5. Verify the download appears in the Deluge Web UI or desktop app

## Common issues

### Web UI not enabled

**Problem:** Connection refused or Web UI not accessible.

**Solutions:**

- Ensure the Web Ui plugin is enabled in Deluge preferences
- Verify the Web UI is configured to start automatically
- Check that the port is not blocked by a firewall
- If using daemon mode, ensure `allow_remote` is set to `True`

### Authentication failed

**Problem:** Password rejected or authentication errors.

**Solutions:**

- Verify the password in Cinephage matches the Web UI password
- Check that you are using the Web UI password, not the daemon password
- The default password is often `deluge` if not changed
- Try logging into the Web UI manually to confirm credentials

### Connection to daemon failed

**Problem:** Using thin client but cannot connect to daemon.

**Solutions:**

- Ensure the daemon is running: `deluged`
- Check that `allow_remote` is enabled in the daemon config
- Verify the correct host and port for the daemon
- Check authentication settings for the daemon

### Downloads not importing

**Problem:** Downloads complete in Deluge but do not appear in Cinephage library.

**Solutions:**

- Check path mappings if Cinephage and Deluge use different paths
- Verify Cinephage can access the download folder
- Check Cinephage logs in **Settings > Monitoring > Logs**
- Ensure the download directory has correct permissions

## Additional Deluge configuration

### Label plugin

Cinephage tags downloads with the Movies/TV category names from its Deluge client settings using Deluge's Label plugin - but the plugin must be enabled in Deluge itself first:

1. Go to **Preferences** > **Plugins**
2. Enable **Label** plugin
3. Cinephage automatically creates and applies the label (from its Movies/TV category fields) to each torrent it adds - no extra Deluge-side setup is needed once the plugin is on

### Bandwidth settings

Configure upload/download limits in **Preferences** > **Bandwidth**:

- **Maximum Download Rate** - Limit download speed
- **Maximum Upload Rate** - Limit upload speed for seeding
- **Maximum Connections** - Limit peer connections

### Download location

Set the download directory in **Preferences** > **Downloads**:

- **Download to** - Main download directory
- **Move completed to** - Optional separate directory for completed downloads

Ensure these directories are accessible to Cinephage.

## See also

- [Download clients overview](/guides/configure/download-clients) - Overview of supported clients
- [How to configure qBittorrent](./qbittorrent) - Alternative torrent client
- [How to configure Transmission](./transmission) - Another torrent client option
- [Troubleshooting downloads](/guides/deploy/troubleshooting) - Common issues and solutions
