"use client";

import { useState } from "react";

interface Section {
  title: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    title: "Word Error Rate (WER)",
    content:
      "The fraction of words the ASR system gets wrong\u2014insertions, deletions, and substitutions. A WER of 26% means roughly 1 in 4 words is incorrect. In support calls, even small errors change meaning: \u201cpay\u201d misheard as \u201cbay\u201d can route a call to the wrong department.",
  },
  {
    title: "Intent Error Rate",
    content:
      "How often the system misclassifies what the caller wants. \u201cCancel my service\u201d heard as \u201chandle my service\u201d routes to general support instead of cancellations. The smoothed rate accounts for small sample sizes to give a more reliable estimate.",
  },
  {
    title: "Disparity Index",
    content:
      "A comparison metric across accent groups. It measures how much worse one accent performs relative to others. The higher the value, the worse the disparity. A value above 1.5 signals that speakers of that accent experience significantly more errors than other groups, indicating systemic bias.",
  },
  {
    title: "Why this matters",
    content:
      "Customer support is access to services. When ASR works poorly for certain accents or speech styles, those callers wait longer, repeat themselves, and get misrouted. This disproportionately affects non-native speakers, ESL communities, and people from underrepresented regions\u2014effectively denying them equitable service.",
  },
];

export default function ExplainPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-edge">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-baseline justify-between py-4 text-left group"
      >
        <span className="text-[15px] font-semibold text-tobacco group-hover:text-chocolate transition-colors">
          What this benchmark measures
        </span>
        <span className="text-[14px] font-bold text-camel ml-4 select-none">
          {open ? "\u2013" : "+"}
        </span>
      </button>

      {open && (
        <div className="pb-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <p className="text-[15px] font-bold text-chocolate mb-1.5">{sec.title}</p>
              <p className="text-[13px] text-cognac leading-[1.85]">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
