# ROADMAP.md

## Milestone: v1.0 detail中的总结优化

### Phase 1: Backend Enhancement (API Development)
- **Goal:** Create a robust endpoint that combines README fetching and AI summarization.
- **Tasks:**
    - [x] **Task 1.1:** Refactor existing README fetching and summarization logic into reusable functions in `server.ts`.
    - [x] **Task 1.2:** Implement `/api/process-readme` endpoint taking `owner` and `repo` as parameters.
    - [x] **Task 1.3:** Test the new endpoint with sample projects to ensure correct Chinese output.
- **Success Criteria:** `/api/process-readme` correctly returns a JSON with `summary` and `keywords` for a given GitHub project.

### Phase 2: Frontend Integration (Batch Processing)
- **Goal:** Update the frontend to trigger the AI summary generation process after fetching trending projects.
- **Tasks:**
    - [x] **Task 2.1:** Implement a batch processing loop in `fetchTrending` that calls `/api/process-readme` for each project sequentially.
    - [x] **Task 2.2:** Add state for tracking progress and display it in the UI (e.g., updating `statusMsg` or `processProgress`).
    - [x] **Task 2.3:** Implement fallback logic to use `item.content` if the AI summary fails.
- **Success Criteria:** After clicking refresh, all projects in the list gradually get AI-generated summaries and keywords.

### Phase 3: Verification and UI Refinement
- **Goal:** Finalize the user experience and ensure stability.
- **Tasks:**
    - [x] **Task 3.1:** Verify that the detail view correctly displays the AI summary and highlights keywords.
    - [x] **Task 3.2:** Perform a full end-to-end test of the "refresh -> process -> export" flow.
    - [x] **Task 3.3:** Polish UI elements related to progress and error reporting.
- **Success Criteria:** A complete set of social cards with optimized summaries can be generated and exported without errors.

## Milestone: v1.1 新版本 with sqlite

### Phase 4: SQLite Database Integration & Clean Summary
- **Goal:** Implement data persistence and refine summary formatting.
- **Tasks:**
    - [ ] **Task 4.1:** Install `better-sqlite3` and create the initial database schema (projects, summaries, global state).
    - [ ] **Task 4.2:** Refactor backend APIs to store fetched data and summaries in the DB and implement a "load from cache" endpoint.
    - [ ] **Task 4.3:** Update the global summary AI prompt to strictly output plain text (no Markdown).
    - [ ] **Task 4.4:** Add frontend buttons/logic to choose between cached data and forced regeneration.
- **Success Criteria:** Data is preserved across page refreshes, and the global summary is free of Markdown.

### Phase 5: Playwright Automation Foundation
- **Goal:** Lay the groundwork for automated social media posting.
- **Tasks:**
    - [ ] **Task 5.1:** Implement a `platform_sessions` table and backend logic to save/load browser cookies for Xiaohongshu and Douyin.
    - [ ] **Task 5.2:** Create a settings UI component to input, save, and verify these platform cookies.
    - [ ] **Task 5.3:** Perform a test browser launch that correctly injects the saved cookies for one of the target platforms.
- **Success Criteria:** Authentication cookies for target platforms can be securely saved and used to launch an authenticated browser session.
