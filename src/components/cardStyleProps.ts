import { Theme, RankingItem } from "../types";
import { formatStars } from "../utils";

// Tiny i18n helper for card chrome labels
export const L = (lang: "zh" | "en", zh: string, en: string) => (lang === "en" ? en : zh);

export interface IndexStyleProps {
  theme: Theme;
  displayDate: string;
  timeText: string;
  authorName: string;
  authorAvatar: string;
  lang: "zh" | "en";
  fullBleed?: boolean;
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
  lang: "zh" | "en";
  fullBleed?: boolean;
}

export const pad = (n: number) => String(n + 1).padStart(2, "0");
export { formatStars };
