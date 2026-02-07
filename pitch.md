# Customer Support ASR Equity Benchmark Pitch

## What This Project Is

This project is a benchmark that measures whether speech AI systems (Whisper ASR + intent routing logic) perform fairly across accent groups in customer-support-like scenarios.

Goal:
- quantify who gets mis-transcribed,
- quantify who gets misrouted,
- convert that into a disparity metric that is easy to explain to non-technical audiences.

## Why It Matters

When a support call is transcribed incorrectly, the user may be sent to the wrong queue or fail self-service entirely.  
That creates unequal access to service, especially for non-dominant accents and ESL speakers.

This benchmark gives teams a way to measure that harm instead of guessing.

## End-to-End Process

1. Collect balanced audio across accent groups.
2. Build a ground-truth CSV with:
   - `true_transcript`
   - `true_intent`
   - `accent_group`
   - `speaker_type`
3. Run Whisper transcription (`scripts/run_whisper.py`).
4. Classify intent from transcribed text (`scripts/classify_intent.py`).
5. Compare predicted vs true labels and compute:
   - CER (character error rate)
   - intent accuracy/error rate
   - disparity index vs baseline accent
6. Generate charts (`scripts/visualize.py`) for reporting/demo.

## What Each Graph Shows

## 1) `cer_by_accent.png`
- Measures transcription quality by accent.
- Lower bar = fewer character-level errors.
- Good for showing raw ASR speech-to-text quality differences.

## 2) `intent_errors.png`
- Measures downstream customer-impact risk.
- Shows misrouting rate by accent group.
- Higher bar = more calls sent to wrong intent/queue.

## 3) `disparity_heatmap.png`
- Shows relative unfairness compared to baseline (default `US`).
- `1.0` means equal to baseline.
- `>1.0` means worse than baseline.
- Fastest visual for judges/executives to understand inequity.

## 4) `summary_dashboard.png`
- Combines core views in one figure:
  - CER by accent
  - intent accuracy by accent
  - sample distribution
  - CER vs intent-correctness scatter
- Good for one-slide “state of system” view.

## Interpreting Current Demo Carefully

Current run works technically and demonstrates the full pipeline.  
However, many rows still use `true_intent=unknown`, so fairness claims about intent routing are currently directional, not final.

Use the benchmark as:
- a strong proof of workflow,
- a strong proof of measurement framework,
- a preliminary signal of disparity,
not a final causal claim yet.

## Social Impact

Positive impact if adopted:
- Better accountability for voice AI deployments.
- Easier compliance with fairness/audit expectations.
- Better service access for underrepresented speakers.
- Better trust in automated systems.

Risks if ignored:
- Hidden discrimination in support routing.
- Longer wait times and repeated calls for affected users.
- Loss of trust in AI-enabled customer systems.

## Pros and Cons

## Pros
- Simple, transparent pipeline.
- Reproducible outputs (CSV + charts).
- Low-cost to run on CPU with Whisper tiny.
- Easy to explain to technical and non-technical audiences.

## Cons
- Keyword intent model is intentionally simple, not SOTA NLU.
- Results depend heavily on label quality.
- Small sample sizes can destabilize fairness metrics.
- Domain mismatch (general speech vs support domain) can dilute conclusions.

## What Makes This Benchmark Valuable

Most teams track overall ASR accuracy.  
This project tracks **equity of failure**, which is what matters for societal impact.

Core message for demo:
- “It’s not only how often the system fails. It’s **who** it fails for, and by how much.”

## Next Evolution

1. Complete intent labeling for all rows.
2. Add domain-specific customer-support audio.
3. Replace keyword intent with stronger classifier and calibration.
4. Add confidence-based fallback policy simulation (human handoff).
5. Compare multiple ASR models side-by-side.
