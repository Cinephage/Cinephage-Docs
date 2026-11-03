---
title: Supported Languages
description: Language codes and subtitle language support
sidebar_position: 3
tags: [languages, subtitles, reference]
keywords: [languages, subtitles, iso codes, i18n]
---

# Supported languages

This reference lists the languages supported by Cinephage for subtitles and metadata, and separately, the languages the web UI itself is translated into.

## Subtitle/metadata language codes

Cinephage uses ISO 639-1 (2-letter) codes as the primary identifier for subtitle and content languages, with ISO 639-2 (3-letter) codes used internally for matching languages in release/file names. This is the full supported list, ordered by approximate global usage:

| Language | Code | Language | Code |
| -------- | ---- | -------- | ---- |
| English | en | Romanian | ro |
| Spanish | es | Bulgarian | bg |
| French | fr | Ukrainian | uk |
| German | de | Indonesian | id |
| Italian | it | Malay | ms |
| Portuguese | pt | Croatian | hr |
| Russian | ru | Serbian | sr |
| Chinese | zh | Slovak | sk |
| Japanese | ja | Slovenian | sl |
| Korean | ko | Estonian | et |
| Arabic | ar | Latvian | lv |
| Hindi | hi | Lithuanian | lt |
| Dutch | nl | Persian | fa |
| Polish | pl | Bengali | bn |
| Swedish | sv | Tamil | ta |
| Norwegian | no | Telugu | te |
| Danish | da | Malayalam | ml |
| Finnish | fi | Kannada | kn |
| Greek | el | Marathi | mr |
| Turkish | tr | Gujarati | gu |
| Hebrew | he | Punjabi | pa |
| Thai | th | Urdu | ur |
| Vietnamese | vi | Nepali | ne |
| Czech | cs | Sinhala | si |
| Hungarian | hu | Burmese | my |

Additional supported languages: Khmer (`km`), Lao (`lo`), Mongolian (`mn`), Georgian (`ka`), Azerbaijani (`az`), Kazakh (`kk`), Uzbek (`uz`), Tagalog (`tl`), Swahili (`sw`), Amharic (`am`), Icelandic (`is`), Macedonian (`mk`), Bosnian (`bs`), Albanian (`sq`), Welsh (`cy`), Irish (`ga`), Maltese (`mt`), Basque (`eu`), Catalan (`ca`), Galician (`gl`), Afrikaans (`af`), Armenian (`hy`), Belarusian (`be`), Kurdish (`ku`), and Esperanto (`eo`).

Some languages have regional variants selectable separately, e.g. `es-la` (Spanish, Latin America), `fr-ca` (French, Canada), `pt-br` (Portuguese, Brazil), `zh-tw`/`zh-cn` (Chinese Traditional/Simplified).

## Interface (UI) languages

The Cinephage web interface itself (not subtitle/metadata content) currently ships with translations for a smaller set of languages, managed via Paraglide JS:

| Language | Code |
| -------- | ---- |
| English (source language) | en |
| German | de |
| Spanish | es |
| Russian | ru |

## See Also

- [Configure Subtitles](/guides/configure/languages/subtitles) - Subtitle configuration
- [Language Profiles](/guides/configure/languages/subtitles#part-2-configure-subtitle-requirements-on-a-language-profile) - Language profile setup
