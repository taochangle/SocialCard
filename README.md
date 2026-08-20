# 🚀 SocialCard: GitHub Trending 自动内容工厂

[![Version](https://img.shields.io/badge/version-1.0.0-cyan.svg)](https://github.com/taochangle/SocialCard)
[![License](https://img.shields.io/badge/license-Apache--2.0-white.svg)](LICENSE)
[![Built with AI](https://img.shields.io/badge/Built%20with-AI%20Coding-blueviolet.svg)]()

> **“让分享变得简单，让开源更有力量。”**  
> SocialCard 是一款专为开发者和技术博主设计的全栈自动化工具。它能将每日 GitHub 爆火项目自动转化为绝美的社交媒体图文，并一键分发至抖音平台。

---

## 📺 效果展示

| 1. 实时趋势抓取 | 2. AI 深度总结 |
| :---: | :---: |
| ![Scraping](docs/1.png) | ![AI Summary](docs/2.png) |

| 3. 多样视觉主题 | 4. 自动化分发中心 |
| :---: | :---: |
| ![Templates](docs/3.png) | ![Distribution](docs/4.png) |

| 5. 极致视觉预览 |
| :---: |
| ![Preview](docs/5.png) |

---

## ✨ 核心特性

### 1. 实时趋势洞察 📡
*   **自动化抓取**：基于 Playwright 的深度爬虫，每日准时捕捉 GitHub Trending。
*   **真实元数据**：自动同步项目真实头像、标签（Topics）和 Star 动态。

### 2. 深度 AI 智算 🧠
*   **多模型支持**：原生适配 **Ollama (本地私有化)** 与 **OpenAI SDK**。
*   **README 精炼**：AI 深度阅读 README，生成专业中文摘要。
*   **智能话题**：自动提取 5 个最具传播力的爆红 #话题。

### 3. 绝美视觉表现 🎨
*   **专业模板**：内置 12 套精心设计的视觉主题，满足从“赛博霓虹”到“极简便签”的审美需求。
*   **高清导出**：支持 9:16 竖屏比例图片（2x 高清渲染），上下蒙版区域营造层次感。

### 4. 自动化分发中心 🤖
*   **一键登录**：可视化扫码登录，持久化存储 Cookie 状态。
*   **全自动发布**：模拟真人行为，自动上传封面与详情图、填充标题描述、挂载合集与音乐。
*   **多平台适配**：目前已深度适配 **抖音 (Douyin)**。

---

## 🛠️ 技术架构

*   **Frontend**: React + Vite + TypeScript + Tailwind CSS v4.
*   **Backend**: Node.js + Express.
*   **Automation**: Playwright (Visible & Headless mode).
*   **Database**: SQLite (`better-sqlite3`) 实现极致的数据持久化与历史回溯。
*   **AI Engine**: OpenAI SDK 桥接本地模型。

---

## 🚀 快速开始

### 1. 克隆与安装
```bash
git clone https://github.com/taochangle/SocialCard.git
cd SocialCard
npm install
```

### 2. 环境配置
将 `.env.example` 重命名为 `.env`，填入您的 GitHub Token 和 AI 接口地址：
```env
GITHUB_PAT="your_github_token"
AI_BASE_URL="http://localhost:11434/v1"
AI_MODEL="gemma4:e2b"
```

### 3. 启动应用
```bash
npm run dev
```
访问 `http://localhost:3000`，开启您的内容创作之旅！

---

## 🤝 贡献与反馈

如果您有任何想法或建议，欢迎提交 **Issue** 或 **Pull Request**。

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%202.0-blue.svg)]()

---

**SocialCard** - 让每一行代码的闪光点，都能被更多人看见。

---
*Created and maintained with ⚡️ by **Gemini 2.0**.*
