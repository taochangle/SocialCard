import express from "express";
import fs from "fs/promises";
import path from "path";
import { dbService } from "../services/dbService.js";
import { aiService } from "../services/aiService.js";
import { githubService } from "../services/githubService.js";
import { platformService } from "../services/platformService.js";
import { videoService } from "../services/videoService.js";

const router = express.Router();

const BGM_DIR = path.resolve(process.cwd(), "public/bgm");

// List available background music tracks (public/bgm/*.mp3)
router.get("/bgm", async (_req, res) => {
  try {
    const files = (await fs.readdir(BGM_DIR))
      .filter((f) => f.endsWith(".mp3"))
      .sort();
    res.json({ tracks: files });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Get cached data
router.get("/cache", (req, res) => {
  const targetDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
  try {
    const projects = dbService.getProjectsByDate(targetDate);
    const globalState = dbService.getGlobalStateByDate(targetDate);

    if (projects.length > 0) {
      res.json({
        projects,
        globalSummary: globalState?.summary || "",
        globalHashtags: globalState?.hashtags || "",
        globalSummaryEn: globalState?.summaryEn || "",
        globalHashtagsEn: globalState?.hashtagsEn || ""
      });
    } else {
      res.status(404).json({ error: "No cache found for date" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GitHub Trending Scraper
router.get("/trending", async (req, res) => {
  const targetDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
  try {
    const items = await githubService.fetchTrendingProjects();
    dbService.saveTrendingProjects(targetDate, items);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch README
router.get("/readme", async (req, res) => {
  const { owner, repo } = req.query;
  if (!owner || !repo) return res.status(400).json({ error: "Owner/repo required" });
  try {
    const content = await githubService.fetchReadmeContent(owner as string, repo as string);
    res.send(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Get project details from GitHub (Topics, Avatar, README) - Fast
router.get("/project-details", async (req, res) => {
  const { owner, repo, date } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split("T")[0];
  try {
    const details = await githubService.fetchProjectDetails(owner as string, repo as string);
    
    // Update project_meta table
    dbService.saveProjectMeta(`${owner}/${repo}`, details.avatarUrl, details.keywords, targetDate);

    res.json(details);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Generate AI summary for a project - Slow (Ollama)
// lang: "zh" | "en" | "both" (default "both": one call stores both languages)
// If readme is omitted, falls back to the stored README, then fetches it from GitHub.
router.post("/summarize-project", async (req, res) => {
  const { title, readme, date, lang } = req.body;
  const targetDate = (date as string) || new Date().toISOString().split("T")[0];
  try {
    let readmeText = readme;
    if (!readmeText) {
      const stored = dbService.getProjectSummary(title);
      readmeText = stored?.readme || "";
    }
    if (!readmeText) {
      const [owner, repo] = title.split("/");
      readmeText = await githubService.fetchReadmeContent(owner, repo);
    }
    const result = await aiService.generateReadmeSummary(readmeText, lang || "both");
    dbService.saveProjectSummary(title, result.summary, result.keywords, targetDate, {
      summaryEn: result.summaryEn,
      keywordsEn: result.keywordsEn,
      readme: readmeText,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Summarize text directly
router.post("/summarize", async (req, res) => {
  const { readmeText } = req.body;
  try {
    const result = await aiService.generateReadmeSummary(readmeText);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Global summary
router.post("/global-summary", async (req, res) => {
  const { projects, date, lang } = req.body;
  const targetDate = (date as string) || new Date().toISOString().split("T")[0];
  const targetLang: "zh" | "en" = lang === "en" ? "en" : "zh";

  try {
    const { summary, hashtags } = await aiService.generateGlobalSummary(projects, targetLang);
    dbService.saveGlobalState(targetDate, summary, hashtags, targetLang);

    const cached = dbService.getGlobalStateByDate(targetDate) || {};
    
    res.json({ 
      summary: summary, 
      hashtags: hashtags,
      summaryEn: cached.summaryEn || "",
      hashtagsEn: cached.hashtagsEn || "",
      fullContent: summary + (summary ? "\n\n" : "") + hashtags + "\n\n" + projects.map((item: any) => `https://github.com/${item.title}`).join("\n")
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Platform status
router.get("/platform/:platform/status", (req, res) => {
  const { platform } = req.params;
  try {
    const session = dbService.getPlatformSession(platform);
    res.json({ loggedIn: !!session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Platform login
router.post("/platform/:platform/login", async (req, res) => {
  try {
    const result = await platformService.login(req.params.platform);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Platform publish
router.post("/platform/:platform/publish", async (req, res) => {
  try {
    const result = await platformService.publish(req.params.platform, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export the rendered PNG frames as an MP4 for manual YouTube upload
router.post("/youtube/export-mp4", async (req, res) => {
  const { images, bgm } = req.body;
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "images required" });
  }
  let created: { path: string; cleanup: () => Promise<void> } | undefined;
  try {
    const buffers = images.map((b64: string) =>
      Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ""), "base64")
    );
    let bgmPath: string | undefined;
    if (typeof bgm === "string" && bgm) {
      // 只允许 public/bgm 下的文件名，防路径穿越
      const candidate = path.join(BGM_DIR, path.basename(bgm));
      if (candidate.startsWith(BGM_DIR + path.sep)) bgmPath = candidate;
    }
    console.log(`[MP4] Converting ${buffers.length} frames...`);
    created = await videoService.createMp4(buffers, bgmPath);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="github-trending-shorts.mp4"');
    res.sendFile(created.path, () => {
      created?.cleanup();
    });
  } catch (error) {
    if (created) await created.cleanup();
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
