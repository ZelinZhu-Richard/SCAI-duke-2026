"use client";

import { useState } from "react";
import type { ExampleResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  examples: ExampleResult[];
}

export default function ExampleList({ examples }: Props) {
  const [showOnlyFailures, setShowOnlyFailures] = useState(false);

  const filtered = showOnlyFailures
    ? examples.filter((e) => !e.intentCorrect)
    : examples;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-camel">
          Illustrative Examples
        </p>
        <button
          type="button"
          onClick={() => setShowOnlyFailures(!showOnlyFailures)}
          className={cn(
            "text-[12px] font-semibold underline underline-offset-2 transition-colors",
            showOnlyFailures
              ? "text-claret decoration-claret/30"
              : "text-dune decoration-bisque hover:text-tobacco"
          )}
        >
          {showOnlyFailures ? "Showing failures" : "Show only failures"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-[14px] text-flax italic">
          No failures found &mdash; all intents correctly classified.
        </p>
      ) : (
        <div className="space-y-0">
          {filtered.map((ex, i) => (
            <div
              key={ex.id}
              className={cn(
                "py-7",
                i < filtered.length - 1 && "border-b border-rule"
              )}
            >
              {/* Header */}
              <div className="flex items-baseline gap-5 mb-4 text-[13px]">
                <span className="font-bold text-chocolate">{ex.accent}</span>
                <span className="text-bisque">/</span>
                <span className={cn(
                  "font-bold",
                  ex.intentCorrect ? "text-moss" : "text-claret"
                )}>
                  {ex.intentCorrect ? "Correct" : "Incorrect"}
                </span>
                <span className="text-bisque">/</span>
                <span className="text-dune font-mono text-[11px] font-semibold">
                  CER {(ex.cer * 100).toFixed(1)}%
                </span>
              </div>

              {/* Audio */}
              <div className="mb-5">
                <audio controls className="h-8 w-full max-w-sm" preload="none">
                  <source src={ex.audioUrl} type="audio/wav" />
                </audio>
                <p className="mt-1.5 text-[10px] text-flax font-mono">
                  {ex.audioUrl}
                </p>
              </div>

              {/* Transcripts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[14px] mb-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-camel mb-2">
                    True transcript
                  </p>
                  <p className="text-tobacco leading-[1.8] border-l-2 border-camel pl-4">
                    {ex.trueTranscript}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-dune mb-2">
                    Whisper output
                  </p>
                  <p className="text-cognac leading-[1.8] border-l border-rule pl-4 italic">
                    {ex.whisperTranscript}
                  </p>
                </div>
              </div>

              {/* Intents */}
              <div className="flex gap-8 text-[12px]">
                <span className="text-dune">
                  True intent:{" "}
                  <strong className="font-bold font-mono text-tobacco">{ex.trueIntent}</strong>
                </span>
                <span className="text-dune">
                  Predicted:{" "}
                  <strong
                    className={cn(
                      "font-bold font-mono",
                      ex.intentCorrect ? "text-moss" : "text-claret"
                    )}
                  >
                    {ex.predictedIntent}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
