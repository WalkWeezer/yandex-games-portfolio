#!/usr/bin/env python3
"""Recolor HR plum/purple outfit → concept hot-pink (blazer, skirt, shoes, glasses)."""
from __future__ import annotations

import colorsys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / "games/deadline-escape/refs/sprites"
ASSETS = Path.home() / ".cursor/projects/c-Users-borov-Projects-yandex-games-portfolio/assets"

# concept pink target (approx from sheet-concept / boss-hr art)
PINK_H = 330 / 360.0  # HSV hue


def recolor_rgba(arr: np.ndarray) -> np.ndarray:
    out = arr.copy()
    a = arr[..., 3]
    mask = a > 16
    if not mask.any():
        return out
    rgb = arr[mask, :3].astype(np.float32) / 255.0
    hsv = np.array([colorsys.rgb_to_hsv(float(r), float(g), float(b)) for r, g, b in rgb], dtype=np.float32)
    h, s, v = hsv[:, 0], hsv[:, 1], hsv[:, 2]

    # plum / magenta clothing & accessories (not pale blouse, not skin, not hair/wood)
    # purple–magenta band, enough chroma, mid value
    cloth = (
        (((h >= 0.72) & (h <= 0.95)) | ((h >= 0.93) | (h <= 0.02)))
        & (s > 0.12)
        & (v > 0.12)
        & (v < 0.92)
    )
    # pale blouse already pinkish — nudge toward concept pale pink, skip heavy cloth shift
    pale = (s < 0.28) & (v > 0.75) & (((h >= 0.85) | (h <= 0.08)) | ((h >= 0.72) & (h <= 0.95)))
    cloth = cloth & ~pale

    # skin / hair / clipboard browns — protect
    warm = (h >= 0.02) & (h <= 0.12) & (s > 0.08) & (s < 0.55)
    brown = (h >= 0.03) & (h <= 0.11) & (s > 0.15) & (v < 0.55)
    protect = warm | brown
    cloth = cloth & ~protect

    for i in np.where(cloth)[0]:
        # pull hue to hot pink; lift sat/value toward vivid blazer
        nh = PINK_H
        ns = min(0.92, float(s[i]) * 1.25 + 0.18)
        nv = min(0.95, float(v[i]) * 1.15 + 0.12)
        r, g, b = colorsys.hsv_to_rgb(nh, ns, nv)
        rgb[i] = (r, g, b)

    # pale blouse / cuffs → soft pink
    for i in np.where(pale & ~protect)[0]:
        nh = 0.95  # light pink
        ns = max(0.12, min(0.35, float(s[i]) * 0.8 + 0.08))
        nv = max(0.82, float(v[i]))
        r, g, b = colorsys.hsv_to_rgb(nh, ns, nv)
        rgb[i] = (r, g, b)

    out[mask, :3] = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    return out


def process(path: Path) -> bool:
    im = Image.open(path).convert("RGBA")
    out = Image.fromarray(recolor_rgba(np.asarray(im)), "RGBA")
    out.save(path)
    return True


def main() -> None:
    paths: list[Path] = []
    for rel in (
        "boss_hr_idle_sheet.png",
        "boss_hr_walk_sheet.png",
        "boss_hr_special_sheet.png",
        "boss_hr_sheet.png",
        "alpha/boss_hr_idle_sheet.png",
        "alpha/boss_hr_walk_sheet.png",
        "alpha/boss_hr_special_sheet.png",
        "alpha/boss_hr_sheet.png",
    ):
        p = SPRITES / rel
        if p.exists():
            paths.append(p)
    frames = SPRITES / "frames" / "boss_hr"
    if frames.exists():
        paths.extend(sorted(frames.glob("*.png")))
    legacy = SPRITES / "frames" / "boss_hr_sheet"
    if legacy.exists():
        paths.extend(sorted(legacy.glob("*.png")))

    n = 0
    for p in paths:
        process(p)
        n += 1
        print("recolored", p.relative_to(SPRITES))

    # refresh chroma SoT from pink idle/walk/special (magenta bg)
    for name in ("boss_hr_idle_sheet", "boss_hr_walk_sheet", "boss_hr_special_sheet", "boss_hr_sheet"):
        src = SPRITES / f"{name}.png"
        if not src.exists():
            continue
        rgba = np.asarray(Image.open(src).convert("RGBA"))
        flat = np.full_like(rgba, 255)
        flat[..., 0] = 255
        flat[..., 1] = 0
        flat[..., 2] = 255
        flat[..., 3] = 255
        a = rgba[..., 3:4].astype(np.float32) / 255.0
        comp = (rgba.astype(np.float32) * a + flat.astype(np.float32) * (1 - a)).astype(np.uint8)
        rgb = Image.fromarray(comp[..., :3], "RGB")
        rgb.save(SPRITES / "chroma" / f"{name}_chroma.png")
        if ASSETS.exists():
            rgb.save(ASSETS / f"{name}_chroma.png")
        print("chroma", name)

    print(f"DONE HR pink recolor ({n} files)")


if __name__ == "__main__":
    main()
