export type StylePreset = "seo" | "novelist";

export type Chapter = {
  id: string;
  title: string;
  summary: string;
  targetWords: number;
};

export type KeywordStat = {
  keyword: string;
  count: number;
  density: number;
};
