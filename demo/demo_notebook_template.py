"""
Demo Notebook Template for Jupyter
Convert this to .ipynb or copy cells into Jupyter

Save as: demo/demo.ipynb
"""

# %% [markdown]
# # Customer Support ASR Equity Benchmark - Live Demo
#
# ## Problem Statement
# When customers call support lines, does their accent determine if they get help?
#
# This benchmark measures how OpenAI Whisper ASR performs across different accent groups
# in customer support scenarios.

# %% [markdown]
# ## Setup

# %%
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from IPython.display import Audio, Image, display, HTML

# Load results
intents_df = pd.read_csv("../results/intents.csv")

print(f"Loaded {len(intents_df)} customer support call samples")
print(f"Accent groups: {intents_df['accent_group'].unique()}")

# %% [markdown]
# ## Example 1: Native Speaker (Success Case)

# %%
print("="*70)
print("EXAMPLE 1: Native Speaker - Correct Transcription & Routing")
print("="*70)

# Find a successful example
success_example = intents_df[
    (intents_df["accent_group"] == "US") &
    (intents_df["intent_correct"] == True)
].iloc[0]

print(f"\n📞 Call Details:")
print(f"   File: {success_example['filename']}")
print(f"   Accent: {success_example['accent_group']} ({success_example['speaker_type']})")
print(f"   Duration: {success_example.get('duration', 'N/A')}s")

print(f"\n📝 Transcription:")
print(f"   True:    '{success_example['true_transcript']}'")
print(f"   Whisper: '{success_example['transcribed_text']}'")

print(f"\n🎯 Intent Classification:")
print(f"   Expected: {success_example['true_intent']}")
print(f"   Predicted: {success_example['predicted_intent']} ✅")

print(f"\n📊 Metrics:")
print(f"   Character Error Rate: {success_example['cer']:.1%}")
print(f"   Status: Call correctly routed!")

# Play audio (if file exists)
try:
    display(Audio(f"../data/audio/{success_example['filename']}"))
except:
    print("   (Audio file not found)")

# %% [markdown]
# ## Example 2: ESL Speaker (Failure Case)

# %%
print("\n" + "="*70)
print("EXAMPLE 2: ESL Speaker - Transcription Error → Misrouted Call")
print("="*70)

# Find a failure example
failure_example = intents_df[
    (intents_df["intent_correct"] == False) &
    (intents_df["accent_group"] != "US")
].sort_values("cer", ascending=False).iloc[0]

print(f"\n📞 Call Details:")
print(f"   File: {failure_example['filename']}")
print(f"   Accent: {failure_example['accent_group']} ({failure_example['speaker_type']})")
print(f"   Duration: {failure_example.get('duration', 'N/A')}s")

print(f"\n📝 Transcription:")
print(f"   True:    '{failure_example['true_transcript']}'")
print(f"   Whisper: '{failure_example['transcribed_text']}'")
print(f"   ⚠️  Transcription errors detected!")

print(f"\n🎯 Intent Classification:")
print(f"   Expected: {failure_example['true_intent']}")
print(f"   Predicted: {failure_example['predicted_intent']} ❌")
print(f"   💥 Call misrouted to wrong department!")

if "predicted_intent_after" in failure_example:
    print(f"\n🛠️ After Benchmark (Post-Processing):")
    print(f"   Predicted: {failure_example['predicted_intent_after']}")
    if "intent_correct_after" in failure_example:
        status = "✅ Corrected" if failure_example["intent_correct_after"] else "❌ Still wrong"
        print(f"   Status: {status}")

print(f"\n📊 Metrics:")
print(f"   Character Error Rate: {failure_example['cer']:.1%}")
print(f"   Status: Service denied due to ASR failure")

# Play audio (if file exists)
try:
    display(Audio(f"../data/audio/{failure_example['filename']}"))
except:
    print("   (Audio file not found)")

# %% [markdown]
# ## Benchmark Results: Quantifying Inequity

# %%
print("\n" + "="*70)
print("BENCHMARK RESULTS")
print("="*70)

# Overall statistics
print(f"\n📊 Dataset Overview:")
print(f"   Total calls analyzed: {len(intents_df)}")
print(f"   Accent groups tested: {len(intents_df['accent_group'].unique())}")
print(f"   Overall intent accuracy (before): {intents_df['intent_correct'].mean()*100:.1f}%")
print(f"   Overall misrouting rate (before): {(1-intents_df['intent_correct'].mean())*100:.1f}%")
if "intent_correct_after" in intents_df.columns:
    print(f"   Overall intent accuracy (after):  {intents_df['intent_correct_after'].mean()*100:.1f}%")
    print(f"   Overall misrouting rate (after):  {(1-intents_df['intent_correct_after'].mean())*100:.1f}%")

# By accent group
print(f"\n📈 Performance by Accent Group:")
by_group = intents_df.groupby("accent_group").agg({
    "cer": "mean",
    "intent_correct": "mean",
    "filename": "count"
})
by_group.columns = ["Avg CER", "Intent Accuracy (Before)", "Sample Count"]
by_group["Avg CER"] = (by_group["Avg CER"] * 100).round(2)
by_group["Intent Accuracy (Before)"] = (by_group["Intent Accuracy (Before)"] * 100).round(2)

if "intent_correct_after" in intents_df.columns:
    by_group_after = intents_df.groupby("accent_group")["intent_correct_after"].mean() * 100
    by_group["Intent Accuracy (After)"] = by_group_after.round(2)

print(by_group.sort_values("Avg CER"))

# %% [markdown]
# ## Visualizations

# %%
# Display pre-generated charts
print("\n" + "="*70)
print("VISUALIZATIONS")
print("="*70)

try:
    print("\n1. Character Error Rate by Accent Group:")
    display(Image("../visualizations/cer_by_accent.png"))
except:
    print("   (Chart not found - run visualize.py first)")

try:
    print("\n2. Intent Misclassification Rate:")
    display(Image("../visualizations/intent_errors.png"))
except:
    print("   (Chart not found - run visualize.py first)")

try:
    print("\n3. Disparity Index Heatmap:")
    display(Image("../visualizations/disparity_heatmap.png"))
except:
    print("   (Chart not found - run visualize.py first)")

# %% [markdown]
# ## Key Findings

# %%
# Calculate key statistics
baseline_cer = intents_df[intents_df["accent_group"] == "US"]["cer"].mean()
worst_group = intents_df.groupby("accent_group")["cer"].mean().idxmax()
worst_cer = intents_df[intents_df["accent_group"] == worst_group]["cer"].mean()
disparity = worst_cer / baseline_cer

baseline_accuracy = intents_df[intents_df["accent_group"] == "US"]["intent_correct"].mean()
worst_accuracy_group = intents_df.groupby("accent_group")["intent_correct"].mean().idxmin()
worst_accuracy = intents_df[intents_df["accent_group"] == worst_accuracy_group]["intent_correct"].mean()

print("\n" + "="*70)
print("KEY FINDINGS")
print("="*70)

print(f"\n🔍 Transcription Accuracy (CER):")
print(f"   • Baseline (US English): {baseline_cer:.1%}")
print(f"   • Worst performing group: {worst_group} at {worst_cer:.1%}")
print(f"   • Disparity: {disparity:.2f}× higher error rate")

print(f"\n🎯 Intent Classification:")
print(f"   • Baseline accuracy: {baseline_accuracy*100:.1f}%")
print(f"   • Worst performing group: {worst_accuracy_group} at {worst_accuracy*100:.1f}%")
print(f"   • This means {(1-worst_accuracy)*100:.1f}% of {worst_accuracy_group} speakers are misrouted!")

if "intent_correct_after" in intents_df.columns:
    baseline_accuracy_after = intents_df[intents_df["accent_group"] == "US"]["intent_correct_after"].mean()
    worst_accuracy_group_after = intents_df.groupby("accent_group")["intent_correct_after"].mean().idxmin()
    worst_accuracy_after = intents_df[intents_df["accent_group"] == worst_accuracy_group_after]["intent_correct_after"].mean()
    print(f"\n🎯 Intent Classification (After Benchmark):")
    print(f"   • Baseline accuracy: {baseline_accuracy_after*100:.1f}%")
    print(f"   • Worst performing group: {worst_accuracy_group_after} at {worst_accuracy_after*100:.1f}%")
    print(f"   • Misrouting drops to {(1-worst_accuracy_after)*100:.1f}% for that group")

print(f"\n💡 Impact:")
print(f"   • Non-native speakers experience {disparity:.1f}× more transcription errors")
print(f"   • This leads to {(1-worst_accuracy)*100:.0f}% misrouting rate vs {(1-baseline_accuracy)*100:.0f}% for native speakers")
print(f"   • Result: Systematic service denial for millions of ESL speakers")

# %% [markdown]
# ## Accountability & Next Steps

# %%
print("\n" + "="*70)
print("FROM MEASUREMENT TO ACTION")
print("="*70)

print(f"\n✅ What this benchmark provides:")
print(f"   1. Transparent, reproducible equity metrics")
print(f"   2. Identification of underserved demographic groups")
print(f"   3. Quantified disparity (not just anecdotal evidence)")
print(f"   4. Actionable guidance for model improvements")
print(f"   5. Regulatory compliance tool for fair AI")

print(f"\n🔧 Recommended mitigations:")
print(f"   • Fine-tune Whisper on diverse accent datasets")
print(f"   • Implement confidence-based fallback to human agents")
print(f"   • Weight training data to oversample underrepresented accents")
print(f"   • Regular equity audits using this benchmark")

print(f"\n🌍 Public Trust:")
print(f"   By exposing systematic biases in voice AI, this benchmark")
print(f"   advances accountability and public trust in automated systems.")

# %%
print("\n✨ Demo complete! Thank you for watching.")
print("Questions? Check our GitHub repo or reach out to the team.")
