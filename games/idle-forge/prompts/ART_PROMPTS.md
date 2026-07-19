# ART_PROMPTS — idle-forge

**Роль:** агент-художник. Читай `docs/DESIGN_LLM.md` §4–5.  
**Выход:** файлы в `refs/art/` (превью) → финал в путях Integration Contract.  
**Стиль:** cozy dark fantasy forge, palette §4.2. No text/UI/watermark.

## Master style lock (prepend to every prompt)
```
Style lock: stylized cozy dark fantasy casual game art, warm magma orange #E85D04 and bronze #BC6C25, soft cel-shade, thick readable outlines, no horror, no cyberpunk neon, no photorealism, no text, no UI, no watermark, no logo
```

## A1 — Key art → `refs/art/art_key_forge.png` → `public/assets/art/art_key_forge.png`
```
{style lock}
Game key art 16:9, underground dwarven forge empire, glowing anvils, cute dwarf workers on conveyors, artifact pedestals, gold ingot piles, cinematic composition, idle game marketing illustration
```

## A2 — Floor backgrounds (portrait 720×1280 safe)
| File | Prompt focus |
|------|----------------|
| `env_floor_01_bg.png` | coal hall, warm wood scaffolds |
| `env_floor_02_bg.png` | iron veins, carts, cooler grey |
| `env_floor_03_bg.png` | obsidian purple-black tunnels |
| `env_floor_04_bg.png` | green rune well shrine |
| `env_floor_05_bg.png` | magma heart core epic-cute |

Template:
```
{style lock}
Side-view parallax-friendly game background diorama, [FOCUS], empty center staging for characters, portrait 3:4, consistent camera across floors
```

## A3 — Resource icons 128×128 → `public/assets/ui/icon_*.png`
```
{style lock}
Single game icon transparent background, [ore chunk | gold ingot | spirit ember | green gem], centered, 128x128 padding, thick outline
```

## A4 — Artifact icons (15)
IDs from `artifacts.json`. Template:
```
{style lock}
Fantasy forge artifact icon, [NAME], rarity glow [common soft|rare blue|epic purple|legendary gold], 128x128 transparent, centered
```

## A5 — Store banners
```
{style lock}
Rectangular IAP banner 1024x500, dwarven forge treasure chest aesthetic, leave empty center band for text overlay later, no letters
```

## Delivery checklist
- [ ] Palette matched
- [ ] Filenames = asset IDs
- [ ] Transparent where required
- [ ] Logged in STATUS note for art pass
