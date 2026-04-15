import { chromium } from "playwright";
import { dbService } from "./dbService.js";

export const platformService = {
  async login(platform: string) {
    let browser;
    try {
      browser = await chromium.launch({ headless: false });
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
        throw new Error("Unsupported platform");
      }

      await page.goto(loginUrl);
      console.log(`[Login] Please scan QR code for ${platform}...`);

      await page.waitForURL((url) => url.toString().includes(targetUrl), { timeout: 300000 });
      console.log(`[Login] Successfully logged into ${platform}!`);

      const state = await context.storageState();
      dbService.savePlatformSession(platform, JSON.stringify(state));

      return { success: true, message: `Logged into ${platform}` };
    } finally {
      if (browser) await browser.close();
    }
  },

  async publish(platform: string, payload: any) {
    const { images, title, content, hashtags } = payload;
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
      browser = await chromium.launch({ headless: false });
      const state = JSON.parse(session.state);
      const context = await browser.newContext({ 
        storageState: state,
        permissions: ['geolocation'],
        geolocation: { longitude: 116.4074, latitude: 39.9042 }
      });
      const page = await context.newPage();

      if (platform === "douyin") {
        await page.goto("https://creator.douyin.com/creator-micro/content/upload?default-tab=3", { waitUntil: 'networkidle' });
        
        console.log("[Publish] Uploading images...");
        const fileInput = await page.waitForSelector('input[type="file"]');
        await fileInput.setInputFiles(filePayloads);
        
        console.log("[Publish] Filling title...");
        try {
          const titleInput = await page.waitForSelector('.semi-input.semi-input-default', { timeout: 10000 });
          await titleInput.fill(title);
        } catch (e) {
          await page.getByPlaceholder('添加作品标题').fill(title);
        }

        console.log("[Publish] Filling description...");
        const editor = await page.waitForSelector('.zone-container .ace-line');
        await editor.click();
        await page.keyboard.type(content);

        console.log("[Publish] Adding hashtags...");
        const tags = hashtags.split(' ').filter((t: string) => t.startsWith('#'));
        for (const tag of tags) {
          await page.keyboard.type(tag);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        }

        console.log("[Publish] Selecting collection...");
        try {
          const collectionBtn = await page.getByText('添加合集').first();
          await collectionBtn.click();
          await page.waitForTimeout(1000);
          await page.getByText('Github Trending').first().click();
        } catch (e) {}

        console.log("[Publish] Selecting music...");
        try {
          await page.getByText('选择音乐').first().click();
          await page.waitForTimeout(1000);
          await page.getByText('飙升榜').first().click();
          await page.waitForTimeout(1000);
          await page.locator('.music-item-use-btn').first().click();
        } catch (e) {}

        console.log("[Publish] Ready to publish!");
        
      } else if (platform === "xiaohongshu") {
        await page.goto("https://creator.xiaohongshu.com/publish/publish", { waitUntil: 'networkidle' });
        
        console.log("[Publish] Uploading images to XHS...");
        const fileInput = await page.waitForSelector('input[type="file"]');
        await fileInput.setInputFiles(filePayloads[0]);
        
        if (filePayloads.length > 1) {
          await page.waitForTimeout(2000);
          const moreInput = await page.waitForSelector('.img-upload-area .entry input[type="file"]');
          await moreInput.setInputFiles(filePayloads.slice(1));
        }

        console.log("[Publish] Filling title...");
        await page.getByPlaceholder('填写标题会有更多赞哦').fill(title);

        console.log("[Publish] Filling description...");
        const editor = await page.waitForSelector('.editor-content p');
        await editor.click();
        await page.keyboard.type(content);

        console.log("[Publish] Adding hashtags...");
        const tags = hashtags.split(' ').filter((t: string) => t.startsWith('#'));
        for (const tag of tags) {
          await page.keyboard.type(tag);
          await page.keyboard.press('Space');
          await page.waitForTimeout(500);
        }

        console.log("[Publish] Selecting collection...");
        try {
          await page.getByText('选择合集').first().click();
        } catch (e) {}

        console.log("[Publish] Enabling original declaration...");
        try {
          const originalLabel = await page.getByText('原创声明').first();
          const radio = await originalLabel.locator('..').locator('input[type="radio"], .ant-radio-input').first();
          await radio.click();
        } catch (e) {}

        console.log("[Publish] Ready to publish!");
      }

      return { success: true, message: `Automation foundation reached for ${platform}` };
    } finally {
      if (browser) await browser.close();
    }
  }
};
