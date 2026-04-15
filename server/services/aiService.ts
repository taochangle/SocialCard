import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  baseURL: process.env.AI_BASE_URL || "http://localhost:11434/v1",
  apiKey: process.env.AI_API_KEY || "ollama", // Ollama usually doesn't need a key but SDK requires it
});

export const aiService = {
  async callAI(prompt: string): Promise<any> {
    const model = process.env.AI_MODEL || "gemma4:e2b";
    try {
      console.log(`[AI] Calling ${model} via OpenAI SDK...`);
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
        top_p: 0.7,
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("[AI] Failed to parse JSON response:", content);
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
      console.error("[AI] OpenAI SDK error:", error.message);
      throw error;
    }
  },

  async generateReadmeSummary(readmeText: string): Promise<{ summary: string, keywords: string }> {
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

    const data = await this.callAI(prompt);

    return {
      summary: data.summary || "",
      keywords: data.keywords || "",
    };
  },

  async generateGlobalSummary(projects: any[]): Promise<{ summary: string, hashtags: string }> {
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

    const data = await this.callAI(contents);
    const summaryText = data.summary || "";
    const hashtags = Array.isArray(data.hashtags) ? data.hashtags.join(" ") : "";

    return {
      summary: summaryText,
      hashtags: hashtags
    };
  }
};
