#!/usr/bin/env bash
# Download default ASR dataset (openslr/librispeech_asr, parquet-only, no loading script).
# For GLOBE (accent benchmark), use: python scripts/prep_audio.py --config configs/globe.json
set -euo pipefail

python - <<'PY'
from datasets import load_dataset

print("Downloading default ASR dataset: openslr/librispeech_asr (parquet)")
split = {"train": "train.clean.100", "validation": "validation.clean", "test": "test.clean"}
ds = load_dataset("openslr/librispeech_asr", split=split)
print("Splits:", list(ds.keys()))
for k in ds.keys():
    print(f"  {k}: {len(ds[k])} rows")
print("Done. Run: python scripts/prep_audio.py --config configs/default.json")
PY
