#!/usr/bin/env python3
"""Rebuild management/assets/deadline-docs-bundle.js from games/deadline-escape docs+prompts."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "games" / "deadline-escape" / "docs"
PROMPTS = ROOT / "games" / "deadline-escape" / "prompts"
OUT = ROOT / "management" / "assets" / "deadline-docs-bundle.js"

def main():
    bundle = {}
    for p in sorted(DOCS.glob("*.md")):
        bundle["docs/" + p.name] = p.read_text(encoding="utf-8")
    for p in sorted(PROMPTS.glob("*.md")):
        bundle["prompts/" + p.name] = p.read_text(encoding="utf-8")
    OUT.write_text(
        "window.DEADLINE_DOCS_BUNDLE = "
        + json.dumps(bundle, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT} ({len(bundle)} files, {OUT.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
