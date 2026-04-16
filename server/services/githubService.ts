import axios from "axios";
import { chromium } from "playwright";

export const githubService = {
  async fetchTrendingProjects() {
    let browser;
    try {
      browser = await chromium.launch({ headless: false });
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      });
      const page = await context.newPage();
      
      await page.goto("https://github.com/trending?since=daily&spoken_language_code=", {
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
            url,
            avatarUrl: ""
          };
        });
      });

      console.log(`Successfully scraped ${items.length} items from GitHub Trending (basic info)`);
      return items;
    } finally {
      if (browser) await browser.close();
    }
  },

  async fetchProjectDetails(owner: string, repo: string) {
    const GITHUB_PAT = process.env.GITHUB_PAT;
    const config = {
      headers: {
        ...(GITHUB_PAT ? { Authorization: `token ${GITHUB_PAT}` } : {}),
        Accept: "application/vnd.github.v3+json"
      },
      timeout: 15000
    };

    console.log(`[Details] Fetching details for ${owner}/${repo}...`);
    
    // 1. Fetch main repo info (for topics and avatar)
    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, config);
    const topics = repoRes.data.topics || [];
    const avatarUrl = repoRes.data.owner?.avatar_url || "";

    // 2. Fetch README content (raw)
    const readmeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      ...config,
      headers: { ...config.headers, Accept: "application/vnd.github.v3.raw" }
    });

    return {
      keywords: topics.join(","),
      avatarUrl: avatarUrl,
      readme: readmeRes.data
    };
  },

  async fetchReadmeContent(owner: string, repo: string, retries = 3): Promise<string> {
    const GITHUB_PAT = process.env.GITHUB_PAT;
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const headers = {
      ...(GITHUB_PAT ? { Authorization: `token ${GITHUB_PAT}` } : {}),
      Accept: "application/vnd.github.v3.raw"
    };

    console.log(`curl -H "Accept: ${headers.Accept}" ${GITHUB_PAT ? `-H "Authorization: token ${GITHUB_PAT}" ` : ""}"${url}"`);

    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, {
          headers,
          timeout: 15000
        });
        return response.data;
      } catch (error: any) {
        const status = error.response?.status;
        const isRetryable = status === 502 || status === 503 || status === 504 || error.code === 'ECONNABORTED';
        
        if (!isRetryable || i === retries - 1) {
          throw error;
        }
        
        const delay = Math.pow(2, i) * 2000;
        console.warn(`[API] Fetching README failed (${status || error.code}), retrying in ${delay}ms... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Failed to fetch README after retries");
  }
};
