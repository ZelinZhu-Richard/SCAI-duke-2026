"""
Data Preparation Script for ASR Equity Benchmark
Run this BEFORE hackathon to curate audio samples from Mozilla Common Voice

Usage:
    python scripts/prepare_data.py --samples 20 --output data/audio
"""

import argparse
import os

# Fix for macOS torch_shm_manager permission error
# Must be set before importing datasets/torch
os.environ['HF_DATASETS_DISABLE_SHARED_MEMORY'] = '1'
os.environ['PYTORCH_ENABLE_MPS_FALLBACK'] = '1'

import torch
# Disable multiprocessing to avoid shared memory issues on macOS
torch.multiprocessing.set_sharing_strategy('file_system')

# macOS-specific fix: monkey-patch share_memory_() to be a no-op
# This prevents torch_shm_manager permission errors when HuggingFace datasets
# tries to create shared tensors in IterableDataset initialization
import platform
if platform.system() == 'Darwin':  # macOS only
    def share_memory_noop(self, *args, **kwargs):
        # On macOS, skip shared memory and return self to avoid permission errors
        return self
    torch.Tensor.share_memory_ = share_memory_noop
    torch.Storage.share_memory_ = lambda self, *args, **kwargs: self

from datasets import load_dataset
from datasets.data_files import EmptyDatasetError
import soundfile as sf
from tqdm import tqdm
try:
    from _python_version_check import ensure_python_3_12_12
except ModuleNotFoundError:
    from scripts._python_version_check import ensure_python_3_12_12


def _normalize(s):
    return str(s).strip().lower()


def _accent_match(accent_value, target_tokens):
    if accent_value is None:
        return False
    accent_norm = _normalize(accent_value)
    for token in target_tokens:
        if token and token in accent_norm:
            return True
    return False


def curate_samples(
    target_per_group=20,
    output_dir="data/audio",
    target_accents=None,
    dataset_name="MushanW/GLOBE",
    config_name=None,
    split="train",
    hf_token=None,
):
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
        # GLOBE accent strings are verbose; use substring tokens
        target_accents = ["american", "india", "australian", "canadian"]

    print(f"Starting data curation...")
    print(f"Dataset: {dataset_name}")
    print(f"Split: {split}")
    print(f"Target: {target_per_group} samples per accent group")
    print(f"Target accents: {target_accents}")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Load dataset in streaming mode
    print("\nLoading dataset (streaming mode)...")
    try:
        if config_name:
            ds = load_dataset(
                dataset_name,
                config_name,
                split=split,
                streaming=True,
                use_auth_token=hf_token if hf_token else None,
            )
        else:
            ds = load_dataset(
                dataset_name,
                split=split,
                streaming=True,
                use_auth_token=hf_token if hf_token else None,
            )
    except EmptyDatasetError as e:
        print("\n❌ Dataset appears to be empty.")
        print("   Try a different dataset name or check access permissions.")
        raise e
    except Exception as e:
        print("\n❌ Failed to load dataset.")
        print("   If you see auth or rate-limit errors, set HF_TOKEN in your environment.")
        raise e

    target_tokens = [_normalize(a) for a in target_accents]
    accent_counts = {accent: 0 for accent in target_accents}
    total_processed = 0

    print(f"\nProcessing samples...")
    for idx, item in tqdm(enumerate(ds), desc="Curating"):
        accent_value = item.get("accent", "other")
        if _accent_match(accent_value, target_tokens):
            # bucket by first matching token to keep counts consistent
            matched_token = next(t for t in target_tokens if t in _normalize(accent_value))
            count = accent_counts[matched_token]
            if count < target_per_group:
                # Save audio file
                filename = f"{matched_token}_{count:03d}.wav"
                filepath = os.path.join(output_dir, filename)

                try:
                    audio_array = item["audio"]["array"]
                    sampling_rate = item["audio"]["sampling_rate"]
                    sf.write(filepath, audio_array, sampling_rate)

                    accent_counts[matched_token] += 1
                    print(f"  Saved: {filename} (accent: {accent_value})")

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
        default=["american", "india", "australian", "canadian"],
        help="Target accent tokens (substring match, default: american india australian canadian)"
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default="MushanW/GLOBE",
        help="Hugging Face dataset name (default: MushanW/GLOBE)"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="",
        help="Dataset config name (leave empty for default)"
    )
    parser.add_argument(
        "--split",
        type=str,
        default="train",
        help="Dataset split to stream (default: train)"
    )
    parser.add_argument(
        "--hf_token",
        type=str,
        default=os.environ.get("HF_TOKEN", ""),
        help="Hugging Face token (optional). You can also set HF_TOKEN env var."
    )

    args = parser.parse_args()

    # Run curation
    curate_samples(
        target_per_group=args.samples,
        output_dir=args.output,
        target_accents=args.accents,
        dataset_name=args.dataset,
        config_name=args.config or None,
        split=args.split,
        hf_token=args.hf_token or None,
    )


if __name__ == "__main__":
    main()
