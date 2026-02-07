#!/usr/bin/env python3
"""Evaluate intent model on test set; use gold text or ASR transcript (--use_whisper)."""
import argparse
import json
import os

import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


def load_config(path):
    with open(path, "r") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--use_whisper", action="store_true", help="Use transcript column instead of text")
    ap.add_argument("--noised", action="store_true", help="Use asr_*_noised.csv for transcript source")
    args = ap.parse_args()

    cfg = load_config(args.config)
    processed_dir = cfg["paths"]["processed_dir"]
    results_dir = cfg["paths"]["results_dir"]
    model_path = os.path.join(results_dir, "intent_model")
    if not os.path.exists(model_path):
        print(f"Intent model not found at {model_path}. Run train_intent_nn first.")
        return

    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    model.eval()
    text_col = "transcript" if args.use_whisper else "text"
    max_length = cfg["intent"].get("max_length", 128)
    subgroup_fields = cfg["dataset"].get("subgroup_fields") or []

    rows_overall = []
    rows_by_group = []

    suffix = "_noised" if args.noised else ""
    for split_name in [cfg["dataset"]["split_test"], cfg["dataset"]["split_valid"]]:
        if args.use_whisper:
            csv_path = os.path.join(processed_dir, f"asr_{split_name}{suffix}.csv")
        else:
            csv_path = os.path.join(processed_dir, f"intent_{split_name}.csv")
        if not os.path.exists(csv_path):
            continue
        df = pd.read_csv(csv_path)
        if text_col not in df.columns:
            print(f"Skip {split_name}: no {text_col}")
            continue
        df = df[df["intent"].notna() & (df["intent"] != "")]
        if df.empty:
            continue

        enc = tokenizer(
            df[text_col].fillna("").astype(str).tolist(),
            truncation=True,
            max_length=max_length,
            padding="max_length",
            return_tensors="pt",
        )
        with torch.no_grad():
            logits = model(**enc).logits
        preds = logits.argmax(dim=1).numpy()
        id2label = model.config.id2label
        pred_labels = [id2label.get(int(p), "unknown") for p in preds]
        gold = df["intent"].astype(str).tolist()
        acc = sum(p == g for p, g in zip(pred_labels, gold)) / len(gold) if gold else 0
        rows_overall.append({"split": split_name, "text_source": text_col, "accuracy": acc, "n": len(df)})

        for g in subgroup_fields:
            if g not in df.columns:
                continue
            for name, grp in df.groupby(g):
                g_df = grp.reset_index(drop=True)
                enc_g = tokenizer(
                    g_df[text_col].fillna("").astype(str).tolist(),
                    truncation=True,
                    max_length=max_length,
                    padding="max_length",
                    return_tensors="pt",
                )
                with torch.no_grad():
                    logits_g = model(**enc_g).logits
                preds_g = logits_g.argmax(dim=1).numpy()
                pred_labels_g = [id2label.get(int(p), "unknown") for p in preds_g]
                gold_g = g_df["intent"].astype(str).tolist()
                acc_g = sum(p == h for p, h in zip(pred_labels_g, gold_g)) / len(gold_g) if gold_g else 0
                rows_by_group.append({
                    "split": split_name,
                    "text_source": text_col,
                    "group_field": g,
                    "group_value": name,
                    "accuracy": acc_g,
                    "n": len(grp),
                })

    out_path = os.path.join(results_dir, "intent_scores.csv")
    pd.DataFrame(rows_overall).to_csv(out_path, index=False)
    if rows_by_group:
        pd.DataFrame(rows_by_group).to_csv(os.path.join(results_dir, "intent_scores_by_group.csv"), index=False)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
