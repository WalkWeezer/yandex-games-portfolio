# ART_PROMPTS — Базар Слияний

> Канон: `docs/DESIGN_LLM.md` §5–6, §9. Выход: `refs/art/` → `public/assets/images/`.

## Style lock

```text
Cozy fantasy bazaar, warm sunlight, purple and gold accents, polished 2D mobile game art, soft shading, clean silhouettes, cheerful merchant and ginger cat, no horror, no text, no watermarks
```

## Palette

`#6B3FA0 #E6B35A #8B5A2B #3F8F4E #3D6FE8 #D63A3A #F3C98B #FFF6E8 #2A1B12 #2EC4B6`

---

## A. Key / store

### A1 Key art (ref exists)
```text
Cozy fantasy market stall, young merchant woman wavy brown hair purple ribbon purple vest gold trim white blouse, ginger tabby cat, wooden three-tier shelves showing merge progressions apples to golden bowl, blue potions to moon jar, sprouts to spirit bonsai, purple white striped awning, sunny village square fountain half-timbered houses, warm polished mobile key art, no text
```

### A2 Icon
```text
App icon golden fruit bowl glowing on purple awning cloth, cozy simple readable, no text
```

### A3 Cover 16:9
```text
Wide cozy bazaar banner merchant and cat left, merge shelves center, village right, title-safe center empty, no text
```

---

## B. Environments

### B1 `bg_shop_square_01`
```text
9:16 mobile background sunny fantasy village bazaar square, fountain, banners, flower boxes, soft depth, empty center lower area for shop UI, cozy warm light, no text no characters
```

### B2 `bg_board_wood_01`
```text
9:16 wooden merchant countertop top view slight perspective for merge board, purple cloth edges, warm light, empty grid space center, cozy fantasy, no items no text
```

### B3 `bg_decor_shop_01`
```text
Shop interior backdrop with clear hotspots for placing decor, shelves and window to square, cozy purple gold wood, 9:16, no text
```

---

## C. Characters

### C1 Merchant
```text
Full body and bust of cozy fantasy young merchant woman, purple vest gold trim, friendly smile, consistent with key art, mobile game character sheet on transparent, multiple poses: idle wave, present item, happy
```

### C2 Cat mascot
```text
Cute ginger tabby cat mascot, transparent, poses: sit, sleep, happy paws, consistent cozy style
```

### C3 NPCs
```text
Three cozy fantasy customer NPCs bust portraits: traveler, noble, child, warm style transparent circular crop friendly
```

---

## D. Items — chains

### D1 Fruit chain 01–10
```text
Transparent PNG merge icons, fruit chain 10 tiers: single red apple, two apples, small basket, medium basket, large basket, ornate bowl, glowing bowl, golden chalice of apples, legendary crystal fruit, mythical cornucopia; consistent cozy lighting, each clear silhouette, equal canvas 512
```

### D2 Potion chain
```text
Potion merge chain 10 tiers small blue vial to ornate moon-and-star ceramic jar with gold charms, cozy fantasy alchemy, transparent, consistent style
```

### D3 Plant chain
```text
Plant merge chain 8-10 tiers sprout in terracotta to flowering plant to spirit bonsai gold blue base, cozy fantasy, transparent
```

### D4 Generators
```text
Three generator props on transparent: fruit crate generator, alchemy shelf generator, flower pot generator; states idle and ready glow
```

---

## E. Decor (10)

```text
Set of 10 cozy bazaar decor props transparent: purple awning upgrade, lantern, carpet, flower box, signboard, teapot set, cushion, fairy lights, cat bed, golden scale; mobile game
```

---

## F. UI-adjacent icons

```text
Icons transparent 256: energy lightning teardrop teal, gold coin, gem purple, decor key, order check, stash bag
```

## Delivery
- File names = asset IDs (`item_fruit_01.png` …)  
- `refs/art/MANIFEST.md` list
