---
title: Captcha Solver
description: Configure built-in Cloudflare challenge bypass using Camoufox
sidebar_position: 6
tags: [captcha, cloudflare, camoufox, configuration, guide]
keywords: [captcha, cloudflare, camoufox, browser]
---

# Captcha solver

Cinephage includes a built-in **Captcha Solver** that automatically handles Cloudflare challenges and other anti-bot protections. No external services like FlareSolverr required.

---

## How It Works

The Captcha Solver uses **Camoufox** - a privacy-focused Firefox fork with anti-detection features:

1. **Challenge Detection** - Automatically detects Cloudflare/Turnstile challenges
2. **Browser Automation** - Launches headless browser to solve challenges
3. **Cookie Caching** - Stores successful cookies to minimize solves
4. **Health Monitoring** - Tracks success rates and adjusts automatically

---

## Configuration

Navigate to **Settings > System > Captcha Solver**:

### Basic settings

| Setting       | Description                          | Default  |
| ------------- | ------------------------------------ | -------- |
| **Enabled**   | Turn solver on/off                   | Disabled |
| **Timeout**   | Max time to wait for solve (seconds) | 60       |
| **Cache TTL** | How long to keep cookies             | 1 hour   |

The solver always runs headless - there's no UI toggle for running it with a visible browser.

### Advanced settings

| Setting            | Description                                | Default |
| ------------------ | ------------------------------------------- | ------- |
| **Proxy URL**       | HTTP proxy for the browser (optional)       | None    |
| **Proxy Username**  | Proxy authentication username (optional)    | None    |
| **Proxy Password**  | Proxy authentication password (optional)    | None    |

---

## Cookie Management

Cookies are cached per-domain to minimize repeated challenges:

- **Automatic refresh** - Cookies refreshed before expiration
- **Per-domain storage** - Each indexer has isolated cookies
- **Manual clearing** - Clear cookies if issues occur

### Clearing cookies

Via UI: **Settings > System > Captcha Solver > Clear Cache**

---

## Health Monitoring

The solver tracks its own performance:

| Metric                 | Description                          |
| ---------------------- | ------------------------------------ |
| **Success Rate**       | Percentage of successful solves      |
| **Average Solve Time** | How long challenges take             |
| **Cached Domains**     | Number of domains with valid cookies |
| **Last Error**         | Most recent failure reason           |

---

## Troubleshooting

### Challenges not being solved

1. **Check solver is enabled** - **Settings > System > Captcha Solver**
2. **Increase timeout** - Some challenges take 30+ seconds
3. **Check logs** - Look for "captcha" or "camoufox" errors
4. **Clear cookie cache** - Corrupted cookies can cause failures

### High failure rate

1. **Check proxy settings** - If using a proxy, verify it works and credentials are correct
3. **Update Camoufox** - Solver uses latest browser version automatically

### Indexer still blocked

Not all protection is Cloudflare:

- **DataDome** - Currently not supported
- **PerimeterX** - May work, not guaranteed
- **Custom challenges** - Varies by site

Try alternative indexers if one is consistently blocked.

---

## Performance Impact

- **Memory**: ~200MB per browser instance
- **CPU**: Minimal when idle, spikes during solves
- **Disk**: Cookies cached in database (~1KB per domain)

---

## See Also

- [Indexers](../indexers) - Configuring indexers that need Cloudflare bypass
- [Troubleshooting](../../deploy/troubleshooting) - General troubleshooting guide
