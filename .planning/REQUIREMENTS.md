# REQUIREMENTS.md

## Milestone: v1.1 新版本 with sqlite

### Goal
Implement local data persistence using SQLite, ensure AI summaries are plain-text for better compatibility, and create a foundation for automated social media posting.

### Functional Requirements

1. **SQLite Data Persistence**
   - **Backend:** Integrate `better-sqlite3`.
   - **Schema:**
     - `trending_projects`: Store project details (title, description, stars, url, tags, rank).
     - `project_summaries`: Store AI-generated summaries and keywords, linked to projects.
     - `global_states`: Store the current global summary, hashtags, and timestamp.
     - `platform_sessions`: Store encrypted or raw cookies for Xiaohongshu and Douyin.
   - **Behavior:**
     - On first load/refresh, if cached data exists and is "fresh" (e.g., within the last 24 hours), load it immediately.
     - Provide a UI button to force a complete re-generation (scraping + AI).

2. **Clean AI Summaries**
   - Refine the `/api/global-summary` prompt to strictly forbid Markdown formatting (no headers, bold text, or lists).
   - The output must be a plain string ready for copy-pasting into social media apps.

3. **Platform Cookie Management**
   - Create an admin-style UI or settings panel to input and save authentication cookies for Xiaohongshu and Douyin.
   - Implement a backend API to securely store these cookies in the SQLite database.
   - Validate cookie presence before initiating any future automation tasks.

4. **Frontend UI Enhancements**
   - Add a "Load from Cache" vs "Fetch Fresh" toggle or button set.
   - Add a "Cookie Settings" button that opens a modal for session management.

### Non-Functional Requirements
- **Performance:** Loading from SQLite should be near-instantaneous compared to scraping/AI generation.
- **Reliability:** The system should gracefully handle missing cache or database errors by falling back to fresh fetching.
- **Privacy:** Cookies should be stored locally and never transmitted to external servers except for the intended platform automation.
