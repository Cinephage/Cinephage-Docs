---
title: Backup and Restore
description: Protect your Cinephage data with regular backups and restore procedures
sidebar_position: 2
tags: [backup, restore, data-protection, maintenance, guide]
keywords: [backup, restore, data protection, maintenance]
---

# Backup and restore

This guide explains how to backup your Cinephage data and restore it when needed.

## Goal

Create regular backups of your Cinephage configuration and database to prevent data loss.

## Prerequisites

- Cinephage installed and running
- Access to the config directory
- Backup storage location

## What to Backup

Cinephage's config volume is mounted as `/config` in the Docker image and has two top-level
folders that matter: `/config/data` (`DATA_DIR`, all application data) and `/config/cache`
(re-downloadable browser cache for captcha solving). There is no separate `settings/` directory -
application settings are stored as rows in the SQLite database itself, not as files.

### Essential data (must backup)

| Location                    | Contents                                                                                                                          | Size     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `/config/data/cinephage.db` | Main database - movies, series, **all application settings**, indexers, download clients, quality/scoring profiles, history, etc. | 10-100MB |

Because settings live inside `cinephage.db` (not as separate files), backing up that one file is
enough to capture your entire configuration. Cinephage also has a built-in, passphrase-encrypted
configuration export/import under **Settings > System > Backup & Restore** that lets you export
selected settings sections (system, profiles, downloads, indexers, subtitles, integrations, Live
TV) to a JSON file and re-import them later - a convenient alternative to a full database restore
when you only want to move or restore configuration, not library data.

### Important data (should backup)

| Location                            | Contents                                                                          | Size   |
| ------------------------------------- | ------------------------------------------------------------------------------------ | ------ |
| `/config/data/indexers/definitions` | Indexer YAML definitions; custom ones live in the `custom/` subfolder there by default | Varies |
| `/config/data/channel-logos/`       | Downloaded Live TV channel logo artwork (can be re-downloaded)                    | Varies |
| `/config/data/external-lists/`      | Cached external list presets                                                       | Varies |

### Optional data

| Location                | Contents                                                                                         | Size      |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | --------- |
| `/config/cache/`        | Camoufox (anti-bot captcha-solving browser) install cache - re-downloaded automatically if deleted | 50-100MB+ |
| `/config/data/logs/`    | Application logs                                                                                  | Varies    |
| `/config/data/backups/` | Cinephage's own scheduled/pre-update DB backups (see Part 5)                                      | Varies    |

### What not to backup

- **Media files** - These are in your `/media` mount
- **Downloads** - These are in your `/downloads` mount
- **Docker image** - Can be re-pulled

## Part 1: Manual Backup

### Step 1: stop Cinephage

Stop the container to ensure database is not being written:

```bash
docker compose down
```

### Step 2: create backup directory

```bash
mkdir -p /path/to/backups/cinephage-$(date +%Y%m%d)
```

### Step 3: copy essential files

```bash
# Backup directory
BACKUP_DIR=/path/to/backups/cinephage-$(date +%Y%m%d)
CONFIG_DIR=/path/to/your/cinephage/config

# The database (cinephage.db) contains all application settings, so copying
# the whole data/ directory captures everything that matters.
cp -r "$CONFIG_DIR/data" "$BACKUP_DIR/"
```

To keep the backup smaller, you can exclude the `logs/` and `backups/` subfolders (Cinephage's
own database backups, see Part 5) since they are not needed to restore configuration or library
data:

```bash
cp -r "$CONFIG_DIR/data" "$BACKUP_DIR/" \
    && rm -rf "$BACKUP_DIR/data/logs" "$BACKUP_DIR/data/backups"
```

### Step 4: create archive

```bash
cd /path/to/backups
tar -czf cinephage-$(date +%Y%m%d).tar.gz cinephage-$(date +%Y%m%d)/
rm -rf cinephage-$(date +%Y%m%d)/
```

### Step 5: restart Cinephage

```bash
docker compose up -d
```

### Step 6: move backup to safe location

```bash
# Move to external drive
mv /path/to/backups/cinephage-$(date +%Y%m%d).tar.gz /mnt/backup-drive/

# Or copy to cloud storage
rclone copy /path/to/backups/cinephage-$(date +%Y%m%d).tar.gz remote:backups/

# Or use rsync
rsync -avz /path/to/backups/cinephage-$(date +%Y%m%d).tar.gz user@backup-server:/backups/
```

## Part 2: Automated Backups

### Option a: Docker backup container

Create a backup service in docker-compose.yaml:

```yaml
services:
  cinephage:
    # ... your cinephage config

  backup:
    image: offen/docker-volume-backup:latest
    restart: unless-stopped
    environment:
      BACKUP_CRON_EXPRESSION: '0 2 * * *' # Daily at 2 AM
      BACKUP_RETENTION_DAYS: '30'
      BACKUP_FILENAME: 'cinephage-backup-%Y-%m-%dT%H-%M-%S.tar.gz'
      BACKUP_ARCHIVE: '/archive'
      BACKUP_STOP_CONTAINER_LABEL: 'cinephage.backup.stop'
    volumes:
      - ./config:/backup/data:ro
      - /path/to/backup/storage:/archive
      - /var/run/docker.sock:/var/run/docker.sock:ro
    labels:
      - 'cinephage.backup.stop=true'
```

### Option b: Systemd timer (Linux)

Create backup script:

```bash
sudo tee /usr/local/bin/cinephage-backup.sh > /dev/null << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR=/mnt/backups/cinephage
CONFIG_DIR=/opt/cinephage/config

# Create backup dir
mkdir -p "$BACKUP_DIR"

# Stop Cinephage
cd /opt/cinephage && docker compose down

# Create backup
tar -czf "$BACKUP_DIR/cinephage-$DATE.tar.gz" -C "$CONFIG_DIR" \
    data 2>/dev/null

# Start Cinephage
cd /opt/cinephage && docker compose up -d

# Keep only last 30 backups
ls -t "$BACKUP_DIR"/cinephage-*.tar.gz | tail -n +31 | xargs -r rm
EOF

sudo chmod +x /usr/local/bin/cinephage-backup.sh
```

Create systemd service:

```bash
sudo tee /etc/systemd/system/cinephage-backup.service > /dev/null << 'EOF'
[Unit]
Description=Cinephage Backup

[Service]
Type=oneshot
ExecStart=/usr/local/bin/cinephage-backup.sh
EOF
```

Create systemd timer:

```bash
sudo tee /etc/systemd/system/cinephage-backup.timer > /dev/null << 'EOF'
[Unit]
Description=Run Cinephage Backup Daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cinephage-backup.timer
sudo systemctl start cinephage-backup.timer
```

### Option c: cron job

Add to crontab:

```bash
# Edit crontab
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /usr/local/bin/cinephage-backup.sh > /dev/null 2>&1
```

## Part 3: Restore from Backup

### Step 1: stop Cinephage

```bash
docker compose down
```

### Step 2: locate backup

Find your backup file:

```bash
ls -la /path/to/backups/cinephage-*.tar.gz
```

### Step 3: extract backup

```bash
# Create temp directory
mkdir -p /tmp/cinephage-restore

# Extract backup
tar -xzf /path/to/backups/cinephage-20250316.tar.gz -C /tmp/cinephage-restore

# Check contents
ls -la /tmp/cinephage-restore/cinephage-20250316/
```

### Step 4: restore files

```bash
CONFIG_DIR=/path/to/your/cinephage/config
RESTORE_DIR=/tmp/cinephage-restore/cinephage-20250316

# Backup current config (just in case)
mv "$CONFIG_DIR/data" "$CONFIG_DIR/data.backup.$(date +%Y%m%d)"

# Restore the whole data/ directory (database + indexer defs + channel logos, etc.)
cp -r "$RESTORE_DIR/data" "$CONFIG_DIR/"

# Fix permissions
chown -R 1000:1000 "$CONFIG_DIR"  # Adjust UID:GID as needed
```

### Step 5: start Cinephage

```bash
docker compose up -d
```

### Step 6: verify restore

1. Open Cinephage web interface
2. Check library is intact
3. Verify settings are restored
4. Test search functionality

### Step 7: clean up

```bash
# Remove temp files
rm -rf /tmp/cinephage-restore

# Remove old backup (optional, after verifying)
# rm -rf "$CONFIG_DIR.backup.$(date +%Y%m%d)"
```

## Part 4: Migration to New Server

### Backup on old server

Follow Part 1 to create backup

### Transfer to new server

```bash
# Using scp
scp /path/to/backups/cinephage-20250316.tar.gz user@newserver:/tmp/

# Using rsync
rsync -avz /path/to/backups/cinephage-20250316.tar.gz user@newserver:/tmp/

# Or copy to USB/external drive
```

### Setup on new server

1. Install Docker and Docker Compose
2. Create Cinephage directory structure
3. Copy docker-compose.yaml
4. Restore backup (follow Part 3)
5. Update environment variables if needed:
   - Update `ORIGIN` and `BETTER_AUTH_URL` to new URL
   - Update volume paths if different
6. Start Cinephage

### Update URLs

If your URL changed:

1. Go to **Settings > System**
2. Update **External URL**
3. Update `docker-compose.yaml`:
   ```yaml
   environment:
     - ORIGIN=https://new-domain.com
     - BETTER_AUTH_URL=https://new-domain.com
   ```
4. Restart Cinephage

## Part 5: Database-Only Backup (Built-in)

Cinephage's Docker image does not include the `sqlite3` CLI, so `docker exec cinephage sqlite3 ...`
will not work inside the container. Instead, use the built-in database backup feature, which
performs a hot, consistent backup (including in-flight WAL data) without stopping the app:

- **Automatic:** a scheduled "Database Backup" task runs daily by default and writes a `.db` file
  to `/config/data/backups/scheduled/` (configurable directory and retention count under
  **Settings > System > Backup & Restore**).
- **Automatic, pre-update:** before any database schema migration runs (e.g. after upgrading to a
  new version), Cinephage automatically takes a backup to `/config/data/backups/pre-update/`
  (the 5 most recent are kept) so you can roll back if an upgrade goes wrong.
- **Manual:** click **Run Backup Now** on the same Settings page, or `POST` to
  `/api/settings/system/db-backup/run`, to trigger an on-demand backup immediately.

To pull a copy off the host, just copy the file from the mounted config volume:

```bash
# List backups Cinephage has already created
ls /path/to/cinephage/config/data/backups/scheduled/

# Copy the most recent one out
cp /path/to/cinephage/config/data/backups/scheduled/cinephage-backup-*.db /path/to/backups/
```

## Backup Strategy Recommendations

### Frequency

| Data Type                              | Backup Frequency | Retention |
| ----------------------------------------- | ------------------ | ----------- |
| Database (`cinephage.db` - includes all settings) | Daily             | 30 days   |
| Full `/config/data` directory          | Weekly            | 30 days   |

### Storage locations

Keep backups in multiple locations:

1. **Local** - External drive or NAS
2. **Offsite** - Cloud storage (Backblaze B2, S3, etc.)
3. **Remote** - Another server or location

### Testing

Test restore process periodically:

1. Restore to test environment
2. Verify data integrity
3. Test functionality
4. Document any issues

## Troubleshooting

### Database locked during backup

**Problem:** Cannot copy database file while Cinephage is running

**Solution:** Use the built-in hot backup instead of copying the live file directly - either wait
for the daily scheduled backup, or trigger one on demand from **Settings > System > Backup &
Restore** ("Run Backup Now") / `POST /api/settings/system/db-backup/run`. See Part 5. The
`sqlite3` CLI is not installed in the Cinephage container, so `docker exec cinephage sqlite3 ...`
will not work.

### Backup too large

**Problem:** Backup files are huge

**Solutions:**

- Exclude the `/config/cache/` directory (re-downloadable Camoufox browser cache)
- Exclude `/config/data/logs/` and `/config/data/backups/`
- Compress with higher level: `tar -czf` (already compressed)
- Backup only the database (`/config/data/cinephage.db`), which holds all settings

### Restore fails

**Problem:** Cannot restore backup

**Solutions:**

- Check backup file is not corrupt: `tar -tzf backup.tar.gz`
- Verify file permissions after restore
- Check database integrity from the host (if you have a local `sqlite3` install): `sqlite3 data/cinephage.db "PRAGMA integrity_check;"`
- Restore to fresh config directory

### Version compatibility

**Problem:** Backup from old version incompatible

**Solution:**

- Check changelog for migration notes
- Upgrade Cinephage before restoring
- Or restore then upgrade
- Database schema updates automatically

## Next Steps

Now that backups are configured:

- [Performance Tuning](performance-tuning) for optimization
- [Troubleshooting](troubleshooting) for common issues

## See Also

- [Environment Variables](/reference/configuration/environment-variables) - Configuration options
- [Docker Compose Reference](https://docs.docker.com/compose/) - Docker documentation
- [SQLite Backup Documentation](https://www.sqlite.org/backup.html) - SQLite reference
