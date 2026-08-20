import { Theme, RankingItem } from "../types";
import { formatStars } from "../utils";

export interface IndexStyleProps {
  theme: Theme;
  displayDate: string;
  timeText: string;
  authorName: string;
  trendingData: RankingItem[];
}

export interface DetailStyleProps {
  theme: Theme;
  displayDate: string;
  timeText: string;
  authorName: string;
  projectName: string;
  projectUrl: string;
  stars: string;
  starsToday: string;
  currentIndex: number;
  highlightedHtml: string;
  keywordList: string[];
  avatarUrl?: string;
}

export const pad = (n: number) => String(n + 1).padStart(2, "0");
export { formatStars };
