"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChartMeta {
  src: string;
  title: string;
  description: string;
  accents: string[];
  matchMode: "any" | "all" | "many";
}

const CHARTS: ChartMeta[] = [
  {
    src: "/charts/wer-intent-paired.png",
    title: "WER and Intent Error Rate by Accent",
    description:
      "Paired bar chart comparing Word Error Rate (blue) and intent error rate (orange) for each accent group, sorted by severity.",
    accents: [
      "Ukrainian/Russian/Australian",
      "India and South Asia",
      "England English",
      "Irish English",
      "Australian English",
    ],
    matchMode: "any",
  },
  {
    src: "/charts/tradeoff-bubble.png",
    title: "Accent Trade-off Map: WER vs Intent Error",
    description:
      "Bubble chart where position shows WER (x-axis) vs intent error (y-axis), and bubble size reflects sample count. Upper-right = worst outcomes.",
    accents: [
      "India and South Asia",
      "England English",
      "Australian English",
      "Irish English",
    ],
    matchMode: "any",
  },
  {
    src: "/charts/disparity-index-bar.png",
    title: "Accent Disparity Index vs Baseline: United States English",
    description:
      "Horizontal bar chart comparing each accent's disparity index to the US English baseline. Red bars exceed baseline; green bars are at or below.",
    accents: [],
    matchMode: "many",
  },
  {
    src: "/charts/misrouting-speaker-group.png",
    title: "Intent Misrouting Rate by Speaker Group",
    description:
      "Compares intent misrouting between ESL speakers and native speakers, revealing the systemic gap in service quality.",
    accents: [
      "India and South Asia",
      "Filipino",
      "German English (Non-native)",
      "Southern African",
    ],
    matchMode: "any",
  },
];

function shouldShow(chart: ChartMeta, selected: string[]): boolean {
  if (chart.matchMode === "many") {
    return selected.length >= 4;
  }
  if (chart.matchMode === "all") {
    return chart.accents.every((a) => selected.includes(a));
  }
  return chart.accents.some((a) => selected.includes(a));
}

interface Props {
  selectedAccents: string[];
}

export default function AnalysisCharts({ selectedAccents }: Props) {
  const visible = CHARTS.filter((c) => shouldShow(c, selectedAccents));
  const [expanded, setExpanded] = useState<string | null>(null);

  if (visible.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-camel mb-2">
        Research Analysis
      </p>
      <h3 className="text-[22px] font-bold text-espresso mb-2">
        Charts from Experimental Data
      </h3>
      <p className="text-[13px] text-cognac mb-8">
        Visualizations generated from real benchmark runs. Showing {visible.length} chart{visible.length !== 1 ? "s" : ""} relevant to your selected accents.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visible.map((chart) => (
          <button
            key={chart.src}
            type="button"
            onClick={() =>
              setExpanded(expanded === chart.src ? null : chart.src)
            }
            className={cn(
              "text-left border border-edge bg-cream hover:bg-porcelain transition-colors overflow-hidden group",
              expanded === chart.src && "md:col-span-2"
            )}
          >
            <div className="relative w-full overflow-hidden">
              <Image
                src={chart.src}
                alt={chart.title}
                width={expanded === chart.src ? 1200 : 600}
                height={expanded === chart.src ? 700 : 350}
                className="w-full h-auto"
                unoptimized
              />
            </div>
            <div className="px-5 py-4 border-t border-rule">
              <p className="text-[14px] font-bold text-chocolate mb-1">
                {chart.title}
              </p>
              <p className="text-[12px] text-cognac leading-[1.7]">
                {chart.description}
              </p>
              <p className="text-[10px] text-flax mt-2 italic group-hover:text-dune transition-colors">
                {expanded === chart.src ? "Click to collapse" : "Click to expand"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
