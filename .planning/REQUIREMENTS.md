# REQUIREMENTS.md

## Milestone: v1.2-自动化发布实现

### Goal
Enable historical data browsing and implement the full Playwright-based automation flow for Douyin and Xiaohongshu publishing according to the user's manual steps.

### Functional Requirements

1. **Historical Data Management**
   - **Frontend:** Add a date picker (input type="date") next to the "Sync" button.
   - **Frontend:** Upon date change, fetch and load all data associated with that date from the database.
   - **Backend:** Refactor `/api/cache` to accept a `date` query parameter. If no date is provided, default to the current day.
   - **Database:** Ensure `trending_projects`, `project_summaries`, and `global_state` are correctly filtered by the provided date.

2. **Douyin Automation (Playwright)**
   - **Entry:** Click "Publish Images/Text" under "New Creation" on the creator micro home page.
   - **Upload:** Select and upload `0.png` through `capture.png` sequentially.
   - **Metadata:**
     - Fill "Date" (e.g., "2026年04月11日") into the title field (`placeholder="添加作品标题"` or `class="semi-input semi-input-default"`).
     - Fill "Global Summary" into the description field (target the `div` with `class="ace-line"` inside the editor container).
     - Add hashtags one by one using the "Add Topic" button.
   - **Settings:**
     - Select the "Github Trending" collection from the dropdown.
     - Select music: Pick the first item from the "Rising Chart" drawer.
   - **Finish:** Click "Publish".

3. **Xiaohongshu Automation (Playwright)**
   - **Entry:** Click "Publish Image/Text Note" under "New Creation".
   - **Upload:** Select `0.png`, then handle the geolocation permission popup ("Allow when visiting site"). Use the entry element under `class="img-upload-area"` to upload subsequent images.
   - **Metadata:**
     - Fill "Date" into the title field (`placeholder="填写标题会有更多赞哦"`).
     - Fill "Global Summary" into the description field (target the `p` inside `class="editor-content"`).
     - Add hashtags with spaces after each one.
   - **Settings:**
     - Select the relevant collection from the "Content Settings" menu.
     - Click the "Original Declaration" radio button.
   - **Finish:** Click "Publish".

### Non-Functional Requirements
- **Robustness:** Use smart waiting (e.g., `waitForSelector`, `waitForTimeout`) to handle dynamic UI rendering on creator platforms.
- **Feedback:** Provide real-time logs/status updates to the frontend during the automated publishing process.
- **Resilience:** If an element selector fails, try fallback selectors or log a descriptive error for manual intervention.
