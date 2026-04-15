<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4984fe0a-d255-4e6e-a331-3306448e1aa1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`



前端重构 (src/App.tsx)
   1. 抽取常量: 将 TEMPLATES 和相关的硬编码数据移到 src/constants.ts。
   2. 自定义 Hook 封装逻辑: 将 fetchTrending、loadCache、publishToPlatform、exportImage 等核心业务逻辑和状态（如 trendingData、loading、platformStatus 等）抽离到一个自定义 Hook 中（例如 src/hooks/useAppLogic.ts）。
   3. 组件拆分:
       * Sidebar.tsx: 左侧控制面板组件。
       * PreviewPanel.tsx: 右侧预览区域。
       * IndexCard.tsx / DetailCard.tsx: 根据 layoutMode 分别展示的主视图组件。

  后端重构 (server.ts)
   1. 分层服务 (server/services/):
       * aiService.ts: 负责调用本地 Ollama 并格式化数据。
       * githubService.ts: 负责 Playwright 抓取和 GitHub API 获取 README/Tags。
       * platformService.ts: 负责抖音和小红书的 Playwright 自动化登录及发布逻辑。
   2. 路由提取 (server/routes/): 将 /api/trending、/api/cache 等路由提出来，保持主 server.ts 文件极为精简，仅做中间件加载和服务器启动。