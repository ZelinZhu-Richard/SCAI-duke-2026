# EqualVoice

**A society-centered benchmark for measuring how Automatic Speech Recognition (ASR) systems create inequitable access to customer support — and what it costs in real dollars and real human time.**

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Hackathon](https://img.shields.io/badge/SCAI%20Duke-2026-orange.svg)](#)

> When voice AI mishears an accent, the person on the other end pays the price — in time, in money, and in dignity. EqualVoice measures that gap.

---

## Table of Contents

- [Inspiration](#inspiration)
- [What It Does](#what-it-does)
- [How We Built It](#how-we-built-it)
- [Challenges](#challenges)
- [Accomplishments](#accomplishments)
- [What We Learned](#what-we-learned)
- [What's Next](#whats-next)
- [How to Use the Tool](#how-to-use-the-tool)
- [Project Structure](#project-structure)
- [Team & License](#team--license)

---

## Inspiration

We come from immigrant families. One of our teammates, Richard, moved from China three years ago — he and our parents regularly struggle with automated phone systems that fail to understand accented speech. These aren't edge cases. They're everyday experiences.

EqualVoice was inspired by seeing how voice AI systems that *claim* high accuracy still systematically fail people like our families. Small misunderstandings have huge consequences:

| Stat | Source / Implication |
| --- | --- |
| **$3.2B / year** | Estimated loss at Bank of America from customer service inefficiencies |
| **$8,800 / year** | Cost to a small business of misinterpreting just **two** calls per day |
| **27%** | Of customers abandon voice calls |
| **75%** | Of those abandonments happen because the customer feels misunderstood |

Accent equity isn't a "nice to have." It's a measurable business and human-rights problem.

---

## What It Does

EqualVoice benchmarks how speech recognition errors disproportionately affect accented speakers, and tracks how those errors **cascade downstream** into:

- Incorrect intent classification
- Misrouted calls
- Increased resolution time and abandonment

It transforms abstract metrics like Word Error Rate into **real-world consequences**, quantifying both access inequity and operational cost. By connecting transcription errors to measurable impact, EqualVoice shows businesses exactly where their voice AI fails their most vulnerable customers.

**The benchmark reports four things:**

1. **Transcription Accuracy** — Character/Word Error Rate by accent group
2. **Intent Classification Errors** — How often calls get misrouted
3. **Disparity Index** — Ratio of error rates between ESL and native speakers
4. **Real-World Impact** — Downstream operational and human cost

---

## How We Built It

We worked with **terabytes of open speech data** spanning thousands of recordings to simulate realistic customer support scenarios.

```
Audio  →  Whisper ASR  →  Intent Classifier  →  Routing Logic  →  Metrics
                                                                    │
                                                       CER · Intent Error · Disparity Index
```

- **Data:** Mozilla Common Voice (`cv-valid-test`), with optional extension paths for CallHome and GLOBE.
- **ASR:** OpenAI Whisper (tiny / base) — fast enough for live demos, realistic enough to expose failure modes.
- **Intent:** Keyword-based classifier with optional zero-shot (BART) fallback.
- **Eval:** WER/CER, intent accuracy, and a disparity index comparing accented vs. non-accented speakers.
- **Scale strategy:** Engineered a sampling + caching layer to extract small, statistically meaningful subsets so the pipeline runs end-to-end in minutes.

The pipeline runs end-to-end while still being realistic enough to capture real-world failures.

---

## Challenges

Handling massive audio datasets was our biggest challenge:

- Storage limits and slow preprocessing
- Corrupted files and inconsistent labels
- Compute bottlenecks that forced us to rethink the pipeline more than once
- Fair benchmarking required careful controls — small mistakes could exaggerate or hide bias
- Translating model-level errors into **real-world impact metrics** turned out to be the hardest design problem

Simulating realistic customer interactions while keeping the demo fast added another layer of complexity.

---

## Accomplishments

We're a group of **high schoolers** who built an end-to-end, realistic benchmark that quantifies how speech recognition errors impact real people and real businesses. We:

- Processed thousands of audio recordings
- Designed a scalable pipeline under tight compute constraints
- Showed how small transcription gaps compound into significant downstream failures
- Delivered a polished, demo-ready system grounded in authentic data and metrics

Even young developers can tackle complex, socially meaningful AI challenges.

---

## What We Learned

Bias in voice AI is often **invisible at the surface level**. Minor increases in error rates compound into major barriers when systems rely on multiple automated decisions. Evaluating fairness requires an **end-to-end approach**, connecting technical errors to human impact. Accurate systems are not enough — equitable systems must be measured, too.

---

## What's Next

- Expand accent coverage (10+ groups)
- Benchmark additional ASR models (wav2vec, DeepSpeech, Google STT, Deepgram)
- Integrate EqualVoice into **continuous evaluation workflows** for voice AI teams
- Add noise/line-distortion simulation and demographic dimensions (age, speech impairment)
- Make accent equity a **measurable standard**, not an afterthought

---

## How to Use the Tool

The full pipeline runs in roughly **20 minutes** once dependencies and audio are in place.

### Requirements

- **Python 3.12.12** (the scripts will exit on a different version)
- **ffmpeg** for Whisper audio decoding
- ~2 GB free disk for models + samples

### 1. Install

```bash
git clone https://github.com/<your-org>/SCAI-Duke-2026.git
cd SCAI-Duke-2026

python3.12 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# macOS
brew install ffmpeg
# Windows
# winget install Gyan.FFmpeg

pip install -r requirements.txt
python -c "import whisper, pandas; print('Dependencies OK')"
```

### 2. Organize audio samples

Download Common Voice (e.g. `cv-valid-test`) and unzip it locally — assume it's at `~/Downloads/cv-valid-test`.

```bash
# Quick smoke test: 5 samples per accent (20 total)
python scripts/organize_mozilla_cv.py \
  --cv_dir ~/Downloads/cv-valid-test \
  --output data/audio \
  --samples 5 \
  --accents us india african england \
  --metadata_csv ~/Downloads/cv-valid-test.csv \
  --allow_no_metadata \
  --total_samples 20
```

This copies balanced audio into `data/audio/` and produces `data/ground_truth_template.csv` for you to fill in.

### 3. Create ground truth labels

Edit `data/ground_truth.csv` so it matches the files in `data/audio/`. Required columns:

```csv
filename,accent_group,speaker_type,true_transcript,true_intent,duration
us_001.wav,US,native,I want to pay my bill,pay_bill,3.2
indian_001.wav,Indian,ESL,I want to pay my bill,pay_bill,3.4
african_001.wav,African,ESL,My service is down,report_outage,2.9
england_001.wav,England,native,I need to pay my bill,pay_bill,3.3
```

> Filenames are case-sensitive and must match exactly. Intents must be one of `pay_bill`, `reset_password`, `report_outage`, `account_info`.

### 4. Run the pipeline

```bash
# Transcribe with Whisper
python scripts/run_whisper.py \
  --model tiny \
  --input data/audio \
  --output results/transcripts.csv

# Classify intents (before / after normalization)
python scripts/classify_intent.py \
  --transcripts results/transcripts.csv \
  --ground_truth data/ground_truth.csv \
  --output results/intents.csv

# Compute equity metrics (CER, disparity index, failure cases)
python scripts/calculate_metrics.py \
  --input results/intents.csv \
  --output results/metrics.json \
  --baseline US

# Generate publication-quality charts
python scripts/visualize.py \
  --input results/intents.csv \
  --output visualizations \
  --baseline US
```

### 5. Read the results

```bash
cat results/metrics.json
open visualizations/summary_dashboard.png   # macOS
```

You'll get four charts in `visualizations/`:

| File | Shows |
| --- | --- |
| `cer_by_accent.png` | Character Error Rate per accent group |
| `intent_errors.png` | Misrouting rate per accent group |
| `disparity_heatmap.png` | Disparity index vs. baseline |
| `summary_dashboard.png` | Combined 4-panel view for the demo |

### Expected results

| Group | Error rate | Intent accuracy |
| --- | --- | --- |
| US English | ~5–10% | 90–95% |
| Indian / African English | ~15–25% | 65–75% |
| **Disparity** | **2–6× higher** for non-native speakers | |

After the normalization layer, ESL error rates typically drop by 5–15% and intent accuracy improves by 10–15% — proving the benchmark not only **exposes** bias but enables **mitigation**.

### Troubleshooting

| Problem | Fix |
| --- | --- |
| `No module named 'whisper'` | `pip install -r requirements.txt` |
| Whisper can't decode audio | Install ffmpeg (`brew install ffmpeg` / `winget install Gyan.FFmpeg`) |
| `No matching filenames found` | Filenames in `ground_truth.csv` must exactly match `data/audio/` |
| All intents predict `unknown` | Check that transcripts contain expected keywords; try `--model base` |
| Pipeline too slow | Use `--samples 5` and `--model tiny` |

---

## Project Structure

```
SCAI-Duke-2026/
├── data/
│   ├── audio/                  # Organized audio samples
│   └── ground_truth.csv        # Manual labels
├── scripts/
│   ├── organize_mozilla_cv.py  # Local Common Voice organizer
│   ├── prepare_data.py         # Optional HF-based curation
│   ├── run_whisper.py          # ASR transcription
│   ├── classify_intent.py      # Intent classification
│   ├── calculate_metrics.py    # CER + disparity metrics
│   └── visualize.py            # Chart generation
├── results/
│   ├── transcripts.csv
│   ├── intents.csv
│   └── metrics.json
├── visualizations/             # Output PNGs
├── demo/                       # Jupyter-ready demo template
├── requirements.txt
├── README.md                   # This file
├── PLAN.md
├── BUGS.md
└── ADJUSTMENT.md
```

---

## Team & License

Built by **four high school students** at the SCAI Duke 2026 Hackathon.

- Data & ASR Lead
- Metrics & Analysis Lead
- Intent Classification & Demo Lead
- Documentation & Integration Lead

**License:** MIT — open for educational and research use. See [LICENSE](LICENSE).

**Acknowledgments:** Mozilla Foundation (Common Voice), OpenAI (Whisper), Hugging Face (Transformers), and the SCAI Duke 2026 organizers.

---

*Built with a commitment to AI equity — because everyone deserves to be heard.*
