import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { toPng } from "html-to-image";
import download from "downloadjs";
import JSZip from "jszip";
import { RankingItem, Theme } from "../types";
import { TEMPLATES, GITHUB_TRENDING_MOCK } from "../constants";
import { dataURLtoBlob, waitForImages } from "../utils";

export function useAppLogic() {
  const [trendingData, setTrendingData] = useState<RankingItem[]>(GITHUB_TRENDING_MOCK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  const updateCurrentIndex = (index: number) => {
    setCurrentIndex(index);
    currentIndexRef.current = index;
  };

  const [layoutMode, setLayoutMode] = useState<"index" | "detail">("index");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0].id);
  const [theme, setTheme] = useState<Theme>(TEMPLATES[0].theme);
  const [authorName, setAuthorName] = useState("xintao");
  const [content, setContent] = useState("分享，让生活有了标点符号。\nCodex 真的太快了");
  const [highlightWords, setHighlightWords] = useState("Codex,Kimi");
  const [timeText, setTimeText] = useState("");
  const [weekdayText, setWeekdayText] = useState("");

  const [projectName, setProjectName] = useState("google/generative-ai-js");
  const [projectUrl, setProjectUrl] = useState("github.com/google/generative-ai-js");
  const [stars, setStars] = useState("12.4k");
  const [starsToday, setStarsToday] = useState("450");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [globalSummary, setGlobalSummary] = useState("");
  const [globalHashtags, setGlobalHashtags] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [processStage, setProcessStage] = useState<"idle" | "scraping" | "metadata" | "summarizing" | "global">("idle");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [platformStatus, setPlatformStatus] = useState<{ [key: string]: boolean }>({
    douyin: false,
    xiaohongshu: false,
  });

  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize with today's date and time
  useEffect(() => {
    const now = new Date();
    setTimeText(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setWeekdayText(now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase());
    loadCache(selectedDate);
    checkPlatformStatus();
  }, []);

  const displayDate = useMemo(() => {
    return new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
  }, [selectedDate]);

  const keywordList = useMemo(() => {
    return highlightWords.split(",").map((s) => s.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
  }, [highlightWords]);

  const highlightedHtml = useMemo(() => {
    const escapeHtml = (str: string) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    let html = escapeHtml(content || "分享，让生活有了标点符号。");
    if (keywordList.length) {
      const sortedKeywords = [...keywordList].sort((a, b) => b.length - a.length);
      const escapedKeywords = sortedKeywords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
      html = html.replace(regex, `<span style="color:${theme.accentColor}; font-weight: 900;">$1</span>`);
    }
    return html.replace(/\n/g, "<br>");
  }, [content, keywordList, theme.accentColor]);

  const applyProject = useCallback((index: number, data?: RankingItem[]) => {
    const targetData = data || trendingData;
    const item = targetData[index];
    if (!item) return;

    updateCurrentIndex(index);
    setProjectName(item.title);
    setProjectUrl(item.url || "");
    setStars(item.stars || "");
    setStarsToday(item.starsToday || "");
    setAvatarUrl(item.avatarUrl || "");
    setContent(item.aiSummary || item.content);
    setHighlightWords(item.aiKeywords || item.keywords);
  }, [trendingData]);

  const loadCache = async (date?: string) => {
    const targetDate = date || selectedDate;
    setLoading(true);
    setStatusMsg(`正在尝试从缓存加载 ${targetDate} 的数据...`);
    try {
      const response = await fetch(`/api/cache?date=${targetDate}`);
      if (response.ok) {
        const data = await response.json();
        setTrendingData(data.projects);
        setGlobalSummary(data.globalSummary);
        setGlobalHashtags(data.globalHashtags);
        if (data.projects.length > 0) applyProject(0, data.projects);
        setStatusMsg(`成功从缓存加载 ${targetDate} 的数据`);
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg(`${targetDate} 暂无缓存，可点击同步按钮获取新数据`);
      }
    } catch (err) {
      console.error("[Cache] Failed to load cache:", err);
      setStatusMsg("加载缓存失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    setLoading(true);
    setIsProcessing(true);
    setProcessProgress(0);
    setProcessStage("scraping");
    setStatusMsg(`正在获取 ${selectedDate} 的 GitHub Trending 列表...`);
    try {
      const response = await fetch(`/api/trending?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data: RankingItem[] = await response.json();
      setTrendingData(data);
      if (data.length > 0) {
        applyProject(0, data);
      }

      const processedData = [...data];
      // Part A: Fetch Metadata (Fast)
      setProcessStage("metadata");
      setStatusMsg("正在同步项目元数据 (头像、标签、README)...");
      for (let i = 0; i < processedData.length; i++) {
        const item = processedData[i];
        try {
          const [owner, repo] = item.title.split("/");
          const detailsRes = await fetch(`/api/project-details?owner=${owner}&repo=${repo}&date=${selectedDate}`);
          if (detailsRes.ok) {
            const details = await detailsRes.json();
            processedData[i] = {
              ...item,
              avatarUrl: details.avatarUrl,
              keywords: details.keywords || item.keywords,
              // Temporarily store readme for next step
              content: details.readme || item.content 
            };
            setTrendingData([...processedData]);
            if (currentIndexRef.current === i) {
              setAvatarUrl(details.avatarUrl || "");
              setHighlightWords(details.keywords || item.keywords);
            }
          }
        } catch (err) {
          console.error(`[Metadata] Error for ${item.title}:`, err);
        }
      }

      // Part B: Generate AI Summaries (Slow - Ollama)
      setProcessStage("summarizing");
      for (let i = 0; i < processedData.length; i++) {
        const item = processedData[i];
        setProcessProgress(Math.round(((i) / processedData.length) * 100));
        setStatusMsg(`正在生成 AI 摘要 (${i + 1}/${processedData.length}): ${item.title}`);
        
        try {
          const aiRes = await fetch("/api/summarize-project", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: item.title,
              readme: item.content, // This is the readme fetched in Part A
              date: selectedDate
            })
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            processedData[i] = {
              ...item,
              aiSummary: aiData.summary,
              aiKeywords: aiData.keywords,
            };
            setTrendingData([...processedData]);
            if (currentIndexRef.current === i) {
              setContent(aiData.summary);
              setHighlightWords(aiData.keywords);
            }
          }
        } catch (err) {
          console.error(`[AI] Error for ${item.title}:`, err);
        }
      }
      setProcessProgress(100);
      setTrendingData(processedData);

      try {
        setProcessStage("global");
        setStatusMsg("正在生成今日趋势大总结...");
        const gsRes = await fetch("/api/global-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projects: processedData, date: selectedDate }),
        });
        if (gsRes.ok) {
          const gsData = await gsRes.json();
          if (gsData.summary) setGlobalSummary(gsData.summary);
          if (gsData.hashtags) setGlobalHashtags(gsData.hashtags);
        }
      } catch (err: any) {
        console.error("[AI] Error generating global summary:", err?.message || err);
      }
      setProcessStage("idle");
      setStatusMsg("已同步并处理完成所有 GitHub Trending 数据！");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (error: any) {
      setProcessStage("idle");
      setStatusMsg(`获取失败: ${error.message}`);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const checkPlatformStatus = async () => {
    try {
      const platforms = ["douyin", "xiaohongshu"];
      const newStatus: any = {};
      for (const p of platforms) {
        const res = await fetch(`/api/platform/${p}/status`);
        const data = await res.json();
        newStatus[p] = data.loggedIn;
      }
      setPlatformStatus(newStatus);
    } catch (err) {}
  };

  const loginPlatform = async (platform: string) => {
    setStatusMsg(`正在启动 ${platform} 登录窗口...`);
    try {
      const res = await fetch(`/api/platform/${platform}/login`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`${platform} 登录成功！`);
        checkPlatformStatus();
      } else {
        setStatusMsg(`${platform} 登录失败: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMsg(`${platform} 登录出错: ${err.message}`);
    } finally {
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const publishToPlatform = async (platform: string) => {
    if (!trendingData.length) return;
    setLoading(true);
    setStatusMsg(`正在准备 ${platform} 发布数据...`);
    try {
      const images: string[] = [];
      const originalMode = layoutMode;
      const originalIndex = currentIndex;
      const captureBase64 = async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await waitForImages(previewRef.current!);
        return await toPng(previewRef.current!, { quality: 1, pixelRatio: 2, cacheBust: true });
      };
      setLayoutMode("index");
      images.push(await captureBase64());
      const count = Math.min(trendingData.length, 15);
      for (let i = 0; i < count; i++) {
        setStatusMsg(`正在生成图片 ${i + 1}/${count}...`);
        applyProject(i);
        setLayoutMode("detail");
        images.push(await captureBase64());
      }
      applyProject(originalIndex);
      setLayoutMode(originalMode);

      // Append project URLs to the content
      const projectUrls = trendingData.map(item => `https://github.com/${item.title}`).join("\r\n");
      const fullContent = globalSummary + "\r\n\r\n项目地址：\r\n" + projectUrls + "\r\n\r\n";

      setStatusMsg(`正在启动 ${platform} 自动化发布程序...`);
      const res = await fetch(`/api/platform/${platform}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          images, 
          publishDate: selectedDate, // Use standard YYYY-MM-DD
          content: fullContent, 
          hashtags: globalHashtags 
        }),
      });
      const data = await res.json();
      if (data.success) setStatusMsg(`${platform} 自动化任务已启动！`);
      else setStatusMsg(`${platform} 发布失败: ${data.error}`);
    } catch (err: any) {
      setStatusMsg(`发布出错: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const exportImage = async () => {
    if (!previewRef.current || trendingData.length === 0) return;
    setLoading(true);
    setStatusMsg("正在批量生成图片…");
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
      const folderName = `github-trending-${ts}`;
      const zip = new JSZip();
      const folder = zip.folder(folderName);
      if (!folder) throw new Error("Failed to create zip folder");
      const capture = async (filename: string) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await waitForImages(previewRef.current!);
        const dataUrl = await toPng(previewRef.current!, { quality: 1, pixelRatio: 2, cacheBust: true });
        folder.file(filename, dataURLtoBlob(dataUrl));
      };
      const originalMode = layoutMode;
      const originalIndex = currentIndex;
      setLayoutMode("index");
      await capture("0.png");
      for (let i = 0; i < trendingData.length; i++) {
        setStatusMsg(`正在生成第 ${i + 1}/${trendingData.length} 张…`);
        applyProject(i);
        setLayoutMode("detail");
        await capture(`${i + 1}.png`);
      }
      applyProject(originalIndex);
      setLayoutMode(originalMode);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      download(zipBlob, `${folderName}.zip`);
      setStatusMsg("导出完成！");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (error) {
      setStatusMsg("导出失败");
    } finally {
      setLoading(false);
    }
  };

  return {
    trendingData,
    currentIndex,
    layoutMode,
    setLayoutMode,
    selectedTemplate,
    setSelectedTemplate,
    theme,
    setTheme,
    authorName,
    setAuthorName,
    content,
    setContent,
    highlightWords,
    setHighlightWords,
    timeText,
    weekdayText,
    projectName,
    projectUrl,
    stars,
    starsToday,
    avatarUrl,
    loading,
    isProcessing,
    processProgress,
    globalSummary,
    setGlobalSummary,
    globalHashtags,
    setGlobalHashtags,
    statusMsg,
    setStatusMsg,
    processStage,
    selectedDate,
    setSelectedDate,
    platformStatus,
    previewRef,
    displayDate,
    keywordList,
    highlightedHtml,
    applyProject,
    fetchTrending,
    loadCache,
    loginPlatform,
    publishToPlatform,
    exportImage,
  };
}
