# Run full ASR-EAS pipeline (PowerShell).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$CONFIG = if ($args[0]) { $args[0] } else { "configs/default.json" }
.\.venv\Scripts\Activate.ps1 -ErrorAction SilentlyContinue
Write-Host "Using config: $CONFIG"
& bash data/download_commonvoice.sh
python scripts/prep_audio.py --config $CONFIG
python scripts/run_whisper.py --config $CONFIG
python scripts/score_asr.py --config $CONFIG
python scripts/train_intent_nn.py --config $CONFIG
python scripts/eval_intent.py --config $CONFIG --use_whisper
Write-Host "Done. Check results/"
