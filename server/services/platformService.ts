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
            // Click "继续添加" span
            const continueAddBtn = await page.locator('span:has-text("继续添加")').first();
            await continueAddBtn.click();
            await page.waitForTimeout(1000);
            
            // The file input might be newly created or reused, find the last one or the visible one
            const fileInputs = await page.$$('input[type="file"]');
            const lastInput = fileInputs[fileInputs.length - 1];
            await lastInput.setInputFiles(filePayloads[i]);
            await page.waitForTimeout(1500);
          } catch (e) {
            console.warn(`[Publish] "Continue Adding" for image ${i} failed, trying direct input:`, e.message);
            await firstInput.setInputFiles(filePayloads[i]);
          }
        }
        
        // 6. 填充标题 (格式: YYYY-MM-DD)
        console.log("[Publish] Filling title...");
        const dateMatch = title.match(/(\d{4})[^\d](\d{1,2})[^\d](\d{1,2})/);
        const formattedTitle = dateMatch 
          ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`
          : title;

        try {
          const titleInput = await page.waitForSelector('.semi-input.semi-input-default', { timeout: 10000 });
          await titleInput.fill(formattedTitle);
        } catch (e) {
          await page.getByPlaceholder('添加作品标题').fill(formattedTitle);
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
          const sideSheet = await page.waitForSelector('.semi-sidesheet-inner-wrap', { timeout: 10000 });
          
          // Click "热门榜" tab
          const hotTab = await sideSheet.waitForSelector('div:has-text("热门榜")');
          await hotTab.click();
          await page.waitForTimeout(2000);

          // Find first music card in .music-collection-container-cTsB7J
          const musicCard = await page.locator('.music-collection-container-cTsB7J .card-container-tmocjc').first();
          
          // Hover to reveal "Use" button
          console.log("[Publish] Hovering over trending music...");
          await musicCard.hover();
          await page.waitForTimeout(1000);

          // Click "使用"
          const useBtn = await page.locator('button:has-text("使用"), .music-item-use-btn').first();
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
          await page.waitForURL("**/creator-micro/content/manage**", { timeout: 30000 });
          const auditTab = await page.getByText('审核中').first();
          await auditTab.click();
          await page.waitForTimeout(2000);
        } catch (e) {}
        } else if (platform === "xiaohongshu") {
          await page.goto("https://creator.xiaohongshu.com/publish/publish", { waitUntil: 'networkidle' });

          console.log("[Publish] Uploading images to XHS sequentially...");
          // Upload Cover (0.png)
          const fileInput = await page.waitForSelector('input[type="file"]');
          await fileInput.setInputFiles(filePayloads[0]);
          await page.waitForTimeout(3000);

          // Upload remaining images
          if (filePayloads.length > 1) {
            for (let i = 1; i < filePayloads.length; i++) {
              console.log(`[Publish] Uploading image ${i} to XHS...`);
              const moreInput = await page.waitForSelector('.img-upload-area .entry input[type="file"]');
              await moreInput.setInputFiles(filePayloads[i]);
              await page.waitForTimeout(1000);
            }
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
