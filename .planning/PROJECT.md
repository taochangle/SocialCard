# PROJECT.md

## Overview
A React + Vite + TypeScript app exported from Google AI Studio. It generates social media cards for GitHub Trending projects by scraping trending data, fetching READMEs, and using AI to produce summaries.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS v4, Lucide React, Motion (framer-motion).
- **Backend:** Express, Playwright (for scraping and automation), Axios, better-sqlite3.
- **AI:** Local Ollama (gemma4:e2b) for summarization and global analysis.
- **Export:** html-to-image (PNG), JSZip (for batch export).

## History
- **Initial Version:** Scrapes GitHub Trending, fetches tags using Playwright, provides 12 visual templates, supports high-res PNG export.
- **v1.0 detail中的总结优化:** Optimized detail view summaries by fetching project READMEs and generating AI-powered Chinese summaries sequentially. Added Global Summary and hashtags generation.

## Milestone: v1.1 新版本 with sqlite
- **Status:** Planning
- **Goal:** Introduce data persistence, improve summary formatting, and lay the foundation for automated social media posting.

### Objectives
1. **SQLite Integration (`better-sqlite3`):** Store trending projects, AI summaries, and hashtags locally to avoid re-fetching and losing data on refresh. Add UI controls to choose between loading cached data or regenerating it.
2. **Clean Global Summary:** Ensure the AI-generated "Today's Trend Summary" is plain text without Markdown formatting, making it compatible with more social media platforms.
3. **Playwright Automation Foundation:** Create a feature to store and manage authentication cookies for Xiaohongshu and Douyin, enabling future automated browser launches and posting.
