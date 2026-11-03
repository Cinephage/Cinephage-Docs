---
title: Installation
description: Choose your preferred installation method - Docker or bare metal
sidebar_position: 2
tags: [installation, docker, native, getting-started]
keywords: [docker, docker compose, installation, setup, bare metal, native]
---

# Installation

Cinephage supports two installation methods. Both provide the same features - choose the one that best fits your infrastructure and preferences.

## Choose Your Installation Method

<div className="row">
  <div className="col col--6">
    <div className="card margin-bottom--lg">
      <div className="card__header">
        <h3>🐳 Docker</h3>
      </div>
      <div className="card__body">
        <p><strong>Recommended for most users</strong></p>
        <p>Simple containerized deployment with consistent environments and easy updates.</p>
        <ul>
          <li>One command to install</li>
          <li>Works on any platform with Docker</li>
          <li>Easy backup and migration</li>
          <li>Isolated dependencies</li>
        </ul>
      </div>
      <div className="card__footer">
        <a href="./docker" className="button button--primary button--block">View Docker Guide</a>
      </div>
    </div>
  </div>
  <div className="col col--6">
    <div className="card margin-bottom--lg">
      <div className="card__header">
        <h3>⚙️ Bare Metal</h3>
      </div>
      <div className="card__body">
        <p><strong>For maximum performance</strong></p>
        <p>Direct installation on Linux with no container overhead.</p>
        <ul>
          <li>Maximum performance</li>
          <li>Full system integration</li>
          <li>Direct file system access</li>
          <li>No Docker knowledge required</li>
        </ul>
      </div>
      <div className="card__footer">
        <a href="./bare-metal" className="button button--primary button--block">View Bare Metal Guide</a>
      </div>
    </div>
  </div>
</div>

## Quick Comparison

| Feature | Docker | Bare Metal |
|---------|--------|------------|
| **Setup Complexity** | Simple | Moderate |
| **Performance** | Excellent | Maximum |
| **Updates** | One command | Requires rebuild |
| **Backup** | Copy volume directories | Copy data directory |
| **Learning Curve** | Docker basics | Linux/systemd basics |
| **Best For** | Most users | Performance-critical setups |

## Prerequisites

Regardless of your chosen method, you will need:

- A server or computer to run Cinephage (see [system requirements](#system-requirements))
- A [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- Basic familiarity with command line

## System Requirements

### Minimum Requirements

- **CPU**: 2 cores (x86_64 or ARM64)
- **RAM**: 2GB
- **Storage**: 10GB for application + space for your media library
- **OS**: Linux (Docker) or Linux with systemd (Bare Metal)

### Recommended Requirements

- **CPU**: 4+ cores
- **RAM**: 4GB+
- **Storage**: SSD recommended for database
- **Network**: Stable internet connection

:::tip[Not Sure Which to Choose?]

If you are new to self-hosting, **start with Docker**. It is easier to set up, maintain, and troubleshoot. You can always migrate to bare metal later if you need maximum performance.

:::

## Next Steps

After installing Cinephage using your chosen method, continue to the [Initial Setup](/getting-started/initial-setup) guide to configure your first library, download client, and indexers.

## Getting Help

If you encounter issues during installation:

- Check the [Troubleshooting Guide](/guides/deploy/troubleshooting)
- Review the [Installation FAQ](/support/faq/installation)
- Join our [GitHub Discussions](https://github.com/cinephage/cinephage/discussions)
