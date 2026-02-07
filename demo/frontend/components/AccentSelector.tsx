"use client";

import { cn } from "@/lib/utils";

interface Props {
  available: string[];
  selected: string[];
  onChange: (accents: string[]) => void;
}

export default function AccentSelector({ available, selected, onChange }: Props) {
  const toggle = (accent: string) => {
    if (selected.includes(accent)) {
      if (selected.length > 1) {
        onChange(selected.filter((a) => a !== accent));
      }
    } else {
      onChange([...selected, accent]);
    }
  };

  return (
    <div>
      <p className="text-[15px] font-semibold text-tobacco mb-3">Accent groups</p>
      <div className="flex flex-wrap gap-2">
        {available.map((accent) => {
          const isSelected = selected.includes(accent);
          return (
            <button
              key={accent}
              type="button"
              onClick={() => toggle(accent)}
              className={cn(
                "border px-4 py-2 text-[13px] font-semibold transition-all capitalize tracking-wide",
                isSelected
                  ? "border-camel bg-cream text-chocolate"
                  : "border-border text-dune hover:border-edge hover:text-cognac"
              )}
            >
              {accent}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-flax">
        At least one required. Click to toggle.
      </p>
    </div>
  );
}
