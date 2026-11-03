---
title: Workers and Tasks
description: Understanding Cinephage's background worker system and task processing
sidebar_position: 4
tags: [workers, tasks, background, explanation, architecture, concurrency]
keywords: [workers, tasks, background, concurrency, processing]
---

# Workers and tasks

This document explains Cinephage's worker-based architecture for background processing, task scheduling, and concurrent operations.

## Overview

Cinephage performs many operations in the background to keep the UI responsive and handle time-consuming tasks efficiently. This is accomplished through a worker-based task system.

### Why background processing?

Without background workers:
-  UI freezes during long operations
-  Only one task runs at a time
-  User must wait for completion
-  No automation possible

With background workers:
-  UI remains responsive
-  Multiple tasks run concurrently
-  Operations queue automatically
-  Full automation enabled

## Architecture

### Task queue system

Cinephage uses multiple specialized worker pools:

```
┌─────────────────────────────────────────────────────────────┐
│                     Task Queue System                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Import Queue │  │ Search Queue │  │ Stream Queue │      │
│  │              │  │              │  │              │      │
│  │ □ □ □ □ □    │  │ □ □ □        │  │ □ □ □ □      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                Worker Pool Manager                     │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│  │  │Worker 1 │ │Worker 2 │ │Worker 3 │ │Worker N │    │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   Database (SQLite)                    │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Worker pools

Cinephage maintains separate pools for different task types:

| Worker Pool | Purpose | Default Workers | Use Case |
|-------------|---------|-----------------|----------|
| **Import Workers** | File imports, moves, renames | 5 | Adding files to library |
| **Search Workers** | Indexer searches | 3 | Finding releases |
| **Stream Workers** | NZB streaming | 10 | Streaming from usenet |
| **Scan Workers** | Library scans | 2 | Detecting changes |
| **Monitoring Workers** | Automated tasks | 5 | Background monitoring |
| **Subtitle Workers** | Subtitle downloads | 3 | Fetching subtitles |
| **Portal Scan Workers** | Live TV portal scanning | 2 | Finding Live TV accounts |
| **Channel Sync Workers** | Live TV channel sync | 3 | Updating channel lists |

### Task lifecycle

A task goes through several states:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Pending  │───▶│ Queued   │───▶│ Running  │───▶│ Complete │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      │
                                      ▼
                               ┌──────────┐
                               │  Failed  │
                               └──────────┘
```

**States Explained:**

1. **Pending** - Task created but not yet submitted to queue
2. **Queued** - Task waiting for available worker
3. **Running** - Worker actively processing task
4. **Complete** - Task finished successfully
5. **Failed** - Task encountered an error

## Task Types

### Import tasks

Handle file operations:

**Operations:**
- Move files from download folder
- Copy files to library
- Create hardlinks/symlinks
- Rename files according to patterns
- Extract metadata
- Update database

**Duration:** 1-30 seconds per file depending on:
- File size (copy vs move)
- Network speed (if network storage)
- Disk I/O performance
- Number of files

### Search tasks

Query indexers for releases:

**Search Types:**
- **Missing Search** - Find items not yet downloaded
- **Cutoff Unmet** - Find upgrades below quality cutoff
- **Upgrade Search** - Find any better quality
- **Manual Search** - User-initiated search

**Duration:** 5-30 seconds depending on:
- Number of indexers
- Indexer response time
- Network latency
- Result parsing

### Streaming tasks

Manage NZB streaming:

**Operations:**
- Mount NZB virtual filesystem
- Fetch segments from usenet
- Cache segments locally
- Stream to player
- Handle player requests
- Cleanup old segments

**Duration:** Continuous while streaming

### Monitoring tasks

Automated, scheduled background operations. Each has its own configurable interval (with a default and a minimum):

**Task List:**
1. **Missing Content Search** - Find missing movies/episodes (default: daily)
2. **Upgrade Search** - Find better-quality releases for existing files (default: weekly)
3. **New Episode Check** - Search for recently aired episodes of monitored series (default: hourly)
4. **Cutoff Unmet Search** - Upgrade content below the quality profile cutoff (default: daily)
5. **Pending Release Processing** - Process releases waiting in the delay profile queue (default: every 15 minutes)
6. **Smart List Refresh** - Update dynamic Smart Lists (default: hourly)
7. **Missing Subtitles Search** - Download subtitles for files missing required languages (default: every 6 hours)
8. **Subtitle Upgrade Search** - Search for better-scoring subtitles (default: daily)
9. **Library Reconciliation** - Reconcile library/root-folder assignments and heal drift from external changes (default: every 6 hours)
10. **History Cleanup** - Purge old history entries per the retention setting (default: daily, not user-editable)
11. **Database Backup** - Back up the SQLite database (default: daily, not user-editable)

There is no separate "RSS sync" task - new releases are discovered by the scheduled search tasks above querying indexers directly, not by a distinct feed-polling task.

### Maintenance tasks

Manually-triggered operations (run on demand from Settings, not on a schedule):

**Operations:**
- **Library Scan** - Detect new/changed/deleted files across root folders
- **Update .strm URLs** - Rewrite `.strm` files after changing the server address, port, or domain
- **Reprobe .strm Media Info** - Refresh media info for existing `.strm` files
- **Metadata Refresh** - Update titles, overviews, posters, and other TMDB metadata
- **Regenerate Sidecar Files** - Rewrite `.nfo`/artwork sidecar files for the whole library (see [Sidecar Files](/guides/configure/system/sidecar-files))

## Worker Configuration

### Environment variables

Control worker pools via environment:

```yaml
# Docker Compose example
environment:
  # Import operations
  - WORKER_MAX_IMPORTS=5
  
  # Search operations  
  - WORKER_MAX_SEARCH=3
  
  # Streaming operations
  - WORKER_MAX_STREAMS=10
  
  # Library scanning
  - WORKER_MAX_SCANS=2
  
  # Background monitoring
  - WORKER_MAX_MONITORING=5
  
  # Subtitle operations
  - WORKER_MAX_SUBTITLE_SEARCH=3
  
  # Live TV operations
  - WORKER_MAX_PORTAL_SCANS=2
  - WORKER_MAX_CHANNEL_SYNCS=3
  
  # Maintenance
  - WORKER_CLEANUP_MS=1800000  # 30 minutes
  - WORKER_MAX_LOGS=1000        # Max log entries per worker
```

### Tuning guidelines

**Small Setup (1-2 users, < 1000 items):**
```yaml
WORKER_MAX_IMPORTS=3
WORKER_MAX_SEARCH=2
WORKER_MAX_STREAMS=5
WORKER_MAX_MONITORING=3
```

**Medium Setup (2-5 users, 1000-10000 items):**
```yaml
WORKER_MAX_IMPORTS=5
WORKER_MAX_SEARCH=3
WORKER_MAX_STREAMS=10
WORKER_MAX_MONITORING=5
```

**Large Setup (5+ users, 10000+ items):**
```yaml
WORKER_MAX_IMPORTS=10
WORKER_MAX_SEARCH=5
WORKER_MAX_STREAMS=20
WORKER_MAX_MONITORING=10
```

**Heavy NZB Streaming:**
```yaml
WORKER_MAX_STREAMS=20
WORKER_MAX_IMPORTS=8
```

:::warning[Resource Limits]
More workers consume more:
- **Memory** - Each worker uses 50-100MB RAM
- **CPU** - Concurrent processing
- **Database connections** - SQLite handles concurrency well but has limits
- **Network connections** - More indexers/API calls

Monitor resource usage when increasing workers.
:::

## Task Scheduling

### Monitoring tasks

Scheduled tasks run automatically:

```
┌─────────────────────────────────────────────────────────────┐
│                    Task Scheduler                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Task                    Interval    Next Run    Status     │
│  ─────────────────────────────────────────────────────────  │
│  Missing Content         Daily       14:30       Enabled    │
│  Cutoff Unmet            Daily       02:00       Enabled    │
│  Upgrade Search          Weekly      Sun 03:00   Enabled    │
│  New Episode Check       Hourly      12:45       Enabled    │
│  Pending Release         15 min      12:45       Enabled    │
│  Smart List Refresh      Hourly      15:00       Enabled    │
│  Missing Subtitles       6 hours     14:45       Enabled    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Configuring intervals

**Access Settings:**
```
**Settings > Monitoring > Tasks**
```

**Adjust Intervals:**
1. Click on task
2. Adjust slider or enter value
3. Choose unit (minutes, hours, days)
4. Click Save

**Recommended Intervals:**

Cinephage's defaults are shown in the middle column; the minimum allowed interval for most tasks is 15 minutes.

| Task | Conservative | Default | Aggressive |
|------|--------------|---------|------------|
| Missing Content | Every 2-3 days | Daily | Every 6 hours |
| Cutoff Unmet | Every 2-3 days | Daily | Every 6 hours |
| Upgrade Search | Monthly | Weekly | Daily |
| New Episode Check | Every 6 hours | Hourly | Every 15 min |
| Pending Release Processing | 1 hour | 15 min | 15 min (minimum) |
| Smart List Refresh | 6 hours | Hourly | Every 15 min |
| Missing Subtitles Search | Daily | Every 6 hours | Hourly |

:::tip[Rate Limiting]
More frequent tasks may hit indexer rate limits. Start conservative.
:::

### Task history

View task execution history:

```
**Settings > Monitoring > Tasks** > History
```

**History Shows:**
- Execution time
- Success/failure status
- Items processed
- Duration
- Error messages (if failed)

## Monitoring Workers

### Worker status

Check worker health:

```
**Settings > System > Workers**
```

**Status Indicators:**

| Status | Meaning | Action |
|--------|---------|--------|
| **Idle** | Worker waiting for tasks | Normal |
| **Busy** | Worker processing task | Normal |
| **Error** | Worker encountered error | Check logs |
| **Stalled** | Worker not responding | Restart Cinephage |

### Queue depth

Monitor task queues:

**Deep Queues Indicate:**
- More workers needed
- Tasks taking too long
- Resource constraints

**Solutions:**
1. Increase worker count
2. Check for stuck tasks
3. Review resource usage
4. Restart Cinephage

### Logs

View worker activity:

```bash
# Docker
docker logs cinephage | grep -i worker

# Native
tail -f /path/to/logs/cinephage.log | grep -i worker
```

**Log Information:**
- Task start/stop times
- Worker assignments
- Processing duration
- Errors and stack traces

## Task Execution Flow

### Example: import task

```
1. User clicks "Import" on movie
         ↓
2. Import task created
         ↓
3. Task queued in Import Queue
         ↓
4. Import Worker picks up task
         ↓
5. Worker performs operations:
   - Validate source file
   - Apply naming pattern
   - Copy/move/hardlink file
   - Extract metadata
   - Update database
   - Notify UI
         ↓
6. Task marked Complete
         ↓
7. UI updates automatically
```

### Example: search task

```
1. Missing Content Search task starts
         ↓
2. Query database for missing items
         ↓
3. For each missing item:
   a. Send to Search Queue
   b. Search Worker queries indexers
   c. Parse and score results
   d. Select best release
   e. Send to download client
         ↓
4. Task completes
         ↓
5. Next task scheduled
```

## Error Handling

### Task failures

When a task fails:

1. **Error logged** with details
2. **Task marked** as Failed
3. **Retry logic** may apply
4. **User notified** (if applicable)

**Automatic Retry:**

Some tasks retry automatically:
- Download failures (3 attempts)
- Import failures (2 attempts)
- Network timeouts (2 attempts)

**Manual Retry:**

Failed tasks can be retried:
```
Activity > History > Failed Items > Retry
```

### Common failures

| Failure | Cause | Solution |
|---------|-------|----------|
| **Import Failed** | Permissions, locked file | Check permissions, retry |
| **Search Failed** | Indexer down, rate limit | Wait, check indexer health |
| **Stream Failed** | Missing segments, timeout | Try different NZB, increase timeout |
| **Scan Failed** | Path not found | Check root folder path |

## Performance Considerations

### Concurrency limits

SQLite handles concurrency well but has limits:

- **Readers** - Multiple simultaneous reads (no limit)
- **Writers** - One writer at a time per database

**Impact:**
- Import tasks may queue behind each other
- UI reads don't block on writes
- Long transactions block other writes

### Memory usage

Each worker consumes memory:

| Worker Type | Memory per Worker | 10 Workers |
|-------------|-------------------|------------|
| Import | 50-100 MB | 500-1000 MB |
| Search | 30-50 MB | 300-500 MB |
| Stream | 100-200 MB | 1000-2000 MB |
| Monitoring | 40-60 MB | 400-600 MB |

**Total Estimate:**
- Base Cinephage: 200-500 MB
- Workers: 2-4 GB (depending on configuration)
- Cache: Configurable (10-50 GB disk)

### CPU usage

Workers use CPU when active:

- **Import** - High CPU during file operations
- **Search** - Medium CPU during parsing
- **Stream** - Low CPU (mostly I/O wait)
- **Monitoring** - Variable based on task

**Tuning:**
- Match worker count to CPU cores
- Leave headroom for UI and other processes
- Monitor CPU usage during peak times

## Best Practices

### Worker configuration

1. **Start Conservative:**
   - Use default worker counts
   - Monitor performance
   - Scale up gradually

2. **Match Hardware:**
   - More RAM = more workers
   - More CPU cores = more workers
   - SSD storage = faster task completion

3. **Monitor Resources:**
   - Watch memory usage
   - Check CPU load
   - Monitor queue depths

### Task scheduling

1. **Spread Tasks Out:**
   - Don't schedule all tasks at once
   - Stagger start times
   - Avoid peak usage times

2. **Adjust for Usage:**
   - More frequent during active hours
   - Less frequent overnight
   - Pause during maintenance

3. **Watch Rate Limits:**
   - Indexers have limits
   - TMDB has limits
   - Don't exceed quotas

### Troubleshooting

1. **Stuck Workers:**
   ```bash
   # Restart Cinephage
   docker restart cinephage
   ```

2. **Queue Backlog:**
   - Increase worker count
   - Check for stuck tasks
   - Review task logs

3. **High Resource Usage:**
   - Reduce worker counts
   - Increase task intervals
   - Optimize database

## Advanced Topics

### Custom workers

Developers can add custom worker types:

```typescript
// Worker definition
interface Worker {
  name: string;
  maxConcurrent: number;
  process(task: Task): Promise<void>;
}

// Task definition
interface Task {
  id: string;
  type: string;
  data: unknown;
  priority: number;
}
```

### Worker scaling

For high-load scenarios:

**Vertical Scaling:**
- More workers on same instance
- Better hardware (CPU/RAM)
- Optimized database

**Horizontal Scaling (Advanced):**
- Multiple Cinephage instances
- Shared database (SQLite has limitations)
- Load balancer distribution
- Not officially supported

### Monitoring integration

Export worker metrics:

```yaml
environment:
  - METRICS_ENABLED=true
  - METRICS_PORT=9090
```

**Metrics Available:**
- Queue depths
- Worker utilization
- Task duration
- Error rates
- Processing throughput

## See Also

- [Performance Tuning](/guides/deploy/performance-tuning) - Optimize worker performance
- [Environment Variables](/reference/configuration/environment-variables) - All configuration options
- [Architecture](architecture) - System architecture overview
- [Settings Explained](/reference/configuration/settings-explained) - UI settings reference
