import React from "react";
import { Image as ImageIcon } from "lucide-react";
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
}) => {
  return (
    <main className="flex-1 overflow-y-auto bg-black p-6 lg:p-12">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <div
              ref={previewRef}
              className="preview-container overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10"
            >
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
                  globalSummary={globalSummary}
                  globalHashtags={globalHashtags}
                  trendingData={trendingData}
                  setStatusMsg={setStatusMsg}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {layoutMode === "index" && (
              <div className="w-full flex flex-col gap-4">
                {/* Summary Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
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
        </div>
      </div>
    </main>
  );
};
