# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Vite + TypeScript app exported from Google AI Studio. It generates social media cards for GitHub Trending projects by scraping trending data, fetching READMEs, and using Gemini AI to produce summaries.

## Common Commands

- **Start development server:** `npm run dev` (runs `tsx server.ts` — Express + Vite middleware)
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Type-check:** `npm run lint` (runs `tsc --noEmit`)
- **Clean build output:** `npm run clean`

There are currently no tests in this codebase.

## Architecture

### Dev Server (`server.ts`)

The development server is a custom Express app that:
1. Exposes `/api/trending` — scrapes GitHub Trending via Playwright (uses a hardcoded proxy at `http://127.0.0.1:7897`)
2. Exposes `/api/readme?owner=&repo=` — fetches raw README from the GitHub API (optionally using `GITHUB_PAT`)
3. Mounts Vite middleware in development, or serves static `dist/` files in production

### Frontend (`src/App.tsx`)

A single-page React app with two layout modes toggled by state:
- **Index mode (`layoutMode === 'index'`):** Renders a cover card listing the top 15 trending projects with a global AI summary.
- **Detail mode (`layoutMode === 'detail'`):** Renders a 3:4 card for the currently selected project, showing project stats, AI-generated summary, and highlighted keywords.

State flows:
1. `fetchTrending()` calls `/api/trending`
2. For each project, it calls `/api/readme` and sends the text to Gemini (`gemini-3-flash-preview`) to generate `aiSummary` and `aiKeywords`
3. A global summary is also generated from the full list
4. `applyProject(index)` loads a project's data into the detail view
5. `exportImage()` uses `html-to-image` (via `toPng`) to export the preview `div` as a high-res PNG

### Styling

- Tailwind CSS v4 with the new `@import "tailwindcss"` syntax in `src/index.css`
- Custom theme fonts: Inter for sans-serif, JetBrains Mono for monospace
- 12 built-in visual templates (`TEMPLATES` array in `App.tsx`) with configurable `outerBg`, `cardBg`, `textColor`, and `accentColor`

### Environment Variables

Required or used variables (see `.env.example`):
- `GEMINI_API_KEY` — Required for AI summary generation.
- `GITHUB_PAT` — Optional GitHub token for higher rate limits on README API calls.
- `APP_URL` — Injected by AI Studio at runtime.

### Important Notes

- `vite.config.ts` disables HMR when `DISABLE_HMR=true` (AI Studio default behavior to prevent flickering during agent edits).
- The Playwright scraper hardcodes a proxy (`http://127.0.0.1:7897`). If Playwright fails to launch or returns empty results, verify the proxy is reachable.
- The `@` path alias maps to the repository root (`.").
