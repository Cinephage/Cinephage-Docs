---
title: Performance Tuning
description: Optimize Cinephage for your hardware, usage patterns, and deployment scenario
sidebar_position: 3
tags: [performance, tuning, optimization, guide, scaling, workers]
keywords: [performance, tuning, optimization, scaling]
---

# Performance tuning

This guide covers optimizing Cinephage performance for your specific hardware, usage patterns, and deployment scenario.

## Overview

Cinephage is designed to work well on modest hardware, but performance tuning can significantly improve the experience for:

- Large media libraries (10,000+ items)
- Multiple concurrent users
- Heavy automation (many monitoring tasks)
- High-frequency operations (frequent searches, imports)

## System Requirements vs. Performance

### Minimum requirements

- **CPU:** 2 cores
- **RAM:** 2 GB
- **Disk:** 10 GB for application + media storage
- **Network:** 10 Mbps

### Recommended for performance

- **CPU:** 4+ cores
- **RAM:** 4-8 GB
- **Disk:** SSD for database and cache
- **Network:** 100+ Mbps

## Worker Configuration

Workers handle background tasks. Proper configuration is crucial for performance.

### Understanding workers

Cinephage uses multiple worker pools:

| Worker Type | Purpose | Default |
|-------------|---------|---------|
| **Stream Workers** | NZB streaming | 10 |
| **Import Workers** | File imports | 5 |
| **Scan Workers** | Library scans | 2 |
| **Monitoring Workers** | Automated tasks | 5 |
| **Search Workers** | Indexer searches | 3 |
| **Subtitle Workers** | Subtitle downloads | 3 |
| **Portal Scan Workers** | Live TV portal scanning | 2 |
| **Channel Sync Workers** | Live TV channel sync | 3 |

### Configuring workers

Set via environment variables:

```yaml
environment:
  - WORKER_MAX_STREAMS=16
  - WORKER_MAX_IMPORTS=10
  - WORKER_MAX_SCANS=4
  - WORKER_MAX_MONITORING=8
  - WORKER_MAX_SEARCH=5
  - WORKER_MAX_SUBTITLE_SEARCH=5
  - WORKER_MAX_PORTAL_SCANS=3
  - WORKER_MAX_CHANNEL_SYNCS=4
```

### Worker tuning guidelines

**For Small Libraries (< 1,000 items):**
```yaml
WORKER_MAX_IMPORTS=3
WORKER_MAX_SCANS=2
WORKER_MAX_MONITORING=3
```

**For Medium Libraries (1,000-10,000 items):**
```yaml
WORKER_MAX_IMPORTS=5
WORKER_MAX_SCANS=3
WORKER_MAX_MONITORING=5
```

**For Large Libraries (10,000+ items):**
```yaml
WORKER_MAX_IMPORTS=10
WORKER_MAX_SCANS=5
WORKER_MAX_MONITORING=10
```

**For Heavy NZB Streaming:**
```yaml
WORKER_MAX_STREAMS=20
WORKER_MAX_IMPORTS=8
```

:::warning[Don't Over-allocate]
More workers isn't always better. Too many workers can:
- Exhaust system memory
- Cause database contention
- Hit indexer rate limits
- Degrade overall performance
:::

## Database Optimization

### Database location

Default location:
```
data/cinephage.db
```

**Docker:**
```
/config/data/cinephage.db
```

### Storage recommendations

| Storage Type | Performance | Recommendation |
|--------------|-------------|----------------|
| **SSD** | Excellent |  Highly recommended |
| **HDD** | Good |  Acceptable for small libraries |
| **Network Storage** | Poor |  Avoid for database |

:::tip[SSD for Database]
Place the database on SSD storage if possible. It significantly improves:
- Search performance
- Import speed
- UI responsiveness
- Task execution
:::

### Database maintenance

#### Automatic Maintenance

Cinephage performs automatic maintenance:
- Cleanup of old logs and history
- Index optimization
- Temporary file cleanup

#### Manual Optimization

The Cinephage Docker image does not include the `sqlite3` CLI, so `docker exec cinephage sqlite3
...` will not work. To run manual `VACUUM`/`ANALYZE`/`REINDEX` statements, stop Cinephage first
(so nothing is writing to the database), then run `sqlite3` either from a native/bare-metal
install, or against a copy of the file on the host using your own local `sqlite3` installation:

```bash
# Stop Cinephage first
docker compose down

# Then, using sqlite3 installed on the host, against the mounted volume
sqlite3 /path/to/cinephage/config/data/cinephage.db "VACUUM;"
sqlite3 /path/to/cinephage/config/data/cinephage.db "ANALYZE;"
sqlite3 /path/to/cinephage/config/data/cinephage.db "REINDEX;"

# Restart
docker compose up -d
```

:::caution[Backup First]
Always back up your database before manual maintenance operations - see [Backup & Restore](backup-restore).
:::

### Database size management

Monitor database growth:

```bash
# Check database size
ls -lh /path/to/cinephage/config/data/cinephage.db
```

**Prune Old Data:**

Cinephage automatically prunes old data on a schedule; the retention windows you can actually
tune are:

- **Log file retention** - under **Settings > Monitoring > Logs** (default: 7 days)
- **Task history retention** - automatically purged after 30 days by the built-in History Cleanup
  scheduled task (not currently user-configurable in the UI)

## Memory Optimization

### Memory usage patterns

Cinephage memory usage by component:

| Component | Typical Usage | Peak Usage |
|-----------|---------------|------------|
| **Application** | 200-500 MB | 1 GB |
| **Workers** | 50-100 MB per worker | Depends on config |
| **NZB Cache** | Configurable (10-50 GB disk) | - |
| **Database Cache** | Automatic (SQLite) | - |
| **Streaming Buffers** | 100-500 MB | 1-2 GB |

### Reducing memory usage

**For Low-Memory Systems (2-4 GB):**

1. **Reduce Workers:**
   ```yaml
   WORKER_MAX_STREAMS=5
   WORKER_MAX_IMPORTS=2
   WORKER_MAX_SCANS=1
   WORKER_MAX_MONITORING=2
   ```

2. **Reduce Task Frequency:**
   Under **Settings > Monitoring > Tasks**, increase the interval for scheduled search tasks
   (e.g. Missing Content Search, Upgrade Search) - each task's interval is user-configurable down
   to a 15-minute minimum, so raising it on a low-memory system reduces background load.

4. **Disable Unused Features:**
   - Live TV (if not using)
   - NZB Streaming (if not using)
   - Notifications (if not using)

### Memory monitoring

**Docker:**

```bash
# Monitor container memory
docker stats cinephage

# Check for OOM kills
docker inspect cinephage | grep -i oom
```

**Native:**

```bash
# Monitor process memory
ps aux | grep cinephage

# Or use htop/top
htop
```

Cinephage does not currently have an in-app memory/uptime dashboard; use `docker stats` or the
host OS tools above.

## Search Performance

### Indexer optimization

**Limit Concurrent Indexers:**

Too many indexers slow searches:

```
Recommended: 3-5 active indexers
Maximum: 10 indexers
```

**Indexer Priority:**

Set priority to search fastest indexers first:

```
Indexer 1: Priority 1 (fastest)
Indexer 2: Priority 5
Indexer 3: Priority 10 (slowest)
```

**Disable Slow Indexers:**

If an indexer consistently times out:
1. Lower its priority
2. Or disable it temporarily
3. Re-enable after indexer issues resolve

### Search frequency

**Task Intervals:**

Adjust based on your needs:

| Task | Conservative | Cinephage default | Aggressive (min. 15 min) |
|------|--------------|--------------------|----------------------------|
| **New Episode Check** | 6 hours | 1 hour | 15 min |
| **Missing Content Search** | 48 hours | 24 hours (daily) | 1 hour |
| **Cutoff Unmet Search** | 48 hours | 24 hours (daily) | Every 6 hours |
| **Upgrade Search** | Weekly | Weekly (168h) | Daily |

These are configured per-task under **Settings > Monitoring > Tasks**.

:::tip[Aggressive Searching]
More frequent searches use more resources and hit indexer rate limits. Start conservative.
:::

### Caching search results

Cinephage caches indexer search results in memory to avoid redundant API calls:

- **Cache Duration:** 5 minutes by default (per-search TTL)
- **Cache Size:** Capped at 500 entries (LRU eviction)
- **Benefit:** Faster repeated searches

This cache is in-memory only and clears automatically on restart; there is no dedicated "clear
cache" button in the UI for it.

## Library Scan Performance

### Initial library scan

First scan of a large library is resource-intensive:

**Expectations:**
- 1,000 movies: 10-30 minutes
- 10,000 movies: 2-6 hours
- 50,000 movies: 12-24 hours

**Optimization Tips:**

1. **Scan During Off-Hours:**
   - Schedule initial scan overnight
   - Reduces impact on other operations

2. **Break Into Batches:**
   - Import 1,000 items at a time
   - Verify success before next batch
   - Reduces memory pressure

3. **Pre-organize Files:**
   - Ensure good file naming before import
   - Reduces parsing time
   - Fewer manual corrections needed

### Ongoing library scans

After initial import, scans are faster:

- **Interval:** Configurable (default: 24 hours)
- **Duration:** 1-5 minutes for medium libraries
- **Impact:** Minimal

**Optimize Ongoing Scans:**

Set the scan interval per library under **Settings > Library > Libraries** (edit a library, "Scan
Interval" field).

## Network Optimization

### Bandwidth management

**For Limited Bandwidth:**

1. **Reduce Concurrent Downloads:**
   - Limit download client connections
   - Queue downloads instead of parallel

2. **Adjust Quality Profiles:**
   - Prefer smaller file sizes
   - Use Compact or Balanced profiles

3. **Limit NZB Streaming:**
   - Lower streaming quality
   - Reduce connections
   - Disable prefetch

**For High Bandwidth:**

1. **Increase Workers:**
   - More parallel operations
   - Faster imports
   - Better streaming performance

2. **Enable Prefetch:**
   - NZB streaming downloads ahead
   - Smoother playback
   - Uses more bandwidth

### Latency optimization

**Reduce API Latency:**

1. **Use Local DNS:**
   - Configure local DNS resolver
   - Reduces lookup time

2. **Geographic Proximity:**
   - Use indexers close to your location
   - Reduces round-trip time

3. **Connection Pooling:**
   - Keep connections alive
   - Reduces connection overhead

## Docker-Specific Optimization

### Volume mounts

**Optimal Configuration:**

```yaml
volumes:
  # Config (database, settings)
  - ./config:/config  # SSD recommended
  
  # Media (large storage)
  - /mnt/media:/media  # HDD acceptable
  
  # Downloads
  - /mnt/downloads:/downloads  # Temporary storage
```

**Performance Tips:**

1. **Separate Config from Media:**
   - Config on fast storage (SSD)
   - Media on bulk storage (HDD)

2. **Use Bind Mounts:**
   - Better performance than volumes
   - Direct filesystem access

3. **Avoid Network Mounts for Config:**
   - Database needs local storage
   - Network latency kills performance

### Resource limits

Set Docker resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
    reservations:
      cpus: '0.5'
      memory: 1G
```

:::tip[Prevent Resource Exhaustion]
Resource limits prevent Cinephage from consuming all system resources, ensuring stability.
:::

### Container optimization

**Base Image:**

Cinephage uses `node:24-trixie-slim` (Debian-based):
- Good balance of features and size
- Required for Camoufox browser support

**Reduce Container Size:**

```dockerfile
# Multi-stage build already optimized
# Don't modify base image
```

## Monitoring Performance

### Built-in monitoring

**System Status:**

**Settings > Monitoring > Storage Maintenance** shows storage/reconciliation-related maintenance
info, and **Settings > Monitoring > Tasks** lists every scheduled and maintenance task with its
last run time, next run time, and running/enabled state - click into a task's history to see
per-run status (completed/failed/cancelled) and per-item results. Cinephage does not currently
expose an in-app memory usage, uptime, or worker-queue-depth dashboard; use `docker stats` and the
host OS tools described above for that.

### Log analysis

Set the log level with the `LOG_LEVEL` environment variable (e.g. `LOG_LEVEL=debug`); there is no
separate `LOG_PERFORMANCE` variable. Log retention is configured under **Settings > Monitoring >
Logs**.

Logs are written as JSON Lines, one file per day, at `<DATA_DIR>/logs/app-YYYY-MM-DD.jsonl`
(`/config/data/logs/app-YYYY-MM-DD.jsonl` in Docker) - not a single `cinephage.log` file:

```bash
# Docker
docker exec cinephage grep -i "worker" /config/data/logs/app-$(date +%Y-%m-%d).jsonl

# Native
grep -i "worker" data/logs/app-$(date +%Y-%m-%d).jsonl
```

Recent logs are also viewable and searchable in the UI under **Settings > Monitoring > Logs**.

### External monitoring

Cinephage does not currently expose a Prometheus/metrics endpoint. There is no `METRICS_ENABLED`
or `METRICS_PORT` environment variable.

## Troubleshooting Performance Issues

### Slow UI response

**Symptoms:**
- Pages take >5 seconds to load
- Search results slow
- Dashboard unresponsive

**Solutions:**

1. **Check Database:**
   ```bash
   # Database size
   ls -lh /path/to/cinephage/config/data/cinephage.db

   # If >1GB, stop Cinephage and run VACUUM with a local sqlite3 install
   # (the sqlite3 CLI is not bundled in the Cinephage container - see Database Optimization above)
   ```

2. **Check Memory:**
   ```bash
   # Free memory
   free -h
   
   # If low, reduce workers
   ```

3. **Check CPU:**
   ```bash
   # CPU usage
   top
   
   # If pegged, tasks running
   ```

### High memory usage

**Symptoms:**
- Container uses >4GB RAM
- System swapping
- OOM kills

**Solutions:**

1. **Reduce Workers:**
   ```yaml
   WORKER_MAX_STREAMS=5
   WORKER_MAX_IMPORTS=2
   WORKER_MAX_MONITORING=3
   ```

2. **Manage the Streaming Extraction Cache:**
   The NZB/usenet streaming extraction cache lives under **Settings > Integrations > Streaming**.
   It shows cached file count/size and lets you manually clean up expired files; the retention
   period is currently fixed (48 hours by default) and not user-adjustable in the UI.

3. **Restart Container:**
   ```bash
   docker restart cinephage
   ```

### Slow imports

**Symptoms:**
- Imports take >10 minutes
- Queue backing up
- Files not moving

**Solutions:**

1. **Check Disk I/O:**
   ```bash
   # Disk usage
   iostat -x 1
   
   # If high, storage bottleneck
   ```

2. **Increase Import Workers:**
   ```yaml
   WORKER_MAX_IMPORTS=10
   ```

3. **Use Hardlinks:**
   - Faster than copy/move
   - No data duplication
   - Same filesystem only

4. **Check Network Storage:**
   - Network mounts are slow
   - Use local storage for active operations

### Search timeouts

**Symptoms:**
- Searches take >60 seconds
- Indexer timeout errors
- No results returned

**Solutions:**

1. **Reduce Indexers:**
   - Use 3-5 fast indexers
   - Disable slow/unreliable ones

2. **Check Individual Indexer Health:**
   Cinephage does not currently expose a per-indexer or global search timeout setting in the UI.
   If a specific indexer is consistently slow or timing out, disable it or lower its priority
   under **Settings > Integrations > Indexers**.

3. **Check Network:**
   ```bash
   # Test indexer connectivity
   curl -I https://indexer.example.com
   ```

## Best Practices

### General recommendations

1. **Start Conservative:**
   - Use default worker counts
   - Monitor performance
   - Scale up gradually

2. **Monitor Regularly:**
   - Check performance weekly
   - Review logs for issues
   - Adjust as library grows

3. **Optimize Incrementally:**
   - Change one setting at a time
   - Measure impact
   - Document what works

### Hardware-Specific guidelines

**Raspberry Pi / Low-Power:**
- Workers: 1-2 each
- Cache: 2-5 GB
- Tasks: Conservative intervals
- Disable NZB streaming

**NAS / Home Server:**
- Workers: 3-5 each
- Cache: 10-20 GB
- SSD for database
- Balanced configuration

**Dedicated Server:**
- Workers: 5-10 each
- Cache: 20-50 GB
- Full SSD storage
- Aggressive configuration

**VPS / Cloud:**
- Workers: Match CPU cores
- Cache: Limited by disk
- Monitor bandwidth costs
- Disable heavy features

## See Also

- [Troubleshooting](troubleshooting) - Common issues and solutions
- [Environment Variables](/reference/configuration/environment-variables) - All configuration options
- [Settings Explained](/reference/configuration/settings-explained) - UI settings reference
- [Backup and Restore](backup-restore) - Protect your optimized setup
