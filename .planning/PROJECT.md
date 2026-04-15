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
- **v1.2-自动化发布实现:** Implemented historical data loading via date selection and full Playwright automation for Douyin and Xiaohongshu publishing based on manual steps.
- **v1.3-代码重构与架构优化:** Successfully decomposed monolithic `App.tsx` and `server.ts` into modular components, hooks, and services. Established a clean directory structure.

## Milestone: v1.4-细节打磨与功能扩展
- **Status:** Planning
- **Goal:** Polish the user interface for better usability, focusing on sidebar layout, navigation components, and fixed-positioning elements.

### Objectives
1. **Enhanced Date Selection:** Replace the basic HTML date input with a more integrated and user-friendly date selection component.
2. **Sidebar Layout Optimization:** Reorder sidebar sections (Distribution above Hashtags) and ensure the entire sidebar is scrollable when content overflows.
3. **Fixed Footer Actions:** Fix the "Export PNG" action button to the bottom of the sidebar for constant accessibility.
