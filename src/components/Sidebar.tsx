import React from "react";
import {
  LayoutGrid,
  RefreshCw,
  Palette,
  Github,
  Sparkles,
  Type as TypeIcon,
  Download,
} from "lucide-react";
import { TEMPLATES } from "../constants";
import { Theme, RankingItem } from "../types";

interface SidebarProps {
  loading: boolean;
  isProcessing: boolean;
  processProgress: number;
  statusMsg: string | null;
  layoutMode: "index" | "detail";
  setLayoutMode: (mode: "index" | "detail") => void;
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  setTheme: (theme: Theme) => void;
  authorName: string;
  setAuthorName: (name: string) => void;
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
  exportImage: () => void;
  applyProject: (index: number) => void;
  setStatusMsg: (msg: string | null) => void;
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
  setTheme,
  authorName,
  setAuthorName,
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
  exportImage,
  applyProject,
  setStatusMsg,
}) => {
  return (
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
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
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
            {["douyin", "xiaohongshu"].map((p) => (
              <div key={p} className="p-3 rounded-xl bg-zinc-900 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">
                    {p === "douyin" ? "抖音 (Douyin)" : "小红书 (XHS)"}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${platformStatus[p] ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                    {platformStatus[p] ? "已登录" : "未登录"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loginPlatform(p)}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold transition-all"
                  >
                    扫码登录
                  </button>
                  <button
                    onClick={() => publishToPlatform(p)}
                    disabled={!platformStatus[p] || loading}
                    className="flex-1 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold transition-all disabled:opacity-30"
                  >
                    自动发布
                  </button>
                </div>
              </div>
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
                    作者名称
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
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
  );
};
