# UI_PROMPTS — Легенды Поля

> Для UI/UX агента. Канон: `docs/DESIGN_LLM.md` §4–5, §9.  
> Выход: макеты в `refs/ui/` + нарезанный UI kit → `public/assets/images/ui/`.  
> Платформа: мобильный портрет 720×1280, Яндекс Игры.

## Style lock

```text
Holographic glass UI, dark navy panels #0B1B33, neon cyan #3DE7FF and gold #FFC84A edges, high contrast white text, cyber football manager aesthetic, large thumb-friendly buttons, no clutter, no real logos, Russian labels when mocking screens
```

## Hit target rules

- Min 64×64 logical.  
- Primary CTA высота ≥ 88.  
- Отступ от краёв ≥ 24.  
- Safe bottom 64 для жестов браузера.

---

## Screen prompts (генерация вайрфрейм-мокапов)

### Hub
```text
Mobile game UI mockup 9:16, football club hub, top currency bar coins and gems, club banner with form and morale meters, big PLAY button center, bottom nav Deck Market Shop, holographic navy glass, neon accents, Russian labels: Играть Колода Рынок Магазин, clean no clutter
```

### Placement
```text
Mobile UI 9:16 football autochess placement, pitch with 7 card slots formation 2-3-2 plus GK, hand of cards bottom, synergy chips row, cost 12/18, reroll button, CTA В БОЙ, neon tactical grid, dark stadium bg, thumb friendly
```

### Autobattle HUD
```text
Mobile UI overlay only on transparent: score 2:1, half and tick counter, skill energy bar, three intervention buttons Тайм-аут Замена Скилл, speed x2 toggle, holographic cyber sports, large controls, no blocking center pitch
```

### Results
```text
Mobile results screen victory, score, MMR change, soft currency reward, OK button, subtle space for interstitial ad banner bottom, navy gold holographic, Russian ПОБЕДА
```

### Deck / Card detail
```text
Card collection grid UI and card detail panel with stats ATK DEF SPD SKL, upgrade button, dust convert, rarity frame gold/purple, cyber sports, Russian labels
```

### Market
```text
Transfer market UI three offer cards with soft/hard prices, refresh button, daily timer, holographic shop stalls vibe, mobile 9:16
```

### Shop / Packs
```text
IAP shop UI: daily pack, premium pack, mega pack, battle pass, remove ads, clear prices, compliance friendly wording Набор карт, no gambling imagery
```

### Pass
```text
Battle pass track horizontal nodes free vs premium, football cyber theme, claim buttons, level 7 highlighted
```

---

## UI kit generation prompt

```text
Complete mobile UI kit on transparent: primary button up/down/disabled, secondary button, close icon, modal panel, tooltip, toast bar, tab pills, toggle, progress bars, currency bar, scrollbar, neon cyan gold on navy glass, cyber football, no text baked into buttons except optional generic OK
```

### Asset IDs to export

```text
ui_btn_primary_up / _down / _dis
ui_btn_secondary_up / _down / _dis
ui_modal_panel
ui_toast_bg
ui_tooltip_bg
ui_bar_xp
ui_bar_energy
ui_tab_on / ui_tab_off
ui_icon_close
ui_icon_settings
ui_icon_back
ui_slot_card_empty
ui_skill_banner
ui_pass_node_free / ui_pass_node_prem / ui_pass_node_claimed
ui_pack_daily / ui_pack_premium / ui_pack_mega
ui_card_frame_n / _r / _sr / _ur
```

---

## Component states matrix

| Component | States |
|-----------|--------|
| BtnPrimary | up, down, disabled, loading |
| CardView | idle, selected, dragging, invalid |
| SlotView | empty, validHighlight, invalid, occupied |
| SynergyChip | inactive, active2, active3, active4 |
| InterventionBtn | available, used, disabled |

---

## ASCII → layout notes (канон)

См. wireframes в DESIGN_LLM §4.2–4.5. Не упрощать до «карточного дашборда»: Hub = один клубный баннер + один CTA.

## Motion (UI)

| Interaction | Motion |
|-------------|--------|
| Open modal | 200ms fade+scale 0.96→1 |
| Currency gain | fly to bar 400ms |
| Synergy unlock | chip pop 300ms |
| Invalid drop | shake 200ms |

## Accessibility

- Контраст текста ≥ 4.5:1.  
- Не передавать смысл только цветом (роль = иконка+цвет).  
- Reduce motion: отключает shimmer loops.

## Delivery

- [ ] `refs/ui/screens/*.png` мокапы  
- [ ] `refs/ui/kit/` нарезанные PNG  
- [ ] `refs/ui/NOTES.md` отступы/сетка 8px  
- [ ] Русские строки совпадают с `i18n` ключами из DESIGN_LLM
