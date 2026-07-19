#!/usr/bin/env python3
"""Fix HR to match concept art: rose blazer + dark skirt, solid alpha (chroma-safe).

Concept (refs/art/boss-hr.png): hot-pink blazer, pale blouse, dark charcoal/plum
skirt, pink shoes/glasses. Avoid pure magenta (#FF00FF) so chroma key won't eat cloth.
"""
from __future__ import annotations

import colorsys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / "games/deadline-escape/refs/sprites"
ASSETS = Path.home() / ".cursor/projects/c-Users-borov-Projects-yandex-games-portfolio/assets"

# chroma-safe rose (enough G that dist to KEY stays high)
BLAZER = np.array([232, 78, 138], dtype=np.float32)   # vivid rose
BLOUSE = np.array([255, 214, 228], dtype=np.float32)   # pale pink
SKIRT = np.array([42, 40, 58], dtype=np.float32)       # dark charcoal-plum
SHOE = np.array([220, 70, 128], dtype=np.float32)
GLASS = np.array([236, 64, 140], dtype=np.float32)


def is_pinkish(h: np.ndarray, s: np.ndarray, v: np.ndarray) -> np.ndarray:
    return (((h >= 0.78) | (h <= 0.06)) & (s > 0.12) & (v > 0.12))


def fix_frame(arr: np.ndarray) -> np.ndarray:
    out = arr.copy()
    a = arr[..., 3]
    # revive semi-transparent cloth holes → opaque
    semi = (a > 8) & (a < 250)
    out[semi, 3] = 255
    a = out[..., 3]
    mask = a > 40
    if not mask.any():
        return out

    ys, xs = np.where(mask)
    y0, y1 = int(ys.min()), int(ys.max())
    h_body = max(1, y1 - y0)
    # relative height in sprite: 0 head → 1 feet
    rel = (ys - y0) / h_body

    rgb = out[mask, :3].astype(np.float32) / 255.0
    hsv = np.array([colorsys.rgb_to_hsv(float(r), float(g), float(b)) for r, g, b in rgb], dtype=np.float32)
    h, s, v = hsv[:, 0], hsv[:, 1], hsv[:, 2]
    pink = is_pinkish(h, s, v)

    # protect skin / hair / paper
    skin = (h >= 0.02) & (h <= 0.12) & (s > 0.12) & (s < 0.55) & (v > 0.4)
    hair = (v < 0.35) & (s < 0.45) & (h >= 0.02) & (h <= 0.15)
    paper = (s < 0.12) & (v > 0.75)
    protect = skin | hair | paper

    # zones
    skirt_z = (rel >= 0.48) & (rel < 0.82)  # pencil skirt band
    shoe_z = rel >= 0.82
    blouse_z = (rel >= 0.28) & (rel < 0.48) & (s < 0.45) & (v > 0.55)
    blazer_z = (rel < 0.55) & pink & ~blouse_z

    new = out[mask, :3].astype(np.float32)

    def tint(sel: np.ndarray, target: np.ndarray, amount: float = 0.85) -> None:
        if not sel.any():
            return
        t = target[None, :]
        new[sel] = new[sel] * (1 - amount) + t * amount

    tint(pink & skirt_z & ~protect, SKIRT, 0.92)
    tint(pink & shoe_z & ~protect, SHOE, 0.8)
    tint(blouse_z & ~protect, BLOUSE, 0.75)
    # blazer + glasses/earrings/lanyard (upper pink)
    tint(blazer_z & ~protect, BLAZER, 0.78)
    # leftover upper pink (accessories)
    upper_pink = pink & (rel < 0.48) & ~protect & ~blouse_z
    tint(upper_pink, BLAZER, 0.7)

    # any remaining near-magenta: push G up (chroma-safe)
    mag = (new[:, 0] > 160) & (new[:, 2] > 140) & (new[:, 1] < 90)
    new[mag, 1] = np.maximum(new[mag, 1], 88)

    out[mask, :3] = np.clip(new, 0, 255).astype(np.uint8)
    out[mask, 3] = 255
    return out


def to_chroma(src: Path, name: str) -> None:
    rgba = np.asarray(Image.open(src).convert("RGBA"))
    flat = np.zeros_like(rgba)
    flat[..., 0] = 255
    flat[..., 2] = 255
    flat[..., 3] = 255
    a = rgba[..., 3:4].astype(np.float32) / 255.0
    # only composite where alpha; keep KEY elsewhere
    comp = (rgba.astype(np.float32) * a + flat.astype(np.float32) * (1 - a)).astype(np.uint8)
    # force bg pure KEY
    dead = rgba[..., 3] < 14
    comp[dead, 0] = 255
    comp[dead, 1] = 0
    comp[dead, 2] = 255
    rgb = Image.fromarray(comp[..., :3], "RGB")
    rgb.save(SPRITES / "chroma" / f"{name}_chroma.png")
    if ASSETS.exists():
        rgb.save(ASSETS / f"{name}_chroma.png")


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
    for folder in (SPRITES / "frames" / "boss_hr", SPRITES / "frames" / "boss_hr_sheet"):
        if folder.exists():
            paths.extend(sorted(folder.glob("*.png")))

    for p in paths:
        Image.fromarray(fix_frame(np.asarray(Image.open(p).convert("RGBA"))), "RGBA").save(p)
        print("fixed", p.relative_to(SPRITES))

    for name in ("boss_hr_idle_sheet", "boss_hr_walk_sheet", "boss_hr_special_sheet", "boss_hr_sheet"):
        src = SPRITES / f"{name}.png"
        if src.exists():
            to_chroma(src, name)
            print("chroma", name)

    # QA
    a = np.asarray(Image.open(SPRITES / "frames" / "boss_hr" / "idle_s.png").convert("RGBA"))
    semi = int(((a[..., 3] > 0) & (a[..., 3] < 250)).sum())
    print(f"QA idle_s semi={semi} opaque={(a[..., 3] > 250).sum()}")
    print("DONE fix_hr_to_concept")


if __name__ == "__main__":
    main()
