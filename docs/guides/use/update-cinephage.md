---
title: Update Cinephage
description: Keep Cinephage up to date with the latest stable releases and fixes
sidebar_position: 7
tags: [update, upgrade, maintenance, guide]
keywords: [update, upgrade, maintenance, migration]
---

# Update Cinephage

Keep Cinephage up to date with the latest stable releases and fixes.

:::warning[Alpha Software]
Breaking changes may occur between updates. Always backup before updating and review release notes.
:::

## Before Updating

### 1. Backup your data

Always backup before updating:

```bash
# Database backup
cp data/cinephage.db data/cinephage.db.backup-$(date +%Y%m%d)

# Configuration backup
cp .env .env.backup
```

See [Backup & Restore](../deploy/backup-restore) for detailed backup procedures.

### 2. Check release notes

Review what's changed:

- [GitHub Releases](https://github.com/cinephage/cinephage/releases)
- [CHANGELOG.md](/support/releases)

Look for:

- Breaking changes
- Database migrations
- New configuration options
- Deprecated features

## Docker Update

Tag policy:

- `latest` = current stable release
- `dev` = current preview build
- `vX.Y.Z` = pinned stable release

### Standard update

```bash
cd /opt/cinephage

# Pull the configured image tag
docker compose pull

# Restart with new image
docker compose up -d

# Verify
docker logs cinephage --tail 50
```

### Update to specific version

```bash
# Edit docker-compose.yaml to specify version
# Change: image: ghcr.io/cinephage/cinephage:latest
# To:     image: ghcr.io/cinephage/cinephage:v1.2.3

docker compose up -d
```

### Rollback Docker update

If something goes wrong:

```bash
# Stop current container
docker compose down

# Restore database backup
cp data/cinephage.db.backup-20250101 data/cinephage.db

# Use previous image version
# Edit docker-compose.yaml to specify previous version
docker compose up -d
```

## Manual Update

### Standard update

```bash
# Stop the service
sudo systemctl stop cinephage

# Backup database
cp /opt/cinephage/data/cinephage.db /opt/cinephage/data/cinephage.db.backup

# Pull latest stable code
cd /opt/cinephage
git fetch origin
git pull origin main

# Install updated dependencies
npm ci --production=false

# Rebuild application
npm run build

# Start service
sudo systemctl start cinephage

# Verify
sudo systemctl status cinephage
```

### Update to specific version

```bash
cd /opt/cinephage
git fetch --tags
git checkout v1.2.3
npm ci --production=false
npm run build
sudo systemctl restart cinephage
```

## Database Migrations

Cinephage handles database migrations automatically on startup:

1. Schema version is checked
2. Required migrations are applied
3. Application starts normally

### If migration fails

1. Check logs for specific error
2. Restore database from backup
3. Report issue on GitHub with error details
4. Wait for fix or try previous version

## Post-Update Verification

After updating, verify everything works:

### 1. Service status

```bash
# Docker
docker ps | grep cinephage
docker logs cinephage --tail 20

# Manual
sudo systemctl status cinephage
```

### 2. Web interface

- Access Cinephage in browser
- Check Settings load correctly
- Verify library is intact

### 3. Functionality test

- Test a manual search
- Verify download client connection
- Check indexer status

### 4. Check logs

```bash
# Docker
docker logs cinephage --tail 50 2>&1 | grep -i error

# Manual / systemd
sudo journalctl -u cinephage -n 50 -p err
```

## Automatic Updates

### Docker with watchtower

Watchtower can automatically update Docker containers:

```yaml
# Add to docker-compose.yaml
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 86400 cinephage
```

:::caution[Not Recommended for Alpha]
Automatic updates are not recommended for alpha software. Breaking changes may occur.
:::

## Troubleshooting Updates

### Build fails after update

```bash
# Clear node_modules and rebuild
rm -rf node_modules
npm ci --production=false
npm run build
```

### Service won't start after update

1. Check logs for specific error
2. Verify Node.js version meets requirements
3. Try restoring database backup
4. Consider rolling back to previous version

### Breaking changes

If update introduces breaking changes:

1. Read migration guide in release notes
2. Update configuration as needed
3. Clear browser cache
4. Restart service

### Version information

Check current version:

```bash
# From running instance
curl -s http://localhost:3000/api/health | jq .version

# Alternate status endpoint
curl -s http://localhost:3000/api/system/status | jq .version
```

## See Also

- [Backup & Restore](../deploy/backup-restore) - Before updating
- [Migration Guide](../deploy/migration) - Version migrations
- [Releases](/support/releases) - Release channels explained
- [Monitor and Upgrade](./monitor-and-upgrade) - Quality monitoring
