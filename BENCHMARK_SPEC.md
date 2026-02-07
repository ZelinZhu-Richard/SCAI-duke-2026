# ASR-EAS Benchmark Specification

## Goal
Measure how ASR errors in customer-support-style speech affect **access to services** via intent routing. Report WER/CER, intent accuracy, and subgroup disparities.

## Metrics
- **WER / CER**: Word and character error rates (overall and by subgroup).
- **Intent accuracy**: % of utterances routed to correct intent (weak labels).
- **Disparity**: ΔWER and disparity index across subgroups (e.g. accent, gender, age).
- **Robustness**: WER/Intent under noise and codec degradation.

## Pipeline
1. **Data**: Load speech dataset (LibriSpeech / GLOBE); optional max_train/max_val/max_test.
2. **Prep**: Export CSV with id, text, audio_path, intent (weak), subgroup fields.
3. **ASR**: faster-whisper → transcript per utterance.
4. **Score ASR**: jiwer WER/CER; by-group breakdown.
5. **Intent**: Train small NN on text → intent; evaluate on gold text vs ASR text (with/without Whisper).
6. **Robustness**: add_noise → run ASR/score again.

## Subgroups
- From dataset when available: accent, gender, age.
- Otherwise: "unknown" (aggregate only).

## Outputs
- `results/asr_scores.csv`, `results/asr_scores_by_group.csv`
- `results/intent_scores.csv`, `results/intent_scores_by_group.csv`
- Optional: `results/scorecard.md` summary.
