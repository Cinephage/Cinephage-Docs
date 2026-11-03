---
title: User Accounts
description: Create accounts for other people and control what they can do
sidebar_position: 1
tags: [users, accounts, roles, permissions, guide]
keywords: [users, accounts, roles, admin, permissions, multi-user]
---

# User accounts

Cinephage supports multiple accounts. Besides the admin account you set up during initial setup, you can create additional accounts for other people in your household - each with their own login and, if you enable [media requests](../../use/media-requests.md), their own request quota.

## Roles

There are two roles:

| Role | Can do |
|------|--------|
| **Admin** | Everything - manage libraries, settings, indexers, download clients, users, and all requests |
| **User** | Browse Discover/Library/Calendar, submit requests (if enabled), manage their own account |

A user account has no access to **Settings** at all - the Settings section doesn't appear in their navigation.

## Creating a user

1. Go to **Settings > Users** (admin only)
2. Click **Add User** (or **Import from Media Server** to create accounts from your Jellyfin/Plex/Emby user list)
3. Fill in:
   - **Username** - letters, numbers, and a few symbols; some names (e.g. `admin`) are reserved
   - **Email**
   - **Password** - 8+ characters, or use **Generate** for a random one
   - **Role** - `User` or `Admin`
4. Save

## Managing a user

Open **Settings > Users** and select a user to:

- **Change role** - promote to Admin or demote to User. You can't demote yourself if you're the only admin, and the last remaining admin can't be demoted at all.
- **Link a media-server account** - associate the Cinephage account with a Jellyfin/Plex/Emby user, used for personalization features that read that server's watch history.
- **View/revoke sessions** - see active logins and sign a user out remotely.
- **Override request settings** - disable requests for this user, force auto-approve on or off (overriding the global default), or set a per-user request quota that overrides the global default. See [Media Requests](../../use/media-requests.md) for what these mean.

## Notes

- Authentication is session + API-key based; see [Authentication](../../../reference/api/authentication.md) for how API keys and roles interact with the API.
- There's no email verification or password-reset email flow - an admin resets a forgotten password directly from the user's detail page.
