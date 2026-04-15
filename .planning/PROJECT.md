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

## Milestone: v1.3-代码重构与架构优化
- **Status:** Planning
- **Goal:** Improve maintainability and scalability by decomposing large single-file components and server logic into modular structures.

### Objectives
1. **Server-side Refactoring:** Split `server.ts` into separate modules for Routes (API definitions) and Services (Business logic for AI, GitHub scraping, Platform automation, and Database).
2. **Client-side Componentization:** Break down `App.tsx` into smaller, focused React components and a custom Hook (`useAppLogic`) to manage complex states and API interactions.
3. **Architecture Standard:** Establish a clear directory structure for future feature expansion.
