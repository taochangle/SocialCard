# PROJECT.md

## Overview
A React + Vite + TypeScript app exported from Google AI Studio. It generates social media cards for GitHub Trending projects by scraping trending data, fetching READMEs, and using AI to produce summaries.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS v4, Lucide React, Motion (framer-motion).
- **Backend:** Express, Playwright (for scraping), Axios.
- **AI:** NVIDIA NIM (DeepSeek model) for summarization and global analysis.
- **Export:** html-to-image (PNG), JSZip (for batch export).

## History
- **Initial Version:** Scrapes GitHub Trending, fetches tags using Playwright, provides 12 visual templates, supports high-res PNG export.
- **Current State:** Uses `descriptionEl` from the trending page for content by default.

## Milestone: v1.0 detail中的总结优化
- **Status:** Planning
- **Goal:** Optimize detail view summaries by using project READMEs instead of short descriptions.

### Objectives
- Fetch READMEs for all projects.
- Summarize READMEs into concise Chinese text (within 140 chars).
- Process projects sequentially or in manageable batches to optimize speed and stability.
- Implement fallback to the original description if README fetching or summarization fails.
- Update the detail view to display the AI-generated summary and keywords.
