"use client";

import type { RunPhase } from "@/lib/types";
import { cn } from "@/lib/utils";

const PHASES: { key: RunPhase; label: string }[] = [
  { key: "loading", label: "Loading dataset" },
  { key: "transcribing", label: "Transcribing" },
  { key: "scoring", label: "Scoring" },
  { key: "aggregating", label: "Aggregating" },
];

const PHASE_ORDER: Record<string, number> = {
  loading: 0,
  transcribing: 1,
  scoring: 2,
  aggregating: 3,
  done: 4,
};

interface Props {
  phase: RunPhase;
}

export default function ProgressUI({ phase }: Props) {
  const currentIndex = PHASE_ORDER[phase] ?? -1;

  return (
    <div className="py-8">
      <p className="text-[15px] font-semibold text-tobacco italic mb-5">Running&hellip;</p>
      <div className="flex gap-8">
        {PHASES.map((p, i) => {
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;
          return (
            <div key={p.key} className="flex items-center gap-2.5">
              <span
                className={cn(
                  "block h-2 w-2 rounded-full transition-colors",
                  isDone && "bg-moss",
                  isActive && "bg-chocolate animate-pulse",
                  !isDone && !isActive && "bg-khaki"
                )}
              />
              <span
                className={cn(
                  "text-[12px] transition-colors",
                  isDone && "text-moss font-semibold",
                  isActive && "text-chocolate font-bold",
                  !isDone && !isActive && "text-flax"
                )}
              >
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
