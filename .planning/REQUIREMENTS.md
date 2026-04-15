# REQUIREMENTS.md

## Milestone: v1.3-代码重构与架构优化

### Goal
Refactor the codebase to separate concerns, making it easier to maintain, test, and extend.

### Functional Requirements

1. **Backend Modularization (`server.ts`)**
   - **Service Layer (`server/services/`):**
     - `databaseService.ts`: Manage SQLite connections and queries.
     - `aiService.ts`: Handle local Ollama interaction and parsing.
     - `githubService.ts`: Manage GitHub Trending scraping and README/Tags retrieval.
     - `platformService.ts`: Implement Douyin and Xiaohongshu automation flows.
   - **Route Layer (`server/routes/`):**
     - `apiRoutes.ts`: Define all REST endpoints, delegating logic to services.
   - **Entry Point:** `server.ts` should only contain Express setup and middleware registration.

2. **Frontend Componentization (`src/App.tsx`)**
   - **State & Logic Hook (`src/hooks/useAppLogic.ts`):** Centralize all `useState`, `useMemo`, and async API logic.
   - **Shared Components (`src/components/`):**
     - `Sidebar.tsx`: Control panel, template picker, and distribution buttons.
     - `PreviewPanel.tsx`: Container for the card preview.
     - `IndexCard.tsx`: Visual layout for the 15-project overview.
     - `DetailCard.tsx`: Visual layout for individual project details.
   - **Constants:** Move `TEMPLATES` and mocks to `src/constants.ts`.

### Non-Functional Requirements
- **Consistency:** Maintain all existing features (scraping, caching, automation) without regression.
- **Readability:** Individual files should generally stay under 300-400 lines where possible.
- **Type Safety:** Ensure all props and service return types are strictly defined in `src/types.ts` or corresponding backend type files.
