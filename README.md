<div align="center">
  <img src="static/img/logo.png" alt="Cinephage" width="200" />

  # Cinephage Docs

  **Unified self-hosted media management**

  [![Build](https://github.com/cinephage/cinephage-Docs/actions/workflows/build.yml/badge.svg)](https://github.com/cinephage/cinephage-Docs/actions/workflows/build.yml)
  [![Docusaurus 3](https://img.shields.io/badge/Docusaurus-3-blue?logo=docusaurus)](https://docusaurus.io/)
  [![Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
  [![Node](https://img.shields.io/badge/Node-%3E%3D20-339933?logo=nodedotjs)](https://nodejs.org/)
  [![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue)](https://github.com/cinephage/cinephage/blob/main/LICENSE)

  **[docs.cinephage.net](https://docs.cinephage.net)**

</div>

---

## About

This is the documentation site for [Cinephage](https://github.com/cinephage/cinephage) - a unified, self-hosted media management platform combining movies, TV shows, live TV, and streaming into a single Docker container with a single database.

The site is built with [Docusaurus 3](https://docusaurus.io/) and deployed automatically to [Cloudflare Workers](https://workers.cloudflare.com/).

## What's Inside

The documentation follows the [Diataxis](https://diataxis.fr/) framework:

| Section | Purpose |
|---------|---------|
| **Getting Started** | Step-by-step tutorials to get Cinephage installed and running |
| **Guides** | Task-oriented how-tos for configuration, daily use, and deployment |
| **Reference** | Technical reference for environment variables, database schema, YAML specs, and API |
| **Explanation** | Architecture deep-dives, design decisions, and concept breakdowns |
| **Support** | FAQ, release history, roadmap, and troubleshooting |

## How It Works

This site is fully automated - no manual builds or deployments needed:

- **Auto-deploy** - Cloudflare Workers deploys the site on every push to `main`
- **Build checks** - GitHub Actions validates the build on all pushes and pull requests
- **Source sync** - Git submodules tracking the Cinephage source code auto-update every 6 hours via GitHub Actions, keeping the docs in sync with the latest codebase

## Contributing

The easiest way to contribute is to click the **"Edit this page"** link at the bottom of any page on the [live site](https://docs.cinephage.net) - this opens the file directly in GitHub for editing.

For larger changes, fork the repository, create a branch, and submit a pull request. All PRs are automatically built and verified before merging.

<details>
<summary><strong>Local Development</strong></summary>

<br>

**Prerequisites:** Node.js >= 20, npm

```bash
# Install dependencies
npm install

# Start local dev server (hot-reloading)
npm start

# Build static site
npm run build

# Serve the build locally
npm run serve
```

To deploy manually (requires Wrangler authentication):

```bash
npm run deploy
```

</details>

## Links

- [Live Documentation](https://docs.cinephage.net)
- [Cinephage Source Code](https://github.com/cinephage/cinephage)
- [Discord Community](https://discord.gg/scGCBTSWEt)
- [Changelog](https://github.com/cinephage/cinephage/releases)

## License

This documentation is part of the Cinephage project, licensed under [GPL-3.0](https://github.com/cinephage/cinephage/blob/main/LICENSE).
