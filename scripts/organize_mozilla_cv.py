"""
Organize Mozilla Common Voice downloaded data for ASR Equity Benchmark

Usage:
    python scripts/organize_mozilla_cv.py \
      --cv_dir ~/Downloads/cv-valid-test \
      --output data/audio \
      --samples 5
"""

import argparse
import pandas as pd
import shutil
from pathlib import Path
try:
    from _python_version_check import ensure_python_3_12_12
except ModuleNotFoundError:
    from scripts._python_version_check import ensure_python_3_12_12


SYNONYMS = {
    "US": ["us", "usa", "united states", "american"],
    "England": ["uk", "england", "british", "great britain"],
    "India": ["india", "indian"],
    "African": ["african", "africa"],
    "Australian": ["australian", "australia"],
    "Canadian": ["canadian", "canada"],
}
ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".m4a", ".ogg"}


def _normalize(s):
    return str(s).strip().lower()


def _canonical_group(token):
    token_norm = _normalize(token)
    for group, keys in SYNONYMS.items():
        if token_norm in keys:
            return group
    return token_norm.title()


def _build_group_tokens(tokens):
    groups = {}
    for t in tokens:
        group = _canonical_group(t)
        if group in SYNONYMS:
            groups[group] = set(SYNONYMS[group])
        else:
            groups.setdefault(group, set()).add(_normalize(t))
    return groups


def _choose_column(df, primary, fallback=None):
    if primary in df.columns:
        return primary
    if fallback and fallback in df.columns:
        return fallback
    return None


def organize_cv_data(
    cv_dir,
    output_dir,
    samples_per_accent=5,
    accent_tokens=None,
    accent_column="accent",
    fallback_accent_column="locale",
    text_column="sentence",
    path_column="path",
    total_samples=20,
    allow_no_metadata=True,
    metadata_csv=None,
    write_ground_truth=False,
):
    """
    Organize Mozilla Common Voice data by selecting samples per accent

    Args:
        cv_dir (str): Path to cv-valid-test directory
        output_dir (str): Output directory for organized audio files
        samples_per_accent (int): Number of samples to collect per accent

    Returns:
        dict: Counts of samples collected per accent
    """
    cv_path = Path(cv_dir).expanduser()
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Find metadata file
    metadata_file = None
    if metadata_csv:
        metadata_file = Path(metadata_csv).expanduser()
        if metadata_file.exists():
            print(f"Using metadata CSV: {metadata_file}")
        else:
            print(f"❌ Metadata CSV not found: {metadata_file}")
            metadata_file = None
    else:
        for name in ['validated.tsv', 'test.tsv', 'dev.tsv', 'train.tsv']:
            candidate = cv_path / name
            if candidate.exists():
                metadata_file = candidate
                print(f"Found metadata file: {metadata_file}")
                break

    gt_path = Path('data/ground_truth.csv' if write_ground_truth else 'data/ground_truth_template.csv')
    if write_ground_truth and gt_path.exists():
        print(f"⚠️  Overwriting existing: {gt_path}")

    if not metadata_file:
        print("❌ No metadata file found (validated.tsv, test.tsv, dev.tsv, train.tsv)")
        print(f"   Checked directory: {cv_path}")
        print(f"   Contents: {list(cv_path.glob('*'))[:10]}")

        if not allow_no_metadata:
            return {}

        print("\nFalling back to direct audio sampling (no metadata).")
        audio_files = sorted(
            list(cv_path.glob("*.wav")) +
            list(cv_path.glob("*.mp3")) +
            list(cv_path.glob("*.flac"))
        )

        if not audio_files:
            print("❌ No audio files found to copy.")
            return {}

        selected = audio_files[:total_samples]
        ground_truth_rows = []
        for i, src_audio in enumerate(selected):
            ext = src_audio.suffix.lower() or ".wav"
            new_filename = f"sample_{i:03d}{ext}"
            dst_audio = output_path / new_filename
            shutil.copy(src_audio, dst_audio)
            ground_truth_rows.append({
                'filename': new_filename,
                'accent_group': 'Unknown',
                'speaker_type': 'unknown',
                'true_transcript': '',
                'true_intent': 'unknown',
                'duration': 0
            })

        gt_df = pd.DataFrame(ground_truth_rows)
        gt_path.parent.mkdir(parents=True, exist_ok=True)
        gt_df.to_csv(gt_path, index=False)

        if write_ground_truth:
            template_path = Path('data/ground_truth_template.csv')
            if template_path.exists():
                template_path.unlink()

        print(f"\nCopied {len(selected)} files to {output_dir}")
        label = "ground truth file" if write_ground_truth else "ground truth template"
        print(f"Created {label}: {gt_path}")
        print("NOTE: You must fill in accent_group and true_transcript manually.")
        return {"Unknown": len(selected)}

    print(f"\nReading metadata from: {metadata_file}")
    sep = '\t' if metadata_file.suffix.lower() in ['.tsv'] else ','
    df = pd.read_csv(metadata_file, sep=sep)

    # Check what columns are available
    print(f"Available columns: {list(df.columns)}")
    print(f"Total rows: {len(df)}")

    # Determine columns to use
    accent_col = _choose_column(df, accent_column, fallback=fallback_accent_column)
    text_col = _choose_column(df, text_column, fallback="text")
    path_col = _choose_column(df, path_column, fallback="filename")

    if not accent_col:
        print("\n⚠️  No accent column found in metadata")
        print("   Tried:", accent_column, "and", fallback_accent_column)
        print("   Available columns:", list(df.columns))
        print("   This dataset may not have accent annotations.")
        return {}

    if not path_col:
        print("\n❌ No audio path column found in metadata")
        print("   Tried:", path_column, "and", "filename")
        print("   Available columns:", list(df.columns))
        return {}

    print(f"Using accent column: {accent_col}")
    print(f"Using text column: {text_col if text_col else 'N/A'}")
    print(f"Using path column: {path_col}")

    # Show accent distribution
    print(f"\nAccent distribution in dataset:")
    accent_counts_raw = df[accent_col].value_counts()
    print(accent_counts_raw.head(20))

    if accent_tokens is None:
        accent_tokens = ["us", "india", "african", "england"]

    group_tokens = _build_group_tokens(accent_tokens)

    accent_counts = {group: 0 for group in group_tokens.keys()}
    ground_truth_rows = []

    print(f"\n{'='*60}")
    print(f"Collecting {samples_per_accent} samples per accent group...")
    print(f"{'='*60}\n")

    for idx, row in df.iterrows():
        accent_value = str(row.get(accent_col, '')).lower().strip()

        # Match accent to our target groups
        matched_group = None
        for group_name, tokens in group_tokens.items():
            if any(tok in accent_value for tok in tokens):
                matched_group = group_name
                break

        if matched_group:
            count = accent_counts.get(matched_group, 0)
            if count < samples_per_accent:
                # Find audio file
                audio_filename = row.get(path_col, "")
                if not audio_filename:
                    continue
                audio_rel = Path(str(audio_filename))
                # Treat metadata paths as untrusted input:
                # do not allow absolute paths or parent traversal.
                if audio_rel.is_absolute() or ".." in audio_rel.parts:
                    audio_rel = Path(audio_rel.name)

                # Try multiple possible locations
                possible_paths = [
                    cv_path / audio_rel,
                    cv_path / 'clips' / audio_rel,
                    cv_path / 'clips' / audio_rel.name,
                    cv_path.parent / 'clips' / audio_rel.name,
                    cv_path.parent / audio_rel,
                ]

                if metadata_file:
                    metadata_dir = metadata_file.parent
                    possible_paths.extend([
                        metadata_dir / audio_rel,
                        metadata_dir / audio_rel.name,
                    ])

                src_audio = None
                for path in possible_paths:
                    if path.exists():
                        src_audio = path
                        break

                if not src_audio:
                    continue

                if src_audio.suffix.lower() not in ALLOWED_AUDIO_EXTENSIONS:
                    continue

                # Keep original extension (mp3/wav)
                ext = src_audio.suffix.lower() or ".wav"
                safe_group = matched_group.lower().replace(" ", "_")
                new_filename = f"{safe_group}_{count:03d}{ext}"
                dst_audio = output_path / new_filename

                # Copy file
                try:
                    shutil.copy(src_audio, dst_audio)

                    # Store ground truth
                    ground_truth_rows.append({
                        'filename': new_filename,
                        'accent_group': matched_group,
                        'speaker_type': 'native' if matched_group in ['US', 'England', 'Australian', 'Canadian'] else 'ESL',
                        'true_transcript': row.get(text_col, '') if text_col else '',
                        'true_intent': 'unknown',  # Will need to manually assign
                        'duration': 0  # Will need to calculate or estimate
                    })

                    accent_counts[matched_group] = count + 1
                    print(f"✓ Copied: {new_filename} (original accent: {row.get(accent_col, 'N/A')})")

                except Exception as e:
                    print(f"✗ Error copying {audio_filename}: {e}")
                    continue

        # Stop if we have enough samples for all groups
        if all(count >= samples_per_accent for count in accent_counts.values()):
            print(f"\n✓ Collected enough samples for all accent groups!")
            break

    # Save ground truth template
    if ground_truth_rows:
        gt_df = pd.DataFrame(ground_truth_rows)
        gt_path.parent.mkdir(parents=True, exist_ok=True)
        gt_df.to_csv(gt_path, index=False)

        if write_ground_truth:
            template_path = Path('data/ground_truth_template.csv')
            if template_path.exists():
                template_path.unlink()

        print(f"\n{'='*60}")
        print(f"Data organization complete!")
        print(f"{'='*60}")
        print(f"\nSamples collected:")
        for accent, count in sorted(accent_counts.items()):
            print(f"  {accent:15s}: {count:3d} samples")
        print(f"\nTotal: {sum(accent_counts.values())} samples")
        print(f"Output directory: {output_dir}")
        print(f"\n{'='*60}")
        print(f"NEXT STEP: Assign intents to transcripts")
        print(f"{'='*60}")
        print(f"\n1. Open: {gt_path}")
        print(f"2. For each row, read the 'true_transcript' column")
        print(f"3. Assign 'true_intent' based on content:")
        print(f"   - Contains 'pay', 'bill', 'payment' → pay_bill")
        print(f"   - Contains 'password', 'login', 'reset' → reset_password")
        print(f"   - Contains 'broken', 'down', 'outage' → report_outage")
        print(f"   - Contains 'account', 'information' → account_info")
        print(f"4. Save as: data/ground_truth.csv")
        print(f"\nThen run the benchmark pipeline!")
    else:
        print(f"\n❌ No samples collected. Check if:")
        print(f"   - Audio files exist in {cv_path}/clips/")
        print(f"   - Accent column has expected values")
        print(f"   - Metadata file has 'path' column")

    return accent_counts


def main():
    ensure_python_3_12_12()

    parser = argparse.ArgumentParser(
        description="Organize Mozilla Common Voice data for ASR Equity Benchmark"
    )
    parser.add_argument(
        '--cv_dir',
        type=str,
        required=True,
        help='Path to cv-valid-test directory (e.g., ~/Downloads/cv-valid-test)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='data/audio',
        help='Output directory for audio files (default: data/audio)'
    )
    parser.add_argument(
        '--samples',
        type=int,
        default=5,
        help='Number of samples per accent group (default: 5)'
    )
    parser.add_argument(
        '--accents',
        nargs='+',
        default=["us", "india", "african", "england"],
        help='Accent tokens to match (default: us india african england)'
    )
    parser.add_argument(
        '--accent_column',
        type=str,
        default='accent',
        help='Column name for accent labels (default: accent)'
    )
    parser.add_argument(
        '--fallback_accent_column',
        type=str,
        default='locale',
        help='Fallback column if accent is missing (default: locale)'
    )
    parser.add_argument(
        '--text_column',
        type=str,
        default='sentence',
        help='Column name for transcripts (default: sentence)'
    )
    parser.add_argument(
        '--path_column',
        type=str,
        default='path',
        help='Column name for audio filename (default: path)'
    )
    parser.add_argument(
        '--metadata_csv',
        type=str,
        default='',
        help='Optional metadata CSV path (e.g., ~/Downloads/cv-valid-test.csv)'
    )
    parser.add_argument(
        '--write_ground_truth',
        action='store_true',
        help='Write directly to data/ground_truth.csv and delete the template'
    )
    parser.add_argument(
        '--total_samples',
        type=int,
        default=20,
        help='Total files to copy if no metadata is found (default: 20)'
    )
    parser.add_argument(
        '--allow_no_metadata',
        action='store_true',
        help='If set, copy audio files even when no metadata TSV is present'
    )

    args = parser.parse_args()

    # Run organization
    organize_cv_data(
        cv_dir=args.cv_dir,
        output_dir=args.output,
        samples_per_accent=args.samples,
        accent_tokens=args.accents,
        accent_column=args.accent_column,
        fallback_accent_column=args.fallback_accent_column,
        text_column=args.text_column,
        path_column=args.path_column,
        total_samples=args.total_samples,
        allow_no_metadata=args.allow_no_metadata,
        metadata_csv=args.metadata_csv or None,
        write_ground_truth=args.write_ground_truth,
    )


if __name__ == "__main__":
    main()
