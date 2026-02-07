"""
Intent Classification Script
Classifies customer support call intents using keyword matching

Usage:
    python scripts/classify_intent.py --transcripts results/transcripts.csv --ground_truth data/ground_truth.csv --output results/intents.csv
"""

import argparse
import pandas as pd


def classify_intent_keyword(transcript):
    """
    Simple, transparent, fast keyword matching.
    Good enough for demonstrating bias! No training needed.

    Args:
        transcript (str): Text transcript to classify

    Returns:
        str: Predicted intent category
    """
    if not transcript or pd.isna(transcript):
        return "unknown"

    transcript = transcript.lower()

    # Define intent patterns with keywords
    intents = {
        "pay_bill": [
            "pay", "bill", "payment", "charge", "invoice",
            "balance", "owe", "due", "amount", "cost"
        ],
        "reset_password": [
            "reset", "password", "login", "access", "forgot",
            "locked out", "unlock", "credential", "sign in", "log in"
        ],
        "report_outage": [
            "outage", "down", "not working", "broken", "offline",
            "internet", "service", "connection", "disconnected", "issue"
        ],
        "account_info": [
            "account", "information", "details", "status",
            "history", "profile", "data", "info", "check"
        ]
    }

    # Score each intent based on keyword matches
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

    Args:
        transcripts_csv (str): Path to Whisper transcription results
        ground_truth_csv (str): Path to ground truth labels
        output_csv (str): Output path for intent classification results

    Returns:
        pd.DataFrame: DataFrame with intent predictions and correctness
    """
    print(f"\n{'='*60}")
    print(f"Intent Classification Pipeline")
    print(f"{'='*60}")
    print(f"Method: Keyword-based classification")
    print(f"Transcripts: {transcripts_csv}")
    print(f"Ground truth: {ground_truth_csv}")
    print(f"Output: {output_csv}")

    # Load data
    print(f"\nLoading data...")
    transcripts = pd.read_csv(transcripts_csv)
    ground_truth = pd.read_csv(ground_truth_csv)

    print(f"Loaded {len(transcripts)} transcripts")
    print(f"Loaded {len(ground_truth)} ground truth labels")

    # Merge datasets
    print(f"\nMerging datasets on filename...")
    merged = transcripts.merge(ground_truth, on="filename", how="inner")
    print(f"Merged dataset: {len(merged)} samples")

    if len(merged) == 0:
        print(f"\n❌ No matching filenames found! Check your data.")
        return None

    # Classify transcribed text
    print(f"\nClassifying transcripts...")
    merged["predicted_intent"] = merged["transcribed_text"].apply(classify_intent_keyword)

    # Also classify true transcript for sanity check
    merged["true_intent_check"] = merged["true_transcript"].apply(classify_intent_keyword)

    # Mark correctness
    merged["intent_correct"] = merged["predicted_intent"] == merged["true_intent"]

    # Calculate basic stats
    accuracy = merged["intent_correct"].mean() * 100
    print(f"\n{'='*60}")
    print(f"Classification Results")
    print(f"{'='*60}")
    print(f"Overall Intent Accuracy: {accuracy:.2f}%")
    print(f"Correct: {merged['intent_correct'].sum()}")
    print(f"Incorrect: {(~merged['intent_correct']).sum()}")

    # Accuracy by accent group
    if "accent_group" in merged.columns:
        print(f"\nAccuracy by Accent Group:")
        by_group = merged.groupby("accent_group")["intent_correct"].mean() * 100
        for group, acc in by_group.items():
            print(f"  {group:15s}: {acc:6.2f}%")

    # Save results
    merged.to_csv(output_csv, index=False)
    print(f"\nResults saved to: {output_csv}")

    return merged


def main():
    parser = argparse.ArgumentParser(
        description="Classify customer support call intents"
    )
    parser.add_argument(
        "--transcripts",
        type=str,
        default="results/transcripts.csv",
        help="Path to Whisper transcription results CSV"
    )
    parser.add_argument(
        "--ground_truth",
        type=str,
        default="data/ground_truth.csv",
        help="Path to ground truth labels CSV"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="results/intents.csv",
        help="Output CSV file for intent classification results"
    )

    args = parser.parse_args()

    # Run classification
    classify_all(
        transcripts_csv=args.transcripts,
        ground_truth_csv=args.ground_truth,
        output_csv=args.output
    )


if __name__ == "__main__":
    main()
