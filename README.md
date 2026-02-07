# ASR-EAS: ASR Equity for Access to Services

ASR-EAS is a benchmark and prototype pipeline that measures how ASR errors in customer-support calls translate into unequal access to essential services. It evaluates transcription quality, intent routing, and optional robustness stress tests, with subgroup-disaggregated reporting.

## Scope
- Domains: banking, utilities, insurance, telecom, benefits support
- Pipeline: audio → Whisper ASR → intent routing (NN)
- Subgroups: accent/locale proxies, gender/age (if available), noise/codec conditions

## Requirements
- Python 3.8+
- **ffmpeg** (e.g. `brew install ffmpeg` on macOS)
- On macOS: use a fresh venv and `pip install -r requirements.txt` (avoids numba/llvmlite build issues).

## Quickstart (small demo, ~14 MB)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
bash data/download_commonvoice.sh
python scripts/prep_audio.py --config configs/default.json
python scripts/run_whisper.py --config configs/default.json
python scripts/score_asr.py --config configs/default.json
python scripts/train_intent_nn.py --config configs/default.json
python scripts/eval_intent.py --config configs/default.json --use_whisper
```

## Robustness (Noise)
```bash
python scripts/add_noise.py --config configs/default.json
python scripts/run_whisper.py --config configs/noise.json
python scripts/score_asr.py --config configs/noise.json
python scripts/eval_intent.py --config configs/noise.json --use_whisper
```

## Outputs
- `results/asr_scores.csv`
- `results/asr_scores_by_group.csv`
- `results/intent_scores.csv`
- `results/intent_scores_by_group.csv`

## Ethics and Limitations
- Subgroup labels are proxies and may be incomplete or noisy.
- Read speech is not fully representative of real call-center interactions.
- Weak intent labels are noisy; use spot-checks or manual review for precision estimates.
- Some conversational datasets have restrictive licenses.

## Dataset options
- **default / small** (`configs/default.json`): LibriSpeech ASR dummy — ~14 MB, quick demo.
- **GLOBE** (`configs/globe.json`): English with global accents — larger download (parquet shards mean 100s of MB even for a subset). Use when you need accent/subgroup evaluation.

## License Notes
Mozilla Common Voice is available under CC0 with terms in the dataset card. If you use Switchboard/CallHome/AMI, confirm licensing and distribution rules separately.
