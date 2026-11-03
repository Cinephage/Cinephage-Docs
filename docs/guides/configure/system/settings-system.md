---
title: Settings - System
description: Configure API keys and external URL for Cinephage
sidebar_position: 4
tags: [settings, api-keys, external-url, configuration, guide]
keywords: [settings, api keys, external url, system]
---

# Settings - System

Manage API keys for external access and configure the external URL for reverse proxy setups.

## Accessing System Settings

Navigate to **Settings > System**.

## API Keys

Cinephage provides two types of API keys for different use cases.

### Main API key

The **Main API Key** provides full access to all Cinephage API endpoints.

| Property      | Value                          |
| ------------- | ------------------------------ |
| **Access**    | All endpoints                  |
| **Prefix**    | `cinephage_`                   |
| **Length**    | 64 characters                  |
| **Rate Limit**| None                           |

**Use Cases:**
- Automation scripts
- External tools and integrations
- Home automation systems
- Custom applications

### Streaming API key

The **Streaming API Key** provides limited access for media server integration.

| Property      | Value                          |
| ------------- | ------------------------------ |
| **Access**    | Live TV, EPG, Streaming only   |
| **Prefix**    | `cinephage_`                   |
| **Length**    | 64 characters                  |
| **Rate Limit**| 10,000 requests/hour           |

**Allowed Endpoints:**
- `/api/livetv/*` - Live TV channels and streams
- `/api/streaming/*` - Media streaming
- `/api/livetv/playlist.m3u` - M3U playlist
- `/api/livetv/epg.xml` - XMLTV EPG

**Denied Endpoints:**
- `/api/library/*` - Library access
- `/api/settings/*` - Settings access
- Admin operations

**Use Cases:**
- Jellyfin Live TV integration
- Plex Live TV plugin
- Emby Live TV
- Media player apps

### Viewing API keys

1. Navigate to **Settings > System**
2. Keys are shown masked by default (e.g., `cinephage_abc...xyz`)
3. Click **Show** to reveal full key
4. Click **Copy** to copy to clipboard

### Regenerating API keys

If a key is compromised or you want to rotate it:

1. Click **Regenerate** next to the key
2. Confirm the action
3. New key is generated immediately
4. **Old key stops working instantly**

:::warning[Update Your Services]
After regenerating, update any services using the old key. The old key becomes invalid immediately.
:::

### Using API keys

**Via HTTP Header (Recommended):**

```bash
curl -H "x-api-key: cinephage_your_key_here" \
  http://localhost:3000/api/library/movies
```

**Via Query Parameter:**

```bash
curl "http://localhost:3000/api/livetv/playlist.m3u?api_key=cinephage_your_key_here"
```

:::tip[When to Use Query Parameter]
Some media servers (Plex, Jellyfin) cannot send custom headers. Use the query parameter for M3U playlist URLs in these cases.
:::

### API key security

- **Treat like passwords** - Don't share or commit to version control
- **Use environment variables** - In scripts, store keys in environment variables
- **Use least privilege** - Use Streaming API Key for media servers
- **Rotate if compromised** - Regenerate immediately if leaked

## External URL

The **External URL** is the public-facing URL used for:

- Authentication callbacks
- Link generation in notifications
- Reverse proxy setups

### When to set

Set the External URL when:
- Using a reverse proxy (nginx, Traefik, Caddy)
- Accessing via domain name
- Behind SSL termination
- Using custom port externally

### Configuration

1. Navigate to **Settings > System**
2. Enter your public URL in **External URL** field
3. Click **Save**

**Examples:**

| Setup               | External URL                      |
| ------------------- | --------------------------------- |
| Local development   | `http://localhost:3000`           |
| Local network       | `http://192.168.1.100:3000`       |
| Reverse proxy HTTP  | `http://cinephage.example.com`    |
| Reverse proxy HTTPS | `https://cinephage.example.com`   |
| Custom subpath      | `https://example.com/cinephage`   |

### Reverse proxy examples

**Nginx:**

```nginx
server {
    listen 443 ssl;
    server_name cinephage.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Caddy:**

```
cinephage.example.com {
    reverse_proxy localhost:3000
}
```

### Troubleshooting

**Authentication loops:**
- Ensure External URL matches how you access Cinephage
- Check `ORIGIN` environment variable matches

**Wrong links in notifications:**
- Verify External URL is correct
- Include protocol (http:// or https://)

**CORS errors:**
- Add domain to `BETTER_AUTH_TRUSTED_ORIGINS` if needed
- Ensure External URL is accessible from client

## API Endpoints

| Method | Endpoint                              | Auth | Description            |
| ------ | ------------------------------------- | ---- | ---------------------- |
| GET    | `/api/settings/system/api-keys`       | 👑   | List API keys          |
| POST   | `/api/settings/system/api-keys`       | 👑   | Generate API keys      |
| POST   | `/api/settings/system/api-keys/[id]/regenerate`| 👑 | Regenerate key |
| GET    | `/api/settings/external-url`          | 👑   | Get external URL       |
| PUT    | `/api/settings/external-url`          | 👑   | Update external URL    |

## See Also

- [Authentication](/reference/api/authentication) - Full auth documentation
- [Environment Variables](/reference/configuration/environment-variables) - Configuration
- [Media Servers](../streaming/media-servers) - Connect Jellyfin/Plex/Emby
