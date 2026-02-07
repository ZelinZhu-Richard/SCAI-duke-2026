#!/usr/bin/env python3
"""Compute WER/CER from ASR CSVs (reference=text, hypothesis=transcript); write overall and by-group."""
import argparse
import json
import os

import pandas as pd
import jiwer


def load_config(path):
    with open(path, "r") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--noised", action="store_true", help="Use asr_*_noised.csv")
    args = ap.parse_args()

    cfg = load_config(args.config)
    suffix = "_noised" if args.noised else ""
    processed_dir = cfg["paths"]["processed_dir"]
    results_dir = cfg["paths"]["results_dir"]
    os.makedirs(results_dir, exist_ok=True)
    subgroup_fields = cfg["dataset"].get("subgroup_fields") or []

    rows_overall = []
    rows_by_group = []

    for split_name in [cfg["dataset"]["split_test"], cfg["dataset"]["split_valid"]]:
        csv_path = os.path.join(processed_dir, f"asr_{split_name}{suffix}.csv")
        if not os.path.exists(csv_path):
            continue
        df = pd.read_csv(csv_path)
        if "transcript" not in df.columns:
            print(f"Skip {split_name}: no transcript column")
            continue
        ref = df["text"].fillna("").astype(str).tolist()
        hyp = df["transcript"].fillna("").astype(str).tolist()
        wer = jiwer.wer(ref, hyp)
        cer = jiwer.cer(ref, hyp)
        rows_overall.append({"split": split_name, "wer": wer, "cer": cer})

        for g in subgroup_fields:
            if g not in df.columns:
                continue
            for name, grp in df.groupby(g):
                r = grp["text"].fillna("").astype(str).tolist()
                h = grp["transcript"].fillna("").astype(str).tolist()
                if not r:
                    continue
                rows_by_group.append({
                    "split": split_name,
                    "group_field": g,
                    "group_value": name,
                    "wer": jiwer.wer(r, h),
                    "cer": jiwer.cer(r, h),
                    "n": len(grp),
                })

    pd.DataFrame(rows_overall).to_csv(os.path.join(results_dir, "asr_scores.csv"), index=False)
    if rows_by_group:
        pd.DataFrame(rows_by_group).to_csv(os.path.join(results_dir, "asr_scores_by_group.csv"), index=False)
    print(f"Wrote {results_dir}/asr_scores.csv (and by_group if subgroups present)")


if __name__ == "__main__":
    main()
