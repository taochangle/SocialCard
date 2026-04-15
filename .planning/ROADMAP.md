# ROADMAP.md

## Milestone: v1.0 detail中的总结优化 (Completed)
...

## Milestone: v1.1 新版本 with sqlite (Completed)
...

## Milestone: v1.2-自动化发布实现

### Phase 6: 历史数据加载机制 (Historical Data Loading)
- **Goal:** Allow users to browse and load data from any previous day stored in SQLite.
- **Tasks:**
    - [x] **Task 6.1:** Refactor backend `/api/cache` endpoint to support a `date` query parameter.
    - [x] **Task 6.2:** Add a Date Picker component to the sidebar UI in `App.tsx`.
    - [x] **Task 6.3:** Implement frontend logic to re-trigger data loading when the date is changed.
- **Success Criteria:** Selecting a previous date in the UI instantly populates the project list and summaries with that day's data.

### Phase 7: 抖音自动化发布 (Douyin Automation)
- **Goal:** Implement the full Playwright script for Douyin based on `step.text`.
- **Tasks:**
    - [ ] **Task 7.1:** Implement image upload logic (sequentially handling `0.png` onwards).
    - [ ] **Task 7.2:** Implement metadata injection (date-based title, summary, hashtags).
    - [ ] **Task 7.3:** Automate collection and music selection steps.
- **Success Criteria:** Clicking "Auto Publish" for Douyin successfully completes the entire creation flow up to the final publish button.

### Phase 8: 小红书自动化发布 (Xiaohongshu Automation)
- **Goal:** Implement the full Playwright script for Xiaohongshu based on `step.text`.
- **Tasks:**
    - [ ] **Task 8.1:** Implement image upload and geolocation permission handling.
    - [ ] **Task 8.2:** Implement content injection (title, rich-text description, tags).
    - [ ] **Task 8.3:** Automate "Original Declaration" and collection selection.
- **Success Criteria:** Clicking "Auto Publish" for Xiaohongshu successfully navigates through the creation UI and prepares the note for publishing.
