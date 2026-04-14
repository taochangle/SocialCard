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
}
