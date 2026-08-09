#!/usr/bin/env python3
"""
Start Uvicorn with the workspace `Ai-services` folder set as the app directory.

Usage:
  python start_uvicorn.py

This runs: python -m uvicorn app.main:app --reload --app-dir Ai-services
so the `app` package inside `Ai-services` is importable even when running
from the repository root.
"""

from __future__ import annotations
import subprocess
import sys
from pathlib import Path


def main() -> int:
    repo_root = Path(__file__).resolve().parent
    app_dir = repo_root / "Ai-services"
    if not app_dir.exists():
        print(f"Error: expected directory not found: {app_dir}")
        return 2

    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--reload",
        "--app-dir",
        str(app_dir),
    ]

    print("Running:", " ".join(cmd))
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
