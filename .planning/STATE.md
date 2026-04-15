# STATE.md

## Current Milestone: v1.1 新版本 with sqlite
- **Phase:** Phase 4: SQLite Database Integration & Clean Summary
- **Status:** Initializing

## Task Tracking
- [ ] Task 4.1: Install `better-sqlite3` and create the initial database schema (projects, summaries, global state).
- [ ] Task 4.2: Refactor backend APIs to store fetched data and summaries in the DB and implement a "load from cache" endpoint.
- [ ] Task 4.3: Update the global summary AI prompt to strictly output plain text (no Markdown).
- [ ] Task 4.4: Add frontend buttons/logic to choose between cached data and forced regeneration.
- [ ] Task 5.1: Implement a `platform_sessions` table and backend logic to save/load browser cookies for Xiaohongshu and Douyin.
- [ ] Task 5.2: Create a settings UI component to input, save, and verify these platform cookies.
- [ ] Task 5.3: Perform a test browser launch that correctly injects the saved cookies for one of the target platforms.

## Key Decisions
- [Decided] Use `better-sqlite3` for fast, synchronous SQLite operations in the Node.js backend.
- [Decided] Store authentication cookies in SQLite to enable persistent sessions for automated social media posting.
- [Decided] Disallow Markdown in global summaries to ensure compatibility across all social platforms.

## Notes
- `v1.0` successfully implemented README-based AI summaries and sequential processing.
- Current AI model: Local Ollama (gemma4:e2b).
