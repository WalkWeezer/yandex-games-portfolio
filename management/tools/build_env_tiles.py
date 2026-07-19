#!/usr/bin/env python3
"""Build seamless floor + office props (no walls) for deadline-escape."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_deadline_sprites import (  # noqa: E402
    ASSETS,
    CHROMA,
    FRAME_SIZE,
    FRAMES,
    GIFS,
    SPRITES,
    chroma_to_rgba,
    content_bbox,
    save_gif,
    slice_by_blobs,
)

ALT = Path.home() / ".cursor" / "projects" / "c-Users-borov-Projects-yandex-games-portfolio" / "assets"


def load(name: str) -> Image.Image:
    for base in (ALT, ASSETS, CHROMA):
        p = base / name
        if p.exists():
            return chroma_to_rgba(Image.open(p))
    raise FileNotFoundError(name)


def crop_content(im: Image.Image) -> Image.Image:
    bb = content_bbox(im)
    return im.crop(bb) if bb else im


def force_square_fill(im: Image.Image, side: int) -> Image.Image:
    """Stretch content to full side×side (seamless floors — no letterbox gaps)."""
    im = crop_content(im).convert("RGBA")
    return im.resize((side, side), Image.Resampling.LANCZOS)


def prop_frame(im: Image.Image, side: int = FRAME_SIZE) -> Image.Image:
    """Center prop in square (no character feet-baseline)."""
    cut = chroma_to_rgba(im) if im.mode != "RGBA" else im.convert("RGBA")
    bb = content_bbox(cut, alpha_min=16)
    if not bb:
        return Image.new("RGBA", (side, side), (0, 0, 0, 0))
    cropped = cut.crop(bb)
    margin = 6
    max_w = max_h = side - margin * 2
    scale = min(max_w / max(cropped.width, 1), max_h / max(cropped.height, 1))
    nw = max(1, int(round(cropped.width * scale)))
    nh = max(1, int(round(cropped.height * scale)))
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(scaled, ((side - nw) // 2, (side - nh) // 2), scaled)
    return canvas


def prop_frame_wide(im: Image.Image, w: int, h: int) -> Image.Image:
    """Whole 2×1 desk in one wide frame — do not bisect or feet-pin."""
    cut = chroma_to_rgba(im) if im.mode != "RGBA" else im.convert("RGBA")
    bb = content_bbox(cut, alpha_min=16)
    if not bb:
        return Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cropped = cut.crop(bb)
    margin = 4
    scale = min((w - margin * 2) / max(cropped.width, 1), (h - margin * 2) / max(cropped.height, 1))
    nw = max(1, int(round(cropped.width * scale)))
    nh = max(1, int(round(cropped.height * scale)))
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.paste(scaled, ((w - nw) // 2, (h - nh) // 2), scaled)
    return canvas


def main() -> None:
    FRAMES.mkdir(parents=True, exist_ok=True)
    GIFS.mkdir(parents=True, exist_ok=True)
    CHROMA.mkdir(parents=True, exist_ok=True)

    # --- floors (seamless): prefer dedicated gen files, else chroma sheet ---
    floor_a = floor_b = None
    for name_a, name_b in (
        ("tiles_floor_a_gen.png", "tiles_floor_b_gen.png"),
        ("tile_floor_a_src.png", "tile_floor_b_src.png"),
    ):
        pa = next((b / name_a for b in (ALT, ASSETS, CHROMA) if (b / name_a).exists()), None)
        pb = next((b / name_b for b in (ALT, ASSETS, CHROMA) if (b / name_b).exists()), None)
        if pa and pb:
            floor_a = force_square_fill(Image.open(pa).convert("RGBA"), FRAME_SIZE)
            floor_b = force_square_fill(Image.open(pb).convert("RGBA"), FRAME_SIZE)
            print("floors from", pa.name, pb.name)
            break
    if floor_a is None:
        floors = load("tiles_floor_seamless_chroma.png")
        fparts = slice_by_blobs(floors, expect=2, min_area=400)
        if len(fparts) < 2:
            bb = content_bbox(floors)
            x0, y0, x1, y1 = bb
            mid = (x0 + x1) // 2
            fparts = [floors.crop((x0, y0, mid, y1)), floors.crop((mid, y0, x1, y1))]
        floor_a = force_square_fill(fparts[0], FRAME_SIZE)
        floor_b = force_square_fill(fparts[1], FRAME_SIZE)
    floor_a.save(FRAMES / "tile_floor_a.png")
    floor_b.save(FRAMES / "tile_floor_b.png")
    save_gif([floor_a, floor_a], GIFS / "tile_floor_a.gif", duration=500)
    save_gif([floor_b, floor_b], GIFS / "tile_floor_b.gif", duration=500)

    # --- props: desk1, desk2, plant, cooler ---
    props = load("tiles_props_office_chroma.png")
    pp = slice_by_blobs(props, expect=4, min_area=500)
    if len(pp) < 4:
        print("WARN props blobs", len(pp), "— retry looser")
        pp = slice_by_blobs(props, expect=4, min_area=200)
    names = ["desk", "desk2", "plant", "cooler"]
    desk2_w, desk2_h = FRAME_SIZE * 2, FRAME_SIZE
    for i, name in enumerate(names):
        if i >= len(pp):
            break
        if name == "desk2":
            fr = prop_frame_wide(pp[i], desk2_w, desk2_h)
        else:
            fr = prop_frame(pp[i], FRAME_SIZE)
        fr.save(FRAMES / f"tile_{name}.png")
        save_gif([fr, fr], GIFS / f"tile_{name}.gif", duration=400)
        print("prop", name, fr.size)

    # combined sheet for gallery (no wall); desk2 is 2 cells wide
    sheet_w = FRAME_SIZE * 7  # floor×2 + desk + desk2(2) + plant + cooler
    sheet = Image.new("RGBA", (sheet_w, FRAME_SIZE), (0, 0, 0, 0))
    pieces: list[Image.Image] = [floor_a, floor_b]
    for name in names:
        p = FRAMES / f"tile_{name}.png"
        if p.exists():
            pieces.append(Image.open(p).convert("RGBA"))
    x = 0
    for fr in pieces:
        sheet.paste(fr, (x, 0), fr)
        x += fr.width
    sheet.save(SPRITES / "tiles_office_sheet.png")
    (SPRITES / "alpha").mkdir(parents=True, exist_ok=True)
    sheet.save(SPRITES / "alpha" / "tiles_office_sheet.png")
    flat = Image.new("RGBA", sheet.size, (255, 0, 255, 255))
    flat = Image.alpha_composite(flat, sheet)
    flat.convert("RGB").save(CHROMA / "tiles_office_sheet_chroma.png")
    flat.convert("RGB").save(ALT / "tiles_office_sheet_chroma.png")
    save_gif(pieces[:6], GIFS / "tiles_office_sheet.gif", duration=350)

    # fog soft vignette tile (procedural)
    fog = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    import numpy as np
    arr = np.zeros((FRAME_SIZE, FRAME_SIZE, 4), dtype=np.uint8)
    cy = cx = FRAME_SIZE / 2
    for y in range(FRAME_SIZE):
        for x in range(FRAME_SIZE):
            # edge fog sample — denser at borders
            d = min(x, y, FRAME_SIZE - 1 - x, FRAME_SIZE - 1 - y) / (FRAME_SIZE * 0.45)
            a = int(max(0, min(220, (1 - d) * 200)))
            arr[y, x] = (18, 22, 40, a)
    fog = Image.fromarray(arr, "RGBA")
    fog.save(FRAMES / "tile_fog.png")
    save_gif([fog, fog], GIFS / "tile_fog.gif", duration=500)
    print("DONE env tiles (no walls)")


if __name__ == "__main__":
    main()
