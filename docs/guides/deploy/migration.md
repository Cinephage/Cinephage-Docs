---
title: Migration Guide
description: Upgrade from older Cinephage versions with breaking changes and volume mount updates
sidebar_position: 4
tags: [migration, upgrade, deployment, guide]
keywords: [migration, upgrade, volume mounts, breaking changes]
---

# Migration guide

This guide covers upgrading from older Cinephage versions with breaking changes.

Current deployment tags:

- `latest` = stable
- `dev` = preview
- `vX.Y.Z` = pinned stable release

---

## BETTER_AUTH_SECRET Migration

**Applies to:** Only users running a pre-release `dev` build from before the first public release
(`v0.1.0`, April 2026). Every tagged release from **v0.1.0 onward already requires
`BETTER_AUTH_SECRET`** as an environment variable with no file-based fallback, so if you installed
any official versioned release you do not need this migration.

This section is kept for the rare case of migrating a very old pre-`v0.1.0` development install
that relied on an auto-generated `.auth-secret` file with no `BETTER_AUTH_SECRET` env var set.

### What changed

- `BETTER_AUTH_SECRET` must be set as an environment variable
- The `.auth-secret` file is no longer read on startup
- Without this migration, all sessions and encrypted API keys will be lost

### Migration steps

**Step 1:** Locate your existing secret

```bash
# If running in Docker
docker exec cinephage cat /config/data/.auth-secret

# If running bare metal
cat /path/to/cinephage/data/.auth-secret
```

**Step 2:** Add to your environment

Add the secret to your `docker-compose.yaml` or `.env` file:

```yaml
environment:
  - BETTER_AUTH_SECRET=your-existing-secret-here
```

**Step 3:** Verify the secret is set

```bash
# Check it's in the environment
docker exec cinephage env | grep BETTER_AUTH_SECRET
```

**Step 4:** Restart Cinephage

```bash
docker compose up -d
```

**Step 5:** Verify sessions work

1. Log in to Cinephage
2. Check that existing API keys still work
3. If issues arise, you may need to regenerate API keys in **Settings > System**

### What if I don't have the old secret?

If you cannot retrieve the old secret:

1. Set a **new** `BETTER_AUTH_SECRET`
2. Restart Cinephage
3. All users will need to log in again
4. All API keys must be regenerated in **Settings > System**
5. Update any external services using old API keys

---

## Volume Mount Migration (/app/data → /config)

**Applies to:** Only users running a pre-release `dev` build from before the first public release
(`v0.1.0`, April 2026) that used an `/app/data` mount. Every tagged release from **v0.1.0 onward
already uses the `/config` volume layout**, so most users will never need this. The container
entrypoint still contains the automatic migration logic described below, for anyone coming from a
very old pre-`v0.1.0` install.

### Why this change?

The `/config` consolidation:

- Prevents accidentally overwriting application code by mounting `/app`
- Simplifies volume management and keeps app state under a single root
- Aligns with Docker best practices
- Reduces risk of permission issues

### Migration path

#### Option 1: Automatic Migration (Recommended)

The container entrypoint automatically detects and migrates your data.

**Step 1:** Update `docker-compose.yaml`

Add the `/config` mount **while keeping** the old data mount temporarily:

```yaml
services:
  cinephage:
    image: ghcr.io/cinephage/cinephage:latest
    container_name: cinephage
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - '3000:3000'
    environment:
      - PUID=1000 # Your user ID (run: id -u)
      - PGID=1000 # Your group ID (run: id -g)
      - TZ=UTC # Your timezone
      - ORIGIN=http://localhost:3000 # Trusted app origin / CSRF origin
      - BETTER_AUTH_URL=http://localhost:3000 # Auth callback/redirect base URL
    volumes:
      - ./config:/config # NEW: Add this line
      - ./data:/app/data # KEEP temporarily for migration
      - /path/to/media:/media # REQUIRED: Your media library
      - /path/to/downloads:/downloads # REQUIRED: Download client output folder
```

**Step 2:** Start the container

```bash
docker compose up -d
```

The entrypoint will detect both old and new mounts and automatically copy your data:

```
Migrating data from /app/data to /config/data...
```

**Step 3:** Verify migration

Check the logs to ensure success:

```bash
docker compose logs cinephage | grep -i "migrat"
```

Verify your data is present:

```bash
# Check database
ls -lh ./config/data/cinephage.db

# Check indexer definitions
ls -lh ./config/data/indexers/definitions/
```

**Step 4:** Remove old mounts

Once verified, update `docker-compose.yaml` to remove the legacy data mount:

```yaml
services:
  cinephage:
    image: ghcr.io/cinephage/cinephage:latest
    container_name: cinephage
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - '3000:3000'
    environment:
      - PUID=1000 # Your user ID (run: id -u)
      - PGID=1000 # Your group ID (run: id -g)
      - TZ=UTC # Your timezone
      - ORIGIN=http://localhost:3000 # Trusted app origin / CSRF origin
      - BETTER_AUTH_URL=http://localhost:3000 # Auth callback/redirect base URL
    volumes:
      - ./config:/config # Keep only this
      - /path/to/media:/media # REQUIRED: Your media library
      - /path/to/downloads:/downloads # REQUIRED: Download client output folder
```

**Step 5:** Restart

```bash
docker compose up -d
```

**Step 6:** (Optional) Clean up old directories

After confirming everything works:

```bash
# Backup first (just in case)
tar -czf cinephage-legacy-backup-$(date +%Y%m%d).tar.gz ./data ./logs

# Then remove
rm -rf ./data ./logs
```

---

#### Option 2: Automatic Migration with Permission Fix

If the automatic migration fails with permission errors, you need to run as root temporarily.

**Symptoms:**

- Log shows: `ERROR: Failed to migrate data to /config/data`
- Permission denied errors during migration

**Solution:**

**Step 1:** Modify `docker-compose.yaml` to run as root temporarily:

```yaml
services:
  cinephage:
    image: ghcr.io/cinephage/cinephage:latest
    container_name: cinephage
    restart: unless-stopped
    user: '0:0' # Temporarily run as root
    security_opt:
      - no-new-privileges:true
    ports:
      - '3000:3000'
    environment:
      - PUID=1000 # Your user ID (run: id -u)
      - PGID=1000 # Your group ID (run: id -g)
      - TZ=UTC # Your timezone
      - ORIGIN=http://localhost:3000 # Trusted app origin / CSRF origin
      - BETTER_AUTH_URL=http://localhost:3000 # Auth callback/redirect base URL
    volumes:
      - ./config:/config
      - ./data:/app/data # Keep for migration
      - /path/to/media:/media # REQUIRED: Your media library
      - /path/to/downloads:/downloads # REQUIRED: Download client output folder
```

**Step 2:** Start and verify migration:

```bash
docker compose up -d
docker compose logs cinephage | grep -i "migrat"
```

**Step 3:** Revert to normal user mode:

Remove the `user: '0:0'` line from docker-compose.yaml (container now starts as root, entrypoint drops to PUID/PGID):

```yaml
services:
  cinephage:
    image: ghcr.io/cinephage/cinephage:latest
    container_name: cinephage
    restart: unless-stopped
    # user line removed - entrypoint handles privilege dropping
    security_opt:
      - no-new-privileges:true
    ports:
      - '3000:3000'
    environment:
      - PUID=1000 # Your user ID (run: id -u)
      - PGID=1000 # Your group ID (run: id -g)
      - TZ=UTC # Your timezone
      - ORIGIN=http://localhost:3000 # Trusted app origin / CSRF origin
      - BETTER_AUTH_URL=http://localhost:3000 # Auth callback/redirect base URL
    volumes:
      - ./config:/config
      - /path/to/media:/media # REQUIRED: Your media library
      - /path/to/downloads:/downloads # REQUIRED: Download client output folder
```

**Step 4:** Remove old mounts and restart:

```bash
docker compose up -d
```

---

#### Option 3: Manual Migration

If you prefer to migrate manually or automatic migration doesn't work:

**Step 1:** Stop the container:

```bash
docker compose down
```

**Step 2:** Create config directory and copy data:

```bash
mkdir -p ./config/data
cp -a ./data/. ./config/data/
```

**Step 3:** Fix ownership (replace with your actual UID:GID):

```bash
# Find your IDs
id -u  # Your UID
id -g  # Your GID

# Set ownership
sudo chown -R $(id -u):$(id -g) ./config
```

**Step 4:** Update `docker-compose.yaml`:

```yaml
services:
  cinephage:
    image: ghcr.io/cinephage/cinephage:latest
    container_name: cinephage
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - '3000:3000'
    environment:
      - PUID=1000 # Your user ID (run: id -u)
      - PGID=1000 # Your group ID (run: id -g)
      - TZ=UTC # Your timezone
      - ORIGIN=http://localhost:3000 # Trusted app origin / CSRF origin
      - BETTER_AUTH_URL=http://localhost:3000 # Auth callback/redirect base URL
    volumes:
      - ./config:/config
      - /path/to/media:/media # REQUIRED: Your media library
      - /path/to/downloads:/downloads # REQUIRED: Download client output folder
```

**Step 5:** Start container:

```bash
docker compose up -d
```

---

### Troubleshooting migration

#### Migration doesn't run

**Symptom:** No migration messages in logs

**Cause:** Entrypoint doesn't detect old mounts

**Solution:** Ensure old mounts are present in `docker-compose.yaml` and actually mounted:

```bash
# Check if mounts are active
docker inspect cinephage | grep -A 10 Mounts
```

#### Permission denied during migration

**Symptom:** `ERROR: Failed to migrate data to /config/data`

**Cause:** Container user can't read old data or write to `/config`

**Solution:** Use [Option 2](#option-2-automatic-migration-with-permission-fix) to run as root with PUID/PGID.

#### Data in wrong location after migration

**Symptom:** Database or indexers not found

**Cause:** Data copied to wrong subdirectory

**Solution:** Verify structure:

```bash
# Should look like this:
./config/
├── data/
│   ├── cinephage.db
│   ├── indexers/
│   │   └── definitions/
│   ├── logs/
│   ├── channel-logos/
│   ├── external-lists/
│   └── backups/
└── cache/
```

If structure is wrong, stop container and manually reorganize:

```bash
docker compose down
# Fix structure
mv ./config/data/data/* ./config/data/
rmdir ./config/data/data
# Restart
docker compose up -d
```

---

## Task System Migration (Monitoring → Tasks)

**Applies to:** Users upgrading from v0.13.0 or earlier, which had a separate Monitoring page

### What changed

- **Monitoring settings page removed** - All monitoring configuration consolidated into **Settings > Monitoring > Tasks**
- **Unified task registry** - Centralized task definitions with consistent configuration
- **Task execution history** - All tasks now record detailed per-item activity
- **Automatic history cleanup** - Old history entries automatically removed after 30 days

### Task frequency changes

| Task | Old Location | Old Frequency | New Frequency |
|------|--------------|---------------|---------------|
| CutoffUnmet | Monitoring | As configured | Daily |
| Upgrade | Monitoring | As configured | Weekly |
| MissingSubtitles | - | - | Every 6 hours (new) |
| SubtitleUpgrade | - | - | Daily (new) |

### Migration steps

**Step 1:** Review your task settings:

1. Go to **Settings > Monitoring > Tasks**
2. Check all enabled tasks and their intervals
3. Adjust frequencies as needed for your use case

**Step 2:** Enable new subtitle tasks (if using subtitles):

- **Missing Subtitles** - Automatically finds missing subtitle languages
- **Subtitle Upgrade** - Searches for better subtitle matches when allowed

**Step 3:** Monitor task history:

1. Go to **Settings > Monitoring > Tasks**
2. Click **View History** on any task
3. See detailed per-item execution records

### Removed features

- Individual monitoring task pages
- BROWSER_SOLVER_* environment variables
- Old monitoring configuration storage

---

## Alpine to Debian Image Migration

**Applies to:** Only users running a pre-release `dev` build from before the first public release
(`v0.1.0`, April 2026) that still used the old Alpine-based image. Every tagged release from
**v0.1.0 onward already ships the Debian-based (`node:24-trixie-slim`) image** with Camoufox
support, so most users will never need this.

### What changed

- Base image: `node:22-alpine` -> `node:24-trixie-slim` (Debian)
- New feature: Camoufox browser support for Cloudflare bypass

### Migration steps

**Step 1:** Pull new image:

```bash
docker compose pull
```

**Step 2:** Recreate container:

```bash
docker compose up -d --force-recreate
```

**Step 3:** First startup downloads Camoufox:

```bash
docker compose logs -f cinephage
```

You'll see: `Downloading Camoufox (first run only; large download, may take several minutes)...`

**Step 4:** Remove old environment variable:

If you have `BROWSER_SOLVER_ENABLED` in your `.env`, remove it (no longer used).

**Step 5:** Configure Captcha Solver:

1. Open Cinephage UI
2. Go to **Settings > System > Captcha Solver**
3. Enable and configure as needed

### Troubleshooting

#### Image pull fails

```bash
# Try with explicit tag
docker pull ghcr.io/cinephage/cinephage:latest

# Or build locally
git clone https://github.com/cinephage/cinephage.git
cd cinephage
docker compose build
```

#### Camoufox download fails

**Symptom:** `Warning: Failed to download Camoufox. Captcha solving will be unavailable.`

**Cause:** Network issues or permission problems

**Solution:**

```bash
# Check container logs for details
docker compose logs cinephage | grep -i camoufox

# Verify cache directory permissions
docker exec cinephage ls -la /config/cache

# If permission issue, recreate with user 0:0 and PUID/PGID
```

---

## Rolling Back

If you need to revert to an older version:

**Step 1:** Stop current container:

```bash
docker compose down
```

**Step 2:** Backup current data:

```bash
tar -czf cinephage-backup-$(date +%Y%m%d).tar.gz ./config
```

**Step 3:** Update `docker-compose.yaml` to use old image:

```yaml
# Find stable image tags at: https://github.com/cinephage/cinephage/pkgs/container/cinephage
image: ghcr.io/cinephage/cinephage:v0.16.0
```

**Step 4:** If rolling back to pre-/config version, restore old data volume mounts:

```yaml
volumes:
  - ./data:/app/data
  - /path/to/media:/media
  - /path/to/downloads:/downloads
```

**Step 5:** Start container:

```bash
docker compose up -d
```

---

## See Also

- [Installation](/getting-started/installation)
- [Backup & Restore](./backup-restore) - Data protection
- [Troubleshooting](./troubleshooting) - Common issues
