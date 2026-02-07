# ADJUSTMENT.md

**Purpose**: This file documents the adjustments made to the original plan to ensure realistic execution within the 7-hour hackathon timeframe. Review and approve these changes before updating PLAN.md.

---

## Executive Summary

The original plan is **technically sound but overly ambitious** for a 7-hour hackathon with high schoolers. Key adjustments focus on:
- **Simplifying data preparation** (pre-select samples, avoid full dataset downloads)
- **Using pre-built components** where possible (pre-trained classifiers, simpler metrics)
- **Clear division of labor** for 4 team members
- **Built-in buffer time** for debugging and unexpected issues
- **Focus on demo impact** over technical completeness

---

## Critical Risk Analysis

### ⚠️ HIGH-RISK ITEMS (from original plan)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dataset download/processing (500GB+ Common Voice) | 1-3 hours | Pre-select 50-100 audio samples before hackathon |
| Training intent classifier from scratch | 1-2 hours + debugging | Use zero-shot classification or simple keyword matching |
| GPU availability/setup | 30min - 2 hours | Use Whisper "tiny" or "base" model (CPU-friendly) |
| Team coordination overhead | Ongoing | Clear roles + hourly checkpoints |
| Dependency installation issues | 30min - 1 hour | Pre-create requirements.txt and test environment |

---

## Adjusted Timeline (7 Hours Total)

### Realistic 7-Hour Breakdown with 4-Person Team

| Time Block | Duration | Activities | Team Assignment |
|------------|----------|------------|-----------------|
| **Hour 0-1** | 1h | **Setup & Data Prep** | All hands |
| | | - Environment setup (Python, libraries) | Person 1 & 2 |
| | | - Download pre-selected audio samples (20-50 clips) | Person 3 |
| | | - Create ground truth labels (accent type, correct intent) | Person 4 |
| **Hour 1-2.5** | 1.5h | **ASR Transcription** | Person 1 & 2 |
| | | - Run Whisper on all samples | |
| | | - Store results in structured format (CSV/JSON) | |
| | | **Intent Classification Setup** | Person 3 & 4 |
| | | - Set up simple rule-based or zero-shot classifier | |
| | | - Define intent keywords/patterns | |
| **Hour 2.5-4** | 1.5h | **Metrics & Analysis** | Split work |
| | | - Calculate WER per accent group | Person 1 |
| | | - Calculate intent accuracy | Person 2 |
| | | - Compute Disparity Index | Person 3 |
| | | - Find illustrative failure examples | Person 4 |
| **Hour 4-5.5** | 1.5h | **Visualization & Demo** | Split work |
| | | - Create bar charts, heatmaps | Person 1 & 2 |
| | | - Build demo interface/notebook | Person 3 |
| | | - Prepare example comparisons | Person 4 |
| **Hour 5.5-6.5** | 1h | **Slides & Abstract** | All hands |
| | | - Draft abstract (250 words) | Person 1 |
| | | - Create 5-slide deck | Person 2 & 3 |
| | | - Rehearse 5-min pitch | Person 4 |
| **Hour 6.5-7** | 0.5h | **Buffer & Submission** | All hands |
| | | - Final testing | |
| | | - Upload to Devpost | |
| | | - Backup files | |

**Note**: This includes built-in slack time. Original plan had 6-8 hours of work compressed into 7 hours.

---

## Detailed Adjustments by Section

### 1. Data Preparation - **MAJOR SIMPLIFICATION**

#### ❌ Original Plan Issues
- Full dataset download (Mozilla Common Voice: 500GB+)
- Generating synthetic audio with TTS
- Processing thousands of samples

#### ✅ Adjusted Approach

**Pre-Hackathon (Do This NOW):**
1. Curate **50-100 pre-selected audio clips** from:
   - Mozilla Common Voice (10-20 clips per accent group)
   - Use Hugging Face streaming API to avoid full download
   - Focus on 4-5 accent groups max:
     - US English (baseline)
     - Indian English
     - Spanish-accented English
     - East Asian-accented English
     - UK English (optional)

2. Create a **ground truth CSV** with:
   ```csv
   filename,accent_group,true_transcript,true_intent,speaker_metadata
   clip001.wav,US,I want to pay my bill,pay_bill,native
   clip002.wav,Indian,I need to reset password,reset_password,ESL
   ```

**During Hackathon:**
- Load pre-curated samples (5 minutes)
- No TTS generation (cut this entirely)
- No background noise injection (optional enhancement only if time permits)

**Code to Pre-Select Data:**
```python
# Run this BEFORE hackathon
from datasets import load_dataset
import pandas as pd

# Stream dataset instead of downloading all
ds = load_dataset("mozilla-foundation/common_voice_13_0", "en", split="test", streaming=True)

samples = []
accent_counts = {"us": 0, "indian": 0, "other": 0}
target = 20  # per group

for item in ds:
    accent = item.get("accent", "other")
    if accent_counts.get(accent, 0) < target:
        samples.append(item)
        accent_counts[accent] = accent_counts.get(accent, 0) + 1

    if sum(accent_counts.values()) >= 100:
        break

# Save samples
pd.DataFrame(samples).to_csv("curated_samples.csv")
```

---

### 2. Model Setup - **SIMPLIFIED**

#### ❌ Original Plan Issues
- Ambiguous model size choice
- GPU dependency unclear
- No fallback for slow transcription

#### ✅ Adjusted Approach

**Use Whisper "tiny" or "base" model:**
- **tiny**: 39M parameters, CPU-friendly, ~5-10s per 30s audio
- **base**: 74M parameters, acceptable on CPU, ~10-20s per 30s audio
- Avoid "small/medium/large" unless GPU confirmed available

**Setup Script:**
```python
import whisper
import time

# Use tiny model for speed
model = whisper.load_model("tiny")

results = []
for audio_file in audio_files:
    start = time.time()
    result = model.transcribe(audio_file)
    results.append({
        "file": audio_file,
        "transcript": result["text"],
        "time": time.time() - start
    })
    print(f"Processed {audio_file} in {results[-1]['time']:.2f}s")
```

**Estimated Time**: 50 clips × 10s = ~8-10 minutes transcription time

---

### 3. Intent Classification - **MAJOR SIMPLIFICATION**

#### ❌ Original Plan Issues
- Training a neural network classifier (1-2 hours)
- Requires labeled training data
- BERT embeddings add complexity

#### ✅ Adjusted Approach - THREE OPTIONS (pick one):

**OPTION A: Simple Keyword Matching (RECOMMENDED for time constraint)**
```python
def classify_intent(transcript):
    transcript = transcript.lower()

    if any(word in transcript for word in ["pay", "bill", "payment", "charge"]):
        return "pay_bill"
    elif any(word in transcript for word in ["reset", "password", "login", "access"]):
        return "reset_password"
    elif any(word in transcript for word in ["outage", "down", "not working", "broken"]):
        return "report_outage"
    elif any(word in transcript for word in ["account", "information", "details", "status"]):
        return "account_info"
    else:
        return "unknown"
```
- **Pros**: 5 minutes to implement, no dependencies, transparent
- **Cons**: Less sophisticated (but good enough for demo!)

**OPTION B: Zero-Shot Classification (if time permits)**
```python
from transformers import pipeline

classifier = pipeline("zero-shot-classification",
                      model="facebook/bart-large-mnli")

labels = ["pay bill", "reset password", "report outage", "account information"]
result = classifier(transcript, labels)
predicted_intent = result["labels"][0]
```
- **Pros**: More sophisticated, no training needed
- **Cons**: Slower, requires transformers library

**OPTION C: Pre-trained Sentence Similarity**
Use sentence-transformers to compare transcripts to intent templates
- **Pros**: Handles paraphrasing well
- **Cons**: Added complexity

**RECOMMENDED**: Start with Option A, upgrade to B if time permits

---

### 4. Metrics - **STREAMLINED**

#### ❌ Original Plan Issues
- WER calculation is complex (need alignment library)
- Semantic Loss with LLM adds API costs/time

#### ✅ Adjusted Approach

**MUST-HAVE Metrics** (implement these):
1. **Simple Character Error Rate (CER)** instead of WER:
   ```python
   import Levenshtein

   def calculate_cer(reference, hypothesis):
       return Levenshtein.distance(reference, hypothesis) / len(reference)
   ```

2. **Intent Accuracy**:
   ```python
   intent_accuracy = (correct_predictions / total_predictions) * 100
   ```

3. **Disparity Index**:
   ```python
   DI = error_rate_ESL / error_rate_native
   ```

**NICE-TO-HAVE** (if time permits):
- Full WER using `jiwer` library
- Semantic similarity using sentence-transformers

**Drop Entirely**:
- LLM-based semantic correctness (too slow, costs money)

---

### 5. Visualization - **FOCUSED**

#### ✅ Adjusted Approach

**Create exactly 3 visualizations** (using matplotlib/seaborn):

1. **Bar Chart: Error Rate by Accent Group**
   ```python
   import matplotlib.pyplot as plt
   import seaborn as sns

   sns.barplot(x="accent_group", y="error_rate", data=results_df)
   plt.title("Transcription Error Rate by Accent")
   plt.ylabel("Character Error Rate (%)")
   plt.savefig("error_by_accent.png")
   ```

2. **Bar Chart: Intent Misclassification by Group**
   ```python
   sns.barplot(x="accent_group", y="intent_error_rate", data=results_df)
   plt.title("Intent Classification Errors by Accent")
   plt.ylabel("Misclassification Rate (%)")
   plt.savefig("intent_errors.png")
   ```

3. **Summary Table** (for slides):
   ```python
   summary = results_df.groupby("accent_group").agg({
       "error_rate": "mean",
       "intent_accuracy": "mean",
       "sample_count": "count"
   })
   print(summary.to_markdown())  # Copy to slides
   ```

**Skip**:
- Complex heatmaps (unless very easy with seaborn)
- Interactive visualizations
- Animation

---

### 6. Demo Preparation - **STREAMLINED**

#### ✅ Adjusted Approach

**Create a Jupyter Notebook Demo** with 3 cells:

**Cell 1: Side-by-Side Comparison**
```python
examples = [
    {
        "accent": "US English",
        "audio": "clip_us_001.wav",
        "true": "I want to pay my bill",
        "transcribed": "I want to pay my bill",
        "true_intent": "pay_bill",
        "predicted_intent": "pay_bill",
        "status": "✅ Correct"
    },
    {
        "accent": "Indian English",
        "audio": "clip_indian_003.wav",
        "true": "I want to pay my bill",
        "transcribed": "I went to pay my deal",
        "true_intent": "pay_bill",
        "predicted_intent": "unknown",
        "status": "❌ Misrouted"
    }
]

display_comparison_table(examples)
```

**Cell 2: Play Audio + Show Transcript**
```python
from IPython.display import Audio, display

for ex in examples:
    print(f"\n{ex['accent']}:")
    display(Audio(ex['audio']))
    print(f"True: {ex['true']}")
    print(f"Whisper: {ex['transcribed']}")
    print(f"Intent: {ex['predicted_intent']} ({ex['status']})")
```

**Cell 3: Show Metrics Charts**
```python
from IPython.display import Image
display(Image("error_by_accent.png"))
display(Image("intent_errors.png"))
```

---

### 7. Slide Deck - **5-SLIDE TEMPLATE**

#### ✅ Pre-Made Structure (just fill in results)

**Slide 1: Problem Statement**
- Title: "Customer Support ASR Equity Benchmark"
- Subtitle: "Measuring AI Bias in Voice Customer Service"
- Hook: "When you call customer support, does your accent determine if you get help?"

**Slide 2: The Issue**
- Visual: Split screen of two callers (native vs ESL)
- Statistics: "37% of US population speaks with non-native accent"
- Impact: Misrouted calls → delayed service → frustration → inequity

**Slide 3: Our Benchmark**
- Dataset: Mozilla Common Voice (X clips, Y accent groups)
- Model: OpenAI Whisper ASR
- Metrics: Error rate, Intent accuracy, Disparity Index
- Pipeline diagram: Audio → ASR → Intent Classifier → Routing Decision

**Slide 4: Results** ⚠️ FILL DURING HACKATHON
- Chart: Error rate by accent group
- Chart: Intent misclassification rate
- Key finding: "ESL speakers experience 2.3× higher misrouting rate"
- Example: Side-by-side transcript comparison

**Slide 5: Impact & Accountability**
- **Before benchmark**: Companies unaware of disparities
- **After benchmark**:
  - Transparent, reproducible equity metrics
  - Identify which groups are underserved
  - Guide model fine-tuning priorities
  - Regulatory compliance tool
- Call to action: "Adopt ASR Equity Benchmarking for fairer AI"

---

## Team Role Assignments (CRITICAL for 4-person team)

### 👤 Person 1: Data & ASR Lead
**Responsibilities:**
- Pre-hackathon: Curate audio samples, create ground truth CSV
- Hour 0-1: Set up environment, load data
- Hour 1-2.5: Run Whisper transcription pipeline
- Hour 2.5-4: Calculate CER/WER metrics
- Hour 4-5.5: Create error rate visualizations
- Hour 5.5-6.5: Write abstract

### 👤 Person 2: Metrics & Analysis Lead
**Responsibilities:**
- Pre-hackathon: Research WER calculation methods
- Hour 0-1: Install dependencies (jiwer, Levenshtein)
- Hour 1-2.5: Help with transcription, prepare data structures
- Hour 2.5-4: Calculate intent accuracy and Disparity Index
- Hour 4-5.5: Create intent error visualizations
- Hour 5.5-6.5: Create slides 2-3

### 👤 Person 3: Intent Classification & Demo Lead
**Responsibilities:**
- Pre-hackathon: Define intent categories and keywords
- Hour 0-1: Set up intent classifier (keyword or zero-shot)
- Hour 1-2.5: Implement and test intent classification
- Hour 2.5-4: Find illustrative failure examples
- Hour 4-5.5: Build Jupyter notebook demo
- Hour 5.5-6.5: Create slides 4-5

### 👤 Person 4: Documentation & Integration Lead
**Responsibilities:**
- Pre-hackathon: Create ground truth labels
- Hour 0-1: Document setup instructions
- Hour 1-2.5: Assist with data labeling and QA
- Hour 2.5-4: Aggregate results from all team members
- Hour 4-5.5: Prepare demo examples and test run
- Hour 5.5-6.5: Create slide 1, rehearse pitch

**Communication Protocol:**
- Checkpoint every hour (5 min stand-up)
- Shared Google Doc for real-time collaboration
- GitHub repo for code (or shared Colab notebook)

---

## Alternative Proposal Options

Since you asked for multiple options to choose from, here are 2 additional simplified proposals:

### 🔄 OPTION 2: Loan Approval Fairness Benchmark

**Concept**: Measure how ML loan approval models discriminate based on demographic features

**Societal Impact**:
- Financial inclusion for underrepresented groups
- Transparency in lending decisions

**Datasets**:
- HMDA (Home Mortgage Disclosure Act) public data
- German Credit Dataset

**Model**:
- Train simple logistic regression or XGBoost on loan data
- Measure approval rate disparity across race/gender/age groups

**Metrics**:
- Approval rate by demographic
- False negative rate (denied but would repay)
- Disparity Index = (approval_rate_minority / approval_rate_majority)

**Benchmark Value**:
- Show how models perpetuate historical bias
- Propose fairness constraints (equal opportunity, demographic parity)

**7-Hour Feasibility**: ⭐⭐⭐⭐ (High - simpler than ASR)

**Pros**:
- Easier data processing (tabular, not audio)
- Faster model training
- Clear societal harm

**Cons**:
- Less novel (fairness in lending is well-studied)
- Data might be harder to interpret for high schoolers

---

### 🔄 OPTION 3: Image Captioning Bias Benchmark (Age & Gender)

**Concept**: Measure how AI image captioning models describe people differently based on age/gender

**Societal Impact**:
- Combat ageism and sexism in AI-generated content
- Improve accessibility tools (screen readers for blind users)

**Datasets**:
- COCO Captions (diverse images)
- FairFace (annotated for age/gender/race)

**Model**:
- Use pre-trained BLIP or CLIP for image captioning
- No training needed!

**Metrics**:
- Sentiment analysis of captions (positive/negative/neutral)
- Word frequency by demographic (e.g., "old" vs "elderly" vs "senior")
- Stereotype detection (e.g., "woman cooking" vs "woman CEO")

**Benchmark Value**:
- Quantify stereotyping in AI vision systems
- Guide caption model improvements

**7-Hour Feasibility**: ⭐⭐⭐⭐⭐ (Very High - no model training!)

**Pros**:
- Very fast (pre-trained models)
- Visually engaging demo
- Clear examples of bias

**Cons**:
- Less direct real-world harm than ASR or loans
- May need careful framing to avoid trivializing

---

## Recommendation

**STICK WITH OPTION 1 (ASR Equity Benchmark)** because:
1. ✅ Novel and timely (voice AI is exploding)
2. ✅ Clear, measurable harm (service denial)
3. ✅ Great demo potential (play audio clips)
4. ✅ Strong narrative for judges
5. ✅ With adjustments, achievable in 7 hours

**BUT** apply the simplifications in this document:
- Pre-curate data
- Use keyword-based intent classification
- Focus on 3 core metrics
- Limit visualizations
- Clear team roles

---

## Pre-Hackathon Checklist (DO THESE NOW)

- [ ] **Person 1**: Curate 50-100 audio clips from Common Voice
- [ ] **Person 1**: Create `data/audio/` folder with organized clips
- [ ] **Person 4**: Create `ground_truth.csv` with labels
- [ ] **Person 2**: Create `requirements.txt`:
  ```
  openai-whisper
  torch
  pandas
  numpy
  matplotlib
  seaborn
  python-Levenshtein
  jiwer
  transformers  # optional, for zero-shot
  ```
- [ ] **All**: Test environment setup on each person's laptop
- [ ] **Person 3**: Draft intent keyword dictionary
- [ ] **Person 4**: Create slide template (5 slides)
- [ ] **All**: Agree on communication method (Discord/Slack + shared doc)

---

## Success Criteria

By end of 7 hours, you MUST have:
- ✅ 50+ audio clips transcribed by Whisper
- ✅ Intent classification running (even if simple keyword matching)
- ✅ 3 core metrics calculated (error rate, intent accuracy, disparity index)
- ✅ 2-3 visualizations (bar charts)
- ✅ 5-slide deck with results
- ✅ <250 word abstract
- ✅ Jupyter notebook demo with 2-3 examples
- ✅ Devpost submission uploaded

**Stretch Goals** (if time permits):
- Compare Whisper tiny vs base model
- Add background noise to some samples
- Zero-shot intent classification
- Full WER calculation

---

## Emergency Fallbacks

If things go wrong:

**If dataset download fails:**
- Use text-to-speech to generate synthetic audio on-the-fly
- Record yourselves speaking sample phrases with different accents

**If Whisper is too slow:**
- Use Google Cloud Speech-to-Text API (free tier: 60min/month)
- Switch to Whisper "tiny" model
- Reduce sample size to 30 clips

**If intent classification fails:**
- Fall back to pure transcription accuracy (still valid benchmark!)
- Manually label a few examples for the demo

**If visualizations are broken:**
- Use Excel/Google Sheets to create charts
- Show raw numbers in a table

---

## Final Recommendation

**APPROVE THESE ADJUSTMENTS** and update PLAN.md with:
1. Simplified data preparation strategy
2. Revised 7-hour timeline with team roles
3. Keyword-based intent classification (Option A)
4. Streamlined metrics (CER, intent accuracy, DI)
5. Pre-hackathon checklist
6. Emergency fallbacks

This gives you a **realistic shot at a working demo in 7 hours** while maintaining the core value proposition of the benchmark.

---

**Next Steps:**
1. Review this adjustment document
2. Approve or request changes
3. I will update PLAN.md with the approved adjustments
4. Begin pre-hackathon preparation immediately
