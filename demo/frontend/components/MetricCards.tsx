"use client";

import { cn } from "@/lib/utils";

interface Props {
  summary: {
    avgWER: number;
    avgIntentError: number;
    maxDisparityIndex: number;
    totalSamples: number;
  };
}

function statusColor(status: "good" | "warning" | "bad") {
  return cn(
    status === "good" && "text-moss",
    status === "warning" && "text-patina",
    status === "bad" && "text-claret"
  );
}

export default function MetricCards({ summary }: Props) {
  const metrics: {
    label: string;
    value: string;
    note: string;
    status: "good" | "warning" | "bad";
  }[] = [
    {
      label: "Avg. WER",
      value: `${(summary.avgWER * 100).toFixed(1)}%`,
      note: "Word error rate (weighted)",
      status: summary.avgWER < 0.1 ? "good" : summary.avgWER < 0.25 ? "warning" : "bad",
    },
    {
      label: "Intent Error",
      value: `${(summary.avgIntentError * 100).toFixed(1)}%`,
      note: "Misclassified intent (smoothed)",
      status: summary.avgIntentError < 0.1 ? "good" : summary.avgIntentError < 0.25 ? "warning" : "bad",
    },
    {
      label: "Max Disparity",
      value: summary.maxDisparityIndex.toFixed(2),
      note: "Higher = worse bias vs other accents",
      status: summary.maxDisparityIndex < 1.0 ? "good" : summary.maxDisparityIndex < 1.5 ? "warning" : "bad",
    },
    {
      label: "Total Samples",
      value: summary.totalSamples.toString(),
      note: "Audio clips evaluated",
      status: "good",
    },
  ];

  return (
    <div className="border-t-2 border-edge">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={cn(
              "py-7",
              i < metrics.length - 1 && "lg:border-r border-rule",
              i < 2 && "border-b lg:border-b-0 border-rule",
              i % 2 === 0 ? "bg-cream" : "bg-porcelain",
              "px-6"
            )}
          >
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-camel mb-3">
              {m.label}
            </p>
            <p className={cn("text-[32px] font-bold leading-none mb-2", statusColor(m.status))}>
              {m.value}
            </p>
            <p className="text-[11px] text-dune">{m.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
