import React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Theme, RankingItem, CardStyle } from "../types";
import { IndexCard } from "./IndexCard";
import { DetailCard } from "./DetailCard";
import { getMaskGradient } from "../utils";

interface PreviewPanelProps {
  layoutMode: "index" | "detail";
  cardStyle: CardStyle;
  theme: Theme;
  displayDate: string;
  timeText: string;
  authorName: string;
  authorAvatar: string;
  lang: "zh" | "en";
  platform: "douyin" | "youtube";
  globalSummary: string;
  globalHashtags: string;
  trendingData: RankingItem[];
  projectName: string;
  projectUrl: string;
  stars: string;
  starsToday: string;
  currentIndex: number;
  highlightedHtml: string;
  keywordList: string[];
  avatarUrl?: string;
  statusMsg: string | null;
  loading: boolean;
  isProcessing: boolean;
  processProgress: number;
  previewRef: React.RefObject<HTMLDivElement | null>;
  setStatusMsg: (msg: string | null) => void;
  applyProject: (index: number) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  layoutMode,
  cardStyle,
  theme,
  displayDate,
  timeText,
  authorName,
  authorAvatar,
  lang,
  platform,
  globalSummary,
  globalHashtags,
  trendingData,
  projectName,
  projectUrl,
  stars,
  starsToday,
  currentIndex,
  highlightedHtml,
  keywordList,
  avatarUrl,
  statusMsg,
  loading,
  isProcessing,
  processProgress,
  previewRef,
  setStatusMsg,
  applyProject,
}) => {
  const cardEl =
    layoutMode === "detail" ? (
      <DetailCard
        style={cardStyle}
        theme={theme}
        displayDate={displayDate}
        timeText={timeText}
        authorName={authorName}
        projectName={projectName}
        projectUrl={projectUrl}
        stars={stars}
        starsToday={starsToday}
        currentIndex={currentIndex}
        highlightedHtml={highlightedHtml}
        keywordList={keywordList}
        avatarUrl={avatarUrl}
        lang={lang}
        fullBleed={platform === "youtube"}
      />
    ) : (
      <IndexCard
        style={cardStyle}
        theme={theme}
        displayDate={displayDate}
        timeText={timeText}
        authorName={authorName}
        authorAvatar={authorAvatar}
        lang={lang}
        fullBleed={platform === "youtube"}
        trendingData={trendingData}
      />
    );

  return (
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
              applyProject(Math.min(trendingData.length - 1, currentIndex + 1))
            }
            disabled={currentIndex === trendingData.length - 1}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-10 transition-all backdrop-blur-md z-30 group active:scale-95"
            title="下一个"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center relative z-10">
        {/* 9:16 外壳：抖音 = 3:4 卡片 + 上下蒙版；YouTube = 真 9:16 全屏 */}
        <div
          ref={previewRef}
          className="w-full aspect-[9/16] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col"
          style={{
            backgroundColor: theme.outerBg,
            maxWidth: "calc(85vh * 9 / 16)",
          }}
        >
          {platform === "youtube" ? (
            /* YouTube：真 9:16，内容撑满整屏，无蒙版 */
            <div className="relative flex-1 min-h-0 overflow-hidden">{cardEl}</div>
          ) : (
            <>
              {/* 顶部蒙版：背景色 + 遮罩 */}
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ background: getMaskGradient(theme.outerBg, "top") }}
                />
              </div>

              {/* 中部 3:4 卡片（保持原样） */}
              <div
                className="relative shrink-0 w-full aspect-[3/4] overflow-hidden"
                style={{ backgroundColor: theme.outerBg }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-[7%]">
                  {cardEl}
                </div>
              </div>

              {/* 底部蒙版：背景色 + 遮罩 */}
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ background: getMaskGradient(theme.outerBg, "bottom") }}
                />
              </div>
            </>
          )}
        </div>

        {/* 批量生成遮罩：避免渲染期间看到预览逐张切换 */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-zinc-950/70 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-sm font-bold text-zinc-200">
              {statusMsg || "正在批量生成图片…"}
            </p>
            {isProcessing && (
              <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${processProgress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
