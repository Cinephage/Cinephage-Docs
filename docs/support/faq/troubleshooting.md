---
title: Troubleshooting FAQ
description: Solutions to common problems and issues with Cinephage
sidebar_position: 7
tags: [faq, troubleshooting, errors, issues, support]
keywords: [faq, troubleshooting, errors, logs, debug, support]
---

# Troubleshooting

### Where are the logs?

**Docker:**
```bash
docker compose logs -f cinephage
```

**Web Interface:**
```
Settings → Monitoring → Logs
```

**Log Files:**
```
./config/logs/cinephage.log
```

### How do I enable debug logging?

**Docker:**
```yaml
environment:
  - LOG_LEVEL=debug
```

**Restart required:**
```bash
docker compose restart
```

### My database is getting large, what should I do?

**Check size:**
```bash
ls -lh ./config/data/cinephage.db
```

**Optimize:**
```bash
# Docker
docker exec cinephage sqlite3 /config/data/cinephage.db "VACUUM;"

# Native
sqlite3 ./data/cinephage.db "VACUUM;"
```

**Set log retention:**
```
Settings → Monitoring → Logs
```

### Cinephage won't start, what do I do?

**Check logs:**
```bash
docker compose logs cinephage
```

**Common issues:**
1. **Port already in use** - Change port mapping
2. **Database locked** - Check no other instance running
3. **Permission denied** - Fix PUID/PGID or file permissions
4. **Out of memory** - Increase Docker memory limit

**Reset (last resort):**
```bash
# Backup first
cp -r ./config ./config-backup

# Reset database
docker compose down
rm ./config/data/cinephage.db
docker compose up -d
```

### How do I reset my password?

If you can't log in:

1. Stop Cinephage
2. Delete user from database (advanced) or
3. Reset entire database (loses all data) or
4. Use CLI reset command (if available)

### Why are my subtitle searches failing?

**Check:**
1. Subtitle providers configured
2. Language profile includes desired languages
3. Video file name is clear (not obfuscated)
4. Subtitle providers have the language

### Can I use a VPN?

Yes, but don't use Cinephage's built-in VPN (there isn't one). Instead:

**Option 1: VPN Container**
```yaml
services:
  gluetun:  # VPN container
    image: qmcgaw/gluetun
    # ... VPN config
  
  cinephage:
    network_mode: service:gluetun
```

**Option 2: System VPN**
- Run VPN on your host
- Cinephage traffic goes through automatically

### How do I get help?

**Resources:**
- 📖 This documentation
- 💬 [Discord Community](https://discord.gg/scGCBTSWEt)
- 🐛 [GitHub Issues](https://github.com/cinephage/cinephage/issues)
- 📧 Check logs and provide details when asking for help

**When asking for help, include:**
1. What you were trying to do
2. What actually happened
3. Error messages (from logs)
4. Your configuration (sanitized)
5. Cinephage version

## Advanced Topics

### Can I use PostgreSQL instead of SQLite?

Not currently. Cinephage uses SQLite for simplicity. PostgreSQL support may be added in the future for very large libraries.

### Can I run multiple instances?

Not recommended. SQLite doesn't handle concurrent access well. If you need multiple instances, use separate databases.

### Is there an API?

Yes. Cinephage has its own internal API, and it also exposes a Radarr- and Sonarr-compatible API layer (`/api/radarr` and `/api/sonarr`) so tools built for Radarr/Sonarr - like autobrr, Overseerr/Jellyseerr, Pulsarr, and Notifiarr - can connect to Cinephage directly without a separate Radarr or Sonarr instance. Enable it at **Settings > System > General**. See [Configure Radarr/Sonarr Compatibility](/guides/configure/system/arr-compat) for setup details.

### Can I contribute?

Yes! Cinephage is open source:
- 🐛 Report bugs on GitHub
- 💡 Suggest features
- 📝 Improve documentation
- 💻 Submit pull requests

See [Contributing](https://github.com/cinephage/cinephage/blob/main/CONTRIBUTING.md).

### What's the roadmap?

Check the [GitHub repository](https://github.com/cinephage/cinephage) for:
- Active development
- Feature requests
- Known issues
- Release notes

## Quick Command Reference

**View logs:**
```bash
docker compose logs -f cinephage
```

**Restart Cinephage:**
```bash
docker compose restart cinephage
```

**Update Cinephage:**
```bash
docker compose pull && docker compose up -d
```

**Backup database:**
```bash
cp ./config/data/cinephage.db ./config/data/cinephage-backup.db
```

**Check database:**
```bash
sqlite3 ./config/data/cinephage.db ".tables"
```

**Optimize database:**
```bash
sqlite3 ./config/data/cinephage.db "VACUUM;"
```

## See Also

- [Troubleshooting Guide](/guides/deploy/troubleshooting) - Detailed troubleshooting
- [Getting Help](/getting-started/getting-help) - Support resources
- [Configuration FAQ](/support/faq/configuration) - Environment issues
- [Installation FAQ](/support/faq/installation) - Setup problems
- [GitHub Issues](https://github.com/cinephage/cinephage/issues) - Bug reports
