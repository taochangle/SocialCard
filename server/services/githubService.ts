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
          const avatarUrl = response.data.owner?.avatar_url || "";
          item.keywords = topics.join(",");
          item.avatarUrl = avatarUrl;
          console.log(`[Tags] ${item.title}: ${item.keywords}, Avatar: ${!!avatarUrl}`);
        } catch (err: any) {
          console.error(`[Tags] Failed to fetch tags for ${item.title}:`, err.message);
        }
      };

      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        await Promise.all(batch.map(fetchTags));
      }

      return items;
    } finally {
      if (browser) await browser.close();
    }
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
