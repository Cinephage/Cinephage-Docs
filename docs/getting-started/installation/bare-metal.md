---
title: Bare Metal Installation
description: Install Cinephage directly on your Linux server without Docker
sidebar_label: Bare Metal
sidebar_position: 2
tags: [installation, native, bare-metal, tutorial]
keywords: [bare metal, native, manual installation, systemd, linux]
---

# Bare Metal Installation

This guide covers installing Cinephage directly on your Linux server using the native Node.js application. This method provides maximum performance without container overhead.

:::tip[Prefer Docker?]
If you want simpler deployment and easier maintenance, see the [Docker Installation](./) guide instead.
:::

## Prerequisites

Before starting, ensure you have:

- **A Linux server** (Ubuntu 22.04+, Debian 12+, or similar with systemd)
- **Node.js 22+** (we will cover installation)
- **Git** installed
- **A TMDB API key** (free registration required)
- **Root or sudo access** to the server

### Check system requirements

```bash
# Check OS version
lsb_release -a

# Check available RAM
free -h

# Check disk space
df -h
```

## Quick Start

If you are experienced with Linux, here are the essential commands:

```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs ffmpeg git

# Create user and directories
sudo useradd -r -s /bin/false cinephage
sudo mkdir -p /opt/cinephage
sudo chown cinephage:cinephage /opt/cinephage

# Download and build
sudo -u cinephage -H bash -c '
cd /opt/cinephage
git clone https://github.com/cinephage/cinephage.git .
npm ci --production=false
npm run build
'

# Configure environment
sudo -u cinephage tee /opt/cinephage/.env << 'EOF'
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL=http://localhost:3000
ORIGIN=http://localhost:3000
TZ=UTC
EOF

# Create systemd service
sudo tee /etc/systemd/system/cinephage.service << 'EOF'
[Unit]
Description=Cinephage
After=network.target

[Service]
Type=simple
User=cinephage
Group=cinephage
WorkingDirectory=/opt/cinephage
EnvironmentFile=/opt/cinephage/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl start cinephage
sudo systemctl enable cinephage
```

For detailed explanations of each step, continue reading below.

## Step-by-Step Installation

### Step 1: Install Node.js

Cinephage requires Node.js 22 or later. Install it using the official NodeSource repository:

```bash
# Download and run the NodeSource setup script
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v22.x.x or higher
npm --version   # Should show 10.x.x or higher
```

:::info[Other Distributions]
For CentOS/RHEL, Fedora, or other distributions, see the [Node.js downloads page](https://nodejs.org/en/download/).
:::

### Step 2: Install Dependencies

Install FFmpeg and Git:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ffmpeg git

# Verify FFmpeg installation
ffmpeg -version | head -1
```

### Step 3: Create User and Directory

For security, run Cinephage as a dedicated system user:

```bash
# Create a system user (no login shell)
sudo useradd -r -s /bin/false cinephage

# Create installation directory
sudo mkdir -p /opt/cinephage

# Set ownership
sudo chown cinephage:cinephage /opt/cinephage
```

### Step 4: Download and Build

Clone the repository and build the application:

```bash
# Switch to the cinephage user
sudo -u cinephage -H bash

# Navigate to the installation directory
cd /opt/cinephage

# Clone the repository
git clone https://github.com/cinephage/cinephage.git .

# Install dependencies
npm ci --production=false

# Build the application
npm run build

# Exit the cinephage user shell
exit
```

:::tip[Build Takes Time]
The build process compiles the Svelte frontend and may take 2-5 minutes depending on your server's performance.
:::

### Step 5: Configure Environment

Create an environment file with your configuration:

```bash
# Generate a secure secret
SECRET=$(openssl rand -base64 32)

# Create the environment file
sudo -u cinephage tee /opt/cinephage/.env << EOF
# Server Configuration
HOST=0.0.0.0
PORT=3000
NODE_ENV=production

# Authentication (REQUIRED)
BETTER_AUTH_SECRET=$SECRET
BETTER_AUTH_URL=http://localhost:3000

# Origin URL (REQUIRED)
# Change to your access URL:
# - Local: http://localhost:3000
# - Network: http://192.168.1.100:3000
# - Domain: https://cinephage.yourdomain.com
ORIGIN=http://localhost:3000

# System Settings
TZ=UTC
EOF
```

#### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | No | Auth callback URL - defaults to ORIGIN if not set |
| `ORIGIN` | Yes | URL where you access Cinephage |
| `PORT` | No | Port to listen on (default: 3000) |
| `TZ` | No | Timezone (default: UTC) |

:::warning[Keep BETTER_AUTH_SECRET Safe]
- Store it like a password
- Back it up with your configuration
- Changing it invalidates all user sessions and API keys

:::

### Step 6: Set Up Data Directories
Create directories for data and media:

```bash
# Create application directories
sudo mkdir -p /opt/cinephage/data
sudo mkdir -p /opt/cinephage/logs

# Create media directories (adjust paths to match your setup)
sudo mkdir -p /mnt/media
sudo mkdir -p /mnt/downloads

# Set ownership
sudo chown -R cinephage:cinephage /opt/cinephage/data
sudo chown -R cinephage:cinephage /opt/cinephage/logs
sudo chown -R cinephage:cinephage /mnt/media
sudo chown -R cinephage:cinephage /mnt/downloads
```

### Step 7: Create systemd Service

Create a systemd service file for automatic startup:

```bash
sudo tee /etc/systemd/system/cinephage.service << 'EOF'
[Unit]
Description=Cinephage - Self-hosted Media Acquisition System
Documentation=https://github.com/cinephage/cinephage
After=network.target

[Service]
Type=simple
User=cinephage
Group=cinephage
WorkingDirectory=/opt/cinephage

# Environment
EnvironmentFile=/opt/cinephage/.env
Environment=NODE_ENV=production

# Start command
ExecStart=/usr/bin/node server.js

# Restart policy
Restart=always
RestartSec=5

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cinephage

[Install]
WantedBy=multi-user.target
EOF
```

Reload systemd:

```bash
sudo systemctl daemon-reload
```

### Step 8: Start Cinephage

Start the service and enable auto-start:

```bash
# Start the service
sudo systemctl start cinephage

# Enable auto-start on boot
sudo systemctl enable cinephage

# Check status
sudo systemctl status cinephage
```

### Step 9: Verify Installation

Check the logs to ensure Cinephage started correctly:

```bash
# View recent logs
sudo journalctl -u cinephage -n 50 --no-pager

# Follow logs in real-time
sudo journalctl -u cinephage -f
```

You should see messages indicating the server started successfully.

:::info[First Startup Note]
On first startup, Cinephage will download the Camoufox browser (~80MB) for Captcha Solver functionality. This is a one-time download stored in `/opt/cinephage/data`.
:::

### Step 10: Access Cinephage

Open your web browser and navigate to your configured ORIGIN:

```
http://your-server-ip:3000
```

You should see the Cinephage setup wizard.

### Step 11: Complete Setup Wizard

Follow the on-screen instructions to:

1. **Create an admin account** - Set up your first user
2. **Configure TMDB API** - Get your free API key from themoviedb.org
3. **Set Root Folders** - Define where media will be stored

## Service Management

Common systemd commands:

```bash
# Start the service
sudo systemctl start cinephage

# Stop the service
sudo systemctl stop cinephage

# Restart the service
sudo systemctl restart cinephage

# Check service status
sudo systemctl status cinephage

# View logs
sudo journalctl -u cinephage -f

# View logs since last boot
sudo journalctl -u cinephage --since today
```

## Updating Cinephage

To update to the latest version:

```bash
# Stop the service
sudo systemctl stop cinephage

# Navigate to the installation directory
cd /opt/cinephage

# Backup the database
cp data/cinephage.db data/cinephage.db.backup-$(date +%Y%m%d)

# Pull the latest changes
sudo -u cinephage git pull origin main

# Install new dependencies
sudo -u cinephage npm ci --production=false

# Rebuild the application
sudo -u cinephage npm run build

# Start the service
sudo systemctl start cinephage

# Check status
sudo systemctl status cinephage
```

For more details, see the [Update Guide](/guides/use/update-cinephage).

## Reverse Proxy Setup (Optional)

To access Cinephage through a domain with HTTPS:

### Nginx Configuration

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create configuration
sudo tee /etc/nginx/sites-available/cinephage << 'EOF'
server {
    listen 80;
    server_name cinephage.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/cinephage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Set up SSL with Let's Encrypt (optional)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cinephage.yourdomain.com
```

Update your `.env` file:

```bash
ORIGIN=https://cinephage.yourdomain.com
BETTER_AUTH_URL=https://cinephage.yourdomain.com
```

Then restart:

```bash
sudo systemctl restart cinephage
```

## Troubleshooting

### Service Fails to Start

Check the logs for specific errors:

```bash
sudo journalctl -u cinephage -n 100 --no-pager
```

### Permission Denied Errors

Ensure the cinephage user owns all required directories:

```bash
sudo chown -R cinephage:cinephage /opt/cinephage/data
sudo chown -R cinephage:cinephage /opt/cinephage/logs
```

### Port Already in Use

Change the port in `/opt/cinephage/.env`:

```bash
PORT=3001
```

Then restart the service.

### Node.js Version Issues

Ensure you have Node.js 22+:

```bash
node --version
```

If not, reinstall Node.js following Step 1.

For more help, see the [Troubleshooting Guide](/guides/deploy/troubleshooting).

## Next Steps

- [Initial Setup](/getting-started/initial-setup) - Configure download clients, indexers, and quality profiles
- [Environment Variables Reference](/reference/configuration/environment-variables) - Complete configuration options
- [Backup and Restore](/guides/deploy/backup-restore) - Protect your data

## See Also

- [Docker Installation](/getting-started/installation/docker) - Alternative installation using containers
- [Installation FAQ](/support/faq/installation) - Common questions
- [System Requirements](/getting-started/installation#system-requirements) - Hardware and software requirements
