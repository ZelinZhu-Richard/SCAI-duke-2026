#!/usr/bin/env bash
# Run full ASR-EAS pipeline (download, prep, ASR, score, intent train/eval).
set -euo pipefail
cd "$(dirname "$0")"
source .venv/bin/activate 2>/dev/null || true
CONFIG="${1:-configs/default.json}"

echo "Using config: $CONFIG"
bash data/download_commonvoice.sh
python scripts/prep_audio.py --config "$CONFIG"
python scripts/run_whisper.py --config "$CONFIG"
python scripts/score_asr.py --config "$CONFIG"
python scripts/train_intent_nn.py --config "$CONFIG"
python scripts/eval_intent.py --config "$CONFIG" --use_whisper
echo "Done. Check results/"
