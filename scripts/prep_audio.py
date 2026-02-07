#!/usr/bin/env python3
"""Prepare audio CSVs from HF dataset (id, text, audio_path, intent, subgroup fields)."""
import argparse
import json
import os
import random

import pandas as pd
from datasets import load_dataset


KEYWORD_MAP = {
    "billing": ["bill", "billing", "charge", "payment", "refund"],
    "outage": ["outage", "down", "no service", "internet", "power"],
    "fraud": ["fraud", "scam", "suspicious", "unauthorized"],
    "password_reset": ["password", "reset", "login", "account locked"],
    "cancel_service": ["cancel", "close account", "terminate", "end service"],
    "speak_to_agent": ["agent", "representative", "human", "operator"],
}


def load_config(path):
    with open(path, "r") as f:
        return json.load(f)


def weak_label(text):
    text_l = (text or "").lower()
    for intent, kws in KEYWORD_MAP.items():
        for kw in kws:
            if kw in text_l:
                return intent
    return None


def get_audio_path(ex, audio_field):
    """Get filesystem path from dataset audio column (dict with 'path' or raw path)."""
    val = ex.get(audio_field)
    if val is None:
        return None
    if isinstance(val, dict) and "path" in val and val["path"]:
        return val["path"]
    if isinstance(val, str):
        return val
    return None


def prep_split(ds, split_name, cfg):
    rows = []
    text_field = cfg["dataset"]["text_field"]
    audio_field = cfg["dataset"]["audio_field"]
    subgroup_fields = cfg["dataset"].get("subgroup_fields") or []

    for idx, ex in enumerate(ds[split_name]):
        text = ex.get(text_field, "")
        audio_path = get_audio_path(ex, audio_field)
        if not text or not audio_path:
            continue
        intent = weak_label(text)
        row = {
            "id": ex.get("id", f"{split_name}_{idx}"),
            "text": text,
            "audio_path": audio_path,
            "intent": intent,
        }
        for f in subgroup_fields:
            row[f] = ex.get(f, "unknown")
        rows.append(row)
    return pd.DataFrame(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True, help="Path to config JSON")
    args = ap.parse_args()

    cfg = load_config(args.config)
    random.seed(cfg.get("seed", 13))

    dsc = cfg["dataset"]
    max_train = dsc.get("max_train")
    max_val = dsc.get("max_val")
    max_test = dsc.get("max_test")
    load_split = dsc.get("split")

    if load_split is not None:
        ds = load_dataset(dsc["name"], split=load_split)
    elif max_train is not None or max_val is not None or max_test is not None:
        split = {}
        st, sv, stest = dsc["split_train"], dsc["split_valid"], dsc["split_test"]
        if max_train is not None:
            split[st] = f"{st}[:{max_train}]"
        if max_val is not None:
            split[sv] = f"{sv}[:{max_val}]"
        if max_test is not None:
            split[stest] = f"{stest}[:{max_test}]"
        ds = load_dataset(dsc["name"], split=split)
    elif dsc.get("lang"):
        ds = load_dataset(dsc["name"], dsc["lang"])
    else:
        ds = load_dataset(dsc["name"])

    out_dir = cfg["paths"]["processed_dir"]
    os.makedirs(out_dir, exist_ok=True)

    for split_name in [dsc["split_train"], dsc["split_valid"], dsc["split_test"]]:
        df = prep_split(ds, split_name, cfg)
        df.to_csv(os.path.join(out_dir, f"intent_{split_name}.csv"), index=False)
        df.to_csv(os.path.join(out_dir, f"asr_{split_name}.csv"), index=False)

    print(f"Wrote CSVs to {out_dir}")


if __name__ == "__main__":
    main()
