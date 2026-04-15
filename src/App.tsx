/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LayoutGrid,
  Download,
  RefreshCw,
  Palette,
  Clock,
  Github,
  Sparkles,
  Check,
  Image as ImageIcon,
  Type as TypeIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import download from "downloadjs";
import JSZip from "jszip";
import { RankingItem, Theme, Template } from "./types";

const TEMPLATES: Template[] = [
  {
    id: "contrast-black",
    name: "高对比暗黑",
    desc: "经典开发者风格",
    theme: {
      outerBg: "#E7ECB0",
      cardBg: "#000000",
      textColor: "#FFFFFF",
      accentColor: "#FFEB3B",
    },
  },
  {
    id: "mint-note",
    name: "极简便签",
    desc: "清新生活方式",
    theme: {
      outerBg: "#BDF1E6",
      cardBg: "#A9EAD9",
      textColor: "#172033",
      accentColor: "#1F9D72",
    },
  },
  {
    id: "pink-pop",
    name: "糖果海报",
    desc: "活泼社交风格",
    theme: {
      outerBg: "#F37CB2",
      cardBg: "#F3F1F4",
      textColor: "#11D5BC",
      accentColor: "#FF6FB5",
    },
  },
  {
    id: "sunny-card",
    name: "明快卡片",
    desc: "暖色调大标题",
    theme: {
      outerBg: "#F7B36C",
      cardBg: "#FAFAF7",
      textColor: "#734019",
      accentColor: "#FFB703",
    },
  },
  {
    id: "ambient-sketch",
    name: "随笔氛围",
    desc: "柔和光影质感",
    theme: {
      outerBg: "#D1D5DB",
      cardBg: "#F9FAFB",
      textColor: "#1F2937",
      accentColor: "#3B82F6",
    },
  },
  {
    id: "vibrant-melon",
    name: "活力瓜条",
    desc: "高饱和度趣味",
    theme: {
      outerBg: "#FF9F1C",
      cardBg: "#FFFFFF",
      textColor: "#2EC4B6",
      accentColor: "#E71D36",
    },
  },
  {
    id: "gradient-poster",
    name: "渐变海报",
    desc: "现代流体美学",
    theme: {
      outerBg: "#4F46E5",
      cardBg: "#FFFFFF",
      textColor: "#1E1B4B",
      accentColor: "#818CF8",
    },
  },
  {
    id: "minimal-paper",
    name: "简约纸条",
    desc: "素雅纸张触感",
    theme: {
      outerBg: "#E5E7EB",
      cardBg: "#FFFFFF",
      textColor: "#374151",
      accentColor: "#9CA3AF",
    },
  },
  {
    id: "cyber-neon",
    name: "赛博霓虹",
    desc: "未来主义科技感",
    theme: {
      outerBg: "#0F172A",
      cardBg: "#1E293B",
      textColor: "#38BDF8",
      accentColor: "#F472B6",
    },
  },
  {
    id: "retro-news",
    name: "复古报刊",
    desc: "经典排版美学",
    theme: {
      outerBg: "#F3E5AB",
      cardBg: "#FFFDD0",
      textColor: "#3D2B1F",
      accentColor: "#8B4513",
    },
  },
  {
    id: "deep-ocean",
    name: "深海沉静",
    desc: "静谧深邃质感",
    theme: {
      outerBg: "#0C4A6E",
      cardBg: "#082F49",
      textColor: "#BAE6FD",
      accentColor: "#38BDF8",
    },
  },
  {
    id: "sunset-glow",
    name: "落日余晖",
    desc: "温暖治愈色彩",
    theme: {
      outerBg: "#FF7E5F",
      cardBg: "#FEB47B",
      textColor: "#5F2C1F",
      accentColor: "#FFFFFF",
    },
  },
];

const GITHUB_TRENDING_MOCK: RankingItem[] = [];

export default function App() {
  const [trendingData, setTrendingData] =
    useState<RankingItem[]>(GITHUB_TRENDING_MOCK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  const updateCurrentIndex = (index: number) => {
    setCurrentIndex(index);
    currentIndexRef.current = index;
  };
  const [layoutMode, setLayoutMode] = useState<"index" | "detail">("index");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    TEMPLATES[0].id,
  );
  const [theme, setTheme] = useState<Theme>(TEMPLATES[0].theme);
  const [authorName, setAuthorName] = useState("xintao");
  const [content, setContent] = useState(
    "分享，让生活有了标点符号。\nCodex 真的太快了",
  );
  const [highlightWords, setHighlightWords] = useState("Codex,Kimi");
  const [timeText, setTimeText] = useState("");
  const [weekdayText, setWeekdayText] = useState("");

  // Detail specific fields
  const [projectName, setProjectName] = useState("google/generative-ai-js");
  const [projectUrl, setProjectUrl] = useState(
    "github.com/google/generative-ai-js",
  );
  const [stars, setStars] = useState("12.4k");
  const [starsToday, setStarsToday] = useState("450");

  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [globalSummary, setGlobalSummary] = useState("");
  const [globalHashtags, setGlobalHashtags] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [platformStatus, setPlatformStatus] = useState<{ [key: string]: boolean }>({
    douyin: false,
    xiaohongshu: false,
  });

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
    } catch (err) {
      console.error("Failed to check platform status:", err);
    }
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
    if (!trendingData.length) {
      alert("没有数据可发布");
      return;
    }

    setLoading(true);
    setStatusMsg(`正在准备 ${platform} 发布数据...`);
    try {
      // 1. Generate images in memory
      const images: string[] = [];
      const originalMode = layoutMode;
      const originalIndex = currentIndex;

      const captureBase64 = async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await waitForImages(previewRef.current!);
        return await toPng(previewRef.current!, {
          quality: 1,
          pixelRatio: 2,
          cacheBust: true,
        });
      };

      // Cover
      setLayoutMode("index");
      images.push(await captureBase64());

      // Details (first 5 for testing to save time/tokens, or all 15)
      const count = Math.min(trendingData.length, 15);
      for (let i = 0; i < count; i++) {
        setStatusMsg(`正在生成图片 ${i + 1}/${count}...`);
        applyProject(i);
        setLayoutMode("detail");
        images.push(await captureBase64());
      }

      // Restore
      applyProject(originalIndex);
      setLayoutMode(originalMode);

      // 2. Send to backend
      setStatusMsg(`正在启动 ${platform} 自动化发布程序...`);
      const res = await fetch(`/api/platform/${platform}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          title: displayDate,
          content: globalSummary,
          hashtags: globalHashtags,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg(`${platform} 自动化任务已启动！`);
      } else {
        setStatusMsg(`${platform} 发布失败: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`发布出错: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const previewRef = useRef<HTMLDivElement>(null);

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
        
        if (data.projects.length > 0) {
          applyProject(0, data.projects);
        }
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

  // Initialize with today's date and time
  useEffect(() => {
    const now = new Date();
    setTimeText(
      now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
    setWeekdayText(
      now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
    );

    loadCache();
    checkPlatformStatus();
  }, []);

  const displayDate = useMemo(() => {
    return new Date(selectedDate)
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();
  }, [selectedDate]);

  const formatStars = (stars: string) => {
    if (!stars) return "";
    const normalized = stars.toLowerCase().replace(/,/g, "");
    if (normalized.includes("k")) return normalized;
    const num = parseFloat(normalized);
    if (isNaN(num)) return stars;
    if (num >= 1000) {
      const k = num / 1000;
      return (k % 1 === 0 ? Math.floor(k) : k.toFixed(1)) + "k";
    }
    return String(num);
  };

  const keywordList = useMemo(() => {
    return highlightWords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
  }, [highlightWords]);

  const highlightedHtml = useMemo(() => {
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    let html = escapeHtml(content || "分享，让生活有了标点符号。");
    if (keywordList.length) {
      // Sort keywords by length descending to avoid partial matches
      const sortedKeywords = [...keywordList].sort(
        (a, b) => b.length - a.length,
      );
      const escapedKeywords = sortedKeywords.map((word) =>
        word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      );
      const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
      html = html.replace(
        regex,
        `<span style="color:${theme.accentColor}; font-weight: 900;">$1</span>`,
      );
    }
    return html.replace(/\n/g, "<br>");
  }, [content, keywordList, theme.accentColor]);

  const applyProject = (index: number, data?: RankingItem[]) => {
    const targetData = data || trendingData;
    const item = targetData[index];
    if (!item) return;

    updateCurrentIndex(index);
    setProjectName(item.title);
    setProjectUrl(item.url || "");
    setStars(item.stars || "");
    setStarsToday(item.starsToday || "");

    // Use AI summary if available, otherwise use original content
    setContent(item.aiSummary || item.content);
    setHighlightWords(item.aiKeywords || item.keywords);
  };

  const fetchTrending = async () => {
    setLoading(true);
    setIsProcessing(true);
    setProcessProgress(0);
    setStatusMsg(`正在获取 ${selectedDate} 的 GitHub Trending 列表...`);
    try {
      const response = await fetch(`/api/trending?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data: RankingItem[] = await response.json();

      setTrendingData(data);
      // Initialize view with first project
      if (data.length > 0) {
        const firstItem = data[0];
        setProjectName(firstItem.title);
        setProjectUrl(firstItem.url || "");
        setStars(firstItem.stars || "");
        setStarsToday(firstItem.starsToday || "");
        setContent(firstItem.content);
        setHighlightWords(firstItem.keywords);
      }

      // Sequential AI processing
      const processedData = [...data];
      for (let i = 0; i < processedData.length; i++) {
        const item = processedData[i];
        const progress = Math.round(((i) / processedData.length) * 100);
        setProcessProgress(progress);
        setStatusMsg(`正在生成 AI 摘要 (${i + 1}/${processedData.length}): ${item.title}`);

        try {
          const [owner, repo] = item.title.split("/");
          const aiRes = await fetch(`/api/process-readme?owner=${owner}&repo=${repo}&date=${selectedDate}`);
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            processedData[i] = {
              ...item,
              aiSummary: aiData.summary,
              aiKeywords: aiData.keywords,
            };
          } else {
            console.warn(`[AI] Failed to process ${item.title}, using fallback.`);
            processedData[i] = { ...item, aiSummary: item.content, aiKeywords: item.keywords };
          }
        } catch (err) {
          console.error(`[AI] Error processing ${item.title}:`, err);
          processedData[i] = { ...item, aiSummary: item.content, aiKeywords: item.keywords };
        }

        // Update state incrementally
        setTrendingData([...processedData]);

        // If user is currently looking at this project, update the view immediately
        if (currentIndexRef.current === i) {
          setContent(processedData[i].aiSummary || processedData[i].content);
          setHighlightWords(processedData[i].aiKeywords || processedData[i].keywords);
        }
      }

      setProcessProgress(100);
      setTrendingData(processedData);

      // Generate Global Summary using the processed data
      try {
        setStatusMsg("正在生成今日趋势大总结...");
        const gsRes = await fetch("/api/global-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            projects: processedData,
            date: selectedDate
          }),
        });
        if (gsRes.ok) {
          const gsData = await gsRes.json();
          if (gsData.summary) setGlobalSummary(gsData.summary);
          if (gsData.hashtags) setGlobalHashtags(gsData.hashtags);
        }
      } catch (err: any) {
        console.error("[AI] Error generating global summary:", err?.message || err);
      }

      setStatusMsg("已同步并处理完成所有 GitHub Trending 数据！");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.error || error.message || "未知错误";
      setStatusMsg(`获取失败: ${errorMsg}`);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const dataURLtoBlob = (dataUrl: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const waitForImages = async (container: HTMLElement) => {
    const imgs = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
            // force reload if not started
            if (!img.src) resolve();
          }),
      ),
    );
  };

  const exportImage = async () => {
    if (!previewRef.current || trendingData.length === 0) {
      alert("暂无数据可导出");
      return;
    }

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

      // Helper to capture current preview
      const capture = async (filename: string) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await waitForImages(previewRef.current!);
        const dataUrl = await toPng(previewRef.current!, {
          quality: 1,
          pixelRatio: 2,
          cacheBust: true,
        });
        folder.file(filename, dataURLtoBlob(dataUrl));
      };

      // Save original state
      const originalMode = layoutMode;
      const originalIndex = currentIndex;

      // 1. Cover (index) as 0.png
      setLayoutMode("index");
      await capture("0.png");

      // 2. Details 1-15
      for (let i = 0; i < trendingData.length; i++) {
        setStatusMsg(`正在生成第 ${i + 1}/${trendingData.length} 张…`);
        applyProject(i);
        setLayoutMode("detail");
        await capture(`${i + 1}.png`);
      }

      // Restore state
      applyProject(originalIndex);
      setLayoutMode(originalMode);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      download(zipBlob, `${folderName}.zip`);
      setStatusMsg("导出完成！");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (error) {
      console.error("Export Error:", error);
      alert("导出失败，请重试");
      setStatusMsg("导出失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-cyan-500/30 flex flex-col lg:flex-row overflow-hidden">
      {/* 左侧控制面板 */}
      <aside className="w-full shrink-0 border-b border-white/10 bg-zinc-950/80 backdrop-blur lg:w-[360px] xl:w-[400px] lg:border-b-0 lg:border-r z-10">
        <div className="h-full overflow-y-auto px-5 py-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                SocialCard
              </h1>
              {isProcessing ? (
                <div className="mt-1 text-[10px] font-mono text-cyan-400 animate-pulse">
                  AI 批量处理中: {processProgress}%
                </div>
              ) : (
                <p className="text-xs text-zinc-500 mt-1">
                  专业级社交媒体图文生成器
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setSelectedDate(newDate);
                  loadCache(newDate);
                }}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-400 outline-none focus:border-cyan-400/40 transition-colors"
              />
              <button
                onClick={fetchTrending}
                disabled={loading}
                className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors border border-cyan-400/20 ${loading ? "opacity-50" : ""}`}
                title="同步 GitHub 热榜"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* 布局模式切换 */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                布局模式
              </h3>
            </div>
            <div className="flex p-1 bg-zinc-900 rounded-xl border border-white/5">
              <button
                onClick={() => setLayoutMode("index")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${layoutMode === "index" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                索引总览 (Cover)
              </button>
              <button
                onClick={() => setLayoutMode("detail")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${layoutMode === "detail" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                单项详情 (Detail)
              </button>
            </div>
          </section>

          {/* 项目导航 (仅在详情模式显示) */}
          {layoutMode === "detail" && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    项目导航
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  #{currentIndex + 1} / {trendingData.length}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => applyProject(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-xs font-bold hover:bg-zinc-800 disabled:opacity-30 transition-all"
                >
                  上一个
                </button>
                <button
                  onClick={() =>
                    applyProject(
                      Math.min(trendingData.length - 1, currentIndex + 1),
                    )
                  }
                  disabled={currentIndex === trendingData.length - 1}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-xs font-bold hover:bg-zinc-800 disabled:opacity-30 transition-all"
                >
                  下一个
                </button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1">
                {trendingData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => applyProject(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "bg-cyan-400 w-full" : "bg-zinc-800 hover:bg-zinc-700"}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 模板选择 */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  视觉主题
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl.id);
                    setTheme(tpl.theme);
                  }}
                  className={`relative aspect-square rounded-xl border transition-all ${
                    selectedTemplate === tpl.id
                      ? "border-cyan-400 ring-2 ring-cyan-400/20"
                      : "border-white/5 hover:border-white/20"
                  }`}
                  style={{ background: tpl.theme.outerBg }}
                  title={tpl.name}
                >
                  <div
                    className="absolute inset-2 rounded-lg"
                    style={{ background: tpl.theme.cardBg }}
                  ></div>
                </button>
              ))}
            </div>
          </section>

          {/* 社交媒体发布 */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                一键分发 (Beta)
              </h3>
            </div>
            <div className="space-y-3">
              {/* Douyin */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">抖音 (Douyin)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${platformStatus.douyin ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                    {platformStatus.douyin ? "已登录" : "未登录"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loginPlatform("douyin")}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-all"
                  >
                    扫码登录
                  </button>
                  <button
                    onClick={() => publishToPlatform("douyin")}
                    disabled={!platformStatus.douyin || loading}
                    className="flex-1 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold transition-all disabled:opacity-30"
                  >
                    自动发布
                  </button>
                </div>
              </div>

              {/* Xiaohongshu */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">小红书 (XHS)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${platformStatus.xiaohongshu ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                    {platformStatus.xiaohongshu ? "已登录" : "未登录"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loginPlatform("xiaohongshu")}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-all"
                  >
                    扫码登录
                  </button>
                  <button
                    onClick={() => publishToPlatform("xiaohongshu")}
                    disabled={!platformStatus.xiaohongshu || loading}
                    className="flex-1 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold transition-all disabled:opacity-30"
                  >
                    自动发布
                  </button>
                </div>
              </div>
            </div>
          </section>

          {layoutMode === 'index' && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TypeIcon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  通用配置
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1.5 block">
                    作者名称
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-cyan-400/40 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 操作按钮 */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={exportImage}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-zinc-950 font-black text-sm hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
            >
              <Download className="w-4 h-4" />
              导出 3:4 高清图
            </button>
          </div>
        </div>
      </aside>

      {/* 右侧预览区 */}
      <main className="flex-1 bg-[#0c0c0e] flex items-center justify-center p-6 sm:p-12 overflow-auto relative">
        {/* 轮播按钮 (左右两侧) */}
        {layoutMode === "detail" && (
          <>
            <button
              onClick={() => applyProject(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-10 transition-all backdrop-blur-md z-30 group active:scale-95"
              title="上一个"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() =>
                applyProject(
                  Math.min(trendingData.length - 1, currentIndex + 1),
                )
              }
              disabled={currentIndex === trendingData.length - 1}
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-10 transition-all backdrop-blur-md z-30 group active:scale-95"
              title="下一个"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-2xl flex flex-col items-center relative z-10">
          {/* 3:4 容器 */}
          <div
            ref={previewRef}
            className="w-full aspect-[3/4] max-h-[85vh] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden relative"
            style={{ backgroundColor: theme.outerBg }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-[7%]">
              <div
                className={`w-full h-full rounded-[3.5rem] relative overflow-hidden flex flex-col shadow-inner ${layoutMode === "index" ? "py-[4%] px-[4%]" : "px-[6%] py-[6%]"}`}
                style={{
                  backgroundColor: theme.cardBg,
                  color: theme.textColor,
                }}
              >
                {layoutMode === "detail" ? (
                  <>
                    {/* Detail Mode Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <img
                        src={`https://ui-avatars.com/api/?name=${projectName.split("/")[0]}&background=random&size=100`}
                        alt="avatar"
                        crossOrigin="anonymous"
                        className="avatar d-none d-md-block w-14 h-14 rounded-full object-cover shadow-sm flex-shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://picsum.photos/seed/${projectName.split("/")[0]}/100/100`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl font-black tracking-tight leading-tight truncate mb-1">
                          {projectName}
                        </div>
                        <div className="text-xs font-mono opacity-40 truncate">
                          {projectUrl}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-3 mb-6">
                      <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5">
                        <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">
                          Rank
                        </div>
                        <div className="text-2xl font-black">
                          #{currentIndex + 1}
                        </div>
                      </div>
                      <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5">
                        <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">
                          Total Stars
                        </div>
                        <div className="text-2xl font-black">
                          {formatStars(stars)}
                        </div>
                      </div>
                      <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5">
                        <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">
                          Stars Today
                        </div>
                        <div
                          className="text-2xl font-black"
                          style={{ color: theme.accentColor }}
                        >
                          +{formatStars(starsToday)}
                        </div>
                      </div>
                    </div>

                    {/* Main Content (README Summary) */}
                    <div className="flex-1 flex flex-col min-h-0 mb-6">
                      <div
                        className="text-[clamp(1rem,2.8vw,1.5rem)] font-bold leading-snug tracking-tight overflow-hidden line-clamp-[14]"
                        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                      />
                    </div>

                    {/* Tags Section - Bottom */}
                    <div className="pt-6 border-t border-white/5">
                      <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-2">
                        Topics
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-hidden">
                        {keywordList.slice(0, 20).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider opacity-70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Index Mode Header */}
                    <div className="mb-6 text-center">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase mb-3 opacity-60">
                        Daily Ranking
                      </div>
                      <h2 className="text-3xl font-black tracking-tighter leading-none">
                        GitHub Trending
                      </h2>
                      <p className="text-xs font-mono opacity-30 mt-2">
                        TOP 15 PROJECTS • {displayDate}
                      </p>
                    </div>

                    {/* Ranking List */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      {trendingData.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 group"
                        >
                          <span className="w-6 text-base font-mono opacity-20 font-black">
                            {(idx + 1).toString().padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-base font-bold tracking-tight truncate">
                            {item.title}
                          </span>
                          <span
                            className="text-sm font-mono font-black"
                            style={{
                              color: idx < 3 ? theme.accentColor : "inherit",
                              opacity: idx < 3 ? 1 : 0.3,
                            }}
                          >
                            {formatStars(item.stars || "")} 今日:{item.starsToday || "0"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Index Mode Footer */}
                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                      <div className="opacity-30">
                        <div className="text-[10px] font-black tracking-widest uppercase">
                          Generated by @{authorName}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest">
                          {timeText}
                        </div>
                      </div>
                      <img
                        src="/my-avatar.jpg"
                        alt="author"
                        crossOrigin="anonymous"
                        className="w-20 h-20 rounded-full border-2 border-white/10 shadow-md object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {layoutMode === "index" && (
            <div className="w-full mt-6 flex flex-col gap-4">
              {/* Summary Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    今日趋势大总结
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        const urls = trendingData.map((item: any) => `https://github.com/${item.title}`).join("\n");
                        await navigator.clipboard.writeText(globalSummary + "\n\n" + globalHashtags + "\n\n" + urls);
                        setStatusMsg("已复制到剪贴板");
                        setTimeout(() => setStatusMsg(null), 2000);
                      } catch {
                        setStatusMsg("复制失败");
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-cyan-400 transition-colors border border-white/5"
                  >
                    一键复制
                  </button>
                </div>
                <textarea
                  readOnly
                  value={globalSummary}
                  className="w-full h-24 bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 outline-none resize-none focus:border-cyan-400/40 transition-colors"
                />
              </div>

              {/* Hashtags Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    自动生成话题 (#Hashtags)
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(globalHashtags);
                        setStatusMsg("已复制话题");
                        setTimeout(() => setStatusMsg(null), 2000);
                      } catch {
                        setStatusMsg("复制失败");
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-cyan-400 transition-colors border border-white/5"
                  >
                    复制话题
                  </button>
                </div>
                <textarea
                  readOnly
                  value={globalHashtags}
                  className="w-full h-16 bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-xs text-cyan-400/80 outline-none resize-none focus:border-cyan-400/40 transition-colors font-mono"
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <ImageIcon className="w-4 h-4 text-zinc-500" />
              <p className="text-[11px] text-zinc-400 font-medium">
                {statusMsg ||
                  (layoutMode === "index"
                    ? "索引模式：展示今日 Top 15 项目概览。"
                    : "详情模式：深度展示单个项目的核心数据与摘要。")}
              </p>
            </div>
            
            {isProcessing && (
              <div className="w-full space-y-2">
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${processProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-tight">
                  <span>Progress</span>
                  <span>{processProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
