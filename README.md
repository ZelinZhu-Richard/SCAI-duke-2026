# README.md

**Purpose**: This file contains the project description, overview, and key information about what this project is and how to use it.

---

# Customer Support ASR Equity Benchmark

A society-centered AI benchmark measuring how Automatic Speech Recognition (ASR) systems create inequitable access to customer support services based on accent and English fluency.

## Description

This project evaluates whether state-of-the-art ASR models (specifically OpenAI Whisper) differentially transcribe and misroute customer support calls from speakers with diverse accents, dialects, and ESL backgrounds. By quantifying transcription errors and downstream intent misclassification, we expose how AI voice systems perpetuate service inequity.

**Hackathon Project**: SCAI Duke 2026 Research + Prototype (7-hour build sprint)

## Problem Statement

When customers call support lines, ASR systems transcribe their speech to route calls appropriately. However, these systems perform poorly on non-native accents, leading to:
- Misrouted calls
- Delayed service
- Customer frustration
- Systemic inequity

**37%** of the US population speaks with a non-native English accent, yet most ASR systems are primarily trained on native speakers.

## Our Benchmark Measures

1. **Transcription Accuracy** (Character Error Rate) across accent groups
2. **Intent Classification Errors** - how often calls are misrouted
3. **Disparity Index** - ratio of error rates between ESL and native speakers
4. **Real-World Impact** - quantifying downstream harm from ASR failures

## Social Values & Impact

### Before This Benchmark:
- Companies unaware of ASR performance disparities
- No standardized equity metrics for voice AI
- Underrepresented accents systematically excluded

### After This Benchmark:
- **Accountability**: Transparent, reproducible equity measurements
- **Transparency**: Identify which demographic groups are underserved
- **Public Trust**: Provide regulatory compliance tools for fair AI
- **Actionable**: Guide model fine-tuning and retraining priorities

## Dataset

We use curated samples from open, real-world datasets. The current pipeline and scripts are set up for:
- **Mozilla Common Voice** - Diverse accent and ESL speakers (streaming mode)

**Optional/Future Extensions** (not wired into the current scripts):
- CallHome - Multilingual informal speech
- GLOBE - Global accent diversity

**Accent Groups Tested (default in `scripts/prepare_data.py`):**
- US English (baseline)
- Indian English
- African English
- UK English (England)
- Australian English

You can override the defaults with `--accents` to include Spanish-accented or East Asian-accented English if desired.

## Technology Stack

- **ASR Model**: OpenAI Whisper (tiny/base models)
- **Intent Classification**: Keyword-based or zero-shot (BART)
- **Metrics**: Character Error Rate, Intent Accuracy, Disparity Index
- **Visualization**: Matplotlib, Seaborn
- **Languages**: Python **3.12.12** (required)
- **Libraries**: PyTorch, Transformers, pandas, numpy

## Installation

```bash
# Clone the repository
git clone https://github.com/[your-repo]/SCAI-Duke-2026.git
cd SCAI-Duke-2026

# Create virtual environment (recommended)
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# macOS: install ffmpeg (Whisper audio decoding dependency)
# brew install ffmpeg

# Windows (Lenovo ThinkPad or other): install ffmpeg
# Use winget (recommended):
# winget install Gyan.FFmpeg
# Or use chocolatey:
# choco install ffmpeg

# Install dependencies
pip install -r requirements.txt
```

**Python requirement:** This project requires **Python 3.12.12**. The scripts will exit if a different version is used.

## Dependency Safety Notes (macOS / general)

- `requirements.txt` only lists standard PyPI packages (no local paths or Git URLs).
- The data curation script uses Hugging Face `datasets` with `trust_remote_code=True`. This allows execution of dataset-provided code. If your environment policy forbids this, set `trust_remote_code=False` in `scripts/prepare_data.py` and be prepared to pin a dataset version or use a pre-downloaded dataset.
- For extra caution, install in a fresh virtual environment and review package metadata before installing.

---

## 🚀 Getting Started: Running Your First Experiment

Follow these steps to run the benchmark and see the before/after impact.

### **Step 1: Install Dependencies** (15-30 minutes)

```bash
# Make sure you're in the project directory
cd SCAI-Duke-2026

# Activate virtual environment if you created one
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install all required packages
pip install -r requirements.txt

# Verify installation
python -c "import whisper; import pandas; print('✅ Dependencies installed!')"
```

**⚠️ Important:** On macOS, you may need ffmpeg for Whisper:
```bash
brew install ffmpeg
```

---

### **Step 2: Download Audio Samples** (10-30 minutes)

Download audio files from Mozilla Common Voice dataset:

```bash
# Option A: Small test (5 samples per accent = 20 total files)
# Recommended for first run to test the pipeline quickly
python scripts/prepare_data.py --samples 5 --accents us indian african england

# Option B: Full dataset (20 samples per accent = 80 total files)
# Use this for your final hackathon submission
python scripts/prepare_data.py --samples 20 --accents us indian african england
```

**What this does:**
- Downloads audio clips from Mozilla Common Voice
- Saves them to `data/audio/` with names like `us_001.wav`, `indian_002.wav`, etc.
- Takes 10-30 minutes depending on your internet speed

**Verify it worked:**
```bash
ls data/audio/*.wav | wc -l   # Should show 20 or 80 files
```

---

### **Step 3: Create Ground Truth Labels** (30 min - 3 hours)

This is the **most time-consuming step** but critical for the benchmark.

You need to manually:
1. Listen to each audio file
2. Write down the correct transcription
3. Assign the correct intent (pay_bill, reset_password, report_outage, account_info)

**Edit `data/ground_truth.csv`:**

```csv
filename,accent_group,speaker_type,true_transcript,true_intent,duration
us_001.wav,US,native,I want to pay my bill,pay_bill,3.2
us_002.wav,US,native,I need to reset my password,reset_password,2.8
us_003.wav,US,native,My internet is not working,report_outage,3.5
us_004.wav,US,native,Can I check my account balance,account_info,2.7
us_005.wav,US,native,I want to pay my bill,pay_bill,3.1
indian_001.wav,Indian,ESL,I want to pay my bill,pay_bill,3.4
indian_002.wav,Indian,ESL,I need account information,account_info,3.1
indian_003.wav,Indian,ESL,My internet is not working,report_outage,3.3
indian_004.wav,Indian,ESL,Please reset my password,reset_password,2.9
indian_005.wav,Indian,ESL,I need to pay the bill,pay_bill,3.2
african_001.wav,African,ESL,My service is down,report_outage,2.9
african_002.wav,African,ESL,I want to pay my bill,pay_bill,3.0
african_003.wav,African,ESL,Reset my password please,reset_password,2.8
african_004.wav,African,ESL,Check my account details,account_info,3.1
african_005.wav,African,ESL,Internet not working,report_outage,2.7
england_001.wav,England,native,I need to pay my bill,pay_bill,3.3
england_002.wav,England,native,My connection is down,report_outage,3.0
england_003.wav,England,native,Reset password,reset_password,2.6
england_004.wav,England,native,Account information please,account_info,2.9
england_005.wav,England,native,I want to pay,pay_bill,2.8
```

**⚠️ CRITICAL:**
- The `filename` column MUST exactly match the files in `data/audio/`
- Intent MUST be one of: `pay_bill`, `reset_password`, `report_outage`, `account_info`
- Accent group MUST match what you used in Step 2

**Pro tip:** Start with just 5 samples per accent (20 total) to test the pipeline first!

---

### **Step 4: Run Whisper ASR Transcription** (5-15 minutes)

Transcribe all audio files using Whisper:

```bash
python scripts/run_whisper.py \
  --model tiny \
  --input data/audio \
  --output results/transcripts.csv
```

**What this does:**
- Uses Whisper "tiny" model (fastest, good enough for demo)
- Transcribes each audio file
- Saves results to `results/transcripts.csv`

**Expected output:**
```
Transcribed 20 files → results/transcripts.csv
Total time: 120.5s
Avg time per file: 6.0s
```

**Verify it worked:**
```bash
head results/transcripts.csv
# Should show: filename, transcribed_text, language, transcription_time
```

---

### **Step 5: Classify Intents (Before & After)** (5 seconds)

Run intent classification to see the benchmark impact:

```bash
python scripts/classify_intent.py \
  --transcripts results/transcripts.csv \
  --ground_truth data/ground_truth.csv \
  --output results/intents.csv
```

**What this does:**
- Classifies intents using keyword matching
- Computes **BEFORE** benchmark accuracy (raw Whisper output)
- Computes **AFTER** benchmark accuracy (with normalization)
- Shows you the improvement!

**Expected output:**
```
Overall Intent Accuracy (before): 75.0%
Overall Intent Accuracy (after):  85.0%

Accuracy by Accent Group:
  US             : 95.00% → 98.00%
  Indian         : 70.00% → 80.00%
  African        : 65.00% → 75.00%
  England        : 90.00% → 95.00%
```

---

### **Step 6: Calculate Equity Metrics** (5 seconds)

Calculate CER, disparity index, and find failure examples:

```bash
python scripts/calculate_metrics.py \
  --input results/intents.csv \
  --output results/metrics.json \
  --baseline US
```

**What this does:**
- Calculates Character Error Rate (CER) by accent group
- Computes Disparity Index (how much worse than baseline)
- Finds clear failure examples for your demo
- Saves all metrics to JSON

**Expected output:**
```
CER by Accent Group:
               cer_mean  cer_std  sample_count
US                0.08     0.05           5
Indian            0.18     0.09           5
African           0.22     0.11           5
England           0.12     0.07           5

Disparity Index (baseline: US):
          error_rate  disparity_index
US             5.0              1.00
Indian        25.0              5.00
African       30.0              6.00
England       10.0              2.00

=== FAILURE EXAMPLES ===
File: african_003.wav (African)
  True:     'Reset my password please'
  Whisper:  'Re set my pass word please'
  Intent:   reset_password → unknown ❌
  CER:      18.5%
```

---

### **Step 7: Generate Visualizations** (10 seconds)

Create publication-quality charts:

```bash
python scripts/visualize.py \
  --input results/intents.csv \
  --output visualizations \
  --baseline US
```

**What this does:**
- Creates 4 PNG charts showing bias and disparity
- Saves to `visualizations/` folder

**Output files:**
```
visualizations/
├── cer_by_accent.png          # Character error rate bar chart
├── intent_errors.png           # Misrouting rate by accent
├── disparity_heatmap.png       # Disparity index heatmap
└── summary_dashboard.png       # Combined 4-panel view
```

**View the charts:**
```bash
open visualizations/cer_by_accent.png      # macOS
# or
xdg-open visualizations/cer_by_accent.png  # Linux
# or just open in file explorer on Windows
```

---

### **Step 8: View Results in Demo Notebook** (optional)

Open the demo notebook to see interactive results:

```bash
# Convert template to notebook (or just copy cells)
jupyter notebook demo/demo_notebook_template.py
```

The notebook will show:
- Side-by-side success/failure examples
- Audio playback for each example
- Before/After accuracy comparison
- Key findings and impact statement

---

## ✅ You're Done! What You Have Now:

After completing all steps, you have:

1. ✅ **Data**: 20-80 audio samples with ground truth labels
2. ✅ **Transcripts**: Whisper ASR outputs for all samples
3. ✅ **Metrics**: CER, accuracy, disparity index (before & after)
4. ✅ **Visualizations**: 4 publication-quality charts
5. ✅ **Demo**: Jupyter notebook showing impact
6. ✅ **Proof of concept**: Your benchmark reveals inequity AND shows improvement!

---

## 🎯 Quick Commands Summary

```bash
# Setup (one-time)
pip install -r requirements.txt

# Download data (10-30 min)
python scripts/prepare_data.py --samples 5 --accents us indian african england

# Manually create data/ground_truth.csv (30 min - 3 hours)

# Run pipeline (5-15 min total)
python scripts/run_whisper.py --model tiny --input data/audio --output results/transcripts.csv
python scripts/classify_intent.py --transcripts results/transcripts.csv --ground_truth data/ground_truth.csv --output results/intents.csv
python scripts/calculate_metrics.py --input results/intents.csv --output results/metrics.json
python scripts/visualize.py --input results/intents.csv --output visualizations

# View results
cat results/metrics.json
open visualizations/cer_by_accent.png
```

---

## 📊 Expected Results

You should see evidence of:

**Before Benchmark:**
- US English: ~5-10% error rate, 90-95% intent accuracy
- Indian/African English: ~15-25% error rate, 65-75% intent accuracy
- **Disparity**: 2-6× higher error rates for non-native speakers
- **Impact**: Systematic misrouting of support calls

**After Benchmark (with normalization):**
- Error rates improve by 5-15% for ESL speakers
- Intent accuracy improves by 10-15%
- **Demonstrates benchmark value**: Identifying bias enables mitigation

---

## 🔧 Troubleshooting

### Problem: "No module named 'whisper'"
**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

### Problem: Whisper can't decode audio files
**Solution (macOS):**
```bash
brew install ffmpeg
```

**Solution (Windows):**
```bash
winget install Gyan.FFmpeg
```

### Problem: "No matching filenames found" during intent classification
**Solution:** Make sure filenames in `ground_truth.csv` exactly match files in `data/audio/`
```bash
# Check audio files
ls data/audio/

# Check ground truth
cat data/ground_truth.csv

# Filenames must match exactly (case-sensitive!)
```

### Problem: Dataset download is very slow
**Solution:** Start with fewer samples
```bash
python scripts/prepare_data.py --samples 5  # Just 20 files total
```

### Problem: Whisper transcription is too slow
**Solution:** Make sure you're using the "tiny" model
```bash
python scripts/run_whisper.py --model tiny  # Fastest, ~39M params
```

### Problem: All intent predictions are "unknown"
**Solution:** Check if transcripts contain the expected keywords
```bash
# View some transcriptions
head -20 results/transcripts.csv

# Make sure transcripts contain words like:
# "pay", "bill", "password", "reset", "outage", "internet", etc.
```

### Problem: Ground truth CSV has wrong accent groups
**Solution:** Make sure accent groups match what you used in `prepare_data.py`

Default accents are: `us`, `indian`, `african`, `england`

If your ground truth uses different names (like "Spanish" or "Chinese"), run prepare_data.py with matching accents:
```bash
python scripts/prepare_data.py --samples 5 --accents us spanish chinese
```

---

## 📁 Project Structure

## Project Structure

```
SCAI-Duke-2026/
├── data/
│   ├── audio/              # Audio samples by accent group
│   └── ground_truth.csv    # Labels and metadata
├── models/
│   └── whisper/            # Cached Whisper models
├── scripts/
│   ├── prepare_data.py     # Data curation
│   ├── run_whisper.py      # ASR transcription
│   ├── classify_intent.py  # Intent classification
│   ├── calculate_metrics.py # Metrics computation
│   └── visualize.py        # Chart generation
├── results/
│   ├── transcripts.csv     # ASR outputs
│   ├── intents.csv         # Intent predictions
│   └── metrics.json        # Final metrics
├── visualizations/
│   ├── error_by_accent.png
│   └── intent_errors.png
├── demo/
│   └── demo_notebook_template.py  # Jupyter-friendly template
├── requirements.txt
├── README.md               # This file
├── PLAN.md                 # Project outline
├── BUGS.md                 # Bug tracking
└── ADJUSTMENT.md           # Implementation adjustments
```

## Key Results

*[To be filled during hackathon]*

**Example Findings:**
- ESL speakers experience **2.3×** higher misrouting rate
- Indian English accents have **18%** higher Character Error Rate
- **42%** of informal/slang phrases are misclassified

## Team

4 High School Students @ SCAI Duke 2026 Hackathon
- Person 1: Data & ASR Lead
- Person 2: Metrics & Analysis Lead
- Person 3: Intent Classification & Demo Lead
- Person 4: Documentation & Integration Lead

## Timeline

- **Pre-Hackathon**: Data curation, environment setup
- **7-Hour Sprint**: Model execution, analysis, demo creation
- **Submission**: February 7, 2026 by 4PM to Devpost

## Contributing

This is a hackathon project. For improvements or questions:
1. See `PLAN.md` for detailed methodology
2. Check `BUGS.md` for known issues
3. Review `ADJUSTMENT.md` for implementation decisions

## Future Work

- Expand to 10+ accent groups
- Test multiple ASR models (DeepSpeech, wav2vec, Google STT)
- Add noise/line distortion simulations
- Include age, gender, speech impairment analysis
- Build public-facing benchmark leaderboard

## License

MIT License - Open for educational and research purposes

## Acknowledgments

- Mozilla Foundation (Common Voice dataset)
- OpenAI (Whisper model)
- Hugging Face (Transformers library)
- SCAI Duke 2026 Organizers

---

**Made with ❤️ and a commitment to AI equity**
