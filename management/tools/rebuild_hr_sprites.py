#!/usr/bin/env python3
"""Rebuild HR idle + walk from chroma SoT (full reart 2026-07-18).

Idle: boss_hr_idle_sheet_chroma.png — order S,E,N,W (gen turnaround).
Walk: boss_hr_walk_row_{s,e,n}_chroma.png — Slynyrd 6f; W = mirror E.
No special. No idle-leg warp / graft.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_deadline_sprites import (  # noqa: E402
    ALPHA,
    ASSETS,
    CHROMA,
    FRAME_SIZE,
    FRAMES,
    GIFS,
    SPRITES,
    chroma_to_rgba,
    compose_dir_rows,
    content_bbox,
    keep_largest_alpha_blob,
    mirror_row_cells,
    normalize_sprite_set,
    save_gif,
    slice_by_blobs,
)

HR_BODY_H = 200
OUT = FRAMES / "boss_hr"
DIRS = ["s", "e", "n", "w"]
WALK_N = 6


def load_chroma(name: str) -> Image.Image:
    for base in (ASSETS, CHROMA, SPRITES):
        p = base / name
        if p.exists():
            return chroma_to_rgba(Image.open(p))
    raise FileNotFoundError(name)


def blobs(im: Image.Image, expect: int, min_area: int = 500) -> list[Image.Image]:
    parts = slice_by_blobs(im, expect=expect, min_area=min_area)
    raw = []
    for p in parts[:expect]:
        clean = keep_largest_alpha_blob(p)
        bb = content_bbox(clean, alpha_min=16)
        raw.append(clean.crop(bb) if bb else clean)
    while len(raw) < expect and raw:
        raw.append(raw[-1].copy())
    return raw[:expect]


def norm(frames: list[Image.Image]) -> list[Image.Image]:
    return normalize_sprite_set(frames, FRAME_SIZE, target_body_h=HR_BODY_H, bob_y=[0] * len(frames))


def content_h(im: Image.Image) -> int:
    bb = content_bbox(im)
    return (bb[3] - bb[1]) if bb else 0


def feet_y(im: Image.Image) -> int:
    a = np.asarray(im.convert("RGBA"))
    ys = np.where(a[..., 3] > 40)[0]
    return int(ys.max()) if len(ys) else -1


def hflip(im: Image.Image) -> Image.Image:
    return im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def mse(a: Image.Image, b: Image.Image) -> float:
    aa = np.asarray(a.convert("RGBA").resize((128, 128)), dtype=np.float32)
    bb = np.asarray(b.convert("RGBA").resize((128, 128)), dtype=np.float32)
    return float(((aa - bb) ** 2).mean())


def _torso_cx(arr: np.ndarray, y0: int, y1: int) -> int:
    band = arr[y0:y1, :, 3] > 40
    xs = np.where(band.any(axis=0))[0]
    if len(xs) == 0:
        return arr.shape[1] // 2
    return int((int(xs.min()) + int(xs.max())) // 2)


def opposite_keep_upper(im: Image.Image, waist_frac: float = 0.50) -> Image.Image:
    """Opposite stride: flip for legs, paste original upper (clipboard stable)."""
    src = im.convert("RGBA")
    flip = hflip(src)
    sa = np.asarray(src)
    fa = np.asarray(flip).copy()
    opaque = sa[..., 3] > 40
    ys = np.where(opaque.any(axis=1))[0]
    if len(ys) == 0:
        return flip
    y0, y1 = int(ys.min()), int(ys.max())
    waist = y0 + int((y1 - y0) * waist_frac)
    cx_s = _torso_cx(sa, y0, waist)
    cx_f = _torso_cx(fa, y0, waist)
    dx = cx_f - cx_s
    fa[:waist] = 0
    canvas = Image.fromarray(fa, "RGBA")
    canvas.alpha_composite(Image.fromarray(sa[:waist], "RGBA"), dest=(dx, 0))
    out = np.asarray(canvas).copy()
    seam_h = min(5, out.shape[0] - waist)
    if seam_h > 0:
        seam = fa[waist : waist + seam_h]
        band = out[waist : waist + seam_h]
        out[waist : waist + seam_h] = np.where(band[..., 3:4] > 20, band, seam)
    return Image.fromarray(out, "RGBA")


def force_opposite_b(frames: list[Image.Image], dir_key: str) -> list[Image.Image]:
    a = frames[0:3]
    b = frames[3:6]
    if dir_key in ("s", "n"):
        if mse(a[0], b[0]) < 180:
            b = [opposite_keep_upper(x) for x in a]
            print(f"  walk {dir_key}: B ~ A → legs-flip keep upper")
        else:
            # authored opposite — still stabilize clipboard if upper flipped
            clip_jump = mse(
                Image.fromarray(np.asarray(a[0])[:120]),
                Image.fromarray(np.asarray(b[0])[:120]),
            )
            if clip_jump > 900:
                b = [opposite_keep_upper(x) for x in a]
                print(f"  walk {dir_key}: clipboard jump → legs-flip keep upper")
            else:
                print(f"  walk {dir_key}: keep authored B (mse0vs3={mse(a[0], b[0]):.0f})")
        return a + b
    if mse(a[0], b[0]) < 200 or mse(a[2], b[2]) < 250:
        b = [a[2], a[1], a[0]]
        print(f"  walk {dir_key}: B ~ A, reverse-A")
        return a + b
    print(f"  walk {dir_key}: keep authored B (mse0vs3={mse(a[0], b[0]):.0f})")
    return a + b


def export_walk_row(d: str, frames: list[Image.Image]) -> Image.Image:
    row = Image.new("RGBA", (FRAME_SIZE * WALK_N, FRAME_SIZE), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        fr.save(OUT / f"walk_{d}_{i}.png")
        row.paste(fr, (i * FRAME_SIZE, 0), fr)
    for i in range(WALK_N, 8):
        p = OUT / f"walk_{d}_{i}.png"
        if p.exists():
            p.unlink()
    save_gif(frames, GIFS / f"boss_hr_walk_{d}.gif", duration=100)
    return row


def save_idle_sheet(idle: list[Image.Image]) -> None:
    sheet = Image.new("RGBA", (FRAME_SIZE * 4, FRAME_SIZE), (0, 0, 0, 0))
    for i, fr in enumerate(idle):
        sheet.paste(fr, (i * FRAME_SIZE, 0), fr)
    sheet.save(SPRITES / "boss_hr_idle_sheet.png")
    sheet.save(ALPHA / "boss_hr_idle_sheet.png")
    sheet.save(SPRITES / "boss_hr_sheet.png")
    flat = Image.new("RGBA", sheet.size, (255, 0, 255, 255))
    flat = Image.alpha_composite(flat, sheet)
    flat.convert("RGB").save(CHROMA / "boss_hr_idle_sheet_chroma.png")
    if ASSETS.exists():
        flat.convert("RGB").save(ASSETS / "boss_hr_idle_sheet_chroma.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (SPRITES / "rig" / "rows").mkdir(parents=True, exist_ok=True)
    ALPHA.mkdir(parents=True, exist_ok=True)
    CHROMA.mkdir(parents=True, exist_ok=True)
    GIFS.mkdir(parents=True, exist_ok=True)

    print("1) Idle turnaround from chroma (S,E,N,W)")
    # prefer gen asset if present
    for src_name, dst_name in (
        ("boss_hr_idle_turnaround_gen.png", "boss_hr_idle_sheet_chroma.png"),
    ):
        src = ASSETS / src_name
        if src.exists():
            shutil.copy2(src, CHROMA / dst_name)
            shutil.copy2(src, ASSETS / dst_name)

    idle_im = load_chroma("boss_hr_idle_sheet_chroma.png")
    idle_im.save(SPRITES / "boss_hr_idle_sheet.png")
    idle_raw = blobs(idle_im, 4, min_area=600)
    idle = norm(idle_raw)
    for i, d in enumerate(DIRS):
        idle[i].save(OUT / f"idle_{d}.png")
        for fi in range(4):
            idle[i].save(OUT / f"idle_{d}_{fi}.png")
    leg = FRAMES / "boss_hr_sheet"
    leg.mkdir(parents=True, exist_ok=True)
    for i, d in enumerate(DIRS):
        idle[i].save(leg / f"{d}.png")
    save_idle_sheet(idle)
    save_gif(idle, GIFS / "boss_hr_idle_turn.gif", duration=300)
    print("   idle h/feet", [(content_h(x), feet_y(x)) for x in idle])
    for d in DIRS:
        bb = content_bbox(idle[DIRS.index(d)])
        print(f"   idle_{d} bbox", bb, "w", (bb[2] - bb[0]) if bb else 0)

    print("2) Special — skipped")
    for i in range(4):
        p = OUT / f"special_{i}.png"
        if p.exists():
            p.unlink()
    for p in (
        GIFS / "boss_hr_special.gif",
        SPRITES / "boss_hr_special_sheet.png",
        ALPHA / "boss_hr_special_sheet.png",
        CHROMA / "boss_hr_special_sheet_chroma.png",
    ):
        if p.exists():
            p.unlink()

    print("3) Walk rows from chroma (same body as idle gen)")
    for name in (
        "boss_hr_walk_row_s_chroma.png",
        "boss_hr_walk_row_e_chroma.png",
        "boss_hr_walk_row_n_chroma.png",
    ):
        gen = ASSETS / name.replace("_chroma.png", "_gen.png")
        if gen.exists():
            shutil.copy2(gen, CHROMA / name)
            shutil.copy2(gen, ASSETS / name)

    s_raw = blobs(load_chroma("boss_hr_walk_row_s_chroma.png"), WALK_N, min_area=400)
    e_raw = blobs(load_chroma("boss_hr_walk_row_e_chroma.png"), WALK_N, min_area=400)
    n_raw = blobs(load_chroma("boss_hr_walk_row_n_chroma.png"), WALK_N, min_area=400)

    # normalize idle+walk together so scale matches
    all_norm = norm(idle_raw + s_raw + e_raw + n_raw)
    idle2 = all_norm[0:4]
    # re-export idle at shared scale with walk
    for i, d in enumerate(DIRS):
        idle2[i].save(OUT / f"idle_{d}.png")
        for fi in range(4):
            idle2[i].save(OUT / f"idle_{d}_{fi}.png")
        idle2[i].save(leg / f"{d}.png")
    save_idle_sheet(idle2)
    idle = idle2

    s_fr = force_opposite_b(all_norm[4:10], "s")
    e_fr = force_opposite_b(all_norm[10:16], "e")
    n_fr = force_opposite_b(all_norm[16:22], "n")
    s_fr, e_fr, n_fr = norm(s_fr), norm(e_fr), norm(n_fr)

    row_s = export_walk_row("s", s_fr)
    row_e = export_walk_row("e", e_fr)
    row_n = export_walk_row("n", n_fr)
    row_w = mirror_row_cells(row_e, WALK_N, FRAME_SIZE)
    w_fr = [row_w.crop((i * FRAME_SIZE, 0, (i + 1) * FRAME_SIZE, FRAME_SIZE)) for i in range(WALK_N)]
    w_fr = norm(w_fr)
    row_w = export_walk_row("w", w_fr)

    for name, row in [("s", row_s), ("e", row_e), ("n", row_n), ("w", row_w)]:
        row.save(SPRITES / "rig" / "rows" / f"hr_walk_row_{name}.png")

    sheet = compose_dir_rows([row_s, row_e, row_n, row_w])
    sheet.save(SPRITES / "boss_hr_walk_sheet.png")
    sheet.save(ALPHA / "boss_hr_walk_sheet.png")
    flat = Image.new("RGBA", sheet.size, (255, 0, 255, 255))
    flat = Image.alpha_composite(flat, sheet)
    flat.convert("RGB").save(CHROMA / "boss_hr_walk_sheet_chroma.png")
    if ASSETS.exists():
        flat.convert("RGB").save(ASSETS / "boss_hr_walk_sheet_chroma.png")
    save_gif(s_fr, GIFS / "boss_hr_walk.gif", duration=100)

    print("   walk S h/feet", [(content_h(x), feet_y(x)) for x in s_fr])
    print("   walk E h/feet", [(content_h(x), feet_y(x)) for x in e_fr])
    print("QA feet idle/walk", feet_y(idle[0]), feet_y(s_fr[0]))
    print("QA width idle_s/walk_s0", content_bbox(idle[0]), content_bbox(s_fr[0]))
    for i in (0, 3):
        a = np.asarray(s_fr[i])
        mid = a.shape[1] // 2
        upper = a[:140]
        print(
            f"   walk_s_{i} upper L/R",
            int((upper[:, :mid, 3] > 40).sum()),
            int((upper[:, mid:, 3] > 40).sum()),
        )
    print("DONE rebuild_hr_sprites")


if __name__ == "__main__":
    main()
