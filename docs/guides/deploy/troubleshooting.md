---
title: Troubleshooting
description: Solutions for common Cinephage issues and problems
sidebar_position: 1
tags: [troubleshooting, errors, problems, support, guide]
keywords: [troubleshooting, errors, support, debugging]
---

# Troubleshooting

This guide provides solutions for common issues you may encounter when using Cinephage.

## Goal

Diagnose and resolve common problems with Cinephage.

## Quick Diagnostics

Before diving into specific issues, perform these checks:

### Check application status

1. Is Cinephage running?

   ```bash
   docker ps | grep cinephage
   ```

2. Check logs for errors:

   ```bash
   docker compose logs -f cinephage
   ```

3. Verify web interface loads:
   - Open browser to `http://localhost:3000`
   - Check for error messages

### Check system resources

- **Disk Space**: Ensure adequate space for database and media
- **Memory**: Cinephage uses 512MB-2GB RAM typically
- **CPU**: Normal usage is low, spikes during scans/searches

## Common Issues

### Cannot access web interface

**Symptoms:** Browser shows "This site cannot be reached" or connection refused

**Solutions:**

1. **Check if container is running:**

   ```bash
   docker compose ps
   ```

   If not running, start it:

   ```bash
   docker compose up -d
   ```

2. **Check port mapping:**
   - Verify `docker-compose.yaml` has `3000:3000`
   - Ensure port 3000 is not in use by another app
   - Try changing to `3001:3000` if needed

3. **Check firewall:**

   ```bash
   sudo ufw allow 3000/tcp  # For UFW
   sudo firewall-cmd --add-port=3000/tcp  # For firewalld
   ```

4. **Check logs for startup errors:**
   ```bash
   docker compose logs cinephage | tail -50
   ```

### Authentication issues

**Symptoms:** Cannot log in, "Invalid credentials", session expired

**Solutions:**

1. **Reset admin password:**
   - Access container shell:
     ```bash
     docker exec -it cinephage sh
     ```
   - Reset password via database or use recovery procedure
   - See logs for specific error

2. **Check BETTER_AUTH_URL:**
   - Must match your access URL exactly
   - Example: `BETTER_AUTH_URL=http://your-server-ip:3000`

3. **Clear browser cookies:**
   - Try incognito/private window
   - Clear cookies for your Cinephage domain
   - Try different browser

4. **Check ORIGIN environment variable:**
   - Must match your access URL
   - Required for CSRF protection

### Downloads not starting

**Symptoms:** Searches find releases but nothing downloads

**Solutions:**

1. **Check download client connection:**
   - Go to **Settings > Integrations > Download Clients**
   - Verify status shows "Healthy"
   - Click **Test** to verify connection

2. **Check indexer status:**
   - Go to **Settings > Integrations > Indexers**
   - Verify indexers show "Healthy"
   - Test failing indexers

3. **Check quality profile:**
   - Ensure item has quality profile assigned
   - Verify profile allows the found releases
   - Check Custom Formats are not blocking

4. **Check blocklist:**
   - Go to **Activity > Blocklist**
   - See if releases are being blocked
   - Remove from blocklist if needed

5. **Check monitoring:**
   - Verify item is monitored (blue bookmark icon)
   - Unmonitored items are not downloaded automatically

### Downloads not importing

**Symptoms:** Download completes but file not in library

**Solutions:**

1. **Check path mappings:**
   - Go to download client settings
   - Verify path mappings are correct
   - Client Path and Local Path should be identical when mounts match (e.g. `/data/... → /data/...`); see the single-root IMPORTANT note in the [Docker install](/getting-started/installation/docker)
   - Ensure Cinephage can access download folder

2. **Verify hardlinks work (not silent copies):**

   ```bash
   stat -c '%d %i %h %s %n' /path/to/download/file.mkv /path/to/library/file.mkv
   ```

   Same device + same inode with `Links: 2` = hardlinked (0 extra space). Same size but different inodes with `Links: 1` = full copy (2x space) — recheck mounts.

3. **Check file permissions:**
   - Verify PUID/PGID in docker-compose.yaml
   - Ensure Cinephage can read download folder
   - Check file ownership in downloads directory

4. **Check volume mounts (single shared root):**

   ```yaml
   # Verify these paths exist and are correct
   volumes:
     - ./config:/config
     - /mnt/user/data:/data # media AND downloads underneath
   ```

5. **Check logs:**

   ```bash
   docker compose logs cinephage | grep -i import
   ```

   Look for the transfer mode (`hardlink` vs `copy` fallback).

6. **Manual import test:**
   - Go to **Library > Import**
   - Try importing the file manually
   - Check for specific error messages

### TMDB API errors

**Symptoms:** "TMDB API error", no search results, metadata missing

**Solutions:**

1. **Verify API key:**
   - Go to **Settings > General**
   - Check TMDB API key is entered
   - Click **Test** to verify

2. **Check API key validity:**
   - Visit [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - Verify key is active
   - Regenerate if needed

3. **Check network connectivity:**

   ```bash
   docker exec -it cinephage sh
   ping api.themoviedb.org
   ```

4. **Check rate limits:**
   - Free API has rate limits
   - Wait a few minutes if rate limited
   - Consider TMDB VIP for higher limits

### Database errors

**Symptoms:** "Database error", "SQLite error", data not saving

**Solutions:**

1. **Check disk space:**

   ```bash
   df -h
   ```

   Ensure config volume has space

2. **Check database permissions:**

   ```bash
   ls -la /path/to/config/data/*.db
   ```

   Should be owned by PUID/PGID

3. **Database corruption check:**

   ```bash
   docker exec -it cinephage sh
   sqlite3 /config/data/cinephage.db "PRAGMA integrity_check;"
   ```

4. **Restore from backup:**
   - If database is corrupt, restore from backup
   - Stop Cinephage first:
     ```bash
     docker compose down
     ```
   - Restore database file
   - Start Cinephage:
     ```bash
     docker compose up -d
     ```

### Slow performance

**Symptoms:** Slow page loads, searches take long time

**Solutions:**

1. **Check system resources:**
   - CPU usage during operations
   - Available memory
   - Disk I/O wait

2. **Optimize database:**

   ```bash
   docker exec -it cinephage sh
   sqlite3 /config/data/cinephage.db "VACUUM;"
   ```

3. **Reduce indexer count:**
   - Too many indexers slow searches
   - Use 3-5 quality indexers
   - Disable slow/broken indexers

4. **Adjust worker limits:**
   - Edit environment variables:
     ```yaml
     environment:
       - WORKER_MAX_SEARCH=2
       - WORKER_MAX_SCANS=1
     ```

5. **Check logs for slow queries:**
   ```bash
   docker compose logs cinephage | grep -i "slow"
   ```

### Subtitle download failures

**Symptoms:** Subtitles not downloading or syncing

**Solutions:**

1. **Check subtitle providers:**
   - Go to **Settings > Integrations > Subtitle Providers**
   - Verify providers are enabled
   - Test connections

2. **Check language profile:**
   - Ensure media has language profile assigned
   - Verify languages are configured correctly

3. **Check API limits:**
   - Some providers have daily limits
   - Wait for limit reset
   - Enable more providers

4. **Manual sync:**
   - If auto-sync fails, try manual sync
   - Go to media detail > Subtitles
   - Click **Sync** on subtitle file

### Environment variable issues

**Symptoms:** Configuration changes don't apply, settings don't work as expected

**Changes Not Taking Effect:**

1. **Check syntax** (no spaces around `=`):

   ```yaml
   # Wrong
   environment:
     - ORIGIN = http://localhost:3000  # Spaces around =
   
   # Correct
   environment:
     - ORIGIN=http://localhost:3000
   ```

2. **Restart the container:**

   ```bash
   docker compose restart
   ```

3. **Verify variables are set:**

   ```bash
   docker exec cinephage env | grep VARIABLE
   ```

**Common Mistakes:**

- Using lowercase variable names (`origin` instead of `ORIGIN`)
- Adding spaces around the `=` sign
- Forgetting to restart the container after changes

**Debug Configuration:**

View all environment variables:

```bash
docker exec cinephage env | sort
```

Check specific variable:

```bash
docker exec cinephage env | grep LOG_LEVEL
```

## Advanced Troubleshooting

### Enable debug logging

Get more detailed logs:

1. Set environment variable:

   ```yaml
   environment:
     - LOG_LEVEL=debug
   ```

2. Restart Cinephage:

   ```bash
   docker compose restart
   ```

3. Check detailed logs:
   ```bash
   docker compose logs -f cinephage
   ```

### Database inspection

Investigate database issues:

```bash
# Access database
docker exec -it cinephage sqlite3 /config/data/cinephage.db

# List tables
.tables

# Check table counts
SELECT COUNT(*) FROM movies;
SELECT COUNT(*) FROM series;

# Check for errors
SELECT * FROM settings WHERE key LIKE '%error%';

# Exit
.quit
```

### Reset specific components

**Reset tasks:**

1. Stop Cinephage
2. Delete or rename task history in database
3. Restart Cinephage

**Clear cache:**

1. Stop Cinephage
2. Clear cache directory:
   ```bash
   rm -rf /path/to/config/cache/*
   ```
3. Restart Cinephage

## Getting Help

If you cannot resolve the issue:

### Gather information

Before asking for help, collect:

1. **Cinephage version:**
   - Check **Settings > System**

2. **Docker version:**

   ```bash
   docker --version
   docker compose version
   ```

3. **Relevant logs:**

   ```bash
   docker compose logs cinephage --tail 100 > cinephage-logs.txt
   ```

4. **Configuration** (remove sensitive data):

   ```bash
   cat docker-compose.yaml
   ```

5. **System info:**
   ```bash
   uname -a
   free -h
   df -h
   ```

### Where to ask

1. **Discord** - [Join community](https://discord.gg/scGCBTSWEt)
   - Real-time chat support
   - Searchable history

2. **GitHub Issues** - [Report bugs](https://github.com/MoldyTaint/Cinephage/issues)
   - Bug reports
   - Feature requests
   - Include logs and reproduction steps

### Bug report template

```markdown
**Description:**
Clear description of the issue

**Steps to Reproduce:**

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Logs:**
```

Paste relevant logs here

```

**Environment:**
- Cinephage version:
- Docker version:
- Host OS:
- Browser:

**Additional Context:**
Any other relevant information
```

## Prevention

### Regular maintenance

- Check logs weekly for errors
- Monitor disk space
- Keep Cinephage updated
- Backup database regularly

### Monitoring

- Watch **Activity > History** for patterns
- Review **Settings > Logs** periodically
- Monitor system resources

### Best practices

- Use stable Docker tags (not `dev` in production)
- Keep configuration in version control
- Document custom settings
- Test changes in non-production first

## See Also

- [Getting Help](/getting-started/getting-help) - Support resources
- [FAQ](/support/faq) - Frequently asked questions
- [Performance Tuning](performance-tuning) - Optimization guide
- [Backup and Restore](backup-restore) - Data protection
