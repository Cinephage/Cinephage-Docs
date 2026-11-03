---
title: How to Configure NZBGet
description: Step-by-step guide to configure NZBGet with Cinephage
sidebar_position: 4
tags: [download-clients, nzbget, usenet, configuration, guide]
keywords: [nzbget, usenet client, nzb, setup]
---

# How to configure NZBGet

This guide shows you how to configure NZBGet as your download client in Cinephage.

## Prerequisites

- NZBGet installed and running
- Usenet provider configured in NZBGet
- NZBGet Web UI accessible
- Cinephage installed and running
- Network connectivity between Cinephage and NZBGet

## Step 1: Enable NZBGet Web UI

1. Open the NZBGet Web UI (typically `http://localhost:6789`)
2. Go to **Settings** > **Security**
3. Ensure **ControlUsername** and **ControlPassword** are set
4. Note the **ControlIP** setting (default is `0.0.0.0` for all interfaces)
5. Click **Save all changes** and **Reload**

**Note:** If you cannot access the Web UI, check that NZBGet is running and the port is not blocked.

## Step 2: Get your NZBGet credentials

NZBGet uses username/password authentication for control commands:

1. Go to **Settings** > **Security**
2. Note the **ControlUsername** (default is often empty or `nzbget`)
3. Note the **ControlPassword**
4. These credentials will be used in Cinephage

If you need to set or change credentials:

1. Go to **Settings** > **Security**
2. Set **ControlUsername** and **ControlPassword**
3. Save and reload NZBGet

## Step 3: Add NZBGet to Cinephage

1. In Cinephage, go to **Settings > Integrations > Download Clients**
2. Click **Add Download Client**
3. Select **NZBGet** from the dropdown
4. Configure the connection settings:

### Connection settings

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive name for this client | `NZBGet` |
| **Host** | NZBGet IP or hostname | `localhost`, `192.168.1.100`, or `nzbget` (Docker) |
| **Port** | Web UI port | `6789` |
| **Username** | Control username | `nzbget` or your configured username |
| **Password** | Control password | your password |
| **Use SSL** | Enable for HTTPS | Unchecked (unless configured) |
| **URL Base** | For reverse proxy setups | `/nzbget` (optional) |

**Host configuration guide:**

- Same machine: `localhost` or `127.0.0.1`
- Docker on same host: Use host IP (e.g., `192.168.1.100`)
- Separate machine: Use that machine's IP address
- Docker container name: `nzbget` (if on same network)

### Options

| Field | Description | Example |
|-------|-------------|---------|
| **Movies category** | NZBGet category applied to movie downloads | `movies` |
| **TV Shows category** | NZBGet category applied to TV downloads | `tv` |

Categories in NZBGet help separate downloads by type and can trigger different post-processing. Cinephage sends separate category names for movies and TV rather than a single shared category.

### URL base (reverse proxy support)

If NZBGet is behind a reverse proxy with a base path:

1. Configure NZBGet to use URL base (e.g., `/nzbget`)
2. In Cinephage, enter the same URL base
3. API calls will use `/nzbget/jsonrpc` instead of `/jsonrpc`

**Example Configuration:**

| Setting | Value |
|---------|-------|
| NZBGet URL | `https://example.com/nzbget` |
| Cinephage URL Base | `/nzbget` |

## Step 4: Test and save

1. Click **Test** to verify the connection works
2. If successful, click **Save** to add the download client

If the test fails:

- Verify the username and password are correct
- Check that the host and port are correct
- Ensure NZBGet is running and accessible
- Check firewall rules if connecting across networks
- Verify the ControlIP setting allows remote connections

## Testing your configuration

1. Add a movie or series to your Cinephage library with monitoring enabled
2. Go to the item and click **Search**
3. Cinephage should find releases and send an NZB to NZBGet
4. Check **Activity > Queue** to see the download
5. Verify the download appears in the NZBGet Web UI

## Common issues

### Authentication failed

**Problem:** 401 Unauthorized or control authentication errors.

**Solutions:**

- Verify ControlUsername and ControlPassword match exactly
- Check if the username is case-sensitive
- Ensure credentials are entered correctly in Cinephage
- Try accessing the NZBGet Web UI directly with the same credentials

### Connection refused

**Problem:** Cannot connect to NZBGet.

**Solutions:**

- Verify NZBGet is running
- Check the port is correct (default is 6789)
- Ensure NZBGet Web UI is accessible from your browser
- Check firewall rules allow the connection
- Verify ControlIP is set to `0.0.0.0` or the appropriate IP

### Downloads not importing

**Problem:** Downloads complete in NZBGet but do not appear in Cinephage library.

**Solutions:**

- Check path mappings if Cinephage and NZBGet use different paths
- Verify Cinephage can access the completed download folder
- Check Cinephage logs in **Settings > Monitoring > Logs**
- Ensure the download category is correct

### RSS feed issues

**Problem:** NZBGet RSS feeds not working with Cinephage.

**Solutions:**

- NZBGet RSS is separate from Cinephage indexer configuration
- Configure indexers in Cinephage, not NZBGet RSS
- Ensure your usenet indexers are added to Cinephage directly

## Category configuration (optional)

To set up categories in NZBGet:

1. Go to **Settings** > **Categories**
2. Add categories like `movies` and `tv`
3. Configure destination directories if desired
4. Set post-processing scripts per category
5. Use these category names in Cinephage settings

## Additional NZBGet settings

### Connection limits

In **Settings** > **Download**, configure connection limits based on your usenet provider:

- **Connections** - Number of connections to use
- **Rate** - Download speed limit (0 = unlimited)

### Destination directories

In **Settings** > **Paths**, configure where downloads are saved:

- **DestDir** - Main download directory
- **InterDir** - Intermediate directory (optional, for performance)

Ensure these directories are accessible to Cinephage.

## See also

- [Download clients overview](/guides/configure/download-clients) - Overview of supported clients
- [How to configure SABnzbd](./sabnzbd) - Alternative usenet client
- [Troubleshooting downloads](/guides/deploy/troubleshooting) - Common issues and solutions
