import React from "react";
import { Theme } from "../types";
import { formatStars, getFrameBorderColor } from "../utils";

interface DetailCardProps {
  theme: Theme;
  projectName: string;
  projectUrl: string;
  stars: string;
  starsToday: string;
  currentIndex: number;
  highlightedHtml: string;
  keywordList: string[];
  avatarUrl?: string;
}

export const DetailCard: React.FC<DetailCardProps> = ({
  theme,
  projectName,
  projectUrl,
  stars,
  starsToday,
  currentIndex,
  highlightedHtml,
  keywordList,
  avatarUrl,
}) => {
  return (
    <div
      className="w-full h-full rounded-[3.5rem] relative overflow-hidden flex flex-col shadow-inner px-[6%] py-[6%]"
      style={{
        backgroundColor: theme.cardBg,
        color: theme.textColor,
        border: `2px solid ${getFrameBorderColor(theme.outerBg)}`,
      }}
    >
      {/* Detail Mode Header */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src={avatarUrl || `https://ui-avatars.com/api/?name=${projectName.split("/")[0]}&background=random&size=100`}
          alt="avatar"
          crossOrigin="anonymous"
          className="avatar d-none d-md-block w-14 h-14 rounded-full object-cover shadow-sm flex-shrink-0"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${projectName.split("/")[0]}/100/100`;
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
          <div className="text-2xl font-black">#{currentIndex + 1}</div>
        </div>
        <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5">
          <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">
            Total Stars
          </div>
          <div className="text-2xl font-black">{formatStars(stars)}</div>
        </div>
        <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5">
          <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">
            Stars Today
          </div>
          <div className="text-2xl font-black" style={{ color: theme.accentColor }}>
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
    </div>
  );
};
