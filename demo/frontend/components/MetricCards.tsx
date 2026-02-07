"use client";

import { cn } from "@/lib/utils";

interface Props {
  summary: {
    avgCER: number;
    intentAccuracy: number;
    misroutingRate: number;
    maxDisparityIndex: number;
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
      label: "Avg. CER",
      value: `${(summary.avgCER * 100).toFixed(1)}%`,
      note: "Character error rate",
      status: summary.avgCER < 0.1 ? "good" : summary.avgCER < 0.2 ? "warning" : "bad",
    },
    {
      label: "Intent Accuracy",
      value: `${(summary.intentAccuracy * 100).toFixed(1)}%`,
      note: "Correctly classified",
      status: summary.intentAccuracy > 0.85 ? "good" : summary.intentAccuracy > 0.7 ? "warning" : "bad",
    },
    {
      label: "Misrouting",
      value: `${(summary.misroutingRate * 100).toFixed(1)}%`,
      note: "Wrong department",
      status: summary.misroutingRate < 0.1 ? "good" : summary.misroutingRate < 0.2 ? "warning" : "bad",
    },
    {
      label: "Max Disparity",
      value: summary.maxDisparityIndex.toFixed(2),
      note: "> 1.0 means unequal",
      status: summary.maxDisparityIndex < 1.3 ? "good" : summary.maxDisparityIndex < 2.0 ? "warning" : "bad",
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
