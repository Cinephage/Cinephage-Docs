---
title: Design Decisions
description: Understanding the key architectural and design choices behind Cinephage
sidebar_position: 5
tags: [design, decisions, explanation, architecture, philosophy]
keywords: [design, decisions, architecture, philosophy]
---

# Design decisions

This document explains the key design decisions behind Cinephage - why it was built the way it is, and the trade-offs made along the way.

## Why a Single Application?

### The unified philosophy

Cinephage was built around a simple idea: media management doesn't need to be complicated.

Instead of juggling multiple applications, databases, and configurations, Cinephage unifies everything into a single, cohesive platform:

```
┌──────────────────────────────────┐
│                                  │
│          Cinephage               │
│                                  │
│  • Movies                        │
│  • TV Shows                      │
│  • Indexer Management            │
│  • Subtitles                     │
│  • Requests & Discovery          │
│  • Live TV & Streaming           │
│                                  │
└──────────────┬───────────────────┘
               │
               ▼
       ┌──────────────┐
       │   SQLite     │
       └──────────────┘
```

**Benefits of Unification:**

| Aspect | Benefit |
|--------|---------|
| **Installation** | Single Docker container |
| **Memory** | 200-500 MB typical usage |
| **Database** | One unified database |
| **Configuration** | Single settings interface |
| **Updates** | One update process |
| **Integration** | Everything works together seamlessly |

### Trade-offs

**Advantages:**
- ✅ Simpler deployment
- ✅ Lower resource usage
- ✅ Consistent UI/UX across all features
- ✅ Shared configuration
- ✅ Easier backups
- ✅ Faster development cycle

**Considerations:**
- ⚠️ Single point of failure (but easily restorable from backup)
- ⚠️ Can't upgrade components independently (trade-off for simplicity)
- ⚠️ Unified feature set (covers most common use cases)

**Our Decision:**
The unified approach provides the best experience for most users. By consolidating functionality into one application, we reduce complexity while maintaining all the features users need.

## Why SQLite?

### Database options considered

**Option 1: PostgreSQL**
- ✅ Excellent performance
- ✅ Advanced features
- ✅ Handles large scale
- ❌ Requires separate installation
- ❌ Complex configuration
- ❌ Higher resource usage
- ❌ Backup complexity

**Option 2: MySQL/MariaDB**
- ✅ Widely supported
- ✅ Good performance
- ❌ Still requires separate service
- ❌ Configuration overhead
- ❌ More complex backups

**Option 3: SQLite**
- ✅ Zero configuration
- ✅ Single file database
- ✅ Easy backups (just copy file)
- ✅ Low resource usage
- ✅ No separate service needed
- ✅ ACID compliant
- ❌ Not ideal for very high concurrency
- ❌ Single writer limitation

### SQLite in production

**Addressing Concerns:**

"SQLite isn't for production" - This is outdated thinking.

Modern SQLite is used in production by:
- Chrome (bookmarks, history)
- Firefox (user data)
- Android (system databases)
- macOS (system services)
- Dropbox (client metadata)

**SQLite is appropriate when:**
- Read-heavy workload ✓
- Single server deployment ✓
- Moderate concurrency ✓
- Need simplicity ✓

**SQLite limitations we accept:**
- Single writer (Cinephage queues writes)
- No built-in replication (backup strategy handles this)
- Not for distributed systems (Cinephage is single-node)

### Our decision

SQLite provides the best balance for Cinephage's use case:
- Simpler deployment
- Easier backups
- Lower resources
- Sufficient performance for home/small office use

## Why YAML for Indexers?

### The indexer problem

Indexers (torrent sites, usenet sites) frequently:
- Change their layout
- Update their API
- Add anti-bot measures
- Block certain user agents

**Traditional Solutions:**

1. **Hardcoded Indexers**
   - ❌ Requires code updates for every change
   - ❌ Slow to adapt
   - ❌ Users must wait for new release

2. **JavaScript/CSS Selectors**
   - ✅ More flexible
   - ❌ Still requires app updates
   - ❌ Complex to write

3. **Cardigann YAML**
   - ✅ User-updatable
   - ✅ Community-maintained
   - ✅ No code changes needed

### YAML indexer definitions

Cinephage uses YAML-based indexer definitions inspired by Cardigann:

```yaml
name: Example Tracker
description: A private tracker
language: en
protocol: torrent

settings:
  - name: username
    type: text
    label: Username
  - name: password
    type: password
    label: Password

search:
  paths:
    - path: /search
  inputs:
    q: "{{ .Keywords }}"
    category: "{{ .Categories }}"

results:
  selector: table.torrents tr
  fields:
    title:
      selector: td.name a
    download:
      selector: td.download a
      attribute: href
    seeders:
      selector: td.seeders
    leechers:
      selector: td.leechers
```

**Benefits:**

| Benefit | Description |
|---------|-------------|
| **Community** | Users can create and share definitions |
| **Rapid Updates** | Update indexer without app update |
| **Version Control** | Track changes to indexers |
| **Flexibility** | Support for complex login flows |
| **Safety** | Sandboxed execution |

### Trade-offs

**Advantages:**
- ✅ User can fix broken indexers immediately
- ✅ Community contributions
- ✅ No waiting for app updates
- ✅ Supports custom/private indexers

**Considerations:**
- ⚠️ Requires learning YAML format
- ⚠️ Complex sites may need complex definitions
- ⚠️ Some sites need custom handling

**Our Decision:**
The flexibility and community aspect of YAML indexers outweigh the complexity. Most users use built-in definitions and never touch YAML.

## Why TypeScript/Svelte?

### Technology stack choices

**Backend: TypeScript/Node.js**

Considered alternatives:
- **Python** - Familiar, but single-threaded
- **Go** - Fast, but less ecosystem for media management
- **Rust** - Fast, but steeper learning curve
- **TypeScript** - Good balance of speed and productivity

**Why TypeScript:**
- ✅ Type safety catches bugs early
- ✅ Excellent async/await support
- ✅ Huge npm ecosystem
- ✅ Full-stack TypeScript possible
- ✅ Good performance with modern V8
- ✅ Easy to hire/contract developers

**Frontend: Svelte 5**

Considered alternatives:
- **React** - Popular, but boilerplate-heavy
- **Vue** - Good, but less community momentum
- **Svelte** - Compiles to efficient JS, less code
- **Angular** - Too heavy for this use case

**Why Svelte 5:**
- ✅ Less code to write (no virtual DOM overhead)
- ✅ Excellent performance
- ✅ Built-in state management
- ✅ Modern runes-based reactivity
- ✅ Great developer experience
- ✅ Growing ecosystem

### Trade-offs

**TypeScript Advantages:**
- Type safety
- Great tooling (VS Code)
- Strong ecosystem
- Good async support

**TypeScript Considerations:**
- Build step required
- npm dependency complexity
- Memory usage (V8)

**Our Decision:**
TypeScript + Svelte provides the best balance of developer productivity, performance, and maintainability for a project of this scope.

## Why No Built-in VPN?

### The VPN question

Users often ask: "Why doesn't Cinephage include VPN/proxy support?"

**Arguments for Built-in VPN:**
- ✅ One-click privacy
- ✅ Easier setup
- ✅ App-level control

**Arguments Against:**
- ❌ Significant complexity
- ❌ VPN protocols constantly evolving
- ❌ Licensing/legal issues
- ❌ Better handled at system level
- ❌ Container/VPN integration is messy

### Recommended approach

**Use System-Level VPN:**

```yaml
# Docker Compose with VPN container
version: '3'
services:
  gluetun:  # VPN container
    image: qmcgaw/gluetun
    cap_add:
      - NET_ADMIN
    environment:
      - VPN_SERVICE_PROVIDER=mullvad
      - VPN_TYPE=wireguard
      - WIREGUARD_PRIVATE_KEY=...
    networks:
      - vpn-network

  cinephage:
    image: cinephage/cinephage:latest
    network_mode: service:gluetun
    depends_on:
      - gluetun
```

**Benefits of This Approach:**
- ✅ VPN container maintained by VPN specialists
- ✅ Supports all VPN providers
- ✅ Easy to swap VPN providers
- ✅ Clean separation of concerns
- ✅ No VPN code in Cinephage to maintain

**Our Decision:**
VPN functionality is better handled by dedicated VPN containers. This keeps Cinephage focused on media management while giving users maximum flexibility.

## Why Docker-First?

### Deployment options

**Native Installation:**
- ✅ Maximum performance
- ✅ No container overhead
- ❌ Complex dependency management
- ❌ Platform-specific issues
- ❌ Harder to support

**Docker Installation:**
- ✅ Consistent environment
- ✅ Easy deployment
- ✅ Simple updates
- ✅ Isolated dependencies
- ✅ Better supportability
- ❌ Small overhead (minimal)

### Docker benefits for Cinephage

**For Users:**
- One command to install
- Consistent across all platforms
- Easy updates (pull new image)
- Clean removal
- Volume mounts for persistence

**For Development:**
- Consistent development environment
- Easy CI/CD integration
- Reproducible builds
- Version pinning

**For Support:**
- Same environment for all users
- No "works on my machine"
- Clear separation of app/data
- Easy log collection

### Trade-offs

**Docker Advantages:**
- Simpler deployment
- Consistent environment
- Better support
- Easier backups

**Docker Considerations:**
- Requires Docker knowledge
- Volume mount complexity
- Networking considerations
- Small resource overhead (~50MB)

**Our Decision:**
Docker-first approach with native installation as secondary option. Docker solves 95% of deployment issues and provides the best user experience.

## Why GPL-3.0 License?

### License philosophy

Cinephage is licensed under GPL-3.0 (GNU General Public License v3.0).

**GPL-3.0 Requirements:**
- ✅ Free to use
- ✅ Free to modify
- ✅ Free to distribute
- ❌ Must share source code if distributed
- ❌ Derivative works must be GPL
- ❌ Can't be made proprietary

### Why not mit/apache?

**MIT/Apache Permits:**
- ✅ Commercial use
- ✅ Private modification
- ✅ Can be made proprietary

**Concerns:**
- Commercial entities could take code private
- Community contributions could be locked away
- "Open core" model fragmentation

### Why gpl-3.0?

**Protects the Community:**
- Ensures Cinephage stays open source
- Prevents proprietary forks
- Encourages contribution back
- Aligns with user interests

**Philosophy:**
Media management tools should be free and open. Users shouldn't be locked into paid services or proprietary software.

**Trade-off:**
- Some commercial users may avoid GPL
- But aligns with project values

**Our Decision:**
GPL-3.0 protects the open-source nature of Cinephage and ensures it remains free for the community forever.

## Design Principles Summary

### Core principles

1. **Simplicity First**
   - One unified application
   - SQLite for straightforward data management
   - Docker for easy deployment

2. **User Empowerment**
   - YAML indexers users can modify
   - Open source (GPL-3.0)
   - Extensive configuration options

3. **Pragmatic Performance**
   - Good enough performance for 99% of users
   - Don't over-engineer for edge cases
   - Optimize for common operations

4. **Community Focus**
   - Open source encourages contributions
   - YAML indexers enable community definitions
   - GPL protects user freedoms

5. **Modern Stack**
   - TypeScript for type safety
   - Svelte for performance
   - Docker for deployment
   - Current best practices

### Trade-offs we accept

| Decision | Trade-off | Why It's Worth It |
|----------|-----------|-------------------|
| Single app | Can't upgrade components separately | Simplicity wins |
| SQLite | Single writer limitation | Simplicity wins |
| GPL-3.0 | Commercial restrictions | Freedom wins |
| Docker-first | Requires Docker knowledge | Consistency wins |
| No built-in VPN | Users must configure separately | Separation of concerns |
| YAML indexers | Learning curve | Flexibility wins |

## Future Considerations

### Potential changes

**Under Evaluation:**
- PostgreSQL option for very large libraries (100K+ items)
- Plugin system for extensibility
- API for third-party integrations
- Multi-user support enhancements

**Not Planned:**
- Built-in VPN (use system-level)
- Native apps (PWA works well)
- Cloud hosting (self-hosted only)
- Premium/enterprise version (stays open source)

## Conclusion

Every design decision in Cinephage balances:
- **Simplicity vs. Power**
- **Flexibility vs. Complexity**
- **Performance vs. Resources**
- **Features vs. Maintainability**

Our choices reflect a focus on:
1. Making media management accessible
2. Keeping the stack simple and maintainable
3. Empowering users with open source
4. Prioritizing the common use cases

These decisions serve Cinephage's goal of being a simple, effective self-hosted media management solution.

## See Also

- [Architecture](architecture) - System architecture details
- [Concepts](concepts) - Core concepts explained
- [Workers and Tasks](workers-and-tasks) - Background processing
- [Contributing](https://github.com/cinephage/cinephage/blob/main/CONTRIBUTING.md) - Get involved
