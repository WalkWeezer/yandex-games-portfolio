#!/usr/bin/env python3
"""Convert chroma-key (#FF00FF / near-magenta) images to RGBA PNG with alpha."""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image
import numpy as np

# Pure magenta key used in generation prompts
KEY = np.array([255, 0, 255], dtype=np.float32)


def chroma_to_rgba(im: Image.Image, threshold: float = 70.0, soft: float = 35.0) -> Image.Image:
    rgba = im.convert("RGBA")
    arr = np.asarray(rgba).astype(np.float32)
    rgb = arr[..., :3]
    dist = np.linalg.norm(rgb - KEY, axis=-1)
    # 0 = fully transparent (on key), 255 = fully opaque
    alpha = np.clip((dist - threshold) / max(soft, 1e-6) * 255.0, 0, 255)
    # crush near-key pixels
    alpha = np.where(dist < threshold, 0, alpha)
    out = arr.copy()
    out[..., 3] = alpha
    # decontaminate: push remaining fringe away from magenta
    mask = alpha < 250
    for c in (0, 2):  # R and B often high on magenta fringe
        channel = out[..., c]
        channel[mask] = np.minimum(channel[mask], out[..., 1][mask] + 40)
        out[..., c] = channel
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def fit_square(im: Image.Image, size: int) -> Image.Image:
    """Contain sprite in size×size canvas, centered, keep alpha."""
    im = im.convert("RGBA")
    # trim transparent
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.thumbnail((size - 2, size - 2), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - im.width) // 2
    y = (size - im.height) // 2
    canvas.paste(im, (x, y), im)
    return canvas


def process_file(src: Path, out_hi: Path, out_32: Path | None, threshold: float, soft: float) -> None:
    im = Image.open(src)
    cut = chroma_to_rgba(im, threshold=threshold, soft=soft)
    out_hi.parent.mkdir(parents=True, exist_ok=True)
    cut.save(out_hi)
    if out_32:
        fit_square(cut, 32).save(out_32)
    print(f"OK {src.name} -> {out_hi.name}" + (f" + {out_32.name}" if out_32 else ""))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("inputs", nargs="+", type=Path)
    ap.add_argument("--out-dir", type=Path, required=True)
    ap.add_argument("--make-32", action="store_true")
    ap.add_argument("--threshold", type=float, default=70.0)
    ap.add_argument("--soft", type=float, default=35.0)
    args = ap.parse_args()
    out32 = args.out_dir / "32" if args.make_32 else None
    if out32:
        out32.mkdir(parents=True, exist_ok=True)
    for src in args.inputs:
        stem = src.stem.replace("_chroma", "")
        process_file(
            src,
            args.out_dir / f"{stem}.png",
            (out32 / f"{stem}.png") if out32 else None,
            args.threshold,
            args.soft,
        )


if __name__ == "__main__":
    main()
