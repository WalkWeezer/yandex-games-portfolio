# UI_PROMPTS — idle-forge

**Роль:** UI/UX агент (арт + разметка логики).  
**Спеки:** `DESIGN_LLM.md` §3–4.  
**Выход:** `refs/ui/` + финал `public/assets/ui/ui_kit_atlas.png`.

## Master lock
```
Mobile casual game UI kit, dark fantasy forge, stone panels, bronze borders #BC6C25, magma CTA #E85D04, rune green #52B788 accents, 9-slice friendly, rounded 16px, readable at 720px width, no text labels, no fake numbers, no iOS glass
```

## U1 — Atlas parts
Generate separately then pack:
- `panel_stone_9slice.png` (64×64 corners marked)
- `btn_primary_9slice.png` (orange)
- `btn_secondary_9slice.png` (bronze)
- `btn_prestige_9slice.png` (green glow)
- `bar_resource.png`
- `icon_tab_upgrades.png` / artifacts / floors / quests / shop
- `modal_frame.png`
- `toast_bg.png`
- `progress_bar_fill.png`

## U2 — Screen mock prompts (for refs/ui)
```
{lock}
Portrait mobile wireframe-looking polished mock of idle forge HUD, top resource bar, large anvil stage empty center, bottom 6 nav buttons, cozy dark fantasy, no readable text (use bars/shapes only)
```

```
{lock}
Portrait modal offline rewards claim, chest icon, two CTA buttons bottom (normal + rewarded video icon shape), stone frame, no letters
```

```
{lock}
Portrait shop screen layout, list of purchase cards with coin/gem icon placeholders, remove-ads card highlighted, no text
```

## U3 — Component contract (code must implement)

| Component | Min touch | States |
|-----------|-----------|--------|
| `ResourceBar` | — | update 10Hz |
| `BtnUpgradeRow` | 48×48 | default/disabled/pressed |
| `AnvilTapTarget` | 120×120 | idle/hit |
| `RewardedCta` | 48×48 | idle/loading/cooldown |
| `ModalOffline` | full | open/close |
| `PassTrack` | horizontal scroll | locked/claimable/claimed |

## U4 — Copy (RU) — strings for localization table
- «Нажми наковальню»
- «Доход/с»
- «Забрать»
- «Забрать ×2»
- «Переплав эпохи»
- «Вас не было: {time}»
- «Макс. оффлайн: {hours}ч»

## Acceptance
- [ ] CTA contrast ≥ 4.5:1 on panels
- [ ] Sticky ad reserved bottom 50–100px optional inset
- [ ] Rewarded always labeled with reward verb
