"use client";

import { Plus, Trash2 } from "lucide-react";
import { Chapter } from "@/lib/types";

type Props = {
  chapters: Chapter[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Chapter>) => void;
};

export function ChapterManager({ chapters, activeId, onSelect, onAdd, onDelete, onUpdate }: Props) {
  return (
    <aside className="glass-panel h-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.2em] text-terminal-neon/80">Outline Tree</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-md border border-terminal-neon/40 px-2 py-1 text-xs hover:bg-terminal-neon/10"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      <ul className="space-y-2">
        {chapters.map((chapter, idx) => {
          const active = chapter.id === activeId;
          return (
            <li key={chapter.id}>
              <button
                onClick={() => onSelect(chapter.id)}
                className={`w-full rounded-lg border p-3 text-left ${
                  active
                    ? "border-terminal-neon bg-terminal-neon/10 shadow-glow"
                    : "border-terminal-neon/30 bg-terminal-bg/40"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-terminal-neon/70">CH {idx + 1}</span>
                  <Trash2
                    className="h-3.5 w-3.5 text-terminal-neon/70 hover:text-red-400"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(chapter.id);
                    }}
                  />
                </div>
                <input
                  value={chapter.title}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => onUpdate(chapter.id, { title: event.target.value })}
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
                <textarea
                  value={chapter.summary}
                  rows={2}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => onUpdate(chapter.id, { summary: event.target.value })}
                  className="mt-2 w-full resize-none bg-transparent text-xs text-terminal-neon/70 outline-none"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
