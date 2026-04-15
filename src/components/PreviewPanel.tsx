import React from "react";
import { Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Theme, RankingItem } from "../types";
import { IndexCard } from "./IndexCard";
import { DetailCard } from "./DetailCard";

interface PreviewPanelProps {
  layoutMode: "index" | "detail";
  theme: Theme;
  displayDate: string;
  timeText: string;
  weekdayText: string;
  authorName: string;
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
  statusMsg: string | null;
  isProcessing: boolean;
  processProgress: number;
  previewRef: React.RefObject<HTMLDivElement | null>;
  setStatusMsg: (msg: string | null) => void;
  applyProject: (index: number) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  layoutMode,
  theme,
  displayDate,
  timeText,
  weekdayText,
  authorName,
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
  statusMsg,
  isProcessing,
  processProgress,
  previewRef,
  setStatusMsg,
  applyProject,
}) => {
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
        {/* 3:4 容器 */}
        <div
          ref={previewRef}
          className="w-full aspect-[3/4] max-h-[85vh] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden relative"
          style={{ backgroundColor: theme.outerBg }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-[7%]">
            {layoutMode === "detail" ? (
              <DetailCard
                theme={theme}
                projectName={projectName}
                projectUrl={projectUrl}
                stars={stars}
                starsToday={starsToday}
                currentIndex={currentIndex}
                highlightedHtml={highlightedHtml}
                keywordList={keywordList}
              />
            ) : (
              <IndexCard
                theme={theme}
                displayDate={displayDate}
                timeText={timeText}
                weekdayText={weekdayText}
                authorName={authorName}
                trendingData={trendingData}
              />
            )}
          </div>
        </div>

        {/* Status Panel */}
        <div className="w-full mt-8 flex flex-col gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
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
  );
};
