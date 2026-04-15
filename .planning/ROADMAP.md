# ROADMAP.md

## Milestone: v1.0 detail中的总结优化 (Completed)
...

## Milestone: v1.1 新版本 with sqlite (Completed)
...

## Milestone: v1.2-自动化发布实现 (Completed)
...

## Milestone: v1.3-代码重构与架构优化

### Phase 9: 后端模块化 (Backend Modularization)
- **Goal:** Split `server.ts` into a cleaner service-oriented architecture.
- **Tasks:**
    - [x] **Task 9.1:** Create `server/services` directory and migrate logic into `dbService.ts`, `aiService.ts`, `githubService.ts`, and `platformService.ts`.
    - [x] **Task 9.2:** Create `server/routes/api.ts` and migrate all Express routes.
    - [x] **Task 9.3:** Clean up `server.ts` to act as a lightweight entry point.
- **Success Criteria:** The server runs without errors and all existing API endpoints return correct data.

### Phase 10: 前端组件化 (Frontend Componentization)
- **Goal:** Break down `App.tsx` into a custom Hook and specialized components.
- **Tasks:**
    - [x] **Task 10.1:** Move constants and helper functions to `src/constants.ts` and `src/utils.ts`.
    - [x] **Task 10.2:** Extract state management and API orchestration into `src/hooks/useAppLogic.ts`.
    - [x] **Task 10.3:** Create UI components: `Sidebar`, `IndexCard`, `DetailCard`, and `PreviewPanel`.
    - [x] **Task 10.4:** Simplify `App.tsx` to a high-level layout container.
- **Success Criteria:** The application UI remains identical in behavior and appearance, but the code is distributed across focused files.
