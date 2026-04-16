import express from "express";
import { dbService } from "../services/dbService.js";
import { aiService } from "../services/aiService.js";
import { githubService } from "../services/githubService.js";
import { platformService } from "../services/platformService.js";

const router = express.Router();

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
        globalHashtags: globalState?.hashtags || ""
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

// Process README (fetch details + summarize)
router.get("/process-readme", async (req, res) => {
  const { owner, repo, date } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split("T")[0];
  try {
    // 1. Fetch all details (topics, avatar, readme)
    const details = await githubService.fetchProjectDetails(owner as string, repo as string);
    
    // 2. Generate AI summary
    const aiResult = await aiService.generateReadmeSummary(details.readme);
    
    // 3. Update project details in DB (including the now-found avatar and topics)
    dbService.saveProjectSummary(`${owner}/${repo}`, aiResult.summary, aiResult.keywords, targetDate);
    
    // Also update the main trending_projects table with newly fetched metadata
    db.prepare(`
      UPDATE trending_projects 
      SET avatarUrl = ?, keywords = ?
      WHERE title = ? AND date = ?
    `).run(details.avatarUrl, details.keywords, `${owner}/${repo}`, targetDate);

    res.json({
      summary: aiResult.summary,
      keywords: aiResult.keywords,
      avatarUrl: details.avatarUrl,
      projectKeywords: details.keywords
    });
  } catch (error: any) {
    console.error(`[Process] Error for ${owner}/${repo}:`, error.message);
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
  const { projects, date } = req.body;
  const targetDate = (date as string) || new Date().toISOString().split("T")[0];

  try {
    const { summary, hashtags } = await aiService.generateGlobalSummary(projects);
    dbService.saveGlobalState(targetDate, summary, hashtags);
    
    res.json({ 
      summary: summary, 
      hashtags: hashtags,
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

export default router;
