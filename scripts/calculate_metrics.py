"""
Metrics Calculation Script
Calculates CER, intent accuracy, and disparity index for ASR equity evaluation

Usage:
    python scripts/calculate_metrics.py --input results/intents.csv --output results/metrics.json
"""

import argparse
import json
import pandas as pd
import Levenshtein


def calculate_cer(reference, hypothesis):
    """
    Calculate Character Error Rate using Levenshtein distance.
    More forgiving than WER for non-native speakers.

    Args:
        reference (str): True transcript
        hypothesis (str): ASR predicted transcript

    Returns:
        float: Character Error Rate (0-1, lower is better)
    """
    if pd.isna(reference) or pd.isna(hypothesis):
        return 1.0

    if len(reference) == 0:
        return 1.0 if len(hypothesis) > 0 else 0.0

    distance = Levenshtein.distance(reference.lower(), hypothesis.lower())
    return distance / len(reference)


def compute_cer_by_group(intents_df):
    """
    Calculate CER for each accent group

    Args:
        intents_df (pd.DataFrame): DataFrame with transcripts and labels

    Returns:
        pd.DataFrame: CER statistics by group
    """
    print(f"\nCalculating Character Error Rate (CER)...")

    # Calculate CER for each row
    intents_df["cer"] = intents_df.apply(
        lambda row: calculate_cer(row["true_transcript"], row["transcribed_text"]),
        axis=1
    )

    # Aggregate by accent group
    cer_by_group = intents_df.groupby("accent_group").agg({
        "cer": ["mean", "std", "min", "max"],
        "filename": "count"
    }).round(4)

    cer_by_group.columns = ["cer_mean", "cer_std", "cer_min", "cer_max", "sample_count"]

    print(f"\nCER by Accent Group:")
    print(cer_by_group)

    return cer_by_group


def compute_intent_accuracy(intents_df):
    """
    Calculate intent classification accuracy by group

    Args:
        intents_df (pd.DataFrame): DataFrame with intent predictions

    Returns:
        pd.DataFrame: Accuracy statistics by group
    """
    print(f"\nCalculating Intent Accuracy...")

    accuracy_by_group = intents_df.groupby("accent_group").agg({
        "intent_correct": ["mean", "sum", "count"]
    })

    accuracy_by_group.columns = ["accuracy", "correct_count", "total"]
    accuracy_by_group["accuracy"] = (accuracy_by_group["accuracy"] * 100).round(2)
    accuracy_by_group["error_rate"] = (100 - accuracy_by_group["accuracy"]).round(2)

    print(f"\nIntent Accuracy by Accent Group:")
    print(accuracy_by_group)

    return accuracy_by_group


def compute_disparity_index(intents_df, baseline_group="US"):
    """
    Calculate Disparity Index = error_rate(group) / error_rate(baseline)
    Values > 1 indicate worse performance than baseline

    Args:
        intents_df (pd.DataFrame): DataFrame with intent correctness
        baseline_group (str): Baseline accent group (default: US)

    Returns:
        pd.DataFrame: Disparity index by group
    """
    print(f"\nCalculating Disparity Index (baseline: {baseline_group})...")

    # Calculate error rates
    error_rates = intents_df.groupby("accent_group").agg({
        "intent_correct": lambda x: (1 - x.mean()) * 100  # error rate as percentage
    }).rename(columns={"intent_correct": "error_rate"})

    # Get baseline error rate
    if baseline_group not in error_rates.index:
        print(f"⚠️  Warning: Baseline group '{baseline_group}' not found. Using first group.")
        baseline_group = error_rates.index[0]

    baseline_error = error_rates.loc[baseline_group, "error_rate"]

    if baseline_error == 0:
        print(f"⚠️  Warning: Baseline error rate is 0. Setting to 0.01 to avoid division by zero.")
        baseline_error = 0.01

    # Calculate disparity index
    error_rates["disparity_index"] = (error_rates["error_rate"] / baseline_error).round(2)

    print(f"\nDisparity Index (baseline: {baseline_group}):")
    print(error_rates)

    return error_rates


def find_failure_examples(intents_df, num_examples=5):
    """
    Find clear examples of transcription/intent failures for demo

    Args:
        intents_df (pd.DataFrame): DataFrame with all results
        num_examples (int): Number of examples to find

    Returns:
        tuple: (failures, successes) DataFrames
    """
    print(f"\nFinding illustrative examples...")

    # Find failures with high CER
    failures = intents_df[
        (intents_df["intent_correct"] == False) &
        (intents_df["cer"] > 0.2)
    ].sort_values("cer", ascending=False).head(num_examples)

    # Find successes for comparison
    successes = intents_df[
        (intents_df["intent_correct"] == True) &
        (intents_df["cer"] < 0.1)
    ].head(num_examples)

    print(f"\n{'='*70}")
    print(f"FAILURE EXAMPLES (High CER, Wrong Intent)")
    print(f"{'='*70}")
    for _, row in failures.iterrows():
        print(f"\nFile: {row['filename']} ({row['accent_group']})")
        print(f"  True:     '{row['true_transcript']}'")
        print(f"  Whisper:  '{row['transcribed_text']}'")
        print(f"  Intent:   {row['true_intent']} → {row['predicted_intent']} ❌")
        print(f"  CER:      {row['cer']:.1%}")

    print(f"\n{'='*70}")
    print(f"SUCCESS EXAMPLES (Low CER, Correct Intent)")
    print(f"{'='*70}")
    for _, row in successes.iterrows():
        print(f"\nFile: {row['filename']} ({row['accent_group']})")
        print(f"  True:     '{row['true_transcript']}'")
        print(f"  Whisper:  '{row['transcribed_text']}'")
        print(f"  Intent:   {row['true_intent']} → {row['predicted_intent']} ✅")
        print(f"  CER:      {row['cer']:.1%}")

    return failures, successes


def save_metrics_json(cer_by_group, accuracy_by_group, disparity_df, output_path):
    """
    Save all metrics to JSON file for easy loading

    Args:
        cer_by_group (pd.DataFrame): CER statistics
        accuracy_by_group (pd.DataFrame): Accuracy statistics
        disparity_df (pd.DataFrame): Disparity index
        output_path (str): Output JSON file path
    """
    metrics = {
        "cer_by_group": cer_by_group.to_dict(),
        "accuracy_by_group": accuracy_by_group.to_dict(),
        "disparity_index": disparity_df.to_dict()
    }

    with open(output_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n✅ Metrics saved to: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Calculate equity metrics for ASR benchmark"
    )
    parser.add_argument(
        "--input",
        type=str,
        default="results/intents.csv",
        help="Input CSV with intent classification results"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="results/metrics.json",
        help="Output JSON file for metrics"
    )
    parser.add_argument(
        "--baseline",
        type=str,
        default="US",
        help="Baseline accent group for disparity calculation"
    )

    args = parser.parse_args()

    print(f"\n{'='*70}")
    print(f"ASR Equity Metrics Calculation")
    print(f"{'='*70}")
    print(f"Input: {args.input}")
    print(f"Output: {args.output}")

    # Load data
    intents_df = pd.read_csv(args.input)
    print(f"\nLoaded {len(intents_df)} samples")

    # Calculate metrics
    cer_by_group = compute_cer_by_group(intents_df)
    accuracy_by_group = compute_intent_accuracy(intents_df)
    disparity_df = compute_disparity_index(intents_df, baseline_group=args.baseline)

    # Find examples
    find_failure_examples(intents_df)

    # Save metrics
    save_metrics_json(cer_by_group, accuracy_by_group, disparity_df, args.output)

    # Overall summary
    print(f"\n{'='*70}")
    print(f"SUMMARY")
    print(f"{'='*70}")
    print(f"Total samples: {len(intents_df)}")
    print(f"Accent groups: {len(intents_df['accent_group'].unique())}")
    print(f"Overall CER: {intents_df['cer'].mean():.1%}")
    print(f"Overall intent accuracy: {intents_df['intent_correct'].mean()*100:.1f}%")
    print(f"Max disparity: {disparity_df['disparity_index'].max():.2f}×")


if __name__ == "__main__":
    main()
