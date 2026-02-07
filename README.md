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

We use curated samples from open, real-world datasets:
- **Mozilla Common Voice** - Diverse accent and ESL speakers
- **CallHome** - Multilingual informal speech
- **GLOBE** - Global accent diversity

**Accent Groups Tested:**
- US English (baseline)
- Indian English
- Spanish-accented English
- East Asian-accented English
- UK English

## Technology Stack

- **ASR Model**: OpenAI Whisper (tiny/base models)
- **Intent Classification**: Keyword-based or zero-shot (BART)
- **Metrics**: Character Error Rate, Intent Accuracy, Disparity Index
- **Visualization**: Matplotlib, Seaborn
- **Languages**: Python 3.x
- **Libraries**: PyTorch, Transformers, pandas, numpy

## Installation

```bash
# Clone the repository
git clone https://github.com/[your-repo]/SCAI-Duke-2026.git
cd SCAI-Duke-2026

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### 1. Prepare Data
```bash
# Curate audio samples (pre-hackathon)
python scripts/prepare_data.py --samples 50 --output data/audio/
```

### 2. Run ASR Transcription
```bash
# Transcribe all audio files
python scripts/run_whisper.py --model tiny --input data/audio/ --output results/transcripts.csv
```

### 3. Classify Intent
```bash
# Run intent classification
python scripts/classify_intent.py --input results/transcripts.csv --output results/intents.csv
```

### 4. Calculate Metrics
```bash
# Compute equity metrics
python scripts/calculate_metrics.py --input results/intents.csv --output results/metrics.json
```

### 5. Generate Visualizations
```bash
# Create charts
python scripts/visualize.py --input results/metrics.json --output visualizations/
```

### 6. Run Demo
```bash
# Launch Jupyter notebook demo
jupyter notebook demo/demo.ipynb
```

## Quick Demo (All-in-One)

```python
from benchmark import ASREquityBenchmark

# Initialize benchmark
benchmark = ASREquityBenchmark(model="whisper-tiny")

# Load data
benchmark.load_data("data/ground_truth.csv")

# Run full pipeline
results = benchmark.run()

# Display results
benchmark.show_results()
benchmark.save_report("results/report.html")
```

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
│   └── demo.ipynb          # Interactive demo notebook
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
- **Submission**: 2/7 by 4PM to Devpost

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
