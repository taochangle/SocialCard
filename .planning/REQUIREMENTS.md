# REQUIREMENTS.md

## Milestone: v1.0 detail中的总结优化

### Goal
Optimize the detail view's summary by using project READMEs to generate AI-powered Chinese summaries instead of relying solely on the trending page's short description.

### Functional Requirements
1.  **Backend: README Processing API**
    - Create or update an endpoint `/api/process-readme` that:
        - Takes `owner` and `repo` as parameters.
        - Fetches the README content (using existing logic in `/api/readme`).
        - Summarizes the README into a concise Chinese text (within 140 chars) using the AI model (using existing logic in `/api/summarize`).
        - Returns both the `summary` and `keywords`.
    - Ensure robust error handling for failed README fetches or AI calls.
    - Ensure the summarization model generates response in Chinese.

2.  **Frontend: Batch Processing Workflow**
    - After fetching the trending project list:
        - Trigger a sequential process to fetch and summarize READMEs for all projects.
        - The process should be "one by one" to manage load and provide better progress feedback.
        - Track and display progress (e.g., "Summarizing project 5/15...").
    - **Fallback Logic:** If the AI summary generation fails for a project, the original description (`item.content`) must be used as a fallback.
    - **Speed Optimization:** Consider ways to speed up the overall process while maintaining stability (e.g., fetching READMEs in parallel but summarizing sequentially).

3.  **Frontend: Detail View Integration**
    - Update `applyProject` to prefer `item.aiSummary` and `item.aiKeywords` if available.
    - Ensure the summary text is displayed correctly with keyword highlighting.

### Non-Functional Requirements
- **Stability:** The batch process should be resilient to individual project failures.
- **Speed:** The total processing time should be as low as possible without hitting API rate limits.
- **User Experience:** Clear progress feedback should be provided to the user during the processing phase.
