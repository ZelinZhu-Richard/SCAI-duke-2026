"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ALL_ACCENTS } from "@/lib/datasets";
import type { BenchmarkResponse, RunPhase } from "@/lib/types";
import AccentSelector from "@/components/AccentSelector";
import MetricCards from "@/components/MetricCards";
import GroupTable from "@/components/GroupTable";
import Charts from "@/components/Charts";
import ExplainPanel from "@/components/ExplainPanel";
import ProgressUI from "@/components/ProgressUI";
import AnalysisCharts from "@/components/AnalysisCharts";
import { cn } from "@/lib/utils";

export default function BenchmarkPage() {
  const [selectedAccents, setSelectedAccents] = useState<string[]>([
    "United States English",
    "India and South Asia",
    "England English",
  ]);
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [results, setResults] = useState<BenchmarkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBenchmark = useCallback(async () => {
    setError(null);
    setResults(null);
    const phases: RunPhase[] = ["loading", "transcribing", "scoring", "aggregating"];
    for (const p of phases) {
      setPhase(p);
      await new Promise((r) => setTimeout(r, 600));
    }
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accents: selectedAccents }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: BenchmarkResponse = await res.json();
      setResults(data);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
    }
  }, [selectedAccents]);

  const isRunning = phase !== "idle" && phase !== "done" && phase !== "error";

  return (
    <div className="min-h-screen bg-page">
      {/* Control bar */}
      <nav className="bg-cream border-b border-edge sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex items-center justify-center h-8 w-8 border border-teak text-[14px] font-bold italic text-teak group-hover:text-espresso transition-colors select-none">
              Eq
            </span>
            <span className="italic text-[15px] text-tobacco group-hover:text-espresso transition-colors">
              ASR Equity Bench
            </span>
          </Link>
          <p className="hidden sm:block text-[13px] font-bold italic text-tobacco">
            Your accent should not determine the quality of service you receive
          </p>
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-cognac">
            Benchmark
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-8 py-12">
        {/* Explain */}
        <ExplainPanel />

        {/* Accent selection — the primary step */}
        <section className="mt-14">
          <div className="mb-8">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-camel mb-2">
              Select Accents
            </p>
            <h2 className="text-[26px] font-bold text-espresso leading-snug">
              Select accents to see benchmarks
            </h2>
            <p className="text-[15px] text-cognac mt-2 max-w-xl">
              Select which accents you want to benchmark against each other.
              Results include real Word Error Rate (WER), intent misclassification,
              and disparity index across multiple datasets.
            </p>
          </div>

          <AccentSelector
            available={ALL_ACCENTS}
            selected={selectedAccents}
            onChange={setSelectedAccents}
          />
        </section>

        {/* Run */}
        <section className="mt-16 border-t-2 border-edge pt-10">
          <button
            type="button"
            onClick={runBenchmark}
            disabled={isRunning || selectedAccents.length === 0}
            className={cn(
              "border px-12 py-3.5 text-[14px] font-bold tracking-[0.06em] transition-all",
              isRunning || selectedAccents.length === 0
                ? "border-border text-flax cursor-not-allowed"
                : "border-umber bg-umber text-cream hover:bg-walnut"
            )}
          >
            {isRunning ? "Running\u2026" : "Run Benchmark"}
          </button>
          <p className="mt-3 text-[12px] text-flax">
            {selectedAccents.length} accent{selectedAccents.length !== 1 ? "s" : ""} selected
          </p>
        </section>

        {/* Progress */}
        {isRunning && <ProgressUI phase={phase} />}

        {/* Error */}
        {phase === "error" && error && (
          <div className="mt-8 border-l-3 border-claret pl-5 py-3">
            <p className="text-[14px] font-semibold text-claret">{error}</p>
          </div>
        )}

        {/* Results */}
        {phase === "done" && results && (
          <section className="mt-16 border-t-2 border-edge pt-14 space-y-16">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-camel mb-2">
                Results
              </p>
              <h2 className="text-[26px] font-bold text-espresso leading-snug">
                Benchmark Results
              </h2>
              <p className="text-[12px] text-dune font-mono mt-2">
                {results.runId} &middot; {results.summary.totalSamples} total samples
              </p>
            </div>

            <MetricCards summary={results.summary} />

            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-camel mb-5">
                By Accent Group &amp; Dataset
              </p>
              <GroupTable data={results.byGroup} />
            </div>

            <Charts data={results.byGroup} />

            <AnalysisCharts selectedAccents={selectedAccents} />
          </section>
        )}
      </main>

      <footer className="border-t border-rule mt-20">
        <div className="mx-auto max-w-3xl px-8 py-10 text-center text-[11px] text-flax tracking-[0.15em]">
          Customer Support ASR Equity Benchmark
        </div>
      </footer>
    </div>
  );
}
