---
title: Set Up Smart Lists
description: Create dynamic TMDB-powered lists that automatically discover and add content to your library
sidebar_position: 6
tags: [smart-lists, automation, configuration, guide, tmdb]
keywords: [smart lists, automation, tmdb, discovery]
---

# Set up smart lists

Smart Lists are dynamic, TMDB-powered lists that automatically discover content based on your criteria and optionally add it to your library.

## What Are Smart Lists?

Smart Lists continuously monitor TMDB's database and automatically find content that matches your preferences. They can:

- Query TMDB's Discover API with custom filters
- Refresh periodically to find new releases
- Automatically add matching items to your library
- Trigger automatic searches for added items
- Create curated collections based on genres, ratings, or custom criteria

## Use Cases

| Use Case | Description |
|----------|-------------|
| **Trending Content** | Auto-add popular movies from the last year |
| **Genre Collections** | Maintain a curated horror or comedy collection |
| **High-Rated TV** | Auto-discover highly-rated series |
| **Award Winners** | Track Oscar-winning or nominated films |
| **New Releases** | Stay current with latest releases in your favorite genres |

## Creating a Smart List

### Step 1: access smart lists

1. Navigate to **Smart Lists** in the main navigation
2. Click the **Add Smart List** button
3. The Smart List configuration modal will open

### Step 2: basic configuration

Configure the fundamental settings for your list:

| Setting | Description | Required |
|---------|-------------|----------|
| **Name** | Display name for the list | Yes |
| **Media Type** | Movies or TV Shows | Yes |
| **Root Folder** | Where to store added items | Yes (if auto-add enabled) |
| **Quality Profile** | Profile assigned to added items | Yes (if auto-add enabled) |
| **Language Profile** | Language settings for added items | Yes (if auto-add enabled) |
| **Limit** | Maximum items to keep in list | No (default: 100) |

### Step 3: configure filters

Smart Lists support 50+ TMDB Discover filters organized by category:

#### Genre Filters

Include or exclude specific genres:

- **Action**
- **Adventure**
- **Animation**
- **Comedy**
- **Crime**
- **Documentary**
- **Drama**
- **Family**
- **Fantasy**
- **History**
- **Horror**
- **Music**
- **Mystery**
- **Romance**
- **Science Fiction**
- **TV Movie**
- **Thriller**
- **War**
- **Western**

:::tip
Combine include and exclude filters for precise control. For example: Include "Horror" + Exclude "Comedy" for serious horror films only.
:::

#### Rating Filters

Filter by quality ratings:

| Filter | Description | Example |
|--------|-------------|---------|
| **Minimum Rating** | Lowest TMDB rating to include | 7.0+ |
| **Maximum Rating** | Highest TMDB rating to include | 9.0 |
| **Minimum Vote Count** | Filters out obscure titles | 1000+ votes |

:::tip[Vote Count Filter]
Always use a minimum vote count (e.g., 100-1000) to filter out titles with inflated ratings from few votes.
:::

#### Date Filters

Filter by release timeframe:

- **Release Year Range** - Specific years or ranges (e.g., 2020-2024)
- **Released After** - Movies newer than a date
- **Released Before** - Movies older than a date
- **Upcoming Only** - Not yet released

#### Popularity Filters

Filter by TMDB popularity metrics:

| Filter | Description |
|--------|-------------|
| **Minimum Popularity** | TMDB popularity score threshold |
| **Maximum Popularity** | Upper popularity limit |
| **Sort By** | Order results by popularity, rating, or date |

#### Advanced Filters

Additional filtering options:

- **Original Language** - Filter by primary language
- **Keywords** - Include/exclude specific keywords
- **Cast/Crew** - Filter by actors or directors
- **Production Company** - Filter by studio
- **Runtime** - Minimum/maximum runtime in minutes
- **Revenue** - Box office performance filters

### Step 4: sort options

Choose how results are ordered:

| Sort Option | Description | Best For |
|-------------|-------------|----------|
| **Popularity Descending** | Most popular first | Trending content |
| **Rating Descending** | Highest rated first | Quality collections |
| **Release Date Descending** | Newest first | Latest releases |
| **Revenue Descending** | Highest grossing first | Blockbusters |
| **Vote Count Descending** | Most rated first | Established titles |

### Step 5: configure auto-add behavior

Control what happens when new items match your filters:

| Option | Behavior | Use Case |
|--------|----------|----------|
| **Disabled** | Items appear in list only; manual approval required | Curated browsing |
| **Add Only** | Auto-add to library but don't search | Queue for later |
| **Add and Search** | Auto-add and immediately search for download | Full automation |

:::caution
**Add and Search** will automatically download content that matches your filters. Review your filters carefully before enabling.
:::

### Step 6: set refresh interval

Configure how often the list refreshes:

- **Default:** 6 hours
- **Minimum:** 1 hour (not recommended due to rate limits)
- **Maximum:** 7 days

:::note[TMDB Rate Limits]
TMDB has rate limits on their API. Refreshing too frequently may cause temporary blocks. 6 hours is recommended for most use cases.
:::

### Step 7: save the list

Click **Save** to create the Smart List. The list will immediately query TMDB and populate based on your filters.

## Managing Smart Lists

### Viewing list contents

Each Smart List shows:

- **Matching Items** - All items currently matching your filters
- **Status Indicators**:
  -  In Library - Already added to your library
  -  Monitored - In library and being monitored
  -  Downloaded - Available locally
  -  Not Added - Matching but not in library
- **TMDB Metadata** - Rating, popularity, release date
- **Added Date** - When item first appeared in list

### Excluding items

If specific items match your filters but you don't want them:

1. Click on the item in the list
2. Select **Exclude from List**
3. The item is added to the exclusion list

**To Re-include:**

1. Go to Smart List settings
2. Click **View Excluded Items**
3. Click **Remove Exclusion** next to the item

### Manual refresh

Force an immediate refresh:

1. Navigate to your Smart List
2. Click **Refresh Now** button
3. List updates with current TMDB data

:::note
Manual refreshes still respect TMDB rate limits. If you've refreshed recently, you may need to wait.
:::

### Editing lists

Modify existing Smart Lists:

1. Go to **Smart Lists**
2. Click the **Edit** icon on your list
3. Modify settings, filters, or auto-add behavior
4. Click **Save**

**What happens when you edit:**
- Filters are immediately re-applied
- Items no longer matching are marked (not removed)
- New matching items are added
- Auto-add behavior applies to newly matched items

## Example Smart Lists

### Example 1: trending action movies

```yaml
Name: "Trending Action"
Media Type: Movies
Filters:
  Genre: Include Action
  Release Date: Last 2 years
  Minimum Vote Count: 500
Sort: Popularity Descending
Limit: 50
Auto-Add: Add and Search
Quality Profile: Balanced
```

### Example 2: highly rated TV dramas

```yaml
Name: "Prestige TV"
Media Type: TV Shows
Filters:
  Genre: Include Drama
  Minimum Rating: 8.0
  Minimum Vote Count: 1000
Sort: Rating Descending
Limit: 30
Auto-Add: Add Only
Quality Profile: Quality
```

### Example 3: new anime releases

```yaml
Name: "New Anime"
Media Type: TV Shows
Filters:
  Keywords: anime
  Release Date: Last 6 months
  Original Language: Japanese
Sort: Release Date Descending
Limit: 25
Auto-Add: Add and Search
Quality Profile: Balanced
```

### Example 4: award-winning films

```yaml
Name: "Award Winners"
Media Type: Movies
Filters:
  Minimum Rating: 8.5
  Minimum Vote Count: 5000
  Keywords: oscar, academy award, golden globe
Sort: Rating Descending
Limit: 100
Auto-Add: Disabled (manual curation)
Quality Profile: Quality
```

### Example 5: family movie night

```yaml
Name: "Family Movies"
Media Type: Movies
Filters:
  Genre: Include Family, Animation
  Exclude Genre: Horror, Thriller
  Maximum Rating: 7.0
  Minimum Rating: 6.0
Sort: Popularity Descending
Limit: 50
Auto-Add: Add Only
Quality Profile: Balanced
```

## Advanced Tips

### Optimizing filters

1. **Start Broad, Then Narrow** - Begin with fewer filters and add more based on results
2. **Use Vote Count** - Always include minimum vote count to filter out obscure titles
3. **Combine Filters** - Multiple specific filters yield better results than one broad filter
4. **Review Regularly** - Check what's being added and adjust filters accordingly

### Managing list size

- **Set Reasonable Limits** - 50-100 items is manageable; larger lists become unwieldy
- **Use Sort Order** - Most relevant items appear first when sorted by popularity/rating
- **Clean Up Exclusions** - Periodically review excluded items in case preferences change

### Automation best practices

**Start Conservative:**
1. Create list with **Auto-Add: Disabled**
2. Review items for a few days
3. Enable **Add Only** if satisfied
4. Consider **Add and Search** after thorough testing

**Monitor Usage:**
- Check **Tasks > Smart List Refresh** history
- Review what was auto-added in Activity logs
- Adjust filters if too many or too few items match

### Multiple lists strategy

Create specialized lists rather than one broad list:

- **Trending** - Popular new releases
- **Classics** - Highly-rated older films
- **Genre-Specific** - One list per favorite genre
- **Language-Specific** - Foreign language collections

## Troubleshooting

### List not populating

**Check TMDB Connection:**
- Verify TMDB API key is valid in Settings
- Check for rate limit messages in logs
- Try manual refresh after waiting 1 hour

**Review Filter Criteria:**
- Too many filters may exclude all content
- Check if filters conflict (e.g., date range too narrow)
- Verify genre names are spelled correctly

### Items not auto-adding

**Check Auto-Add Setting:**
- Ensure auto-add is not set to "Disabled"
- Verify root folder is configured and accessible
- Check quality profile is valid

**Check Library Settings:**
- Ensure root folder has write permissions
- Verify available disk space
- Check if items already exist in library

### Too many items matching

**Refine Filters:**
- Increase minimum rating threshold
- Add minimum vote count requirement
- Narrow date range
- Add exclusion filters

**Reduce Limit:**
- Lower the maximum items limit
- Change sort order to show most relevant first

### Items disappearing

This is expected behavior - Smart Lists reflect current TMDB data:

- Movies removed from TMDB disappear
- Items no longer matching filters are marked
- Use exclusion list to prevent specific items from returning

## External list sources

In addition to TMDB Discover filters, Smart Lists can pull from external list sources:

| Source | Description | Status |
|--------|-------------|--------|
| **IMDb list** | Import content from a public IMDb list URL | Available |
| **JSON URL** | Import from a remote JSON file with a compatible format | Available |
| **Custom manual** | Manually curated list managed inside Cinephage | Available |
| **TMDB list** | Import from a TMDB list ID | Available |
| **Trakt list** | Import from a Trakt list | Not yet implemented |

To use an external source, select it as the **List Source** when creating or editing a Smart List. IMDb and JSON URL sources require a valid public URL.

## Limitations

### TMDB dependencies

- Results depend on TMDB's data accuracy and completeness
- Some titles may be missing or have incorrect metadata
- TMDB API rate limits apply (approximately 40 requests per 10 seconds)

### Filter constraints

- Some filter combinations may return no results
- Keywords must match TMDB's keyword database exactly
- Cast/crew filters require exact TMDB person IDs

### Refresh behavior

- Lists refresh based on the configured interval
- Manual refreshes are still subject to rate limits
- Very large lists may take time to process

## See Also

- [Configure Quality Profiles](../quality/quality-profiles) - Set up quality profiles for auto-added items
- [Configure Indexers](../indexers) - Ensure indexers are configured for automatic search
- [Understanding the Interface](/getting-started/understanding-interface) - Learn about the Library view
