#!/usr/bin/env python3
"""Deprecated entrypoint — HR walk must stay style-locked to idle.

Use: python management/tools/rebuild_hr_sprites.py
(coherent walk rows + idle/special SoT, shared feet / body height)
"""
from __future__ import annotations

import runpy
from pathlib import Path

if __name__ == "__main__":
    runpy.run_path(str(Path(__file__).with_name("rebuild_hr_sprites.py")), run_name="__main__")
