---
title: Language Preferences
description: Configure per-library subtitle and language settings
sidebar_position: 1
tags: [library, language, subtitles, configuration, guide]
keywords: [library, language, subtitles, preferences]
---

# Language preferences

Cinephage uses **language profiles** to control which subtitle languages are required or preferred for your content. Resolution for a given movie or series checks, in order: an override set directly on that item, then a default set on its library, then the single instance-wide default language profile.

## How It Works

- Create one or more language profiles (each defining required/preferred subtitle languages)
- Set a **default language profile** used instance-wide for any library that doesn't set its own
- Optionally set a **default language profile per library**, overriding the instance default for everything in that library with no item-level override
- Override the language profile on individual movies or series when needed
- Bulk-assign a different language profile to multiple library items at once

## Setting Language Preferences

### Step 1: create language profiles

1. Go to **Settings > Library > Media Languages**
2. Create profiles for different use cases:
   - `English Primary` - English required, Spanish optional
   - `English Only` - English required only
   - `Multi-Language` - Multiple languages required

### Step 2: set the default language profile

On the same **Settings > Library > Media Languages** page:

1. Under default settings, select the **Default Language Profile** applied to newly-added movies and series
2. Optionally set a **Default Fallback Language** used when no profile match is available

### Step 3: override for a specific library (optional)

1. Go to **Settings > Libraries** and edit the library
2. Select a **Language Profile** for that library - every movie/series in it with no item-level override uses this instead of the instance default
3. Save

### Step 4: override for a specific movie or series (optional)

1. Go to the movie or series detail page
2. Click **Edit**
3. Select a different **Language Profile** for this item, or toggle whether subtitles are wanted at all
4. Save

## Bulk Assign Language Profile

Apply a language profile to multiple items at once:

1. Go to **Library > Movies** (or **TV Shows**)
2. Select multiple items using checkboxes
3. Click **Edit**
4. Under **Language Profile**, select a new profile
5. Click **Save**

This changes the subtitle behavior for all selected items.

## See Also

- [Subtitles](subtitles) - Subtitle provider configuration
- [Root Folders](../library/root-folders) - Configure root folder settings
