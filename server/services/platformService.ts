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
        
        console.log("[Publish] Uploading images sequentially...");
        const fileInput = await page.waitForSelector('input[type="file"]');
        
        // Upload Cover (0.png)
        await fileInput.setInputFiles(filePayloads[0]);
        await page.waitForTimeout(2000);

        // Upload remaining images
        for (let i = 1; i < filePayloads.length; i++) {
          console.log(`[Publish] Uploading image ${i}...`);
          await fileInput.setInputFiles(filePayloads[i]);
          await page.waitForTimeout(1000);
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
        // 9. 选择合集 (使用精准选择器)
        console.log("[Publish] Selecting collection...");
        try {
          // 先寻找包含“不选择合集”文字的下拉框触发器
          const selectTrigger = await page.locator('.semi-select:has-text("不选择合集")').first();
          await selectTrigger.click();
          await page.waitForTimeout(1000);
          // 在弹出的选项中寻找 "Github Trending"
          const option = await page.locator('.semi-select-option').filter({ hasText: 'Github Trending' }).first();
          await option.click();
        } catch (e) {
          console.warn("[Publish] Could not select collection:", e.message);
        }


        // 10. 选择音乐 (悬停触发“使用”按钮)
        console.log("[Publish] Selecting music...");
        try {
          const musicBtn = await page.locator('span[class*="action-"]:has-text("选择音乐")').first();
          await musicBtn.click();
          await page.waitForTimeout(2000);
          
          const musicCard = await page.locator('.semi-tabs-pane-motion-overlay .music-collection-container-cTsB7J .card-container-tmocjc').first();
          
          // 悬停在音乐卡片上以触发“使用”按钮出现
          console.log("[Publish] Hovering over the first music card...");
          await musicCard.hover();
          await page.waitForTimeout(500);

          const useBtn = await page.locator('.music-item-use-btn').first();
          if (await useBtn.isVisible()) {
            await useBtn.click();
            console.log("[Publish] Clicked 'Use' button for music.");
          } else {
            // 如果悬停没出按钮，尝试直接点击卡片
            await musicCard.click();
          }
        } catch (e) {
          console.warn("[Publish] Could not select music:", e.message);
        }

        // 11. 点击发布并确认状态
        console.log("[Publish] Clicking publish button...");
        await page.locator('button').filter({ hasText: '发布' }).first().click();
        
        // 等待跳转并点击“审核中”
        try {
          console.log("[Publish] Waiting for management page and checking 'Under Review' status...");
          await page.waitForURL("**/creator-micro/content/manage**", { timeout: 30000 });
          const auditTab = await page.getByText('审核中').first();
          await auditTab.click();
          await page.waitForTimeout(2000); // 停留一会儿确认结果
        } catch (e) {
          console.warn("[Publish] Post-publish check failed (might have published too fast or URL differed):", e.message);
        }
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
