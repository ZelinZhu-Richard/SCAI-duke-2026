"use client";

import type { GroupResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  data: GroupResult[];
}

function speakerBadge(type: string) {
  switch (type) {
    case "esl":
      return "text-claret";
    case "native":
      return "text-moss";
    case "dialect":
      return "text-patina";
    default:
      return "text-dune";
  }
}

export default function GroupTable({ data }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b-2 border-edge">
            <th className="pb-3 pr-6 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-left">
              Accent
            </th>
            <th className="pb-3 pr-6 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-left">
              Dataset
            </th>
            <th className="pb-3 pr-6 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              n
            </th>
            <th className="pb-3 pr-6 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              WER
            </th>
            <th className="pb-3 pr-6 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              Intent Err.
            </th>
            <th className="pb-3 pr-6 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              Disparity
            </th>
            <th className="pb-3 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-left">
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={`${row.accent}-${row.dataset}`}
              className={cn(
                "border-b border-rule",
                i % 2 === 0 ? "bg-cream" : "bg-porcelain"
              )}
            >
              <td className="py-3.5 pr-6 font-bold text-chocolate text-[12px]">
                {row.accent}
              </td>
              <td className="py-3.5 pr-6 text-dune text-[11px]">
                {row.dataset}
              </td>
              <td className="py-3.5 pr-6 text-right text-dune font-mono text-[11px]">
                {row.n}
              </td>
              <td className="py-3.5 pr-6 text-right font-mono text-[12px]">
                <span
                  className={cn(
                    "font-bold",
                    row.avgWer < 0.1
                      ? "text-moss"
                      : row.avgWer < 0.25
                      ? "text-patina"
                      : "text-claret"
                  )}
                >
                  {(row.avgWer * 100).toFixed(1)}%
                </span>
              </td>
              <td className="py-3.5 pr-6 text-right font-mono text-[11px]">
                <span
                  className={cn(
                    "font-bold",
                    row.intentErrorRateSmoothed < 0.1
                      ? "text-moss"
                      : row.intentErrorRateSmoothed < 0.25
                      ? "text-patina"
                      : "text-claret"
                  )}
                >
                  {(row.intentErrorRateSmoothed * 100).toFixed(1)}%
                </span>
              </td>
              <td className="py-3.5 pr-6 text-right font-mono text-[12px]">
                <span
                  className={cn(
                    "font-bold",
                    row.disparityIndex <= 0.5
                      ? "text-moss"
                      : row.disparityIndex < 1.5
                      ? "text-patina"
                      : "text-claret"
                  )}
                >
                  {row.disparityIndex.toFixed(2)}
                </span>
              </td>
              <td className={cn("py-3.5 text-[11px] font-semibold capitalize", speakerBadge(row.speakerType))}>
                {row.speakerType}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
