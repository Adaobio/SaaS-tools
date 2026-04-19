import { NextRequest, NextResponse } from "next/server";
import { buildPromptChain, updateRunningMemory } from "@/lib/generator";
import { Chapter, StylePreset } from "@/lib/types";

type GenerateBody = {
  manuscriptTitle: string;
  style: StylePreset;
  chapter: Chapter;
  chapterIndex: number;
  chapterCount: number;
  previousOutput: string;
  runningMemory: string;
  outline: Chapter[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing. Add it to server environment variables." },
        { status: 500 }
      );
    }

    const prompt = buildPromptChain({
      manuscriptTitle: body.manuscriptTitle,
      style: body.style,
      chapter: body.chapter,
      chapterIndex: body.chapterIndex,
      chapterCount: body.chapterCount,
      previousOutput: body.previousOutput,
      globalOutline: body.outline,
      runningMemory: body.runningMemory
    });

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You produce long-form output while preserving strict narrative continuity across chained prompts."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!completion.ok) {
      const details = await completion.text();
      return NextResponse.json({ error: `LLM request failed: ${details}` }, { status: 500 });
    }

    const payload = await completion.json();
    const generatedText = payload.choices?.[0]?.message?.content?.trim() || "";
    const updatedMemory = updateRunningMemory(body.runningMemory, generatedText);

    return NextResponse.json({ generatedText, updatedMemory });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected generation error" },
      { status: 500 }
    );
  }
}
