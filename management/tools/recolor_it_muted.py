#!/usr/bin/env python3
"""Desaturate IT acid/neon green → muted office sage/teal."""
from __future__ import annotations

import colorsys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / "games/deadline-escape/refs/sprites"
ASSETS = Path.home() / ".cursor/projects/c-Users-borov-Projects-yandex-games-portfolio/assets"

# muted sage target
SAGE_H = 145 / 360.0


def recolor_rgba(arr: np.ndarray) -> np.ndarray:
    out = arr.copy()
    a = arr[..., 3]
    mask = a > 16
    if not mask.any():
        return out
    rgb = arr[mask, :3].astype(np.float32) / 255.0
    hsv = np.array([colorsys.rgb_to_hsv(float(r), float(g), float(b)) for r, g, b in rgb], dtype=np.float32)
    h, s, v = hsv[:, 0], hsv[:, 1], hsv[:, 2]

    # neon / acid greens (hoodie, hair streaks, glows)
    green = (h >= 0.22) & (h <= 0.48) & (s > 0.25) & (v > 0.25)
    for i in np.where(green)[0]:
        nh = SAGE_H
        ns = min(0.42, float(s[i]) * 0.35 + 0.12)  # kill neon sat
        nv = min(0.72, float(v[i]) * 0.75 + 0.08)
        r, g, b = colorsys.hsv_to_rgb(nh, ns, nv)
        rgb[i] = (r, g, b)

    out[mask, :3] = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    return out


def to_chroma(src: Path, name: str) -> None:
    rgba = np.asarray(Image.open(src).convert("RGBA"))
    flat = np.zeros_like(rgba)
    flat[..., 0] = 255
    flat[..., 2] = 255
    flat[..., 3] = 255
    a = rgba[..., 3:4].astype(np.float32) / 255.0
    comp = (rgba.astype(np.float32) * a + flat.astype(np.float32) * (1 - a)).astype(np.uint8)
    rgb = Image.fromarray(comp[..., :3], "RGB")
    rgb.save(SPRITES / "chroma" / f"{name}_chroma.png")
    if ASSETS.exists():
        rgb.save(ASSETS / f"{name}_chroma.png")


def main() -> None:
    paths = [
        SPRITES / "boss_it_sheet.png",
        SPRITES / "alpha" / "boss_it_sheet.png",
    ]
    frames = SPRITES / "frames" / "boss_it_sheet"
    if frames.exists():
        paths.extend(sorted(frames.glob("*.png")))
    n = 0
    for p in paths:
        if not p.exists():
            continue
        Image.fromarray(recolor_rgba(np.asarray(Image.open(p).convert("RGBA"))), "RGBA").save(p)
        print("recolored", p.relative_to(SPRITES))
        n += 1
    src = SPRITES / "boss_it_sheet.png"
    if src.exists():
        to_chroma(src, "boss_it_sheet")
    print(f"DONE IT muted ({n} files)")


if __name__ == "__main__":
    main()
