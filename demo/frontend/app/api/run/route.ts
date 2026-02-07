import { NextRequest, NextResponse } from "next/server";
import type { BenchmarkResponse, GroupResult, ExampleResult } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Mock data generation — Replace this handler with your real         */
/*  backend call. See "Replace mock with real backend" note below.     */
/* ------------------------------------------------------------------ */

const INTENTS = [
  "pay_bill",
  "reset_password",
  "check_balance",
  "cancel_service",
  "upgrade_plan",
  "speak_to_agent",
  "track_order",
];

const EXAMPLE_TRANSCRIPTS: Record<
  string,
  { true: string; intent: string }[]
> = {
  US: [
    { true: "I'd like to pay my bill please", intent: "pay_bill" },
    { true: "Can you help me reset my password", intent: "reset_password" },
    { true: "What's my current account balance", intent: "check_balance" },
    { true: "I need to cancel my subscription", intent: "cancel_service" },
    { true: "I want to upgrade to the premium plan", intent: "upgrade_plan" },
  ],
  Indian: [
    { true: "I would like to make a payment for my bill", intent: "pay_bill" },
    { true: "Please help me to reset my password", intent: "reset_password" },
    { true: "Can you tell me my account balance", intent: "check_balance" },
    { true: "I am wanting to cancel my service", intent: "cancel_service" },
    { true: "Please upgrade my plan to premium", intent: "upgrade_plan" },
  ],
  African: [
    { true: "I want to pay the bill on my account", intent: "pay_bill" },
    { true: "Help me reset the password please", intent: "reset_password" },
    { true: "What is the balance on my account", intent: "check_balance" },
    { true: "I need to cancel this service now", intent: "cancel_service" },
    { true: "Can I upgrade to the premium tier", intent: "upgrade_plan" },
  ],
  England: [
    { true: "I'd like to settle my bill please", intent: "pay_bill" },
    { true: "Could you reset my password for me", intent: "reset_password" },
    { true: "What's the balance on my account", intent: "check_balance" },
    { true: "I wish to cancel my subscription", intent: "cancel_service" },
    { true: "I'd like to upgrade my plan please", intent: "upgrade_plan" },
  ],
  Australian: [
    { true: "I need to pay my bill mate", intent: "pay_bill" },
    { true: "Can you reset my password cheers", intent: "reset_password" },
    { true: "What's me account balance", intent: "check_balance" },
    { true: "I want to cancel my service thanks", intent: "cancel_service" },
    { true: "Upgrade my plan to premium would ya", intent: "upgrade_plan" },
  ],
};

function randomBetween(lo: number, hi: number) {
  return lo + Math.random() * (hi - lo);
}

function corruptTranscript(
  text: string,
  cer: number,
  datasetId: string
): string {
  const words = text.split(" ");
  const numCorrupt = Math.max(1, Math.round(words.length * cer));
  const indices = new Set<number>();
  while (indices.size < numCorrupt && indices.size < words.length) {
    indices.add(Math.floor(Math.random() * words.length));
  }

  return words
    .map((w, i) => {
      if (!indices.has(i)) return w;
      // Different corruption styles per dataset
      if (datasetId === "B") {
        // Conversational: add disfluencies
        const fillers = ["um", "uh", "like", "you know"];
        return fillers[Math.floor(Math.random() * fillers.length)] + " " + w;
      }
      if (datasetId === "C") {
        // Noisy: garble words
        return w.slice(0, Math.max(1, Math.floor(w.length / 2))) + "...";
      }
      // Default: swap/drop characters
      if (w.length <= 2) return w;
      const mid = Math.floor(w.length / 2);
      return w.slice(0, mid) + w.slice(mid + 1);
    })
    .join(" ");
}

/* Dataset-specific error profiles */
interface ErrorProfile {
  cerRange: [number, number];
  intentErrorRate: number;
  accentPenalty: Record<string, number>;
}

const DATASET_PROFILES: Record<string, ErrorProfile> = {
  A: {
    cerRange: [0.04, 0.18],
    intentErrorRate: 0.12,
    accentPenalty: { US: 0, Indian: 0.06, African: 0.08, England: 0.02, Australian: 0.03 },
  },
  B: {
    cerRange: [0.08, 0.25],
    intentErrorRate: 0.18,
    accentPenalty: { US: 0, Indian: 0.08, African: 0.1, England: 0.03, Australian: 0.04 },
  },
  C: {
    cerRange: [0.12, 0.35],
    intentErrorRate: 0.25,
    accentPenalty: { US: 0.02, Indian: 0.12, African: 0.14, England: 0.05, Australian: 0.06 },
  },
  D: {
    cerRange: [0.02, 0.1],
    intentErrorRate: 0.08,
    accentPenalty: { US: 0, Indian: 0.04, African: 0.05, England: 0.01, Australian: 0.02 },
  },
};

const MODEL_MULTIPLIER: Record<string, number> = {
  tiny: 1.3,
  base: 1.0,
};

function generateGroupResult(
  accent: string,
  datasetId: string,
  modelSize: string
): GroupResult {
  const profile = DATASET_PROFILES[datasetId];
  const mult = MODEL_MULTIPLIER[modelSize] ?? 1;
  const penalty = profile.accentPenalty[accent] ?? 0.05;

  const baseCer = randomBetween(profile.cerRange[0], profile.cerRange[1]);
  const cerMean = Math.min(0.6, (baseCer + penalty) * mult);
  const intentAcc = Math.max(0.4, 1 - (profile.intentErrorRate + penalty) * mult);
  const misroute = Math.min(0.5, (profile.intentErrorRate * 0.6 + penalty * 0.5) * mult);

  const n = Math.floor(randomBetween(8, 25));

  return {
    accent,
    n,
    cerMean: Math.round(cerMean * 1000) / 1000,
    intentAccuracy: Math.round(intentAcc * 1000) / 1000,
    misroutingRate: Math.round(misroute * 1000) / 1000,
    disparityIndex: 0, // computed later
  };
}

function generateExamples(
  accents: string[],
  datasetId: string,
  modelSize: string
): ExampleResult[] {
  const profile = DATASET_PROFILES[datasetId];
  const mult = MODEL_MULTIPLIER[modelSize] ?? 1;
  const examples: ExampleResult[] = [];
  let exId = 1;

  for (const accent of accents) {
    const transcripts = EXAMPLE_TRANSCRIPTS[accent] ?? EXAMPLE_TRANSCRIPTS["US"];
    // Pick 1 example per accent (up to 5 total)
    const t = transcripts[Math.floor(Math.random() * transcripts.length)];
    const penalty = profile.accentPenalty[accent] ?? 0.05;
    const cer = Math.min(0.6, randomBetween(profile.cerRange[0], profile.cerRange[1] + penalty) * mult);
    const intentCorrect = Math.random() > (profile.intentErrorRate + penalty) * mult;

    examples.push({
      id: `ex${exId++}`,
      accent,
      audioUrl: `/audio/${accent.toLowerCase()}_00${exId}.wav`,
      trueTranscript: t.true,
      whisperTranscript: corruptTranscript(t.true, cer, datasetId),
      trueIntent: t.intent,
      predictedIntent: intentCorrect
        ? t.intent
        : INTENTS.filter((i) => i !== t.intent)[
            Math.floor(Math.random() * (INTENTS.length - 1))
          ],
      cer: Math.round(cer * 1000) / 1000,
      intentCorrect,
    });

    if (examples.length >= 5) break;
  }
  return examples;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { datasetId, accents, modelSize } = body;

    if (!datasetId || !accents?.length || !modelSize) {
      return NextResponse.json(
        { error: "Missing required fields: datasetId, accents, modelSize" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1500));

    // Generate per-group results
    const byGroup: GroupResult[] = accents.map((a: string) =>
      generateGroupResult(a, datasetId, modelSize)
    );

    // Compute disparity index relative to best-performing group
    const minCer = Math.min(...byGroup.map((g) => g.cerMean));
    for (const g of byGroup) {
      g.disparityIndex =
        minCer > 0
          ? Math.round((g.cerMean / minCer) * 100) / 100
          : 1.0;
    }

    // Summary metrics
    const avgCER =
      Math.round(
        (byGroup.reduce((s, g) => s + g.cerMean, 0) / byGroup.length) * 1000
      ) / 1000;
    const intentAccuracy =
      Math.round(
        (byGroup.reduce((s, g) => s + g.intentAccuracy, 0) / byGroup.length) *
          1000
      ) / 1000;
    const misroutingRate =
      Math.round(
        (byGroup.reduce((s, g) => s + g.misroutingRate, 0) / byGroup.length) *
          1000
      ) / 1000;
    const maxDisparityIndex = Math.max(...byGroup.map((g) => g.disparityIndex));

    const examples = generateExamples(accents, datasetId, modelSize);

    const response: BenchmarkResponse = {
      runId: `run_${Date.now()}`,
      summary: { avgCER, intentAccuracy, misroutingRate, maxDisparityIndex },
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

/* ------------------------------------------------------------------ */
/*  🔄 REPLACE MOCK WITH REAL BACKEND                                  */
/*                                                                      */
/*  To connect a real ASR pipeline:                                     */
/*  1. Replace the POST handler above with a fetch/proxy to your       */
/*     Python backend (e.g., FastAPI running the Whisper pipeline).     */
/*  2. Keep the same request/response contract defined in lib/types.ts */
/*  3. Example:                                                         */
/*     const res = await fetch("http://your-backend:8000/api/run", {   */
/*       method: "POST",                                                */
/*       headers: { "Content-Type": "application/json" },              */
/*       body: JSON.stringify({ datasetId, accents, modelSize }),       */
/*     });                                                              */
/*     const data = await res.json();                                   */
/*     return NextResponse.json(data);                                  */
/* ------------------------------------------------------------------ */
