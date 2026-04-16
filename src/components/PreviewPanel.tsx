import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Theme, RankingItem } from "../types";
import { IndexCard } from "./IndexCard";
import { DetailCard } from "./DetailCard";

interface PreviewPanelProps {
  layoutMode: "index" | "detail";
  theme: Theme;
  displayDate: string;
  timeText: string;
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
  avatarUrl?: string;
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
  avatarUrl,
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
                avatarUrl={avatarUrl}
              />
            ) : (
              <IndexCard
                theme={theme}
                displayDate={displayDate}
                timeText={timeText}
                authorName={authorName}
                trendingData={trendingData}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
