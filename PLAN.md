# PLAN.md

**Purpose**: This file contains the project outline, architecture, and structural overview. Reference this document for understanding the project's organization and planned features.

---

## Challenge & Situation

### Hackathon Challenge
We are creating a **proposal of a benchmark to evaluate society-centered AI**. The proposal must clearly articulate:

1. **The social values or impacts** the benchmark aims to measure
2. **The AI system or use cases** it applies to
3. **The evaluation methodology and metrics**
4. **How the benchmark improves accountability, transparency, or public trust**

### Requirements
- **Format**: Research + Hackathon Proposal
- **Approach**: Creative while realistic
- **Data**: Open datasets actually used in real-life models
- **Impact Analysis**: Show model's initial societal impact and post-benchmark impact
- **Hackathon Duration**: Exactly 7 hours for prototype and demo
- **Team**: 4 high schoolers with coding knowledge and AI assistance
- **Submission Deadline**: Devpost by 2/7, 4PM

### Chosen Proposal
**Customer Support ASR Equity Benchmark**

---

## Customer Support ASR Equity Benchmark – ADJUSTED Implementation Plan

### 1. Project Goal
Measure how Whisper ASR (or equivalent neural ASR models) differentially affects service access for speakers with diverse accents, dialects, and English fluency in customer support calls.

**Key Focus:**
- Transcription accuracy → downstream intent classification → access inequity
- Quantify error rates, misrouting, disparity across speaker groups
- **Maintain rigor through systematic measurement while being realistic about scope**

---

## REALISTIC 7-HOUR EXECUTION PLAN

### Pre-Hackathon Preparation (CRITICAL - Do Before Sprint)

#### Data Curation Strategy
**Instead of downloading full datasets (500GB+), pre-curate targeted samples:**

1. **Select 50-100 audio clips** using streaming API:
   - Mozilla Common Voice: 10-20 clips per accent group
   - Focus on 4-5 accent groups:
     - US English (baseline)
     - Indian English
     - Spanish-accented English
     - East Asian-accented English
     - UK English (optional)

2. **Create ground truth labels** (`data/ground_truth.csv`):
   ```csv
   filename,accent_group,speaker_type,true_transcript,true_intent,duration
   us_001.wav,US,native,"I want to pay my bill",pay_bill,3.2
   indian_001.wav,Indian,ESL,"I need to reset my password",reset_password,4.1
   spanish_001.wav,Spanish,ESL,"My internet is not working",report_outage,3.8
   ```

3. **Pre-download scripts** (run BEFORE hackathon):
   ```python
   # scripts/prepare_data.py - Use streaming to avoid full download
   from datasets import load_dataset
   import soundfile as sf
   import os

   def curate_samples(target_per_group=20, output_dir="data/audio"):
       ds = load_dataset("mozilla-foundation/common_voice_13_0",
                         "en", split="test", streaming=True)

       os.makedirs(output_dir, exist_ok=True)
       accent_counts = {}
       target_accents = ["us", "indian", "african", "england"]

       for idx, item in enumerate(ds):
           accent = item.get("accent", "other")
           if accent in target_accents:
               count = accent_counts.get(accent, 0)
               if count < target_per_group:
                   # Save audio file
                   filename = f"{accent}_{count:03d}.wav"
                   filepath = os.path.join(output_dir, filename)
                   sf.write(filepath, item["audio"]["array"],
                           item["audio"]["sampling_rate"])

                   accent_counts[accent] = count + 1

           if sum(accent_counts.values()) >= target_per_group * len(target_accents):
               break

       print(f"Curated {sum(accent_counts.values())} samples")
       return accent_counts
   ```

---

### Hour-by-Hour Timeline (7 Hours)

#### **Hour 0-1: Setup & Data Loading**
**Team: All hands on deck**

| Person | Task | Deliverable |
|--------|------|-------------|
| Person 1 & 2 | Environment setup: Install dependencies, test imports | Working Python env |
| Person 3 | Load pre-curated audio samples, verify integrity | 50+ audio files ready |
| Person 4 | Finalize ground truth CSV with labels | `ground_truth.csv` |

**Success Criteria:**
- ✅ All team members have working environment
- ✅ Audio files loaded and accessible
- ✅ Ground truth labels complete

---

#### **Hour 1-2.5: Parallel ASR & Intent Setup**
**Team: Split into two pairs**

**Pair A (Person 1 & 2): ASR Transcription**
```python
# scripts/run_whisper.py
import whisper
import pandas as pd
import time
from pathlib import Path

def transcribe_all(audio_dir, model_size="tiny", output_csv="results/transcripts.csv"):
    """
    Use Whisper TINY model for speed (5-10s per 30s clip on CPU)
    """
    model = whisper.load_model(model_size)

    results = []
    audio_files = list(Path(audio_dir).glob("*.wav"))

    for audio_file in audio_files:
        start = time.time()
        result = model.transcribe(str(audio_file))

        results.append({
            "filename": audio_file.name,
            "transcribed_text": result["text"],
            "language": result.get("language", "en"),
            "transcription_time": time.time() - start
        })

        print(f"✓ {audio_file.name}: {time.time() - start:.2f}s")

    df = pd.DataFrame(results)
    df.to_csv(output_csv, index=False)
    print(f"\nTranscribed {len(results)} files → {output_csv}")
    return df
```

**Pair B (Person 3 & 4): Intent Classification Setup**

**SIMPLIFIED APPROACH: Keyword-Based Classification**
```python
# scripts/classify_intent.py

def classify_intent_keyword(transcript):
    """
    Simple, transparent, fast keyword matching.
    Good enough for demonstrating bias! No training needed.
    """
    transcript = transcript.lower()

    # Define intent patterns
    intents = {
        "pay_bill": ["pay", "bill", "payment", "charge", "invoice", "balance", "owe"],
        "reset_password": ["reset", "password", "login", "access", "forgot", "locked out"],
        "report_outage": ["outage", "down", "not working", "broken", "offline", "internet", "service"],
        "account_info": ["account", "information", "details", "status", "balance", "history"]
    }

    # Score each intent
    scores = {}
    for intent, keywords in intents.items():
        scores[intent] = sum(1 for kw in keywords if kw in transcript)

    # Return highest scoring intent
    if max(scores.values()) > 0:
        return max(scores, key=scores.get)
    else:
        return "unknown"

def classify_all(transcripts_csv, ground_truth_csv, output_csv="results/intents.csv"):
    """
    Classify all transcripts and compare to ground truth
    """
    import pandas as pd

    transcripts = pd.read_csv(transcripts_csv)
    ground_truth = pd.read_csv(ground_truth_csv)

    # Merge datasets
    merged = transcripts.merge(ground_truth, on="filename")

    # Classify transcribed text
    merged["predicted_intent"] = merged["transcribed_text"].apply(classify_intent_keyword)

    # Also classify true transcript for comparison
    merged["true_intent_check"] = merged["true_transcript"].apply(classify_intent_keyword)

    # Mark correctness
    merged["intent_correct"] = merged["predicted_intent"] == merged["true_intent"]

    merged.to_csv(output_csv, index=False)
    print(f"Classified {len(merged)} transcripts → {output_csv}")
    return merged
```

**Success Criteria:**
- ✅ All audio transcribed by Whisper
- ✅ Intent classifier ready and tested
- ✅ Results saved to CSV files

---

#### **Hour 2.5-4: Metrics & Disparity Analysis**
**Team: Each person owns one metric**

**Person 1: Character Error Rate (CER)**
```python
# scripts/calculate_metrics.py
import Levenshtein
import pandas as pd

def calculate_cer(reference, hypothesis):
    """
    Character Error Rate using Levenshtein distance.
    More forgiving than WER for non-native speakers.
    """
    if len(reference) == 0:
        return 1.0 if len(hypothesis) > 0 else 0.0

    distance = Levenshtein.distance(reference.lower(), hypothesis.lower())
    return distance / len(reference)

def compute_cer_by_group(intents_df):
    """
    Calculate CER for each accent group
    """
    intents_df["cer"] = intents_df.apply(
        lambda row: calculate_cer(row["true_transcript"], row["transcribed_text"]),
        axis=1
    )

    cer_by_group = intents_df.groupby("accent_group").agg({
        "cer": ["mean", "std", "min", "max"],
        "filename": "count"
    }).round(3)

    print("CER by Accent Group:")
    print(cer_by_group)
    return cer_by_group
```

**Person 2: Intent Accuracy**
```python
def compute_intent_accuracy(intents_df):
    """
    Calculate intent classification accuracy by group
    """
    accuracy_by_group = intents_df.groupby("accent_group").agg({
        "intent_correct": ["mean", "sum", "count"]
    })

    accuracy_by_group.columns = ["accuracy", "correct_count", "total"]
    accuracy_by_group["accuracy"] = (accuracy_by_group["accuracy"] * 100).round(2)

    print("\nIntent Accuracy by Accent Group:")
    print(accuracy_by_group)
    return accuracy_by_group
```

**Person 3: Disparity Index**
```python
def compute_disparity_index(intents_df, baseline_group="US"):
    """
    Disparity Index = error_rate(group) / error_rate(baseline)
    Values > 1 indicate worse performance than baseline
    """
    # Calculate error rates
    error_rates = intents_df.groupby("accent_group").agg({
        "intent_correct": lambda x: 1 - x.mean()  # error rate
    }).rename(columns={"intent_correct": "error_rate"})

    baseline_error = error_rates.loc[baseline_group, "error_rate"]

    error_rates["disparity_index"] = error_rates["error_rate"] / baseline_error
    error_rates["disparity_index"] = error_rates["disparity_index"].round(2)

    print(f"\nDisparity Index (baseline: {baseline_group}):")
    print(error_rates)
    return error_rates
```

**Person 4: Find Illustrative Examples**
```python
def find_failure_examples(intents_df, num_examples=5):
    """
    Find clear examples of transcription/intent failures for demo
    """
    # Find failures with high CER
    failures = intents_df[
        (intents_df["intent_correct"] == False) &
        (intents_df["cer"] > 0.3)
    ].sort_values("cer", ascending=False).head(num_examples)

    # Find successes for comparison
    successes = intents_df[
        (intents_df["intent_correct"] == True) &
        (intents_df["accent_group"] == "US")
    ].head(num_examples)

    print(f"\n=== FAILURE EXAMPLES (High CER, Wrong Intent) ===")
    for _, row in failures.iterrows():
        print(f"\nFile: {row['filename']} ({row['accent_group']})")
        print(f"  True:  '{row['true_transcript']}'")
        print(f"  Whisper: '{row['transcribed_text']}'")
        print(f"  True Intent: {row['true_intent']} → Predicted: {row['predicted_intent']}")
        print(f"  CER: {row['cer']:.2%}")

    return failures, successes
```

**Success Criteria:**
- ✅ CER calculated per accent group
- ✅ Intent accuracy computed
- ✅ Disparity Index quantified
- ✅ 3-5 compelling failure examples identified

---

#### **Hour 4-5.5: Visualization & Demo Creation**
**Team: Parallel work on visuals and demo**

**Person 1 & 2: Create Visualizations**
```python
# scripts/visualize.py
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

sns.set_style("whitegrid")
sns.set_palette("Set2")

def create_cer_chart(cer_by_group, output="visualizations/cer_by_accent.png"):
    """
    Bar chart: Character Error Rate by Accent Group
    """
    fig, ax = plt.subplots(figsize=(10, 6))

    groups = cer_by_group.index
    cer_means = cer_by_group[("cer", "mean")]

    bars = ax.bar(groups, cer_means * 100, color=sns.color_palette("Set2", len(groups)))

    ax.set_ylabel("Character Error Rate (%)", fontsize=12)
    ax.set_xlabel("Accent Group", fontsize=12)
    ax.set_title("ASR Transcription Accuracy by Accent Group\n(Lower is Better)",
                 fontsize=14, fontweight="bold")
    ax.axhline(y=cer_means["US"] * 100, color="red", linestyle="--",
               label=f"US Baseline: {cer_means['US']*100:.1f}%")

    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.1f}%', ha='center', va='bottom')

    ax.legend()
    plt.tight_layout()
    plt.savefig(output, dpi=300)
    print(f"Saved: {output}")
    return fig

def create_intent_error_chart(accuracy_by_group, output="visualizations/intent_errors.png"):
    """
    Bar chart: Intent Misclassification Rate by Group
    """
    fig, ax = plt.subplots(figsize=(10, 6))

    groups = accuracy_by_group.index
    error_rates = 100 - accuracy_by_group["accuracy"]

    bars = ax.bar(groups, error_rates, color=sns.color_palette("Reds_r", len(groups)))

    ax.set_ylabel("Intent Misclassification Rate (%)", fontsize=12)
    ax.set_xlabel("Accent Group", fontsize=12)
    ax.set_title("Customer Support Call Misrouting by Accent\n(Lower is Better)",
                 fontsize=14, fontweight="bold")

    # Add value labels
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.1f}%', ha='center', va='bottom')

    plt.tight_layout()
    plt.savefig(output, dpi=300)
    print(f"Saved: {output}")
    return fig

def create_disparity_heatmap(disparity_df, output="visualizations/disparity_heatmap.png"):
    """
    Heatmap showing disparity index
    """
    fig, ax = plt.subplots(figsize=(8, 6))

    # Reshape for heatmap
    heatmap_data = disparity_df["disparity_index"].values.reshape(-1, 1)

    sns.heatmap(heatmap_data, annot=True, fmt=".2f", cmap="RdYlGn_r",
                yticklabels=disparity_df.index, xticklabels=["Disparity Index"],
                cbar_kws={"label": "DI (higher = more bias)"}, ax=ax)

    ax.set_title("ASR Equity Disparity Index\n(1.0 = equal to baseline, >1.0 = worse)",
                 fontsize=14, fontweight="bold")

    plt.tight_layout()
    plt.savefig(output, dpi=300)
    print(f"Saved: {output}")
    return fig
```

**Person 3 & 4: Build Jupyter Demo**
```python
# demo/demo.ipynb (create as notebook)

"""
# Customer Support ASR Equity Benchmark - Live Demo

## Problem Statement
When customers call support lines, does their accent affect service quality?
"""

# Cell 1: Load results
import pandas as pd
from IPython.display import Audio, Image, display

intents_df = pd.read_csv("../results/intents.csv")

# Cell 2: Side-by-Side Comparison
print("=== EXAMPLE 1: Native Speaker (Success) ===\n")
example_success = intents_df[intents_df["accent_group"] == "US"].iloc[0]
print(f"Accent: {example_success['accent_group']}")
print(f"True Transcript: '{example_success['true_transcript']}'")
print(f"Whisper Output:  '{example_success['transcribed_text']}'")
print(f"True Intent: {example_success['true_intent']}")
print(f"Predicted Intent: {example_success['predicted_intent']} ✅")
print(f"CER: {example_success['cer']:.1%}")

display(Audio(f"../data/audio/{example_success['filename']}"))

print("\n" + "="*60)
print("\n=== EXAMPLE 2: ESL Speaker (Failure) ===\n")
example_failure = intents_df[
    (intents_df["intent_correct"] == False) &
    (intents_df["accent_group"] != "US")
].iloc[0]
print(f"Accent: {example_failure['accent_group']}")
print(f"True Transcript: '{example_failure['true_transcript']}'")
print(f"Whisper Output:  '{example_failure['transcribed_text']}'")
print(f"True Intent: {example_failure['true_intent']}")
print(f"Predicted Intent: {example_failure['predicted_intent']} ❌")
print(f"CER: {example_failure['cer']:.1%}")

display(Audio(f"../data/audio/{example_failure['filename']}"))

# Cell 3: Show metrics visualizations
print("\n=== BENCHMARK RESULTS ===\n")
display(Image("../visualizations/cer_by_accent.png"))
display(Image("../visualizations/intent_errors.png"))
display(Image("../visualizations/disparity_heatmap.png"))

# Cell 4: Key findings
print("## KEY FINDINGS")
print(f"• {len(intents_df)} customer support calls analyzed")
print(f"• {len(intents_df['accent_group'].unique())} accent groups tested")

baseline_cer = intents_df[intents_df["accent_group"] == "US"]["cer"].mean()
worst_group = intents_df.groupby("accent_group")["cer"].mean().idxmax()
worst_cer = intents_df[intents_df["accent_group"] == worst_group]["cer"].mean()

print(f"• Baseline CER (US English): {baseline_cer:.1%}")
print(f"• Worst performing group: {worst_group} at {worst_cer:.1%}")
print(f"• Disparity: {worst_cer/baseline_cer:.2f}× higher error rate")

misroute_rate = (1 - intents_df["intent_correct"].mean()) * 100
print(f"• Overall call misrouting rate: {misroute_rate:.1f}%")
```

**Success Criteria:**
- ✅ 3 publication-quality charts created
- ✅ Jupyter notebook demo with audio playback
- ✅ Side-by-side comparison examples ready

---

#### **Hour 5.5-6.5: Abstract & Slide Deck**
**Team: Divide and conquer**

**Person 1: Draft Abstract (250 words max)**
```markdown
# Abstract Template

**Title:** Customer Support ASR Equity Benchmark: Measuring Voice AI Bias in Service Access

**Problem:** Automatic Speech Recognition (ASR) systems increasingly mediate access to customer support services. However, these systems exhibit differential performance across accent groups, potentially creating systemic barriers for non-native English speakers—37% of the US population.

**Approach:** We developed a benchmark to quantify equity in ASR-driven customer support routing. Using [X] curated audio samples from Mozilla Common Voice spanning [Y] accent groups (US, Indian, Spanish, East Asian English), we evaluated OpenAI's Whisper model on transcription accuracy and downstream intent classification.

**Methodology:** Our pipeline measures:
1. Character Error Rate (CER) across accent groups
2. Intent misclassification rate (pay bill, reset password, report outage, account info)
3. Disparity Index quantifying inequity relative to baseline (US English)

**Results:** We found ESL speakers experience [X]× higher transcription errors and [Y]% higher call misrouting rates compared to native speakers. [Specific group] showed the largest disparity with a [Z] Disparity Index.

**Impact:** Before this benchmark, companies lacked standardized metrics to assess ASR equity. Our work provides:
- Transparent, reproducible evaluation framework
- Identification of underserved demographic groups
- Actionable guidance for model fine-tuning priorities
- Regulatory compliance tool for fair AI

**Significance:** By exposing systematic biases in voice AI, this benchmark advances accountability and public trust in automated customer service systems, directly impacting millions of non-native English speakers.

[X words]
```

**Person 2 & 3: Create 5-Slide Deck**

**Slide 1: Problem Statement**
- Title: "When Your Accent Determines If You Get Help"
- Visual: Split image of two callers (stock photos)
- Hook stat: "37% of US population speaks with non-native accent"
- Problem: ASR systems perform worse on accents → misrouted calls → service inequity

**Slide 2: Current State (No Benchmark)**
- Title: "The Hidden Bias in Voice AI"
- Visual: Customer support call flow diagram (audio → ASR → intent → routing)
- Issues:
  - No standardized equity metrics
  - Companies unaware of disparities
  - Underrepresented groups systematically disadvantaged
- Quote: "You can't fix what you don't measure"

**Slide 3: Our Benchmark Solution**
- Title: "ASR Equity Benchmark: Measuring What Matters"
- Dataset: Mozilla Common Voice ([X] samples, [Y] accent groups)
- Model: OpenAI Whisper ASR
- Pipeline diagram with metrics:
  - Audio → Whisper → Transcript → Intent Classifier → Metrics
- Metrics:
  - Character Error Rate (CER)
  - Intent Misclassification Rate
  - Disparity Index

**Slide 4: Results & Impact** ⚠️ FILL WITH REAL DATA
- Title: "Quantifying Inequity: The Numbers Don't Lie"
- Visual: 2 charts side-by-side
  - CER by accent group bar chart
  - Intent error rate by group
- Key findings (update with actual results):
  - "ESL speakers: 2.3× higher misrouting rate"
  - "Indian English: 18% higher error rate"
  - "Cost: 1 in 4 non-native speakers misrouted"

**Slide 5: Accountability & Public Trust**
- Title: "From Measurement to Action"
- Before/After comparison:

  **Before Benchmark:**
  - ❌ No equity visibility
  - ❌ Biased systems deployed unchecked
  - ❌ Millions underserved

  **After Benchmark:**
  - ✅ Transparent, reproducible metrics
  - ✅ Identify underserved groups
  - ✅ Guide model improvements
  - ✅ Regulatory compliance tool
  - ✅ Public trust through accountability

- Call to action: "Adopt ASR Equity Benchmarking for Fairer AI"
- Contact/GitHub link

**Person 4: Rehearse 5-Minute Pitch**
- Practice timing (1 min per slide)
- Prepare answers to likely questions:
  - "Why this matters more than other fairness work?"
  - "How can companies use this benchmark?"
  - "What's next for this research?"

**Success Criteria:**
- ✅ Abstract < 250 words, compelling narrative
- ✅ 5 slides with clear visuals
- ✅ Team can deliver 5-min pitch smoothly

---

#### **Hour 6.5-7: Buffer & Submission**
**Team: All hands**

**Tasks:**
- Final testing of demo notebook (run all cells)
- Spell-check abstract and slides
- Export slides to PDF
- Prepare submission materials:
  - Abstract (text file)
  - Slide deck (PDF)
  - Demo link (GitHub repo or Colab notebook)
  - Video (optional, if time permits)
- Upload to Devpost by 4PM
- Backup all files to cloud storage

---

## Technical Stack (Finalized)

### Core Dependencies
```
# requirements.txt
openai-whisper==20230314
torch>=2.0.0
torchaudio>=2.0.0
transformers>=4.30.0
datasets>=2.14.0
pandas>=2.0.0
numpy>=1.24.0
matplotlib>=3.7.0
seaborn>=0.12.0
python-Levenshtein>=0.21.0
jiwer>=3.0.0  # optional, for WER
soundfile>=0.12.0
librosa>=0.10.0
jupyter>=1.0.0
ipython>=8.0.0
```

### Hardware Requirements
- **Minimum**: CPU (Whisper tiny model)
- **Recommended**: GPU (speeds up transcription 3-5×)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB for models + data

---

## Directory Structure (Final)

```
SCAI-Duke-2026/
├── data/
│   ├── audio/                    # Pre-curated audio samples (50-100 files)
│   │   ├── us_001.wav
│   │   ├── indian_001.wav
│   │   └── ...
│   └── ground_truth.csv          # Labels: filename, accent, true_transcript, true_intent
│
├── models/
│   └── whisper/                  # Cached Whisper model weights
│
├── scripts/
│   ├── prepare_data.py           # Pre-hackathon: curate samples
│   ├── run_whisper.py            # ASR transcription pipeline
│   ├── classify_intent.py        # Keyword-based intent classification
│   ├── calculate_metrics.py      # CER, accuracy, disparity index
│   └── visualize.py              # Generate charts
│
├── results/
│   ├── transcripts.csv           # Whisper outputs
│   ├── intents.csv               # Intent predictions + metrics
│   └── metrics.json              # Aggregated statistics
│
├── visualizations/
│   ├── cer_by_accent.png
│   ├── intent_errors.png
│   └── disparity_heatmap.png
│
├── demo/
│   └── demo.ipynb                # Jupyter notebook demo
│
├── deliverables/
│   ├── abstract.txt              # 250-word abstract
│   ├── slides.pdf                # 5-slide deck
│   └── pitch_script.md           # Speaking notes
│
├── .gitignore
├── requirements.txt
├── README.md
├── PLAN.md                       # This file
├── BUGS.md
└── ADJUSTMENT.md
```

---

## Key Advantages (Maintained from Original)

- ✅ **Rigorous**: Systematic measurement with clear metrics
- ✅ **Creative**: Novel application to customer support equity
- ✅ **Realistic**: Achievable in 7 hours with simplifications
- ✅ **Impactful**: Measurable societal harm (service denial)
- ✅ **Transparent**: Open-source data & models
- ✅ **Compelling**: Strong narrative for judges (audio demo!)
- ✅ **Defensible**: Clear methodology, reproducible results

---

## Critical Success Factors

### Must-Have for Demo:
1. **Working transcription pipeline** (50+ samples processed)
2. **Intent classification** (even if simple keyword-based)
3. **3 core metrics calculated** (CER, intent accuracy, disparity index)
4. **2-3 visualizations** (bar charts minimum)
5. **Jupyter demo** with side-by-side examples
6. **5-slide deck** with results
7. **<250 word abstract**

### Nice-to-Have (Stretch Goals):
- Compare Whisper tiny vs base model
- Add background noise to samples
- Zero-shot intent classification
- Full WER calculation (vs CER)
- Interactive web demo

### Can Drop If Needed:
- Disparity heatmap (keep bar charts)
- Audio playback in demo (use screenshots)
- More than 3 accent groups
- Semantic similarity metrics

---

## Risk Mitigation & Emergency Fallbacks

### If Dataset Download Fails:
- Record team members speaking sample phrases with different accents
- Use text-to-speech (gTTS, Amazon Polly free tier)
- Reduce sample size to 30 clips minimum

### If Whisper Is Too Slow:
- Switch to Whisper "tiny" model (5× faster)
- Use Google Cloud Speech-to-Text API (free tier: 60min)
- Parallelize transcription across team member laptops

### If Intent Classification Fails:
- Simplify to pure transcription accuracy benchmark
- Manually classify a few examples for demo
- Focus on CER and disparity metrics only

### If Visualization Breaks:
- Use Excel/Google Sheets to create charts
- Show raw numbers in markdown tables
- Hand-draw charts if desperate (seriously!)

### If Time Runs Short:
- **Priority 1**: Get metrics calculated (raw numbers are enough)
- **Priority 2**: Create 2 simple charts (CER, intent errors)
- **Priority 3**: Side-by-side example comparison (even just text)
- **Priority 4**: Slides with placeholders for missing visuals

---

## Pre-Hackathon Checklist (DO NOW)

### Data Preparation (Person 1 - Due: Day before hackathon)
- [ ] Run `scripts/prepare_data.py` to curate 50-100 audio samples
- [ ] Organize files in `data/audio/` by accent group
- [ ] Test audio file integrity (play each one)

### Ground Truth Labels (Person 4 - Due: Day before hackathon)
- [ ] Create `data/ground_truth.csv` with complete labels
- [ ] Manually transcribe each audio file (true transcript)
- [ ] Assign true intent to each sample
- [ ] Verify CSV loads correctly in pandas

### Environment Setup (All - Due: Day before hackathon)
- [ ] Create `requirements.txt` with all dependencies
- [ ] Test installation on each team member's laptop
- [ ] Download Whisper model weights in advance
- [ ] Verify Python 3.9+ installed
- [ ] Test import of all libraries

### Code Templates (Person 2 & 3 - Due: Day before hackathon)
- [ ] Create script skeletons with function signatures
- [ ] Test Whisper transcription on 1 sample file
- [ ] Test intent classification on example text
- [ ] Verify matplotlib/seaborn work

### Communication Setup (All - Due: Day before hackathon)
- [ ] Set up Discord/Slack channel
- [ ] Create shared Google Doc for collaboration
- [ ] Set up GitHub repo (or shared Colab)
- [ ] Agree on hourly check-in schedule

### Deliverables Preparation (Person 4 - Due: Day before hackathon)
- [ ] Create 5-slide template in Google Slides
- [ ] Draft abstract outline (fill in during hackathon)
- [ ] Create Jupyter notebook skeleton
- [ ] Set up Devpost account

---

## Success Metrics (Post-Hackathon)

### Minimum Viable Demo:
- ✅ Transcribed 50+ audio samples
- ✅ Calculated CER and intent accuracy
- ✅ Generated 2 visualizations
- ✅ 5-slide deck with results
- ✅ Abstract submitted
- ✅ Devpost submission complete

### Strong Demo:
- ✅ All minimum requirements +
- ✅ Disparity Index quantified
- ✅ 3+ visualizations
- ✅ Jupyter notebook with audio playback
- ✅ 3-5 compelling failure examples
- ✅ Polished 5-min pitch

### Exceptional Demo:
- ✅ All strong demo requirements +
- ✅ Comparison of multiple Whisper models
- ✅ Zero-shot intent classification
- ✅ Interactive web demo
- ✅ Video walkthrough
- ✅ GitHub repo with documentation

---

## Final Notes

**Philosophy:**
- **Rigor through simplicity**: Keyword matching is transparent and defensible
- **Creativity in framing**: Customer support equity is novel angle on ASR bias
- **Impact over complexity**: Clear metrics beat fancy models

**Remember:**
- Start simple, add complexity only if time permits
- Judges care about **impact and presentation**, not just technical sophistication
- A working demo with compelling narrative beats a broken ambitious project
- Use your 7 hours wisely: 40% execution, 30% analysis, 30% presentation

**You got this! 🚀**
