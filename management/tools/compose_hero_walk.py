#!/usr/bin/env python3
"""Compose hero walk — Slynyrd 6-frame with REAL opposite limbs.

AI often paints the same lead leg twice. Strategy:
  S/N: phases B = horizontal flip of A (front/back → true L/R limb swap)
  E:   use authored B only if foot-forward side differs; else require flip-derived
       workaround is impossible for profile — regenerate until opposite, or
       build B from a dedicated opposite chroma.
  W:   mirror each E cell (keeps phase order)
  Scale: one lock_scale for all dirs; bob via Y offset (no height squash).
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_deadline_sprites import (  # noqa: E402
    CHROMA,
    FRAME_SIZE,
    FRAMES,
    GIFS,
    SPRITES,
    chroma_to_rgba,
    compose_dir_rows,
    content_bbox,
    fit_scale_for_frames,
    mirror_row_cells,
    normalize_sprite_set,
    save_gif,
    SLYNYRD_WALK_BOB_Y,
    HERO_BODY_H,
)

ALT = Path.home() / ".cursor" / "projects" / "c-Users-borov-Projects-yandex-games-portfolio" / "assets"
ROWS = SPRITES / "rig" / "rows"
WALK_N = 6


def load_chroma(name: str) -> Image.Image:
    for base in (ALT, CHROMA, SPRITES):
        p = base / name
        if p.exists():
            return chroma_to_rgba(Image.open(p))
    raise FileNotFoundError(name)


def crop_content(im: Image.Image) -> Image.Image:
    bb = content_bbox(im)
    if not bb:
        raise RuntimeError("empty sprite")
    return im.crop(bb)


def two_halves(name: str, *, for_validate: bool = False) -> tuple[Image.Image, Image.Image]:
    """Split sheet in half. Validate opposite limbs on RAW halves (before tight crop)."""
    im = load_chroma(name)
    bb = content_bbox(im)
    if not bb:
        raise RuntimeError(f"{name}: empty")
    x0, y0, x1, y1 = bb
    mid = (x0 + x1) // 2
    raw_a = im.crop((x0, y0, mid, y1))
    raw_b = im.crop((mid, y0, x1, y1))
    if for_validate:
        return raw_a, raw_b
    return crop_content(raw_a), crop_content(raw_b)


def one(name: str) -> Image.Image:
    return crop_content(load_chroma(name))


def hflip(im: Image.Image) -> Image.Image:
    return im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def foot_skew(im: Image.Image) -> float | None:
    """Foot-band mass skew: + = weight on frame-right (east forward)."""
    a = np.asarray(im.convert("RGBA"))
    alpha = a[..., 3] > 40
    if not alpha.any():
        return None
    h, w = alpha.shape
    band = alpha[int(h * 0.62) :, :]
    if not band.any():
        return None
    xs = np.where(band)[1]
    return float(xs.mean() - w / 2.0)


def foot_forward_x(im: Image.Image) -> float | None:
    return foot_skew(im)


def is_opposite_feet(a: Image.Image, b: Image.Image, min_sep: float = 12.0) -> bool:
    fa, fb = foot_skew(a), foot_skew(b)
    if fa is None or fb is None:
        return False
    return (fa * fb) < 0 and abs(fa - fb) >= min_sep


def mse(a: Image.Image, b: Image.Image) -> float:
    aa = np.asarray(a.convert("RGBA").resize((128, 128)), dtype=np.float32)
    bb = np.asarray(b.convert("RGBA").resize((128, 128)), dtype=np.float32)
    return float(((aa - bb) ** 2).mean())


def phase_pair_front(name_contacts: str, name_downs: str, dir_key: str) -> tuple[list[Image.Image], list[Image.Image]]:
    """S/N: take left half as A; B = H-flip(A). Ignore AI 'opposite' halves."""
    ca, _cb = two_halves(name_contacts)
    da, _db = two_halves(name_downs)
    pa = one(f"char_hero_walk_{dir_key}_pass_chroma.png")
    # Prefer flip for pass B — guarantees limb swap even if pass_b is a near-copy
    pb = hflip(pa)
    print(f"  {dir_key}: B phases = H-flip(A) [AI opposite ignored]")
    return [ca, da, pa], [hflip(ca), hflip(da), pb]


def phase_pair_east() -> tuple[list[Image.Image], list[Image.Image]]:
    """E: A/B from halves; opposite check on RAW halves (tight crop kills world-X bias)."""
    ca_r, cb_r = two_halves("char_hero_walk_east_contacts_chroma.png", for_validate=True)
    da_r, db_r = two_halves("char_hero_walk_east_downs_chroma.png", for_validate=True)
    ca, cb = crop_content(ca_r), crop_content(cb_r)
    da, db = crop_content(da_r), crop_content(db_r)
    pa = one("char_hero_walk_east_pass_chroma.png")
    try:
        pb = one("char_hero_walk_east_pass_b_chroma.png")
    except FileNotFoundError:
        pb = None

    def require_opposite(raw_a: Image.Image, raw_b: Image.Image, label: str) -> None:
        if is_opposite_feet(raw_a, raw_b):
            print(f"  east {label}: opposite ok ({foot_skew(raw_a):.1f} vs {foot_skew(raw_b):.1f})")
            return
        raise RuntimeError(
            f"east {label}: AI copy (skew {foot_skew(raw_a)} vs {foot_skew(raw_b)}). "
            f"Regenerate char_hero_walk_east_{label}s with opposite near/far legs."
        )

    require_opposite(ca_r, cb_r, "contact")
    require_opposite(da_r, db_r, "down")
    if pb is None or mse(pa, pb) < 350:
        raise RuntimeError("east pass_b missing or too similar to pass_a — regenerate")
    print(f"  east pass: mse={mse(pa, pb):.0f}")
    return [ca, da, pa], [cb, db, pb]


def row_from_phases(a: list[Image.Image], b: list[Image.Image], target_h: int = 200) -> Image.Image:
    six = [a[0], a[1], a[2], b[0], b[1], b[2]]
    fixed = normalize_sprite_set(
        six, FRAME_SIZE, bob_y=SLYNYRD_WALK_BOB_Y, target_body_h=target_h
    )
    row = Image.new("RGBA", (FRAME_SIZE * WALK_N, FRAME_SIZE), (0, 0, 0, 0))
    for i, fr in enumerate(fixed):
        row.paste(fr, (i * FRAME_SIZE, 0), fr)
    return row


def export_dir(d: str, row: Image.Image) -> None:
    out = FRAMES / "char_hero"
    out.mkdir(parents=True, exist_ok=True)
    frames = []
    for i in range(WALK_N):
        cell = row.crop((i * FRAME_SIZE, 0, (i + 1) * FRAME_SIZE, FRAME_SIZE))
        cell.save(out / f"walk_{d}_{i}.png")
        frames.append(cell)
    for i in range(WALK_N, 8):
        p = out / f"walk_{d}_{i}.png"
        if p.exists():
            p.unlink()
    # preview: линейный loop 0→5 (смена ног в 3–5; не ping-pong)
    save_gif(frames, GIFS / f"char_hero_walk_{d}.gif", duration=100)


def content_height(im: Image.Image) -> int:
    bb = content_bbox(im)
    return (bb[3] - bb[1]) if bb else 0


def main() -> None:
    ROWS.mkdir(parents=True, exist_ok=True)
    print("Building hero walk with forced opposite limbs…")

    s_a, s_b = phase_pair_front(
        "char_hero_walk_south_contacts_chroma.png",
        "char_hero_walk_south_downs_chroma.png",
        "south",
    )
    n_a, n_b = phase_pair_front(
        "char_hero_walk_north_contacts_chroma.png",
        "char_hero_walk_north_downs_chroma.png",
        "north",
    )
    e_a, e_b = phase_pair_east()

    target_h = HERO_BODY_H
    print(f"target_body_h={target_h}, bob_y=0 (no hop; match idle)")

    row_s = row_from_phases(s_a, s_b, target_h)
    row_n = row_from_phases(n_a, n_b, target_h)
    row_e = row_from_phases(e_a, e_b, target_h)
    row_w = mirror_row_cells(row_e, WALK_N, FRAME_SIZE)

    for name, row in [("s", row_s), ("e", row_e), ("n", row_n), ("w", row_w)]:
        row.save(ROWS / f"hero_walk_row_{name}.png")
        export_dir(name, row)
        f = [row.crop((i * FRAME_SIZE, 0, (i + 1) * FRAME_SIZE, FRAME_SIZE)) for i in range(WALK_N)]
        hs = [content_height(x) for x in f]
        print(
            "row",
            name,
            "h",
            hs,
            "mse 0vs3",
            round(mse(f[0], f[3]), 1),
            "2vs5",
            round(mse(f[2], f[5]), 1),
            "feet",
            round(foot_forward_x(f[0]) or 0, 1),
            round(foot_forward_x(f[3]) or 0, 1),
        )

    sheet = compose_dir_rows([row_s, row_e, row_n, row_w])
    (SPRITES / "alpha").mkdir(parents=True, exist_ok=True)
    sheet.save(SPRITES / "char_hero_walk_sheet.png")
    sheet.save(SPRITES / "alpha" / "char_hero_walk_sheet.png")
    flat = Image.new("RGBA", sheet.size, (255, 0, 255, 255))
    flat = Image.alpha_composite(flat, sheet)
    flat.convert("RGB").save(CHROMA / "char_hero_walk_sheet_chroma.png")
    flat.convert("RGB").save(ALT / "char_hero_walk_sheet_chroma.png")
    south = [row_s.crop((i * FRAME_SIZE, 0, (i + 1) * FRAME_SIZE, FRAME_SIZE)) for i in range(WALK_N)]
    save_gif(south, GIFS / "char_hero_walk.gif", duration=100)
    print("DONE hero walk (linear 0-5, feet locked, no bob)")


if __name__ == "__main__":
    main()
