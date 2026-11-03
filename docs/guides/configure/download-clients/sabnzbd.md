---
title: How to Configure SABnzbd
description: Step-by-step guide to configure SABnzbd with Cinephage
sidebar_position: 2
tags: [download-clients, sabnzbd, usenet, configuration, guide]
keywords: [sabnzbd, usenet client, nzb, setup]
---

# How to configure SABnzbd

This guide shows you how to configure SABnzbd as your download client in Cinephage.

## Prerequisites

- SABnzbd installed and running
- Usenet provider configured in SABnzbd
- SABnzbd Web UI accessible
- Cinephage installed and running
- Network connectivity between Cinephage and SABnzbd

## Step 1: Get your SABnzbd API key

1. Open the SABnzbd Web UI (typically `http://localhost:8080`)
2. Go to **Config** (wrench icon) > **General**
3. Scroll to the **API Key** section
4. Copy the **API Key** (not the NZB Key)

**Note:** The API key is used for Cinephage to communicate with SABnzbd. Keep it secure.

## Step 2: Add SABnzbd to Cinephage

1. In Cinephage, go to **Settings > Integrations > Download Clients**
2. Click **Add Download Client**
3. Select **SABnzbd** from the dropdown
4. Configure the connection settings:

### Connection settings

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive name for this client | `SABnzbd` |
| **Host** | SABnzbd IP or hostname | `localhost`, `192.168.1.100`, or `sabnzbd` (Docker) |
| **Port** | Web UI port | `8080` |
| **API Key** | Your SABnzbd API key | `a1b2c3d4...` |
| **Use SSL** | Enable for HTTPS | Check if using HTTPS |

**Note:** Cinephage authenticates to SABnzbd using the API key only - there are no separate username/password fields for this client.

**Host configuration guide:**

- Same machine: `localhost` or `127.0.0.1`
- Docker on same host: Use host IP (e.g., `192.168.1.100`)
- Separate machine: Use that machine's IP address
- Docker container name: `sabnzbd` (if on same network)

### Options

| Field | Description | Example |
|-------|-------------|---------|
| **Movies category** | SABnzbd category applied to movie downloads | `movies` |
| **TV Shows category** | SABnzbd category applied to TV downloads | `tv` |
| **URL Base** | Base path for reverse proxy | `/sabnzbd` |

Categories in SABnzbd help separate downloads by type and can trigger different post-processing scripts. Cinephage sends separate category names for movies and TV rather than a single shared category.

### URL base (reverse proxy support)

If SABnzbd is behind a reverse proxy with a base path:

1. Configure SABnzbd to use URL base (e.g., `/sabnzbd`)
2. In Cinephage, enter the same URL base
3. API calls will use `/sabnzbd/api` instead of `/api`

**Example Configuration:**

| Setting | Value |
|---------|-------|
| SABnzbd URL | `https://example.com/sabnzbd` |
| Cinephage URL Base | `/sabnzbd` |

This allows both services to coexist on the same domain with different base paths.

## Step 3: Test and save

1. Click **Test** to verify the connection works
2. If successful, click **Save** to add the download client

If the test fails:

- Verify the API key is correct (copy it again from SABnzbd)
- Check that the host and port are correct
- Ensure SABnzbd is running and accessible
- If using authentication, verify username and password
- Check firewall rules if connecting across networks

## Testing your configuration

1. Add a movie or series to your Cinephage library with monitoring enabled
2. Go to the item and click **Search**
3. Cinephage should find releases and send an NZB to SABnzbd
4. Check **Activity > Queue** to see the download
5. Verify the download appears in the SABnzbd Web UI

## Common issues

### API key rejected

**Problem:** Test connection fails with API key error.

**Solutions:**

- Copy the API key again from SABnzbd Config > General
- Ensure you are using the **API Key**, not the **NZB Key**
- Check that the API key has not been regenerated
- Verify there are no extra spaces when pasting the key

### Connection refused

**Problem:** Cannot connect to SABnzbd.

**Solutions:**

- Verify SABnzbd is running
- Check the port is correct (default is 8080)
- Ensure SABnzbd Web UI is accessible from your browser
- Check firewall rules allow the connection

### Downloads not importing

**Problem:** Downloads complete in SABnzbd but do not appear in Cinephage library.

**Solutions:**

- Check path mappings if Cinephage and SABnzbd use different paths
- Verify Cinephage can access the completed download folder
- Check Cinephage logs in **Settings > Monitoring > Logs**
- Ensure the download category is correct

### Slow download speeds

**Problem:** Download speeds are slower than expected.

**Solutions:**

- Check your usenet provider's connection limits
- Verify you have sufficient connections configured in SABnzbd
- Test speed directly in SABnzbd to isolate the issue
- Check for ISP throttling or network congestion

## Category configuration (optional)

To set up categories in SABnzbd:

1. Go to **Config** > **Categories**
2. Add categories like `movies` and `tv`
3. Configure post-processing per category if desired
4. Use these category names in Cinephage settings

## See also

- [Download clients overview](/guides/configure/download-clients) - Overview of supported clients
- [How to configure qBittorrent](./qbittorrent) - Torrent client setup
- [How to configure NZBGet](./nzbget) - Alternative usenet client
- [Troubleshooting downloads](/guides/deploy/troubleshooting) - Common issues and solutions
