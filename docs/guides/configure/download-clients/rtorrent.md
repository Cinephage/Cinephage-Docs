---
title: How to Configure rTorrent
description: Step-by-step guide to configure rTorrent with Cinephage
sidebar_position: 4
tags: [download-clients, rtorrent, torrent, configuration, guide]
keywords: [rtorrent, torrent client, xml-rpc, setup]
---

# How to configure rTorrent

This guide shows you how to configure rTorrent as your download client in Cinephage.

## Prerequisites

- rTorrent installed and running, with ruTorrent (or another HTTP-accessible RPC2 endpoint) in front of it
- Cinephage installed and running
- Network connectivity between Cinephage and rTorrent

:::note[HTTP, not raw SCGI]
Cinephage talks to rTorrent over **HTTP**, sending XML-RPC requests to an `RPC2` endpoint (for example `http://host:port/RPC2`, or `http://host:port/RUTORRENT/plugins/httprpc/action.php` when using ruTorrent's httprpc plugin). rTorrent's own `scgi_port`/`scgi_local` directives speak the raw SCGI protocol, which Cinephage cannot connect to directly - you need a web server (ruTorrent, or nginx/Apache with `scgi_pass`) bridging HTTP to that SCGI socket.
:::

## Step 1: Expose an HTTP-accessible RPC2 endpoint

The most common setup is rTorrent + ruTorrent, where ruTorrent's web server already exposes an HTTP endpoint for RPC calls.

### Using ruTorrent (recommended)

1. Install rTorrent with ruTorrent (many Docker images, e.g. `linuxserver/rutorrent`, bundle both)
2. Ensure rTorrent's `.rtorrent.rc` has SCGI enabled so ruTorrent can reach it:

```bash
# In .rtorrent.rc - local socket ruTorrent connects to internally
scgi_local = /tmp/rtorrent.sock
```

3. ruTorrent's web server (usually on port `80` or `8080`) exposes the RPC2 endpoint at `/RPC2` or, if httprpc plugin is enabled, at `/plugins/httprpc/action.php`
4. Note the ruTorrent web port and any URL base your reverse proxy uses - you'll enter these in Cinephage

### Verify the endpoint is reachable

```bash
curl -d "<?xml version='1.0'?><methodCall><methodName>system.listMethods</methodName></methodCall>" \
  http://localhost:8080/RPC2
```

A valid XML-RPC response confirms the endpoint is reachable over HTTP.

## Step 2: Add rTorrent to Cinephage

1. In Cinephage, go to **Settings > Integrations > Download Clients**
2. Click **Add Download Client**
3. Select **rTorrent** from the dropdown
4. Configure the connection settings:

### Connection settings

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Descriptive name for this client | `rTorrent` |
| **Host** | ruTorrent/rTorrent IP or hostname | `localhost`, `192.168.1.100`, or `rtorrent` (Docker) |
| **Port** | HTTP port of the ruTorrent web server (not the raw SCGI port) | `8080` |
| **Username** | Optional HTTP basic auth | `admin` |
| **Password** | Optional HTTP basic auth | your password |
| **Use SSL** | Enable for HTTPS | Unchecked (unless configured) |
| **URL Base** | Path prefix before `RPC2` - use this if ruTorrent is served from a subpath, or point it at the httprpc plugin's `action.php` | optional |

Cinephage builds the request URL as `http(s)://host:port/RPC2` by default; if a URL base is set and ends in `rpc2` or `action.php` it is used as-is, otherwise `/RPC2` is appended to it.

**Host Configuration Guide:**

- Same machine: `localhost` or `127.0.0.1`
- Docker on same host: Use host IP (e.g., `192.168.1.100`)
- Separate machine: Use that machine's IP address
- Docker container name: `rtorrent` (if on same network)

### Options

| Setting | Description | Default |
|---------|-------------|---------|
| **Movies category** | rTorrent label applied to movie downloads | `movies` |
| **TV Shows category** | rTorrent label applied to TV downloads | `tv` |

rTorrent does not have per-download priority levels in Cinephage the way qBittorrent, Deluge, SABnzbd and NZBGet do - there's no Recent/Older priority selector for this client.

## Step 3: Test and Save

1. Click **Test** to verify Cinephage can connect
2. If successful, click **Save** to add the download client

If the test fails:

- Verify the RPC2 endpoint is reachable over HTTP (Step 1)
- Check that the host and port point at ruTorrent's web server, not rTorrent's raw SCGI port
- Confirm rTorrent and ruTorrent are running
- Check firewall rules allow connections on the configured port
- If using Docker, verify containers can communicate
- Test the endpoint manually with curl (see Step 1)

## Testing Your Configuration

1. Add a movie or series to your Cinephage library with monitoring enabled
2. Go to the item and click **Search**
3. Cinephage should find releases and send one to rTorrent
4. Check **Activity > Queue** to see the download
5. Verify the download appears in ruTorrent or rTorrent console

## Common Issues

### RPC2 endpoint not accessible

**Problem:** Connection refused or RPC not accessible.

**Solutions:**

- Ensure `scgi_local` (or `scgi_port`) is set in `.rtorrent.rc` so ruTorrent can reach rTorrent
- Confirm ruTorrent's web server is running and serving `/RPC2`
- Restart rTorrent/ruTorrent after editing configuration
- Verify the port is not blocked by a firewall

### Connection timeout

**Problem:** Connection test times out.

**Solutions:**

- Verify rTorrent is running
- Check network connectivity between Cinephage and rTorrent
- Ensure the correct IP address or hostname is used
- Check if a firewall is blocking the connection
- If using Docker, verify the container is running and accessible

### Downloads not importing

**Problem:** Downloads complete in rTorrent but do not appear in Cinephage library.

**Solutions:**

- Check path mappings if Cinephage and rTorrent use different paths
- Verify Cinephage can access the download folder
- Check Cinephage logs in **Settings > Monitoring > Logs**
- Ensure the download directory has correct permissions

## rTorrent Configuration Tips

### Download directory

Ensure your download directory is accessible to Cinephage:

```bash
# In .rtorrent.rc
directory = /downloads/complete
```

### Label/Category support

Cinephage uses rTorrent labels (tags) to categorize downloads:

```bash
# Labels are applied automatically via XML-RPC
# No manual configuration needed
```

### Ratios and seeding

Configure seeding behavior in rTorrent:

```bash
# Stop seeding at ratio 2.0
ratio.min.set = 200

# Or stop after 24 hours
schedule = ratio_stop, 60, 60, "if=(ratio,stop)"
```

## See Also

- [Download clients overview](/guides/configure/download-clients) - Overview of supported clients
- [How to configure qBittorrent](./qbittorrent) - Alternative torrent client
- [How to configure Transmission](./transmission) - Another torrent client option
- [Troubleshooting downloads](/guides/deploy/troubleshooting) - Common issues and solutions
