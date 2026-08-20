export interface Theme {
  outerBg: string;
  cardBg: string;
  textColor: string;
  accentColor: string;
}

export interface Template {
  id: string;
  name: string;
  desc: string;
  theme: Theme;
}

export interface RankingItem {
  id: number;
  title: string;
  content: string;
  keywords: string;
  username: string;
  stars?: string;
  starsToday?: string;
  url?: string;
  aiSummary?: string;
  aiKeywords?: string;
  avatarUrl?: string;
}

export type CardStyle =
  | "classic"
  | "poster"
  | "terminal"
  | "magazine"
  | "databar"
  | "cardstack"
  | "glass"
  | "chat"
  | "neon"
  | "newspaper"
  | "minimal"
  | "notebook"
  | "timeline"
  | "browser"
  | "github"
  | "cinema"
  | "hud"
  | "pixel"
  | "ticket"
  | "sign"
  | "toc"
  | "notify"
  | "receipt"
  | "aurora"
  | "cyber"
  | "glitch"
  | "bauhaus"
  | "greeting"
  | "infographic"
  | "pornhub"
  | "x"
  | "telegram"
  | "instagram"
  | "onlyfans"
  | "ios";
