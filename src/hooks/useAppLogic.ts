import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { toPng } from "html-to-image";
import download from "downloadjs";
import JSZip from "jszip";
import { RankingItem, Theme, CardStyle } from "../types";
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
  const [cardStyle, setCardStyle] = useState<CardStyle>("classic");
  const [theme, setTheme] = useState<Theme>(TEMPLATES[0].theme);
  const [authorName, setAuthorName] = useState("xintao");
  const [authorAvatar, setAuthorAvatar] = useState("/my-avatar.jpg");
  const [youtubeName, setYoutubeName] = useState("taochangle");
  const [youtubeAvatar, setYoutubeAvatar] = useState("/youtube.jpg");
  const [selectedBgm, setSelectedBgm] = useState("");
  const [platform, setPlatformState] = useState<"douyin" | "youtube">("douyin");
  const [previewLang, setPreviewLangState] = useState<"zh" | "en">("zh");
  const [content, setContent] = useState("分享，让生活有了标点符号。\nCodex 真的太快了");
  const [highlightWords, setHighlightWords] = useState("Codex,Kimi");
  const [timeText, setTimeText] = useState("");

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
  const [globalSummaryEn, setGlobalSummaryEn] = useState("");
  const [globalHashtagsEn, setGlobalHashtagsEn] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [processStage, setProcessStage] = useState<"idle" | "scraping" | "metadata" | "summarizing" | "global">("idle");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [platformStatus, setPlatformStatus] = useState<{ [key: string]: boolean }>({
    douyin: false,
    youtube: false,
  });

  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize with today's date and time
  useEffect(() => {
    const now = new Date();
    setTimeText(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
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

  const applyProject = useCallback((index: number, data?: RankingItem[], lang?: "zh" | "en") => {
    const targetData = data || trendingData;
    const item = targetData[index];
    if (!item) return;
    const useEn = (lang || previewLang) === "en";

    updateCurrentIndex(index);
    setProjectName(item.title);
    setProjectUrl(item.url || "");
    setStars(item.stars || "");
    setStarsToday(item.starsToday || "");
    setAvatarUrl(item.avatarUrl || "");
    if (useEn) {
      setContent(item.aiSummaryEn || item.aiSummary || item.content);
      setHighlightWords(item.aiKeywordsEn || item.aiKeywords || item.keywords);
    } else {
      setContent(item.aiSummary || item.content);
      setHighlightWords(item.aiKeywords || item.keywords);
    }
  }, [trendingData, previewLang]);

  // 索引卡展示用：英文模式时把摘要字段映射为英文
  const displayTrending = useMemo(() => {
    if (previewLang !== "en") return trendingData;
    return trendingData.map((item) => ({
      ...item,
      aiSummary: item.aiSummaryEn || item.aiSummary,
      aiKeywords: item.aiKeywordsEn || item.aiKeywords,
      content: item.aiSummaryEn || item.content,
    }));
  }, [trendingData, previewLang]);

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
        setGlobalSummaryEn(data.globalSummaryEn);
        setGlobalHashtagsEn(data.globalHashtagsEn);
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
              aiSummaryEn: aiData.summaryEn,
              aiKeywordsEn: aiData.keywordsEn,
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
      const platforms = ["douyin"];
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

  // 渲染当前卡片的 PNG base64（索引封面 + 详情页共用）
  const captureBase64 = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await waitForImages(previewRef.current!);
    return await toPng(previewRef.current!, { quality: 1, pixelRatio: 2 });
  };

  // 按指定语言批量渲染卡片（封面 + Top 15 详情），结束后还原预览
  const captureCardImages = async (data: RankingItem[], lang: "zh" | "en", restoreData: RankingItem[]) => {
    const originalMode = layoutMode;
    const originalIndex = currentIndex;
    const images: string[] = [];
    setLayoutMode("index");
    images.push(await captureBase64());
    const count = Math.min(data.length, 15);
    const total = count + 1;
    setProcessProgress(Math.round((1 / total) * 100));
    for (let i = 0; i < count; i++) {
      setStatusMsg(`正在生成图片 ${i + 1}/${count}...`);
      applyProject(i, data, lang);
      setLayoutMode("detail");
      images.push(await captureBase64());
      setProcessProgress(Math.round(((i + 2) / total) * 100));
    }
    applyProject(originalIndex, restoreData);
    setLayoutMode(originalMode);
    return images;
  };

  // 补齐英文摘要（不生成全球总结，供预览切换使用）
  const fillEnglishSummaries = async () => {
    const processed = [...trendingData];
    for (let i = 0; i < processed.length; i++) {
      if (!processed[i].aiSummaryEn) {
        setStatusMsg(`正在生成英文摘要 (${i + 1}/${processed.length}): ${processed[i].title}`);
        try {
          const res = await fetch("/api/summarize-project", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: processed[i].title, readme: "", date: selectedDate, lang: "en" }),
          });
          if (res.ok) {
            const data = await res.json();
            processed[i] = {
              ...processed[i],
              aiSummaryEn: data.summaryEn || processed[i].aiSummary,
              aiKeywordsEn: data.keywordsEn || processed[i].aiKeywords,
            };
          }
        } catch (err) {
          console.error(`[EN] Error for ${processed[i].title}:`, err);
        }
      }
      setProcessProgress(Math.round(((i + 1) / processed.length) * 40));
    }
    setTrendingData(processed);
    return processed;
  };

  // 补齐英文摘要与英文趋势总结，返回可用于渲染/文案的数据
  const ensureEnglishData = async () => {
    const processed = await fillEnglishSummaries();

    let enSummary = globalSummaryEn;
    let enHashtags = globalHashtagsEn;
    if (!enSummary) {
      setStatusMsg("正在生成英文趋势总结...");
      const gsRes = await fetch("/api/global-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: processed, date: selectedDate, lang: "en" }),
      });
      if (gsRes.ok) {
        const gsData = await gsRes.json();
        enSummary = gsData.summary || "";
        enHashtags = gsData.hashtags || "";
        setGlobalSummaryEn(enSummary);
        setGlobalHashtagsEn(enHashtags);
      }
    }

    return {
      data: processed,
      summary: enSummary || globalSummary,
      hashtags: enHashtags || globalHashtags,
    };
  };

  // 预览语言切换：中 ↔ 英，缺英文摘要时自动补齐
  const togglePreviewLang = async (lang: "zh" | "en") => {
    setPreviewLangState(lang);
    if (lang === "en" && trendingData.some((item) => !item.aiSummaryEn)) {
      // 当前项目有英文就先立即切换，其余缺英文的后台补齐
      applyProject(currentIndex, trendingData, "en");
      setLoading(true);
      setIsProcessing(true);
      setProcessProgress(0);
      try {
        const processed = await fillEnglishSummaries();
        applyProject(currentIndex, processed, "en");
        return;
      } finally {
        setLoading(false);
        setIsProcessing(false);
      }
    }
    applyProject(currentIndex, trendingData, lang);
  };

  // 切换目标平台：YouTube 自动切英文（并补齐英文摘要），抖音切回中文
  const selectPlatform = async (next: "douyin" | "youtube") => {
    setPlatformState(next);
    if (next === "youtube") {
      await togglePreviewLang("en");
    } else {
      await togglePreviewLang("zh");
    }
  };

  const publishToPlatform = async (platform: string) => {
    if (!trendingData.length) return;
    setLoading(true);
    setIsProcessing(true);
    setProcessProgress(0);
    const isYouTube = platform === "youtube";
    const platformLabel = isYouTube ? "YouTube" : "抖音";
    setStatusMsg(`正在准备 ${platformLabel} 发布数据...`);
    try {
      const originalData = trendingData;
      let publishData = trendingData;
      let summary = globalSummary;
      let hashtags = globalHashtags;
      if (isYouTube) {
        const prep = await ensureEnglishData();
        publishData = prep.data;
        summary = prep.summary;
        hashtags = prep.hashtags;
      }
      const images = await captureCardImages(publishData, isYouTube ? "en" : "zh", originalData);

      const projectUrls = publishData.map(item => `https://github.com/${item.title}`).join("\r\n");
      const fullContent = isYouTube
        ? summary + "\r\n\r\nProject links:\r\n" + projectUrls + "\r\n\r\n"
        : summary + "\r\n\r\n项目地址：\r\n" + projectUrls + "\r\n\r\n";

      setStatusMsg(`正在启动 ${platformLabel} 自动化发布程序...`);
      const res = await fetch(`/api/platform/${platform}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          images, 
          publishDate: selectedDate, // Use standard YYYY-MM-DD
          content: fullContent, 
          hashtags: hashtags 
        }),
      });
      const data = await res.json();
      if (data.success) setStatusMsg(`${platformLabel} 自动化任务已启动！`);
      else setStatusMsg(`${platformLabel} 发布失败: ${data.error}`);
    } catch (err: any) {
      setStatusMsg(`发布出错: ${err.message}`);
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // 手动上传 YouTube：生成并下载 MP4
  const exportYoutubeVideo = async () => {
    if (!trendingData.length) return;
    setLoading(true);
    setIsProcessing(true);
    setProcessProgress(0);
    setStatusMsg("正在准备 YouTube 英文内容...");
    const originalPlatform = platform;
    const originalLang = previewLang;
    try {
      // 导出时切到 YouTube 全屏画布 + 英文，确保截到的是真 9:16
      setPlatformState("youtube");
      setPreviewLangState("en");
      const originalData = trendingData;
      const prep = await ensureEnglishData();
      setStatusMsg("正在渲染英文卡片并生成 MP4...");
      const images = await captureCardImages(prep.data, "en", originalData);
      const res = await fetch("/api/youtube/export-mp4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, bgm: selectedBgm }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "MP4 生成失败");
      }
      const blob = await res.blob();
      download(blob, `github-trending-${selectedDate}.mp4`);
      setStatusMsg("MP4 已下载，可手动上传到 YouTube Studio");
    } catch (err: any) {
      setStatusMsg(`导出失败: ${err.message}`);
    } finally {
      setPlatformState(originalPlatform);
      setPreviewLangState(originalLang);
      setLoading(false);
      setIsProcessing(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // 手动上传 YouTube：复制英文标题/描述/话题/链接
  const copyYoutubeCopy = async () => {
    if (!trendingData.length) return;
    setLoading(true);
    setIsProcessing(true);
    setProcessProgress(0);
    setStatusMsg("正在准备英文文案...");
    try {
      const prep = await ensureEnglishData();
      const urls = prep.data.map(item => `https://github.com/${item.title}`).join("\n");
      const text = [
        `Title: GitHub Trending — Top 15 (${selectedDate})`,
        "",
        prep.summary,
        "",
        prep.hashtags,
        "",
        "Project links:",
        urls,
      ].join("\n");
      await navigator.clipboard.writeText(text);
      setStatusMsg("英文文案已复制，可直接粘贴到 YouTube Studio");
    } catch (err: any) {
      setStatusMsg(`复制失败: ${err.message}`);
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const exportImage = async () => {
    if (!previewRef.current || trendingData.length === 0) return;
    setLoading(true);
    setIsProcessing(true);
    setProcessProgress(0);
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
        await new Promise((resolve) => setTimeout(resolve, 200));
        await waitForImages(previewRef.current!);
        const dataUrl = await toPng(previewRef.current!, { quality: 1, pixelRatio: 2 });
        folder.file(filename, dataURLtoBlob(dataUrl));
      };
      const originalMode = layoutMode;
      const originalIndex = currentIndex;
      const total = trendingData.length + 1;
      setLayoutMode("index");
      await capture("0.png");
      setProcessProgress(Math.round((1 / total) * 100));
      for (let i = 0; i < trendingData.length; i++) {
        setStatusMsg(`正在生成第 ${i + 1}/${trendingData.length} 张…`);
        applyProject(i);
        setLayoutMode("detail");
        await capture(`${i + 1}.png`);
        setProcessProgress(Math.round(((i + 2) / total) * 100));
      }
      setProcessProgress(100);
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
      setIsProcessing(false);
    }
  };

  // 当前平台激活的作者名/头像（YouTube 用独立配置）
  const activeAuthorName = platform === "youtube" ? youtubeName : authorName;
  const activeAuthorAvatar = platform === "youtube" ? youtubeAvatar : authorAvatar;

  return {
    trendingData,
    currentIndex,
    layoutMode,
    setLayoutMode,
    selectedTemplate,
    setSelectedTemplate,
    cardStyle,
    setCardStyle,
    theme,
    setTheme,
    authorName,
    setAuthorName,
    authorAvatar,
    setAuthorAvatar,
    youtubeName,
    setYoutubeName,
    youtubeAvatar,
    setYoutubeAvatar,
    selectedBgm,
    setSelectedBgm,
    platform,
    selectPlatform,
    activeAuthorName,
    activeAuthorAvatar,
    previewLang,
    togglePreviewLang,
    displayTrending,
    content,
    setContent,
    highlightWords,
    setHighlightWords,
    timeText,
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
    globalSummaryEn,
    globalHashtagsEn,
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
    exportYoutubeVideo,
    copyYoutubeCopy,
    exportImage,
  };
}
