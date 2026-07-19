#!/usr/bin/env python3
"""Hero cut-up rig → bake Slynyrd 6-frame walk sheets.

Flow:
  1) Load cut-up part sheets (S / E) from assets or refs/sprites/rig/cutup/hero/
  2) Slice blobs → named parts (config order)
  3) Pose by JSON-like keyframes (degrees, pivots)
  4) Bake frames → normalize → export walk_{s,e,n,w}_0..5 + sheet
  5) N = H-flip(S) cells (temp until back-facing parts exist)
  6) W = mirror each E cell

Usage:
  python management/tools/hero_cutup_bake.py
"""
from __future__ import annotations

import math
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_deadline_sprites import (  # noqa: E402
    ALPHA,
    CHROMA,
    FRAME_SIZE,
    FRAMES,
    GIFS,
    HERO_BODY_H,
    SPRITES,
    compose_dir_rows,
    content_bbox,
    keep_largest_alpha_blob,
    mirror_row_cells,
    normalize_sprite_set,
    save_gif,
    slice_by_blobs,
)

ROOT = Path(__file__).resolve().parents[2]
ASSETS = Path.home() / ".cursor/projects/c-Users-borov-Projects-yandex-games-portfolio/assets"
CUTUP = SPRITES / "rig" / "cutup" / "hero"
OUT = FRAMES / "char_hero"

# Slynyrd 6 phases: contact A, down A, pass A, contact B, down B, pass B
# angles in degrees; 0 = part local "down"; positive = CCW
# Front (S): left/right from viewer
WALK_S = [
    # contact A — left leg forward, right back; opposite arms
    {"bob": 0, "leg_L": -28, "leg_R": 22, "arm_L": 18, "arm_R": -22, "head": 0},
    # down A
    {"bob": 2, "leg_L": -12, "leg_R": 10, "arm_L": 8, "arm_R": -10, "head": 0},
    # pass A — tallest
    {"bob": -4, "leg_L": 4, "leg_R": -4, "arm_L": -4, "arm_R": 4, "head": 0},
    # contact B — opposite
    {"bob": 0, "leg_L": 22, "leg_R": -28, "arm_L": -22, "arm_R": 18, "head": 0},
    # down B
    {"bob": 2, "leg_L": 10, "leg_R": -12, "arm_L": -10, "arm_R": 8, "head": 0},
    # pass B
    {"bob": -4, "leg_L": -4, "leg_R": 4, "arm_L": 4, "arm_R": -4, "head": 0},
]

# Profile E: near = screen-right (character's right when facing +X), far = left
WALK_E = [
    {"bob": 0, "leg_near": -30, "leg_far": 24, "arm_near": 20, "arm_far": -18, "head": 0},
    {"bob": 2, "leg_near": -14, "leg_far": 12, "arm_near": 8, "arm_far": -8, "head": 0},
    {"bob": -4, "leg_near": 2, "leg_far": -2, "arm_near": -4, "arm_far": 4, "head": 0},
    {"bob": 0, "leg_near": 24, "leg_far": -30, "arm_near": -18, "arm_far": 20, "head": 0},
    {"bob": 2, "leg_near": 12, "leg_far": -14, "arm_near": -8, "arm_far": 8, "head": 0},
    {"bob": -4, "leg_near": -2, "leg_far": 2, "arm_near": 4, "arm_far": -4, "head": 0},
]

# Expected blob order after sort (y then x) — tweak if slice order drifts
S_ORDER = [
    "head",
    "torso",
    "arm_L",  # may be full arm if AI merged
    "arm_R",
    "thigh_L",
    "calf_L",
    "thigh_R",
    "calf_R",
]

E_ORDER = [
    "head",
    "torso",
    "arm_near",
    "arm_far",
    "thigh_near",
    "calf_near",
    "thigh_far",
    "calf_far",
]


def load_sheet(name: str) -> Image.Image:
    for base in (CUTUP, ASSETS, SPRITES / "rig" / "cutup"):
        p = base / name
        if p.exists():
            return Image.open(p).convert("RGBA")
    raise FileNotFoundError(name)


def black_to_alpha(im: Image.Image, thr: float = 22.0) -> Image.Image:
    a = np.asarray(im).astype(np.float32)
    lum = a[..., :3].mean(axis=-1)
    out = a.copy()
    out[..., 3] = np.where(lum < thr, 0, 255)
    m = out[..., 3] > 40
    out[m, 3] = 255
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def slice_cc_parts(im: Image.Image, min_area: int = 200) -> list[Image.Image]:
    """2D connected components (cut-up sheets are not a single row)."""
    rgba = np.asarray(im.convert("RGBA"))
    mask = rgba[..., 3] > 28
    h, w = mask.shape
    labels = np.zeros((h, w), dtype=np.int32)
    lab = 0
    areas: dict[int, int] = {}
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or labels[y, x]:
                continue
            lab += 1
            stack = [(y, x)]
            labels[y, x] = lab
            area = 0
            while stack:
                cy, cx = stack.pop()
                area += 1
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not labels[ny, nx]:
                        labels[ny, nx] = lab
                        stack.append((ny, nx))
            areas[lab] = area
    parts = []
    for lid, area in areas.items():
        if area < min_area:
            continue
        ys, xs = np.where(labels == lid)
        y0, y1 = int(ys.min()), int(ys.max()) + 1
        x0, x1 = int(xs.min()), int(xs.max()) + 1
        cell = rgba[y0:y1, x0:x1].copy()
        local = labels[y0:y1, x0:x1] != lid
        cell[local, 3] = 0
        cell[local, :3] = 0
        parts.append((y0, x0, Image.fromarray(cell, "RGBA")))
    parts.sort(key=lambda t: (t[0], t[1]))
    return [p for _, _, p in parts]


def slice_parts(im: Image.Image, names: list[str], min_area: int = 200) -> dict[str, Image.Image]:
    parts = slice_cc_parts(im, min_area=min_area)
    if len(parts) < 4:
        raise RuntimeError(f"too few parts: {len(parts)}")
    out: dict[str, Image.Image] = {}
    for i, name in enumerate(names):
        if i < len(parts):
            out[name] = parts[i]
        else:
            out[name] = parts[-1].copy()
    print(f"  sliced {len(parts)} blobs -> mapped {list(out.keys())}")
    return out


def fit_h(im: Image.Image, target_h: int) -> Image.Image:
    if im.height <= 0:
        return im
    sc = target_h / im.height
    nw, nh = max(1, int(im.width * sc)), max(1, int(im.height * sc))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def scale_kit(parts: dict[str, Image.Image], *, front: bool) -> dict[str, Image.Image]:
    """Relative sizes so assembly matches ~200px hero body."""
    out = dict(parts)
    if front:
        out["head"] = fit_h(parts["head"], 78)
        out["torso"] = fit_h(parts["torso"], 70)
        for k in ("arm_L", "arm_R"):
            if k in parts:
                out[k] = fit_h(parts[k], 48)
        for k in ("thigh_L", "thigh_R"):
            if k in parts:
                out[k] = fit_h(parts[k], 36)
        for k in ("calf_L", "calf_R"):
            if k in parts:
                out[k] = fit_h(parts[k], 42)
    else:
        out["head"] = fit_h(parts["head"], 72)
        out["torso"] = fit_h(parts["torso"], 68)
        for k in ("arm_near", "arm_far"):
            if k in parts:
                out[k] = fit_h(parts[k], 46)
        for k in ("thigh_near", "thigh_far"):
            if k in parts:
                out[k] = fit_h(parts[k], 34)
        for k in ("calf_near", "calf_far"):
            if k in parts:
                out[k] = fit_h(parts[k], 40)
    return out


def rot(im: Image.Image, deg: float) -> Image.Image:
    if abs(deg) < 0.01:
        return im
    return im.rotate(deg, resample=Image.Resampling.BICUBIC, expand=True)


def paste_center(canvas: Image.Image, part: Image.Image, cx: float, cy: float) -> None:
    x = int(round(cx - part.width / 2))
    y = int(round(cy - part.height / 2))
    canvas.alpha_composite(part, (x, y))


def hard(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert("RGBA")).copy()
    a[a[..., 3] > 32, 3] = 255
    a[a[..., 3] <= 32] = 0
    return Image.fromarray(a, "RGBA")


def bake_south(parts: dict[str, Image.Image]) -> list[Image.Image]:
    parts = scale_kit(parts, front=True)
    frames = []
    base_x, base_y = 128, 118
    for kf in WALK_S:
        c = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
        bob = kf["bob"]
        hip_y = base_y + 36 + bob
        shoulder_y = base_y + 8 + bob
        thigh_L = rot(parts["thigh_L"], kf["leg_L"] * 0.5)
        calf_L = rot(parts["calf_L"], kf["leg_L"])
        thigh_R = rot(parts["thigh_R"], kf["leg_R"] * 0.5)
        calf_R = rot(parts["calf_R"], kf["leg_R"])
        swing_L = math.sin(math.radians(kf["leg_L"])) * 14
        swing_R = math.sin(math.radians(kf["leg_R"])) * 14
        paste_center(c, thigh_L, base_x - 12, hip_y + 10)
        paste_center(c, calf_L, base_x - 14 + swing_L, hip_y + 38)
        paste_center(c, thigh_R, base_x + 12, hip_y + 10)
        paste_center(c, calf_R, base_x + 14 + swing_R, hip_y + 38)
        paste_center(c, parts["torso"], base_x, base_y + 18 + bob)
        paste_center(c, rot(parts["arm_L"], kf["arm_L"]), base_x - 40, shoulder_y + 22)
        paste_center(c, rot(parts["arm_R"], kf["arm_R"]), base_x + 40, shoulder_y + 22)
        paste_center(c, rot(parts["head"], kf.get("head", 0)), base_x, base_y - 28 + bob)
        frames.append(hard(c))
    return frames


def bake_east(parts: dict[str, Image.Image]) -> list[Image.Image]:
    parts = scale_kit(parts, front=False)
    frames = []
    base_x, base_y = 128, 118
    for kf in WALK_E:
        c = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
        bob = kf["bob"]
        hip_y = base_y + 38 + bob
        thigh_f = rot(parts["thigh_far"], kf["leg_far"] * 0.5)
        calf_f = rot(parts["calf_far"], kf["leg_far"])
        paste_center(c, thigh_f, base_x - 4, hip_y + 8)
        paste_center(c, calf_f, base_x - 6 + math.sin(math.radians(kf["leg_far"])) * 16, hip_y + 36)
        paste_center(c, rot(parts["arm_far"], kf["arm_far"]), base_x - 8, base_y + 10 + bob)
        paste_center(c, parts["torso"], base_x, base_y + 16 + bob)
        thigh_n = rot(parts["thigh_near"], kf["leg_near"] * 0.5)
        calf_n = rot(parts["calf_near"], kf["leg_near"])
        paste_center(c, thigh_n, base_x + 10, hip_y + 8)
        paste_center(c, calf_n, base_x + 12 + math.sin(math.radians(kf["leg_near"])) * 16, hip_y + 36)
        paste_center(c, rot(parts["arm_near"], kf["arm_near"]), base_x + 22, base_y + 12 + bob)
        paste_center(c, parts["head"], base_x + 6, base_y - 26 + bob)
        frames.append(hard(c))
    return frames


def export_walk(d: str, frames: list[Image.Image]) -> Image.Image:
    OUT.mkdir(parents=True, exist_ok=True)
    row = Image.new("RGBA", (FRAME_SIZE * 6, FRAME_SIZE), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        fr.save(OUT / f"walk_{d}_{i}.png")
        row.paste(fr, (i * FRAME_SIZE, 0), fr)
    save_gif(frames, GIFS / f"char_hero_walk_{d}.gif", duration=100)
    return row


def save_parts_preview(parts: dict[str, Image.Image], path: Path) -> None:
    """Debug strip of named parts."""
    pads = []
    for name, im in parts.items():
        cell = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
        sc = min(140 / max(im.width, 1), 140 / max(im.height, 1))
        r = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.Resampling.LANCZOS)
        cell.paste(r, ((160 - r.width) // 2, (160 - r.height) // 2), r)
        draw = ImageDraw.Draw(cell)
        draw.text((4, 2), name[:10], fill=(255, 255, 0, 255))
        pads.append(cell)
    strip = Image.new("RGBA", (160 * len(pads), 160), (0, 0, 0, 0))
    for i, p in enumerate(pads):
        strip.paste(p, (i * 160, 0), p)
    path.parent.mkdir(parents=True, exist_ok=True)
    strip.save(path)


def main() -> None:
    CUTUP.mkdir(parents=True, exist_ok=True)
    # install sources from assets if present
    for name in ("char_hero_cutup_parts_s.png", "char_hero_cutup_parts_e.png"):
        src = ASSETS / name
        if src.exists():
            shutil.copy2(src, CUTUP / name)
            print("install", name)

    def row_parts(im: Image.Image, names: list[str], min_area: int = 400) -> dict[str, Image.Image]:
        """Prefer column-gap slice for single-row cutup sheets; fallback CC."""
        cells = slice_by_blobs(im, expect=len(names), min_area=min_area)
        if len(cells) < len(names) - 1:
            cells = slice_cc_parts(im, min_area=min_area)
            # left-to-right only
            scored = []
            for p in cells:
                bb = content_bbox(p)
                if bb:
                    scored.append((bb[0], p.crop(bb) if True else p))
            scored.sort(key=lambda t: t[0])
            cells = [p for _, p in scored]
        print(f"  row parts {len(cells)} (want {len(names)})")
        out: dict[str, Image.Image] = {}
        for i, name in enumerate(names):
            if i < len(cells):
                p = cells[i]
                bb = content_bbox(p)
                out[name] = p.crop(bb) if bb else p
            else:
                out[name] = list(out.values())[-1].copy()
        return out

    print("1) South parts")
    s_im = black_to_alpha(load_sheet("char_hero_cutup_parts_s.png"))
    s_names = [
        "head", "torso",
        "arm_L", "arm_R",
        "thigh_L", "calf_L", "thigh_R", "calf_R",
    ]
    s_parts = row_parts(s_im, s_names, min_area=500)
    save_parts_preview(s_parts, CUTUP / "preview_parts_s.png")

    print("2) East parts")
    e_im = black_to_alpha(load_sheet("char_hero_cutup_parts_e.png"))
    e_names = [
        "head", "torso",
        "arm_near", "arm_far",
        "thigh_near", "calf_near", "thigh_far", "calf_far",
    ]
    e_parts = row_parts(e_im, e_names, min_area=400)
    save_parts_preview(e_parts, CUTUP / "preview_parts_e.png")

    print("3) Bake S / E")
    s_fr = bake_south(s_parts)
    e_fr = bake_east(e_parts)
    s_fr = [hard(x) for x in normalize_sprite_set(s_fr, FRAME_SIZE, target_body_h=HERO_BODY_H, bob_y=[0] * 6)]
    e_fr = [hard(x) for x in normalize_sprite_set(e_fr, FRAME_SIZE, target_body_h=HERO_BODY_H, bob_y=[0] * 6)]

    row_s = export_walk("s", s_fr)
    row_e = export_walk("e", e_fr)
    # N temp: H-flip each S cell (document debt — need back parts)
    print("4) N = H-flip(S) temporary")
    n_fr = [hard(fr.transpose(Image.Transpose.FLIP_LEFT_RIGHT)) for fr in s_fr]
    row_n = export_walk("n", n_fr)
    print("5) W = mirror E cells")
    row_w = mirror_row_cells(row_e, 6, FRAME_SIZE)
    w_fr = [hard(row_w.crop((i * FRAME_SIZE, 0, (i + 1) * FRAME_SIZE, FRAME_SIZE))) for i in range(6)]
    w_fr = [hard(x) for x in normalize_sprite_set(w_fr, FRAME_SIZE, target_body_h=HERO_BODY_H, bob_y=[0] * 6)]
    row_w = export_walk("w", w_fr)

    sheet = compose_dir_rows([row_s, row_e, row_n, row_w])
    sheet.save(SPRITES / "char_hero_walk_sheet.png")
    sheet.save(ALPHA / "char_hero_walk_sheet.png")
    (SPRITES / "rig" / "rows").mkdir(parents=True, exist_ok=True)
    for name, row in [("s", row_s), ("e", row_e), ("n", row_n), ("w", row_w)]:
        row.save(SPRITES / "rig" / "rows" / f"hero_cutup_walk_row_{name}.png")
    flat = Image.new("RGBA", sheet.size, (255, 0, 255, 255))
    flat = Image.alpha_composite(flat, sheet)
    flat.convert("RGB").save(CHROMA / "char_hero_walk_sheet_chroma.png")
    if ASSETS.exists():
        flat.convert("RGB").save(ASSETS / "char_hero_walk_sheet_chroma.png")
    save_gif(s_fr, GIFS / "char_hero_walk.gif", duration=100)
    save_gif(s_fr, GIFS / "char_hero_cutup_walk_preview.gif", duration=100)

    # small meta
    (CUTUP / "README.md").write_text(
        "# Hero cut-up rig\n\n"
        "- Parts: `char_hero_cutup_parts_{s,e}.png`\n"
        "- Bake: `python management/tools/hero_cutup_bake.py`\n"
        "- N is temporary H-flip(S) until back-facing parts exist\n"
        "- Tune angles in `WALK_S` / `WALK_E` inside the bake script\n",
        encoding="utf-8",
    )
    print("DONE hero cutup bake -> frames/char_hero/walk_* + sheet")


if __name__ == "__main__":
    main()
