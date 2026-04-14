import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import { chromium } from "playwright";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route: GitHub Trending Scraper using Playwright
  app.get("/api/trending", async (req, res) => {
    let browser;
    try {
      browser = await chromium.launch({ 
        headless: true,
      });
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      });
      const page = await context.newPage();
      
      await page.goto("https://github.com/trending?spoken_language_code=", {
        waitUntil: "networkidle"
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

      // Fetch tags from each project page in parallel using multiple tabs
      const concurrency = 5;
      const fetchTags = async (item: any) => {
        const p = await context.newPage();
        try {
          await p.goto(`https://github.com/${item.title}`, {
            waitUntil: "networkidle",
            timeout: 15000,
          });
          const tags = await p.evaluate(() => {
            const els = Array.from(document.querySelectorAll(".tmp-my-3 .topic-tag"));
            return els.map((el: any) => el.textContent?.trim()).filter(Boolean);
          });
          item.keywords = tags.join(",");
          console.log(`[Tags] ${item.title}: ${item.keywords}`);
        } catch (err: any) {
          console.error(`[Tags] Failed to fetch tags for ${item.title}:`, err.message);
        } finally {
          await p.close();
        }
      };

      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        await Promise.all(batch.map(fetchTags));
      }

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
      const GITHUB_PAT = process.env.GITHUB_PAT;
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          ...(GITHUB_PAT ? { Authorization: `token ${GITHUB_PAT}` } : {}),
          Accept: "application/vnd.github.v3.raw"
        }
      });
      res.send(response.data);
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
      const openai = new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY || "",
        baseURL: "https://integrate.api.nvidia.com/v1",
      });
      const summarizePayload = {
        model: "deepseek-ai/deepseek-v3.1",
        messages: [
          {
            role: "system" as const,
            content:
              "You are a helpful assistant. Always respond with valid JSON only, no markdown formatting, no code blocks.",
          },
          {
            role: "user" as const,
            content: `你是一个资深的开源项目分析师。请根据以下 GitHub 项目的 README 内容，生成一段极其精炼、吸引人的中文摘要（必须在 140 字以内，建议 80 字左右）。摘要要专业且具有传播力。\n\nREADME 内容：\n${readmeText.substring(0, 5000)}\n\n请以 JSON 格式返回，格式如下（不要添加 markdown 代码块标记）：\n{\n  "summary": "这里是摘要内容..."\n}`,
          },
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1000,
      };
      console.log(`curl -X POST https://integrate.api.nvidia.com/v1/chat/completions \\\n  -H "Authorization: Bearer $NVIDIA_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(summarizePayload)}'`);
      const completion = await openai.chat.completions.create(summarizePayload);
      const textBlock = completion.choices[0]?.message?.content || "";
      let result: any = {};
      try {
        result = JSON.parse(textBlock || "{}");
      } catch (e) {
        const match = textBlock?.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
          result = JSON.parse(match[1]);
        }
      }
      res.json({
        summary: result.summary || "",
        keywords: result.keywords || "",
      });
    } catch (error: any) {
      console.error("NVIDIA summarize error:", error?.message || error);
      res.status(500).json({ error: "Failed to summarize" });
    }
  });

  // API Route: Global summary via NVIDIA (OpenAI-compatible)
  app.post("/api/global-summary", express.json(), async (req, res) => {
    const { projects } = req.body;
    if (!Array.isArray(projects)) {
      return res.status(400).json({ error: "projects array is required" });
    }

    try {
      const openai = new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY || "",
        baseURL: "https://integrate.api.nvidia.com/v1",
      });
      const contents = `你是一个资深的开源趋势观察员。请根据以下今日 GitHub Trending 的项目列表，生成一段极其精炼的“今日趋势大总结”。\n\n项目列表：\n${projects.map((item: any) => `${item.title}: ${item.aiSummary || item.content}`).join("\n")}\n\n请直接返回总结文本。`;
      const globalPayload = {
        model: "deepseek-ai/deepseek-v3.1",
        messages: [
          {
            role: "system" as const,
            content:
              "You are a helpful assistant. Always respond with plain text only, no markdown formatting.",
          },
          {
            role: "user" as const,
            content: contents,
          },
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1000,
      };
      console.log(`curl -X POST https://integrate.api.nvidia.com/v1/chat/completions \\\n  -H "Authorization: Bearer $NVIDIA_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(globalPayload)}'`);
      const completion = await openai.chat.completions.create(globalPayload);
      const summaryText = completion.choices[0]?.message?.content || "";
      const urls = projects.map((item: any) => `https://github.com/${item.title}`).join("\n");
      res.json({ summary: summaryText + (summaryText ? "\n\n" : "") + urls });
    } catch (error: any) {
      console.error("NVIDIA global summary error:", error?.message || error);
      res.status(500).json({ error: "Failed to generate global summary" });
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
