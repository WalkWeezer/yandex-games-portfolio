#!/usr/bin/env python3
"""Copy chroma sheets, cut alpha, content-aware slice frames, build demo GIFs."""
from __future__ import annotations

import shutil
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = Path.home() / ".cursor" / "projects" / "c-Users-borov-Projects-yandex-games-portfolio" / "assets"
SPRITES = ROOT / "games" / "deadline-escape" / "refs" / "sprites"
CHROMA = SPRITES / "chroma"
ALPHA = SPRITES / "alpha"
GIFS = SPRITES / "gifs"
FRAMES = SPRITES / "frames"

KEY = np.array([255, 0, 255], dtype=np.float32)
FRAME_SIZE = 256  # единый холст для всех кадров персонажей/пропов

SHEETS = [
    "sheet-concept.png",
    "sheet-concept-bosses-rest.png",
    "sheet-concept-colleague-vfx.png",
    "char_hero_sheet_chroma.png",
    "char_hero_idle_sheet_chroma.png",
    "char_hero_walk_sheet_chroma.png",
    "char_hero_caught_sheet_chroma.png",
    "char_colleague_sheet_chroma.png",
    "boss_hr_sheet_chroma.png",
    "boss_hr_idle_sheet_chroma.png",
    "boss_hr_walk_sheet_chroma.png",
    "boss_hr_special_sheet_chroma.png",
    "boss_director_sheet_chroma.png",
    "boss_looker_sheet_chroma.png",
    "boss_urgent_sheet_chroma.png",
    "boss_meeting_sheet_chroma.png",
    "boss_guard_sheet_chroma.png",
    "boss_intern_sheet_chroma.png",
    "boss_account_sheet_chroma.png",
    "boss_kpi_sheet_chroma.png",
    "boss_client_sheet_chroma.png",
    "boss_it_sheet_chroma.png",
    "boss_secretary_sheet_chroma.png",
    "tiles_office_sheet_chroma.png",
    "pickups_sheet_chroma.png",
    "vfx_sheet_chroma.png",
]

# Полные анимации ГГ / HR
FULL_ANIMS = [
    {
        "id": "char_hero",
        "idle": "char_hero_idle_sheet.png",
        "idle_grid": True,  # 4×4: ряд = dir, колонка = кадр idle
        "walk": "char_hero_walk_sheet.png",
        "extra": ("caught", "char_hero_caught_sheet.png"),
        "legacy_turn": "char_hero_sheet.png",
    },
    {
        "id": "boss_hr",
        "idle": "boss_hr_idle_sheet.png",
        "idle_grid": False,  # turnaround 4-dir strip (не 4×4 idle)
        "walk": "boss_hr_walk_sheet.png",
        "walk_cols": 6,  # Slynyrd (after compose_hr_walk.py)
        "extra": ("special", "boss_hr_special_sheet.png"),
        "legacy_turn": "boss_hr_sheet.png",
    },
]

CHAR_SHEETS = [
    "char_hero_sheet",
    "char_colleague_sheet",
    "boss_hr_sheet",
    "boss_director_sheet",
    "boss_looker_sheet",
    "boss_urgent_sheet",
    "boss_meeting_sheet",
    "boss_guard_sheet",
    "boss_intern_sheet",
    "boss_account_sheet",
    "boss_kpi_sheet",
    "boss_client_sheet",
    "boss_it_sheet",
    "boss_secretary_sheet",
]


def chroma_to_rgba(im: Image.Image, threshold: float = 42.0, soft: float = 28.0) -> Image.Image:
    """Key pure magenta #FF00FF to alpha.

    Do NOT treat hot-pink clothing as chroma (HR blazer ≈ magenta → holes).
    Only despill the outer rim near KEY.
    """
    rgba = im.convert("RGBA")
    arr = np.asarray(rgba).astype(np.float32)
    rgb = arr[..., :3]
    orig_a = arr[..., 3]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    dist = np.linalg.norm(rgb - KEY, axis=-1)
    # hard key near pure magenta; soft only in a thin band
    alpha = np.clip((dist - threshold) / max(soft, 1e-6) * 255.0, 0, 255)
    alpha = np.where(dist < threshold, 0.0, alpha)
    # never revive already-transparent pixels (pad/compose leftovers)
    alpha = np.where(orig_a < 10, 0.0, np.minimum(alpha, orig_a))

    mag_bias = np.clip((r + b) / 2.0 - g, 0, 255)
    # rim-only cleanup: pixels with a transparent neighbor AND very close to KEY
    opaque = alpha > 24
    pad = np.pad(opaque, 1, constant_values=False)
    neigh = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
    rim = opaque & ~neigh
    near_key = dist < 95
    alpha = np.where(rim & near_key & (mag_bias > 40), 0.0, alpha)

    # despill ONLY rim fringe (keep interior pink solid)
    spill = rim & (mag_bias > 25) & (alpha > 8) & (dist < 120)
    t = np.clip(mag_bias / 100.0, 0, 1)
    r2 = np.where(spill, r * (1 - 0.55 * t) + g * (0.55 * t), r)
    b2 = np.where(spill, b * (1 - 0.55 * t) + g * (0.55 * t), b)

    out = arr.copy()
    out[..., 0] = np.clip(r2, 0, 255)
    out[..., 1] = np.clip(g, 0, 255)
    out[..., 2] = np.clip(b2, 0, 255)
    out[..., 3] = alpha
    dead = alpha < 14
    out[..., 0] = np.where(dead, 0, out[..., 0])
    out[..., 1] = np.where(dead, 0, out[..., 1])
    out[..., 2] = np.where(dead, 0, out[..., 2])
    out[..., 3] = np.where(dead, 0, out[..., 3])
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def find_src(name: str) -> Path | None:
    for base in (ASSETS, SPRITES, CHROMA):
        p = base / name
        if p.exists():
            return p
    alt = SPRITES / name.replace("_chroma", "")
    return alt if alt.exists() else None


def copy_and_cut() -> None:
    CHROMA.mkdir(parents=True, exist_ok=True)
    ALPHA.mkdir(parents=True, exist_ok=True)
    for name in SHEETS:
        src = find_src(name)
        if not src:
            print("MISS", name)
            continue
        if name.endswith("_chroma.png"):
            dst_c = CHROMA / name
            if src.resolve() != dst_c.resolve():
                shutil.copy2(src, dst_c)
            cut = chroma_to_rgba(Image.open(dst_c))
            out_name = name.replace("_chroma", "")
            cut.save(ALPHA / out_name)
            cut.save(SPRITES / out_name)
            print("CUT", out_name)
        elif name.startswith("sheet-concept"):
            shutil.copy2(src, SPRITES / name)
            print("CONCEPT", name)


def pad_to_square(im: Image.Image, side: int, anchor: str = "center") -> Image.Image:
    """Contain into side×side transparent canvas. anchor: center | feet (bottom-center)."""
    im = im.convert("RGBA")
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    tmp = im.copy()
    tmp.thumbnail((side - 8, side - 8), Image.Resampling.LANCZOS)
    x = (side - tmp.width) // 2
    if anchor == "feet":
        y = side - 4 - tmp.height
    else:
        y = (side - tmp.height) // 2
    canvas.paste(tmp, (x, max(0, y)), tmp)
    return canvas


def normalize_sprite_frame(im: Image.Image, side: int = FRAME_SIZE, scale: float | None = None) -> Image.Image:
    """Chroma → crop → optional uniform scale → feet-bottom + horizontal center."""
    cut = chroma_to_rgba(im)
    bb = content_bbox(cut, alpha_min=16)
    if not bb:
        return Image.new("RGBA", (side, side), (0, 0, 0, 0))
    cropped = cut.crop(bb)
    margin = 8
    max_w, max_h = side - margin * 2, side - margin * 2
    if scale is None:
        scale = min(max_w / max(cropped.width, 1), max_h / max(cropped.height, 1), 1.0)
    nw = max(1, int(round(cropped.width * scale)))
    nh = max(1, int(round(cropped.height * scale)))
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    x = (side - nw) // 2
    y = side - margin - nh
    canvas.paste(scaled, (x, max(0, y)), scaled)
    return canvas


def _torso_anchor_x(im: Image.Image, alpha_min: int = 40) -> int:
    """Horizontal anchor = mean X of opaque pixels in upper 45% (stable vs swinging legs)."""
    a = np.asarray(im.split()[-1])
    h, w = a.shape
    band = a[: max(1, int(h * 0.45)), :]
    ys, xs = np.where(band > alpha_min)
    if len(xs) == 0:
        ys, xs = np.where(a > alpha_min)
    if len(xs) == 0:
        return w // 2
    return int(xs.mean())


def normalize_sprite_set(
    frames: list[Image.Image],
    side: int = FRAME_SIZE,
    height_factors: list[float] | None = None,
    bob_y: list[int] | None = None,
    lock_scale: float | None = None,
    target_body_h: int | None = None,
) -> list[Image.Image]:
    """Same base scale; feet on shared baseline; X by torso.

    Prefer bob_y (pixels down) over height_factors — scaling the whole sprite
    makes sideways walk look like the character shrinks.
    target_body_h: force every frame to the same pixel height (walk dirs match).
    """
    cropped: list[Image.Image] = []
    for im in frames:
        cut = chroma_to_rgba(im)
        bb = content_bbox(cut, alpha_min=16)
        if not bb:
            cropped.append(Image.new("RGBA", (1, 1), (0, 0, 0, 0)))
            continue
        cropped.append(cut.crop(bb))
    margin = 10
    max_w, max_h = side - margin * 2, side - margin * 2
    if lock_scale is not None:
        scale = lock_scale
    else:
        scale = 1.0
        for c in cropped:
            if c.width < 2 or c.height < 2:
                continue
            scale = min(scale, max_w / c.width, max_h / c.height)
    out = []
    for i, c in enumerate(cropped):
        hf = 1.0
        if height_factors and i < len(height_factors):
            hf = height_factors[i]
        dy = 0
        if bob_y and i < len(bob_y):
            dy = int(bob_y[i])
        if target_body_h and c.height >= 2:
            nh = max(8, min(max_h, int(target_body_h)))
            nw = max(1, int(round(c.width * (nh / c.height))))
            if nw > max_w:
                nw = max_w
                nh = max(1, int(round(c.height * (nw / c.width))))
        else:
            nw = max(1, int(round(c.width * scale)))
            nh = max(1, int(round(c.height * scale * hf)))
        scaled = c.resize((nw, nh), Image.Resampling.LANCZOS) if c.width > 1 else c
        canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        ax = _torso_anchor_x(scaled)
        x = (side // 2) - ax
        # feet on fixed baseline; dy reserved but default 0 (bob reads as hopping)
        feet_y = side - margin
        y = feet_y - nh + dy
        canvas.paste(scaled, (x, max(0, min(side - nh, y))), scaled)
        out.append(canvas)
    return out


def fit_scale_for_frames(frames: list[Image.Image], side: int = FRAME_SIZE, margin: int = 10) -> float:
    """Uniform contain-scale so all dirs share the same on-screen height budget."""
    max_w = max_h = side - margin * 2
    scale = 1.0
    for im in frames:
        cut = chroma_to_rgba(im)
        bb = content_bbox(cut, alpha_min=16)
        if not bb:
            continue
        c = cut.crop(bb)
        if c.width < 2 or c.height < 2:
            continue
        scale = min(scale, max_w / c.width, max_h / c.height)
    return scale


# No vertical scale bob — it reads as hopping. Keep constant feet baseline.
SLYNYRD_WALK_HEIGHT = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
SLYNYRD_WALK_BOB_Y = [0, 0, 0, 0, 0, 0]
# Shared on-screen body height for idle + walk + caught (avoids idle↔walk pop)
HERO_BODY_H = 200


def mirror_row_horizontal(im: Image.Image) -> Image.Image:
    """Legacy: flip whole strip (also reverses cell order — prefer mirror_row_cells)."""
    return im.convert("RGBA").transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def mirror_row_cells(im: Image.Image, cols: int | None = None, cell: int = FRAME_SIZE) -> Image.Image:
    """Mirror each cell in place for W←E — keeps walk phase order (0..5)."""
    rgba = im.convert("RGBA")
    if cols is None:
        cols = max(1, rgba.width // cell)
    out = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    for i in range(cols):
        x0 = i * cell
        x1 = min(rgba.width, (i + 1) * cell)
        fr = rgba.crop((x0, 0, x1, rgba.height)).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        out.paste(fr, (x0, 0), fr)
    return out


def compose_dir_rows(rows: list[Image.Image], cell: int | None = None) -> Image.Image:
    """Stack equal-height direction rows (S,E,N,W) into one transparent sheet."""
    if not rows:
        raise ValueError("compose_dir_rows: empty rows")
    prepared = [r.convert("RGBA") for r in rows]
    if cell is None:
        cell = prepared[0].height
    width = max(r.width for r in prepared)
    height = sum(r.height for r in prepared)
    out = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    y = 0
    for r in prepared:
        x = (width - r.width) // 2
        out.paste(r, (x, y), r)
        y += r.height
    return out


def extract_pose_row(pose_sheet: Image.Image, row_index: int, cols: int = 4, rows: int = 4) -> Image.Image:
    """Crop one direction row from a pose / character 4×N sheet."""
    im = pose_sheet.convert("RGBA")
    cw, ch = im.width // cols, im.height // rows
    y0 = row_index * ch
    return im.crop((0, y0, im.width, y0 + ch))


def slice_by_blobs(im: Image.Image, expect: int | None = None, min_area: int = 400) -> list[Image.Image]:
    """Split a horizontal sheet by alpha column-gaps; normalize to FRAME_SIZE."""
    rgba = im.convert("RGBA")
    a = np.asarray(rgba.split()[-1])
    mask = a > 28
    if not mask.any():
        return []
    h, w = mask.shape
    ys, xs = np.where(mask)
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    band = mask[y0:y1, x0:x1]
    col_sum = band.sum(axis=0)
    thr = max(8, int(band.shape[0] * 0.02))

    # Find runs of content columns
    runs = []
    in_run = False
    start = 0
    for i, v in enumerate(col_sum):
        if v >= thr and not in_run:
            in_run = True
            start = i
        elif v < thr and in_run:
            in_run = False
            runs.append((start, i))
    if in_run:
        runs.append((start, len(col_sum)))

    # Drop tiny runs
    runs = [(a, b) for a, b in runs if (b - a) * band.shape[0] >= min_area // 4]
    if not runs:
        return []

    # Merge runs separated by tiny gaps (broken sprites)
    merged = [list(runs[0])]
    for a, b in runs[1:]:
        gap = a - merged[-1][1]
        if gap <= max(6, int(0.015 * w)):
            merged[-1][1] = b
        else:
            merged.append([a, b])

    # If too many, keep widest `expect` runs
    if expect and len(merged) > expect:
        scored = sorted(merged, key=lambda r: -(r[1] - r[0]))[:expect]
        scored.sort(key=lambda r: r[0])
        merged = scored

    # If too few vs expect — equal split of content band
    if expect and len(merged) < expect:
        col_w = max(1, (x1 - x0) // expect)
        frames = []
        for i in range(expect):
            cx0 = x0 + i * col_w
            cx1 = x0 + (i + 1) * col_w if i < expect - 1 else x1
            cell = rgba.crop((cx0, y0, cx1, y1))
            bb = content_bbox(cell)
            if bb:
                cell = cell.crop(bb)
            frames.append(pad_to_square(cell, FRAME_SIZE))
        return frames

    frames = []
    for a, b in merged:
        cx0 = x0 + a
        cx1 = x0 + b
        cell = rgba.crop((max(0, cx0 - 2), y0, min(w, cx1 + 2), y1))
        bb = content_bbox(cell)
        if bb:
            cell = cell.crop(bb)
        # skip dust
        if cell.width * cell.height < min_area // 2:
            continue
        frames.append(pad_to_square(cell, FRAME_SIZE))
    return frames


def content_bbox(im: Image.Image, alpha_min: int = 20):
    a = np.asarray(im.split()[-1])
    ys, xs = np.where(a > alpha_min)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def keep_largest_alpha_blob(im: Image.Image, alpha_min: int = 20) -> Image.Image:
    """Drop orphan pixels (e.g. feet bleeding from the row above into idle cells)."""
    rgba = im.convert("RGBA")
    arr = np.asarray(rgba)
    mask = arr[..., 3] > alpha_min
    if not mask.any():
        return rgba
    # 4-connected components
    h, w = mask.shape
    labels = np.zeros((h, w), dtype=np.int32)
    label = 0
    areas: dict[int, int] = {}
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or labels[y, x]:
                continue
            label += 1
            stack = [(y, x)]
            labels[y, x] = label
            area = 0
            while stack:
                cy, cx = stack.pop()
                area += 1
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not labels[ny, nx]:
                        labels[ny, nx] = label
                        stack.append((ny, nx))
            areas[label] = area
    if not areas:
        return rgba
    keep = max(areas, key=areas.get)
    out = arr.copy()
    out[labels != keep, 3] = 0
    # clear RGB on dropped pixels to avoid magenta fringe revive later
    out[labels != keep, :3] = 0
    return Image.fromarray(out, "RGBA")


def slice_grid_fixed(im: Image.Image, cols: int, rows: int) -> list[Image.Image]:
    """Equal split of full image — for composed N×M sheets (exact cell grid)."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    cw, rh = w / cols, h / rows
    out = []
    for r in range(rows):
        for c in range(cols):
            cx0 = int(c * cw)
            cx1 = int((c + 1) * cw) if c < cols - 1 else w
            cy0 = int(r * rh)
            cy1 = int((r + 1) * rh) if r < rows - 1 else h
            cell = rgba.crop((cx0, cy0, cx1, cy1))
            bb = content_bbox(cell)
            if bb:
                cell = cell.crop(bb)
            out.append(pad_to_square(cell, FRAME_SIZE))
    return out


def slice_rows_by_blobs(
    im: Image.Image,
    cols: int,
    rows: int,
    min_area: int = 600,
    height_factors: list[float] | None = None,
    target_body_h: int | None = None,
) -> list[Image.Image]:
    """Split by equal-height rows, then column-gap blobs — safe for uneven AI sheets.

    Fixed NxM grids cut through characters when spacing is irregular; this keeps
    each figure whole, then feet/torso-normalizes per row.
    """
    rgba = chroma_to_rgba(im) if im.mode != "RGBA" else im.convert("RGBA")
    # re-key even if already RGBA (magenta fringe / leftover key)
    rgba = chroma_to_rgba(rgba)
    w, h = rgba.size
    rh = h / rows
    out: list[Image.Image] = []
    for r in range(rows):
        cy0 = int(r * rh)
        cy1 = int((r + 1) * rh) if r < rows - 1 else h
        row = rgba.crop((0, cy0, w, cy1))
        parts = slice_by_blobs(row, expect=cols, min_area=min_area)
        while len(parts) < cols and parts:
            parts.append(parts[-1].copy())
        parts = parts[:cols]
        # strip pad_to_square letterbox; drop row-bleed orphans before normalize
        raw = []
        for p in parts:
            clean = keep_largest_alpha_blob(p, alpha_min=16)
            bb = content_bbox(clean, alpha_min=16)
            raw.append(clean.crop(bb) if bb else clean)
        factors = height_factors if (height_factors and len(height_factors) == cols) else None
        out.extend(
            normalize_sprite_set(
                raw, FRAME_SIZE, height_factors=factors, target_body_h=target_body_h
            )
        )
    return out


def slice_grid_equal(im: Image.Image, cols: int, rows: int) -> list[Image.Image]:
    """Equal grid on content bbox — loose sheets. Prefer slice_grid_fixed for composed grids."""
    rgba = im.convert("RGBA")
    a = np.asarray(rgba.split()[-1])
    mask = a > 28
    if not mask.any():
        return []
    ys, xs = np.where(mask)
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    bw, bh = x1 - x0, y1 - y0
    # If content already fills a clean grid canvas, use fixed split (avoids miscrop)
    if abs(bw - rgba.width) < 8 and abs(bh - rgba.height) < 8:
        return slice_grid_fixed(rgba, cols, rows)
    cw, rh = bw / cols, bh / rows
    out = []
    for r in range(rows):
        for c in range(cols):
            cx0 = int(x0 + c * cw)
            cx1 = int(x0 + (c + 1) * cw) if c < cols - 1 else x1
            cy0 = int(y0 + r * rh)
            cy1 = int(y0 + (r + 1) * rh) if r < rows - 1 else y1
            cell = rgba.crop((cx0, cy0, cx1, cy1))
            bb = content_bbox(cell)
            if bb:
                cell = cell.crop(bb)
            out.append(pad_to_square(cell, FRAME_SIZE))
    return out


def build_full_anims() -> None:
    """Idle 4-dir + walk 4x4 + caught/special strips for hero & HR."""
    dirs = ["s", "e", "n", "w"]
    for spec in FULL_ANIMS:
        cid = spec["id"]
        out = FRAMES / cid
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True, exist_ok=True)

        idle_path = SPRITES / spec["idle"]
        if not idle_path.exists() and spec.get("legacy_turn"):
            idle_path = SPRITES / spec["legacy_turn"]

        leg = FRAMES / ("char_hero_sheet" if cid == "char_hero" else "boss_hr_sheet" if cid == "boss_hr" else f"{cid}_sheet")
        if leg.exists():
            shutil.rmtree(leg)
        leg.mkdir(parents=True, exist_ok=True)

        if spec.get("idle_grid") and idle_path.exists():
            # hero AI sheets are uneven — row blobs; composed grids can stay fixed
            body_h = HERO_BODY_H if cid == "char_hero" else None
            if spec.get("idle_slice") == "fixed":
                grid = slice_grid_fixed(Image.open(idle_path), 4, 4)
                if body_h:
                    grid = normalize_sprite_set(grid, FRAME_SIZE, target_body_h=body_h)
            else:
                grid = slice_rows_by_blobs(
                    Image.open(idle_path), 4, 4, min_area=600, target_body_h=body_h
                )
            print(cid, "idle cells", len(grid), "via", spec.get("idle_slice") or "row_blobs", "body_h", body_h)
            turn_preview = []
            if len(grid) >= 16:
                for ri, d in enumerate(dirs):
                    row = grid[ri * 4 : ri * 4 + 4]
                    for fi, fr in enumerate(row):
                        fr.save(out / f"idle_{d}_{fi}.png")
                    row[0].save(out / f"idle_{d}.png")
                    row[0].save(leg / f"{d}.png")
                    ping = row + row[-2:0:-1]
                    save_gif(ping, GIFS / f"{cid}_idle_{d}.gif", duration=180)
                    turn_preview.append(row[0])
                south = grid[0:4]
                save_gif(south + south[-2:0:-1], GIFS / f"{cid}_idle.gif", duration=180)
                if turn_preview:
                    save_gif(turn_preview, GIFS / f"{cid}_idle_turn.gif", duration=300)
                # rewrite idle sheet as clean 4×4 grid
                sheet = Image.new("RGBA", (FRAME_SIZE * 4, FRAME_SIZE * 4), (0, 0, 0, 0))
                for i, fr in enumerate(grid[:16]):
                    sheet.paste(fr, ((i % 4) * FRAME_SIZE, (i // 4) * FRAME_SIZE), fr)
                sheet.save(SPRITES / spec["idle"])
                (SPRITES / "alpha").mkdir(parents=True, exist_ok=True)
                sheet.save(SPRITES / "alpha" / Path(spec["idle"]).name)
        else:
            idle_frames = slice_by_blobs(Image.open(idle_path), expect=4, min_area=600) if idle_path.exists() else []
            while len(idle_frames) < 4 and idle_frames:
                idle_frames.append(idle_frames[-1].copy())
            idle_frames = idle_frames[:4]
            for i, d in enumerate(dirs):
                if i < len(idle_frames):
                    idle_frames[i].save(out / f"idle_{d}.png")
                    idle_frames[i].save(leg / f"{d}.png")
            if idle_frames:
                save_gif(idle_frames, GIFS / f"{cid}_idle_turn.gif", duration=300)

        walk_path = SPRITES / spec["walk"]
        walk_gifs = []
        if walk_path.exists():
            # Slynyrd 6×4 for hero/HR; others may still be 4×4
            wcols = int(spec.get("walk_cols") or (6 if cid == "char_hero" else 4))
            if wcols == 6:
                grid = slice_rows_by_blobs(
                    Image.open(walk_path), wcols, 4, min_area=500, height_factors=SLYNYRD_WALK_HEIGHT
                )
            else:
                grid = slice_grid_fixed(Image.open(walk_path), wcols, 4)
            print(cid, "walk cells", len(grid), f"({wcols}x4)")
            need = wcols * 4
            if len(grid) >= need:
                for ri, d in enumerate(dirs):
                    row = grid[ri * wcols : ri * wcols + wcols]
                    for fi, fr in enumerate(row):
                        fr.save(out / f"walk_{d}_{fi}.png")
                    # Slynyrd: linear loop @ 100ms; legacy 4-frame: ping-pong
                    if wcols == 6:
                        save_gif(row, GIFS / f"{cid}_walk_{d}.gif", duration=100)
                    else:
                        ping = row + row[-2:0:-1]
                        save_gif(ping, GIFS / f"{cid}_walk_{d}.gif", duration=100)
                    walk_gifs.extend(row)
                south = grid[0:wcols]
                save_gif(south, GIFS / f"{cid}_walk.gif", duration=100)
                if wcols == 6:
                    sheet = Image.new("RGBA", (FRAME_SIZE * wcols, FRAME_SIZE * 4), (0, 0, 0, 0))
                    for i, fr in enumerate(grid[:need]):
                        sheet.paste(fr, ((i % wcols) * FRAME_SIZE, (i // wcols) * FRAME_SIZE), fr)
                    sheet.save(SPRITES / spec["walk"])
                    (SPRITES / "alpha").mkdir(parents=True, exist_ok=True)
                    sheet.save(SPRITES / "alpha" / Path(spec["walk"]).name)

        extra_name, extra_file = spec["extra"]
        extra_path = SPRITES / extra_file
        if extra_path.exists():
            extras = slice_by_blobs(Image.open(extra_path), expect=4, min_area=400)
            for i, fr in enumerate(extras[:4]):
                fr.save(out / f"{extra_name}_{i}.png")
            if extras:
                save_gif(extras[:4], GIFS / f"{cid}_{extra_name}.gif", duration=160)

        print("FULL ANIM", cid, "->", out)


def save_gif(frames: list[Image.Image], path: Path, duration: int = 220, size: int = 96) -> None:
    if not frames:
        return
    scaled = []
    for f in frames:
        im = pad_to_square(f.convert("RGBA"), size)
        bg = Image.new("RGBA", (size, size), (40, 48, 58, 255))
        for y in range(0, size, 8):
            for x in range(0, size, 8):
                if (x // 8 + y // 8) % 2 == 0:
                    for dy in range(min(8, size - y)):
                        for dx in range(min(8, size - x)):
                            bg.putpixel((x + dx, y + dy), (55, 65, 78, 255))
        composed = Image.alpha_composite(bg, im)
        scaled.append(composed.convert("P", palette=Image.Palette.ADAPTIVE, colors=128))
    path.parent.mkdir(parents=True, exist_ok=True)
    scaled[0].save(
        path,
        save_all=True,
        append_images=scaled[1:],
        duration=duration,
        loop=0,
        optimize=False,
        disposal=2,
    )
    print("GIF", path.name, "frames", len(frames))


def build_gifs() -> None:
    GIFS.mkdir(parents=True, exist_ok=True)
    FRAMES.mkdir(parents=True, exist_ok=True)
    # Только 4 ракурса — без «special»
    labels = ["s", "e", "n", "w"]

    for stem in CHAR_SHEETS:
        path = SPRITES / f"{stem}.png"
        if not path.exists():
            print("NO SHEET", stem)
            continue
        frames = slice_by_blobs(Image.open(path), expect=4, min_area=800)
        if len(frames) < 4:
            print("WARN", stem, "got", len(frames), "blobs, retry looser")
            frames = slice_by_blobs(Image.open(path), expect=4, min_area=300)
        fdir = FRAMES / stem
        if fdir.exists():
            shutil.rmtree(fdir)
        fdir.mkdir(parents=True, exist_ok=True)
        # drop extras beyond 4; if fewer, duplicate last
        while len(frames) < 4 and frames:
            frames.append(frames[-1].copy())
        frames = frames[:4]
        for i, fr in enumerate(frames):
            fr.save(fdir / f"{labels[i]}.png")
        # remove old special.png if present
        sp = fdir / "special.png"
        if sp.exists():
            sp.unlink()
        save_gif(frames, GIFS / f"{stem}_turn.gif", duration=280)
        print("CHAR", stem, "->", len(frames), "frames @", FRAME_SIZE)

    tiles = SPRITES / "tiles_office_sheet.png"
    if tiles.exists():
        tframes = slice_by_blobs(Image.open(tiles), expect=6, min_area=500)
        names = ["floor_a", "floor_b", "wall", "desk", "plant", "cooler"]
        print("TILES blobs", len(tframes))
        for i, name in enumerate(names):
            if i < len(tframes):
                tframes[i].save(FRAMES / f"tile_{name}.png")
                save_gif([tframes[i], tframes[i]], GIFS / f"tile_{name}.gif", duration=500)
        if tframes:
            save_gif(tframes[:6], GIFS / "tiles_office_sheet.gif", duration=350)

    pick = SPRITES / "pickups_sheet.png"
    if pick.exists():
        pframes = slice_by_blobs(Image.open(pick), expect=3, min_area=400)
        names = ["coin", "coffee", "badge"]
        print("PICKUPS blobs", len(pframes))
        for i, name in enumerate(names):
            if i >= len(pframes):
                break
            fr = pframes[i]
            fr.save(FRAMES / f"pu_{name}.png")
            bob = []
            for dy in (0, -6, 0, 6):
                canvas = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
                canvas.paste(fr, (0, dy), fr)
                bob.append(canvas)
            save_gif(bob, GIFS / f"pu_{name}.gif", duration=160)
        if pframes:
            save_gif(pframes[:3], GIFS / "pickups_sheet.gif", duration=300)

    vfx = SPRITES / "vfx_sheet.png"
    if vfx.exists():
        vframes = slice_by_blobs(Image.open(vfx), expect=8, min_area=250)
        names = ["shield", "steam", "invuln", "near_miss", "report", "dash", "slam", "confetti"]
        print("VFX blobs", len(vframes))
        for i, name in enumerate(names):
            if i >= len(vframes):
                break
            fr = vframes[i]
            fr.save(FRAMES / f"vfx_{name}.png")
            save_gif([fr, fr], GIFS / f"vfx_{name}.gif", duration=200)
        if vframes:
            save_gif(vframes[:8], GIFS / "vfx_sheet.gif", duration=280)

    for name in ("sheet-concept.png", "sheet-concept-bosses-rest.png", "sheet-concept-colleague-vfx.png"):
        p = SPRITES / name
        if p.exists():
            im = Image.open(p).convert("RGBA")
            im.thumbnail((320, 200), Image.Resampling.LANCZOS)
            save_gif([im, im], GIFS / name.replace(".png", ".gif"), duration=800, size=max(im.size))


def main() -> None:
    copy_and_cut()
    build_gifs()
    build_full_anims()
    print("DONE sprites pipeline")


if __name__ == "__main__":
    main()
