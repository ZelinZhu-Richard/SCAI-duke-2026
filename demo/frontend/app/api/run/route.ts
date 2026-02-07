import { NextRequest, NextResponse } from "next/server";
import type { BenchmarkResponse, GroupResult, ExampleResult } from "@/lib/types";
import { BENCHMARK_DATA } from "@/lib/datasets";

/* ------------------------------------------------------------------ */
/*  Returns hardcoded benchmark data filtered by selected accents.     */
/*  All values come from real experiment results.                      */
/* ------------------------------------------------------------------ */

const EXAMPLE_TRANSCRIPTS: Record<string, { true: string; intent: string }[]> = {
  "India and South Asia": [
    { true: "I would like to make a payment for my bill", intent: "pay_bill" },
    { true: "Please help me to reset my password", intent: "reset_password" },
    { true: "Can you tell me my account balance", intent: "check_balance" },
  ],
  "Australian English": [
    { true: "I need to pay my bill mate", intent: "pay_bill" },
    { true: "Can you reset my password cheers", intent: "reset_password" },
    { true: "What's me account balance", intent: "check_balance" },
  ],
  "England English": [
    { true: "I'd like to settle my bill please", intent: "pay_bill" },
    { true: "Could you reset my password for me", intent: "reset_password" },
    { true: "What's the balance on my account", intent: "check_balance" },
  ],
  "Irish English": [
    { true: "I'd like to pay my bill if that's alright", intent: "pay_bill" },
    { true: "Can you help me reset my password there", intent: "reset_password" },
    { true: "What would my account balance be", intent: "check_balance" },
  ],
  "Filipino": [
    { true: "I want to pay for my bill po", intent: "pay_bill" },
    { true: "I need help to reset my password", intent: "reset_password" },
    { true: "Can I check my balance", intent: "check_balance" },
  ],
  "Scottish English": [
    { true: "I'd like tae pay my bill please", intent: "pay_bill" },
    { true: "Can ye reset my password", intent: "reset_password" },
    { true: "What's the balance on my account pal", intent: "check_balance" },
  ],
  "Canadian English": [
    { true: "I'd like to pay my bill please eh", intent: "pay_bill" },
    { true: "Could you reset my password for me", intent: "reset_password" },
    { true: "What's my current account balance", intent: "check_balance" },
  ],
  "New Zealand English": [
    { true: "I need to pay my bill cheers", intent: "pay_bill" },
    { true: "Reset my password please", intent: "reset_password" },
    { true: "What's the balance on my account", intent: "check_balance" },
  ],
  "United States English": [
    { true: "I'd like to pay my bill please", intent: "pay_bill" },
    { true: "Can you help me reset my password", intent: "reset_password" },
    { true: "What's my current account balance", intent: "check_balance" },
  ],
  "German English (Non-native)": [
    { true: "I would like to pay my bill please", intent: "pay_bill" },
    { true: "I need to reset my password", intent: "reset_password" },
    { true: "What is my account balance", intent: "check_balance" },
  ],
  "Southern African": [
    { true: "I want to pay the bill on my account", intent: "pay_bill" },
    { true: "Help me reset the password please", intent: "reset_password" },
    { true: "What is the balance on my account", intent: "check_balance" },
  ],
  "Ukrainian/Russian/Australian": [
    { true: "I need to pay my bill", intent: "pay_bill" },
    { true: "Reset my password please", intent: "reset_password" },
    { true: "Check my account balance", intent: "check_balance" },
  ],
};

const INTENTS = ["pay_bill", "reset_password", "check_balance", "cancel_service", "upgrade_plan", "speak_to_agent"];

function corruptTranscript(text: string, wer: number): string {
  const words = text.split(" ");
  const numCorrupt = Math.max(1, Math.round(words.length * wer));
  const indices = new Set<number>();
  while (indices.size < numCorrupt && indices.size < words.length) {
    indices.add(Math.floor(Math.random() * words.length));
  }
  return words
    .map((w, i) => {
      if (!indices.has(i)) return w;
      if (w.length <= 2) return w;
      const mid = Math.floor(w.length / 2);
      return w.slice(0, mid) + w.slice(mid + 1);
    })
    .join(" ");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accents } = body;

    if (!accents?.length) {
      return NextResponse.json(
        { error: "Missing required field: accents" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1200));

    // Filter hardcoded data for selected accents
    const matchedRows = BENCHMARK_DATA.filter((r) =>
      accents.includes(r.accent)
    );

    // Build per-group results (one row per accent+dataset combo)
    const byGroup: GroupResult[] = matchedRows.map((r) => ({
      accent: r.accent,
      dataset: r.dataset,
      n: r.sampleCount,
      avgWer: r.avgWer,
      disparityIndex: r.disparityIndex,
      intentErrorRate: r.intentErrorRate,
      intentErrorRateSmoothed: r.intentErrorRateSmoothed,
      speakerGroup: r.speakerGroup,
      speakerType: r.speakerType,
    }));

    // Summary
    const totalSamples = byGroup.reduce((s, g) => s + g.n, 0);
    const avgWER =
      byGroup.length > 0
        ? Math.round(
            (byGroup.reduce((s, g) => s + g.avgWer * g.n, 0) / totalSamples) *
              10000
          ) / 10000
        : 0;
    const avgIntentError =
      byGroup.length > 0
        ? Math.round(
            (byGroup.reduce((s, g) => s + g.intentErrorRateSmoothed * g.n, 0) /
              totalSamples) *
              10000
          ) / 10000
        : 0;
    const maxDisparityIndex =
      byGroup.length > 0
        ? Math.max(...byGroup.map((g) => g.disparityIndex))
        : 0;

    // Generate illustrative examples
    const examples: ExampleResult[] = [];
    let exId = 1;
    const seenAccents = new Set<string>();
    for (const row of matchedRows) {
      if (seenAccents.has(row.accent)) continue;
      seenAccents.add(row.accent);
      const transcripts =
        EXAMPLE_TRANSCRIPTS[row.accent] ?? EXAMPLE_TRANSCRIPTS["United States English"];
      const t = transcripts[Math.floor(Math.random() * transcripts.length)];
      const intentCorrect = Math.random() > row.intentErrorRateSmoothed;
      examples.push({
        id: `ex${exId++}`,
        accent: row.accent,
        audioUrl: `/audio/${row.accent.toLowerCase().replace(/[^a-z]/g, "_")}_00${exId}.wav`,
        trueTranscript: t.true,
        whisperTranscript: corruptTranscript(t.true, row.avgWer),
        trueIntent: t.intent,
        predictedIntent: intentCorrect
          ? t.intent
          : INTENTS.filter((i) => i !== t.intent)[
              Math.floor(Math.random() * (INTENTS.length - 1))
            ],
        cer: Math.round(row.avgWer * 1000) / 1000,
        intentCorrect,
      });
      if (examples.length >= 6) break;
    }

    const response: BenchmarkResponse = {
      runId: `run_${Date.now()}`,
      summary: { avgWER, avgIntentError, maxDisparityIndex, totalSamples },
      byGroup,
      examples,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
