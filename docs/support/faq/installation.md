---
title: Installation & Setup FAQ
description: Common questions about installing and setting up Cinephage
sidebar_position: 2
tags: [faq, installation, setup, docker, requirements]
keywords: [faq, installation, setup, docker, system requirements]
---

# Installation & Setup

### What are the system requirements?

**Minimum:**
- 2 CPU cores
- 2 GB RAM
- 10 GB disk space (plus media storage)
- Docker (recommended) or Node.js 22+

**Recommended:**
- 4+ CPU cores
- 4-8 GB RAM
- SSD for Cinephage data
- TMDB API key (free)

### How do I get a TMDB API key?

1. Create free account at [themoviedb.org](https://www.themoviedb.org)
2. Go to Settings → API
3. Click "Request an API Key"
4. Select "Developer"
5. Fill in application details
6. Copy the API Key (not Read Access Token)

### Do I need a download client?

No, but it's recommended for automation. You can:
- Use Cinephage without downloads (manual management)
- Use with qBittorrent, SABnzbd, NZBGet
- Use NZB Streaming without traditional downloads

### Can I run Cinephage without Docker?

Yes, but Docker is strongly recommended:
- **Docker:** Easier setup, consistent environment, better support
- **Native:** Requires Node.js 22+, npm install, more complex

See [Installation](/getting-started/installation) for both methods.

### How do I update Cinephage?

**Docker:**
```bash
docker compose pull
docker compose up -d
```

**Native:**
```bash
git pull
npm install
npm run build
npm start
```

### Where is my data stored?

**Docker:**
```
./config/data/cinephage.db          # Database
./config/                           # Settings, logs
```

**Native:**
```
./data/cinephage.db                 # Database
./data/                             # Settings, logs
```

### How do I backup Cinephage?

Cinephage also has a built-in export/import tool at **Settings > System > Backup** that downloads a config/database snapshot from the web UI (and can restore from one) without needing container access. The manual approach below is the file-level alternative:

**Backup:**
```bash
# Stop Cinephage
docker compose down

# Backup database and config
cp -r ./config /backup/cinephage-config-$(date +%Y%m%d)

# Restart
docker compose up -d
```

**Restore:**
```bash
# Stop Cinephage
docker compose down

# Restore from backup
cp -r /backup/cinephage-config-YYYYMMDD ./config

# Fix permissions
sudo chown -R 1000:1000 ./config

# Restart
docker compose up -d
```

## Quick Command Reference

**Update Cinephage:**
```bash
docker compose pull && docker compose up -d
```

**Backup database:**
```bash
cp ./config/data/cinephage.db ./config/data/cinephage-backup-$(date +%Y%m%d).db
```

**Check disk usage:**
```bash
du -sh ./config
```

**View container status:**
```bash
docker compose ps
```

## See Also

- [Installation Guide](/getting-started/installation) - Complete installation instructions
- [Configuration FAQ](/support/faq/configuration) - Environment and settings
- [Troubleshooting](/support/faq/troubleshooting) - If something goes wrong
- [Troubleshooting Guide](/guides/deploy/troubleshooting) - Detailed troubleshooting
