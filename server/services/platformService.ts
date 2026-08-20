import { BrowserContext, chromium, Page, LaunchOptions } from "playwright";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { dbService } from "./dbService.js";
import { videoService } from "./videoService.js";

// 发布页面放宽的超时（单位 ms）
const PUBLISH_TIMEOUT = 120000;
// 国内直连 YouTube 会超时，设置 YT_PROXY（如 http://127.0.0.1:7890）后上传走代理
const YT_PROXY = process.env.YT_PROXY || "";

const UPLOAD_URL = "https://www.youtube.com/upload";

const STEALTH_JS_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../stealth.min.js"
);

function launchOptions(platform: string): LaunchOptions {
  const options: LaunchOptions = {
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  };
  if (platform === "youtube" && YT_PROXY) {
    options.proxy = { server: YT_PROXY };
  }
  return options;
}

// 注入反检测脚本，隐藏自动化指纹（navigator.webdriver 等），避免 Google 登录拦截
async function applyStealth(context: BrowserContext) {
  try {
    await context.addInitScript({ path: STEALTH_JS_PATH });
  } catch (err) {
    console.warn("[Login] Stealth init script failed:", err);
  }
}

async function dismissAutocomplete(page: Page) {
  // 关掉 # 话题 / @ 提及自动补全浮层，避免挡住“继续/发布”按钮
  try {
    await page.evaluate("() => { const a = document.activeElement; if (a && a.blur) a.blur(); }");
  } catch { /* ignore */ }
  try {
    const dropdown = page.locator("tp-yt-iron-dropdown:visible");
    if ((await dropdown.count()) > 0) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }
  } catch { /* ignore */ }
}

async function fillEditable(page: Page, selector: string, text: string) {
  const box = page.locator(selector).first();
  await box.waitFor({ state: "visible", timeout: 30000 });
  await box.click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.press("Delete");
  try {
    // 一次性灌入，避免逐字触发 # 话题自动补全浮层
    await box.fill(text);
  } catch {
    await box.type(text, { delay: 6 });
  }
  await page.waitForTimeout(400);
  await dismissAutocomplete(page);
}

async function clickIfPresent(page: Page, selector: string, timeout = 4000): Promise<boolean> {
  try {
    const el = page.locator(selector).first();
    await el.waitFor({ state: "visible", timeout });
    await el.click();
    return true;
  } catch {
    return false;
  }
}

async function waitUploadComplete(page: Page, maxPolls = 360): Promise<boolean> {
  // 等网页上传从 X% 跑到完成再发布；上传中途关闭浏览器会把上传掐断（如卡在 76%）
  let last = "";
  for (let i = 0; i < maxPolls; i++) {
    let txt = "";
    for (const sel of [".progress-label", "span.progress-label", "ytcp-video-upload-progress"]) {
      const loc = page.locator(sel).first();
      try {
        if ((await loc.count()) > 0) {
          txt = (await loc.innerText()).trim();
          if (txt) break;
        }
      } catch { /* ignore */ }
    }
    if (txt) {
      if (/(处理|检查|上传完成|已上传|Processing|complete|Checks|Finished)/i.test(txt)) {
        console.log(`[Publish] Upload complete: ${txt.slice(0, 40)}`);
        return true;
      }
      if (txt !== last) {
        console.log(`[Publish] Uploading: ${txt.slice(0, 40)}`);
        last = txt;
      }
    }
    await page.waitForTimeout(5000);
  }
  console.warn("[Publish] Upload did not report complete in time; attempting publish anyway.");
  return false;
}

// Convert uploaded PNG payloads into a temp MP4 for YouTube Shorts.
async function buildMp4Payload(filePayloads: { name: string; mimeType: string; buffer: Buffer }[]) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "socialcard-youtube-"));
  const mp4Path = path.join(tmpDir, "shorts.mp4");
  await videoService.imagesToMp4(filePayloads.map((f) => f.buffer), mp4Path);
  return {
    name: "github-trending-shorts.mp4",
    mimeType: "video/mp4",
    buffer: await fs.readFile(mp4Path),
    cleanup: () => fs.rm(tmpDir, { recursive: true, force: true }),
  };
}

interface FilePayload {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

export const platformService = {
  async login(platform: string) {
    let browser;
    try {
      browser = await chromium.launch(launchOptions(platform));
      const context = await browser.newContext();
      if (platform === "youtube") await applyStealth(context);
      const page = await context.newPage();

      let loginUrl = "";
      let targetUrl = "";

      if (platform === "douyin") {
        loginUrl = "https://creator.douyin.com/";
        targetUrl = "creator.douyin.com/creator-micro/home";
      } else if (platform === "youtube") {
        loginUrl = "https://studio.youtube.com/";
        targetUrl = "studio.youtube.com";
      } else {
        throw new Error("Unsupported platform");
      }

      await page.goto(loginUrl);
      console.log(`[Login] Please scan QR code for ${platform}...`);

      if (platform === "youtube") {
        // 等真正进入频道页（/channel/）再保存，避免在登录中转页提前保存未登录态
        const ok = await page
          .waitForURL((url) => url.toString().includes("/channel/"), { timeout: 600000 })
          .then(() => true)
          .catch(() => false);
        if (!ok) throw new Error("YouTube 登录超时");
        await page.waitForTimeout(2000); // 等 cookie 落定
      } else {
        await page.waitForURL((url) => url.toString().includes(targetUrl), { timeout: 300000 });
      }
      console.log(`[Login] Successfully logged into ${platform}!`);

      const state = await context.storageState();
      dbService.savePlatformSession(platform, JSON.stringify(state));

      return { success: true, message: `Logged into ${platform}` };
    } finally {
      if (browser) await browser.close();
    }
  },

  async publish(platform: string, payload: { images: string[]; publishDate: string; content: string; hashtags: string }) {
    if (platform !== "douyin" && platform !== "youtube") {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    const { images, publishDate, content, hashtags } = payload;
    const session = dbService.getPlatformSession(platform);
    if (!session) {
      throw new Error(`Not logged into ${platform}`);
    }

    const filePayloads = images.map((base64: string, i: number) => {
      const data = base64.replace(/^data:image\/\w+;base64,/, "");
      return {
        name: `${i}.png`,
        mimeType: "image/png",
        buffer: Buffer.from(data, "base64"),
      };
    });

    let browser;
    try {
      console.log(`[Publish] Starting automated post to ${platform}...`);
      browser = await chromium.launch(launchOptions(platform));
      const state = JSON.parse(session.state);
      const context = await browser.newContext({ 
        storageState: state,
        permissions: ['geolocation'],
        geolocation: { longitude: 116.4074, latitude: 39.9042 }
      });
      if (platform === "youtube") await applyStealth(context);
      const page = await context.newPage();
      page.setDefaultTimeout(PUBLISH_TIMEOUT);

      if (platform === "douyin") {
        await this.publishDouyin(page, filePayloads, { publishDate, content, hashtags });
      } else if (platform === "youtube") {
        console.log("[Publish] Converting images to MP4 for YouTube Shorts...");
        const mp4Payload = await buildMp4Payload(filePayloads);
        try {
          await this.publishYoutube(page, mp4Payload, { publishDate, content, hashtags });
        } finally {
          await mp4Payload.cleanup();
        }
      }

      return { success: true, message: `Automation foundation reached for ${platform}` };
    } finally {
      if (browser) await browser.close();
    }
  },

  async publishDouyin(page: Page, filePayloads: FilePayload[], payload: { publishDate: string; content: string; hashtags: string }) {
      const { publishDate, content, hashtags } = payload;
        await page.goto("https://creator.douyin.com/creator-micro/content/upload?default-tab=3", { waitUntil: "networkidle", timeout: PUBLISH_TIMEOUT });
        
        // 3. Upload images sequentially
        console.log("[Publish] Uploading images sequentially...");
        const firstInput = await page.waitForSelector('input[type="file"]');
        
        // Upload Cover (0.png)
        await firstInput.setInputFiles(filePayloads[0]);
        await page.waitForTimeout(3000);

        // Upload remaining images one by one via "Continue Adding"
        for (let i = 1; i < filePayloads.length; i++) {
          console.log(`[Publish] Uploading image ${i}...`);
          try {
            // Use file chooser for "Continue Adding"
            const [fileChooser] = await Promise.all([
              page.waitForEvent('filechooser'),
              page.locator('.continue-add-clE5aC').first().click(),
            ]);
            await fileChooser.setFiles(filePayloads[i]);
            await page.waitForTimeout(2000); // Wait for upload progress
          } catch (e) {
            console.warn(`[Publish] "Continue Adding" for image ${i} failed:`, e.message);
          }
        }
        
        // 6. 填充标题 (格式: YYYY-MM-DD)
        console.log("[Publish] Filling title...");
        try {
          const titleInput = await page.waitForSelector('.semi-input.semi-input-default');
          await titleInput.fill(publishDate);
        } catch {
          await page.getByPlaceholder('添加作品标题').fill(publishDate);
        }

        // 7. 填充描述
        console.log("[Publish] Filling description...");
        const editor = await page.waitForSelector('.zone-container .ace-line');
        await editor.click();
        await page.keyboard.type(content);

        // 8. 添加话题
        console.log("[Publish] Adding hashtags...");
        const tags = hashtags.split(' ').filter((t: string) => t.startsWith('#'));
        for (const tag of tags) {
          await page.keyboard.type(tag);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        }

        // 9. 选择合集 (使用精准选择器)
        console.log("[Publish] Selecting collection...");
        try {
          const selectTrigger = await page.locator('.semi-select:has-text("不选择合集")').first();
          await selectTrigger.click();
          await page.waitForTimeout(1000);
          const option = await page.locator('.semi-select-option').filter({ hasText: 'Github Trending' }).first();
          await option.click();
        } catch (e) {
          console.warn("[Publish] Could not select collection:", e.message);
        }

        // 10. 选择音乐 (抽屉 -> 热门榜 -> 悬停 -> 使用)
        console.log("[Publish] Selecting music...");
        try {
          const musicBtn = await page.locator('span[class*="action-"]:has-text("选择音乐")').first();
          await musicBtn.click();
          
          // Wait for sidesheet
          console.log("[Publish] Waiting for music sidesheet...");
          const sideSheet = await page.waitForSelector('.semi-sidesheet-inner-wrap');
          
          // Click "热门榜" tab
          const hotTab = await sideSheet.waitForSelector('div:has-text("热门榜")');
          await hotTab.click();
          await page.waitForTimeout(2000);

          // Find first music card in .music-collection-container-cTsB7J
          const musicCard = await page.locator('.music-collection-container-cTsB7J .card-container-tmocjc').first();
          
          // Hover and wait for "Use" button
          console.log("[Publish] Hovering over trending music...");
          await musicCard.hover();
          
          const useBtnSelector = 'button:has-text("使用"), .music-item-use-btn';
          await page.waitForSelector(useBtnSelector, { state: 'visible' });
          const useBtn = await page.locator(useBtnSelector).first();
          await useBtn.click();
          console.log("[Publish] Music selected successfully.");
          
        } catch (e) {
          console.warn("[Publish] Complex music selection failed:", e.message);
        }

        // 11. 点击发布
        console.log("[Publish] Clicking the main publish button...");
        try {
          const finalPublishBtn = await page.locator('button:has-text("发布")').last(); // Usually at bottom
          await finalPublishBtn.scrollIntoViewIfNeeded();
          await finalPublishBtn.click();
          console.log("[Publish] Clicked publish button.");
        } catch (e) {
          console.error("[Publish] Final publish button click failed:", e.message);
        }
        
        // 等待跳转并点击“审核中”
        try {
          console.log("[Publish] Waiting for management page...");
          await page.waitForURL("**/creator-micro/content/manage**");
          const auditTab = await page.getByText('审核中').first();
          await auditTab.click();
          await page.waitForTimeout(2000);
        } catch { /* ignore */ }
  },

  async publishYoutube(page: Page, videoPayload: FilePayload, payload: { publishDate: string; content: string; hashtags: string }) {
    const { publishDate, content, hashtags } = payload;
    const title = `GitHub Trending — Top 15 (${publishDate})`;
    const description = [content, hashtags].filter(Boolean).join("\n\n");

    console.log("[Publish] Opening YouTube upload page...");
    await page.goto(UPLOAD_URL, { waitUntil: "domcontentloaded", timeout: PUBLISH_TIMEOUT });
    await page.waitForTimeout(3000);
    if (page.url().includes("accounts.google.com") || page.url().toLowerCase().includes("signin")) {
      throw new Error("YouTube 登录态已失效，请重新扫码登录");
    }

    // 1) 选择视频文件
    console.log("[Publish] Attaching MP4 file...");
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 60000 });
    await fileInput.setInputFiles(videoPayload);

    // 2) 等详情对话框出现
    console.log("[Publish] Waiting for the upload details dialog...");
    await page.locator("#title-textarea").waitFor({ state: "visible", timeout: PUBLISH_TIMEOUT });

    // 3) 标题
    console.log("[Publish] Filling title...");
    await fillEditable(page, "#title-textarea #textbox", title.slice(0, 100));

    // 4) 简介
    console.log("[Publish] Filling description...");
    if (description.trim()) {
      await fillEditable(page, "#description-textarea #textbox", description);
    }

    // 5) 受众：非儿童向（必填）
    console.log("[Publish] Marking 'not made for kids'...");
    if (!(await clickIfPresent(page, "tp-yt-paper-radio-button[name='VIDEO_MADE_FOR_KIDS_NOT_MFK']", 10000))) {
      if (!(await clickIfPresent(page, "tp-yt-paper-radio-button[name='NOT_MADE_FOR_KIDS']", 6000))) {
        await clickIfPresent(page, "tp-yt-paper-radio-button:has-text('not made for kids'), tp-yt-paper-radio-button:has-text('不是面向儿童')", 6000);
      }
    }

    // 6) 连点 Next 到“可见性”步骤
    console.log("[Publish] Navigating to the Visibility step...");
    for (let i = 0; i < 5; i++) {
      const vis = page.locator("tp-yt-paper-radio-button[name='PUBLIC']");
      if ((await vis.count()) > 0 && (await vis.first().isVisible())) break;
      if (!(await clickIfPresent(page, "#next-button", 6000))) {
        await page.waitForTimeout(1200);
      }
      await page.waitForTimeout(1000);
    }

    // 7) 可见性：公开
    console.log("[Publish] Setting visibility to Public...");
    await clickIfPresent(page, "tp-yt-paper-radio-button[name='PUBLIC']", 10000);

    // 8) 关键：等上传真正传完再发布，否则浏览器一关上传被掐断
    console.log("[Publish] Waiting for upload to complete...");
    await waitUploadComplete(page);

    // 9) 发布
    console.log("[Publish] Clicking publish...");
    await page.waitForTimeout(1200);
    if (!(await clickIfPresent(page, "#done-button", 15000))) {
      console.warn("[Publish] Publish button not found; please publish manually in the visible window.");
    } else {
      await page.waitForTimeout(4000);
      let videoUrl = "";
      try {
        const link = page.locator("a[href*='youtu.be'], a[href*='watch?v=']").first();
        if ((await link.count()) > 0) {
          videoUrl = (await link.getAttribute("href")) || "";
        }
      } catch { /* ignore */ }
      await clickIfPresent(page, "ytcp-button:has-text('Close'), ytcp-button:has-text('关闭'), #close-button", 8000);
      console.log(`[Publish] Published ${videoUrl ? `at ${videoUrl}` : "(URL unknown)"}`);
    }

    // 刷新登录态
    try {
      const freshState = await page.context().storageState();
      dbService.savePlatformSession("youtube", JSON.stringify(freshState));
    } catch { /* ignore */ }
  }
};
