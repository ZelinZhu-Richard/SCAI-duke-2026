"use client";

import type { GroupResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  data: GroupResult[];
}

export default function GroupTable({ data }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b-2 border-edge">
            <th className="pb-3 pr-8 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-left">
              Accent
            </th>
            <th className="pb-3 pr-8 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              n
            </th>
            <th className="pb-3 pr-8 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              CER
            </th>
            <th className="pb-3 pr-8 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              Intent Acc.
            </th>
            <th className="pb-3 pr-8 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              Misroute
            </th>
            <th className="pb-3 font-bold text-[10px] tracking-[0.2em] uppercase text-camel text-right">
              Disparity
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.accent}
              className={cn(
                "border-b border-rule",
                i % 2 === 0 ? "bg-cream" : "bg-porcelain"
              )}
            >
              <td className="py-3.5 pr-8 font-bold text-chocolate">{row.accent}</td>
              <td className="py-3.5 pr-8 text-right text-dune font-mono text-[11px]">
                {row.n}
              </td>
              <td className="py-3.5 pr-8 text-right font-mono text-[12px]">
                <span
                  className={cn(
                    "font-bold",
                    row.cerMean < 0.1
                      ? "text-moss"
                      : row.cerMean < 0.2
                      ? "text-patina"
                      : "text-claret"
                  )}
                >
                  {(row.cerMean * 100).toFixed(1)}%
                </span>
              </td>
              <td className="py-3.5 pr-8 text-right text-cognac font-mono text-[11px]">
                {(row.intentAccuracy * 100).toFixed(1)}%
              </td>
              <td className="py-3.5 pr-8 text-right text-cognac font-mono text-[11px]">
                {(row.misroutingRate * 100).toFixed(1)}%
              </td>
              <td className="py-3.5 text-right font-mono text-[12px]">
                <span
                  className={cn(
                    "font-bold",
                    row.disparityIndex <= 1.0
                      ? "text-moss"
                      : row.disparityIndex < 1.5
                      ? "text-patina"
                      : "text-claret"
                  )}
                >
                  {row.disparityIndex.toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
