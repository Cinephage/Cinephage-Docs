---
title: How to Configure qBittorrent
description: Step-by-step guide to configure qBittorrent with Cinephage
sidebar_position: 1
tags: [download-clients, qbittorrent, torrent, configuration, guide]
keywords: [qbittorrent, torrent client, web ui, setup]
---

# How to configure qBittorrent

This guide shows you how to configure qBittorrent as your download client in Cinephage.

## Prerequisites

- qBittorrent installed and running
- Web UI enabled in qBittorrent (we will enable it in this guide)
- Cinephage installed and running
- Network connectivity between Cinephage and qBittorrent

## Step 1: Enable qBittorrent Web UI

1. Open the qBittorrent desktop application
2. Go to **Tools > Options** (or **Edit > Preferences** on macOS)
3. Select **Web UI** from the left menu
4. Check **Web User Interface (Remote control)**
5. Set **Port** to `8080` (or your preferred port)
6. Set **Username** and **Password**
7. Check **Bypass authentication for clients on localhost** (optional, for local networks)
8. Click **Apply** then **OK**

## Step 2: Test Web UI access

Open a browser and navigate to:

```
http://localhost:8080
```

Or if accessing from another machine:

```
http://<qbittorrent-ip>:8080
```

You should see the qBittorrent web interface. Log in with the credentials you set.

## Step 3: Add qBittorrent to Cinephage

1. In Cinephage, go to **Settings > Integrations > Download Clients**
2. Click **Add Download Client**
3. Select **qBittorrent** from the dropdown
4. Configure the connection settings:

### Connection settings

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive name for this client | `qBittorrent` |
| **Host** | IP address or hostname | `localhost`, `192.168.1.100`, or `qbittorrent` (Docker) |
| **Port** | Web UI port | `8080` |
| **Username** | qBittorrent username | `admin` |
| **Password** | qBittorrent password | your password |
| **Use SSL** | Enable for HTTPS | Unchecked (unless configured) |
| **URL Base** | For reverse proxy setups | `/qbittorrent` (optional) |

**Host configuration guide:**

- Same machine: `localhost` or `127.0.0.1`
- Docker on same host: Use host IP (e.g., `192.168.1.100`)
- Separate machine: Use that machine's IP address
- Docker container name: `qbittorrent` (if on same network)

### Options

Cinephage separates categories by content type rather than using a single category field:

| Field | Description | Default |
|-------|-------------|---------|
| **Movies category** | qBittorrent category applied to movie downloads | `movies` |
| **TV Shows category** | qBittorrent category applied to TV downloads | `tv` |
| **Recent priority / Older priority** | Download priority (Default, High, Force) for recently-aired vs. older content | Default |
| **Start as** | Initial state for added torrents (Start, Pause, Force) | Start |
| **Sequential download** | Download pieces in order (qBittorrent-only option) | Off |

## Step 4: Test the Connection

Click **Test** to verify Cinephage can connect.

If successful, you will see a success message. If the test fails:

- Verify the host and port are correct
- Confirm the username and password are correct
- Check that your firewall allows connections on the port
- Ensure the qBittorrent Web UI is enabled
- If using Docker, verify containers can communicate

## Step 5: Save

Click **Save** to add the download client.

## Testing Your Configuration

1. Add a movie or series to your library with monitoring enabled
2. Go to the item and click **Search**
3. Cinephage should find releases and send one to qBittorrent
4. Check **Activity > Queue** to see the download
5. Verify the download appears in the qBittorrent Web UI

## Common Issues

### Connection refused

**Problem:** Test connection fails with connection refused error.

**Solutions:**

- Ensure qBittorrent Web UI is enabled (Step 1)
- Check that qBittorrent is running
- Verify the port is correct (default is 8080)
- Check firewall rules allow the connection

### Authentication failed

**Problem:** 401 Unauthorized or authentication errors.

**Solutions:**

- Verify username and password in Cinephage match qBittorrent settings
- Try logging into the Web UI manually to confirm credentials work
- Ensure **Bypass authentication for clients on localhost** is checked if connecting from localhost

### Downloads not appearing in Cinephage

**Problem:** Downloads complete in qBittorrent but do not appear in Cinephage library.

**Solutions:**

- Check path mappings if Cinephage and qBittorrent use different paths
- Verify Cinephage can access the download folder
- Check Cinephage logs in **Settings > Monitoring > Logs**
- Ensure completed download handling is enabled

### Category not working

**Problem:** Downloads do not use the configured category.

**Solutions:**

- The category will be created in qBittorrent on first use
- Verify the category name in Cinephage settings
- Check that the category is not disabled in qBittorrent

## See Also

- [Download clients overview](/guides/configure/download-clients) - Overview of supported clients
- [How to configure SABnzbd](./sabnzbd) - Usenet client setup
- [Troubleshooting downloads](/guides/deploy/troubleshooting) - Common issues and solutions
- [Configure indexers](/guides/configure/indexers) - Add indexers
