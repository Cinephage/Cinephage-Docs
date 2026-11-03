---
title: Media Requests
description: Let other users request movies and TV shows for an admin to approve
sidebar_position: 6
tags: [requests, users, workflow, guide]
keywords: [requests, approve, quota, auto-approve]
---

# Media requests

Requests let a non-admin [user account](../configure/system/user-accounts.md) ask for a movie or show to be added, without needing access to search or settings. An admin approves (or auto-approve handles it) and Cinephage takes it from there.

## Submitting a request

1. Find the title on **Discover** (or anywhere its detail page shows a Request button)
2. Click **Request**. For a TV show you can request specific seasons instead of the whole series.
3. The request appears under **Requests** in the sidebar with status **Pending** (or **Approved**, if auto-approve is on for that media type/user)

You can't request something that's already in your library, and re-requesting the same title after it's declined is blocked for a cooldown period (7 days by default).

## Request statuses

| Status | Meaning |
|--------|---------|
| Pending | Waiting on an admin |
| Approved | Approved, Cinephage is searching for a release |
| Awaiting target | Approved but needs a destination library/root folder picked before it can search |
| Fulfilled | The media was found, grabbed, and imported |
| Failed | Approved but the search/grab/import failed - can be retried |
| Declined | An admin rejected it |
| Expired | Left pending too long (30 days by default) |
| Cancelled | Withdrawn by the requester |

## Approving requests (admin)

Go to **Requests** - admins see every user's requests here (non-admins only see their own). Approve, decline, or bulk-approve/decline from the list.

## Configuring requests (admin)

**Settings > System > Requests** controls the defaults for everyone:

- **Enable requests** - turn the whole feature on/off
- **Auto-approve** - separately for movies and series; skips the approval step entirely
- **Default quotas** - a limit + a rolling day window per media type (e.g. 5 movies per 30 days), or leave blank for unlimited. For TV, the quota can count by episode or by season.
- **Pending expiry** - days before an unapproved request auto-expires
- **Re-request cooldown** - days before a declined/expired/cancelled title can be requested again

Per-user overrides (disable requests for one person, force their auto-approve on/off, or give them a different quota) are set on that user's page under **Settings > Users** - see [User Accounts](../configure/system/user-accounts.md).
