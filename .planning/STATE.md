# STATE.md

## Current Milestone: v1.2-自动化发布实现
- **Phase:** Phase 6: 历史数据加载机制
- **Status:** Initializing

## Task Tracking
- [ ] Task 6.1: Refactor backend `/api/cache` endpoint to support a `date` query parameter.
- [ ] Task 6.2: Add a Date Picker component to the sidebar UI in `App.tsx`.
- [ ] Task 6.3: Implement frontend logic to re-trigger data loading when the date is changed.
- [ ] Task 7.1: Implement image upload logic (sequentially handling `0.png` onwards).
- [ ] Task 7.2: Implement metadata injection (date-based title, summary, hashtags).
- [ ] Task 7.3: Automate collection and music selection steps.
- [ ] Task 8.1: Implement image upload and geolocation permission handling.
- [ ] Task 8.2: Implement content injection (title, rich-text description, tags).
- [ ] Task 8.3: Automate "Original Declaration" and collection selection.

## Key Decisions
- [Decided] Use `input type="date"` for simplicity in historical data navigation.
- [Decided] Playwright scripts will use the saved `storageState` from the database to bypass manual login.
- [Decided] Automation will target specific creator studio selectors identified in `step.text`.

## Notes
- v1.1 established the database schema and session capturing foundation.
- v1.2 focuses on the final execution of the automation flow.
