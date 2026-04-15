# STATE.md

## Current Milestone: v1.3-代码重构与架构优化
- **Phase:** Phase 9: 后端模块化
- **Status:** Initializing

## Task Tracking
- [ ] Task 9.1: Create `server/services` directory and migrate logic into `dbService.ts`, `aiService.ts`, `githubService.ts`, and `platformService.ts`.
- [ ] Task 9.2: Create `server/routes/api.ts` and migrate all Express routes.
- [ ] Task 9.3: Clean up `server.ts` to act as a lightweight entry point.
- [ ] Task 10.1: Move constants and helper functions to `src/constants.ts` and `src/utils.ts`.
- [ ] Task 10.2: Extract state management and API orchestration into `src/hooks/useAppLogic.ts`.
- [ ] Task 10.3: Create UI components: `Sidebar`, `IndexCard`, `DetailCard`, and `PreviewPanel`.
- [ ] Task 10.4: Simplify `App.tsx` to a high-level layout container.

## Key Decisions
- [Decided] Adopt a service-oriented architecture for the backend to isolate Playwright and AI logic.
- [Decided] Use a single custom Hook (`useAppLogic`) to maintain synchronous state across multiple components.
- [Decided] Strictly adhere to the directory structure: `server/services`, `server/routes`, `src/components`, `src/hooks`.

## Notes
- v1.2 successfully delivered all automated distribution features.
- Refactoring aims to make the ~1200 line App.tsx and ~600 line server.ts manageable.
