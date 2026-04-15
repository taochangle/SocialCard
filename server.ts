import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import { chromium } from "playwright";
import db from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  async function callOllama(prompt: string): Promise<any> {
    try {
      console.log(`[AI] Calling local Ollama (gemma4:e2b)...`);
      const response = await axios.post("http://localhost:11434/api/chat", {
        model: "gemma4:e2b",
        messages: [{ role: "user", content: prompt }],
        stream: false,
        format: "json",
        options: {
          temperature: 0.2,
          top_p: 0.7,
        }
      }, { timeout: 60000 });

      const content = response.data.message.content;
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("[AI] Failed to parse Ollama JSON response:", content);
        // Fallback: try regex
        const summaryMatch = content.match(/"summary":\s*"([\s\S]*?)"/);
        const keywordsMatch = content.match(/"keywords":\s*"([\s\S]*?)"/);
        const hashtagsMatch = content.match(/"hashtags":\s*\[([\s\S]*?)\]/);
        return {
          summary: summaryMatch ? summaryMatch[1] : "",
          keywords: keywordsMatch ? keywordsMatch[1] : "",
          hashtags: hashtagsMatch ? hashtagsMatch[1].split(',').map((s: any) => s.replace(/"/g, '').trim()) : []
        };
      }
    } catch (error: any) {
      console.error("[AI] Ollama API error:", error.message);
      throw error;
    }
  }

  async function fetchReadmeContent(owner: string, repo: string, retries = 3): Promise<string> {
    const GITHUB_PAT = process.env.GITHUB_PAT;
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const headers = {
      ...(GITHUB_PAT ? { Authorization: `token ${GITHUB_PAT}` } : {}),
      Accept: "application/vnd.github.v3.raw"
    };

    console.log(`curl -H "Accept: ${headers.Accept}" ${GITHUB_PAT ? `-H "Authorization: token ${GITHUB_PAT}" ` : ""}"${url}"`);

    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
          headers: {
            ...(GITHUB_PAT ? { Authorization: `token ${GITHUB_PAT}` } : {}),
            Accept: "application/vnd.github.v3.raw"
          },
          timeout: 15000
        });
        return response.data;
      } catch (error: any) {
        const status = error.response?.status;
        const isRetryable = status === 502 || status === 503 || status === 504 || error.code === 'ECONNABORTED';
        
        if (!isRetryable || i === retries - 1) {
          throw error;
        }
        
        const delay = Math.pow(2, i) * 2000; // 2s, 4s, 8s
        console.warn(`[API] Fetching README failed (${status || error.code}), retrying in ${delay}ms... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Failed to fetch README after retries");
  }

  async function generateReadmeSummary(readmeText: string): Promise<{ summary: string, keywords: string }> {
    const prompt = `请根据以下 GitHub 项目的 README 内容，生成一个极其精炼、吸引人的中文摘要和一组关键词。

要求：
1. 摘要 (summary)：必须在 140 字以内，建议 80 字左右，专业且具有传播力。
2. 关键词 (keywords)：必须是 **摘要内容中已经出现的词汇**，用逗号隔开。这些词将用于在前端高亮摘要，所以请务必确保它们完全匹配摘要中的字词。
3. 语言：必须使用中文。

README 内容：
${readmeText.substring(0, 10000)}

请以 JSON 格式返回：
{
  "summary": "这里是生成的中文摘要...",
  "keywords": "关键词1,关键词2..."
}`;

    const data = await callOllama(prompt);

    return {
      summary: data.summary || "",
      keywords: data.keywords || "",
    };
  }

  // API Route: GitHub Trending Scraper using Playwright
  app.get("/api/trending", async (req, res) => {
    const targetDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
    let browser;
    try {
      browser = await chromium.launch({ 
        headless: false,
      });
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      });
      const page = await context.newPage();
      
      await page.goto("https://github.com/trending?spoken_language_code=", {
        waitUntil: "networkidle",
        timeout: 60000
      });
      
      const items = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("article.Box-row"));
        return rows.slice(0, 15).map((el, i) => {
          const titleEl = el.querySelector("h2 a") as HTMLAnchorElement;
          const title = titleEl ? titleEl.innerText.replace(/\s+/g, "").trim() : "";
          const descriptionEl = el.querySelector("p.col-9.color-fg-muted.my-1.tmp-pr-4, p.col-9.color-fg-muted");
          const description = descriptionEl ? descriptionEl.textContent?.trim() : "";
          const starsTodayEl = el.querySelector("span.d-inline-block.float-sm-right");
          const starsToday = starsTodayEl ? starsTodayEl.textContent?.trim().replace("stars today", "").trim() : "";
          
          // Total stars is usually the first Link--muted in the footer area
          const mutedLinks = Array.from(el.querySelectorAll("a.Link--muted"));
          const totalStars = mutedLinks.length > 0 ? mutedLinks[0].textContent?.trim() : "";
          
          const url = "github.com/" + title;
          const username = "@" + title.split("/")[0];

          return {
            id: i + 1,
            title,
            content: description || "No description provided.",
            keywords: "",
            username,
            stars: totalStars,
            starsToday,
            url
          };
        });
      });

      console.log(`Successfully scraped ${items.length} items from GitHub Trending`);
      if (items.length === 0) {
        const body = await page.content();
        console.log("Page content length:", body.length);
        console.log("Page title:", await page.title());
      }

      // Fetch tags from GitHub API
      const concurrency = 5;
      const fetchTags = async (item: any) => {
        try {
          const GITHUB_PAT = process.env.GITHUB_PAT;
          const [owner, repo] = item.title.split("/");
          const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              ...(GITHUB_PAT ? { Authorization: `token ${GITHUB_PAT}` } : {}),
              Accept: "application/vnd.github.v3+json"
            },
            timeout: 10000
          });
          const topics = response.data.topics || [];
          item.keywords = topics.join(",");
          console.log(`[Tags] ${item.title}: ${item.keywords}`);
        } catch (err: any) {
          console.error(`[Tags] Failed to fetch tags for ${item.title}:`, err.message);
        }
      };

      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        await Promise.all(batch.map(fetchTags));
      }

      // Save to DB
      const deleteStmt = db.prepare("DELETE FROM trending_projects WHERE date = ?");
      const insertStmt = db.prepare(`
        INSERT INTO trending_projects (title, content, keywords, username, stars, starsToday, url, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction((data) => {
        deleteStmt.run(targetDate);
        for (const item of data) {
          insertStmt.run(item.title, item.content, item.keywords, item.username, item.stars, item.starsToday, item.url, targetDate);
        }
      });
      transaction(items);

      res.json(items);
    } catch (error: any) {
      console.error("Playwright Scraping Error:", error.message);
      res.status(500).json({ error: "Failed to fetch GitHub trending using Playwright" });
    } finally {
      if (browser) await browser.close();
    }
  });

  // API Route: Fetch README content
  app.get("/api/readme", async (req, res) => {
    const { owner, repo } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and repo are required" });
    }

    try {
      const content = await fetchReadmeContent(owner as string, repo as string);
      res.send(content);
    } catch (error: any) {
      console.error("GitHub README Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch README" });
    }
  });

  // API Route: Summarize README via NVIDIA (OpenAI-compatible)
  app.post("/api/summarize", express.json(), async (req, res) => {
    const { readmeText } = req.body;
    if (!readmeText) {
      return res.status(400).json({ error: "readmeText is required" });
    }

    try {
      const result = await generateReadmeSummary(readmeText);
      res.json(result);
    } catch (error: any) {
      console.error("NVIDIA summarize error:", error?.message || error);
      res.status(500).json({ error: "Failed to summarize" });
    }
  });

  // API Route: Combined process README
  app.get("/api/process-readme", async (req, res) => {
    const { owner, repo, date } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and repo are required" });
    }

    const targetDate = (date as string) || new Date().toISOString().split("T")[0];

    try {
      console.log(`\n>>> [API] Starting process-readme for: ${owner}/${repo}`);
      
      const startTime = Date.now();
      const readmeText = await fetchReadmeContent(owner as string, repo as string);
      const fetchTime = Date.now() - startTime;
      console.log(`<<< [API] README fetched for ${owner}/${repo} in ${fetchTime}ms (Length: ${readmeText.length})`);
      
      console.log(`>>> [AI] Summarizing ${owner}/${repo}...`);
      const aiStartTime = Date.now();
      const result = await generateReadmeSummary(readmeText);
      const aiTime = Date.now() - aiStartTime;
      console.log(`<<< [AI] Summary generated for ${owner}/${repo} in ${aiTime}ms`);
      
      // Save to DB
      db.prepare(`
        INSERT INTO project_summaries (title, aiSummary, aiKeywords, date)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(title) DO UPDATE SET
          aiSummary = excluded.aiSummary,
          aiKeywords = excluded.aiKeywords,
          date = excluded.date
      `).run(`${owner}/${repo}`, result.summary, result.keywords, targetDate);

      res.json(result);
    } catch (error: any) {
      console.error(`[API] Error processing README for ${owner}/${repo}:`, error.message);
      res.status(500).json({ error: `Failed to process README: ${error.message}` });
    }
  });


  // API Route: Global summary via Ollama
  app.post("/api/global-summary", express.json(), async (req, res) => {
    const { projects, date } = req.body;
    if (!Array.isArray(projects)) {
      return res.status(400).json({ error: "projects array is required" });
    }

    const targetDate = (date as string) || new Date().toISOString().split("T")[0];

    try {
      const contents = `你是一个资深的开源趋势观察员。请根据以下今日 GitHub Trending 的项目列表，生成一段极其精炼的“今日趋势大总结”以及 5 个用于社交媒体传播的 #话题。

要求：
1. 总结文字必须是纯文本，**绝对不要使用任何 Markdown 格式**（如 #, *, **, [ ], > 等）。
2. 直接返回文字内容。

项目列表：
${projects.map((item: any) => `${item.title}: ${item.aiSummary || item.content}`).join("\n")}

请以 JSON 格式返回，格式如下：
{
  "summary": "这里是今日趋势的深度总结文字...",
  "hashtags": ["#话题1", "#话题2", "#话题3", "#话题4", "#话题5"]
}`;

      const data = await callOllama(contents);

      const summaryText = data.summary || "";
      const hashtags = Array.isArray(data.hashtags) ? data.hashtags.join(" ") : "";
      const urls = projects.map((item: any) => `https://github.com/${item.title}`).join("\n");
      
      const fullContent = summaryText + (summaryText ? "\n\n" : "") + hashtags + "\n\n" + urls;

      // Save to DB
      db.prepare(`
        INSERT INTO global_state (date, summary, hashtags)
        VALUES (?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          summary = excluded.summary,
          hashtags = excluded.hashtags
      `).run(targetDate, summaryText, hashtags);

      res.json({ 
        summary: summaryText, 
        hashtags: hashtags,
        fullContent: fullContent
      });
    } catch (error: any) {
      console.error("Ollama global summary error:", error?.message || error);
      res.status(500).json({ error: "Failed to generate global summary" });
    }
  });

  // API Route: Get platform login status
  app.get("/api/platform/:platform/status", (req, res) => {
    const { platform } = req.params;
    try {
      const session = db.prepare("SELECT * FROM platform_sessions WHERE platform = ?").get(platform) as any;
      res.json({ loggedIn: !!session });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Manual login to capture cookies
  app.post("/api/platform/:platform/login", async (req, res) => {
    const { platform } = req.params;
    let browser;
    try {
      browser = await chromium.launch({ headless: false }); // Headed for manual login
      const context = await browser.newContext();
      const page = await context.newPage();

      let loginUrl = "";
      let targetUrl = "";

      if (platform === "douyin") {
        loginUrl = "https://creator.douyin.com/";
        targetUrl = "creator.douyin.com/creator-micro/home";
      } else if (platform === "xiaohongshu") {
        loginUrl = "https://creator.xiaohongshu.com/login?source=official";
        targetUrl = "creator.xiaohongshu.com/new/home";
      } else {
        return res.status(400).json({ error: "Unsupported platform" });
      }

      await page.goto(loginUrl);
      console.log(`[Login] Please scan QR code for ${platform}...`);

      // Wait for navigation to the logged-in home page
      // We use a broad pattern to match subdomains or slightly different paths
      await page.waitForURL((url) => url.toString().includes(targetUrl), { timeout: 300000 }); // 5 minutes
      console.log(`[Login] Successfully logged into ${platform}!`);

      // Save state
      const state = await context.storageState();
      db.prepare(`
        INSERT INTO platform_sessions (platform, state)
        VALUES (?, ?)
        ON CONFLICT(platform) DO UPDATE SET state = excluded.state
      `).run(platform, JSON.stringify(state));

      res.json({ success: true, message: `Logged into ${platform}` });
    } catch (error: any) {
      console.error(`[Login] ${platform} error:`, error.message);
      res.status(500).json({ error: error.message });
    } finally {
      if (browser) await browser.close();
    }
  });

  // API Route: Foundation for automated publishing
  app.post("/api/platform/:platform/publish", async (req, res) => {
    const { platform } = req.params;
    const { images, title, content, hashtags } = req.body; // images: string[] (base64)

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Images are required" });
    }

    let browser;
    try {
      // Load session
      const session = db.prepare("SELECT * FROM platform_sessions WHERE platform = ?").get(platform) as any;
      if (!session) {
        return res.status(401).json({ error: `Not logged into ${platform}` });
      }

      console.log(`[Publish] Starting automated post to ${platform}...`);
      browser = await chromium.launch({ headless: false }); // Visible for now to verify steps
      const state = JSON.parse(session.state);
      const context = await browser.newContext({ storageState: state });
      const page = await context.newPage();

      if (platform === "douyin") {
        // 1. Open home
        await page.goto("https://creator.douyin.com/creator-micro/home");
        // 2. Click "Publish Image/Text" (发布图文)
        // Note: We'll implement specific selectors later, but let's navigate directly for now
        await page.goto("https://creator.douyin.com/creator-micro/content/upload?default-tab=3");
        
        // TODO: Implement full steps from step.text
        console.log("[Publish] Douyin automation foundation reached.");
        
      } else if (platform === "xiaohongshu") {
        // 1. Open upload page
        await page.goto("https://creator.xiaohongshu.com/publish/publish");
        
        // TODO: Implement full steps from step.text
        console.log("[Publish] Xiaohongshu automation foundation reached.");
      }

      res.json({ success: true, message: `Automation foundation reached for ${platform}` });
    } catch (error: any) {
      console.error(`[Publish] ${platform} error:`, error.message);
      res.status(500).json({ error: error.message });
    } finally {
      if (browser) await browser.close();
    }
  });

  // API Route: Get cached data for today
  app.get("/api/cache", (req, res) => {
    const targetDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
    try {
      const projects = db.prepare(`
        SELECT tp.*, ps.aiSummary, ps.aiKeywords 
        FROM trending_projects tp
        LEFT JOIN project_summaries ps ON tp.title = ps.title
        WHERE tp.date = ?
        ORDER BY tp.id ASC
      `).all(targetDate);

      const globalState = db.prepare("SELECT * FROM global_state WHERE date = ?").get(targetDate) as any;

      if (projects.length > 0) {
        res.json({
          projects,
          globalSummary: globalState?.summary || "",
          globalHashtags: globalState?.hashtags || ""
        });
      } else {
        res.status(404).json({ error: "No cache found for today" });
      }
    } catch (error: any) {
      console.error("[DB] Cache error:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
