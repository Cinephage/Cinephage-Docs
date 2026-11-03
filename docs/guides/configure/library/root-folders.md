---
title: Root Folders
description: Set up and manage Root Folders for your media library
sidebar_position: 1
tags: [library, root-folders, configuration, guide]
keywords: [library, Root Folders, organization, media management]
---

# Root folders

Root folders define where Cinephage stores your media. They're the foundation of your library organization.

## Understanding Cinephage Libraries

Cinephage organizes media into two main library types with optional subtypes:

| Library Type | Content | Organization |
|--------------|---------|--------------|
| **Movies** | Individual films | Flat or by folder per movie |
| **TV Shows** | Series with episodes | Series > Seasons > Episodes |

### Media subtypes (v0.5.0+)

You can further organize content with subtypes:

| Subtype | Description | Example Use |
|---------|-------------|-------------|
| **Standard** | Regular movies/TV shows | Default for all content |
| **Anime** | Japanese animation | Separate naming conventions and metadata |

:::tip[Anime Subtype]
Use the Anime subtype for anime content to ensure proper metadata fetching and naming conventions specific to anime releases.
:::

## What Are Root Folders?

A root folder is a base directory where Cinephage:
- Stores imported media files
- Creates subdirectories for organization
- Monitors for new files
- Manages file naming and structure

## Creating Root Folders

### Step 1: access settings

1. Go to **Settings > Library > Root Folders**
2. Click **Add Root Folder**

### Step 2: configure folder

| Setting | Description | Example |
|---------|-------------|---------|
| **Name** | Display name | "Movies", "TV Shows" |
| **Path** | Container path to folder | `/media/movies` |
| **Media Type** | Movies or TV Shows | Select appropriate type |
| **Media Subtype** | Standard or Anime | "Standard" |
| **Default** | Use as the default root folder for this media type | Off |
| **Read Only** | Prevent Cinephage from writing/moving files here | Off |
| **Preserve Symlinks** | Don't resolve symlinks when scanning | Off |
| **Default Monitored** | Whether new items added here are monitored by default | On |
| **Blocked Video Extensions** | File extensions to ignore during import (e.g. `.sample.mkv`) | (none) |
| **Skip Folder Patterns** | Folder names to skip entirely during disk scan (case-insensitive exact match) | (none) |

:::note[Quality and language profiles aren't set on the root folder]
Root folders don't carry a default quality or language profile. A default **quality profile** is set per-**library** instead (Settings > Library > Libraries), and language profile has a single global default (see [Language Preferences](../languages/language-preferences)) with per-item overrides - not a per-root-folder setting.
:::

### Step 3: multiple Root Folders

You can create multiple Root Folders:

**Example Setup:**
```
/media/movies      (Movies root folder)
/media/tv          (TV Shows root folder)
/media/anime       (Anime-specific folder)
/media/kids        (Family content)
```

:::tip[Media Type Specific]
Each root folder is dedicated to one media type. Don't mix movies and TV in the same root folder.
:::

## Root Folder Best Practices

### Path guidelines

**Docker Installations:**
- Use container paths, not host paths
- Ensure volume mounts match your paths
- Example: If you mount `/mnt/media:/media`, use `/media/movies`

**Native Installations:**
- Use absolute paths
- Ensure proper permissions
- Consider dedicated mount points for media

### Storage planning

**Separate Libraries:**
```
# Good structure
/mnt/storage/
  movies/        # SSD or fast storage
  tv/            # Bulk storage OK
  anime/         # Separate organization
  kids/          # Curated collection
```

**Nested Folders:**
```
# Don't nest root folders
 /media/
     movies/      (root folder)
     movies/tv/   (nested - don't do this)

# Instead use separate roots
 /media/movies/   (root folder)
 /media/tv/       (root folder)
```

### Performance considerations

- **Fast Storage for Database** - Put Cinephage config (database) on SSD
- **Bulk Storage for Media** - Media can be on HDD or network storage
- **Avoid Network for Database** - SQLite needs local disk for best performance

## Managing Root Folders

### View Root Folders

```
**Settings > Library > Root Folders**
```

Shows:
- Folder name and path
- Media type (and subtype)
- Number of items
- Free space available

### Edit root folder

1. Click **Edit** on root folder
2. Modify settings
3. Click **Save**

**What can be changed:**
- Name
- Default / Read Only / Preserve Symlinks / Default Monitored toggles
- Blocked video extensions
- Path (use with caution)

:::tip[Path validation]
Path overlap validation correctly handles editing an existing root folder - it will not falsely flag the folder as conflicting with its own current path.
:::

### Move media between Root Folders (v0.5.0+)

You can move media between Root Folders directly in Cinephage:

1. Go to **Library** and select the media you want to move
2. Click **Actions > Move to Root Folder**
3. Select the destination root folder
4. Choose whether to move or copy files
5. Click **Move**

:::warning[Move vs Copy]
- **Move**: Relocates files to the new root folder (frees space in source)
- **Copy**: Duplicates files to the new root folder (keeps original)
:::

:::tip[Bulk Moves]
You can select multiple items in the library to move them all at once. This is useful for reorganizing your library structure.
:::

### Remove root folder

:::warning[Data Loss Warning]
Removing a root folder from Cinephage doesn't delete the actual files, but Cinephage will lose track of all items in that folder.
:::

1. Ensure all items are moved or unmonitored
2. Click **Delete** on root folder
3. Confirm removal

## See Also

- [Library Views](library-views) - Browse and filter your library
- [Adding Content](adding-content) - Add movies and TV shows to your library
- [Import Existing Files](../../use/import-existing-files) - Import your existing media
