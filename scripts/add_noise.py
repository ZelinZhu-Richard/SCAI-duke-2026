#!/usr/bin/env python3
"""Add noise to audio from ASR CSV; write new audio paths to a noised CSV for robustness eval."""
import argparse
import json
import os

import numpy as np
import pandas as pd
import soundfile as sf
from tqdm import tqdm


def load_config(path):
    with open(path, "r") as f:
        return json.load(f)


def add_white_noise(signal, sr, snr_db):
    """Add white noise to achieve target SNR in dB."""
    signal = np.asarray(signal, dtype=np.float64)
    power_s = np.mean(signal ** 2)
    if power_s <= 0:
        return signal
    target_noise_power = power_s / (10 ** (snr_db / 10))
    noise = np.random.randn(len(signal)) * np.sqrt(target_noise_power)
    return (signal + noise).astype(np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    args = ap.parse_args()

    cfg = load_config(args.config)
    processed_dir = cfg["paths"]["processed_dir"]
    noised_dir = cfg["paths"].get("noised_dir", "data/noised")
    snr_db = cfg["robustness"].get("snr_db", 10)
    seed = cfg.get("seed", 13)
    np.random.seed(seed)
    os.makedirs(noised_dir, exist_ok=True)

    dsc = cfg["dataset"]
    for split_name in [dsc["split_train"], dsc["split_valid"], dsc["split_test"]]:
        csv_path = os.path.join(processed_dir, f"asr_{split_name}.csv")
        if not os.path.exists(csv_path):
            continue
        df = pd.read_csv(csv_path)
        out_paths = []
        split_noised = os.path.join(noised_dir, split_name)
        os.makedirs(split_noised, exist_ok=True)
        for idx, row in tqdm(df.iterrows(), total=len(df), desc=f"Noise {split_name}"):
            audio_path = row["audio_path"]
            if not os.path.exists(audio_path):
                out_paths.append("")
                continue
            data, sr = sf.read(audio_path)
            if data.ndim > 1:
                data = data.mean(axis=1)
            noised = add_white_noise(data, sr, snr_db)
            base = os.path.splitext(os.path.basename(audio_path))[0]
            out_f = os.path.join(split_noised, f"{base}.wav")
            sf.write(out_f, noised, sr)
            out_paths.append(os.path.abspath(out_f))
        df = df.copy()
        df["audio_path"] = out_paths
        out_csv = os.path.join(processed_dir, f"asr_{split_name}_noised.csv")
        df.to_csv(out_csv, index=False)
        print(f"Wrote {out_csv}")

    # Hint for noise.json: point processed_dir or use asr_*_noised.csv for run_whisper/score
    print("For robustness: copy config to noise.json and run whisper/score on asr_*_noised.csv (or swap audio_path in CSV).")


if __name__ == "__main__":
    main()
