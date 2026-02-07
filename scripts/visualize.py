"""
Visualization Script
Creates publication-quality charts for ASR equity benchmark results

Usage:
    python scripts/visualize.py --input results/intents.csv --output visualizations/
"""

import argparse
import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import Levenshtein
try:
    from _python_version_check import ensure_python_3_12_12
except ModuleNotFoundError:
    from scripts._python_version_check import ensure_python_3_12_12

# Set style
sns.set_style("whitegrid")
sns.set_palette("Set2")
plt.rcParams['figure.dpi'] = 300


def calculate_cer(reference, hypothesis):
    if pd.isna(reference) or pd.isna(hypothesis):
        return 1.0
    if len(reference) == 0:
        return 1.0 if len(hypothesis) > 0 else 0.0
    distance = Levenshtein.distance(str(reference).lower(), str(hypothesis).lower())
    return distance / len(reference)


def coerce_bool(series):
    """
    Robust bool conversion for columns that may be bool, numeric, or strings.
    """
    lowered = series.astype(str).str.strip().str.lower()
    truthy = {"true", "1", "yes", "y"}
    falsy = {"false", "0", "no", "n"}
    coerced = lowered.map(lambda x: True if x in truthy else (False if x in falsy else None))
    if coerced.isna().any():
        # Fall back to pandas truthiness rules for any unmatched values
        coerced = series.astype(bool)
    return coerced


def create_cer_chart(intents_df, output_dir="visualizations"):
    """
    Bar chart: Character Error Rate by Accent Group

    Args:
        intents_df (pd.DataFrame): DataFrame with CER calculations
        output_dir (str): Output directory for chart
    """
    print("\nCreating CER by Accent Group chart...")

    # Calculate CER by group
    cer_by_group = intents_df.groupby("accent_group")["cer"].agg(["mean", "std"]).sort_values("mean")

    fig, ax = plt.subplots(figsize=(10, 6))

    groups = cer_by_group.index
    cer_means = cer_by_group["mean"] * 100
    cer_stds = (cer_by_group["std"] * 100).fillna(0).clip(lower=0)

    # Create bars
    bars = ax.bar(groups, cer_means, yerr=cer_stds, capsize=5,
                   color=sns.color_palette("Set2", len(groups)), alpha=0.8)

    # Styling
    ax.set_ylabel("Character Error Rate (%)", fontsize=14, fontweight="bold")
    ax.set_xlabel("Accent Group", fontsize=14, fontweight="bold")
    ax.set_title("ASR Transcription Accuracy by Accent Group\n(Lower is Better)",
                 fontsize=16, fontweight="bold", pad=20)

    # Add baseline reference line (assuming first group is baseline)
    baseline_cer = cer_means.iloc[0]
    ax.axhline(y=baseline_cer, color="red", linestyle="--", linewidth=2,
               label=f"Baseline ({groups[0]}): {baseline_cer:.1f}%", alpha=0.7)

    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{height:.1f}%', ha='center', va='bottom', fontsize=12, fontweight="bold")

    ax.legend(fontsize=12)
    cer_ymax = max(cer_means) * 1.2
    if cer_ymax <= 0:
        cer_ymax = 5
        ax.text(
            0.5, 0.95,
            "All CER values are 0%.",
            transform=ax.transAxes,
            ha="center", va="top", fontsize=10
        )
    ax.set_ylim(0, cer_ymax)
    plt.xticks(rotation=15, ha="right")
    plt.tight_layout()

    output_path = os.path.join(output_dir, "cer_by_accent.png")
    plt.savefig(output_path, dpi=300, bbox_inches="tight")
    print(f"  ✅ Saved: {output_path}")
    plt.close()


def create_intent_error_chart(intents_df, output_dir="visualizations"):
    """
    Bar chart: Intent Misclassification Rate by Group

    Args:
        intents_df (pd.DataFrame): DataFrame with intent correctness
        output_dir (str): Output directory for chart
    """
    print("\nCreating Intent Misclassification chart...")

    # Calculate error rates by group
    accuracy_by_group = intents_df.groupby("accent_group")["intent_correct"].mean() * 100
    error_rates = 100 - accuracy_by_group
    error_rates = error_rates.sort_values()

    fig, ax = plt.subplots(figsize=(10, 6))

    groups = error_rates.index
    values = error_rates.values

    # Create gradient color based on error rate
    colors = plt.cm.Reds_r(np.linspace(0.3, 0.9, len(groups)))
    bars = ax.bar(groups, values, color=colors, alpha=0.9)

    # Styling
    ax.set_ylabel("Intent Misclassification Rate (%)", fontsize=14, fontweight="bold")
    ax.set_xlabel("Accent Group", fontsize=14, fontweight="bold")
    ax.set_title("Customer Support Call Misrouting by Accent\n(Lower is Better)",
                 fontsize=16, fontweight="bold", pad=20)

    # Add value labels
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                f'{height:.1f}%', ha='center', va='bottom', fontsize=12, fontweight="bold")

    y_max = max(values) * 1.3
    if y_max <= 0:
        y_max = 5
        ax.text(
            0.5, 0.95,
            "All misclassification rates are 0%. Check intent labels if unexpected.",
            transform=ax.transAxes,
            ha="center", va="top", fontsize=10
        )
    ax.set_ylim(0, y_max)
    plt.xticks(rotation=15, ha="right")
    plt.tight_layout()

    output_path = os.path.join(output_dir, "intent_errors.png")
    plt.savefig(output_path, dpi=300, bbox_inches="tight")
    print(f"  ✅ Saved: {output_path}")
    plt.close()


def create_disparity_heatmap(intents_df, baseline_group="US", output_dir="visualizations"):
    """
    Heatmap showing disparity index

    Args:
        intents_df (pd.DataFrame): DataFrame with results
        baseline_group (str): Baseline accent group
        output_dir (str): Output directory for chart
    """
    print("\nCreating Disparity Index heatmap...")

    # Calculate error rates and disparity index
    error_rates = intents_df.groupby("accent_group").agg({
        "intent_correct": lambda x: (1 - x.mean()) * 100
    }).rename(columns={"intent_correct": "error_rate"})

    if baseline_group not in error_rates.index:
        baseline_group = error_rates.index[0]

    baseline_error = error_rates.loc[baseline_group, "error_rate"]
    if baseline_error == 0 and (error_rates["error_rate"] == 0).all():
        # All groups have perfect intent accuracy; represent equal disparity explicitly.
        error_rates["disparity_index"] = 1.0
    else:
        if baseline_error == 0:
            baseline_error = 0.01
        error_rates["disparity_index"] = error_rates["error_rate"] / baseline_error

    # Sort by disparity index
    error_rates = error_rates.sort_values("disparity_index")

    fig, ax = plt.subplots(figsize=(8, 6))

    # Reshape for heatmap
    heatmap_data = error_rates["disparity_index"].values.reshape(-1, 1)

    sns.heatmap(heatmap_data, annot=True, fmt=".2f", cmap="RdYlGn_r",
                yticklabels=error_rates.index, xticklabels=["Disparity Index"],
                cbar_kws={"label": "Disparity Index (higher = more bias)"},
                ax=ax, vmin=0.5, vmax=max(2.0, heatmap_data.max()),
                linewidths=2, linecolor="white", annot_kws={"fontsize": 14, "fontweight": "bold"})

    ax.set_title("ASR Equity Disparity Index\n(1.0 = equal to baseline, >1.0 = worse)",
                 fontsize=16, fontweight="bold", pad=20)
    ax.set_yticklabels(ax.get_yticklabels(), rotation=0, fontsize=12)
    ax.set_xlabel("")

    plt.tight_layout()

    output_path = os.path.join(output_dir, "disparity_heatmap.png")
    plt.savefig(output_path, dpi=300, bbox_inches="tight")
    print(f"  ✅ Saved: {output_path}")
    plt.close()


def create_combined_summary(intents_df, output_dir="visualizations"):
    """
    Create a combined summary figure with multiple subplots

    Args:
        intents_df (pd.DataFrame): DataFrame with all results
        output_dir (str): Output directory for chart
    """
    print("\nCreating combined summary figure...")

    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle("ASR Equity Benchmark: Complete Analysis", fontsize=18, fontweight="bold", y=0.995)

    # 1. CER by group
    ax1 = axes[0, 0]
    cer_by_group = intents_df.groupby("accent_group")["cer"].mean().sort_values() * 100
    cer_by_group.plot(kind="bar", ax=ax1, color=sns.color_palette("Set2", len(cer_by_group)))
    ax1.set_title("Character Error Rate by Accent", fontsize=14, fontweight="bold")
    ax1.set_ylabel("CER (%)", fontsize=12)
    ax1.set_xlabel("Accent Group", fontsize=12)
    ax1.tick_params(axis='x', rotation=45)

    # 2. Intent accuracy by group
    ax2 = axes[0, 1]
    accuracy_by_group = intents_df.groupby("accent_group")["intent_correct"].mean() * 100
    accuracy_by_group = accuracy_by_group.sort_values()
    accuracy_by_group.plot(kind="bar", ax=ax2, color=sns.color_palette("Greens", len(accuracy_by_group)))
    ax2.set_title("Intent Classification Accuracy", fontsize=14, fontweight="bold")
    ax2.set_ylabel("Accuracy (%)", fontsize=12)
    ax2.set_xlabel("Accent Group", fontsize=12)
    ax2.tick_params(axis='x', rotation=45)
    ax2.set_ylim(0, 100)

    # 3. Sample counts
    ax3 = axes[1, 0]
    sample_counts = intents_df["accent_group"].value_counts().sort_values()
    sample_counts.plot(kind="barh", ax=ax3, color=sns.color_palette("Blues", len(sample_counts)))
    ax3.set_title("Sample Distribution", fontsize=14, fontweight="bold")
    ax3.set_xlabel("Number of Samples", fontsize=12)
    ax3.set_ylabel("Accent Group", fontsize=12)

    # 4. Error distribution scatter
    ax4 = axes[1, 1]
    for group in intents_df["accent_group"].unique():
        group_data = intents_df[intents_df["accent_group"] == group]
        ax4.scatter(group_data["cer"] * 100,
                   group_data["intent_correct"].astype(int),
                   alpha=0.6, s=100, label=group)
    ax4.set_title("CER vs Intent Correctness", fontsize=14, fontweight="bold")
    ax4.set_xlabel("Character Error Rate (%)", fontsize=12)
    ax4.set_ylabel("Intent Correct", fontsize=12)
    ax4.set_yticks([0, 1])
    ax4.set_yticklabels(["Incorrect", "Correct"])
    ax4.legend()
    ax4.grid(alpha=0.3)

    plt.tight_layout()

    output_path = os.path.join(output_dir, "summary_dashboard.png")
    plt.savefig(output_path, dpi=300, bbox_inches="tight")
    print(f"  ✅ Saved: {output_path}")
    plt.close()


def main():
    ensure_python_3_12_12()
    parser = argparse.ArgumentParser(
        description="Create visualizations for ASR equity benchmark"
    )
    parser.add_argument(
        "--input",
        type=str,
        default="results/intents.csv",
        help="Input CSV with all results"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="visualizations",
        help="Output directory for charts"
    )
    parser.add_argument(
        "--baseline",
        type=str,
        default="US",
        help="Baseline accent group for disparity calculation"
    )

    args = parser.parse_args()

    print(f"\n{'='*70}")
    print(f"ASR Equity Benchmark Visualization")
    print(f"{'='*70}")
    print(f"Input: {args.input}")
    print(f"Output: {args.output}")

    # Create output directory
    os.makedirs(args.output, exist_ok=True)

    # Load data
    intents_df = pd.read_csv(args.input)
    print(f"\nLoaded {len(intents_df)} samples from {len(intents_df['accent_group'].unique())} accent groups")

    if "intent_correct" not in intents_df.columns:
        raise SystemExit("❌ Missing 'intent_correct' column; run classify_intent.py first.")
    intents_df["intent_correct"] = coerce_bool(intents_df["intent_correct"])

    # Ensure CER exists (compute if missing)
    if "cer" not in intents_df.columns:
        if "true_transcript" in intents_df.columns and "transcribed_text" in intents_df.columns:
            print("\nCER column missing; computing CER from transcripts...")
            intents_df["cer"] = intents_df.apply(
                lambda row: calculate_cer(row["true_transcript"], row["transcribed_text"]),
                axis=1
            )
        else:
            raise SystemExit("❌ Missing 'cer' and transcript columns; run calculate_metrics.py first.")

    # Create visualizations
    create_cer_chart(intents_df, args.output)
    create_intent_error_chart(intents_df, args.output)
    create_disparity_heatmap(intents_df, args.baseline, args.output)
    create_combined_summary(intents_df, args.output)

    print(f"\n{'='*70}")
    print(f"✅ All visualizations created successfully!")
    print(f"{'='*70}")
    print(f"Output directory: {args.output}")
    print(f"  - cer_by_accent.png")
    print(f"  - intent_errors.png")
    print(f"  - disparity_heatmap.png")
    print(f"  - summary_dashboard.png")


if __name__ == "__main__":
    main()
