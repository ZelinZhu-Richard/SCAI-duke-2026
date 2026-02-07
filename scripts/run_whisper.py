#!/usr/bin/env python3
"""Run faster-whisper on prepared ASR CSVs; write transcript column to new CSV."""
import argparse
import json
import os

import pandas as pd
from tqdm import tqdm
from faster_whisper import WhisperModel


def load_config(path):
    with open(path, "r") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--noised", action="store_true", help="Use asr_*_noised.csv (after add_noise.py)")
    args = ap.parse_args()

    cfg = load_config(args.config)
    processed_dir = cfg["paths"]["processed_dir"]
    model_size = cfg["asr"]["model_size"]
    language = cfg["asr"].get("language", "en")
    suffix = "_noised" if args.noised else ""

    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    dsc = cfg["dataset"]
    for split_name in [dsc["split_train"], dsc["split_valid"], dsc["split_test"]]:
        csv_path = os.path.join(processed_dir, f"asr_{split_name}{suffix}.csv")
        if not os.path.exists(csv_path):
            print(f"Skip {csv_path} (not found)")
            continue
        df = pd.read_csv(csv_path)
        if "transcript" in df.columns:
            print(f"Skip {split_name} (transcript already present)")
            continue
        transcripts = []
        for _, row in tqdm(df.iterrows(), total=len(df), desc=f"Whisper {split_name}"):
            audio_path = row["audio_path"]
            if not os.path.exists(audio_path):
                transcripts.append("")
                continue
            segments, _ = model.transcribe(audio_path, language=language)
            text = " ".join(s.text for s in segments).strip()
            transcripts.append(text)
        df["transcript"] = transcripts
        df.to_csv(csv_path, index=False)
        print(f"Wrote {csv_path} with transcript column")


if __name__ == "__main__":
    main()
