---
title: Configure NNTP servers
description: Set up Usenet NNTP servers for streaming and article checking
sidebar_position: 4
tags: [nntp, usenet, streaming, configuration, guide]
keywords: [nntp, usenet, servers, streaming]
---

# Configure NNTP servers

Configure NNTP (Usenet) servers for streaming content directly from Usenet without downloading the entire NZB first.

## Overview

NNTP servers enable Cinephage to:

- **Stream from Usenet** - Stream NZB content without full download
- **Check article availability** - Verify NZB articles exist before downloading
- **Multi-server failover** - Use multiple providers for redundancy

## Adding an NNTP Server

Navigate to **Settings > Integrations > NNTP Servers**.

### Step 1: click add server

### Step 2: configure server settings

| Field          | Description                              | Example                  |
| -------------- | ---------------------------------------- | ------------------------ |
| **Name**       | Display name for this server             | `Eweka Primary`          |
| **Host**       | NNTP server hostname                     | `news.eweka.nl`          |
| **Port**       | Server port                              | `563` (SSL) or `119`     |
| **SSL**        | Enable SSL/TLS encryption                | Recommended              |
| **Username**   | Your Usenet provider username            | From provider            |
| **Password**   | Your Usenet provider password            | From provider            |
| **Connections**| Maximum concurrent connections (1-50)    | `8` (check provider limit)|
| **Priority**   | Server priority, 0-99 (lower = higher priority)| `1`                |
| **Download Client** | Optional - associate this NNTP server with a specific usenet download client | - |

### Step 3: test connection

1. Click **Test** to verify credentials
2. Check connection speed and authentication
3. Review any error messages

### Step 4: save

Click **Save** to add the server.

## Server Priority

When multiple servers are configured:

1. **Priority 1** servers used first
2. **Fallback** to lower priority if primary fails
3. **Article completion** checked across all servers

### Priority strategy

| Priority | Use Case                    |
| -------- | --------------------------- |
| 1        | Primary (fastest) provider  |
| 2-5      | Backup providers            |
| 6-10     | Block fill servers          |

## Connection Limits

Check your Usenet provider's connection limits:

| Provider      | Typical Connections |
| ------------- | ------------------- |
| Eweka         | 50                  |
| Newshosting   | 60                  |
| UsenetExpress | 50                  |
| Blocknews     | 30                  |

:::warning[Don't Exceed Limits]
Setting connections higher than your provider allows may result in:
- Connection refused errors
- Temporary IP blocks
- Degraded performance
:::

## SSL/TLS Configuration

### Recommended settings

| Port | SSL  | Use Case           |
| ---- | ---- | ------------------ |
| 563  | Yes  | Recommended (SSL)  |
| 119  | No   | Unencrypted        |
| 80   | No   | Alternative clear  |
| 443  | Yes  | Alternative SSL    |

Always enable SSL when available for:
- Privacy protection
- ISP throttling avoidance
- Security

## Bulk Actions

Select multiple servers to:

- **Enable/Disable** - Toggle servers on/off
- **Test** - Verify all connections at once
- **Delete** - Remove servers

## Status Indicators

| Status      | Meaning                          |
| ----------- | -------------------------------- |
| **Healthy** | Connection test successful       |
| **Unhealthy** | Connection test failed         |
| **Disabled** | Server disabled, not used       |

## Troubleshooting

### Connection refused

1. **Check host and port** - Verify correct server address
2. **Verify SSL setting** - SSL port requires SSL enabled
3. **Check firewall** - Ensure port is not blocked
4. **Provider status** - Check if provider is having issues

### Authentication failed

1. **Verify credentials** - Check username/password
2. **Account status** - Ensure subscription is active
3. **Connection limits** - May be exceeded on provider side
4. **Case sensitivity** - Some providers are case-sensitive

### Slow performance

1. **Reduce connections** - Too many can cause throttling
2. **Check priority** - Ensure fastest server is priority 1
3. **SSL overhead** - Try non-SSL if speed is critical
4. **Provider issues** - Check provider status page

### SSL certificate errors

1. **Update certificates** - System CA bundle may be outdated
2. **Verify hostname** - Must match certificate exactly
3. **Try alternative port** - 443 instead of 563

## Best Practices

### Multiple providers

Configure at least 2 servers:
- **Primary** - Fast, unlimited provider
- **Backup** - Block account for missing articles

### Connection tuning

| System Type      | Connections |
| ---------------- | ----------- |
| Low-power        | 4-8         |
| Standard         | 8-16        |
| High-performance | 20-30       |

### Security

- **Always use SSL** when available
- **Don't share credentials** between users
- **Use strong passwords** for Usenet accounts
- **Monitor usage** for unexpected activity

## API Endpoints

| Method | Endpoint                      | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | `/api/usenet/servers`         | List servers          |
| POST   | `/api/usenet/servers`         | Create server         |
| PUT    | `/api/usenet/servers/[id]`    | Update server         |
| DELETE | `/api/usenet/servers/[id]`    | Delete server         |
| POST   | `/api/usenet/servers/[id]/test`| Test connection      |
| POST   | `/api/usenet/servers/sync`    | Sync connections      |

## See Also

- [NZB Streaming](nzb-streaming) - Stream from Usenet
- [Download Clients](../download-clients) - Configure NZBGet/SABnzbd
- [Troubleshooting](../../deploy/troubleshooting) - General issues
