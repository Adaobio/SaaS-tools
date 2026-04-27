import { KeywordStat } from "./types";

export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function analyzeKeywordDensity(text: string, keywords: string[]): KeywordStat[] {
  const normalized = text.toLowerCase();
  const totalWords = Math.max(getWordCount(text), 1);

  return keywords
    .map((rawKeyword) => {
      const keyword = rawKeyword.trim().toLowerCase();
      if (!keyword) {
        return null;
      }
      const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "g");
      const count = (normalized.match(pattern) || []).length;
      return {
        keyword,
        count,
        density: Number(((count / totalWords) * 100).toFixed(2))
      };
    })
    .filter((item): item is KeywordStat => item !== null)
    .sort((a, b) => b.density - a.density);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
