---
title: Configure Media Servers
description: Connect Jellyfin, Emby, or Plex for automatic library updates
sidebar_position: 1
tags: [media-servers, jellyfin, emby, plex, notifications, configuration, guide]
keywords: [media servers, jellyfin, emby, plex, notifications]
---

# Configure media servers

Connect your media servers to Cinephage for automatic library refresh notifications. When Cinephage imports, upgrades, renames, or deletes media files, your media server will automatically update its library.

## Supported Media Servers

| Server   | Protocol      | Default Port | API Type        |
| -------- | ------------- | ------------ | --------------- |
| Jellyfin | MediaBrowser  | 8096         | REST API        |
| Emby     | MediaBrowser  | 8096         | REST API        |
| Plex     | Plex XML API  | 32400        | XML over HTTP   |

## How It Works

1. **Event Occurs** - Cinephage imports, upgrades, renames, or deletes a file
2. **Batching** - Events are collected for 5 seconds (deduplicated)
3. **Path Mapping** - Local paths translated to media server paths
4. **Notification Sent** - Each enabled server receives library update
5. **Library Refreshes** - Media server refreshes affected folders

## Configuration

Navigate to **Settings > Integrations > Media Servers**.

### Step 1: add a media server

1. Click **Add Server**
2. Select server type (Jellyfin, Emby, or Plex)

### Step 2: configure connection

| Field      | Description                                           | Example                      |
| ---------- | ----------------------------------------------------- | ---------------------------- |
| **Name**   | Display name for this server                          | `Living Room Jellyfin`       |
| **Host**   | Server URL (include port if non-default)              | `http://192.168.1.100:8096`  |
| **API Key**| Authentication key from your media server             | _from server settings_       |

#### Getting Your API Key

**Jellyfin:**
1. Log in to Jellyfin
2. Go to **Dashboard > API Keys**
3. Click **Create**
4. Name it "Cinephage" and copy the key

**Emby:**
1. Log in to Emby
2. Go to **Settings > Advanced > API Keys**
3. Create a new key and copy it

**Plex:**
1. Log in to Plex Web
2. Go to **Settings > Plex Web > Devices**
3. Find your server and copy the **Plex Token** from the URL
4. Or visit `https://plex.tv/devices.xml` and find the token

### Step 3: configure notification triggers

Select which events should trigger library updates:

| Trigger      | Description                                    | Recommended |
| ------------ | ---------------------------------------------- | ----------- |
| **On Import** | Notify when new media is imported             | Yes         |
| **On Upgrade** | Notify when media quality is upgraded        | Yes         |
| **On Rename** | Notify when files are renamed                 | Yes         |
| **On Delete** | Notify when media files are deleted           | Yes         |

### Step 4: configure path mappings (Docker)

If Cinephage and your media server run in different Docker containers, paths may differ:

| Field         | Description                              |
| ------------- | ---------------------------------------- |
| **Local Path** | Path as seen by Cinephage               |
| **Remote Path** | Path as seen by media server            |

**Example:**

Cinephage container mounts: `/mnt/media:/media`
Jellyfin container mounts: `/mnt/media:/data/media`

```
Local Path:  /media/movies
Remote Path: /data/media/movies
```

**To add a path mapping:**

1. Click **Add Path Mapping**
2. Enter the local path (Cinephage's view)
3. Enter the remote path (media server's view)
4. Repeat for each root folder

### Step 5: test and save

1. Click **Test** to verify connection
2. Review settings
3. Click **Save**

## Managing Multiple Servers

You can connect multiple media servers:

- **Multiple Jellyfin/Emby instances** - Different locations or users
- **Mixed environments** - Jellyfin for some, Plex for others
- **Backup server** - Secondary server for redundancy

### Bulk actions

Select multiple servers to:

- **Enable/Disable** - Toggle notifications
- **Test** - Verify all connections
- **Delete** - Remove servers

## Server Status Indicators

| Status      | Meaning                                    |
| ----------- | ------------------------------------------ |
| **Healthy** | Enabled, last test successful              |
| **Unhealthy** | Enabled, last test failed                |
| **Disabled** | Manually disabled, no notifications sent  |

## Troubleshooting

### Connection test fails

**Jellyfin/Emby:**
1. Verify URL includes protocol (`http://` or `https://`)
2. Check port is correct (default: 8096)
3. Ensure API key is valid and not expired
4. Check firewall allows connections

**Plex:**
1. Verify Plex Token is correct
2. Ensure server is accessible (not behind VPN)
3. Check if Plex is using custom port
4. Try `http://` instead of `https://` for local connections

### Library not updating

1. **Check notification triggers** - Ensure events are enabled
2. **Verify path mappings** - Mismatched paths cause silent failures
3. **Check server logs** - Media server may have received but ignored
4. **Test manually** - Use Test button to verify connection

### Path mapping issues

**Symptoms:**
- Media server doesn't show new content
- Refresh doesn't find files
- Wrong library updated

**Solutions:**
1. Verify both container mount points
2. Test with absolute paths
3. Check for trailing slashes (remove them)
4. Ensure paths exist on both sides

### Plex-Specific issues

**Plex requires library section lookup:**
- Cinephage finds the section containing your path
- If path isn't in any library, refresh fails
- Ensure your Root Folders are in Plex libraries

**"No matching library found":**
1. Add the path to a Plex library
2. Or use full library refresh instead

## Best Practices

### Path mappings

- **Use consistent mount points** across containers
- **Document your mappings** for future reference
- **Test after Docker changes** - Recreating containers can change paths

### Notification strategy

- **Enable all triggers** for best experience
- **Disable On Delete** if you manually manage deletions
- **Use multiple servers** for critical setups

### Performance

- **Batching is automatic** - 5-second window groups rapid changes
- **Deduplication** - Same file changed multiple times = single notification
- **Non-blocking** - Notifications don't slow down Cinephage

## API Endpoints

| Method | Endpoint                                    | Description           |
| ------ | ------------------------------------------- | --------------------- |
| GET    | `/api/notifications/mediabrowser`           | List servers          |
| POST   | `/api/notifications/mediabrowser`           | Create server         |
| PUT    | `/api/notifications/mediabrowser/[id]`      | Update server         |
| DELETE | `/api/notifications/mediabrowser/[id]`      | Delete server         |
| POST   | `/api/notifications/mediabrowser/[id]/test` | Test connection       |

## See Also

- [Initial Setup](/getting-started/initial-setup) - First-time configuration
- [Root Folders](../library/root-folders) - Managing your media library
- [Troubleshooting](../../deploy/troubleshooting) - General troubleshooting
