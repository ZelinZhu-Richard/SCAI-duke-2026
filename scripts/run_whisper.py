"""
Whisper ASR Transcription Script
Transcribes all audio files using OpenAI Whisper model

Usage:
    python scripts/run_whisper.py --model tiny --input data/audio --output results/transcripts.csv
"""

import argparse
import time
from pathlib import Path
import pandas as pd
import whisper
from tqdm import tqdm
try:
    from _python_version_check import ensure_python_3_12_12
except ModuleNotFoundError:
    from scripts._python_version_check import ensure_python_3_12_12


def transcribe_all(audio_dir, model_size="tiny", output_csv="results/transcripts.csv"):
    """
    Transcribe all audio files in a directory using Whisper

    Args:
        audio_dir (str): Directory containing audio files
        model_size (str): Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
        output_csv (str): Output CSV file path

    Returns:
        pd.DataFrame: DataFrame with transcription results
    """
    print(f"\n{'='*60}")
    print(f"Whisper ASR Transcription Pipeline")
    print(f"{'='*60}")
    print(f"Model: whisper-{model_size}")
    print(f"Input directory: {audio_dir}")
    print(f"Output file: {output_csv}")

    # Load Whisper model
    print(f"\nLoading Whisper model '{model_size}'...")
    start_load = time.time()
    model = whisper.load_model(model_size)
    print(f"Model loaded in {time.time() - start_load:.2f}s")

    # Get all audio files
    audio_path = Path(audio_dir)
    audio_files = list(audio_path.glob("*.wav")) + \
                  list(audio_path.glob("*.mp3")) + \
                  list(audio_path.glob("*.flac"))

    if not audio_files:
        print(f"\n❌ No audio files found in {audio_dir}")
        return None

    print(f"\nFound {len(audio_files)} audio files to transcribe")

    # Transcribe each file
    results = []
    total_time = 0

    for audio_file in tqdm(audio_files, desc="Transcribing"):
        start = time.time()

        try:
            # Transcribe
            result = model.transcribe(str(audio_file))

            transcription_time = time.time() - start
            total_time += transcription_time

            results.append({
                "filename": audio_file.name,
                "transcribed_text": result["text"].strip(),
                "language": result.get("language", "en"),
                "transcription_time": round(transcription_time, 2)
            })

            print(f"  ✓ {audio_file.name}: {transcription_time:.2f}s")

        except Exception as e:
            print(f"  ❌ Error transcribing {audio_file.name}: {e}")
            results.append({
                "filename": audio_file.name,
                "transcribed_text": "",
                "language": "",
                "transcription_time": 0
            })

    # Create DataFrame and save
    df = pd.DataFrame(results)
    # Ensure output directory exists
    Path(output_csv).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)

    # Summary statistics
    print(f"\n{'='*60}")
    print(f"Transcription Complete!")
    print(f"{'='*60}")
    print(f"Total files: {len(results)}")
    print(f"Successful: {len([r for r in results if r['transcribed_text']])} ")
    print(f"Failed: {len([r for r in results if not r['transcribed_text']])}")
    print(f"Total time: {total_time:.2f}s")
    print(f"Avg time per file: {total_time/len(results):.2f}s")
    print(f"\nResults saved to: {output_csv}")

    return df


def main():
    ensure_python_3_12_12()
    parser = argparse.ArgumentParser(
        description="Transcribe audio files using Whisper ASR"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="tiny",
        choices=["tiny", "base", "small", "medium", "large"],
        help="Whisper model size (default: tiny for speed)"
    )
    parser.add_argument(
        "--input",
        type=str,
        default="data/audio",
        help="Input directory with audio files (default: data/audio)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="results/transcripts.csv",
        help="Output CSV file (default: results/transcripts.csv)"
    )

    args = parser.parse_args()

    # Run transcription
    transcribe_all(
        audio_dir=args.input,
        model_size=args.model,
        output_csv=args.output
    )


if __name__ == "__main__":
    main()
