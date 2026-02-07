"""
Data Preparation Script for ASR Equity Benchmark
Run this BEFORE hackathon to curate audio samples from Mozilla Common Voice

Usage:
    python scripts/prepare_data.py --samples 20 --output data/audio
"""

import argparse
import os
from datasets import load_dataset
import soundfile as sf
from tqdm import tqdm
from scripts._python_version_check import ensure_python_3_12_12


def curate_samples(target_per_group=20, output_dir="data/audio", target_accents=None):
    """
    Curate audio samples from Mozilla Common Voice using streaming API
    to avoid downloading the entire dataset.

    Args:
        target_per_group (int): Number of samples per accent group
        output_dir (str): Directory to save audio files
        target_accents (list): List of target accents to collect

    Returns:
        dict: Counts of samples collected per accent
    """
    if target_accents is None:
        target_accents = ["us", "indian", "african", "england", "australia"]

    print(f"Starting data curation...")
    print(f"Target: {target_per_group} samples per accent group")
    print(f"Target accents: {target_accents}")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Load dataset in streaming mode
    print("\nLoading Mozilla Common Voice dataset (streaming mode)...")
    ds = load_dataset(
        "mozilla-foundation/common_voice_13_0",
        "en",
        split="test",
        streaming=True,
        trust_remote_code=True
    )

    accent_counts = {accent: 0 for accent in target_accents}
    total_processed = 0

    print(f"\nProcessing samples...")
    for idx, item in tqdm(enumerate(ds), desc="Curating"):
        accent = item.get("accent", "other")

        if accent in target_accents:
            count = accent_counts[accent]
            if count < target_per_group:
                # Save audio file
                filename = f"{accent}_{count:03d}.wav"
                filepath = os.path.join(output_dir, filename)

                try:
                    audio_array = item["audio"]["array"]
                    sampling_rate = item["audio"]["sampling_rate"]
                    sf.write(filepath, audio_array, sampling_rate)

                    accent_counts[accent] += 1
                    print(f"  Saved: {filename} (accent: {accent})")

                except Exception as e:
                    print(f"  Error saving {filename}: {e}")

        total_processed += 1

        # Stop if we've collected enough samples
        if all(count >= target_per_group for count in accent_counts.values()):
            break

        # Safety limit to avoid infinite loop
        if total_processed > 10000:
            print(f"\nProcessed {total_processed} items. Stopping.")
            break

    print(f"\n{'='*60}")
    print(f"Data curation complete!")
    print(f"{'='*60}")
    print(f"\nSamples collected:")
    for accent, count in accent_counts.items():
        print(f"  {accent:15s}: {count:3d} samples")
    print(f"\nTotal: {sum(accent_counts.values())} samples")
    print(f"Output directory: {output_dir}")

    return accent_counts


def main():
    ensure_python_3_12_12()
    parser = argparse.ArgumentParser(
        description="Curate audio samples for ASR Equity Benchmark"
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=20,
        help="Number of samples per accent group (default: 20)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="data/audio",
        help="Output directory for audio files (default: data/audio)"
    )
    parser.add_argument(
        "--accents",
        nargs="+",
        default=["us", "indian", "african", "england"],
        help="Target accent groups (default: us indian african england)"
    )

    args = parser.parse_args()

    # Run curation
    curate_samples(
        target_per_group=args.samples,
        output_dir=args.output,
        target_accents=args.accents
    )


if __name__ == "__main__":
    main()
