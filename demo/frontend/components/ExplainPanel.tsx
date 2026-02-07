"use client";

import { useState } from "react";

interface Section {
  title: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    title: "Character Error Rate",
    content:
      "The fraction of characters the ASR system gets wrong\u2014insertions, deletions, and substitutions. A CER of 10% means roughly 1 in 10 characters is incorrect. In support calls, even small errors change meaning: \u201cpay\u201d misheard as \u201cbay\u201d can route a call to the wrong department.",
  },
  {
    title: "Misrouting Rate",
    content:
      "How often a caller would be sent to the wrong department because the system misrecognized their intent. \u201cCancel my service\u201d heard as \u201chandle my service\u201d routes to general support instead of cancellations.",
  },
  {
    title: "Disparity Index",
    content:
      "The ratio of one accent group\u2019s error rate to the best-performing group\u2019s. 1.0 means equal performance; 2.0 means twice the errors. Above 1.5 indicates systematic bias against that accent.",
  },
  {
    title: "Why this matters",
    content:
      "Customer support is access to services. When ASR works poorly for certain accents, those callers wait longer, repeat themselves, and get misrouted. This disproportionately affects non-native speakers and people from underrepresented regions.",
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
