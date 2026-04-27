"use client";

import { useMemo, useState } from "react";
import { Bot, Gauge, PenSquare, Sparkles } from "lucide-react";
import { ChapterManager } from "@/components/chapter-manager";
import { analyzeKeywordDensity, getWordCount } from "@/lib/seo";
import { Chapter, StylePreset } from "@/lib/types";

const initialChapters: Chapter[] = [
  { id: crypto.randomUUID(), title: "Opening System Breach", summary: "Introduce the world and core conflict.", targetWords: 3000 },
  { id: crypto.randomUUID(), title: "Fractured Directives", summary: "Escalate risk with conflicting agendas.", targetWords: 3500 }
];

export default function Page() {
  const [manuscriptTitle, setManuscriptTitle] = useState("Project Neon Manuscript");
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [activeChapterId, setActiveChapterId] = useState(initialChapters[0].id);
  const [style, setStyle] = useState<StylePreset>("seo");
  const [keywords, setKeywords] = useState("ai content, long-form writing, seo strategy");
  const [output, setOutput] = useState("");
  const [runningMemory, setRunningMemory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) || chapters[0];

  const keywordStats = useMemo(
    () => analyzeKeywordDensity(output, keywords.split(",")),
    [output, keywords]
  );

  const wordCount = getWordCount(output);

  const addChapter = () => {
    const chapter: Chapter = {
      id: crypto.randomUUID(),
      title: `New Chapter ${chapters.length + 1}`,
      summary: "Define this chapter objective.",
      targetWords: 3000
    };
    setChapters((prev) => [...prev, chapter]);
    setActiveChapterId(chapter.id);
  };

  const updateChapter = (id: string, patch: Partial<Chapter>) => {
    setChapters((prev) => prev.map((chapter) => (chapter.id === id ? { ...chapter, ...patch } : chapter)));
  };

  const deleteChapter = (id: string) => {
    setChapters((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      const next = prev.filter((chapter) => chapter.id !== id);
      if (activeChapterId === id) {
        setActiveChapterId(next[0].id);
      }
      return next;
    });
  };

  const generateSection = async () => {
    if (!activeChapter) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manuscriptTitle,
          style,
          chapter: activeChapter,
          chapterIndex: chapters.findIndex((chapter) => chapter.id === activeChapter.id),
          chapterCount: chapters.length,
          previousOutput: output,
          runningMemory,
          outline: chapters
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setOutput((prev) => `${prev}\n\n${data.generatedText}`.trim());
      setRunningMemory(data.updatedMemory || runningMemory);
    } catch (error) {
      setOutput((prev) => `${prev}\n\n[GENERATOR ERROR] ${String(error)}`.trim());
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-[1700px] p-6">
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <ChapterManager
            chapters={chapters}
            activeId={activeChapterId}
            onSelect={setActiveChapterId}
            onAdd={addChapter}
            onDelete={deleteChapter}
            onUpdate={updateChapter}
          />
        </div>

        <div className="glass-panel xl:col-span-6 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-terminal-neon/20 pb-3">
            <div className="flex items-center gap-2 text-terminal-neon">
              <PenSquare className="h-4 w-4" />
              <input
                value={manuscriptTitle}
                onChange={(event) => setManuscriptTitle(event.target.value)}
                className="bg-transparent text-lg font-semibold outline-none"
              />
            </div>
            <div className="rounded-md border border-terminal-neon/30 px-2 py-1 text-xs">Words: {wordCount}</div>
          </div>

          <textarea
            value={output}
            onChange={(event) => setOutput(event.target.value)}
            placeholder="Your recursive manuscript output appears here..."
            className="h-[68vh] w-full resize-none bg-transparent p-1 text-sm leading-7 outline-none"
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-terminal-neon/70">Target chapter words: {activeChapter?.targetWords ?? 0}</div>
            <button
              onClick={generateSection}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-md border border-terminal-neon/50 px-4 py-2 text-sm font-semibold shadow-glow transition hover:bg-terminal-neon/10 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Next Recursive Chunk"}
            </button>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-3">
          <div className="glass-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terminal-neon/80">
              <Bot className="h-3.5 w-3.5" /> AI Config
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg border border-terminal-neon/20 p-1">
              {[
                { id: "seo", label: "SEO Blog" },
                { id: "novelist", label: "Novelist" }
              ].map((option) => {
                const active = style === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setStyle(option.id as StylePreset)}
                    className={`rounded-md px-3 py-2 text-xs ${
                      active ? "bg-terminal-neon/15 text-terminal-neon shadow-glow" : "text-terminal-neon/70"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-terminal-neon/70">
              Style A preset active: <span className="font-semibold text-terminal-neon">{style === "seo" ? "SEO Blog" : "Novelist"}</span>
            </p>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terminal-neon/80">
              <Gauge className="h-3.5 w-3.5" /> SEO Density
            </div>
            <textarea
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              rows={3}
              className="mb-3 w-full resize-none rounded-md border border-terminal-neon/20 bg-terminal-bg/40 p-2 text-xs outline-none"
            />
            <ul className="space-y-2 text-xs">
              {keywordStats.map((stat) => (
                <li key={stat.keyword} className="flex items-center justify-between rounded-md border border-terminal-neon/20 px-2 py-1">
                  <span>{stat.keyword}</span>
                  <span>{stat.density}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-4 text-xs text-terminal-neon/70">
            <p className="mb-2 uppercase tracking-[0.2em] text-terminal-neon/80">Continuity Memory</p>
            <pre className="max-h-52 overflow-auto whitespace-pre-wrap">{runningMemory || "No memory captured yet."}</pre>
          </div>
        </div>
      </section>
    </main>
  );
}
