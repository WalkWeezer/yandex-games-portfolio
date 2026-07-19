# ART_PROMPTS — Кристаллы Архипелага

> Канон: `docs/DESIGN_LLM.md` §5–6, §9. Выход: `refs/art/` → `public/assets/images/`.

## Style lock

```text
Bright polished casual match-3 art, tropical archipelago paradise, faceted crystal gems, turquoise water, lush islands, gold UI accents, sunny cheerful, mobile game, no text no logos no watermarks
```

## Palette

`#2EC4B6 #1B7A8F #2F9E44 #F2D6A0 #E6C35C #1A2430 #E23D3D #3D7AED #2FBE6A #9B5DE5 #F2C14E #6EC6FF`

---

## A. Marketing

### A1 Key art (ref exists)
```text
Tropical match-3 key art, dark gold-framed gem board over turquoise lagoon, faceted red blue green purple yellow crystals, yellow column clearing with golden light and shards, islands with waterfalls temple tiki statue sailboat thatched hut rainbow sky, lush palms purple flowers, bright casual mobile, no text
```

### A2 Icon
```text
App icon single faceted yellow diamond gem with turquoise glow and tiny island silhouette, simple readable, no text
```

### A3 Cover 16:9
```text
Wide tropical archipelago banner, gem board suggestion left, islands right, title-safe center empty, no text
```

---

## B. Environments

### B1 `bg_map`
```text
9:16 hand-painted tropical archipelago world map soft stylized islands paths for level nodes, turquoise sea, sunny, empty node markers space, no text
```

### B2 Island BGs
```text
Three 9:16 level backgrounds: 1 lagoon beach hut sailboat, 2 cliff temple waterfall red roof, 3 jagged peaks twin waterfalls; soft blur center for board overlay, no text no UI
```

### B3 `ui_board_frame`
```text
Dark rounded rectangle board frame thin gold border, subtle shield side protrusions matching key art, transparent center 8x8 area, mobile match3 frame asset
```

---

## C. Gems & specials

### C1 Base gems
```text
Transparent icons 512: red hexagon ruby, blue teardrop sapphire, green octagon emerald, purple hex amethyst, yellow diamond topaz; glossy faceted match3 style consistent light top-left
```

### C2 Specials
```text
Transparent: horizontal rocket gem, vertical rocket, bomb gem orb, rainbow star gem; match3 specials matching crystal style
```

### C3 Blockers
```text
Stone block hp1 hp2, vine wrap hp1 hp2, crystal shell overlay; transparent match3 blockers tropical stone look
```

---

## D. Boosters / UI icons

```text
Booster icons transparent: hammer, swirl fan shuffle, line beam, chroma brush; life heart, coin, gem currency, star; casual tropical gold teal
```

### Map nodes
```text
Level node states: locked, available, cleared 1star 2star 3star, chest node; tropical wood gold, transparent
```

---

## E. VFX stills

```text
Match3 VFX on transparent: gem shatter shards per color, rocket streak, bomb ring, rainbow beam, star burst win
```

## Delivery
Names = asset IDs; `refs/art/MANIFEST.md`
