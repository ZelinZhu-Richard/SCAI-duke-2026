"""
Shared Python version gate for this project.
Requires Python 3.12.12 exactly.
"""

import sys


REQUIRED = (3, 12, 12)


def ensure_python_3_12_12():
    current = sys.version_info[:3]
    if current != REQUIRED:
        current_str = ".".join(map(str, current))
        required_str = ".".join(map(str, REQUIRED))
        raise SystemExit(
            f"❌ Python {required_str} is required. You are running {current_str}.\n"
            f"   Please create your venv with python{required_str}."
        )
