import axios from "axios";

export const aiService = {
  async callOllama(prompt: string): Promise<any> {
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

    const data = await this.callOllama(prompt);

    return {
      summary: data.summary || "",
      keywords: data.keywords || "",
    };
  }
};
