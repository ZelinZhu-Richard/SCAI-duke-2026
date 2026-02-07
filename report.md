# ASR Equity Benchmark Audit Report

**Date:** 2026-02-07  
**Repo:** `SCAI-Duke-2026`  
**Audited by:** Codex

## Scope

Reviewed all tracked project files:
- `README.md`
- `QUICKSTART.md`
- `PLAN.md`
- `ADJUSTMENT.md`
- `BUGS.md`
- `requirements.txt`
- `demo/demo_notebook_template.py`
- `scripts/_python_version_check.py`
- `scripts/organize_mozilla_cv.py`
- `scripts/prepare_data.py`
- `scripts/run_whisper.py`
- `scripts/classify_intent.py`
- `scripts/calculate_metrics.py`
- `scripts/visualize.py`
- `data/ground_truth.csv`
- `results/transcripts.csv`
- `results/intents.csv`
- `results/metrics.json`

Validation executed:
- `python -m py_compile` over all scripts + demo template.
- Full pipeline replay:
  - `scripts/classify_intent.py`
  - `scripts/calculate_metrics.py`
  - `scripts/visualize.py`
- Secret/unsafe pattern scan with `rg`.

## Executive Summary

- No critical security vulnerability found.
- Main risk is **result reliability**, not code execution safety.
- The current 100-sample run is **not statistically reliable for intent fairness** because only 6/100 rows have known intent labels.
- Core chart/runtime failures were addressed; visualization now runs end-to-end reliably.

## Findings

## 1) High: Intent fairness metrics are weak due to label quality
- Evidence:
  - `data/ground_truth.csv` has `94/100` rows with `true_intent=unknown`.
  - Known-intent subset size is `6/100`.
  - Duration is `0` for all 100 rows.
- Impact:
  - Overall intent accuracy (`98%`) is inflated by `unknown -> unknown` matches.
  - Disparity conclusions for intent routing are fragile and sample-size limited.
- Status:
  - **Partially mitigated** in code by adding explicit warnings and known-intent-only metrics.
  - Still requires data relabeling.

## 2) Medium: Disparity math inconsistency between metrics and heatmap
- Evidence:
  - Metrics script used smoothing, heatmap previously used raw error with zero-baseline fallback.
  - Could produce unstable/extreme disparity values.
- Impact:
  - Misleading “bias magnitude” in visuals.
- Status:
  - **Fixed** in `scripts/visualize.py` by using smoothed disparity computation aligned with `scripts/calculate_metrics.py`.

## 3) Medium: Metadata path trust in local dataset organizer
- Evidence:
  - Metadata filename/path values could reference absolute/parent paths.
- Impact:
  - Potential unintended file copying if metadata is untrusted.
- Status:
  - **Fixed** in `scripts/organize_mozilla_cv.py`:
    - Blocks absolute/parent-traversal metadata paths.
    - Restricts copied files to known audio extensions.

## 4) Medium: Reproducibility/version drift risk
- Evidence:
  - `requirements.txt` uses broad lower bounds (`>=`) without pinning/hashes.
- Impact:
  - Different machines/dates can produce different behavior/results.
- Status:
  - **Open** (recommended lockfile + pinned versions for demos/submission).

## 5) Low: Deprecated HF auth arg in data prep
- Evidence:
  - Older `use_auth_token` usage.
- Impact:
  - Warnings and possible future breakage.
- Status:
  - **Fixed** in `scripts/prepare_data.py` using `token=...`.

## Security Review

What was checked:
- Secret leakage patterns (`API_KEY`, `SECRET`, token-like strings).
- Dangerous runtime patterns (`eval`, `exec`, shell calls).
- Untrusted path handling in file operations.

Result:
- No hardcoded secrets found.
- No direct shell-execution from user input in project scripts.
- Path handling in metadata import was hardened in this audit.

## Reliability/Scientific Validity Review

Current state:
- ASR/CER benchmarking works technically and produces consistent outputs.
- Intent-bias conclusions are currently weak because:
  - intent labels are mostly `unknown`,
  - dataset sentences are not primarily customer-support utterances,
  - “after benchmark” improvement is normalization-based, not model retraining.

Interpretation guidance:
- Treat current outputs as a **pipeline demo**, not a publishable fairness claim.
- Use known-intent subset metrics as a diagnostic only until labels are completed.

## Changes Applied During Audit

- `scripts/visualize.py`
  - Headless-safe Matplotlib backend/cache behavior.
  - Better boolean parsing and input validation.
  - Robust zero-error handling in plots.
  - Baseline handling for CER line.
  - Known-intent subset support for intent/disparity plots.
  - Disparity heatmap now uses smoothed math consistent with metrics.

- `scripts/classify_intent.py`
  - Added `known_intent` flag.
  - Added unknown-label share warning.
  - Added known-intent accuracy reporting.

- `scripts/calculate_metrics.py`
  - Smoothed disparity calculation.
  - Known-intent-only metrics and JSON outputs.

- `scripts/organize_mozilla_cv.py`
  - Hardened metadata path handling.
  - Allowed-extension guard for copied files.

- `scripts/prepare_data.py`
  - Switched to `token` argument for Hugging Face auth.

## What Works Now

- End-to-end run succeeds:
  - `results/intents.csv` generated.
  - `results/metrics.json` generated.
  - All visualizations generated:
    - `visualizations/cer_by_accent.png`
    - `visualizations/intent_errors.png`
    - `visualizations/disparity_heatmap.png`
    - `visualizations/summary_dashboard.png`

## Recommended Next Steps (Priority Order)

1. Replace `unknown` intents with real labels for the full 100 rows.
2. Add real duration values (from metadata/audio probing).
3. Keep a customer-support intent set only (or curate domain-specific audio).
4. Pin dependencies for reproducibility (`requirements-lock.txt` or `pip-tools` output).
5. Add a minimal smoke-test script for CI (`run_whisper` output schema, intent merge, chart generation).

## Conclusion

Codebase is in usable demo shape and materially more robust than before this audit.  
Primary remaining issue is data quality/label completeness, which currently limits fairness claim reliability.
