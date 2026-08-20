import React, { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  RefreshCw,
  Palette,
  Github,
  Sparkles,
  Type as TypeIcon,
  Download,
  Calendar,
  Image as ImageIcon,
  Youtube,
  Video,
  Music,
} from "lucide-react";
import { motion } from "framer-motion";
import { TEMPLATES, CARD_STYLES } from "../constants";
import { Theme, RankingItem, CardStyle } from "../types";

interface SidebarProps {
  loading: boolean;
  isProcessing: boolean;
  processProgress: number;
  statusMsg: string | null;
  layoutMode: "index" | "detail";
  setLayoutMode: (mode: "index" | "detail") => void;
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  cardStyle: CardStyle;
  setCardStyle: (style: CardStyle) => void;
  setTheme: (theme: Theme) => void;
  authorName: string;
  setAuthorName: (name: string) => void;
  authorAvatar: string;
  setAuthorAvatar: (avatar: string) => void;
  youtubeName: string;
  setYoutubeName: (name: string) => void;
  youtubeAvatar: string;
  setYoutubeAvatar: (avatar: string) => void;
  platform: "douyin" | "youtube";
  selectPlatform: (platform: "douyin" | "youtube") => void;
  selectedBgm: string;
  setSelectedBgm: (bgm: string) => void;
  previewLang: "zh" | "en";
  togglePreviewLang: (lang: "zh" | "en") => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  globalSummary: string;
  globalHashtags: string;
  platformStatus: { [key: string]: boolean };
  trendingData: RankingItem[];
  currentIndex: number;
  fetchTrending: () => void;
  loadCache: (date: string) => void;
  loginPlatform: (platform: string) => void;
  publishToPlatform: (platform: string) => void;
  exportYoutubeVideo: () => void;
  copyYoutubeCopy: () => void;
  exportImage: () => void;
  applyProject: (index: number) => void;
  setStatusMsg: (msg: string | null) => void;
  processStage: "idle" | "scraping" | "metadata" | "summarizing" | "global";
}

export const Sidebar: React.FC<SidebarProps> = ({
  loading,
  isProcessing,
  processProgress,
  statusMsg,
  layoutMode,
  setLayoutMode,
  selectedTemplate,
  setSelectedTemplate,
  cardStyle,
  setCardStyle,
  setTheme,
  authorName,
  setAuthorName,
  authorAvatar,
  setAuthorAvatar,
  youtubeName,
  setYoutubeName,
  youtubeAvatar,
  setYoutubeAvatar,
  platform,
  selectPlatform,
  selectedBgm,
  setSelectedBgm,
  previewLang,
  togglePreviewLang,
  selectedDate,
  setSelectedDate,
  globalSummary,
  globalHashtags,
  platformStatus,
  trendingData,
  currentIndex,
  fetchTrending,
  loadCache,
  loginPlatform,
  publishToPlatform,
  exportYoutubeVideo,
  copyYoutubeCopy,
  exportImage,
  applyProject,
  setStatusMsg,
  processStage,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const bgmAudioRef = useRef<HTMLAudioElement>(null);
  const [bgmTracks, setBgmTracks] = useState<string[]>([]);
  const [bgmPlaying, setBgmPlaying] = useState(false);

  useEffect(() => {
    fetch("/api/bgm")
      .then((r) => r.json())
      .then((d) => {
        if (d.tracks) setBgmTracks(d.tracks);
      })
      .catch(() => {});
  }, []);

  // 切换曲目时停止试听
  useEffect(() => {
    setBgmPlaying(false);
    bgmAudioRef.current?.pause();
  }, [selectedBgm]);

  const toggleBgm = () => {
    const audio = bgmAudioRef.current;
    if (!audio || !selectedBgm) return;
    if (bgmPlaying) {
      audio.pause();
      setBgmPlaying(false);
    } else {
      audio.play().then(() => setBgmPlaying(true)).catch(() => {});
    }
  };

  return (
    <aside className="w-full shrink-0 border-b border-white/10 bg-zinc-950/80 backdrop-blur lg:w-[360px] xl:w-[400px] lg:border-b-0 lg:border-r z-10 flex flex-col h-screen">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              SocialCard
            </h1>
            {isProcessing ? (
              <div className="mt-1 text-[10px] font-mono text-cyan-400 animate-pulse">
                批量处理中: {processProgress}%
              </div>
            ) : (
              <p className="text-xs text-zinc-500 mt-1">
                专业级社交媒体图文生成器
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setSelectedDate(newDate);
                  loadCache(newDate);
                }}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              />
              <button
                onClick={() => dateInputRef.current?.showPicker()}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-cyan-400/40 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-zinc-300 transition-all"
              >
                <Calendar className="w-3 h-3 text-cyan-400" />
                {selectedDate}
              </button>
            </div>
            <button
              onClick={fetchTrending}
              disabled={loading}
              className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors border border-cyan-400/20 ${loading ? "opacity-50" : ""}`}
              title="同步 GitHub 热榜"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Status Panel (Migrated from Preview) */}
        <div className="mb-8 flex flex-col gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
          {/* Stage Indicator */}
          {processStage !== "idle" && (
            <div className="flex items-center justify-between mb-1">
              {[
                { key: "scraping", label: "列表" },
                { key: "metadata", label: "元数据" },
                { key: "summarizing", label: "AI摘要" },
                { key: "global", label: "汇总" }
              ].map((stage, i) => {
                const stages = ["scraping", "metadata", "summarizing", "global"];
                const currentIndex = stages.indexOf(processStage);
                const isActive = stage.key === processStage;
                const isCompleted = stages.indexOf(stage.key) < currentIndex;
                
                return (
                  <React.Fragment key={stage.key}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : isCompleted ? "bg-cyan-400/40" : "bg-zinc-700"}`} />
                      <span className={`text-[8px] font-bold uppercase tracking-tighter ${isActive ? "text-cyan-400" : isCompleted ? "text-cyan-400/40" : "text-zinc-600"}`}>
                        {stage.label}
                      </span>
                    </div>
                    {i < 3 && <div className={`flex-1 h-[1px] mx-1 mb-3 ${stages.indexOf(stages[i+1]) <= currentIndex ? "bg-cyan-400/20" : "bg-zinc-800"}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
            <p className="text-[10px] text-zinc-400 font-medium">
              {statusMsg ||
                (layoutMode === "index"
                  ? "索引模式：展示今日 Top 15 项目概览。"
                  : "详情模式：深度展示单个项目的核心数据与摘要。")}
            </p>
          </div>

          {isProcessing && (
            <div className="w-full space-y-1.5">
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${processProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-tight">
                <span>Progress</span>
                <span>{processProgress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* 目标平台 */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Youtube className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              目标平台
            </h3>
          </div>
          <div className="flex p-1 bg-zinc-900 rounded-xl border border-white/5">
            {[
              { id: "douyin" as const, label: "抖音", desc: "拼接 9:16 · 中文" },
              { id: "youtube" as const, label: "YouTube", desc: "真 9:16 · 英文" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => selectPlatform(p.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  platform === p.id
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                title={p.desc}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* 背景音乐（仅 YouTube） */}
        {platform === "youtube" && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                背景音乐
              </h3>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedBgm}
                onChange={(e) => setSelectedBgm(e.target.value)}
                className="flex-1 min-w-0 bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-cyan-400/40 transition-colors"
              >
                <option value="">无 BGM</option>
                {bgmTracks.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/\.mp3$/, "").replace(/^\d+-/, "").replace(/-/g, " ")}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleBgm}
                disabled={!selectedBgm}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all disabled:opacity-30 ${
                  bgmPlaying
                    ? "bg-red-500/10 border-red-400/30 text-red-400"
                    : "bg-cyan-500/10 border-cyan-400/20 text-cyan-400 hover:bg-cyan-500/20"
                }`}
              >
                {bgmPlaying ? "停止" : "试听"}
              </button>
            </div>
            {selectedBgm && (
              <audio
                ref={bgmAudioRef}
                src={`/bgm/${selectedBgm}`}
                onEnded={() => setBgmPlaying(false)}
                preload="none"
              />
            )}
          </section>
        )}

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
          {/* 预览语言切换 */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              预览语言
            </span>
            <div className="flex-1 flex p-1 bg-zinc-900 rounded-xl border border-white/5">
              {[
                { id: "zh" as const, label: "中文" },
                { id: "en" as const, label: "English" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => togglePreviewLang(lang.id)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    previewLang === lang.id
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
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
                onClick={() => applyProject(Math.min(trendingData.length - 1, currentIndex + 1))}
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
                disabled={loading}
                onClick={() => {
                  setSelectedTemplate(tpl.id);
                  setTheme(tpl.theme);
                }}
                className={`relative aspect-square rounded-xl border transition-all ${
                  selectedTemplate === tpl.id
                    ? "border-cyan-400 ring-2 ring-cyan-400/20"
                    : "border-white/5 hover:border-white/20"
                } ${loading ? "opacity-40 cursor-not-allowed" : ""}`}
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

        {/* 卡片样式 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                卡片样式
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {CARD_STYLES.length} 套
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {CARD_STYLES.map((style) => (
              <button
                key={style.id}
                disabled={loading}
                onClick={() => setCardStyle(style.id)}
                title={style.desc}
                className={`rounded-lg border px-1 py-2 text-[10px] font-bold transition-all ${
                  cardStyle === style.id
                    ? "border-cyan-400 ring-2 ring-cyan-400/20 bg-zinc-900 text-white"
                    : "border-white/5 hover:border-white/20 bg-zinc-900/40 text-zinc-400"
                } ${loading ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </section>

        {layoutMode === 'index' && (
          <>
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
                    {platform === "youtube" ? "YouTube 名称" : "作者名称"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                    <input
                      type="text"
                      value={platform === "youtube" ? youtubeName : authorName}
                      onChange={(e) =>
                        platform === "youtube"
                          ? setYoutubeName(e.target.value)
                          : setAuthorName(e.target.value)
                      }
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:border-cyan-400/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1.5 block">
                    {platform === "youtube" ? "YouTube 头像" : "作者头像"}
                  </label>
                  <div className="flex gap-2.5">
                    {[
                      { id: "/my-avatar.jpg", name: "默认" },
                      { id: "/youtube.jpg", name: "YouTube" },
                    ].map((av) => (
                      <button
                        key={av.id}
                        onClick={() =>
                          platform === "youtube"
                            ? setYoutubeAvatar(av.id)
                            : setAuthorAvatar(av.id)
                        }
                        title={av.name}
                        className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                          (platform === "youtube" ? youtubeAvatar : authorAvatar) === av.id
                            ? "border-cyan-400 ring-2 ring-cyan-400/30"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <img src={av.id} alt={av.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 text-center text-[7px] font-bold bg-black/50 text-white py-0.5">
                          {av.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* AI Summaries Section */}
            <section className="mb-8 space-y-6">
              {/* Summary */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    今日趋势大总结
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        const urls = trendingData.map((item) => `https://github.com/${item.title}`).join("\n");
                        await navigator.clipboard.writeText(globalSummary + "\n\n" + globalHashtags + "\n\n" + urls);
                        setStatusMsg("已复制到剪贴板");
                        setTimeout(() => setStatusMsg(null), 2000);
                      } catch {
                        setStatusMsg("复制失败");
                      }
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-cyan-400 transition-colors border border-white/5"
                  >
                    一键复制
                  </button>
                </div>
                <textarea
                  readOnly
                  value={globalSummary}
                  className="w-full h-32 bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-xs text-zinc-300 outline-none resize-none focus:border-cyan-400/40 transition-colors custom-scrollbar"
                />
              </div>

              {/* 社交媒体发布 - Reordered here */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    平台分发
                  </h3>
                </div>

                {/* 抖音：自动发布 */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-cyan-400" />
                      抖音 (Douyin)
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${platformStatus.douyin ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                      {platformStatus.douyin ? "已登录" : "未登录"}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500">图文轮播 · 中文文案</p>
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

                {/* YouTube：手动上传 */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-cyan-400" />
                      YouTube Shorts
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 font-mono">
                      手动
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500">生成竖屏 MP4 · 英文文案，自行上传到 Studio</p>
                  <div className="flex gap-2">
                    <button
                      onClick={exportYoutubeVideo}
                      disabled={loading}
                      className="flex-1 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold transition-all disabled:opacity-30"
                    >
                      生成并下载 MP4
                    </button>
                    <button
                      onClick={copyYoutubeCopy}
                      disabled={loading}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-all disabled:opacity-30"
                    >
                      复制英文文案
                    </button>
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    话题 (#Hashtags)
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
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-cyan-400 transition-colors border border-white/5"
                  >
                    复制话题
                  </button>
                </div>
                <textarea
                  readOnly
                  value={globalHashtags}
                  className="w-full h-20 bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-xs text-cyan-400/80 outline-none resize-none focus:border-cyan-400/40 transition-colors font-mono"
                />
              </div>
            </section>
          </>
        )}
      </div>

      {/* Fixed Footer Actions */}
      <div className="p-5 border-t border-white/10 bg-zinc-950">
        <button
          onClick={exportImage}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-zinc-950 font-black text-sm hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
        >
          <Download className="w-4 h-4" />
          导出 9:16 高清图
        </button>
      </div>
    </aside>
  );
};
