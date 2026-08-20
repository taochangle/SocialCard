# Repository Guidelines

## Project Structure & Module Organization

- `server.ts` — Express entry point; mounts `/api` routes and serves the Vite app (dev) or `dist/` (production).
- `src/` — React + TypeScript frontend: `components/`, `hooks/useAppLogic.ts` (state machine), `constants.ts`, `types.ts`, `utils.ts`.
- `server/` — `routes/` (REST endpoints) and `services/` (GitHub scraping, AI, SQLite, platform automation).
- `docs/` — README screenshots; `public/` — static assets; `data.db` — SQLite database (runtime-generated, gitignored).

## Build, Test, and Development Commands

- `npm install` — install dependencies.
- `npm run dev` — start Express + Vite at http://localhost:3000.
- `npm run lint` / `npm run lint:fix` — ESLint check/fix (`eslint.config.js`).
- `npm run type-check` — run `tsc --noEmit`.
- `npm run build` — build frontend to `dist/`; `npm run preview` — preview `dist/`.

## Coding Style & Naming Conventions

- TypeScript for all code; 2-space indentation, single quotes, semicolons.
- `camelCase` for variables/functions, `PascalCase` for components, `UPPER_SNAKE_CASE` for constants (e.g. `TEMPLATES`).
- Backend services follow `xxxService.ts`; all routes live in `apiRoutes.ts`.
- `videoService.ts` converts 9:16 PNG frames into an MP4 (H.264 + AAC) via the system `ffmpeg` (required for YouTube Shorts).
- UI uses Tailwind utility classes; keep components focused and import shared types from `src/types.ts`.

## Testing Guidelines

- No test framework exists. If you add tests, use colocated `*.test.ts` files with Vitest; otherwise verify via `npm run type-check`, `npm run lint`, and the dev server.

## Commit & Pull Request Guidelines

- Commits use Chinese, conventional-style messages (`docs: ...`, `chore: ...`, `优化：...`, `修正：...`) with a type prefix and a one-sentence what/why.
- PRs: link the issue, summarize impact, and add before/after screenshots for UI or automation changes. Flag any Playwright selector changes — they are DOM-coupled and break easily.

## Security & Configuration Tips

- Copy `.env.example` to `.env` (gitignored; never commit). Required variables: `GITHUB_PAT`, `AI_BASE_URL`, `AI_MODEL` (Ollama by default).
- Playwright drives the system Google Chrome (`channel: "chrome"`, `headless: false`) — Chrome must be installed and a desktop display is required; do not install Playwright's bundled Chromium.
- `server/stealth.min.js` (puppeteer-extra stealth evasions, MIT) is injected for YouTube sessions to avoid Google's automated-login block; do not remove it.
- `ffmpeg` must be installed for YouTube MP4 export (`brew install ffmpeg` if missing).
- Set `YT_PROXY` (e.g. `http://127.0.0.1:7890`) in `.env` if YouTube is unreachable from the local network.

## Agent-Specific Instructions

- Keep changes scoped; never commit generated artifacts (`dist/`, `data.db`, `.env`). Run `npm run lint` and `npm run type-check` before finishing; prefer minimal, surgical edits.

## Architecture Overview

- Scrape GitHub Trending (Top 15) → fetch topics/avatar/README via the GitHub API → Ollama generates Chinese + English summaries, keywords, and a daily digest → cache in SQLite → render 9:16 cards via `html-to-image` → Playwright publishes image carousels to Douyin (Chinese copy). YouTube Shorts is manual: the UI exports a 9:16 MP4 via `ffmpeg` plus English title/description/hashtags for pasting into YouTube Studio. (Automated YouTube code remains in `platformService.ts` but is not exposed in the UI.)
