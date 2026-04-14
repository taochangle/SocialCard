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
