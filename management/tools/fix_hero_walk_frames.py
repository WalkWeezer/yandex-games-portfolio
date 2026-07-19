#!/usr/bin/env python3
"""Re-key + feet-align char_hero walk frames (Slynyrd 6-frame)."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_deadline_sprites import (  # noqa: E402
    FRAME_SIZE,
    FRAMES,
    GIFS,
    SPRITES,
    compose_dir_rows,
    normalize_sprite_set,
    save_gif,
    SLYNYRD_WALK_HEIGHT,
)

DIRS = ["s", "e", "n", "w"]
WALK_N = 6


def main() -> None:
    out = FRAMES / "char_hero"
    rows_out = SPRITES / "rig" / "rows"
    rows_out.mkdir(parents=True, exist_ok=True)
    composed = []
    for d in DIRS:
        raw = [Image.open(out / f"walk_{d}_{i}.png") for i in range(WALK_N)]
        fixed = normalize_sprite_set(raw, FRAME_SIZE, height_factors=SLYNYRD_WALK_HEIGHT)
        for i, fr in enumerate(fixed):
            fr.save(out / f"walk_{d}_{i}.png")
        row = Image.new("RGBA", (FRAME_SIZE * WALK_N, FRAME_SIZE), (0, 0, 0, 0))
        for i, fr in enumerate(fixed):
            row.paste(fr, (i * FRAME_SIZE, 0), fr)
        row.save(rows_out / f"hero_walk_row_{d}.png")
        composed.append(row)
        save_gif(fixed, GIFS / f"char_hero_walk_{d}.gif", duration=100)
        a = np.asarray(fixed[0])
        dist = np.linalg.norm(a[..., :3].astype(float) - [255, 0, 255], axis=-1)
        mag = int(((dist < 50) & (a[..., 3] > 200)).sum())
        print(d, "ok opaque_magenta", mag)
    save_gif(
        [composed[0].crop((i * FRAME_SIZE, 0, (i + 1) * FRAME_SIZE, FRAME_SIZE)) for i in range(WALK_N)],
        GIFS / "char_hero_walk.gif",
        duration=100,
    )
    sheet = compose_dir_rows(composed)
    sheet.save(SPRITES / "char_hero_walk_sheet.png")
    (SPRITES / "alpha").mkdir(parents=True, exist_ok=True)
    sheet.save(SPRITES / "alpha" / "char_hero_walk_sheet.png")
    print("DONE")


if __name__ == "__main__":
    main()
