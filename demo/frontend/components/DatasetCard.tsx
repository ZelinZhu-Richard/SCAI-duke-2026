"use client";

import type { DatasetConfig } from "@/lib/datasets";
import { cn } from "@/lib/utils";
import DatasetDetailsDropdown from "./DatasetDetailsDropdown";

interface Props {
  dataset: DatasetConfig;
  selected: boolean;
  onClick: () => void;
}

export default function DatasetCard({ dataset, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-6 py-6 transition-all duration-150",
        selected
          ? "bg-cream border-l-[3px] border-l-teak"
          : "bg-porcelain hover:bg-cream border-l-[3px] border-l-transparent"
      )}
    >
      {/* Title row */}
      <div className="flex items-baseline gap-4 mb-2">
        <span className={cn(
          "text-[12px] font-mono font-bold tracking-wide",
          selected ? "text-teak" : "text-bisque"
        )}>
          {dataset.id}
        </span>
        <h3
          className={cn(
            "text-[17px] leading-snug",
            selected ? "font-bold text-espresso" : "font-semibold text-tobacco"
          )}
        >
          {dataset.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-[13px] text-cognac leading-[1.75] mb-3 max-w-xl">
        {dataset.description}
      </p>

      {/* Metadata */}
      <div className="flex gap-5 text-[12px]">
        <span className="font-semibold text-dune">{dataset.approxClips} clips</span>
        <span className="text-bisque">&middot;</span>
        <span className="text-dune capitalize">{dataset.noiseLevel} noise</span>
        <span className="text-bisque">&middot;</span>
        <span className="text-dune">{dataset.accentGroups.length} accent groups</span>
      </div>

      <DatasetDetailsDropdown dataset={dataset} />
    </button>
  );
}
