"use client";

import { useState } from "react";
import type { DatasetConfig } from "@/lib/datasets";

interface Props {
  dataset: DatasetConfig;
}

export default function DatasetDetailsDropdown({ dataset }: Props) {
  const [open, setOpen] = useState(false);

  const rows: { label: string; value: string }[] = [
    { label: "Description", value: dataset.description },
    { label: "Social relevance", value: dataset.socialImpact },
    { label: "Source", value: dataset.source },
    { label: "Clips", value: String(dataset.approxClips) },
    { label: "Accent groups", value: dataset.accentGroups.join(", ") },
    { label: "Channel", value: dataset.channel },
    { label: "Noise level", value: dataset.noiseLevel },
    { label: "Expected failures", value: dataset.expectedFailureModes.join("; ") },
    { label: "Limitations", value: dataset.limitations.join(". ") },
  ];

  return (
    <div className="mt-3">
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            setOpen(!open);
          }
        }}
        className="text-[12px] font-semibold text-dune underline underline-offset-2 decoration-bisque hover:text-tobacco cursor-pointer transition-colors"
      >
        {open ? "Hide details" : "Details"}
      </span>

      {open && (
        <div
          className="mt-4 pt-4 border-t border-rule text-[12px]"
          onClick={(e) => e.stopPropagation()}
        >
          <table className="w-full">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="align-top">
                  <td className="py-1.5 pr-6 font-bold text-dune whitespace-nowrap w-[130px]">
                    {row.label}
                  </td>
                  <td className="py-1.5 text-tobacco leading-relaxed">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
