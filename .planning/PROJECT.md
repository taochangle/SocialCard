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
- **v1.1 新版本 with sqlite:** Integrated `better-sqlite3` for local data persistence. Improved global summary formatting (removed Markdown). Established foundation for automated posting (cookie management).

## Milestone: v1.2-自动化发布实现
- **Status:** Planning
- **Goal:** Implement historical data loading via date selection and full automated publishing to Douyin and Xiaohongshu based on precise manual steps.

### Objectives
1. **Historical Data Loading:** Add a date picker UI to allow loading projects and summaries from SQLite for any previous day. Ensure data is organized by date.
2. **Douyin Automation:** Implement complete Playwright automation for Douyin creator studio, including image uploads, metadata entry, collection selection, and music choice.
3. **Xiaohongshu Automation:** Implement complete Playwright automation for Xiaohongshu, handling geolocation permission prompts, bulk image uploads, and original content declaration.
