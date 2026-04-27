import { Chapter, StylePreset } from "./types";

const MAX_CONTEXT_CHARS = 4500;

export function chunkTextByWords(text: string, chunkSize = 750): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
}

export function buildPromptChain(params: {
  manuscriptTitle: string;
  style: StylePreset;
  chapter: Chapter;
  chapterIndex: number;
  chapterCount: number;
  previousOutput: string;
  globalOutline: Chapter[];
  runningMemory: string;
}): string {
  const styleBlocks: Record<StylePreset, string> = {
    seo: [
      "Persona: Senior SEO strategist and technical content writer.",
      "Structure: include skimmable headings, key takeaways, and actionable insights.",
      "Tone: authoritative, data-informed, crisp."
    ].join("\n"),
    novelist: [
      "Persona: Literary novelist focused on immersive scene design.",
      "Structure: narrative-driven pacing with strong continuity and emotional cadence.",
      "Tone: vivid, sensory, and human."
    ].join("\n")
  };

  const outline = params.globalOutline
    .map((item, idx) => `${idx + 1}. ${item.title} (${item.targetWords} words) — ${item.summary}`)
    .join("\n");

  const clippedMemory = params.runningMemory.slice(-MAX_CONTEXT_CHARS);
  const clippedPrevious = params.previousOutput.slice(-MAX_CONTEXT_CHARS);

  return [
    "You are writing one part of a very long manuscript with strict continuity.",
    `Project title: ${params.manuscriptTitle}`,
    `Current chapter: ${params.chapterIndex + 1}/${params.chapterCount} - ${params.chapter.title}`,
    `Chapter objective: ${params.chapter.summary}`,
    `Target words for this chapter: ${params.chapter.targetWords}`,
    "",
    "Global outline:",
    outline,
    "",
    "Style preset:",
    styleBlocks[params.style],
    "",
    "Running continuity memory (compressed):",
    clippedMemory || "(none yet)",
    "",
    "Most recent generated text excerpt:",
    clippedPrevious || "(none yet)",
    "",
    "Write the next coherent chapter segment. Preserve entities, timeline, voice, and unresolved narrative threads.",
    "End with 3 bullet continuity notes labeled 'NEXT_MEMORY' for recursive context retention."
  ].join("\n");
}

export function updateRunningMemory(previousMemory: string, latestOutput: string): string {
  const memoryAddition = latestOutput
    .split("\n")
    .filter((line) => line.includes("NEXT_MEMORY") || line.startsWith("- "))
    .slice(-5)
    .join("\n");

  return `${previousMemory}\n${memoryAddition}`.trim().slice(-MAX_CONTEXT_CHARS * 2);
}
